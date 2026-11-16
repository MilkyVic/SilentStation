import {includeQa} from './qa-policy.js';
import {snapshotOverview} from './accounts/reports.js';
import {TEST_ICONS,TEST_COLORS} from '../shared/accounts.js';
import crypto from 'node:crypto';
import {legacyArithmetic,LEGACY_SCORE_VERSION} from './test-scoring/legacy-arithmetic.js';
import {validateQuestionList,replaceQuestions,appendVersion} from './test-template-store.js';
import {assertEditor,assertTestAccess,currentVersion,definitionOf,digestRequired,draftIdentity,expectedVersion,receiptOf,validateSelections} from './test-definitions.js';
import {validateSessionSecret} from './runtime-config.js';
import {decryptDraft} from './surveys/draft-crypto.js';
import { Pool } from 'pg';
import { databaseConfig } from './runtime-config.js';
import { AuthHttpError, getCurrentUser, initializeAuthCore } from './auth-core.js';

type TestAudience = 'student' | 'teacher' | 'both';
type TemplateCode = 'PHQ9' | 'GAD7' | 'SDQ25' | 'MT' | 'DASS21' | 'MBI22' | 'CUSTOM';
type TemplateVersionAction = 'create' | 'update' | 'publish' | 'unpublish' | 'delete';

type TestTemplate = {
  id: string;
  title: string;
  description: string;
  targetAudience: TestAudience;
  templateCode: TemplateCode;
  isSystem: boolean;
  isActive: boolean;
  displayOrder: number;
};

const getAudiencesByRole = (role: string): TestAudience[] => {
  if (role === 'student') return ['student', 'both'];
  if (role === 'teacher') return ['teacher', 'both'];
  if (role === 'admin' || role === 'superadmin') return ['student', 'teacher', 'both'];
  return ['both'];
};

const DATABASE_URL = process.env.DATABASE_URL;
let pool: Pool | null = null;
let initialized = false;

const getPool = () => pool ??= new Pool(databaseConfig());

const mapTemplateRow = (row: Record<string, any>) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  targetAudience: row.target_audience,
  templateCode: row.template_code,
  isSystem: row.is_system,isQa:!!row.is_qa,
  isActive: row.is_active,
  displayOrder: row.display_order,durationMinutes:row.duration_minutes,iconKey:row.icon_key,colorKey:row.color_key,
  questionCount: Number(row.question_count || 0),
  createdByUserId: row.created_by_user_id || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const sanitizeAnswers = (answers: unknown): number[] => {
  if (!Array.isArray(answers)) return [];
  return answers.map((value) => Number(value)).filter((value) => Number.isFinite(value));
};

const clampInt = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
};

const scoreByTemplate = (_templateId: string,templateCode:string,answers:number[]) => {
 const result=legacyArithmetic(templateCode,answers);
 return {scoreTotal:result.total,scoreLevel:'Chưa duyệt diễn giải',scorePayload:{...result,scoreVersion:LEGACY_SCORE_VERSION,interpretationApproved:false},suggestDass21:false};
};

const ensureTemplateWritePermission = (userRole: string, isSystem: boolean) => {
  if (userRole !== 'superadmin' && isSystem) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Superadmin moi duoc sua/xoa test he thong.');
  }
};

const normalizeTemplateSnapshot = (row: Record<string, any>) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  targetAudience: row.target_audience,
  templateCode: row.template_code,
  isSystem: Boolean(row.is_system),
  isActive: Boolean(row.is_active),
  displayOrder: Number(row.display_order || 0),
  createdByUserId: row.created_by_user_id || null,
  createdAt: row.created_at || null,
  updatedAt: row.updated_at || null,
});

