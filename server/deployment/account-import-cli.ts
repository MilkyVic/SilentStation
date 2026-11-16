import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {Pool} from 'pg';
import {databaseConfig,secretValue} from '../runtime-config.js';
import {databaseFingerprint,importOperationalAccounts,readAccountSource,validateInbox,OPERATIONAL_ACCOUNTS,type OperationalImportPlan} from './account-import.js';
async function privateJson(file:string){const stat=await fs.stat(file);if((stat.mode&0o077)!==0||!stat.isFile())throw Error('ACCOUNT_IMPORT_PRIVATE_FILE_REQUIRED');return JSON.parse(await fs.readFile(file,'utf8'));}
async function main(){
 const [action,planFile]=process.argv.slice(2);if(!['prepare','check','apply'].includes(action)||!planFile)throw Error('ACCOUNT_IMPORT_USE_PREPARE_CHECK_APPLY');
 const url=secretValue('DATABASE_URL');if(!url)throw Error('ACCOUNT_IMPORT_TARGET_CONFIG_REQUIRED');const fingerprint=databaseFingerprint(url);
 if(action==='prepare'){
  const sourceFile=process.env.ACCOUNT_IMPORT_SOURCE_CONFIG_FILE,credentialsFile=process.env.ACCOUNT_IMPORT_SOURCE_CREDENTIALS_FILE,inbox=validateInbox(process.env.ACCOUNT_IMPORT_OWNED_INBOX??'');
  if(!sourceFile||!credentialsFile||!process.env.ACCOUNT_IMPORT_EXPECTED_TARGET_FINGERPRINT||fingerprint!==process.env.ACCOUNT_IMPORT_EXPECTED_TARGET_FINGERPRINT)throw Error('ACCOUNT_IMPORT_EXPLICIT_SOURCE_TARGET_REQUIRED');
  const source=await privateJson(sourceFile),credentials=await privateJson(credentialsFile),sourceUrl=source.env?.DATABASE_URL??source.databaseUrl??source.DATABASE_URL;
  if(typeof sourceUrl!=='string'||!['127.0.0.1','localhost'].includes(new URL(sourceUrl).hostname)||databaseFingerprint(sourceUrl)===fingerprint)throw Error('ACCOUNT_IMPORT_SOURCE_LOOPBACK_ONLY');
  const pool=new Pool(databaseConfig({NODE_ENV:'test',DATABASE_URL:sourceUrl,DB_TLS_MODE:'disable'}));let accounts;try{accounts=await readAccountSource(pool,credentials);}finally{await pool.end();}
  const assignmentFile=process.env.ACCOUNT_IMPORT_ASSIGNMENTS_FILE;if(!assignmentFile)throw Error('ACCOUNT_IMPORT_REVIEWED_ASSIGNMENT_REQUIRED');const assignments=await privateJson(assignmentFile);
  const usernames=process.env.ACCOUNT_IMPORT_USERNAMES?.split(',').filter(Boolean)??OPERATIONAL_ACCOUNTS.map(a=>a.username);
  const selected=OPERATIONAL_ACCOUNTS.filter(a=>usernames.includes(a.username));if(selected.length!==usernames.length||new Set(usernames).size!==usernames.length||!selected.length)throw Error('ACCOUNT_IMPORT_SCOPE_INVALID');
  accounts=accounts.filter(a=>selected.some(s=>s.sourceUsername===a.sourceUsername));
  const plan:OperationalImportPlan={usernames,assignments,operationId:crypto.randomUUID(),targetFingerprint:fingerprint,inbox,expectedUsers:Number(process.env.ACCOUNT_IMPORT_EXPECTED_USERS),expectedAttempts:Number(process.env.ACCOUNT_IMPORT_EXPECTED_ATTEMPTS),accounts};
  if(!Number.isInteger(plan.expectedUsers)||!Number.isInteger(plan.expectedAttempts))throw Error('ACCOUNT_IMPORT_TARGET_COUNTS_REQUIRED');
  await fs.writeFile(planFile,JSON.stringify(plan,null,2)+'\n',{mode:0o600,flag:'wx'});
  await fs.writeFile(planFile+'.handover.json',JSON.stringify({operationId:plan.operationId,accountType:'operational',accountExpiryDays:null,credentialFile:path.resolve(credentialsFile),accounts:selected.map(a=>({username:a.username,localUsername:a.sourceUsername,role:a.role,email:inbox.replace('@','+'+a.alias+'@')}))},null,2)+'\n',{mode:0o600,flag:'wx'});
  console.info(JSON.stringify({ok:true,prepared:selected.length,privatePlan:true}));return;
 }
 const plan=await privateJson(planFile) as OperationalImportPlan;
 if(action==='apply'&&(process.env.ACCOUNT_IMPORT_CONFIRM!=='yes'||process.env.ACCOUNT_IMPORT_EXPECTED_TARGET_FINGERPRINT!==fingerprint))throw Error('ACCOUNT_IMPORT_COMMIT_CONFIRMATION_REQUIRED');
 const pool=new Pool(databaseConfig());try{console.info(JSON.stringify(await importOperationalAccounts(pool,plan,fingerprint,action==='apply')));}finally{await pool.end();}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)main().catch(e=>{console.error(/^ACCOUNT_IMPORT_[A-Z_]+$/.test(e?.message)?e.message:'ACCOUNT_IMPORT_OPERATION_FAILED_NO_DETAILS');process.exitCode=1;});
