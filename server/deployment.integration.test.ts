import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {Pool} from 'pg';
import {OPERATIONAL_ACCOUNTS,readAccountSource,importOperationalAccounts,databaseFingerprint,type OperationalImportPlan} from './deployment/account-import.js';
const enabled=process.env.SS_DISPOSABLE_TEST_CONFIRM==='yes'&&!!process.env.TEST_DATABASE_URL;
test('owned disposable DB: operational account recovery and immutable QA provenance',{skip:!enabled},async t=>{
 assert.equal(process.env.DATABASE_URL,process.env.TEST_DATABASE_URL);assert.match(new URL(process.env.DATABASE_URL!).pathname,/^\/ss_test_[a-f0-9]+$/);
 const {database,closeDatabase}=await import('./database.js'),{migrate}=await import('./migrate.js'),{hashPassword}=await import('./accounts/common.js');
 const db=database(),pass='Test only recovery pass phrase 111!',secret=hashPassword(pass),fingerprint=databaseFingerprint(process.env.DATABASE_URL!);
 let plan:OperationalImportPlan;let superToken:string;
 async function loginUser(username:string){const {loginAccount}=await import('./auth-core.js');let r=await loginAccount({username,password:pass});if('otpRequired' in r)r=await loginAccount({otpSessionId:r.otpSessionId,otpCode:r.devOtpCode});if(!('session' in r))throw Error('Expected verified session');return r;}
 const reset=async()=>{await db.query('DROP SCHEMA public CASCADE;CREATE SCHEMA public');await migrate();};
 const counts=async()=>(await db.query('SELECT (SELECT COUNT(*)::int FROM auth_users) AS users,(SELECT COUNT(*)::int FROM test_attempts) AS attempts')).rows[0];
 try{
 await t.test('source whitelist validates existing scrypt hashes without transferring sessions/results or changing source',async()=>{
  await reset();for(const a of OPERATIONAL_ACCOUNTS)await db.query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_teacher_type) VALUES($1,$1,$2,$3,'active',$4)",[a.sourceUsername,secret,a.role,a.homeroom?'homeroom':'']);
  const credentials=OPERATIONAL_ACCOUNTS.map(a=>({username:a.sourceUsername,password:pass}));
  const source=new Pool({connectionString:process.env.DATABASE_URL});let accounts;try{accounts=await readAccountSource(source,credentials);await assert.rejects(readAccountSource(source,credentials.map(a=>({...a,password:'wrong'}))),/SOURCE_CREDENTIAL/);}finally{await source.end();}
  assert.equal(accounts.length,5);assert.ok(accounts.every(a=>a.passwordHash===secret));assert.deepEqual(await counts(),{users:5,attempts:0});
  plan={operationId:crypto.randomUUID(),targetFingerprint:fingerprint,inbox:'test-recovery@gmail.com',expectedUsers:8,expectedAttempts:1,accounts,assignments:OPERATIONAL_ACCOUNTS.map(a=>({username:a.username,schoolId:a.role==='superadmin'?null:'real-school-'+a.school,classId:['student','teacher'].includes(a.role)?'real-school-'+a.school+'-12a1':null}))};
 });
 await t.test('dry run leaves target unchanged; commit imports live non-expiring accounts, preserving original superadmin/history',async()=>{
  await reset();for(const s of ['a','b']){await db.query('INSERT INTO org_schools(id,name) VALUES($1,$2)',['real-school-'+s,'TEST fixture real-context '+s]);await db.query("INSERT INTO org_classes(id,school_id,name,academic_year) VALUES($1,$2,'12A1','2026-2027')",['real-school-'+s+'-12a1','real-school-'+s]);}
  for(let i=0;i<8;i++)await db.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES($1,$2,$3,$4,'active')",['old-'+i,i===0?'superadmin':'old-user-'+i,hashPassword('Original historical pass phrase!'),i===0?'superadmin':'student']);
  await db.query("INSERT INTO test_templates(id,title,target_audience) VALUES('historical','TEST historical','student');INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level) VALUES('historical','old-1','historical','student',123,'Stored historical label')");
  const old=(await db.query("SELECT * FROM auth_users WHERE id LIKE 'old-%' ORDER BY id")).rows,history=(await db.query('SELECT * FROM test_attempts')).rows;
  const dry=await importOperationalAccounts(db,plan,fingerprint);assert.equal(dry.committed,false);assert.deepEqual(await counts(),{users:8,attempts:1});
  const saved=await importOperationalAccounts(db,plan,fingerprint,true);assert.equal(saved.imported,5);assert.deepEqual(await counts(),{users:13,attempts:1});
  const rows=(await db.query("SELECT * FROM auth_users WHERE id LIKE 'operational:%'")).rows;assert.equal(rows.length,5);assert.ok(rows.every(r=>r.password_hash===secret&&!r.is_qa&&r.qa_access_expires_at===null&&r.email_verified_at===null));
  assert.deepEqual((await db.query("SELECT * FROM auth_users WHERE id LIKE 'old-%' ORDER BY id")).rows,old);assert.deepEqual((await db.query('SELECT * FROM test_attempts')).rows,history);
  assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM survey_grants')).rows[0].n,0);
 });
 await t.test('retry is idempotent; changed target/input or unrelated username collision aborts all',async()=>{
  const replay=await importOperationalAccounts(db,plan,fingerprint,true);assert.equal(replay.replayed,true);assert.equal((await counts()).users,13);
  await assert.rejects(importOperationalAccounts(db,{...plan,inbox:'other@gmail.com'},fingerprint,true),/IDEMPOTENCY_CONFLICT/);
  await assert.rejects(importOperationalAccounts(db,{...plan,targetFingerprint:'0'.repeat(64)},fingerprint,true),/TARGET_OR_OPERATION/);
  await assert.rejects(importOperationalAccounts(db,{...plan,operationId:crypto.randomUUID(),expectedUsers:13},fingerprint,true),/ACCOUNT_COLLISION/);assert.equal((await counts()).users,13);
 });
 await t.test('provenance cannot be changed retrospectively on live accounts or history',async()=>{
  await assert.rejects(db.query("UPDATE auth_users SET is_qa=TRUE,qa_access_expires_at=NOW()+INTERVAL '30 days' WHERE username='student'"),/immutable/);
  await assert.rejects(db.query("UPDATE test_attempts SET is_qa=TRUE WHERE id='historical'"),/immutable/);
  assert.equal((await db.query("SELECT is_qa FROM test_attempts WHERE id='historical'")).rows[0].is_qa,false);
 });
 await t.test('all operational roles authenticate with the preserved password and retain role permissions',async()=>{
  const {loginAccount,getCurrentUser}=await import('./auth-core.js');
  for(const a of OPERATIONAL_ACCOUNTS){const r=await loginUser(a.username);assert.equal(r.user.role,a.role);assert.equal(r.user.isQa,false);assert.equal(r.user.qaAccessExpiresAt,null);assert.equal((await getCurrentUser(r.session.accessToken)).role,a.role);if(a.role==='superadmin')superToken=r.session.accessToken;}
 });
 await t.test('QA expiry is checked both at login and every existing session without scheduler',async()=>{
  const {loginAccount,getCurrentUser}=await import('./auth-core.js');await db.query("INSERT INTO auth_users(id,username,password_hash,role,status,is_qa,qa_access_expires_at) VALUES('expiry','expiry',$1,'student','active',TRUE,NOW()+INTERVAL '1 minute')",[secret]);
  const r=await loginUser('expiry');await db.query("UPDATE auth_users SET qa_access_expires_at=NOW() WHERE id='expiry'");await assert.rejects(getCurrentUser(r.session.accessToken),e=>(e as any).code==='AUTH_QA_EXPIRED');await assert.rejects(loginAccount({username:'expiry',password:pass}),e=>(e as any).code==='AUTH_QA_EXPIRED');
 });
 await t.test('QA reports exclude before total/pagination/CSV; live reports and personal history remain unchanged',async()=>{
  await db.query("INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level,is_qa) VALUES('qa-attempt','operational:student','historical','student',1,'TEST',TRUE)");
  const {loginAccount}=await import('./auth-core.js');const r={session:{accessToken:superToken}};
  const {snapshotOverview,legacyExport}=await import('./accounts/reports.js'),report=await snapshotOverview(r.session.accessToken,{limit:1});assert.equal(report.summary.totalAttempts,1);assert.equal(report.attempts[0].attemptId,'historical');
  const withQa=await snapshotOverview(r.session.accessToken,{includeQa:'true',limit:1});assert.equal(withQa.summary.totalAttempts,2);assert.equal(withQa.attempts.length,1);assert.ok(withQa.nextCursor);
  await assert.rejects(snapshotOverview(r.session.accessToken,{includeQa:'invalid'}),e=>(e as any).statusCode===400);
  let csv='';await legacyExport({headers:{authorization:'Bearer '+r.session.accessToken},query:{}},{setHeader(){},write(s:string){csv+=s;},end(){}});assert.ok(!csv.includes('qa-attempt'));assert.ok(csv.includes('historical'));
  const {listMyTestResults}=await import('./test-core.js'),student=await loginUser('student');assert.equal((await listMyTestResults(student.session.accessToken)).results[0].isQa,true);
 });
 await t.test('recover the operational Superadmin first without guessing any school or year',async()=>{
  await reset();await db.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES('original','superadmin',$1,'superadmin','active')",[secret]);
  const chosen=OPERATIONAL_ACCOUNTS.find(a=>a.role==='superadmin')!,single:OperationalImportPlan={...plan,operationId:crypto.randomUUID(),usernames:[chosen.username],assignments:[{username:chosen.username,schoolId:null,classId:null}],accounts:plan.accounts.filter(a=>a.sourceUsername===chosen.sourceUsername),expectedUsers:1,expectedAttempts:0};
  const saved=await importOperationalAccounts(db,single,fingerprint,true);assert.equal(saved.imported,1);assert.equal(saved.expiresAt,null);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_schools')).rows[0].n,0);
  const {closeAuthDatabase}=await import('./auth-core.js');await closeAuthDatabase();const login=await loginUser('traman-superadmin');assert.equal(login.user.role,'superadmin');assert.equal(login.user.profile.schoolId,null);assert.equal(login.user.isQa,false);
  assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM auth_users WHERE role='superadmin' AND status='active' AND NOT is_qa")).rows[0].n,2);
  await assert.rejects(importOperationalAccounts(db,{...single,usernames:['unknown-superadmin']},fingerprint,true),/SCOPE_INVALID/);
 });
 await t.test('reviewed mapping bootstraps IDs/years, keeps pending teachers unassigned, persists atomically and replays safely',async()=>{
  await reset();for(const [id,role,status,cls,type] of [['map-student','student','active','12A1',''],['map-teacher','teacher','active','12A1','homeroom'],['map-pending','teacher','pending','proposed','homeroom'],['map-admin','admin','active','','']])await db.query('INSERT INTO auth_users(id,username,password_hash,role,status,profile_school,profile_class_name,profile_teacher_type) VALUES($1,$1,$2,$3,$4,\'Old school label\',$5,$6)',[id,secret,role,status,cls,type]);
  await db.query("INSERT INTO test_templates(id,title,target_audience) VALUES('historical','TEST historical','student');INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level) VALUES('history','map-student','historical','student',123,'Stored original label')");
  const history=(await db.query('SELECT * FROM test_attempts')).rows;
  const mapping={operationId:crypto.randomUUID(),schools:[{id:'reviewed-school',name:'TEST reviewed school'}],classes:[{id:'reviewed-class',schoolId:'reviewed-school',name:'12A1',academicYear:'2026-2027'}],campaigns:[],users:[{id:'map-student',schoolId:'reviewed-school',classId:'reviewed-class',oldSchool:'Old school label',oldClassName:'12A1',expectedRevision:0},{id:'map-teacher',schoolId:'reviewed-school',classId:'reviewed-class',teacherType:'homeroom',oldSchool:'Old school label',oldClassName:'12A1',expectedRevision:0},{id:'map-pending',schoolId:'reviewed-school',classId:null,teacherType:'homeroom',oldSchool:'Old school label',oldClassName:'proposed',expectedRevision:0},{id:'map-admin',schoolId:'reviewed-school',classId:null,oldSchool:'Old school label',oldClassName:'',expectedRevision:0}]};
  const {applyOrganizationMapping}=await import('./accounts/mapping.js');
  const before=(await db.query('SELECT * FROM auth_users ORDER BY id')).rows;
  await applyOrganizationMapping(mapping);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_schools')).rows[0].n,0);assert.deepEqual((await db.query('SELECT * FROM auth_users ORDER BY id')).rows,before);
  await assert.rejects(applyOrganizationMapping({...mapping,users:mapping.users.map(u=>u.id==='map-pending'?{...u,classId:'reviewed-class'}:u)},true),/Unapproved/);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_schools')).rows[0].n,0);
  const replies=await Promise.all([applyOrganizationMapping(mapping,true),applyOrganizationMapping(mapping,true)]);assert.equal(replies.filter(r=>r.replayed).length,1);assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM org_assignments WHERE user_id='map-pending' AND ended_at IS NULL")).rows[0].n,0);
  const pending=(await db.query("SELECT status,class_id,revision FROM auth_users WHERE id='map-pending'")).rows[0];assert.equal(pending.status,'pending');assert.equal(pending.class_id,null);assert.equal(pending.revision,1);assert.deepEqual((await db.query('SELECT * FROM test_attempts')).rows,history);
  await assert.rejects(applyOrganizationMapping({...mapping,classes:[{...mapping.classes[0],academicYear:'2027-2028'}]},true),/receipt conflict/);
  await assert.rejects(applyOrganizationMapping({...mapping,operationId:crypto.randomUUID(),schools:[],classes:[]},true),/Mapping conflict/);
 });
 await t.test('explicit school-only mapping defers years without granting homeroom scope or changing history',async()=>{
  await reset();for(const [id,role,status,type,cls] of [['deferred-student','student','active','','12A1'],['deferred-teacher','teacher','active','homeroom','12A1'],['deferred-pending','teacher','pending','homeroom','12A3']])await db.query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_school,profile_class_name,profile_teacher_type) VALUES($1,$1,$2,$3,$4,'Old spelling',$5,$6)",[id,secret,role,status,cls,type]);
  await db.query("INSERT INTO test_templates(id,title,target_audience) VALUES('retained','TEST retained','student');INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level) VALUES('retained','deferred-student','retained','student',7,'Stored original label')");const history=(await db.query('SELECT * FROM test_attempts')).rows;
  const mapping={operationId:crypto.randomUUID(),schools:[{id:'reviewed-school',name:'TEST corrected school'}],classes:[],campaigns:[],users:[{id:'deferred-student',schoolId:'reviewed-school',classId:null,deferClassAssignment:true,oldSchool:'Old spelling',oldClassName:'12A1',expectedRevision:0},{id:'deferred-teacher',schoolId:'reviewed-school',classId:null,deferClassAssignment:true,teacherType:'homeroom',oldSchool:'Old spelling',oldClassName:'12A1',expectedRevision:0},{id:'deferred-pending',schoolId:'reviewed-school',classId:null,deferClassAssignment:true,teacherType:'homeroom',oldSchool:'Old spelling',oldClassName:'12A3',expectedRevision:0}]};const {applyOrganizationMapping}=await import('./accounts/mapping.js');
  await assert.rejects(applyOrganizationMapping({...mapping,users:mapping.users.map(u=>({...u,deferClassAssignment:undefined}))},true),/GVCN requires/);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_schools')).rows[0].n,0);
  await applyOrganizationMapping(mapping);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_schools')).rows[0].n,0);await applyOrganizationMapping(mapping,true);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_classes')).rows[0].n,0);
  const teacher=(await db.query("SELECT school_id,class_id,profile_teacher_type,profile_class_name FROM auth_users WHERE id='deferred-teacher'")).rows[0];assert.equal(teacher.school_id,'reviewed-school');assert.equal(teacher.class_id,null);assert.equal(teacher.profile_teacher_type,'homeroom');assert.equal(teacher.profile_class_name,'12A1');assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_assignments WHERE homeroom OR class_id IS NOT NULL')).rows[0].n,0);assert.equal((await db.query("SELECT COUNT(*)::int AS n FROM org_assignments WHERE user_id='deferred-pending'")).rows[0].n,0);assert.equal((await db.query("SELECT status FROM auth_users WHERE id='deferred-pending'")).rows[0].status,'pending');assert.deepEqual((await db.query('SELECT * FROM test_attempts')).rows,history);
  const teacherLogin=await loginUser('deferred-teacher'),{usersList}=await import('./accounts/organizations.js');await assert.rejects(usersList({headers:{authorization:'Bearer '+teacherLogin.session.accessToken},query:{}}),e=>(e as any).statusCode===403);
 });
 await t.test('operational accounts can explicitly defer class/year, remain usable and cannot invent homeroom authority',async()=>{
  await reset();await db.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES('retained-root','retained-root',$1,'superadmin','active')",[secret]);for(const key of ['a','b'])await db.query('INSERT INTO org_schools(id,name) VALUES($1,$2)',['reviewed-'+key,'TEST school-only '+key]);
  const selected=OPERATIONAL_ACCOUNTS.filter(a=>a.role!=='superadmin'),schoolOnly:OperationalImportPlan={...plan,operationId:crypto.randomUUID(),usernames:selected.map(a=>a.username),expectedUsers:1,expectedAttempts:0,accounts:plan.accounts.filter(x=>selected.some(a=>a.sourceUsername===x.sourceUsername)),assignments:selected.map(a=>({username:a.username,schoolId:'reviewed-'+a.school,classId:null,...(['student','teacher'].includes(a.role)?{deferClassAssignment:true}:{})}))};
  await assert.rejects(importOperationalAccounts(db,{...schoolOnly,assignments:schoolOnly.assignments.map(x=>({...x,deferClassAssignment:undefined}))},fingerprint,true),/REVIEWED_ASSIGNMENT/);assert.equal((await counts()).users,1);await assert.rejects(importOperationalAccounts(db,{...schoolOnly,assignments:schoolOnly.assignments.map(x=>({...x,deferClassAssignment:'true' as any}))},fingerprint,true),/REVIEWED_ASSIGNMENT/);
  const dry=await importOperationalAccounts(db,schoolOnly,fingerprint,false);assert.equal(dry.committed,false);assert.equal((await counts()).users,1);const saved=await importOperationalAccounts(db,schoolOnly,fingerprint,true);assert.equal(saved.imported,4);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_classes')).rows[0].n,0);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM org_assignments WHERE homeroom OR class_id IS NOT NULL')).rows[0].n,0);
  for(const a of selected){const logged=await loginUser(a.username);assert.equal(logged.user.role,a.role);assert.equal(logged.user.isQa,false);assert.equal(logged.user.profile.classId,null);assert.ok(logged.user.profile.schoolId);assert.equal(logged.user.qaAccessExpiresAt,null);}assert.equal((await importOperationalAccounts(db,schoolOnly,fingerprint,true)).replayed,true);
 });
 await t.test('shared QA fixture initializer refuses retained state and seals new Preview identities without modifying source history',async()=>{
  await reset();const {populateOwnedFixtures}=await import('./test-fixtures/populate.js'),fs=await import('node:fs/promises'),os=await import('node:os'),path=await import('node:path'),dir=await fs.mkdtemp(path.join(os.tmpdir(),'ss-fixture-unit-')),file=path.join(dir,'private.json');
  try{
   await db.query("INSERT INTO account_audit(id,target_id,action) VALUES($1,'test','retained')",[crypto.randomUUID()]);await assert.rejects(populateOwnedFixtures(db,'012345abcdef',file,true),/Nonempty/);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM auth_users')).rows[0].n,0);
   await reset();await populateOwnedFixtures(db,'012345abcdef',file,true);assert.equal((await fs.stat(file)).mode&0o077,0);assert.equal(JSON.parse(await fs.readFile(file,'utf8')).length,6);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM auth_users WHERE is_qa AND qa_access_expires_at>NOW()')).rows[0].n,6);assert.equal((await db.query('SELECT COUNT(*)::int AS n FROM test_questions')).rows[0].n,111);
   const rows=(await db.query('SELECT id,password_hash,role,is_qa FROM auth_users ORDER BY id')).rows;await assert.rejects(populateOwnedFixtures(db,'012345abcdef',file,true));assert.deepEqual((await db.query('SELECT id,password_hash,role,is_qa FROM auth_users ORDER BY id')).rows,rows);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
 });
 await t.test('preflight is read-only and detects retained ledger with missing runtime column, mapping gaps and owner privilege',async()=>{
  await reset();const {deploymentPreflight}=await import('./deployment/preflight.js');
  const config={NODE_ENV:'test',DATABASE_URL:process.env.DATABASE_URL,DB_TLS_MODE:'disable',SURVEY_REAL_COLLECTION_ENABLED:'false',SURVEY_ALLOW_SERVER_DEMO:'false',AUTH_REGISTER_OTP_EXPOSE_DEV_CODE:'false',AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE:'false',AUTH_ACCOUNT_OTP_EXPOSE_DEV_CODE:'false',AUTH_SEED_TEST_USERS:'false',ACCOUNT_MANAGEMENT_ENABLED:'true'};
  const before=(await db.query('SELECT * FROM schema_migrations ORDER BY name')).rows;const ok=await deploymentPreflight(config);assert.equal(ok.ok,true,ok.gates.join(','));assert.deepEqual((await db.query('SELECT * FROM schema_migrations ORDER BY name')).rows,before);
  const owner=await deploymentPreflight({...config,VERCEL_ENV:'production'});assert.ok(owner.gates.includes('RUNTIME_DATABASE_ROLE_TOO_PRIVILEGED'));assert.equal(JSON.stringify(owner).includes('ss_test@'),false);
  await db.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES('unmapped','unmapped',$1,'student','active')",[secret]);assert.ok((await deploymentPreflight(config)).gates.includes('ORGANIZATION_MAPPING_REQUIRED'));
  await db.query('ALTER TABLE auth_users DROP COLUMN ui_locale');const drift=await deploymentPreflight(config);assert.ok(drift.gates.includes('SCHEMA_RUNTIME_INCOMPLETE'));assert.deepEqual((await db.query('SELECT * FROM schema_migrations ORDER BY name')).rows,before);
 });
 }finally{const {closeAuthDatabase}=await import('./auth-core.js'),{closeTestDatabase}=await import('./test-core.js');await closeAuthDatabase();await closeTestDatabase();await closeDatabase();}
});
