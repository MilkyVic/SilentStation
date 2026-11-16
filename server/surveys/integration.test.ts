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
    await database().query("INSERT INTO org_schools(id,name) VALUES('school-a','School A'),('school-b','School B');UPDATE auth_users SET school_id=CASE WHEN profile_school='School A' THEN 'school-a' ELSE 'school-b' END");
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
    async function create(c: Client, school = 'School A', isDemo = true) { const x = await call(c, '/api/surveys/admin/campaigns', 'POST', { title: 'Integration fixture', school, isDemo,schoolId:school==='School A'?'school-a':'school-b' }); assert.equal(x.status, 201); return x.data.campaign; }
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
        const invitation1=(await call(sa,`/api/surveys/distribution/campaigns/${c1.id}/invitations`,'POST',{requestId:crypto.randomUUID()})).data.invitation.code;
        const invitation2=(await call(sa,`/api/surveys/distribution/campaigns/${c2.id}/invitations`,'POST',{requestId:crypto.randomUUID()})).data.invitation.code;
        const started = await call(guest, p1 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION,invitationCode:invitation1 });
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
        await t.test('expiry is enforced on backend and deletion clears unsubmitted draft', async () => { const fresh = client(); await call(fresh, p2 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION,invitationCode:invitation2 }); await database().query('UPDATE survey_sessions SET expires_at=NOW()-INTERVAL \'1 second\' WHERE campaign_id=$1', [c2.id]); assert.equal((await call(fresh, p2 + '/draft')).status, 401); const fresh2 = client(); await call(fresh2, p2 + '/session', 'POST', { consent: true, consentVersion: CONSENT_VERSION,invitationCode:invitation2 }); assert.equal((await call(fresh2, p2 + '/draft', 'DELETE')).status, 200); assert.equal((await call(fresh2, p2 + '/draft')).status, 401); });
        await database().query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'");
        await t.test('OTP zero attempts is locked and successful consumption is atomic', async () => { const first = await call(client(), '/api/auth/login', 'POST', { username: 'super', password }); if (first.status === 429) {
            await database().query("UPDATE auth_admin_login_otps SET resend_available_at=NOW() WHERE user_id='sa'"); await database().query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'");
        } const challenge = first.status === 429 ? await call(client(), '/api/auth/login', 'POST', { username: 'super', password }) : first; await database().query('UPDATE auth_admin_login_otps SET attempts_left=0 WHERE id=$1', [challenge.data.otpSessionId]); assert.equal((await call(client(), '/api/auth/login', 'POST', { otpSessionId: challenge.data.otpSessionId, otpCode: challenge.data.devOtpCode })).status, 400); await database().query("UPDATE auth_admin_login_otps SET resend_available_at=NOW() WHERE user_id='sa'"); await database().query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'"); const next = await call(client(), '/api/auth/login', 'POST', { username: 'super', password }); const results = await Promise.all([call(client(), '/api/auth/login', 'POST', { otpSessionId: next.data.otpSessionId, otpCode: next.data.devOtpCode }), call(client(), '/api/auth/login', 'POST', { otpSessionId: next.data.otpSessionId, otpCode: next.data.devOtpCode })]); assert.deepEqual(results.map(r => r.status).sort(), [200, 400]); });
        await t.test('legacy editor preserves bank, option identity, score and immutable history',async()=>{
         const created=await call(a,'/api/tests/templates','POST',{title:'Fixture custom',targetAudience:'student',questionList:[{text:'Fixture question',options:[{text:'zero-a',score:1},{text:'zero-b',score:1}]}]});assert.equal(created.status,201);const id=created.data.template.id;
         assert.equal((await call(b,`/api/tests/templates/${id}`,'PATCH',{title:'unauthorized',expectedVersion:1})).status,403);
         const managed=await call(a,`/api/tests/templates/${id}`);assert.equal(managed.status,200);assert.equal(managed.data.questionList.length,1);
         assert.equal((await call(a,`/api/tests/templates/${id}`,'PATCH',{title:'Renamed',expectedVersion:1})).status,200);
         assert.equal((await call(a,`/api/tests/templates/${id}`,'PATCH',{title:'stale',expectedVersion:1})).status,409);
         assert.equal((await call(a,`/api/tests/templates/${id}`,'PATCH',{questionList:[],expectedVersion:2})).status,409);
         assert.equal((await call(a,`/api/tests/templates/${id}`,'PATCH',{isActive:true,expectedVersion:2})).status,200);
         const detail=await call(stu,`/api/tests/${id}`);assert.equal(detail.status,200);assert.equal(detail.data.questionList[0].options.length,2);assert.equal(detail.data.definitionDigest,managed.data.definitionDigest);
         const initial=await call(stu,`/api/tests/drafts/${id}`,'POST',{definitionDigest:detail.data.definitionDigest});assert.equal(initial.status,201);const q=detail.data.questionList[0],answers={[q.id]:q.options[1].id},d=initial.data.draft;
         const saved=await call(stu,`/api/tests/drafts/${id}`,'PUT',{draftId:d.draftId,definitionDigest:d.definitionDigest,revision:0,answers});assert.equal(saved.status,200);
         assert.equal((await call(stu,`/api/tests/drafts/${id}`,'PUT',{draftId:d.draftId,definitionDigest:d.definitionDigest,revision:0,answers})).status,409);
         const resumed=await call(stu,`/api/tests/drafts/${id}`);assert.equal(resumed.data.draft.answers[q.id],q.options[1].id);
         const payload={templateId:id,draftId:d.draftId,definitionDigest:d.definitionDigest,revision:1,answers,score:999};const replies=await Promise.all([call(stu,'/api/tests/submit','POST',payload),call(stu,'/api/tests/submit','POST',payload)]);assert.ok(replies.every(r=>r.status===201));assert.equal(replies[0].data.attemptId,replies[1].data.attemptId);assert.equal(replies[0].data.scoreTotal,1);assert.equal(replies[0].data.scoreLevel,'Chưa duyệt diễn giải');
         const row=(await database().query('SELECT * FROM test_attempts WHERE draft_id=$1',[d.draftId])).rows[0];assert.equal(row.answer_options[q.id],q.options[1].id);assert.equal(row.template_snapshot.questions.length,1);assert.deepEqual(row.answers,[1]);
         assert.equal((await call(stu,'/api/tests/submit','POST',{templateId:id,answers:[99]})).status,400);
         assert.equal((await call(a,`/api/tests/templates/${id}`,'DELETE',{expectedVersion:3})).status,200);
         assert.ok((await call(stu,'/api/tests/results/me')).data.results.some((r:any)=>r.templateId===id));
        });
        await t.test('legacy bank changes require restart, old drafts are not silently relabelled',async()=>{
         const c=await call(a,'/api/tests/templates','POST',{title:'Version fixture',targetAudience:'student',questionList:[{text:'old',options:[{text:'x',score:0},{text:'y',score:1}]}]});const id=c.data.template.id;
         await call(a,`/api/tests/templates/${id}`,'PATCH',{isActive:true,expectedVersion:1});const detail=await call(stu,`/api/tests/${id}`),d=(await call(stu,`/api/tests/drafts/${id}`,'POST',{definitionDigest:detail.data.definitionDigest})).data.draft;
         await call(a,`/api/tests/templates/${id}`,'PATCH',{questionList:[{text:'new',options:[{text:'x',score:0},{text:'y',score:1}]}],expectedVersion:2});const read=await call(stu,`/api/tests/drafts/${id}`);assert.equal(read.data.draft.restartRequired,'version_changed');assert.deepEqual(read.data.draft.answers,{});
         assert.equal((await call(stu,`/api/tests/drafts/${id}`,'PUT',{draftId:d.draftId,definitionDigest:d.definitionDigest,revision:0,answers:{}})).data.error.code,'TEST_VERSION_CHANGED');
         assert.equal((await call(stu,`/api/tests/drafts/${id}`,'DELETE',{draftId:d.draftId,revision:0})).status,200);
         const latest=await call(stu,`/api/tests/${id}`);const fresh=(await call(stu,`/api/tests/drafts/${id}`,'POST',{definitionDigest:latest.data.definitionDigest})).data.draft;assert.notEqual(fresh.draftId,d.draftId);
         assert.equal((await call(stu,`/api/tests/drafts/${id}`,'DELETE',{draftId:d.draftId,revision:0})).status,409);
         await database().query('UPDATE legacy_test_drafts SET draft_id=NULL,definition_digest=NULL WHERE user_id=$1 AND template_id=$2',['stu',id]);assert.equal((await call(stu,`/api/tests/drafts/${id}`)).data.draft.restartRequired,'unversioned');
        });
        await t.test('campaign policy null, open lock and scoped grant candidates',async()=>{
         const c=await create(sa);const path=`/api/surveys/admin/campaigns/${c.id}`;assert.equal((await call(sa,path,'PATCH',{retentionDays:30})).status,200);assert.equal((await call(sa,path,'PATCH',{retentionDays:null})).data.campaign.retentionDays,null);
         assert.equal((await call(sa,path,'PATCH',{status:'open'})).status,200);assert.equal((await call(sa,path,'PATCH',{retentionDays:7})).data.error.code,'SURVEY_POLICY_LOCKED');
         assert.equal((await call(a,path+'/grant-candidates')).status,403);const people=(await call(sa,path+'/grant-candidates')).data.candidates;assert.ok(people.some((x:any)=>x.id==='a'));assert.ok(!people.some((x:any)=>x.id==='b'||x.id==='stu'));assert.ok(people.every((x:any)=>!('email' in x)));
         await call(sa,path+'/grants','PUT',{userId:'a',readRaw:true,export:false});await database().query("UPDATE auth_users SET status='suspended' WHERE id='a'");assert.equal((await call(sa,path+'/grants','PUT',{userId:'a',readRaw:false,export:false})).status,200);await database().query("UPDATE auth_users SET status='active' WHERE id='a'");
        });
        await t.test('campaign update rolls back when audit fails; new route parity is real',async()=>{
         const c=await create(sa),path=`/api/surveys/admin/campaigns/${c.id}`;
         await database().query("CREATE FUNCTION acceptance_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='campaign_update' THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER acceptance_reject_audit BEFORE INSERT ON survey_audit FOR EACH ROW EXECUTE FUNCTION acceptance_reject_audit()");
         try{assert.equal((await call(sa,path,'PATCH',{retentionDays:7})).status,500);assert.equal((await database().query('SELECT retention_days FROM survey_campaigns WHERE id=$1',[c.id])).rows[0].retention_days,null);}finally{await database().query('DROP TRIGGER acceptance_reject_audit ON survey_audit; DROP FUNCTION acceptance_reject_audit()');}
         const handler=(await import('../../api/surveys/admin/campaigns/[id]/grant-candidates.js')).default;let status=200;const res:any={setHeader(){},status(n:number){status=n;return this;},json(){return this;},end(){return this;}};
         await handler({method:'GET',query:{id:c.id},headers:{cookie:Object.entries(a.cookies).map(([k,v])=>`${k}=${v}`).join('; ')}},res);assert.equal(status,(await call(a,path+'/grant-candidates')).status);
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
            const {migrationDefinitions}=await import('../migrate.js');const m=(await migrationDefinitions()).find(m=>m.name==='005_runtime_hardening.sql')!;await database().query('UPDATE schema_migrations SET checksum=$1 WHERE name=$2',[m.checksum,m.name]);
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
        await t.test('official campaign requires every independent gate and persists a real-mode synthetic response',async()=>{
            const {DEFINITION_VERSION}=await import('../../shared/surveys/contracts.js');
            const current=await create(sa,'School A',false);assert.equal(current.definitionVersion,DEFINITION_VERSION);assert.equal(current.policyApproved,false);assert.equal(current.scoringApproved,false);assert.equal(current.approvalReference,'');
            const path=`/api/surveys/campaigns/${current.code}`,admin=`/api/surveys/admin/campaigns/${current.id}`;
            const approval={status:'open',policyApproved:true,scoringApproved:true,approvalReference:'DISPOSABLE-TEST-ONLY-NOT-A-REAL-APPROVAL',retentionDays:1};
            assert.equal((await call(sa,admin,'PATCH',approval)).status,403);
            const flag=process.env.SURVEY_REAL_COLLECTION_ENABLED;
            try{
                process.env.SURVEY_REAL_COLLECTION_ENABLED='true';
                for(const missing of [{policyApproved:false},{scoringApproved:false},{approvalReference:'  '},{retentionDays:null}])assert.equal((await call(sa,admin,'PATCH',{...approval,...missing})).status,403);
                assert.equal((await call(sa,admin,'PATCH',approval)).status,200);const info=await call(client(),path);assert.equal(info.data.definition.version,DEFINITION_VERSION);
                const invitation=(await call(sa,`/api/surveys/distribution/campaigns/${current.id}/invitations`,'POST',{requestId:crypto.randomUUID()})).data.invitation.code;const person=client();assert.equal((await call(person,path+'/session','POST',{consent:true,consentVersion:CONSENT_VERSION,invitationCode:invitation})).status,201);
                assert.equal((await call(person,path+'/draft','PUT',{revision:0,answers:{},reviewedSections:DEFINITION.sections.map(s=>s.id)})).status,200);
                const submitted=await call(person,path+'/submit','POST',{revision:1,idempotencyKey:'official-fixture-12345678901234567890'});assert.equal(submitted.status,201);
                const stored=(await database().query('SELECT definition_version,consent_version,scores FROM survey_responses WHERE id=$1',[submitted.data.receipt.responseId])).rows[0];assert.equal(stored.definition_version,DEFINITION_VERSION);assert.equal(stored.consent_version,CONSENT_VERSION);assert.ok(Object.values(stored.scores).every((x:any)=>x.status==='insufficient_data'));
            }finally{if(flag===undefined)delete process.env.SURVEY_REAL_COLLECTION_ENABLED;else process.env.SURVEY_REAL_COLLECTION_ENABLED=flag;}
            assert.equal((await call(client(),path)).status,200);assert.equal((await call(client(),path+'/session','POST',{consent:true,consentVersion:CONSENT_VERSION})).status,403);
        });
        await t.test('historical campaign remains resumable/exportable without relabeling stored versions',async()=>{
            const {getSurveyDefinition}=await import('../../shared/surveys/releases.js');const old=getSurveyDefinition('student-mental-health-v1-draft')!;
            await database().query('INSERT INTO survey_definitions(version,definition,score_version) VALUES($1,$2::jsonb,$3)',[old.version,JSON.stringify(old),'survey-arithmetic-v1']);
            const historical=await create(sa,'School A',true);await database().query('UPDATE survey_campaigns SET definition_version=$2,consent_version=$3 WHERE id=$1',[historical.id,old.version,old.consentVersion]);
            const admin=`/api/surveys/admin/campaigns/${historical.id}`,path=`/api/surveys/campaigns/${historical.code}`;assert.equal((await call(sa,admin,'PATCH',{status:'open'})).status,200);
            const info=await call(client(),path);assert.equal(info.data.definition.version,old.version);
            const invitation=(await call(sa,`/api/surveys/distribution/campaigns/${historical.id}/invitations`,'POST',{requestId:crypto.randomUUID()})).data.invitation.code;const person=client();await call(person,path+'/session','POST',{consent:true,consentVersion:old.consentVersion,invitationCode:invitation});
            await call(person,path+'/draft','PUT',{revision:0,answers:{'I.1':{status:'answered',value:'K'}},reviewedSections:old.sections.map(s=>s.id)});
            const resumed=await call(person,path+'/draft');assert.equal(resumed.status,200);assert.equal(resumed.data.draft.answers['I.1'].value,'K');
            const receipt=await call(person,path+'/submit','POST',{revision:1,idempotencyKey:'historical-fixture-12345678901234567890'});assert.equal(receipt.status,201);
            await call(sa,admin+'/grants','PUT',{userId:'sa',readRaw:true,export:true});const csv=await call(sa,admin+'/export');assert.equal(csv.status,200);assert.ok(csv.data.includes(old.version));assert.ok(csv.data.includes(old.consentVersion));
            const r=(await database().query('SELECT definition_version,consent_version FROM survey_responses WHERE id=$1',[receipt.data.receipt.responseId])).rows[0];assert.equal(r.definition_version,old.version);assert.equal(r.consent_version,old.consentVersion);
            const flag=process.env.SURVEY_REAL_COLLECTION_ENABLED;try{process.env.SURVEY_REAL_COLLECTION_ENABLED='true';await database().query("UPDATE survey_campaigns SET is_demo=FALSE,policy_approved=TRUE,scoring_approved=TRUE,approval_reference='test',retention_days=1 WHERE id=$1",[historical.id]);assert.equal((await call(client(),path)).status,200);assert.equal((await call(client(),path+'/session','POST',{consent:true,consentVersion:old.consentVersion})).status,403);}finally{if(flag===undefined)delete process.env.SURVEY_REAL_COLLECTION_ENABLED;else process.env.SURVEY_REAL_COLLECTION_ENABLED=flag;}
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
