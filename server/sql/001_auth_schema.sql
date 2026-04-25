-- Auth schema for PostgreSQL
-- Apply this file manually if you want explicit SQL migration control.

CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'superadmin')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'suspended')),
  profile_name TEXT NOT NULL DEFAULT '',
  profile_email TEXT NOT NULL DEFAULT '',
  profile_birth_year TEXT NOT NULL DEFAULT '',
  profile_gender TEXT NOT NULL DEFAULT '',
  profile_school TEXT NOT NULL DEFAULT '',
  profile_class_name TEXT NOT NULL DEFAULT '',
  profile_teacher_type TEXT NOT NULL DEFAULT '' CHECK (profile_teacher_type IN ('', 'homeroom', 'subject')),
  profile_subject TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS profile_teacher_type TEXT NOT NULL DEFAULT '' CHECK (profile_teacher_type IN ('', 'homeroom', 'subject'));

ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS profile_subject TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users (username);

CREATE TABLE IF NOT EXISTS auth_sessions (
  jti TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  exp_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_exp_at ON auth_sessions (exp_at);

