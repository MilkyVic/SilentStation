import crypto from 'node:crypto';
import {database} from './database.js';
import {validateSessionSecret} from './runtime-config.js';
import {getCurrentUser,AuthHttpError} from './auth-core.js';
import {requestToken,sameOrigin} from './http-security.js';
import {encryptDraft,decryptDraft} from './surveys/draft-crypto.js';
import {assertTestAccess,definitionOf,digestRequired,draftIdentity,parseTestBody,receiptOf,validateSelections} from './test-definitions.js';
import type {LegacyDraft} from '../shared/legacy-tests.js';
const versionChanged=()=>new AuthHttpError(409,'TEST_VERSION_CHANGED','Bank câu hỏi đã đổi. Xác nhận xóa nháp cũ và bắt đầu lại; không tự chuyển đáp án.');
export async function legacyDraftHandler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 try{
  if(req.method==='OPTIONS')return res.status(204).end();if(!['GET','POST','PUT','DELETE'].includes(req.method))throw new AuthHttpError(405,'TEST_METHOD','Phương thức không hợp lệ.');
  if(req.method!=='GET')sameOrigin(req);
  const user=await getCurrentUser(requestToken(req)),id=String(req.params?.templateId??req.query?.templateId??''),client=await database().connect();
  try{
   await client.query('BEGIN');
   // Lock order matches submission and template editing. DELETE remains owner-only even after archive.
   const t=(await client.query('SELECT * FROM test_templates WHERE id=$1 FOR SHARE',[id])).rows[0];
   const row=(await client.query('SELECT * FROM legacy_test_drafts WHERE user_id=$1 AND template_id=$2 FOR UPDATE',[user.id,id])).rows[0];
   if(req.method==='DELETE'){
    const b=parseTestBody(req);if(!Number.isInteger(b.revision)||b.revision<0)throw new AuthHttpError(400,'TEST_INVALID','Revision không hợp lệ.');
    if(row&&(row.draft_id!==b.draftId||row.revision!==b.revision))throw new AuthHttpError(409,'TEST_DRAFT_CONFLICT','Nháp đã thay đổi; không xóa lượt làm khác.');
    if(row)await client.query('DELETE FROM legacy_test_drafts WHERE user_id=$1 AND template_id=$2',[user.id,id]);await client.query('COMMIT');return res.json({ok:true});
   }
   const prior=row?.draft_id?(await client.query('SELECT * FROM test_attempts WHERE draft_id=$1 AND user_id=$2',[row.draft_id,user.id])).rows[0]:null;
   if(prior&&row&&req.method!=='PUT'){const draft:LegacyDraft={draftId:row.draft_id,definitionDigest:row.definition_digest,revision:row.revision,expiresAt:new Date(row.expires_at).toISOString(),answers:{},submitted:true,receipt:receiptOf(prior)};await client.query('COMMIT');return res.json({ok:true,draft});}
   assertTestAccess(user,t);const def=await definitionOf(client,t);
   const restartRequired=row?(!row.draft_id||!row.definition_digest?'unversioned':new Date(row.expires_at).getTime()<=Date.now()?'expired':row.definition_digest!==def.definitionDigest?'version_changed':undefined):undefined;
   const dto=(r:any):LegacyDraft=>({draftId:r.draft_id,definitionDigest:r.definition_digest,revision:r.revision,expiresAt:new Date(r.expires_at).toISOString(),answers:restartRequired?{}:validateSelections(decryptDraft(r.answers,validateSessionSecret(),id,`${user.id}:${r.draft_id}`),def.questionList),submitted:false,...(restartRequired?{restartRequired}:{})});
   if(req.method==='GET'){const draft=row?dto(row):null;await client.query('COMMIT');return res.json({ok:true,draft});}
   const b=parseTestBody(req);const digest=digestRequired(b.definitionDigest);if(digest!==def.definitionDigest)throw versionChanged();
   if(req.method==='POST'){
    if(row){const draft=dto(row);await client.query('COMMIT');return res.json({ok:true,draft});}
    const draftId=crypto.randomUUID(),answers=encryptDraft({},validateSessionSecret(),id,`${user.id}:${draftId}`);
    const inserted=await client.query("INSERT INTO legacy_test_drafts(user_id,template_id,answers,revision,expires_at,draft_id,definition_digest) VALUES($1,$2,$3::jsonb,0,NOW()+INTERVAL '24 hours',$4,$5) ON CONFLICT(user_id,template_id) DO NOTHING RETURNING *",[user.id,id,JSON.stringify(answers),draftId,digest]);
    if(!inserted.rows[0])throw new AuthHttpError(409,'TEST_DRAFT_CONFLICT','Một tab khác vừa bắt đầu lượt làm; tải lại.');
    const draft=dto(inserted.rows[0]);await client.query('COMMIT');return res.status(201).json({ok:true,draft});
   }
   const draftId=draftIdentity(b.draftId);if(!Number.isInteger(b.revision)||b.revision<0)throw new AuthHttpError(400,'TEST_INVALID','Revision không hợp lệ.');if(restartRequired)throw versionChanged();
   if(!row||row.draft_id!==draftId||row.revision!==b.revision)throw new AuthHttpError(409,'TEST_DRAFT_CONFLICT','Nháp đã đổi ở tab khác. Tải lại bản lưu trước khi sửa.');
   const answers=validateSelections(b.answers,def.questionList);
   const updated=await client.query('UPDATE legacy_test_drafts SET answers=$3::jsonb,revision=revision+1 WHERE user_id=$1 AND template_id=$2 RETURNING *',[user.id,id,JSON.stringify(encryptDraft(answers,validateSessionSecret(),id,`${user.id}:${draftId}`))]);
   const draft={...dto(updated.rows[0]),answers};await client.query('COMMIT');return res.json({ok:true,draft});
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
 }catch(e){if(e instanceof AuthHttpError)return res.status(e.statusCode).json({ok:false,error:{code:e.code,message:e.message}});return res.status(500).json({ok:false,error:{code:'TEST_DRAFT_ERROR',message:'Không xác nhận được lưu nháp.'}});}
}
