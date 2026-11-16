import {REQUIRED_SCHEMA_QUERIES} from '../readiness.js';
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {Pool} from 'pg';
import {databaseConfig,validateSessionSecret,validateRuntime,secretValue} from '../runtime-config.js';
import {databaseFingerprint} from './account-import.js';
import {MIGRATION_FILES} from '../migrate.js';
export async function deploymentPreflight(env:Record<string,string|undefined>=process.env){
 const gates:string[]=[];
 try{validateSessionSecret(env);}catch{gates.push('SESSION_SECRET_INVALID');}
 let config;try{config=databaseConfig(env);}catch{gates.push('DATABASE_CONFIG_INVALID');}
 try{validateRuntime(env);}catch{gates.push('RUNTIME_CONFIG_INVALID');}
 if(env.SURVEY_REAL_COLLECTION_ENABLED!=='false')gates.push('REAL_COLLECTION_MUST_BE_FALSE');
 if(env.SURVEY_ALLOW_SERVER_DEMO!=='false'&&env.VERCEL_ENV==='production')gates.push('PRODUCTION_DEMO_MUST_BE_FALSE');
 for(const k of ['AUTH_REGISTER_OTP_EXPOSE_DEV_CODE','AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE','AUTH_ACCOUNT_OTP_EXPOSE_DEV_CODE','AUTH_SEED_TEST_USERS'])if(env[k]!=='false')gates.push(k+'_MUST_BE_FALSE');
 if(['production','preview'].includes(env.VERCEL_ENV??'')&&env.ACCOUNT_MANAGEMENT_ENABLED!=='true')gates.push('ACCOUNT_MANAGEMENT_NOT_ENABLED');
 if(!config)return {ok:false,gates};
 const pool=new Pool(config);let c;try{
  c=await pool.connect();await c.query('BEGIN READ ONLY');
  const tables=(await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")).rows;
  const hasLedger=tables.some(r=>r.table_name==='schema_migrations');
  if(!hasLedger)gates.push('EXPLICIT_BASELINE_REVIEW_REQUIRED');
  else{
   const ledger=(await c.query('SELECT name,checksum FROM schema_migrations')).rows;
   const defs=await Promise.all(MIGRATION_FILES.map(async name=>({name,checksum:crypto.createHash('sha256').update((await fs.readFile(path.resolve('server/sql',name),'utf8')).replace(/^\uFEFF/,'')).digest('hex')})));
   if(ledger.length!==defs.length||defs.some(d=>!ledger.some(r=>r.name===d.name&&r.checksum===d.checksum)))gates.push('MIGRATION_RELEASE_MISMATCH');
   else{
    await c.query('SAVEPOINT preflight_schema');
    try{for(const sql of REQUIRED_SCHEMA_QUERIES)await c.query(sql);}catch{await c.query('ROLLBACK TO SAVEPOINT preflight_schema');gates.push('SCHEMA_RUNTIME_INCOMPLETE');}
    await c.query('RELEASE SAVEPOINT preflight_schema');
   }
  }
  if(tables.some(r=>r.table_name==='test_attempts')){
   const r=(await c.query('SELECT COUNT(*)::int AS n FROM test_attempts WHERE score_total IS NULL OR score_total<-99999999.99 OR score_total>99999999.99')).rows[0];if(r.n)gates.push('HISTORICAL_SCORE_DOMAIN_INVALID');
  }
  if(tables.some(r=>r.table_name==='org_schools')){
   if((await c.query("SELECT COUNT(*)::int AS n FROM auth_users WHERE status IN ('active','pending') AND role<>'superadmin' AND school_id IS NULL")).rows[0].n)gates.push('ORGANIZATION_MAPPING_REQUIRED');
   if((await c.query("SELECT COUNT(*)::int AS n FROM org_assignments x JOIN auth_users u ON u.id=x.user_id WHERE x.ended_at IS NULL AND (u.status<>'active' OR u.role='teacher' AND x.homeroom AND x.class_id IS NULL)")).rows[0].n)gates.push('ASSIGNMENT_REVIEW_REQUIRED');
  }
  const role=(await c.query('SELECT rolname,rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];
  const owner=(await c.query("SELECT EXISTS(SELECT 1 FROM pg_class x JOIN pg_namespace n ON n.oid=x.relnamespace WHERE n.nspname='public' AND x.relkind IN ('r','p') AND pg_has_role(current_user,x.relowner,'MEMBER')) AS owns_tables,has_schema_privilege(current_user,'public','CREATE') AS can_create_schema_objects,has_database_privilege(current_user,current_database(),'CREATE') AS can_create_schema")).rows[0];
  if(env.VERCEL_ENV==='production'&&(role.rolsuper||role.rolcreatedb||role.rolcreaterole||role.rolbypassrls||owner.owns_tables||owner.can_create_schema_objects||owner.can_create_schema))gates.push('RUNTIME_DATABASE_ROLE_TOO_PRIVILEGED');
  await c.query('ROLLBACK');return {ok:gates.length===0,gates,targetFingerprint:databaseFingerprint(secretValue('DATABASE_URL',env)!),tableCount:tables.length,ledgerPresent:hasLedger};
 }catch{if(c)await c.query('ROLLBACK').catch(()=>{});return {ok:false,gates:[...gates,'DATABASE_PREFLIGHT_UNAVAILABLE']};}finally{c?.release();await pool.end();}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)deploymentPreflight().then(r=>{console.info(JSON.stringify(r));if(!r.ok)process.exitCode=1;}).catch(()=>{console.error('PREFLIGHT_FAILED_NO_DETAILS');process.exitCode=1;});
