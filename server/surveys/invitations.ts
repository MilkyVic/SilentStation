import crypto from 'node:crypto';
import {database} from '../database.js';
import {actor,mutation,fields,fail,controlKeys} from '../accounts/common.js';
import {INVITATION_PATTERN,type Invitation} from '../../shared/survey-invitations.js';
import type {PoolClient} from 'pg';
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateInvitationCode(random:(n:number)=>number=crypto.randomInt){return 'KS-'+Array.from({length:12},()=>alphabet[random(32)]).join('');}
export function invitationExpiry(value:unknown,now=Date.now()){
 const time=value===undefined?now+7*86400000:typeof value==='string'?Date.parse(value):NaN;
 if(!Number.isFinite(time)||time<=now||time>now+30*86400000)fail(400,'INVITATION_EXPIRY_INVALID','Hạn mã phải ở tương lai và không quá 30 ngày.');
 return new Date(time);
}
export function publicSurveyOrigin(env=process.env){
 let url:URL;try{url=new URL(env.SURVEY_PUBLIC_BASE_URL||env.APP_URL||'');}catch{fail(503,'INVITATION_ORIGIN_UNAVAILABLE','Chưa cấu hình địa chỉ tham gia khảo sát.');}
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||!['http:','https:'].includes(url.protocol)||(env.NODE_ENV==='production'&&url.protocol!=='https:'))fail(503,'INVITATION_ORIGIN_UNAVAILABLE','Địa chỉ tham gia khảo sát không hợp lệ.');
 // Plain HTTP is a test/development transport, never a production exception.
 return url.origin;
}
export function invitationDto(r:any,origin=publicSurveyOrigin()):Invitation{return {id:r.id,campaignId:r.campaign_id,issuedBy:r.issued_by,code:r.code,joinUrl:origin+'/#/tham-gia/'+r.code,expiresAt:new Date(r.expires_at).toISOString(),revokedAt:r.revoked_at?new Date(r.revoked_at).toISOString():null,revision:r.revision,status:r.revoked_at?'revoked':new Date(r.expires_at).getTime()<=Date.now()?'expired':'active',createdAt:new Date(r.created_at).toISOString()};}
const campaignSql='SELECT c.*,d.definition AS saved_definition,d.score_version AS saved_score_version FROM survey_campaigns c JOIN survey_definitions d ON d.version=c.definition_version';
export async function invitationCampaign(id:string,c?:PoolClient,lock=false){const r=(await (c??database()).query(campaignSql+' WHERE c.id=$1'+(lock?' FOR UPDATE OF c':''),[id])).rows[0];if(!r)fail(404,'SURVEY_NOT_FOUND','Không tìm thấy đợt khảo sát.');return r;}
async function eligible(a:any,c:any,runner:any,issuing=true){
 if(!['teacher','admin','superadmin'].includes(a.role)||!c.school_id)fail(403,'INVITATION_FORBIDDEN','Không có quyền phát mã cho đợt này.');
 const school=(await runner.query("SELECT 1 FROM org_schools WHERE id=$1 AND status='active'",[c.school_id])).rowCount;
 if(!school||a.role!=='superadmin'&&a.school_id!==c.school_id)fail(403,'INVITATION_FORBIDDEN','Không có quyền ngoài phạm vi trường.');
 if(a.role==='teacher'){
  if(issuing&&!c.teacher_distribution_enabled)fail(403,'INVITATION_TEACHER_DISABLED','Quản trị chưa cho giáo viên phát mã của đợt này.');
  const assigned=await runner.query("SELECT 1 FROM org_assignments x LEFT JOIN org_classes cl ON cl.id=x.class_id WHERE x.user_id=$1 AND x.school_id=$2 AND x.ended_at IS NULL AND (x.class_id IS NULL OR cl.status='active')",[a.id,c.school_id]);
  if(!assigned.rowCount)fail(403,'INVITATION_ASSIGNMENT_REQUIRED','Cần phân công trường đang có hiệu lực.');
 }
}
export async function distribution(req:any,action:string,validate:(c:any)=>void){
 const id=String(req.params?.id??req.query?.id??'');
 if(action==='distribution-campaigns'){
  const a=await actor(req);if(!['teacher','admin','superadmin'].includes(a.role))fail(403,'INVITATION_FORBIDDEN','Không có quyền phát mã.');
  const rows=(await database().query(campaignSql+" WHERE ($1='superadmin' OR c.school_id=$2) ORDER BY c.created_at DESC,c.id LIMIT 200",[a.role,a.school_id])).rows;
  const campaigns=[];for(const c of rows){try{await eligible(a,c,database());}catch{continue;}let reason:null|string=null;try{validate(c);publicSurveyOrigin();}catch(e){reason=(e as Error).message;}campaigns.push({id:c.id,title:c.title,school:c.school,status:c.status,teacherDistributionEnabled:c.teacher_distribution_enabled,canIssue:!reason,unavailableReason:reason});}
  return {ok:true,campaigns};
 }
 if(action==='invitations'&&req.method==='GET'){
  const a=await actor(req),c=await invitationCampaign(id);await eligible(a,c,database(),false);
  const limit=50,cursor=String(req.query?.cursor??'');if(cursor&&!/^[0-9a-f-]{36}$/.test(cursor))fail(400,'INVITATION_INVALID','Cursor không hợp lệ.');
  const rows=(await database().query("SELECT * FROM survey_invitations WHERE campaign_id=$1 AND ($2<>'teacher' OR issued_by=$3) AND ($4='' OR id>NULLIF($4,'')::uuid) ORDER BY id LIMIT $5",[id,a.role,a.id,cursor,limit+1])).rows;
  return {ok:true,invitations:rows.slice(0,limit).map(r=>invitationDto(r)),nextCursor:rows.length>limit?rows[limit-1].id:null};
 }
 const b=req.body;fields(b,[...controlKeys,...(action==='invitations'?['expiresAt']:[])]);
 const result=await mutation(req,action==='invitations'?'invitation-create':'invitation-revoke',id,b,async(c,a)=>{
  let invite:any;if(action!=='invitations'){invite=(await c.query('SELECT * FROM survey_invitations WHERE id=$1',[id])).rows[0];if(!invite)fail(404,'INVITATION_NOT_FOUND','Không tìm thấy mã mời.');}
  const campaign=await invitationCampaign(invite?.campaign_id??id,c,true);await eligible(a,campaign,c);
  if(action==='invitations'){
   validate(campaign);const expires=invitationExpiry(b.expiresAt),origin=publicSurveyOrigin();
   for(let i=0;i<5;i++){const r=await c.query('INSERT INTO survey_invitations(id,campaign_id,issued_by,code,expires_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(code) DO NOTHING RETURNING *',[crypto.randomUUID(),campaign.id,a.id,generateInvitationCode(),expires]);if(r.rowCount){await audit(c,a.id,campaign.id,'invitation_create',r.rows[0].id);return {ok:true,invitation:invitationDto(r.rows[0],origin)};}}
   fail(503,'INVITATION_RETRY','Chưa tạo được mã duy nhất. Thử lại cùng yêu cầu.');
  }
  invite=(await c.query('SELECT * FROM survey_invitations WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(a.role==='teacher'&&invite.issued_by!==a.id)fail(403,'INVITATION_FORBIDDEN','Chỉ được thu hồi mã của mình.');
  if(b.expectedRevision!==invite.revision)fail(409,'INVITATION_CONFLICT','Mã đã đổi. Tải lại danh sách.');
  if(!invite.revoked_at){invite=(await c.query('UPDATE survey_invitations SET revoked_at=NOW(),revision=revision+1 WHERE id=$1 RETURNING *',[id])).rows[0];await audit(c,a.id,campaign.id,'invitation_revoke',id);}
  return {ok:true,invitation:invitationDto(invite)};
 });
 if(result.replayed&&result.invitation){const row=(await database().query('SELECT * FROM survey_invitations WHERE id=$1',[result.invitation.id])).rows[0];if(row)result.invitation=invitationDto(row);}
 return result;
}
export async function audit(c:PoolClient,actorId:string,campaignId:string,action:string,id:string){await c.query('INSERT INTO survey_audit(id,campaign_id,actor_id,action,object_id) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),campaignId,actorId,action,id]);}
export async function revokeInvitations(c:PoolClient,where:string,values:any[],actorId:string,action:string){const r=await c.query('UPDATE survey_invitations SET revoked_at=NOW(),revision=revision+1 WHERE revoked_at IS NULL AND '+where+' RETURNING id,campaign_id',values);for(const x of r.rows)await audit(c,actorId,x.campaign_id,action,x.id);}
export async function lookupInvitation(code:string){if(!INVITATION_PATTERN.test(code))fail(404,'INVITATION_NOT_FOUND','Mã mời không hợp lệ hoặc không tồn tại.');const r=(await database().query('SELECT * FROM survey_invitations WHERE code=$1',[code])).rows[0];if(!r)fail(404,'INVITATION_NOT_FOUND','Mã mời không hợp lệ hoặc không tồn tại.');return r;}
export async function validateInvitation(c:PoolClient,campaign:any,code:unknown){
 if(typeof code!=='string'||!INVITATION_PATTERN.test(code))fail(400,'INVITATION_REQUIRED','Cần mã mời hợp lệ để bắt đầu lượt mới.');
 const r=(await c.query('SELECT * FROM survey_invitations WHERE code=$1 AND campaign_id=$2 FOR SHARE',[code,campaign.id])).rows[0];
 if(!r||r.revoked_at||new Date(r.expires_at).getTime()<=Date.now())fail(409,'INVITATION_INACTIVE','Mã mời đã hết hạn hoặc bị thu hồi.');
 const a=(await c.query('SELECT * FROM auth_users WHERE id=$1',[r.issued_by])).rows[0];if(!a||a.status!=='active')fail(409,'INVITATION_INACTIVE','Mã mời không còn hiệu lực.');await eligible(a,campaign,c);
}
