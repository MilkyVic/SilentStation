import test from 'node:test';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const enabled=process.env.SS_DISPOSABLE_TEST_CONFIRM==='yes'&&!!process.env.TEST_DATABASE_URL;
test('owned disposable DB: transactional migrations and abuse controls',{skip:!enabled},async t=>{
 assert.equal(process.env.DATABASE_URL,process.env.TEST_DATABASE_URL);assert.match(new URL(process.env.DATABASE_URL!).pathname,/^\/ss_test_[a-f0-9]+$/);
 const {database,closeDatabase}=await import('./database.js');const {migrate,migrationDefinitions}=await import('./migrate.js');const pool=database(),defs=await migrationDefinitions();
 const reset=async()=>{await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public');};
 try {
 await t.test('fresh migration, rerun and concurrent invocations are idempotent',async()=>{await reset();await Promise.all([migrate(),migrate()]);const a=(await pool.query('SELECT * FROM schema_migrations ORDER BY name')).rows;await migrate();assert.equal(JSON.stringify(a),JSON.stringify((await pool.query('SELECT * FROM schema_migrations ORDER BY name')).rows));});
 await t.test('checksum mismatch aborts without changing applied data',async()=>{const altered=defs.map((m,i)=>i===0?{...m,checksum:'wrong'}:m);await assert.rejects(migrate({definitions:altered}));assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM schema_migrations')).rows[0].n,defs.length);});
 await t.test('failure in the migration chain rolls back all DDL and ledger',async()=>{await reset();await assert.rejects(migrate({definitions:[...defs,{name:'006_bad.sql',sql:'SELECT definitely_missing_function()',checksum:'failure-fixture'}]}));assert.equal((await pool.query("SELECT to_regclass('auth_users') AS found")).rows[0].found,null);});
 await t.test('legacy schema requires explicit verified baseline and retains historical scores',async()=>{await reset();for(const d of defs.slice(0,2))await pool.query(d.sql);await pool.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES('old','old','fake','student','active'); INSERT INTO test_templates(id,title,target_audience) VALUES('old','historical','student'); INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level) VALUES('old','old','old','student',123,'Historical label')");await assert.rejects(migrate());await migrate({baselineThrough:'002_test_schema.sql'});const r=(await pool.query("SELECT score_total,score_level,score_version FROM test_attempts WHERE id='old'")).rows[0];assert.equal(Number(r.score_total),123);assert.equal(r.score_level,'Historical label');assert.equal(r.score_version,'legacy-unversioned');});
 await t.test('legacy column order differs but logical schema still baselines; actual type/null/default drift fails',async()=>{
  await reset();
  const altered=defs[0].sql.replace(/(CREATE TABLE IF NOT EXISTS auth_users \()([\s\S]*?)(\n\);)/,(_whole,a,body,z)=>{const columns=body.split(',\n');const moved=columns.filter((x:string)=>/profile_phone|profile_teacher_type|profile_subject/.test(x));return a+[...columns.filter((x:string)=>!moved.includes(x)),...moved].join(',\n')+z;});
  await pool.query(altered);await pool.query(defs[1].sql);
  await migrate({baselineThrough:'002_test_schema.sql'});
  assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM schema_migrations')).rows[0].n,defs.length);
  await reset();await pool.query(altered);await pool.query(defs[1].sql);await pool.query('ALTER TABLE auth_users ALTER COLUMN profile_phone DROP NOT NULL');
  await assert.rejects(migrate({baselineThrough:'002_test_schema.sql'}),/does not match/);
  assert.equal((await pool.query("SELECT to_regclass('schema_migrations') AS found")).rows[0].found,null);
 });
 await t.test('numeric domain failure rolls back new migrations and baseline',async()=>{await reset();for(const d of defs.slice(0,2))await pool.query(d.sql);await pool.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES('old','old','fake','student','active'); INSERT INTO test_templates(id,title,target_audience) VALUES('old','old','student'); INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total) VALUES('old','old','old','student',2147483647)");await assert.rejects(migrate({baselineThrough:'002_test_schema.sql'}));assert.equal((await pool.query("SELECT to_regclass('survey_sessions') AS found")).rows[0].found,null);});
 await t.test('core fixture import preserves existing custom/history and refuses repeat without mutation',async()=>{
  await reset();await migrate();await pool.query("INSERT INTO auth_users(id,username,password_hash,role,status) VALUES('old','old','fake','student','active'); INSERT INTO test_templates(id,title,target_audience) VALUES('old','historical','student'); INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level) VALUES('old','old','old','student',123,'Historical label')");
  const {seedCoreTestFixtures}=await import('./test-fixtures/core-tests.js'),client=await pool.connect();
  try{await client.query('BEGIN');await seedCoreTestFixtures(client);await client.query('COMMIT');}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
  assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM test_templates')).rows[0].n,7);assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM test_questions')).rows[0].n,111);assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM test_options')).rows[0].n,512);
  const before=(await pool.query('SELECT * FROM test_attempts')).rows;const retry=await pool.connect();try{await retry.query('BEGIN');await assert.rejects(seedCoreTestFixtures(retry),/never overwrite/);await retry.query('ROLLBACK');}finally{retry.release();}
  assert.deepEqual((await pool.query('SELECT * FROM test_attempts')).rows,before);assert.equal((await pool.query("SELECT COUNT(*)::int AS n FROM test_templates WHERE id='old'")).rows[0].n,1);assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM test_questions')).rows[0].n,111);
 });
 await reset();await migrate();
 const {passwordAttempt,consumeRate}=await import('./rate-limits.js');
 await t.test('concurrent password failures enforce five attempts; expiry unlocks',async()=>{const results=await Promise.allSettled(Array.from({length:8},()=>passwordAttempt('fake-login',async()=>null)));assert.equal(results.filter(r=>r.status==='fulfilled').length,5);await pool.query("UPDATE runtime_rate_limits SET window_started=NOW()-INTERVAL '16 minutes'");assert.ok(await passwordAttempt('fake-login',async()=>true));});
 await t.test('OTP reservation locks simultaneous resends and enforces budget',async()=>{const r=await Promise.allSettled([consumeRate('otp','fake@invalid'),consumeRate('otp','fake@invalid')]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);for(let i=0;i<2;i++){await pool.query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds' WHERE bucket LIKE 'otp:%'");await consumeRate('otp','fake@invalid');}await pool.query("UPDATE runtime_rate_limits SET last_sent_at=NOW()-INTERVAL '31 seconds'");await assert.rejects(consumeRate('otp','fake@invalid'));});
 await t.test('chat session limit is shared and bounded',async()=>{for(let i=0;i<20;i++)await consumeRate('chat','fake-session');await assert.rejects(consumeRate('chat','fake-session'));});
 await reset(); // The following core suite will create a fresh schema in this same owned database.
 }finally{await closeDatabase();}
});
