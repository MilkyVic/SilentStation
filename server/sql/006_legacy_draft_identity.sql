-- Add provenance only. Historical answers, labels and scores remain untouched.
ALTER TABLE legacy_test_drafts ADD COLUMN IF NOT EXISTS draft_id UUID;
ALTER TABLE legacy_test_drafts ADD COLUMN IF NOT EXISTS definition_digest TEXT;
ALTER TABLE legacy_test_drafts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS legacy_draft_identity ON legacy_test_drafts(draft_id) WHERE draft_id IS NOT NULL;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS draft_id UUID;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS definition_digest TEXT;
ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS answer_options JSONB;
-- Not a FK to a mutable/erasable draft; attempts retain immutable provenance.
CREATE UNIQUE INDEX IF NOT EXISTS test_attempt_one_per_draft ON test_attempts(draft_id) WHERE draft_id IS NOT NULL;
