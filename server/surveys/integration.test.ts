import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { DEFINITION, CONSENT_VERSION } from '../../shared/surveys/contracts.js';
const enabled = !!process.env.TEST_DATABASE_URL;
test('disposable PostgreSQL: cookies, anonymity, grants, revisions, idempotency, OTP and persistence', { skip: !enabled }, async (t) => {
    assert.equal(process.env.DATABASE_URL, process.env.TEST_DATABASE_URL, 'Refuse any database not explicitly selected by the disposable runner.');
    assert.ok(/\/ss_test_[a-z0-9]+$/.test(process.env.DATABASE_URL!));
    const { database } = await import('../database.js'), { migrate } = await import('../migrate.js'), { createApp } = await import('../auth-server.js');
    await migrate();
    const password = 'Test-Only-Password!', salt = 'test-salt';
    const hash = `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString('hex')}`;
    for (const [id, name, role, school] of [['sa', 'super', 'superadmin', 'School A'], ['a', 'admin-a', 'admin', 'School A'], ['b', 'admin-b', 'admin', 'School B'], ['stu', 'student', 'student', 'School A']])
        await database().query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_name,profile_email,profile_school) VALUES($1,$2,$3,$4,'active',$2,$2||'@acceptance.invalid',$5)", [id, name, hash, role, school]);
    const server = await new Promise<any>(resolve => { const s = createApp().listen(0, '127.0.0.1', () => resolve(s)); });
    try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    process.env.APP_URL = origin;
    type Client = {
        cookies: Record<string, string>;
    };
    const client = (): Client => ({ cookies: {} });
    async function call(c: Client, path: string, method = 'GET', body?: unknown, customOrigin = origin) { const res = await fetch(origin + path, { method, headers: { Origin: customOrigin, 'Content-Type': 'application/json', Cookie: Object.entries(c.cookies).map(([k, v]) => `${k}=${v}`).join('; ') }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }); for (const cookie of res.headers.getSetCookie()) {
        const [first] = cookie.split(';');
        const ix = first.indexOf('=');
        c.cookies[first.slice(0, ix)] = first.slice(ix + 1);
        if (/Max-Age=0(?:;|$)/.test(cookie))
            delete c.cookies[first.slice(0, ix)];
    } const type = res.headers.get('Content-Type') ?? ''; return { status: res.status, data: type.includes('json') ? await res.json() : await res.text(), headers: res.headers }; }
    async function login(name: string) { const c = client(); const first = await call(c, '/api/auth/login', 'POST', { username: name, password, transport: 'cookie' }); assert.equal(first.status, 200); let result = first; if (first.data.otpRequired)
        result = await call(c, '/api/auth/login', 'POST', { otpSessionId: first.data.otpSessionId, otpCode: first.data.devOtpCode, transport: 'cookie' }); assert.equal(result.status, 200); assert.equal(result.data.session.tokenType, 'Cookie'); assert.equal(result.data.session.accessToken, undefined); assert.ok(c.cookies.tram_an_session); return c; }
    const sa = await login('super'), a = await login('admin-a'), b = await login('admin-b'), stu = await login('student');
    async function create(c: Client, school = 'School A', isDemo = true) { const x = await call(c, '/api/surveys/admin/campaigns', 'POST', { title: 'Integration fixture', school, isDemo }); assert.equal(x.status, 201); return x.data.campaign; }
    const c1 = await create(a, 'School B'), c2 = await create(sa, 'School B');
    assert.equal(c1.school, 'School A');
    const p1 = `/api/surveys/campaigns/${c1.code}`, p2 = `/api/surveys/campaigns/${c2.code}`;
    const guest = client();
        await t.test('default raw/export grants denied even Superadmin', async () => { const r = await call(sa, `/api/surveys/admin/campaigns/${c1.id}/report`); assert.equal(r.status, 200); assert.equal(r.data.permissions.readRaw, false); assert.deepEqual(r.data.responses, []); assert.equal((await call(sa, `/api/surveys/admin/campaigns/${c1.id}/export`)).status, 403); });
        await t.test('school scope and student role cannot be bypassed', async () => { assert.equal((await call(b, `/api/surveys/admin/campaigns/${c1.id}/report`)).status, 403); assert.equal((await call(stu, '/api/surveys/admin/campaigns')).status, 403); assert.equal((await call(a, `/api/surveys/admin/campaigns/${c1.id}/grants`, 'PUT', { userId: 'a', readRaw: true, export: true })).status, 403); });
        await t.test('real campaign stays locked even when body claims approval', async () => { const c = await create(sa, 'School A', false); assert.equal((await call(sa, `/api/surveys/admin/campaigns/${c.id}`, 'PATCH', { status: 'open', policyApproved: true, scoringApproved: true, approvalReference: 'fixture', retentionDays: 30 })).status, 403); });
        for (const c of [c1, c2])
            assert.equal((await call(sa, `/api/surveys/admin/campaigns/${c.id}`, 'PATCH', { status: 'open' })).status, 200);
        await t.test('consent and CSRF required before creating anonymous session', async () => { assert.equal((await call(guest, p1 + '/session', 'POST', { consent: false, consentVersion: CONSENT_VERSION })).status, 400); assert.equal((await call(guest, p1 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION }, 'https://untrusted.example')).status, 403); });
        const started = await call(guest, p1 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION });
        assert.equal(started.status, 201);
        assert.ok(started.headers.get('Set-Cookie')?.includes('HttpOnly'));
        assert.ok(started.headers.get('Set-Cookie')?.includes('SameSite=Strict'));
        await t.test('cookie/token is not returned in JSON, and campaign B cannot read A draft', async () => { assert.equal(started.data.token, undefined); assert.equal((await call(guest, p2 + '/draft')).status, 401); const columns = await database().query("SELECT column_name FROM information_schema.columns WHERE table_name IN ('survey_sessions','survey_responses')"); assert.ok(!columns.rows.some(r => r.column_name === 'user_id')); });
        await t.test('raw code K survives save/resume; state missing/skip is distinct', async () => { const saved = await call(guest, p1 + '/draft', 'PUT', { revision: 0, answers: { 'I.1': { status: 'answered', value: 'K' }, 'B.1': { status: 'skipped' } }, reviewedSections: ['A'] }); assert.equal(saved.status, 200); assert.equal(saved.data.draft.revision, 1); const resumed = await call(guest, p1 + '/draft'); assert.deepEqual(resumed.data.draft.answers['I.1'], { status: 'answered', value: 'K' }); assert.equal(resumed.data.draft.answers['B.1'].status, 'skipped'); });
        await t.test('stale revision and injected calculated scores rejected', async () => { assert.equal((await call(guest, p1 + '/draft', 'PUT', { revision: 0, answers: {}, reviewedSections: [] })).status, 409); assert.equal((await call(guest, p1 + '/draft', 'PUT', { revision: 1, answers: {}, reviewedSections: [], calculatedScores: { total: 0 } })).status, 400); assert.equal((await call(guest, p1 + '/draft', 'PUT', { revision: 1, answers: { 'C.1': { status: 'answered', value: 99 } }, reviewedSections: [] })).status, 400); });
        await call(guest, p1 + '/draft', 'PUT', { revision: 1, answers: {}, reviewedSections: DEFINITION.sections.map(s => s.id) });
        let responseId = '';
        await t.test('concurrent retries persist only one anonymous response', async () => { const payload = { revision: 2, idempotencyKey: 'retry-12345678901234567890' }; const replies = await Promise.all([call(guest, p1 + '/submit', 'POST', payload), call(guest, p1 + '/submit', 'POST', payload)]); assert.deepEqual(replies.map(r => r.status).sort(), [200, 201]); assert.equal(replies[0].data.receipt.responseId, replies[1].data.receipt.responseId); responseId = replies[0].data.receipt.responseId; const rows = await database().query('SELECT * FROM survey_responses WHERE campaign_id=$1', [c1.id]); assert.equal(rows.rowCount, 1); assert.ok(Object.values(rows.rows[0].scores).every((s: any) => s.status === 'insufficient_data')); assert.equal((await call(guest, p1 + '/draft', 'DELETE')).status, 409); });
        await t.test('explicit grant scopes reads/exports and records audit events', async () => { await call(sa, `/api/surveys/admin/campaigns/${c1.id}/grants`, 'PUT', { userId: 'a', readRaw: true, export: false }); assert.equal((await call(a, `/api/surveys/admin/campaigns/${c1.id}/responses/${responseId}`)).status, 200); assert.equal((await call(a, `/api/surveys/admin/campaigns/${c1.id}/export`)).status, 403); await call(sa, `/api/surveys/admin/campaigns/${c1.id}/grants`, 'PUT', { userId: 'a', readRaw: true, export: true }); const csv = await call(a, `/api/surveys/admin/campaigns/${c1.id}/export`); assert.equal(csv.status, 200); assert.ok(csv.data.includes('I.1.status')); assert.ok(csv.data.includes('consent_version')); const audit = await database().query('SELECT action FROM survey_audit WHERE campaign_id=$1', [c1.id]); assert.ok(audit.rows.some(r => r.action === 'response_read')); assert.ok(audit.rows.some(r => r.action === 'response_export')); });
        await t.test('expiry is enforced on backend and deletion clears unsubmitted draft', async () => { const fresh = client(); await call(fresh, p2 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION }); await database().query('UPDATE survey_sessions SET expires_at=NOW()-INTERVAL \'1 second\' WHERE campaign_id=$1', [c2.id]); assert.equal((await call(fresh, p2 + '/draft')).status, 401); const fresh2 = client(); await call(fresh2, p2 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION }); assert.equal((await call(fresh2, p2 + '/draft', 'DELETE')).status, 200); assert.equal((await call(fresh2, p2 + '/draft')).status, 401); });
        await database().query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'");
        await t.test('OTP zero attempts is locked and successful consumption is atomic', async () => { const first = await call(client(), '/api/auth/login', 'POST', { username: 'super', password }); if (first.status === 429) {
            await database().query("UPDATE auth_admin_login_otps SET resend_available_at=NOW() WHERE user_id='sa'"); await database().query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'");
        } const challenge = first.status === 429 ? await call(client(), '/api/auth/login', 'POST', { username: 'super', password }) : first; await database().query('UPDATE auth_admin_login_otps SET attempts_left=0 WHERE id=$1', [challenge.data.otpSessionId]); assert.equal((await call(client(), '/api/auth/login', 'POST', { otpSessionId: challenge.data.otpSessionId, otpCode: challenge.data.devOtpCode })).status, 400); await database().query("UPDATE auth_admin_login_otps SET resend_available_at=NOW() WHERE user_id='sa'"); await database().query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'"); const next = await call(client(), '/api/auth/login', 'POST', { username: 'super', password }); const results = await Promise.all([call(client(), '/api/auth/login', 'POST', { otpSessionId: next.data.otpSessionId, otpCode: next.data.devOtpCode }), call(client(), '/api/auth/login', 'POST', { otpSessionId: next.data.otpSessionId, otpCode: next.data.devOtpCode })]); assert.deepEqual(results.map(r => r.status).sort(), [200, 400]); });
        await t.test('legacy editor persists options, rejects spoofed score and archives without deleting history', async () => {
            const created = await call(a, '/api/tests/templates', 'POST', { title: 'Fixture custom', targetAudience: 'student', questionList: [{ text: 'Fixture question', options: [{ text: 'zero', score: 0 }, { text: 'one', score: 1 }] }] });
            assert.equal(created.status, 201);
            const id = created.data.template.id;
            assert.equal((await call(b, `/api/tests/templates/${id}`, 'PATCH', { title: 'unauthorized' })).status, 403);
            assert.equal((await call(a, `/api/tests/templates/${id}`, 'PATCH', { isActive: true })).status, 200);
            const detail = await call(stu, `/api/tests/${id}`);
            assert.equal(detail.status, 200);
            assert.equal(detail.data.questionList.length, 1);
            assert.equal(detail.data.questionList[0].options.length, 2);
            const submitted = await call(stu, '/api/tests/submit', 'POST', { templateId: id, answers: [1], score: 999 });
            assert.equal(submitted.status, 201);
            assert.equal(submitted.data.scoreTotal, 1);
            assert.equal(submitted.data.scoreLevel, 'Chưa duyệt diễn giải');
            assert.equal((await call(stu, '/api/tests/submit', 'POST', { templateId: id, answers: [99] })).status, 400);
            const qid = detail.data.questionList[0].id;
            assert.equal((await call(stu, `/api/tests/drafts/${id}`, 'PUT', { answers: { [qid]: 1 }, revision: 0 })).status, 200);
            const resumed = await call(stu, `/api/tests/drafts/${id}`);
            assert.equal(resumed.data.draft.answers[qid], 1);
            assert.equal((await call(stu, `/api/tests/drafts/${id}`, 'PUT', { answers: { [qid]: 0 }, revision: 0 })).status, 409);
            assert.equal((await call(a, `/api/tests/templates/${id}`, 'DELETE')).status, 200);
            const history = await call(stu, '/api/tests/results/me');
            assert.ok(history.data.results.some((r: any) => r.templateId === id));
        });
        await t.test('user pagination keeps full scope total and advances tied timestamps safely', async () => {
            await database().query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_school) SELECT 'paged-'||n,'paged-'||n,'unused','student','active','School A' FROM generate_series(1,205) n");
            const first = await call(a, '/api/users?role=student&limit=200');
            assert.equal(first.status, 200);
            assert.equal(first.data.total, 206);
            assert.equal(first.data.users.length, 200);
            assert.ok(first.data.nextCursor);
            const second = await call(a, `/api/users?role=student&limit=200&cursor=${encodeURIComponent(first.data.nextCursor)}`);
            assert.equal(second.data.users.length, 6);
            assert.equal(new Set([...first.data.users, ...second.data.users].map((r: any) => r.id)).size, 206);
        });
        await t.test('maintenance endpoint requires a project secret and erases expired draft ciphertext', async () => {
            assert.equal((await call(client(), '/api/internal/survey-maintenance')).status, 503);
            process.env.CRON_SECRET = crypto.randomBytes(32).toString('hex');
            const before = await database().query("UPDATE survey_sessions SET answers=$1::jsonb,expires_at=NOW()-INTERVAL '1 second' WHERE campaign_id=$2 AND submitted_at IS NULL RETURNING id", [JSON.stringify({ v: 1, data: 'expired-fixture' }), c2.id]);
            const result = await fetch(origin + '/api/internal/survey-maintenance', { headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` } });
            assert.equal(result.status, 200);
            if (before.rows[0]) {
                const row = await database().query('SELECT answers FROM survey_sessions WHERE id=$1', [before.rows[0].id]);
                assert.deepEqual(row.rows[0].answers, {});
            }
        });
        await t.test('suspended account session and cookie CSRF are rejected', async () => { assert.equal((await call(a, '/api/auth/logout', 'POST', {}, 'https://untrusted.example')).status, 403); await database().query("UPDATE auth_users SET status='suspended' WHERE id='a'"); assert.equal((await call(a, '/api/auth/me')).status, 403); });
        await t.test('readiness, JSON error contract and unreviewed reports',async()=>{
            assert.equal((await call(client(),'/api/ready')).status,200);
            const malformed=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(malformed.status,400);
            const big=await fetch(origin+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({x:'x'.repeat(300000)})});assert.equal(big.status,413);
            const overview=await call(sa,'/api/tests/reports/overview');assert.equal(overview.data.summary.highRiskRate,null);assert.ok(overview.data.attempts.every((r:any)=>r.riskLevel==='unreviewed'&&r.isHighRisk===null));
            const ops=await call(sa,'/api/tests/ops/summary');assert.equal(ops.data.summary.highRiskCount,null);
            await database().query("UPDATE schema_migrations SET checksum='tampered' WHERE name='005_runtime_hardening.sql'");assert.equal((await call(client(),'/api/ready')).status,503);
            const {migrationDefinitions}=await import('../migrate.js');const m=(await migrationDefinitions()).at(-1)!;await database().query('UPDATE schema_migrations SET checksum=$1 WHERE name=$2',[m.checksum,m.name]);
        });
        await t.test('Express/serverless parity for readiness, methods, session and scope',async()=>{
            const ready=(await import('../../api/ready.js')).default, draft=(await import('../../api/surveys/campaigns/[code]/draft.js')).default,report=(await import('../../api/surveys/admin/campaigns/[id]/report.js')).default,loginHandler=(await import('../../api/auth/login.js')).default;
            const invoke=async(handler:any,req:any)=>{let status=200;const headers:any={};const res:any={setHeader:(k:string,v:any)=>headers[k]=v,getHeader:(k:string)=>headers[k],status:(n:number)=>{status=n;return res;},json:()=>res,end:()=>res,send:()=>res};await handler({headers:{},query:{},...req},res);return status;};
            assert.equal(await invoke(ready,{method:'GET'}),(await call(client(),'/api/ready')).status);
            assert.equal(await invoke(draft,{method:'GET',query:{code:c1.code}}),(await call(client(),p1+'/draft')).status);
            assert.equal(await invoke(draft,{method:'OPTIONS',query:{code:c1.code}}),(await call(client(),p1+'/draft','OPTIONS')).status);
            assert.equal(await invoke(loginHandler,{method:'GET'}),(await call(client(),'/api/auth/login')).status);
            assert.equal(await invoke(report,{method:'GET',query:{id:c1.id},headers:{cookie:Object.entries(b.cookies).map(([k,v])=>`${k}=${v}`).join('; ')}}),(await call(b,`/api/surveys/admin/campaigns/${c1.id}/report`)).status);
        });
        await t.test('health checks do not create/reset schema, seed accounts or change templates', async () => { const count = await database().query('SELECT COUNT(*)::int AS n FROM auth_users'); await call(client(), '/api/health'); const after = await database().query('SELECT COUNT(*)::int AS n FROM auth_users'); assert.equal(count.rows[0].n, after.rows[0].n); });
    }
    finally {
        await new Promise<void>(resolve => server.close(() => resolve()));
        await database().end();
        const auth = await import('../auth-core.js');
        await auth.closeAuthDatabase();
        const legacy = await import('../test-core.js');
        await legacy.closeTestDatabase();
    }
});
