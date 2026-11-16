import { database } from '../database.js';
import { getCurrentUser } from '../auth-core.js';
import { requestToken } from '../http-security.js';
import { audit, fail } from './common.js';
import crypto from 'node:crypto';
function scope(u: any, q: any = {}) { const p: any[] = [Math.min(365, Math.max(7, Number(q.days) || 90))], w = ["ta.submitted_at>=NOW()-($1::int*INTERVAL '1 day')"]; const bind = (v: any) => { p.push(v); return '$' + p.length; }; if (u.role === 'admin') {
    if (!u.profile.schoolId)
        w.push('FALSE');
    else
        w.push("ta.context_status='snapshot' AND ta.context_school_id=" + bind(u.profile.schoolId));
}
else if (u.role === 'teacher') {
    if (u.profile.teacherType === 'homeroom' && u.profile.classId)
        w.push("ta.user_role='student' AND ta.context_status='snapshot' AND ta.context_school_id=" + bind(u.profile.schoolId) + ' AND ta.context_class_id=' + bind(u.profile.classId));
    else
        w.push('ta.user_id=' + bind(u.id));
}
else if (u.role !== 'superadmin')
    fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền xem báo cáo quản trị.'); if (q.schoolId) {
    if (u.role !== 'superadmin' && q.schoolId !== u.profile.schoolId)
        fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền ngoài trường.');
    w.push('ta.context_school_id=' + bind(q.schoolId));
} if (q.classId) {
    if (u.role === 'teacher' && q.classId !== u.profile.classId)
        fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền ngoài lớp.');
    w.push('ta.context_class_id=' + bind(q.classId));
} if (q.academicYear)
    w.push("ta.context_snapshot->>'academicYear'=" + bind(q.academicYear)); for (const [k, col] of [['templateId', 'ta.template_id'], ['scoreVersion', 'ta.score_version'], ['definitionDigest', 'ta.definition_digest']])
    if (q[k])
        w.push(col + '=' + bind(String(q[k]))); return { p, w, averaging: !!q.templateId && !!q.scoreVersion && !!q.definitionDigest }; }
