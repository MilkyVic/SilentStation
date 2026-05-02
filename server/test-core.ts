import crypto from 'node:crypto';
import { Pool } from 'pg';
import { AuthHttpError, getCurrentUser, initializeAuthCore } from './auth-core.js';
import { scoreDass21, scoreGad7, scorePhq9, shouldSuggestDass21ByCoreTest } from './test-scoring/engine.js';
import { SYSTEM_TEMPLATE_QUESTIONS, type SeedQuestion } from './test-question-bank.js';

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

const getPool = () => {
  if (!DATABASE_URL) {
    throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'Thieu bien moi truong DATABASE_URL.');
  }
  if (pool) return pool;
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  return pool;
};

const testSchemaSql = `
CREATE TABLE IF NOT EXISTS test_templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_audience TEXT NOT NULL CHECK (target_audience IN ('student', 'teacher', 'both')),
  template_code TEXT NOT NULL DEFAULT 'CUSTOM',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 100,
  created_by_user_id TEXT NULL REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_templates_active ON test_templates (is_active, display_order);

CREATE TABLE IF NOT EXISTS test_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES test_templates(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'teacher', 'admin', 'superadmin')),
  score_total INTEGER NOT NULL DEFAULT 0,
  score_level TEXT NOT NULL DEFAULT '',
  score_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggest_dass21 BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_time ON test_attempts (user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_attempts_template_time ON test_attempts (template_id, submitted_at DESC);

CREATE TABLE IF NOT EXISTS test_questions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES test_templates(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL CHECK (question_order > 0),
  content TEXT NOT NULL,
  subscale TEXT NOT NULL DEFAULT '',
  is_reverse BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_test_questions_template_order ON test_questions (template_id, question_order);

CREATE TABLE IF NOT EXISTS test_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  option_order INTEGER NOT NULL CHECK (option_order > 0),
  label TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, option_order)
);

CREATE INDEX IF NOT EXISTS idx_test_options_question_order ON test_options (question_id, option_order);

CREATE TABLE IF NOT EXISTS test_template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'publish', 'unpublish', 'delete')),
  actor_user_id TEXT NULL REFERENCES auth_users(id) ON DELETE SET NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_test_template_versions_template ON test_template_versions (template_id, version_number DESC);
`;

const CORE_TEMPLATES: TestTemplate[] = [
  {
    id: '1',
    title: 'Bai test PHQ-9',
    description: 'Danh gia muc do tram cam.',
    targetAudience: 'student',
    templateCode: 'PHQ9',
    isSystem: true,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: '2',
    title: 'Bai test GAD-7',
    description: 'Danh gia muc do lo au.',
    targetAudience: 'student',
    templateCode: 'GAD7',
    isSystem: true,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: '3',
    title: 'Bai test SDQ-25',
    description: 'Bang hoi diem manh va diem yeu.',
    targetAudience: 'student',
    templateCode: 'SDQ25',
    isSystem: true,
    isActive: true,
    displayOrder: 3,
  },
  {
    id: '4',
    title: 'Bai test Moi truong hoc duong',
    description: 'Danh gia moi truong hoc duong than thien suc khoe tam than.',
    targetAudience: 'student',
    templateCode: 'MT',
    isSystem: true,
    isActive: true,
    displayOrder: 4,
  },
  {
    id: '5',
    title: 'Bai test DASS-21',
    description: 'Danh gia muc do stress, lo au, tram cam.',
    targetAudience: 'both',
    templateCode: 'DASS21',
    isSystem: true,
    isActive: true,
    displayOrder: 5,
  },
  {
    id: '6',
    title: 'Bai test MBI-22',
    description: 'Danh gia kiet suc nghe nghiep cho giao vien.',
    targetAudience: 'teacher',
    templateCode: 'MBI22',
    isSystem: true,
    isActive: true,
    displayOrder: 6,
  },
];

const buildSeedQuestionId = (templateId: string, order: number) => `${templateId}-q${order}`;
const buildSeedOptionId = (questionId: string, order: number) => `${questionId}-o${order}`;

const seedTemplateQuestions = async (templateId: string, questions: SeedQuestion[]) => {
  const usedQuestionIds: string[] = [];
  const usedOptionIds: string[] = [];

  for (const item of questions) {
    const questionId = buildSeedQuestionId(templateId, item.order);
    usedQuestionIds.push(questionId);

    await getPool().query(`
      INSERT INTO test_questions (
        id, template_id, question_order, content, subscale, is_reverse
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      ON CONFLICT (id) DO UPDATE SET
        template_id = EXCLUDED.template_id,
        question_order = EXCLUDED.question_order,
        content = EXCLUDED.content,
        subscale = EXCLUDED.subscale,
        is_reverse = EXCLUDED.is_reverse,
        updated_at = NOW()
    `, [
      questionId,
      templateId,
      item.order,
      item.text,
      item.subscale || '',
      Boolean(item.isReverse),
    ]);

    for (const option of item.options) {
      const optionId = buildSeedOptionId(questionId, option.order);
      usedOptionIds.push(optionId);

      await getPool().query(`
        INSERT INTO test_options (
          id, question_id, option_order, label, score
        ) VALUES (
          $1, $2, $3, $4, $5
        )
        ON CONFLICT (id) DO UPDATE SET
          question_id = EXCLUDED.question_id,
          option_order = EXCLUDED.option_order,
          label = EXCLUDED.label,
          score = EXCLUDED.score,
          updated_at = NOW()
      `, [
        optionId,
        questionId,
        option.order,
        option.label,
        option.score,
      ]);
    }
  }

  await getPool().query(`
    DELETE FROM test_options o
    USING test_questions q
    WHERE o.question_id = q.id
      AND q.template_id = $1
      AND NOT (o.id = ANY($2::text[]))
  `, [templateId, usedOptionIds]);

  await getPool().query(`
    DELETE FROM test_questions
    WHERE template_id = $1
      AND NOT (id = ANY($2::text[]))
  `, [templateId, usedQuestionIds]);
};

