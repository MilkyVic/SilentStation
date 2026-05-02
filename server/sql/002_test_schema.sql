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