const joins = 'FROM test_attempts ta JOIN auth_users u ON u.id=ta.user_id JOIN test_templates tt ON tt.id=ta.template_id';
const cols = "ta.*,u.username,u.profile_name,COALESCE(NULLIF(ta.template_snapshot->>'title',''),tt.title) AS template_title,ta.context_snapshot->>'school' AS school,ta.context_snapshot->>'className' AS class_name,ta.context_snapshot->>'academicYear' AS academic_year";
function attempt(r: any) { return { attemptId: r.id, userId: r.user_id, userRole: r.user_role, username: r.username, userName: r.profile_name, school: r.school ?? 'Chưa xác định', className: r.class_name ?? '', academicYear: r.academic_year ?? '', contextStatus: r.context_status, templateId: r.template_id, templateTitle: r.template_title, scoreVersion: r.score_version, definitionDigest: r.definition_digest, scoreTotal: Number(r.score_total), scoreLevel: r.score_level, scorePayload: r.score_payload, suggestDass21: r.suggest_dass21, submittedAt: new Date(r.submitted_at).toISOString(), riskLevel: 'unreviewed', isHighRisk: null }; }
export async function snapshotOverview(token: string | null, q: any = {}) {
    const u = await getCurrentUser(token), s = scope(u, q), where = s.w.join(' AND '), db = database();
    const avg = s.averaging ? 'AVG(ta.score_total)::float8' : 'NULL::float8';
    const total = (await db.query(`SELECT COUNT(*)::int AS total,COUNT(DISTINCT ta.user_id)::int AS users,${avg} AS average ${joins} WHERE ${where}`, s.p)).rows[0];
    const limit = Math.trunc(Math.min(2000, Math.max(1, Number(q.limit) || 50)));
    let wp = where, params = [...s.p];
    if (q.cursor) {
        if(typeof q.cursor!=='string'||q.cursor.length>512)fail(400,'ACCOUNT_INVALID','Cursor không hợp lệ.');
        try {
            const [t, id] = JSON.parse(Buffer.from(String(q.cursor), 'base64url').toString());
            if (!Number.isFinite(Date.parse(t)) || typeof id !== 'string')
                throw Error();
            params.push(t, id);
            wp += ` AND (ta.submitted_at,ta.id)<($${params.length - 1}::timestamptz,$${params.length})`;
        }
        catch {
            fail(400, 'ACCOUNT_INVALID', 'Cursor không hợp lệ.');
        }
    }
    const rows = (await db.query(`SELECT ${cols},TO_CHAR(ta.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time ${joins} WHERE ${wp} ORDER BY ta.submitted_at DESC,ta.id DESC LIMIT ${limit + 1}`, params)).rows;
    const groups = (await db.query(`SELECT ta.template_id,ta.score_version,ta.definition_digest,COALESCE(NULLIF(ta.template_snapshot->>'title',''),tt.title) AS title,COUNT(*)::int AS count,AVG(ta.score_total)::float8 AS average ${joins} WHERE ${where} GROUP BY 1,2,3,4 ORDER BY 4,2,3`, s.p)).rows;
    const months = (await db.query(`SELECT TO_CHAR(ta.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM') AS month,COUNT(*)::int AS count ${joins} WHERE ${where} GROUP BY 1 ORDER BY 1`, s.p)).rows;
    const classes = (await db.query(`SELECT ta.context_snapshot->>'school' AS school,ta.context_snapshot->>'className' AS class_name,ta.context_snapshot->>'academicYear' AS academic_year,COUNT(*)::int AS count ${joins} WHERE ${where} GROUP BY 1,2,3 ORDER BY 1,2,3`, s.p)).rows;
    const roles = (await db.query(`SELECT ta.user_role AS role,COUNT(*)::int AS count ${joins} WHERE ${where} GROUP BY 1`, s.p)).rows;
    const opts = (await db.query(`SELECT DISTINCT ta.context_snapshot->>'school' AS school,ta.context_snapshot->>'className' AS class_name ${joins} WHERE ${where}`, s.p)).rows;
    return { scope: u.role, filters: q, summary: { totalAttempts: total.total, uniqueUsers: total.users, avgScore: total.average, highRiskCount: null, highRiskRate: null }, byMonth: months.map(r => ({ ...r, avgScore: null, highRiskCount: null, studentCount: null, teacherCount: null, studentAvgScore: null, teacherAvgScore: null })), byRole: roles.map(r => ({ ...r, avgScore: null, highRiskCount: null })), byTemplate: groups.map(r => ({ templateId: r.template_id, templateTitle: r.title, scoreVersion: r.score_version, definitionDigest: r.definition_digest, count: r.count, avgScore: r.definition_digest ? r.average : null, highRiskCount: null })), byClass: classes.map(r => ({ className: [r.school ?? 'Chưa xác định', r.class_name, r.academic_year].filter(Boolean).join(' · '), count: r.count, avgScore: null, highRiskCount: null })), classificationPending: true, recentRiskAlerts: [], attempts: rows.slice(0, limit).map(attempt), schoolOptions: opts.map(r => r.school).filter(Boolean), classOptions: opts.map(r => r.class_name).filter(Boolean), nextCursor: rows.length > limit ? Buffer.from(JSON.stringify([rows[limit - 1].cursor_time, rows[limit - 1].id])).toString('base64url') : null };
}
function csv(v: any) { let s = v == null ? '' : String(v); if (typeof v === 'string' && /^[=+@-]/.test(s))
    s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; }
export async function legacyExport(req: any, res: any) { const u = await getCurrentUser(requestToken(req)), s = scope(u, req.query ?? {}), c = await database().connect(); try {
    await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
    await audit(c, u.id, 'legacy-reports', 'legacy_export', crypto.randomUUID());
    await c.query(`DECLARE account_export NO SCROLL CURSOR FOR SELECT ${cols} ${joins} WHERE ${s.w.join(' AND ')} ORDER BY ta.submitted_at,ta.id`, s.p);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'attachment; filename="tram-an-legacy-results.csv"');
    res.write('\uFEFF' + ['attempt_id', 'submitted_at', 'username', 'template_id', 'template_title', 'score_version', 'definition_digest', 'score_total', 'stored_label', 'context_status', 'school_at_submit', 'class_at_submit', 'academic_year'].map(csv).join(',') + '\n');
    for (;;) {
        const batch = (await c.query('FETCH 1000 FROM account_export')).rows;
        if (!batch.length)
            break;
        for (const r of batch)
            res.write([r.id, new Date(r.submitted_at).toISOString(), r.username, r.template_id, r.template_title, r.score_version, r.definition_digest, Number(r.score_total), r.score_level, r.context_status, r.school, r.class_name, r.academic_year].map(csv).join(',') + '\n');
    }
    await c.query('COMMIT');
    res.end();
}
catch (e) {
    await c.query('ROLLBACK');
    if (res.headersSent) {
        res.destroy?.();
        return;
    }
    throw e;
}
finally {
    c.release();
} }