const seedSystemTemplateQuestions = async () => {
  for (const template of CORE_TEMPLATES) {
    if (!template.isSystem) continue;
    const questions = SYSTEM_TEMPLATE_QUESTIONS[template.id];
    if (!questions || questions.length === 0) continue;
    await seedTemplateQuestions(template.id, questions);
  }
};

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

const scoreByTemplate = (templateId: string, templateCode: string, answers: number[], fallbackScore?: number) => {
  const code = String(templateCode || '').toUpperCase();

  if (code === 'PHQ9') {
    if (!answers.length) throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'PHQ-9 can du dap an de cham diem.');
    const result = scorePhq9(answers);
    return {
      scoreTotal: result.total,
      scoreLevel: result.level,
      scorePayload: result,
      suggestDass21: shouldSuggestDass21ByCoreTest(templateId, result.total),
    };
  }

  if (code === 'GAD7') {
    if (!answers.length) throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'GAD-7 can du dap an de cham diem.');
    const result = scoreGad7(answers);
    return {
      scoreTotal: result.total,
      scoreLevel: result.level,
      scorePayload: result,
      suggestDass21: shouldSuggestDass21ByCoreTest(templateId, result.total),
    };
  }

  if (code === 'DASS21') {
    if (!answers.length) throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'DASS-21 can du dap an de cham diem.');
    const result = scoreDass21(answers);
    return {
      scoreTotal: result.stress.score + result.anxiety.score + result.depression.score,
      scoreLevel: 'Đã chấm 3 thang',
      scorePayload: result,
      suggestDass21: false,
    };
  }

  const scoreTotal = Number.isFinite(Number(fallbackScore)) ? Number(fallbackScore) : answers.reduce((sum, value) => sum + value, 0);
  return {
    scoreTotal,
    scoreLevel: 'Đã hoàn thành',
    scorePayload: { total: scoreTotal },
    suggestDass21: shouldSuggestDass21ByCoreTest(templateId, scoreTotal),
  };
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
  if (initialized) return;

  await initializeAuthCore();
  await getPool().query(testSchemaSql);

  for (const template of CORE_TEMPLATES) {
    await getPool().query(`
      INSERT INTO test_templates (
        id, title, description, target_audience, template_code, is_system, is_active, display_order
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        target_audience = EXCLUDED.target_audience,
        template_code = EXCLUDED.template_code,
        is_system = EXCLUDED.is_system,
        is_active = EXCLUDED.is_active,
        display_order = EXCLUDED.display_order,
        updated_at = NOW()
    `, [
      template.id,
      template.title,
      template.description,
      template.targetAudience,
      template.templateCode,
      template.isSystem,
      template.isActive,
      template.displayOrder,
    ]);
  }

  await seedSystemTemplateQuestions();

  initialized = true;
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
    WHERE t.is_active = TRUE
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

  const answers = sanitizeAnswers(body.answers);
  const scoreData = scoreByTemplate(
    templateId,
    String(template.template_code || ''),
    answers,
    Number(body.score),
  );

  const attemptId = `ta-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await getPool().query(`
    INSERT INTO test_attempts (
      id, user_id, template_id, user_role, score_total, score_level, score_payload, answers, suggest_dass21
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9
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
      tt.title AS template_title,
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
      scoreTotal: row.score_total,
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
      tt.title AS template_title,
      ta.score_total,
      ta.score_level,
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

  const attempts = result.rows.map((row) => {
    const scoreTotal = Number(row.score_total || 0);
    const submittedAtIso = new Date(row.submitted_at).toISOString();
    const isHighRisk = scoreTotal >= 10 || Boolean(row.suggest_dass21);

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
      suggestDass21: Boolean(row.suggest_dass21),
      submittedAt: submittedAtIso,
      riskLevel: isHighRisk ? 'high' : (scoreTotal >= 5 ? 'medium' : 'low'),
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

  return {
    scope,
    filters: {
      days,
      school: effectiveSchool,
      className: effectiveClassName,
      limit,
    },
    summary: {
      totalAttempts: attempts.length,
      uniqueUsers: uniqueUsers.size,
      avgScore: attempts.length > 0 ? Number((totalScore / attempts.length).toFixed(2)) : 0,
      highRiskCount,
      highRiskRate: attempts.length > 0 ? Number(((highRiskCount / attempts.length) * 100).toFixed(2)) : 0,
    },
    byMonth,
    byRole,
    byTemplate,
    byClass,
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
      SUM(CASE WHEN ta.suggest_dass21 = TRUE OR ta.score_total >= 10 THEN 1 ELSE 0 END)::int AS high_risk_count
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
      highRiskCount,
      highRiskRate: totalAttempts > 0 ? Number(((highRiskCount / totalAttempts) * 100).toFixed(2)) : 0,
      avgPerMinute,
      peakPerMinute,
    },
    timeline,
  };
};

export const createCustomTestTemplate = async (token: string | null, payload: unknown) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Admin/Superadmin moi duoc tao bai test.');
  }

  const body = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};
  const title = String(body.title || '').trim();
  if (!title) throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu tieu de bai test.');
  const description = String(body.description || '').trim();
  const audienceRaw = String(body.targetAudience || 'both').trim().toLowerCase();
  const targetAudience: TestAudience = audienceRaw === 'student' || audienceRaw === 'teacher' || audienceRaw === 'both'
    ? audienceRaw
    : 'both';

  const templateId = `ct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await getPool().query(`
    INSERT INTO test_templates (
      id, title, description, target_audience, template_code, is_system, is_active, display_order, created_by_user_id
    ) VALUES (
      $1, $2, $3, $4, 'CUSTOM', FALSE, TRUE, 1000, $5
    )
  `, [templateId, title, description, targetAudience, user.id]);

  const created = await getPool().query(`
    SELECT id, title, description, target_audience, template_code, is_system, is_active, display_order, created_by_user_id, created_at, updated_at
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [templateId]);

  await appendTemplateVersion(created.rows[0], 'create', user.id);
  return { template: mapTemplateRow(created.rows[0]) };
};

