import crypto from 'node:crypto';
import type {Pool,PoolClient} from 'pg';
export const OPERATIONAL_ACCOUNTS = [
 {sourceUsername:'student',username:'student',role:'student',school:'a',homeroom:false,alias:'ss-student'},
 {sourceUsername:'teacher',username:'teacher',role:'teacher',school:'a',homeroom:true,alias:'ss-teacher'},
 {sourceUsername:'admin',username:'admin',role:'admin',school:'a',homeroom:false,alias:'ss-admin'},
 {sourceUsername:'admin-b',username:'admin-b',role:'admin',school:'b',homeroom:false,alias:'ss-admin-b'},
 {sourceUsername:'superadmin',username:'traman-superadmin',role:'superadmin',school:'a',homeroom:false,alias:'ss-superadmin'},
] as const;
export type OperationalImportPlan = {operationId:string;usernames?:string[];targetFingerprint:string;inbox:string;expectedUsers:number;expectedAttempts:number;accounts:Array<{sourceUsername:string;passwordHash:string}>;assignments:Array<{username:string;schoolId:string|null;classId:string|null;deferClassAssignment?:boolean}>};
function refuse(code:string):never{throw Error(code);}
export function databaseFingerprint(url:string){
 const u=new URL(url);return crypto.createHash('sha256').update(JSON.stringify({host:u.hostname,port:u.port||'5432',database:decodeURIComponent(u.pathname.slice(1))})).digest('hex');
}
export function validateInbox(v:string){if(!/^[a-z0-9._-]+@gmail\.com$/i.test(v))refuse('ACCOUNT_IMPORT_INBOX_REQUIRES_OWNED_GMAIL');return v.toLowerCase();}
export function verifyScrypt(password:string,hash:string){
 if(!/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/.test(hash)||typeof password!=='string'||Array.from(password).length<15||Array.from(password).length>128||Buffer.byteLength(password)>1024)return false;
 const [,salt,digest]=hash.split('$');return crypto.timingSafeEqual(crypto.scryptSync(password,salt,64),Buffer.from(digest,'hex'));
}
// Operational account recovery uses reviewed organization IDs, never inferred years.
// Source has SELECT-only use. Only five whitelisted hashes are transferred;
// no sessions, OTPs, results, grants, join codes or survey identities.
export async function readAccountSource(pool:Pool,credentials:Array<{username:string;password:string}>){
 const c=await pool.connect();try{
  await c.query('BEGIN READ ONLY');
  const rows=(await c.query('SELECT username,password_hash,role,status,profile_teacher_type FROM auth_users WHERE username=ANY($1::text[])',[OPERATIONAL_ACCOUNTS.map(a=>a.sourceUsername)])).rows;
  if(rows.length!==5)refuse('ACCOUNT_IMPORT_SOURCE_ACCOUNT_SET_MISMATCH');
  const accounts=OPERATIONAL_ACCOUNTS.map(a=>{const r=rows.find(r=>r.username===a.sourceUsername),pw=credentials.find(x=>x.username===a.sourceUsername)?.password;
   if(!r||r.role!==a.role||r.status!=='active'||a.homeroom&&r.profile_teacher_type!=='homeroom'||!pw||!verifyScrypt(pw,r.password_hash))refuse('ACCOUNT_IMPORT_SOURCE_CREDENTIAL_OR_ROLE_MISMATCH');
   return {sourceUsername:a.sourceUsername,passwordHash:r.password_hash};});
  await c.query('ROLLBACK');return accounts;
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
function selectedAccounts(plan:OperationalImportPlan){const names=plan.usernames??OPERATIONAL_ACCOUNTS.map(a=>a.username);if(!Array.isArray(names)||!names.length||new Set(names).size!==names.length||names.some(n=>!OPERATIONAL_ACCOUNTS.some(a=>a.username===n)))refuse('ACCOUNT_IMPORT_SCOPE_INVALID');return OPERATIONAL_ACCOUNTS.filter(a=>names.includes(a.username));}
function validate(plan:OperationalImportPlan,fingerprint:string){
 if(!plan||! /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(plan.operationId)||! /^[a-f0-9]{64}$/.test(plan.targetFingerprint)||plan.targetFingerprint!==fingerprint)refuse('ACCOUNT_IMPORT_TARGET_OR_OPERATION_MISMATCH');
 validateInbox(plan.inbox);const selected=selectedAccounts(plan);
 if(!Array.isArray(plan.assignments)||plan.assignments.length!==selected.length||selected.some(a=>plan.assignments.filter(x=>x.username===a.username).length!==1)||plan.assignments.some(x=>x.deferClassAssignment!==undefined&&typeof x.deferClassAssignment!=='boolean'||x.deferClassAssignment&&x.classId!==null))refuse('ACCOUNT_IMPORT_REVIEWED_ASSIGNMENT_REQUIRED');
 if(!Number.isInteger(plan.expectedUsers)||plan.expectedUsers<0||!Number.isInteger(plan.expectedAttempts)||plan.expectedAttempts<0||!Array.isArray(plan.accounts)||plan.accounts.length!==selected.length)refuse('ACCOUNT_IMPORT_PLAN_INVALID');
 for(const a of selected){const rows=plan.accounts.filter(r=>r.sourceUsername===a.sourceUsername);if(rows.length!==1||!/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/.test(rows[0].passwordHash))refuse('ACCOUNT_IMPORT_PLAN_INVALID');}
}
const id=(a:typeof OPERATIONAL_ACCOUNTS[number])=>'operational:'+a.username;
const email=(a:typeof OPERATIONAL_ACCOUNTS[number],inbox:string)=>validateInbox(inbox).replace('@','+'+a.alias+'@');
async function verifyReceipt(c:PoolClient,plan:OperationalImportPlan){
 const selected=selectedAccounts(plan),rows=(await c.query('SELECT * FROM auth_users WHERE id=ANY($1::text[])',[selected.map(id)])).rows;
 if(rows.length!==selected.length||selected.some(a=>{const r=rows.find(r=>r.id===id(a));return !r||r.is_qa||r.role!==a.role||r.username!==a.username||r.password_hash!==plan.accounts.find(x=>x.sourceUsername===a.sourceUsername)!.passwordHash||r.profile_email!==email(a,plan.inbox)||r.qa_access_expires_at!==null;}))refuse('ACCOUNT_IMPORT_RECEIPT_STATE_MISMATCH');
}
export async function importOperationalAccounts(pool:Pool,plan:OperationalImportPlan,fingerprint:string,commit=false){
 validate(plan,fingerprint);const selected=selectedAccounts(plan);
 const digest=crypto.createHash('sha256').update(JSON.stringify({inbox:validateInbox(plan.inbox),targetFingerprint:plan.targetFingerprint,expectedUsers:plan.expectedUsers,expectedAttempts:plan.expectedAttempts,assignments:plan.assignments,accounts:selected.map(a=>({...a,passwordHash:plan.accounts.find(x=>x.sourceUsername===a.sourceUsername)!.passwordHash}))})).digest('hex');
 const c=await pool.connect();try{
  await c.query('BEGIN');await c.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:account-writes'))");
  const prior=(await c.query('SELECT * FROM deployment_receipts WHERE operation_id=$1',[plan.operationId])).rows[0];
  if(prior){if(prior.operation!=='operational-account-import'||prior.digest!==digest)refuse('ACCOUNT_IMPORT_IDEMPOTENCY_CONFLICT');await verifyReceipt(c,plan);await c.query('ROLLBACK');return {...prior.response,replayed:true,committed:commit};}
  // Locks also exclude registration/template submission while comparing and inserting.
  await c.query('LOCK TABLE auth_users IN SHARE ROW EXCLUSIVE MODE');await c.query('LOCK TABLE test_attempts IN SHARE MODE');
  const counts=(await c.query('SELECT (SELECT COUNT(*)::int FROM auth_users) AS users,(SELECT COUNT(*)::int FROM test_attempts) AS attempts')).rows[0];
  if(counts.users!==plan.expectedUsers||counts.attempts!==plan.expectedAttempts)refuse('ACCOUNT_IMPORT_TARGET_BASELINE_CHANGED');
  const collision=(await c.query('SELECT 1 FROM auth_users WHERE id=ANY($1::text[]) OR username=ANY($2::text[]) OR LOWER(profile_email)=ANY($3::text[]) LIMIT 1',[selected.map(id),selected.map(a=>a.username),selected.map(a=>email(a,plan.inbox))])).rows;
  if(collision.length)refuse('ACCOUNT_IMPORT_ACCOUNT_COLLISION');
  for(const a of selected){
   const assignment=plan.assignments.find(x=>x.username===a.username)!;
   const school=assignment.schoolId?(await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active' AND NOT is_qa FOR SHARE",[assignment.schoolId])).rows[0]:null;
   const cls=assignment.classId?(await c.query("SELECT * FROM org_classes WHERE id=$1 AND school_id=$2 AND status='active' FOR SHARE",[assignment.classId,assignment.schoolId])).rows[0]:null;
   if(a.role!=='superadmin'&&!school||assignment.schoolId&&!school||assignment.classId&&!cls||['student','teacher'].includes(a.role)&&!cls&&!assignment.deferClassAssignment||['admin','superadmin'].includes(a.role)&&cls)refuse('ACCOUNT_IMPORT_REVIEWED_ASSIGNMENT_REQUIRED');
   if(a.homeroom&&cls&&(await c.query('SELECT 1 FROM org_assignments WHERE class_id=$1 AND homeroom AND ended_at IS NULL',[cls.id])).rows.length)refuse('ACCOUNT_IMPORT_HOMEROOM_CONFLICT');
   await c.query(`INSERT INTO auth_users(id,username,password_hash,role,status,profile_name,profile_email,profile_school,profile_class_name,profile_teacher_type,school_id,class_id,is_qa,qa_access_expires_at,email_verified_at)
    VALUES($1,$2,$3,$4,'active',$5,$6,$7,$8,$9,$10,$11,FALSE,NULL,NULL)`,[id(a),a.username,plan.accounts.find(x=>x.sourceUsername===a.sourceUsername)!.passwordHash,a.role,a.username,email(a,plan.inbox),school?.name??'',cls?.name??'',a.homeroom?'homeroom':'',school?.id??null,cls?.id??null]);
   if(school)await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id,homeroom) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),id(a),school.id,cls?.id??null,a.homeroom&&!!cls]);
   await c.query('INSERT INTO account_audit(id,actor_id,target_id,action,request_id,fields) VALUES($1,NULL,$2,\'operational_account_import\',$3,$4)',[crypto.randomUUID(),id(a),plan.operationId,['role','schoolId','classId']]);
  }
  const response={ok:true,imported:selected.length,accountType:'operational',expiresAt:null,usersBefore:counts.users,usersAfter:counts.users+selected.length,historicalAttempts:counts.attempts};
  await c.query('INSERT INTO deployment_receipts(operation_id,operation,digest,response) VALUES($1,\'operational-account-import\',$2,$3::jsonb)',[plan.operationId,digest,JSON.stringify(response)]);
  await c.query(commit?'COMMIT':'ROLLBACK');return {...response,committed:commit,replayed:false};
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
