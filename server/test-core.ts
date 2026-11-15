import crypto from 'node:crypto';
import {legacyArithmetic,LEGACY_SCORE_VERSION} from './test-scoring/legacy-arithmetic.js';
import {validateQuestionList,replaceQuestions,appendVersion} from './test-template-store.js';
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
  isSystem: row.is_system,
  isActive: row.is_active,
  displayOrder: row.display_order,
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
      t.is_system,
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
      AND t.target_audience = ANY($1::text[])
    ORDER BY t.display_order ASC, t.created_at ASC
  `, [audiences]);

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
      t.is_system,
      t.is_active,
      t.display_order,
      t.created_by_user_id,
      t.created_at,
      t.updated_at,
      COALESCE(q.question_count, 0)::int AS question_count,
      COALESCE(v.version_count, 0) AS version_count,
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
        COUNT(*)::int AS version_count,
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
      versionCount: Number(row.version_count || 0),
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
      id: row.id,
      templateId: row.template_id,
      versionNumber: row.version_number,
      action: row.action,
      actorUserId: row.actor_user_id,
      snapshot: row.snapshot,
      createdAt: row.created_at,
    })),
  };
};

export const getTestTemplateDetail = async (token: string | null, templateId: string) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  const id = String(templateId || '').trim();
  if (!id) {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu templateId.');
  }

  const templateResult = await getPool().query(`
    SELECT id, title, description, target_audience, template_code, is_system, is_active, display_order, created_at, updated_at
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [id]);

  if (templateResult.rows.length === 0) {
    throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay bai test.');
  }

  const template = mapTemplateRow(templateResult.rows[0]);
  if (!template.isActive) {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Bai test dang tam dong.');
  }

  const audiences = getAudiencesByRole(user.role);
  if (!audiences.includes(template.targetAudience)) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Ban khong co quyen truy cap bai test nay.');
  }

  const questionRows = await getPool().query(`
    SELECT
      q.id AS question_id,
      q.question_order,
      q.content,
      q.subscale,
      q.is_reverse,
      o.id AS option_id,
      o.option_order,
      o.label,
      o.score
    FROM test_questions q
    LEFT JOIN test_options o ON o.question_id = q.id
    WHERE q.template_id = $1
    ORDER BY q.question_order ASC, o.option_order ASC
  `, [id]);

  const questionMap = new Map<string, {
    id: string;
    order: number;
    text: string;
    subscale: string;
    isReverse: boolean;
    options: Array<{ id: string; order: number; text: string; score: number }>;
  }>();

  for (const row of questionRows.rows) {
    const questionId = String(row.question_id || '').trim();
    if (!questionId) continue;

    if (!questionMap.has(questionId)) {
      questionMap.set(questionId, {
        id: questionId,
        order: Number(row.question_order || 0),
        text: String(row.content || ''),
        subscale: String(row.subscale || ''),
        isReverse: Boolean(row.is_reverse),
        options: [],
      });
    }

    if (row.option_id) {
      questionMap.get(questionId)?.options.push({
        id: String(row.option_id),
        order: Number(row.option_order || 0),
        text: String(row.label || ''),
        score: Number(row.score || 0),
      });
    }
  }

  const questionList = Array.from(questionMap.values())
    .sort((a, b) => a.order - b.order)
    .map((question) => ({
      id: question.id,
      text: question.text,
      subscale: question.subscale,
      isReverse: question.isReverse,
      options: question.options
        .sort((a, b) => a.order - b.order)
        .map((option) => ({
          id: option.id,
          text: option.text,
          score: option.score,
        })),
    }));

  return {
    template: {
      ...template,
      questionCount: questionList.length,
    },
    questionList,
  };
};

