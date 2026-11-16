-- Additive: public invitations are distribution links, never respondent identities.
ALTER TABLE survey_campaigns ADD COLUMN teacher_distribution_enabled BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE survey_invitations(
 id UUID PRIMARY KEY, campaign_id UUID NOT NULL REFERENCES survey_campaigns(id),
 issued_by TEXT NOT NULL REFERENCES auth_users(id), code TEXT NOT NULL UNIQUE CHECK(code ~ '^KS-[A-HJ-NP-Z2-9]{12}$'),
 expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ,
 revision INT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(expires_at>created_at));
CREATE INDEX survey_invitation_campaign ON survey_invitations(campaign_id,created_at,id);
CREATE INDEX survey_invitation_issuer ON survey_invitations(issued_by) WHERE revoked_at IS NULL;
ALTER TABLE auth_users ADD COLUMN ui_theme TEXT NOT NULL DEFAULT 'system' CHECK(ui_theme IN ('light','dark','system')),
 ADD COLUMN ui_locale TEXT NOT NULL DEFAULT 'vi' CHECK(ui_locale IN ('vi','en')),
 ADD COLUMN preferences_revision INT NOT NULL DEFAULT 0;