const appendTemplateVersion = async (
  templateRow: Record<string, any>,
  action: TemplateVersionAction,
  actorUserId: string | null,
) => {
  const templateId = String(templateRow.id || '').trim();
  if (!templateId) return;

  const nextVersionResult = await getPool().query(`
    SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version
    FROM test_template_versions
    WHERE template_id = $1
  `, [templateId]);
  const nextVersion = Number(nextVersionResult.rows[0]?.next_version || 1);
  const versionId = `tv-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  await getPool().query(`
    INSERT INTO test_template_versions (
      id,
      template_id,
      version_number,
      action,
      actor_user_id,
      snapshot
    ) VALUES (
      $1, $2, $3, $4, $5, $6::jsonb
    )
  `, [
    versionId,
    templateId,
    nextVersion,
    action,
    actorUserId,
    JSON.stringify(normalizeTemplateSnapshot(templateRow)),
  ]);
};

export const initializeTestCore = async () => {
  if (!initialized) { await initializeAuthCore(); await getPool().query('SELECT 1 FROM test_templates LIMIT 0'); initialized = true; }
};
export const listTestCatalog = async (token: string | null) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  const role = user.role;
  const audiences = getAudiencesByRole(role);

  const result = await getPool().query(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.target_audience,
      t.template_code,
      t.is_system,t.is_qa,t.duration_minutes,t.icon_key,t.color_key,
      t.is_active,
      t.display_order,
      t.created_at,
      t.updated_at,
      COALESCE(q.question_count, 0)::int AS question_count
    FROM test_templates t
    LEFT JOIN (
      SELECT template_id, COUNT(*)::int AS question_count
      FROM test_questions
      GROUP BY template_id
    ) q ON q.template_id = t.id
    WHERE t.archived_at IS NULL AND t.is_active = TRUE
      AND t.target_audience = ANY($1::text[]) AND (NOT t.is_qa OR $2::boolean)
    ORDER BY t.display_order ASC, t.created_at ASC
  `, [audiences,!!user.isQa]);

  return {
    userRole: role,
    templates: result.rows.map(mapTemplateRow),
  };
};

export const listManageTestTemplates = async (token: string | null) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Admin/Superadmin moi duoc quan tri bai test.');
  }

  const rows = await getPool().query(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.target_audience,
      t.template_code,
      t.is_system,t.is_qa,t.duration_minutes,t.icon_key,t.color_key,
      t.is_active,
      t.display_order,
      t.created_by_user_id,
      t.created_at,
      t.updated_at,
      COALESCE(q.question_count, 0)::int AS question_count,
      COALESCE(v.version_count, 0) AS version_count, COALESCE(v.current_version,0) AS current_version,
      v.last_version_at
    FROM test_templates t
    LEFT JOIN (
      SELECT template_id, COUNT(*)::int AS question_count
      FROM test_questions
      GROUP BY template_id
    ) q ON q.template_id = t.id
    LEFT JOIN (
      SELECT
        template_id,
        COUNT(*)::int AS version_count, MAX(version_number) AS current_version,
        MAX(created_at) AS last_version_at
      FROM test_template_versions
      GROUP BY template_id
    ) v ON v.template_id = t.id
    WHERE t.archived_at IS NULL
    ORDER BY t.display_order ASC, t.created_at ASC
  `);

  return {
    userRole: user.role,
    templates: rows.rows.map((row) => ({
      ...mapTemplateRow(row),
      versionCount: Number(row.version_count || 0), currentVersion:Number(row.current_version||0),
      lastVersionAt: row.last_version_at || null,
    })),
  };
};

export const listTemplateVersions = async (token: string | null, templateId: string) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Admin/Superadmin moi duoc xem lich su phien ban.');
  }

  const id = String(templateId || '').trim();
  if (!id) throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu templateId.');

  const ownership = await getPool().query(`
    SELECT id, is_system, created_by_user_id
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [id]);
  if (ownership.rows.length === 0) {
    throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay bai test.');
  }

  const template = ownership.rows[0];
  if (user.role === 'admin' && !template.is_system && template.created_by_user_id !== user.id) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Admin chi duoc xem lich su test custom do minh tao.');
  }
  if (user.role === 'admin' && template.is_system) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Admin khong duoc xem lich su test system.');
  }

  const versions = await getPool().query(`
    SELECT
      id,
      template_id,
      version_number,
      action,
      actor_user_id,
      snapshot,
      created_at
    FROM test_template_versions
    WHERE template_id = $1
    ORDER BY version_number DESC
    LIMIT 100
  `, [id]);

  return {
    templateId: id,
    versions: versions.rows.map((row) => ({
      id: row.id,isQa:!!row.is_qa,
      templateId: row.template_id,
      versionNumber: row.version_number,
      action: row.action,
      actorUserId: row.actor_user_id,
      snapshot: row.snapshot,
      createdAt: row.created_at,
    })),
  };
};

