import crypto from 'node:crypto';
import { database } from '../database.js';
import { AuthHttpError, getCurrentUser } from '../auth-core.js';
import { cookies, requestToken, sameOrigin, setCookie, tokenHash } from '../http-security.js';
import { DEFINITION, DEFINITION_VERSION, CONSENT_VERSION, SCORE_VERSION, DRAFT_TTL_MS, validateAnswers, validateSections, SurveyValidationError, type Answers, type Draft, type Campaign, type SurveyRecord } from '../../shared/surveys/contracts.js';
import { scoreSurvey } from './scoring.js';
import { encryptDraft, decryptDraft } from './draft-crypto.js';
import type { PoolClient } from 'pg';
const fail = (status: number, code: string, message: string): never => { throw new AuthHttpError(status, code, message); };
const cookieName = (campaignId: string) => `ss_survey_${campaignId.replaceAll('-', '')}`;
function bodyOf(req: any, allowed: string[]) { let b; try {
    b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
}
catch {
    fail(400, 'SURVEY_INVALID', 'JSON không hợp lệ.');
} if (!b || typeof b !== 'object' || Array.isArray(b) || Object.keys(b).some(k => !allowed.includes(k)))
    return fail(400, 'SURVEY_INVALID', 'Dữ liệu yêu cầu không hợp lệ.'); return b as Record<string, unknown>; }
const param = (req: any, name: string) => String(req.params?.[name] ?? req.query?.[name] ?? '');
const mapCampaign = (r: any): Campaign => ({ id: r.id, code: r.code, title: r.title, school: r.school, status: r.status, isDemo: r.is_demo, definitionVersion: r.definition_version, consentVersion: r.consent_version, scoringApproved: r.scoring_approved, policyApproved: r.policy_approved, retentionDays: r.retention_days });
function canonical(value: any): string { return JSON.stringify(normalize(value)); function normalize(v: any): any { return Array.isArray(v) ? v.map(normalize) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, normalize(v[k])])) : v; } }
async function campaign(code: string) { const r = await database().query('SELECT c.*,d.definition AS saved_definition FROM survey_campaigns c JOIN survey_definitions d ON d.version=c.definition_version WHERE c.code=$1', [code]); const c = r.rows[0] ?? fail(404, 'SURVEY_NOT_FOUND', 'Không tìm thấy đợt khảo sát.'); if (canonical(c.saved_definition) !== canonical(DEFINITION))
    fail(409, 'SURVEY_DEFINITION_CHANGED', 'Definition đã thay đổi nhưng chưa tăng version. Không mở phiếu khác với phiên bản được lưu.'); return c; }
function assertCollection(c: any) {
    if (c.definition_version !== DEFINITION_VERSION || c.consent_version !== CONSENT_VERSION)
        fail(409, 'SURVEY_VERSION_UNSUPPORTED', 'Phiên bản phiếu chưa được hỗ trợ.');
    if (c.is_demo && process.env.NODE_ENV === 'production' && process.env.SURVEY_ALLOW_SERVER_DEMO !== 'true')
        fail(403, 'SURVEY_DEMO_LOCKED', 'Thu phản hồi demo trên server production đang khóa.');
    if (c.status !== 'open')
        fail(409, 'SURVEY_CLOSED', 'Đợt khảo sát chưa mở hoặc đã đóng.');
    if (!c.is_demo && (c.definition_version.includes('draft') || process.env.SURVEY_REAL_COLLECTION_ENABLED !== 'true' || !c.policy_approved || !c.scoring_approved || !c.approval_reference || !c.retention_days))
        fail(403, 'SURVEY_REAL_COLLECTION_LOCKED', 'Thu dữ liệu thật đang khóa, chờ duyệt chính sách và nội dung.');
}
async function rate(bucket: string, limit: number) { const r = await database().query(`INSERT INTO survey_rate_limits(bucket,minute,requests) VALUES($1,date_trunc('minute',NOW()),1) ON CONFLICT(bucket,minute) DO UPDATE SET requests=survey_rate_limits.requests+1 RETURNING requests`, [bucket]); if (r.rows[0].requests > limit)
    fail(429, 'SURVEY_RATE_LIMIT', 'Quá nhiều yêu cầu. Vui lòng thử lại sau một phút.'); }