export const submitTestResult = async (token: string | null, payload: unknown) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);

  const body = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};
  const templateId = String(body.templateId || '').trim();
  if (!templateId) {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu templateId.');
  }

  const templateResult = await getPool().query(`
    SELECT id, title, description, target_audience, template_code, is_system, is_active, display_order
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [templateId]);
  if (templateResult.rows.length === 0) {
    throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay bai test.');
  }

  const template = templateResult.rows[0];
  const audiences = getAudiencesByRole(user.role);
  if (!audiences.includes(String(template.target_audience || '') as TestAudience)) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Ban khong co quyen nop bai test nay.');
  }
  if (!template.is_active) {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Bai test dang tam dong.');
  }

  if(!Array.isArray(body.answers)||body.answers.some(value=>typeof value!=='number'||!Number.isFinite(value)))throw new AuthHttpError(400,'TEST_INVALID','Đáp án phải là số hợp lệ, không ép kiểu hay bỏ mất vị trí.');
  const answers=body.answers as number[];
  const allowed=await getPool().query('SELECT q.question_order,array_agg(o.score) AS scores FROM test_questions q JOIN test_options o ON o.question_id=q.id WHERE q.template_id=$1 GROUP BY q.id,q.question_order ORDER BY q.question_order',[templateId]);
  if(!allowed.rows.length||allowed.rows.length!==answers.length||allowed.rows.some((row,index)=>!row.scores.includes(answers[index])))throw new AuthHttpError(400,'TEST_INVALID','Cần đủ câu và đáp án thuộc lựa chọn của template.');
  const scoreData=scoreByTemplate(templateId,String(template.template_code||''),answers);

  const attemptId = `ta-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await getPool().query(`
    INSERT INTO test_attempts (
      id, user_id, template_id, user_role, score_total, score_level, score_payload, answers, suggest_dass21, score_version, template_snapshot
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11::jsonb
    )
  `, [
    attemptId,
    user.id,
    templateId,
    user.role,
    scoreData.scoreTotal,
    scoreData.scoreLevel,
    JSON.stringify(scoreData.scorePayload),
    JSON.stringify(answers),
    scoreData.suggestDass21,
    LEGACY_SCORE_VERSION,JSON.stringify(template),
  ]);

  return {
    attemptId,
    template: mapTemplateRow(template),
    scoreTotal: scoreData.scoreTotal,
    scoreLevel: scoreData.scoreLevel,
    scorePayload: scoreData.scorePayload,
    suggestDass21: scoreData.suggestDass21,
  };
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
      ta.submitted_at
    FROM test_attempts ta
    JOIN test_templates tt ON tt.id = ta.template_id
    WHERE ta.user_id = $1
    ORDER BY ta.submitted_at DESC
    LIMIT 100
  `, [user.id]);

  return {
    userId: user.id,
    results: result.rows.map((row) => ({
      id: row.id,
      templateId: row.template_id,
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
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role === 'student') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Hoc sinh khong co quyen xem bao cao tong hop.');
  }

  const rawQuery = (query && typeof query === 'object') ? query as Record<string, unknown> : {};
  const days = clampInt(rawQuery.days, 30, 7, 365);
  const limit = clampInt(rawQuery.limit, 600, 50, 2000);
  const requestedSchool = String(rawQuery.school || '').trim();
  const requestedClassName = String(rawQuery.className || '').trim();

  const params: unknown[] = [days];
  const where: string[] = [`ta.submitted_at >= NOW() - ($1::int * INTERVAL '1 day')`];
  const pushParam = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  let effectiveSchool = '';
  let effectiveClassName = '';
  let scope = 'global';

  if (user.role === 'superadmin') {
    scope = 'superadmin';
    if (requestedSchool) {
      effectiveSchool = requestedSchool;
      where.push(`u.profile_school = ${pushParam(requestedSchool)}`);
    }
    if (requestedClassName) {
      effectiveClassName = requestedClassName;
      where.push(`u.profile_class_name = ${pushParam(requestedClassName)}`);
    }
  } else if (user.role === 'admin') {
    scope = 'school_admin';
    effectiveSchool = String(user.profile?.school || '').trim();
    where.push(`u.profile_school = ${pushParam(effectiveSchool)}`);
    if (requestedClassName) {
      effectiveClassName = requestedClassName;
      where.push(`u.profile_class_name = ${pushParam(requestedClassName)}`);
    }
  } else {
    const teacherType = String(user.profile?.teacherType || (user.profile?.className ? 'homeroom' : 'subject')).trim();
    const homeroomClass = String(user.profile?.className || '').trim();
    const teacherSchool = String(user.profile?.school || '').trim();

    if (teacherType === 'homeroom' && homeroomClass) {
      scope = 'teacher_homeroom';
      effectiveSchool = teacherSchool;
      effectiveClassName = homeroomClass;
      where.push(`u.role = 'student'`);
      where.push(`u.profile_school = ${pushParam(teacherSchool)}`);
      where.push(`u.profile_class_name = ${pushParam(homeroomClass)}`);
    } else {
      scope = 'teacher_self';
      where.push(`ta.user_id = ${pushParam(user.id)}`);
    }
  }

  const limitRef = pushParam(limit);
  const result = await getPool().query(`
    SELECT
      ta.id,
      ta.user_id,
      ta.user_role,
      ta.template_id,
      COALESCE(NULLIF(ta.template_snapshot->>'title',''),tt.title) AS template_title,
      ta.score_total,
      ta.score_level,
      ta.score_payload,
      ta.suggest_dass21,
      ta.submitted_at,
      u.username,
      u.profile_name,
      u.profile_school,
      u.profile_class_name,
      u.role AS profile_role
    FROM test_attempts ta
    JOIN auth_users u ON u.id = ta.user_id
    JOIN test_templates tt ON tt.id = ta.template_id
    WHERE ${where.join(' AND ')}
    ORDER BY ta.submitted_at DESC
    LIMIT ${limitRef}
  `, params);

  const totals=await getPool().query(`SELECT COUNT(*)::int AS total,COUNT(DISTINCT ta.user_id)::int AS users,COALESCE(AVG(ta.score_total),0)::float8 AS average FROM test_attempts ta JOIN auth_users u ON u.id=ta.user_id JOIN test_templates tt ON tt.id=ta.template_id WHERE ${where.join(' AND ')}`,params.slice(0,-1));
  const attempts = result.rows.map((row) => {
    const scoreTotal = Number(row.score_total || 0);
    const submittedAtIso = new Date(row.submitted_at).toISOString();
    const isHighRisk = null; // No clinical inference from a combined/unreviewed numeric score.

    return {
      attemptId: row.id,
      userId: row.user_id,
      userRole: row.profile_role || row.user_role || '',
      username: row.username || '',
      userName: row.profile_name || row.username || '',
      school: row.profile_school || '',
      className: row.profile_class_name || '',
      templateId: row.template_id,
      templateTitle: row.template_title,
      scoreTotal,
      scoreLevel: row.score_level || '',
      scorePayload: row.score_payload || {},
      suggestDass21: Boolean(row.suggest_dass21),
      submittedAt: submittedAtIso,
      riskLevel: 'unreviewed',
      isHighRisk,
    };
  });

  const uniqueUsers = new Set<string>();
  let totalScore = 0;
  let highRiskCount = 0;

  const byMonthMap = new Map<string, {
    month: string;
    count: number;
    totalScore: number;
    highRiskCount: number;
    studentCount: number;
    teacherCount: number;
    studentScoreTotal: number;
    teacherScoreTotal: number;
  }>();
  const byRoleMap = new Map<string, { role: string; count: number; totalScore: number; highRiskCount: number }>();
  const byTemplateMap = new Map<string, { templateId: string; templateTitle: string; count: number; totalScore: number; highRiskCount: number }>();
  const byClassMap = new Map<string, { className: string; count: number; totalScore: number; highRiskCount: number }>();

  for (const item of attempts) {
    uniqueUsers.add(item.userId);
    totalScore += item.scoreTotal;
    if (item.isHighRisk) highRiskCount += 1;

    const monthKey = item.submittedAt.slice(0, 7);
    const monthEntry = byMonthMap.get(monthKey) || {
      month: monthKey,
      count: 0,
      totalScore: 0,
      highRiskCount: 0,
      studentCount: 0,
      teacherCount: 0,
      studentScoreTotal: 0,
      teacherScoreTotal: 0,
    };
    monthEntry.count += 1;
    monthEntry.totalScore += item.scoreTotal;
    if (item.isHighRisk) monthEntry.highRiskCount += 1;
    if (item.userRole === 'student') {
      monthEntry.studentCount += 1;
      monthEntry.studentScoreTotal += item.scoreTotal;
    } else if (item.userRole === 'teacher') {
      monthEntry.teacherCount += 1;
      monthEntry.teacherScoreTotal += item.scoreTotal;
    }
    byMonthMap.set(monthKey, monthEntry);

    const roleKey = String(item.userRole || 'unknown');
    const roleEntry = byRoleMap.get(roleKey) || { role: roleKey, count: 0, totalScore: 0, highRiskCount: 0 };
    roleEntry.count += 1;
    roleEntry.totalScore += item.scoreTotal;
    if (item.isHighRisk) roleEntry.highRiskCount += 1;
    byRoleMap.set(roleKey, roleEntry);

    const templateKey = `${item.templateId}::${item.templateTitle}`;
    const templateEntry = byTemplateMap.get(templateKey) || {
      templateId: item.templateId,
      templateTitle: item.templateTitle,
      count: 0,
      totalScore: 0,
      highRiskCount: 0,
    };
    templateEntry.count += 1;
    templateEntry.totalScore += item.scoreTotal;
    if (item.isHighRisk) templateEntry.highRiskCount += 1;
    byTemplateMap.set(templateKey, templateEntry);

    if (item.className) {
      const classEntry = byClassMap.get(item.className) || {
        className: item.className,
        count: 0,
        totalScore: 0,
        highRiskCount: 0,
      };
      classEntry.count += 1;
      classEntry.totalScore += item.scoreTotal;
      if (item.isHighRisk) classEntry.highRiskCount += 1;
      byClassMap.set(item.className, classEntry);
    }
  }

  const sortByMonthAsc = (a: { month: string }, b: { month: string }) => a.month.localeCompare(b.month);
  const byMonth = Array.from(byMonthMap.values())
    .sort(sortByMonthAsc)
    .map((entry) => ({
      month: entry.month,
      count: entry.count,
      avgScore: entry.count > 0 ? Number((entry.totalScore / entry.count).toFixed(2)) : 0,
      highRiskCount: entry.highRiskCount,
      studentCount: entry.studentCount,
      teacherCount: entry.teacherCount,
      studentAvgScore: entry.studentCount > 0 ? Number((entry.studentScoreTotal / entry.studentCount).toFixed(2)) : 0,
      teacherAvgScore: entry.teacherCount > 0 ? Number((entry.teacherScoreTotal / entry.teacherCount).toFixed(2)) : 0,
    }));

  const byRole = Array.from(byRoleMap.values())
    .map((entry) => ({
      role: entry.role,
      count: entry.count,
      avgScore: entry.count > 0 ? Number((entry.totalScore / entry.count).toFixed(2)) : 0,
      highRiskCount: entry.highRiskCount,
    }))
    .sort((a, b) => b.count - a.count);

  const byTemplate = Array.from(byTemplateMap.values())
    .map((entry) => ({
      templateId: entry.templateId,
      templateTitle: entry.templateTitle,
      count: entry.count,
      avgScore: entry.count > 0 ? Number((entry.totalScore / entry.count).toFixed(2)) : 0,
      highRiskCount: entry.highRiskCount,
    }))
    .sort((a, b) => b.count - a.count);

  const byClass = Array.from(byClassMap.values())
    .map((entry) => ({
      className: entry.className,
      count: entry.count,
      avgScore: entry.count > 0 ? Number((entry.totalScore / entry.count).toFixed(2)) : 0,
      highRiskCount: entry.highRiskCount,
    }))
    .sort((a, b) => b.highRiskCount - a.highRiskCount || b.count - a.count);

  const recentRiskAlerts = attempts
    .filter((item) => item.isHighRisk)
    .slice(0, 8)
    .map((item) => ({
      attemptId: item.attemptId,
      userId: item.userId,
      userName: item.userName,
      username: item.username,
      role: item.userRole,
      school: item.school,
      className: item.className,
      templateTitle: item.templateTitle,
      scoreTotal: item.scoreTotal,
      scoreLevel: item.scoreLevel,
      submittedAt: item.submittedAt,
    }));

  const schoolOptions = Array.from(new Set(attempts.map((item) => item.school).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const classOptions = Array.from(new Set(attempts.map((item) => item.className).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const scopeParams=params.slice(0,-1),scopeWhere=where.join(' AND ');
  const joins='FROM test_attempts ta JOIN auth_users u ON u.id=ta.user_id JOIN test_templates tt ON tt.id=ta.template_id';
  const [months,roles,templates,classes]=await Promise.all([
   getPool().query(`SELECT TO_CHAR(ta.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM') AS month,COUNT(*)::int AS count,AVG(ta.score_total)::float8 AS average,COUNT(*) FILTER(WHERE u.role='student')::int AS students,COUNT(*) FILTER(WHERE u.role='teacher')::int AS teachers,COALESCE(AVG(ta.score_total) FILTER(WHERE u.role='student'),0)::float8 AS student_average,COALESCE(AVG(ta.score_total) FILTER(WHERE u.role='teacher'),0)::float8 AS teacher_average ${joins} WHERE ${scopeWhere} GROUP BY 1 ORDER BY 1`,scopeParams),
   getPool().query(`SELECT u.role,COUNT(*)::int AS count,AVG(ta.score_total)::float8 AS average ${joins} WHERE ${scopeWhere} GROUP BY u.role`,scopeParams),
   getPool().query(`SELECT tt.id,tt.title,COUNT(*)::int AS count,AVG(ta.score_total)::float8 AS average ${joins} WHERE ${scopeWhere} GROUP BY tt.id,tt.title`,scopeParams),
   getPool().query(`SELECT u.profile_school,u.profile_class_name,COUNT(*)::int AS count,AVG(ta.score_total)::float8 AS average ${joins} WHERE ${scopeWhere} GROUP BY u.profile_school,u.profile_class_name`,scopeParams),
  ]);
  return {
    scope,
    filters: {
      days,
      school: effectiveSchool,
      className: effectiveClassName,
      limit,
    },
    summary: {
      totalAttempts: totals.rows[0].total,
      uniqueUsers: totals.rows[0].users,
      avgScore: Number(Number(totals.rows[0].average).toFixed(2)),
      highRiskCount: null,
      highRiskRate: null,
    },
    byMonth:months.rows.map(r=>({month:r.month,count:r.count,avgScore:Number(r.average.toFixed(2)),highRiskCount:null,studentCount:r.students,teacherCount:r.teachers,studentAvgScore:Number(r.student_average.toFixed(2)),teacherAvgScore:Number(r.teacher_average.toFixed(2))})),
    byRole:roles.rows.map(r=>({role:r.role,count:r.count,avgScore:Number(r.average.toFixed(2)),highRiskCount:null})),
    byTemplate:templates.rows.map(r=>({templateId:r.id,templateTitle:r.title,count:r.count,avgScore:Number(r.average.toFixed(2)),highRiskCount:null})),
    byClass:classes.rows.map(r=>({className:`${r.profile_school} · ${r.profile_class_name}`,count:r.count,avgScore:Number(r.average.toFixed(2)),highRiskCount:null})),
    classificationPending:true,
    recentRiskAlerts,
    schoolOptions,
    classOptions,
    attempts,
  };
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
    params.push(String(user.profile?.school || '').trim());
    where.push(`u.profile_school = $${params.length}`);
  }

  const baseWhere = where.join(' AND ');
  const totalResult = await getPool().query(`
    SELECT
      COUNT(*)::int AS total_attempts,
      COALESCE(AVG(ta.score_total), 0)::float8 AS avg_score,
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
      COALESCE(AVG(ta.score_total), 0)::float8 AS avg_score
    FROM test_attempts ta
    JOIN auth_users u ON u.id = ta.user_id
    WHERE ${baseWhere}
    GROUP BY 1
    ORDER BY 1 ASC
  `, params);

  const timeline = timelineResult.rows.map((row) => ({
    minute: row.minute_bucket,
    requestCount: Number(row.request_count || 0),
    avgScore: Number(Number(row.avg_score || 0).toFixed(2)),
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
      avgScore: Number(Number(totalResult.rows[0]?.avg_score || 0).toFixed(2)),
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
 const client=await getPool().connect();try{await client.query('BEGIN');const id=`ct-${crypto.randomUUID()}`;const r=await client.query("INSERT INTO test_templates(id,title,description,target_audience,template_code,is_system,is_active,display_order,created_by_user_id) VALUES($1,$2,$3,$4,'CUSTOM',FALSE,FALSE,1000,$5) RETURNING *",[id,title,String(b.description||''),audience,user.id]);await replaceQuestions(client,id,qs);await appendVersion(client,r.rows[0],'create',user.id);await client.query('COMMIT');return {template:{...mapTemplateRow(r.rows[0]),questionCount:qs.length}};}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};
export const updateCustomTestTemplate = async(token:string|null,id:string,payload:unknown)=>{
 await initializeTestCore();const user=await getCurrentUser(token);if(!['admin','superadmin'].includes(user.role))throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Không có quyền quản trị bài test.');
 const b=(payload&&typeof payload==='object'?payload:{}) as Record<string,unknown>;const qs=b.questionList===undefined?undefined:validateQuestionList(b.questionList);
 const client=await getPool().connect();try{await client.query('BEGIN');const selected=await client.query('SELECT * FROM test_templates WHERE id=$1 AND archived_at IS NULL FOR UPDATE',[id]);const row=selected.rows[0];if(!row)throw new AuthHttpError(404,'TEST_INVALID','Không tìm thấy bài test.');ensureTemplateWritePermission(user.role,row.is_system);if(user.role==='admin'&&row.created_by_user_id!==user.id)throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Chỉ sửa test custom do mình tạo.');
 if(qs&&row.is_system)throw new AuthHttpError(409,'TEST_SYSTEM_DEFINITION_LOCKED','Bank câu hỏi hệ thống giữ nguyên phiên bản; cần quy trình duyệt definition mới.');
 if(qs)await replaceQuestions(client,id,qs);
 const count=await client.query('SELECT COUNT(*)::int AS n FROM test_questions WHERE template_id=$1',[id]);if(b.isActive===true&&!count.rows[0].n)throw new AuthHttpError(400,'TEST_INVALID','Không mở bài chưa có câu hỏi.');
 const audience=['student','teacher','both'].includes(String(b.targetAudience))?b.targetAudience:row.target_audience;
 const r=await client.query('UPDATE test_templates SET title=$2,description=$3,target_audience=$4,is_active=$5,updated_at=NOW() WHERE id=$1 RETURNING *',[id,String(b.title??row.title).trim()||row.title,String(b.description??row.description),audience,typeof b.isActive==='boolean'?b.isActive:row.is_active]);
 await appendVersion(client,r.rows[0],typeof b.isActive==='boolean'&&row.is_active!==b.isActive?(b.isActive?'publish':'unpublish'):'update',user.id);await client.query('COMMIT');return {template:{...mapTemplateRow(r.rows[0]),questionCount:count.rows[0].n}};}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};
export const deleteCustomTestTemplate = async(token:string|null,id:string)=>{
 await initializeTestCore();const user=await getCurrentUser(token);if(!['admin','superadmin'].includes(user.role))throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Không có quyền quản trị bài test.');const client=await getPool().connect();try{await client.query('BEGIN');const r=await client.query('SELECT * FROM test_templates WHERE id=$1 AND archived_at IS NULL FOR UPDATE',[id]);const row=r.rows[0];if(!row)throw new AuthHttpError(404,'TEST_INVALID','Không tìm thấy bài test.');ensureTemplateWritePermission(user.role,row.is_system);if(user.role==='admin'&&row.created_by_user_id!==user.id)throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Không có quyền với test của người khác.');await appendVersion(client,row,'delete',user.id);await client.query('UPDATE test_templates SET is_active=FALSE,archived_at=NOW() WHERE id=$1',[id]);await client.query('COMMIT');return {id};}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
};
export const publishTestTemplate = async(token:string|null,id:string,payload:unknown)=>{const b=payload as any;if(typeof b?.isActive!=='boolean')throw new AuthHttpError(400,'TEST_INVALID','Thiếu trạng thái.');return updateCustomTestTemplate(token,id,{isActive:b.isActive});};

export const closeTestDatabase = async () => { if (pool) { await pool.end(); pool=null; initialized=false; } };
