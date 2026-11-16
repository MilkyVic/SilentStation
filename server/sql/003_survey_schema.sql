-- Additive survey schema. No account linkage in anonymous sessions/responses.
CREATE TABLE IF NOT EXISTS survey_definitions (
 version TEXT PRIMARY KEY, definition JSONB NOT NULL, score_version TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS survey_campaigns (
 id UUID PRIMARY KEY, code TEXT UNIQUE NOT NULL, title TEXT NOT NULL, school TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('draft','open','closed')) DEFAULT 'draft', is_demo BOOLEAN NOT NULL DEFAULT FALSE,
 definition_version TEXT NOT NULL REFERENCES survey_definitions(version), consent_version TEXT NOT NULL,
 scoring_approved BOOLEAN NOT NULL DEFAULT FALSE, policy_approved BOOLEAN NOT NULL DEFAULT FALSE,
 approval_reference TEXT NOT NULL DEFAULT '', retention_days INTEGER CHECK(retention_days BETWEEN 1 AND 3650),
 created_by TEXT NOT NULL REFERENCES auth_users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS survey_sessions (
 id UUID PRIMARY KEY, campaign_id UUID NOT NULL REFERENCES survey_campaigns(id), token_hash TEXT UNIQUE NOT NULL,
 expires_at TIMESTAMPTZ NOT NULL, answers JSONB NOT NULL DEFAULT '{}', reviewed_sections JSONB NOT NULL DEFAULT '[]',
 revision INTEGER NOT NULL DEFAULT 0, submitted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS survey_responses (
 id UUID PRIMARY KEY, campaign_id UUID NOT NULL REFERENCES survey_campaigns(id), session_id UUID UNIQUE NOT NULL REFERENCES survey_sessions(id),
 definition_version TEXT NOT NULL, score_version TEXT NOT NULL, consent_version TEXT NOT NULL,
 answers JSONB NOT NULL, reviewed_sections JSONB NOT NULL, scores JSONB NOT NULL,
 idempotency_key TEXT NOT NULL, submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), retention_until TIMESTAMPTZ,
 UNIQUE(campaign_id,session_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS survey_grants (
 campaign_id UUID NOT NULL REFERENCES survey_campaigns(id), user_id TEXT NOT NULL REFERENCES auth_users(id),
 read_raw BOOLEAN NOT NULL DEFAULT FALSE, can_export BOOLEAN NOT NULL DEFAULT FALSE, PRIMARY KEY(campaign_id,user_id)
);
CREATE TABLE IF NOT EXISTS survey_audit (
 id UUID PRIMARY KEY, campaign_id UUID REFERENCES survey_campaigns(id), actor_id TEXT NOT NULL,
 action TEXT NOT NULL, object_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS survey_rate_limits (
 bucket TEXT NOT NULL, minute TIMESTAMPTZ NOT NULL, requests INTEGER NOT NULL, PRIMARY KEY(bucket,minute)
);
CREATE INDEX IF NOT EXISTS survey_session_expiry ON survey_sessions(expires_at);
CREATE INDEX IF NOT EXISTS survey_response_campaign_time ON survey_responses(campaign_id,submitted_at DESC,id);