export const updateCustomTestTemplate = async (token: string | null, templateId: string, payload: unknown) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Admin/Superadmin moi duoc sua bai test.');
  }

  const existing = await getPool().query(`
    SELECT id, title, description, target_audience, template_code, is_system, is_active, display_order, created_by_user_id, created_at, updated_at
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [templateId]);
  if (existing.rows.length === 0) throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay bai test.');

  const row = existing.rows[0];
  ensureTemplateWritePermission(user.role, row.is_system);
  if (user.role === 'admin' && row.created_by_user_id !== user.id) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Admin chi duoc sua test custom do minh tao.');
  }

  const body = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const audienceRaw = String(body.targetAudience || '').trim().toLowerCase();
  const targetAudience = audienceRaw === 'student' || audienceRaw === 'teacher' || audienceRaw === 'both'
    ? audienceRaw
    : null;
  const nextIsActive = typeof body.isActive === 'boolean' ? body.isActive : null;

  await getPool().query(`
    UPDATE test_templates
    SET
      title = COALESCE(NULLIF($2, ''), title),
      description = COALESCE(NULLIF($3, ''), description),
      target_audience = COALESCE($4, target_audience),
      is_active = COALESCE($5, is_active),
      updated_at = NOW()
    WHERE id = $1
  `, [templateId, title, description, targetAudience, nextIsActive]);

  const updated = await getPool().query(`
    SELECT id, title, description, target_audience, template_code, is_system, is_active, display_order, created_by_user_id, created_at, updated_at
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [templateId]);

  const beforeActive = Boolean(row.is_active);
  const afterActive = Boolean(updated.rows[0].is_active);
  const action: TemplateVersionAction = beforeActive !== afterActive
    ? (afterActive ? 'publish' : 'unpublish')
    : 'update';
  await appendTemplateVersion(updated.rows[0], action, user.id);
  return { template: mapTemplateRow(updated.rows[0]) };
};

export const deleteCustomTestTemplate = async (token: string | null, templateId: string) => {
  await initializeTestCore();
  const user = await getCurrentUser(token);
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Admin/Superadmin moi duoc xoa bai test.');
  }

  const existing = await getPool().query(`
    SELECT id, title, description, target_audience, template_code, is_system, is_active, display_order, created_by_user_id, created_at, updated_at
    FROM test_templates
    WHERE id = $1
    LIMIT 1
  `, [templateId]);
  if (existing.rows.length === 0) throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay bai test.');

  const row = existing.rows[0];
  ensureTemplateWritePermission(user.role, row.is_system);
  if (user.role === 'admin' && row.created_by_user_id !== user.id) {
    throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Admin chi duoc xoa test custom do minh tao.');
  }

  await appendTemplateVersion(row, 'delete', user.id);
  await getPool().query(`
    DELETE FROM test_templates
    WHERE id = $1
  `, [templateId]);

  return { id: templateId };
};

export const publishTestTemplate = async (token: string | null, templateId: string, payload: unknown) => {
  const body = (payload && typeof payload === 'object') ? payload as Record<string, unknown> : {};
  if (typeof body.isActive !== 'boolean') {
    throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu trang thai isActive.');
  }
  return updateCustomTestTemplate(token, templateId, { isActive: body.isActive });
};

