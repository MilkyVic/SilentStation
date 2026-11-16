import {databaseConfig,secretValue,validateRuntime} from '../runtime-config.js';
import {databaseFingerprint} from '../deployment/account-import.js';
type Env=Record<string,string|undefined>;
export type PreviewFixtureScope={snapshotId:string;projectId:string;branchId:string;productionBranchId:string;endpoint:string;productionEndpoints:string[];database:string;previewOrigin:string;productionOrigin:string;reviewed:boolean};
const canonical=(hostname:string)=>hostname.toLowerCase().replace(/-pooler(?=\.)/,'');
function refuse(code:string):never{throw Error(code);}
export function validatePreviewFixtureScope(scope:PreviewFixtureScope,env:Env=process.env){
 if(!scope||scope.reviewed!==true||! /^[a-f0-9]{12}$/.test(scope.snapshotId)||scope.snapshotId!==env.SS_SNAPSHOT_ID||env.QA_INITIALIZE_CONFIRM!=='new-empty-owned-preview:'+scope.snapshotId)refuse('QA_SCOPE_CONFIRM_REQUIRED');
 if(typeof scope.projectId!=='string'||!scope.projectId||env.VERCEL_ENV!=='preview'||env.NODE_ENV!=='production'||scope.projectId!==env.QA_NEON_PROJECT_ID||scope.branchId!==env.QA_NEON_BRANCH_ID||! /^br-[a-z0-9-]+$/.test(scope.branchId)||! /^br-[a-z0-9-]+$/.test(scope.productionBranchId)||scope.branchId===scope.productionBranchId)refuse('QA_DEVELOPMENT_BRANCH_REQUIRED');
 if(env.SURVEY_REAL_COLLECTION_ENABLED!=='false'||env.SURVEY_ALLOW_SERVER_DEMO!=='true'||env.VITE_ACCEPTANCE_BANNER!=='true'||env.AUTH_SEED_TEST_USERS!=='false'||env.ACCOUNT_MANAGEMENT_ENABLED!=='true')refuse('QA_TEST_ONLY_FLAGS_REQUIRED');
 for(const key of ['AUTH_REGISTER_OTP_EXPOSE_DEV_CODE','AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE','AUTH_ACCOUNT_OTP_EXPOSE_DEV_CODE'])if(env[key]!=='false')refuse('QA_OTP_EXPOSURE_FORBIDDEN');
 if(env.AUTH_SMTP_HOST!=='sandbox.smtp.mailtrap.io'||!['2525','587'].includes(env.AUTH_SMTP_PORT??'')||env.AUTH_SMTP_SECURE==='true'||!secretValue('AUTH_SMTP_USER',env)||!secretValue('AUTH_SMTP_PASSWORD',env))refuse('QA_MAILTRAP_SANDBOX_REQUIRED');
 for(const key of ['AUTH_GMAIL_SMTP_USER','AUTH_GMAIL_SMTP_APP_PASSWORD'])if(secretValue(key,env))refuse('QA_REAL_SMTP_FALLBACK_FORBIDDEN');
 try{validateRuntime(env);databaseConfig(env);}catch{refuse('QA_VERIFIED_RUNTIME_REQUIRED');}
 const url=new URL(secretValue('DATABASE_URL',env)!);
 if(!/^ep-[a-z0-9-]+\.(?:[a-z0-9-]+\.)*neon\.tech$/.test(scope.endpoint)||url.hostname!==scope.endpoint||scope.database!=='ss_preview_'+scope.snapshotId||decodeURIComponent(url.pathname.slice(1))!==scope.database||!Array.isArray(scope.productionEndpoints)||!scope.productionEndpoints.length||scope.productionEndpoints.some(p=>!/^ep-[a-z0-9-]+\.(?:[a-z0-9-]+\.)*neon\.tech$/.test(p))||scope.productionEndpoints.some(p=>canonical(p)===canonical(scope.endpoint)))refuse('QA_NEW_NAMESPACED_DATABASE_REQUIRED');
 const preview=new URL(scope.previewOrigin),production=new URL(scope.productionOrigin);
 if(preview.protocol!=='https:'||preview.origin!==scope.previewOrigin||preview.origin===production.origin||production.protocol!=='https:'||production.origin!==scope.productionOrigin||preview.origin!==new URL(env.APP_URL!).origin||preview.origin!==new URL(env.AUTH_API_CORS_ORIGIN!).origin)refuse('QA_PREVIEW_ORIGIN_REQUIRED');
 if(env.QA_EXPECTED_DATABASE_FINGERPRINT!==databaseFingerprint(url.href))refuse('QA_DATABASE_FINGERPRINT_MISMATCH');
 return {snapshotId:scope.snapshotId,targetFingerprint:env.QA_EXPECTED_DATABASE_FINGERPRINT!};
}
