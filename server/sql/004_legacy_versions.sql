-- Preserve all stored historical scores. New submissions capture provenance only.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM test_attempts WHERE score_total::numeric < -99999999.99 OR score_total::numeric > 99999999.99) THEN
  RAISE EXCEPTION 'Stored score outside the new numeric domain; manual review required';
 END IF;
END $$;
ALTER TABLE test_attempts ALTER COLUMN score_total TYPE NUMERIC(10,2);
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS score_version TEXT NOT NULL DEFAULT 'legacy-unversioned';
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS template_snapshot JSONB NOT NULL DEFAULT '{}';
ALTER TABLE test_templates ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS legacy_test_drafts (
 user_id TEXT NOT NULL REFERENCES auth_users(id), template_id TEXT NOT NULL REFERENCES test_templates(id),
 answers JSONB NOT NULL DEFAULT '{}', revision INTEGER NOT NULL DEFAULT 0, expires_at TIMESTAMPTZ NOT NULL,
 PRIMARY KEY(user_id,template_id)
);