async function readTemplate(token:string|null,id:string,management:boolean){
 await initializeTestCore();const user=await getCurrentUser(token),client=await getPool().connect();
 try{await client.query('BEGIN');const row=(await client.query('SELECT * FROM test_templates WHERE id=$1 AND archived_at IS NULL FOR SHARE',[id])).rows[0];
  if(!row)throw new AuthHttpError(404,'TEST_NOT_FOUND','Không tìm thấy bài test.');if(management)assertEditor(user,row);else assertTestAccess(user,row);
  const def=await definitionOf(client,row);await client.query('COMMIT');
  return {template:{...mapTemplateRow(row),questionCount:def.questionList.length,currentVersion:def.currentVersion},definitionDigest:def.definitionDigest,questionList:management?def.questionList:def.questionList.map(q=>({id:q.id,text:q.text,options:q.options.map(o=>({id:o.id,text:o.text}))}))};
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
export const getTestTemplateDetail=(token:string|null,id:string)=>readTemplate(token,id,false);
export const getManageTestTemplateDetail=(token:string|null,id:string)=>readTemplate(token,id,true);
export const submitTestResult=async(token:string|null,payload:unknown)=>{
 await initializeTestCore();const user=await getCurrentUser(token),b=(payload&&typeof payload==='object'?payload:{}) as any;
 const id=String(b.templateId||''),draftId=draftIdentity(b.draftId),digest=digestRequired(b.definitionDigest);
 if(!Number.isInteger(b.revision)||b.revision<0)throw new AuthHttpError(400,'TEST_INVALID','Revision không hợp lệ.');
 const client=await getPool().connect();try{
  await client.query('BEGIN');await client.query('SELECT id FROM auth_users WHERE id=$1 FOR SHARE',[user.id]);await getCurrentUser(token);const row=(await client.query('SELECT * FROM test_templates WHERE id=$1 FOR SHARE',[id])).rows[0];
  // Serialise retry with the same row lock as saving/deleting this user's round.
  const draft=(await client.query('SELECT * FROM legacy_test_drafts WHERE user_id=$1 AND template_id=$2 FOR UPDATE',[user.id,id])).rows[0];
  const prior=(await client.query('SELECT * FROM test_attempts WHERE draft_id=$1 AND user_id=$2 AND template_id=$3',[draftId,user.id,id])).rows[0];
  if(prior){await client.query('COMMIT');return {...receiptOf(prior),replayed:true};}
  assertTestAccess(user,row);const def=await definitionOf(client,row);
  if(digest!==def.definitionDigest||draft?.definition_digest!==digest)throw new AuthHttpError(409,'TEST_VERSION_CHANGED','Bank câu hỏi đã đổi hoặc nháp cũ chưa có version. Xác nhận bắt đầu lại.');
  if(!draft||draft.draft_id!==draftId||draft.revision!==b.revision||draft.submitted_at)throw new AuthHttpError(409,'TEST_DRAFT_CONFLICT','Nháp đã thay đổi hoặc đã nộp ở tab khác.');
  if(new Date(draft.expires_at).getTime()<=Date.now())throw new AuthHttpError(401,'TEST_DRAFT_EXPIRED','Nháp đã hết hạn 24 giờ.');
  const selected=validateSelections(b.answers,def.questionList,true),stored=validateSelections(decryptDraft(draft.answers,validateSessionSecret(),id,`${user.id}:${draftId}`),def.questionList,true);
  if(def.questionList.some(q=>stored[q.id]!==selected[q.id]))throw new AuthHttpError(409,'TEST_DRAFT_CONFLICT','Đáp án cuối chưa được lưu.');
  const context=(await client.query('SELECT s.id AS school_id,s.name AS school,c.id AS class_id,c.name AS class_name,c.academic_year FROM auth_users u JOIN org_schools s ON s.id=u.school_id LEFT JOIN org_classes c ON c.id=u.class_id WHERE u.id=$1',[user.id])).rows[0];
  const scores=def.questionList.map(q=>q.options.find(o=>o.id===stored[q.id])!.score!),scoreData=scoreByTemplate(id,row.template_code,scores),attemptId=`ta-${crypto.randomUUID()}`;
  await client.query('INSERT INTO test_attempts(id,user_id,template_id,user_role,score_total,score_level,score_payload,answers,suggest_dass21,score_version,template_snapshot,draft_id,definition_digest,answer_options,is_qa) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11::jsonb,$12,$13,$14::jsonb,$15)',[attemptId,user.id,id,user.role,scoreData.scoreTotal,scoreData.scoreLevel,JSON.stringify(scoreData.scorePayload),JSON.stringify(scores),scoreData.suggestDass21,LEGACY_SCORE_VERSION,JSON.stringify(def.snapshot),draftId,digest,JSON.stringify(stored),!!user.isQa||!!row.is_qa]);
  if(context)await client.query("UPDATE test_attempts SET context_status='snapshot',context_school_id=$2,context_class_id=$3,context_snapshot=$4::jsonb WHERE id=$1",[attemptId,context.school_id,context.class_id,JSON.stringify({school:context.school,className:context.class_name??'',academicYear:context.academic_year??''})]);
  await client.query("UPDATE legacy_test_drafts SET submitted_at=NOW(),answers='{}'::jsonb WHERE user_id=$1 AND template_id=$2",[user.id,id]);await client.query('COMMIT');return {attemptId,...scoreData};
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};

export const listMyTestResults = async (token: string | null) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);

  const result = await getPool().query(`
    SELECT
      ta.id,
      ta.template_id,
      COALESCE(NULLIF(ta.template_snapshot->>'title',''),tt.title) AS template_title,
      ta.score_total,
      ta.score_level,
      ta.score_payload,
      ta.suggest_dass21,
      ta.submitted_at,ta.context_status,ta.context_snapshot,ta.score_version,ta.is_qa
    FROM test_attempts ta
    JOIN test_templates tt ON tt.id = ta.template_id
    WHERE ta.user_id = $1
    ORDER BY ta.submitted_at DESC
    LIMIT 100
  `, [user.id]);

  return {
    userId: user.id,
    results: result.rows.map((row) => ({
      id: row.id,isQa:!!row.is_qa,
      templateId: row.template_id,contextStatus:row.context_status,contextSnapshot:row.context_snapshot,scoreVersion:row.score_version,
      templateTitle: row.template_title,
      scoreTotal: Number(row.score_total),
      scoreLevel: row.score_level,
      scorePayload: row.score_payload,
      suggestDass21: row.suggest_dass21,
      submittedAt: row.submitted_at,
    })),
  };
};

export const getTestReportsOverview = async (token: string | null, query: unknown) => {
 return snapshotOverview(token,query);
};

export const getTestOpsSummary = async (token: string | null, query: unknown) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Admin/Superadmin moi duoc xem ops summary.');
  }

  const rawQuery = (query && typeof query === 'object') ? query as Record<string, unknown> : {};
  const hours = clampInt(rawQuery.hours, 24, 1, 168);

  const params: unknown[] = [hours];
  const where: string[] = [`ta.submitted_at >= NOW() - ($1::int * INTERVAL '1 hour')`];
  if (user.role === 'admin') {
    params.push(user.profile?.schoolId??null);
    where.push(`ta.context_status='snapshot' AND ta.context_school_id = $${params.length}`);
  }

  try { if(!includeQa(rawQuery.includeQa))where.push('NOT ta.is_qa'); } catch { throw new AuthHttpError(400,'TEST_INVALID','Bộ lọc QA không hợp lệ.'); }
  const baseWhere = where.join(' AND ');
  const totalResult = await getPool().query(`
    SELECT
      COUNT(*)::int AS total_attempts,
      NULL::float8 AS avg_score,
      COUNT(DISTINCT ta.user_id)::int AS unique_users,
      NULL::int AS high_risk_count
    FROM test_attempts ta
    JOIN auth_users u ON u.id = ta.user_id
    WHERE ${baseWhere}
  `, params);

  const timelineResult = await getPool().query(`
    SELECT
      TO_CHAR(date_trunc('minute', ta.submitted_at), 'YYYY-MM-DD\"T\"HH24:MI:00\"Z\"') AS minute_bucket,
      COUNT(*)::int AS request_count,
      NULL::float8 AS avg_score
    FROM test_attempts ta
    JOIN auth_users u ON u.id = ta.user_id
    WHERE ${baseWhere}
    GROUP BY 1
    ORDER BY 1 ASC
  `, params);

  const timeline = timelineResult.rows.map((row) => ({
    minute: row.minute_bucket,
    requestCount: Number(row.request_count || 0),
    avgScore: null,
  }));

  const peakPerMinute = timeline.reduce((max, item) => (item.requestCount > max ? item.requestCount : max), 0);
  const totalAttempts = Number(totalResult.rows[0]?.total_attempts || 0);
  const avgPerMinute = timeline.length > 0 ? Number((totalAttempts / timeline.length).toFixed(2)) : 0;
  const highRiskCount = Number(totalResult.rows[0]?.high_risk_count || 0);

  return {
    hours,
    scope: user.role === 'admin' ? 'school_admin' : 'superadmin',
    summary: {
      totalAttempts,
      uniqueUsers: Number(totalResult.rows[0]?.unique_users || 0),
      avgScore: null,
      highRiskCount: null,
      highRiskRate: null,
      avgPerMinute,
      peakPerMinute,
    },
    timeline,
  };
};