async function session(req: any, c: any, client?: PoolClient, lock = false) {
    const token = cookies(req)[cookieName(c.id)];
    if (!token)
        fail(401, 'SURVEY_SESSION_REQUIRED', 'Phiên khảo sát không tồn tại hoặc đã hết hạn.');
    const runner = client ?? database();
    const r = await runner.query(`SELECT * FROM survey_sessions WHERE campaign_id=$1 AND token_hash=$2${lock ? ' FOR UPDATE' : ''}`, [c.id, tokenHash(token)]);
    const row = r.rows[0];
    if (!row || new Date(row.expires_at).getTime() <= Date.now())
        fail(401, 'SURVEY_SESSION_EXPIRED', 'Nháp đã hết thời hạn 24 giờ.');
    return { ...row, answers: decryptDraft(row.answers, token, c.id, row.id) };
}
async function draftOf(row: any): Promise<Draft> {
    const draft: Draft = { answers: validateAnswers(row.answers), reviewedSections: validateSections(row.reviewed_sections), revision: row.revision, expiresAt: new Date(row.expires_at).toISOString(), submitted: !!row.submitted_at };
    if (row.submitted_at) {
        const r = await database().query('SELECT id,submitted_at FROM survey_responses WHERE session_id=$1', [row.id]);
        if (r.rows[0])
            draft.receipt = { responseId: r.rows[0].id, savedAt: new Date(r.rows[0].submitted_at).toISOString() };
    }
    return draft;
}
async function actor(req: any) { const user = await getCurrentUser(requestToken(req)); if (user.status !== 'active' || !['admin', 'superadmin'].includes(user.role))
    fail(403, 'SURVEY_FORBIDDEN', 'Chỉ quản trị viên đang hoạt động mới được quản lý khảo sát.'); return user; }
async function scopedCampaign(req: any, id: string) { const a = await actor(req); const r = await database().query('SELECT * FROM survey_campaigns WHERE id=$1', [id]); const c = r.rows[0] ?? fail(404, 'SURVEY_NOT_FOUND', 'Không tìm thấy đợt.'); if (a.role === 'admin' && (!a.profile.school || a.profile.school !== c.school))
    fail(403, 'SURVEY_FORBIDDEN', 'Không có quyền ngoài phạm vi trường.'); return { a, c }; }
