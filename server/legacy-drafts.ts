import { database } from './database.js';
import { validateSessionSecret } from './runtime-config.js';
import { getCurrentUser, AuthHttpError } from './auth-core.js';
import { requestToken, sameOrigin } from './http-security.js';
import { encryptDraft, decryptDraft } from './surveys/draft-crypto.js';
export async function legacyDraftHandler(req: any, res: any) {
    res.setHeader('Cache-Control', 'no-store');
    try {
        if(req.method==='OPTIONS')return res.status(204).end();
        if (!['GET', 'PUT', 'DELETE'].includes(req.method))
            throw new AuthHttpError(405, 'TEST_METHOD', 'Phương thức không hợp lệ.');
        if (req.method !== 'GET')
            sameOrigin(req);
        const user = await getCurrentUser(requestToken(req)), id = String(req.params?.templateId ?? req.query?.templateId ?? '');
        const template = await database().query('SELECT * FROM test_templates WHERE id=$1 AND archived_at IS NULL', [id]);
        const t = template.rows[0];
        if (!t || (!['admin', 'superadmin'].includes(user.role) && t.target_audience !== 'both' && t.target_audience !== user.role))
            throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Không có quyền với bài test.');
        const key = validateSessionSecret();
        if (req.method === 'GET') {
            const r = await database().query('SELECT * FROM legacy_test_drafts WHERE user_id=$1 AND template_id=$2 AND expires_at>NOW()', [user.id, id]);
            const row = r.rows[0];
            return res.json({ ok: true, draft: row ? { answers: decryptDraft(row.answers, key, id, user.id), revision: row.revision, expiresAt: row.expires_at } : { answers: {}, revision: 0, expiresAt: null } });
        }
        if (req.method === 'DELETE') {
            await database().query('DELETE FROM legacy_test_drafts WHERE user_id=$1 AND template_id=$2', [user.id, id]);
            return res.json({ ok: true });
        }
        const b = req.body;
        if (!b || !Number.isInteger(b.revision) || b.revision < 0 || !b.answers || typeof b.answers !== 'object' || Array.isArray(b.answers) || Object.keys(b).some(k => !['revision', 'answers'].includes(k)))
            throw new AuthHttpError(400, 'TEST_INVALID', 'Nháp không hợp lệ.');
        const options = await database().query('SELECT q.id,array_agg(o.score) AS scores FROM test_questions q JOIN test_options o ON o.question_id=q.id WHERE q.template_id=$1 GROUP BY q.id', [id]);
        for (const [qid, value] of Object.entries(b.answers)) {
            const q = options.rows.find(r => r.id === qid);
            if (!q || typeof value !== 'number' || !q.scores.includes(value))
                throw new AuthHttpError(400, 'TEST_INVALID', 'Đáp án nháp không thuộc câu hỏi/option hiện tại.');
        }
        const r = await database().query(`INSERT INTO legacy_test_drafts(user_id,template_id,answers,revision,expires_at) VALUES($1,$2,$3::jsonb,1,NOW()+INTERVAL '24 hours') ON CONFLICT(user_id,template_id) DO UPDATE SET answers=EXCLUDED.answers,revision=CASE WHEN legacy_test_drafts.expires_at<=NOW() THEN 1 ELSE legacy_test_drafts.revision+1 END,expires_at=CASE WHEN legacy_test_drafts.expires_at<=NOW() THEN EXCLUDED.expires_at ELSE legacy_test_drafts.expires_at END WHERE (legacy_test_drafts.expires_at>NOW() AND legacy_test_drafts.revision=$4) OR (legacy_test_drafts.expires_at<=NOW() AND $4=0) RETURNING revision,expires_at`, [user.id, id, JSON.stringify(encryptDraft(b.answers, key, id, user.id)), b.revision]);
        if (!r.rows[0])
            throw new AuthHttpError(409, 'TEST_DRAFT_CONFLICT', 'Nháp đã thay đổi ở tab khác.');
        return res.json({ ok: true, draft: { answers: b.answers, revision: r.rows[0].revision, expiresAt: r.rows[0].expires_at } });
    }
    catch (e) {
        if (e instanceof AuthHttpError)
            return res.status(e.statusCode).json({ ok: false, error: { code: e.code, message: e.message } });
        return res.status(500).json({ ok: false, error: { code: 'TEST_DRAFT_ERROR', message: 'Không xác nhận được lưu nháp.' } });
    }
}
