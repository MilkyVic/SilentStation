-- New QA provenance only. Existing accounts/templates/results remain non-QA;
-- never infer historical provenance from a current profile or school.
ALTER TABLE auth_users ADD COLUMN is_qa BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN qa_access_expires_at TIMESTAMPTZ,
 ADD CONSTRAINT auth_qa_expiry CHECK(is_qa = (qa_access_expires_at IS NOT NULL));
ALTER TABLE org_schools ADD COLUMN is_qa BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE test_templates ADD COLUMN is_qa BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE test_attempts ADD COLUMN is_qa BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX test_attempt_live_report ON test_attempts(submitted_at,id) WHERE NOT is_qa;
CREATE TABLE deployment_receipts(
 operation_id UUID PRIMARY KEY, operation TEXT NOT NULL,
 digest TEXT NOT NULL, response JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
-- Provenance is assigned at insertion, not an editable metadata field.
CREATE FUNCTION silentstation_qa_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.is_qa IS DISTINCT FROM NEW.is_qa THEN
  RAISE EXCEPTION 'QA provenance is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER auth_qa_immutable BEFORE UPDATE ON auth_users FOR EACH ROW EXECUTE FUNCTION silentstation_qa_immutable();
CREATE TRIGGER school_qa_immutable BEFORE UPDATE ON org_schools FOR EACH ROW EXECUTE FUNCTION silentstation_qa_immutable();
CREATE TRIGGER template_qa_immutable BEFORE UPDATE ON test_templates FOR EACH ROW EXECUTE FUNCTION silentstation_qa_immutable();
CREATE TRIGGER attempt_qa_immutable BEFORE UPDATE ON test_attempts FOR EACH ROW EXECUTE FUNCTION silentstation_qa_immutable();
