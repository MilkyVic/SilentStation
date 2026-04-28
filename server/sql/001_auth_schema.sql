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


CREATE TABLE IF NOT EXISTS class_join_codes (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  school TEXT NOT NULL DEFAULT '',
  class_name TEXT NOT NULL DEFAULT '',
  code_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 60 CHECK (max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_join_codes_teacher ON class_join_codes (teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_join_codes_status_expires ON class_join_codes (status, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_class_join_codes_active_teacher_class
  ON class_join_codes (teacher_id, class_name)
  WHERE status = 'active';


CREATE TABLE IF NOT EXISTS class_join_code_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'revoked', 'redeem_success', 'redeem_failed')),
  actor_user_id TEXT NULL REFERENCES auth_users(id) ON DELETE SET NULL,
  teacher_id TEXT NULL REFERENCES auth_users(id) ON DELETE SET NULL,
  class_join_code_id TEXT NULL REFERENCES class_join_codes(id) ON DELETE SET NULL,
  class_name TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  student_username TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_class_join_code_events_created_at ON class_join_code_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_class_join_code_events_teacher ON class_join_code_events (teacher_id);

CREATE TABLE IF NOT EXISTS auth_register_otps (
  id TEXT PRIMARY KEY,
  purpose TEXT NOT NULL CHECK (purpose IN ('register_student', 'register_teacher')),
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  request_fingerprint TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  resend_available_at TIMESTAMPTZ NOT NULL,
  attempts_left INTEGER NOT NULL DEFAULT 5 CHECK (attempts_left >= 0),
  consumed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_register_otps_lookup
  ON auth_register_otps (username, role, consumed_at, expires_at DESC);
