import crypto from 'node:crypto';
import type {Pool,PoolClient} from 'pg';
import {AuthHttpError} from './auth-core.js';
import type {LegacyAnswers,LegacyQuestion,LegacyReceipt} from '../shared/legacy-tests.js';
type Db=Pool|PoolClient;
export function assertTestAccess(user:any,row:any,active=true){
 if(row?.is_qa&&!user.isQa)throw new AuthHttpError(403,'TEST_QA_ONLY','Bài kiểm thử chỉ dành cho tài khoản QA.');
 if(!row||row.archived_at||active&&!row.is_active)throw new AuthHttpError(409,'TEST_CLOSED','Bài test đã đóng hoặc không còn khả dụng.');
 if(!['admin','superadmin'].includes(user.role)&&row.target_audience!=='both'&&row.target_audience!==user.role)throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Không có quyền với bài test.');
}
export function assertEditor(user:any,row:any){
 if(!['admin','superadmin'].includes(user.role)||user.role==='admin'&&(row.is_system||row.created_by_user_id!==user.id))throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Chỉ sửa test custom do mình tạo; test hệ thống cần Superadmin.');
}
export async function currentVersion(db:Db,id:string){return Number((await db.query('SELECT COALESCE(MAX(version_number),0)::int AS n FROM test_template_versions WHERE template_id=$1',[id])).rows[0].n);}
export async function definitionOf(db:Db,row:any){
 const rows=await db.query('SELECT q.id AS question_id,q.question_order,q.content,q.subscale,q.is_reverse,o.id AS option_id,o.option_order,o.label,o.score FROM test_questions q LEFT JOIN test_options o ON o.question_id=q.id WHERE q.template_id=$1 ORDER BY q.question_order,o.option_order',[row.id]);
 const questions:LegacyQuestion[]=[];
 for(const r of rows.rows){let q=questions.find(q=>q.id===r.question_id);if(!q){q={id:r.question_id,text:r.content,subscale:r.subscale,isReverse:r.is_reverse,options:[]};questions.push(q);}if(r.option_id)q.options.push({id:r.option_id,text:r.label,score:Number(r.score)});}
 const definitionDigest=crypto.createHash('sha256').update(JSON.stringify({templateCode:row.template_code,questions})).digest('hex');
 return {questionList:questions,definitionDigest,currentVersion:await currentVersion(db,row.id),snapshot:{...row,snapshotFormat:'full-definition-v1',definitionDigest,questions}};
}
export function validateSelections(input:unknown,questions:LegacyQuestion[],complete=false):LegacyAnswers{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new AuthHttpError(400,'TEST_INVALID','Cần lựa chọn bằng option ID, không dùng điểm từ trình duyệt.');
 const result:LegacyAnswers={};for(const [qid,value] of Object.entries(input)){
  const q=questions.find(q=>q.id===qid);if(!q||typeof value!=='string'||!q.options.some(o=>o.id===value))throw new AuthHttpError(400,'TEST_INVALID','Lựa chọn không thuộc câu hỏi của phiên bản này.');result[qid]=value;
 }
 if(complete&&(!questions.length||Object.keys(result).length!==questions.length))throw new AuthHttpError(400,'TEST_INCOMPLETE','Cần trả lời đủ câu trước khi nộp.');return result;
}
export function digestRequired(value:unknown){if(typeof value!=='string'||!/^\w{64}$/.test(value)||!/^[0-9a-f]+$/.test(value))throw new AuthHttpError(400,'TEST_VERSION_REQUIRED','Client cần tải lại để dùng contract phiên bản mới.');return value;}
export function draftIdentity(value:unknown){if(typeof value!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))throw new AuthHttpError(400,'TEST_DRAFT_REQUIRED','Cần bắt đầu đúng lượt làm bài.');return value;}
export function expectedVersion(value:unknown,actual:number){if(!Number.isInteger(value)||Number(value)<0)throw new AuthHttpError(400,'TEST_VERSION_REQUIRED','Client cần tải lại trước khi sửa.');if(value!==actual)throw new AuthHttpError(409,'TEST_TEMPLATE_EDIT_CONFLICT','Template đã được cập nhật. Tải lại trước khi chỉnh tiếp.');}
export function receiptOf(row:any):LegacyReceipt{return {attemptId:row.id,scoreTotal:Number(row.score_total),scoreLevel:row.score_level,scorePayload:row.score_payload,suggestDass21:row.suggest_dass21};}
export function parseTestBody(req:any):any{
 let b=req.body??{};if(typeof b==='string'){if(Buffer.byteLength(b)>256*1024)throw new AuthHttpError(413,'BODY_TOO_LARGE','Yêu cầu vượt giới hạn.');try{b=JSON.parse(b);}catch{throw new AuthHttpError(400,'INVALID_JSON','JSON không hợp lệ.');}}
 if(!b||typeof b!=='object'||Array.isArray(b))throw new AuthHttpError(400,'TEST_INVALID','Yêu cầu không hợp lệ.');if(Buffer.byteLength(JSON.stringify(b))>256*1024)throw new AuthHttpError(413,'BODY_TOO_LARGE','Yêu cầu vượt giới hạn.');return b;
}