async function granted(req: any, id: string, permission: 'read_raw' | 'can_export') {
    const { a, c } = await scopedCampaign(req, id);
    const g = await database().query('SELECT read_raw,can_export FROM survey_grants WHERE campaign_id=$1 AND user_id=$2', [id, a.id]);
    if (!g.rows[0]?.[permission])
        fail(403, 'SURVEY_GRANT_REQUIRED', 'Chưa được cấp quyền nghiên cứu cho đợt này.');
    return { a, c };
}
async function audit(actorId: string, campaignId: string, action: string, objectId?: string, client?: PoolClient) { await (client ?? database()).query('INSERT INTO survey_audit(id,campaign_id,actor_id,action,object_id) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), campaignId, actorId, action, objectId ?? null]); }
function record(r: any): SurveyRecord { return { responseId: r.id, savedAt: new Date(r.submitted_at).toISOString(), campaignId: r.campaign_id, definitionVersion: r.definition_version, scoreVersion: r.score_version, consentVersion: r.consent_version, answers: r.answers, reviewedSections: r.reviewed_sections, scores: r.scores }; }
export type SurveyAction = 'campaign' | 'session' | 'draft' | 'submit' | 'campaigns' | 'campaign-admin' | 'grants' | 'report' | 'response' | 'export';
export async function surveyHandler(req: any, res: any, action: SurveyAction) {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const methods: Record<SurveyAction, string[]> = { campaign: ['GET'], session: ['POST'], draft: ['GET', 'PUT', 'DELETE'], submit: ['POST'], campaigns: ['GET', 'POST'], 'campaign-admin': ['PATCH'], grants: ['GET', 'PUT'], report: ['GET'], response: ['GET'], export: ['GET'] };
        if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Origin',process.env.AUTH_API_CORS_ORIGIN||'*');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods',methods[action].concat('OPTIONS').join(','));return res.status(204).end();}
        if (!methods[action].includes(req.method))
            return fail(405, 'SURVEY_METHOD', 'Phương thức không hợp lệ.');
        if (!['GET', 'HEAD'].includes(req.method))
            sameOrigin(req);
        const code = param(req, 'code'), id = param(req, 'id');
        if (action === 'campaign') {
            const c = await campaign(code);
            assertCollection(c);
            return res.json({ ok: true, campaign: mapCampaign(c), definition: DEFINITION });
        }
        if (action === 'session') {
            const c = await campaign(code);
            assertCollection(c);
            const b = bodyOf(req, ['consent', 'consentVersion']);
            if (b.consent !== true || b.consentVersion !== c.consent_version)
                fail(400, 'SURVEY_CONSENT_REQUIRED', 'Cần xác nhận thông tin tham gia đúng phiên bản.');
            const existing = cookies(req)[cookieName(c.id)];
            if (existing) {
                const r = await database().query('SELECT * FROM survey_sessions WHERE campaign_id=$1 AND token_hash=$2 AND expires_at>NOW()', [c.id, tokenHash(existing)]);
                if (r.rows[0])
                    return res.json({ ok: true, draft: await draftOf({ ...r.rows[0], answers: decryptDraft(r.rows[0].answers, existing, c.id, r.rows[0].id) }) });
            }
            await rate(`session:${c.id}`, 1000);
            const token = crypto.randomBytes(32).toString('base64url');
            const r = await database().query('INSERT INTO survey_sessions(id,campaign_id,token_hash,expires_at) VALUES($1,$2,$3,$4) RETURNING *', [crypto.randomUUID(), c.id, tokenHash(token), new Date(Date.now() + DRAFT_TTL_MS)]);
            setCookie(res, cookieName(c.id), token, DRAFT_TTL_MS / 1000, '/api/surveys');
            return res.status(201).json({ ok: true, draft: await draftOf(r.rows[0]) });
        }
        if (action === 'draft') {
            const c = await campaign(code);
            if (req.method === 'GET')
                return res.json({ ok: true, draft: await draftOf(await session(req, c)) });
            const row = await session(req, c);
            if (req.method === 'DELETE') {
                if (row.submitted_at)
                    fail(409, 'SURVEY_ALREADY_SUBMITTED', 'Phản hồi đã nộp không được xóa qua nút xóa nháp.');
                const removed = await database().query('DELETE FROM survey_sessions WHERE id=$1 AND submitted_at IS NULL', [row.id]);
                if (!removed.rowCount)
                    fail(409, 'SURVEY_ALREADY_SUBMITTED', 'Phiếu đã được nộp ở tab khác; không xóa phản hồi đã nộp.');
                setCookie(res, cookieName(c.id), '', 0, '/api/surveys');
                return res.json({ ok: true });
            }
            assertCollection(c);
            await rate(`draft:${row.id}`, 120);
            const b = bodyOf(req, ['answers', 'reviewedSections', 'revision']);
            if (!Number.isInteger(b.revision) || Number(b.revision) < 0)
                fail(400, 'SURVEY_INVALID', 'Revision không hợp lệ.');
            const answers = validateAnswers(b.answers), sections = validateSections(b.reviewedSections);
            const updated = await database().query('UPDATE survey_sessions SET answers=$2::jsonb,reviewed_sections=$3::jsonb,revision=revision+1 WHERE id=$1 AND revision=$4 AND submitted_at IS NULL AND expires_at>NOW() RETURNING *', [row.id, JSON.stringify(encryptDraft(answers, cookies(req)[cookieName(c.id)], c.id, row.id)), JSON.stringify(sections), b.revision]);
            if (!updated.rows[0])
                fail(409, 'SURVEY_DRAFT_CONFLICT', 'Nháp đã thay đổi ở tab khác hoặc đã nộp. Vui lòng tải lại.');
            return res.json({ ok: true, draft: await draftOf({ ...updated.rows[0], answers }) });
        }
        if (action === 'submit') {
            const c = await campaign(code);
            const b = bodyOf(req, ['revision', 'idempotencyKey']);
            if (typeof b.idempotencyKey !== 'string' || !/^[a-zA-Z0-9-]{16,100}$/.test(b.idempotencyKey))
                fail(400, 'SURVEY_INVALID', 'Khóa retry không hợp lệ.');
            const client = await database().connect();
            try {
                await client.query('BEGIN');
                const row = await session(req, c, client, true);
                const prior = await client.query('SELECT id,submitted_at FROM survey_responses WHERE session_id=$1', [row.id]);
                if (prior.rows[0]) {
                    await client.query('COMMIT');
                    return res.json({ ok: true, receipt: { responseId: prior.rows[0].id, savedAt: new Date(prior.rows[0].submitted_at).toISOString() }, replayed: true });
                }
                assertCollection(c);
                if (row.revision !== b.revision)
                    fail(409, 'SURVEY_DRAFT_CONFLICT', 'Nháp chưa được lưu hoặc đã thay đổi.');
                const answers = validateAnswers(row.answers), sections = validateSections(row.reviewed_sections);
                if (sections.length !== DEFINITION.sections.length)
                    fail(400, 'SURVEY_REVIEW_REQUIRED', 'Vui lòng xem lại đủ các phần. Không bắt buộc trả lời mọi câu.');
                const responseId = crypto.randomUUID(), scores = scoreSurvey(answers, c.scoring_approved);
                const r = await client.query(`INSERT INTO survey_responses(id,campaign_id,session_id,definition_version,score_version,consent_version,answers,reviewed_sections,scores,idempotency_key,retention_until) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,CASE WHEN $11::int IS NULL THEN NULL ELSE NOW()+($11::int*INTERVAL '1 day') END) RETURNING submitted_at`, [responseId, c.id, row.id, c.definition_version, SCORE_VERSION, c.consent_version, JSON.stringify(answers), JSON.stringify(sections), JSON.stringify(scores), b.idempotencyKey, c.retention_days]);
                await client.query("UPDATE survey_sessions SET submitted_at=NOW(),answers='{}'::jsonb,reviewed_sections='[]'::jsonb WHERE id=$1", [row.id]);
                await client.query('COMMIT');
                return res.status(201).json({ ok: true, receipt: { responseId, savedAt: new Date(r.rows[0].submitted_at).toISOString() } });
            }
            catch (e) {
                await client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
        }
        if (action === 'campaigns') {
            const a = await actor(req);
            if (req.method === 'GET') {
                const rows = await database().query(`SELECT c.*,COALESCE(g.read_raw,FALSE) AS read_raw,COALESCE(g.can_export,FALSE) AS can_export FROM survey_campaigns c LEFT JOIN survey_grants g ON g.campaign_id=c.id AND g.user_id=$1 WHERE ($2='superadmin' OR c.school=$3) ORDER BY c.created_at DESC LIMIT 200`, [a.id, a.role, a.profile.school]);
                return res.json({ ok: true, campaigns: rows.rows.map(r => ({ ...mapCampaign(r), permissions: { readRaw: r.read_raw, export: r.can_export } })) });
            }
            const b = bodyOf(req, ['title', 'school', 'isDemo']);
            const title = String(b.title ?? '').trim();
            if (!title || title.length > 160 || typeof b.isDemo !== 'boolean')
                fail(400, 'SURVEY_INVALID', 'Tiêu đề hoặc loại đợt không hợp lệ.');
            const school = a.role === 'admin' ? a.profile.school : String(b.school ?? '').trim();
            if (!school)
                fail(400, 'SURVEY_INVALID', 'Cần trường được quản trị.');
            const campaignId = crypto.randomUUID(), publicCode = crypto.randomBytes(6).toString('hex').toUpperCase();
            await database().query('INSERT INTO survey_definitions(version,definition,score_version) VALUES($1,$2::jsonb,$3) ON CONFLICT(version) DO NOTHING', [DEFINITION_VERSION, JSON.stringify(DEFINITION), SCORE_VERSION]);
            const savedDefinition = await database().query('SELECT definition FROM survey_definitions WHERE version=$1', [DEFINITION_VERSION]);
            if (canonical(savedDefinition.rows[0].definition) !== canonical(DEFINITION))
                fail(409, 'SURVEY_DEFINITION_CHANGED', 'Phải tăng version trước khi tạo đợt với nội dung mới.');
            const created = await database().query('INSERT INTO survey_campaigns(id,code,title,school,is_demo,definition_version,consent_version,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [campaignId, publicCode, title, school, b.isDemo, DEFINITION_VERSION, CONSENT_VERSION, a.id]);
            await audit(a.id, campaignId, 'campaign_create');
            return res.status(201).json({ ok: true, campaign: mapCampaign(created.rows[0]) });
        }
        if (action === 'campaign-admin') {
            const { a, c } = await scopedCampaign(req, id);
            const b = bodyOf(req, ['status', 'policyApproved', 'scoringApproved', 'approvalReference', 'retentionDays']);
            const status = b.status ?? c.status;
            if (!['draft', 'open', 'closed'].includes(String(status)))
                fail(400, 'SURVEY_INVALID', 'Trạng thái không hợp lệ.');
            const policy = b.policyApproved ?? c.policy_approved, scoring = b.scoringApproved ?? c.scoring_approved, ref = b.approvalReference ?? c.approval_reference, retention = b.retentionDays ?? c.retention_days;
            if (typeof policy !== 'boolean' || typeof scoring !== 'boolean' || typeof ref !== 'string' || ref.length > 500 || (retention !== null && (!Number.isInteger(retention) || Number(retention) < 1 || Number(retention) > 3650)))
                fail(400, 'SURVEY_INVALID', 'Chính sách không hợp lệ.');
            if (status === 'open')
                assertCollection({ ...c, status, policy_approved: policy, scoring_approved: scoring, approval_reference: ref, retention_days: retention });
            const r = await database().query('UPDATE survey_campaigns SET status=$2,policy_approved=$3,scoring_approved=$4,approval_reference=$5,retention_days=$6 WHERE id=$1 RETURNING *', [id, status, policy, scoring, ref, retention]);
            await audit(a.id, id, 'campaign_update');
            return res.json({ ok: true, campaign: mapCampaign(r.rows[0]) });
        }
        if (action === 'grants') {
            const { a } = await scopedCampaign(req, id);
            if (a.role !== 'superadmin')
                fail(403, 'SURVEY_FORBIDDEN', 'Chỉ Superadmin được cấp quyền nghiên cứu.');
            if (req.method === 'GET') {
                const r = await database().query('SELECT user_id,read_raw,can_export FROM survey_grants WHERE campaign_id=$1', [id]);
                return res.json({ ok: true, grants: r.rows.map(g => ({ userId: g.user_id, readRaw: g.read_raw, export: g.can_export })) });
            }
            const b = bodyOf(req, ['userId', 'readRaw', 'export']);
            if (typeof b.userId !== 'string' || typeof b.readRaw !== 'boolean' || typeof b.export !== 'boolean')
                fail(400, 'SURVEY_INVALID', 'Quyền không hợp lệ.');
            const user = await database().query("SELECT id FROM auth_users WHERE id=$1 AND role IN ('admin','superadmin') AND status='active'", [b.userId]);
            if (!user.rows[0])
                fail(400, 'SURVEY_INVALID', 'Tài khoản không đủ điều kiện nghiên cứu.');
            const client = await database().connect();
            try {
                await client.query('BEGIN');
                await client.query('INSERT INTO survey_grants(campaign_id,user_id,read_raw,can_export) VALUES($1,$2,$3,$4) ON CONFLICT(campaign_id,user_id) DO UPDATE SET read_raw=EXCLUDED.read_raw,can_export=EXCLUDED.can_export', [id, b.userId, b.readRaw, b.export]);
                await audit(a.id, id, 'grant_update', String(b.userId), client);
                await client.query('COMMIT');
            }
            catch (e) {
                await client.query('ROLLBACK');
                throw e;
            }
            finally {
                client.release();
            }
            return res.json({ ok: true });
        }
        if (action === 'report') {
            const { a, c } = await scopedCampaign(req, id);
            const total = await database().query('SELECT COUNT(*)::int AS total FROM survey_responses WHERE campaign_id=$1', [id]);
            const grant = await database().query('SELECT read_raw,can_export FROM survey_grants WHERE campaign_id=$1 AND user_id=$2', [id, a.id]);
            const hasRaw = grant.rows[0]?.read_raw === true;
            let cursorTime: string | null = null, cursorId: string | null = null;
            const before = String(req.query?.before ?? '');
            if (before) {
                try {
                    const parsed = JSON.parse(Buffer.from(before, 'base64url').toString('utf8'));
                    if (!Array.isArray(parsed) || parsed.length !== 2 || !Number.isFinite(Date.parse(parsed[0])) || !/^[0-9a-f-]{36}$/i.test(parsed[1]))
                        throw new Error();
                    [cursorTime, cursorId] = parsed;
                }
                catch {
                    fail(400, 'SURVEY_INVALID', 'Cursor không hợp lệ.');
                }
            }
            const rows = hasRaw ? await database().query(`SELECT *,TO_CHAR(submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time FROM survey_responses WHERE campaign_id=$1 AND ($2::timestamptz IS NULL OR (submitted_at,id)<($2::timestamptz,$3::uuid)) ORDER BY submitted_at DESC,id DESC LIMIT 51`, [id, cursorTime, cursorId]) : { rows: [] };
            if (hasRaw)
                await audit(a.id, id, 'response_list_read');
            return res.json({ ok: true, campaign: mapCampaign(c), total: total.rows[0].total, permissions: { readRaw: hasRaw, export: grant.rows[0]?.can_export === true }, responses: rows.rows.slice(0, 50).map(record), nextCursor: rows.rows.length > 50 ? Buffer.from(JSON.stringify([rows.rows[49].cursor_time, rows.rows[49].id])).toString('base64url') : null });
        }
        if (action === 'response') {
            const { a } = await granted(req, id, 'read_raw');
            const responseId = param(req, 'responseId');
            const found = await database().query('SELECT * FROM survey_responses WHERE id=$1 AND campaign_id=$2', [responseId, id]);
            if (!found.rows[0])
                fail(404, 'SURVEY_NOT_FOUND', 'Không tìm thấy phản hồi.');
            await audit(a.id, id, 'response_read', responseId);
            return res.json({ ok: true, response: record(found.rows[0]) });
        }
        if (action === 'export') {
            const { a, c } = await granted(req, id, 'can_export');
            const saved = await database().query('SELECT definition FROM survey_definitions WHERE version=$1',[c.definition_version]);
            if(c.definition_version!==DEFINITION_VERSION || canonical(saved.rows[0]?.definition)!==canonical(DEFINITION)) fail(409,'SURVEY_VERSION_UNSUPPORTED','Không hỗ trợ export phiên bản này.');
            const data = await database().query('SELECT * FROM survey_responses WHERE campaign_id=$1 ORDER BY submitted_at,id LIMIT 10001', [id]);
            if (data.rows.length > 10000)
                fail(413, 'SURVEY_EXPORT_LIMIT', 'Đợt vượt giới hạn export đồng bộ 10000 phiếu.');
            if(data.rows.some(r=>r.definition_version!==c.definition_version)) fail(409,'SURVEY_VERSION_UNSUPPORTED','Dữ liệu chứa phiên bản không được hỗ trợ.');
            const cell = (v: unknown) => '"' + String(v ?? '').replace(/^[\s]*[=+@-]/, "'$&").replaceAll('"', '""') + '"';
            const headers = ['response_id', 'submitted_at', 'definition_version', 'score_version', 'consent_version', ...DEFINITION.questions.flatMap(q => [`${q.code}.status`, `${q.code}.value`])];
            const lines = data.rows.map(r => [r.id, new Date(r.submitted_at).toISOString(), r.definition_version, r.score_version, r.consent_version, ...DEFINITION.questions.flatMap(q => { const answer = r.answers[q.code]; return [answer?.status ?? 'unanswered', answer?.status === 'answered' ? answer.value : '']; })].map(cell).join(','));
            await audit(a.id, id, 'response_export');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="survey-${id}.csv"`);
            return res.send('\uFEFF' + [headers.map(cell).join(','), ...lines].join('\r\n'));
        }
    }
    catch (error) {
        if (error instanceof SurveyValidationError)
            return res.status(400).json({ ok: false, error: { code: 'SURVEY_INVALID', message: error.message } });
        if (error instanceof AuthHttpError)
            return res.status(error.statusCode).json({ ok: false, error: { code: error.code, message: error.message } });
        return res.status(500).json({ ok: false, error: { code: 'SURVEY_SERVER_ERROR', message: 'Dịch vụ khảo sát tạm thời không khả dụng.' } });
    }
}