export const createCustomTestTemplate = async(token:string|null,payload:unknown)=>{
 await initializeTestCore();const user=await getCurrentUser(token);if(!['admin','superadmin'].includes(user.role))throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Không có quyền quản trị bài test.');
 const b=(payload&&typeof payload==='object'?payload:{}) as Record<string,unknown>;const title=String(b.title||'').trim();if(!title)throw new AuthHttpError(400,'TEST_INVALID','Thiếu tiêu đề.');const qs=validateQuestionList(b.questionList??[]);const audience=['student','teacher','both'].includes(String(b.targetAudience))?String(b.targetAudience):'both';
 const client=await getPool().connect();try{await client.query('BEGIN');const id=`ct-${crypto.randomUUID()}`;const r=await client.query("INSERT INTO test_templates(id,title,description,target_audience,template_code,is_system,is_active,display_order,created_by_user_id,is_qa) VALUES($1,$2,$3,$4,'CUSTOM',FALSE,FALSE,1000,$5,$6) RETURNING *",[id,title,String(b.description||''),audience,user.id,!!user.isQa]);await replaceQuestions(client,id,qs);if(b.durationMinutes!==undefined||b.iconKey!==undefined||b.colorKey!==undefined){const minutes=b.durationMinutes??null,icon=b.iconKey??'Zap',color=b.colorKey??'primary';if(minutes!==null&&(typeof minutes!=='number'||!Number.isInteger(minutes)||minutes<1||minutes>240)||!TEST_ICONS.includes(icon as any)||!TEST_COLORS.includes(color as any))throw new AuthHttpError(400,'TEST_INVALID','Metadata không hợp lệ.');await client.query('UPDATE test_templates SET duration_minutes=$2,icon_key=$3,color_key=$4 WHERE id=$1',[id,minutes,icon,color]);Object.assign(r.rows[0],{duration_minutes:minutes,icon_key:icon,color_key:color});}await appendVersion(client,r.rows[0],'create',user.id);await client.query('COMMIT');return {template:{...mapTemplateRow(r.rows[0]),questionCount:qs.length,currentVersion:1}};}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};
export const updateCustomTestTemplate=async(token:string|null,id:string,payload:unknown)=>{
 await initializeTestCore();const user=await getCurrentUser(token),b=(payload&&typeof payload==='object'?payload:{}) as any,qs=b.questionList===undefined?undefined:validateQuestionList(b.questionList);
 const client=await getPool().connect();try{
  await client.query('BEGIN');const row=(await client.query('SELECT * FROM test_templates WHERE id=$1 AND archived_at IS NULL FOR UPDATE',[id])).rows[0];if(!row)throw new AuthHttpError(404,'TEST_NOT_FOUND','Không tìm thấy bài test.');assertEditor(user,row);expectedVersion(b.expectedVersion,await currentVersion(client,id));
  if(qs!==undefined&&row.is_system)throw new AuthHttpError(409,'TEST_SYSTEM_DEFINITION_LOCKED','Bank hệ thống giữ nguyên; metadata-only không gửi questionList.');
  const active=typeof b.isActive==='boolean'?b.isActive:row.is_active;
  if(qs?.length===0&&(active||b.confirmEmptyQuestionBank!==true))throw new AuthHttpError(409,'TEST_EMPTY_BANK','Đóng test và xác nhận rõ trước khi xóa hết câu.');
  if(qs!==undefined)await replaceQuestions(client,id,qs);
  const count=Number((await client.query('SELECT COUNT(*)::int AS n FROM test_questions WHERE template_id=$1',[id])).rows[0].n);if(active&&!count)throw new AuthHttpError(409,'TEST_EMPTY_ACTIVE_TEMPLATE','Không mở/giữ active bài chưa có câu hỏi.');
  const audience=['student','teacher','both'].includes(String(b.targetAudience))?b.targetAudience:row.target_audience;
  let updated=(await client.query('UPDATE test_templates SET title=$2,description=$3,target_audience=$4,is_active=$5,updated_at=NOW() WHERE id=$1 RETURNING *',[id,String(b.title??row.title).trim()||row.title,String(b.description??row.description),audience,active])).rows[0];
  if(Object.hasOwn(b,'durationMinutes')||Object.hasOwn(b,'iconKey')||Object.hasOwn(b,'colorKey')){const minutes=Object.hasOwn(b,'durationMinutes')?b.durationMinutes:row.duration_minutes,icon=b.iconKey??row.icon_key,color=b.colorKey??row.color_key;if(minutes!==null&&(typeof minutes!=='number'||!Number.isInteger(minutes)||minutes<1||minutes>240)||!TEST_ICONS.includes(icon)||!TEST_COLORS.includes(color))throw new AuthHttpError(400,'TEST_INVALID','Metadata hiển thị không hợp lệ.');await client.query('UPDATE test_templates SET duration_minutes=$2,icon_key=$3,color_key=$4 WHERE id=$1',[id,minutes,icon,color]);}
  updated=(await client.query('SELECT * FROM test_templates WHERE id=$1',[id])).rows[0];
  await appendVersion(client,updated,row.is_active!==active?(active?'publish':'unpublish'):'update',user.id);const def=await definitionOf(client,updated);await client.query('COMMIT');return {template:{...mapTemplateRow(updated),questionCount:count,currentVersion:def.currentVersion},definitionDigest:def.definitionDigest};
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};
export const deleteCustomTestTemplate=async(token:string|null,id:string,payload:unknown)=>{
 await initializeTestCore();const user=await getCurrentUser(token),b=payload as any,client=await getPool().connect();try{
  await client.query('BEGIN');const row=(await client.query('SELECT * FROM test_templates WHERE id=$1 AND archived_at IS NULL FOR UPDATE',[id])).rows[0];if(!row)throw new AuthHttpError(404,'TEST_NOT_FOUND','Không tìm thấy bài test.');assertEditor(user,row);expectedVersion(b?.expectedVersion,await currentVersion(client,id));
  await appendVersion(client,row,'delete',user.id);await client.query('UPDATE test_templates SET is_active=FALSE,archived_at=NOW() WHERE id=$1',[id]);await client.query('COMMIT');return {id};
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};
export const publishTestTemplate=async(token:string|null,id:string,payload:unknown)=>{const b=payload as any;if(typeof b?.isActive!=='boolean')throw new AuthHttpError(400,'TEST_INVALID','Thiếu trạng thái.');return updateCustomTestTemplate(token,id,{isActive:b.isActive,expectedVersion:b.expectedVersion});};

export const closeTestDatabase = async () => { if (pool) { await pool.end(); pool=null; initialized=false; } };
