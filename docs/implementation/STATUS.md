# Implementation status — new Trạm An UI

Branch: `review/import-student-survey`. No commit, push, deployment, global Git/SSH/credential change, or access to an existing database was performed.

## Delivered locally

- M0: report fallback risk union fixed; production/demo/API builds and baseline source tests maintained.
- M1: source-folder visual identity and optimized assets, new public shell, HashRouter, home/contact, survey, research dashboard, four-role demo switcher, lazy-loaded legacy features, mobile handbook drawer, accessible survey options and focus-managed modals.
- M2: versioned A–J contracts (155 editable questions), explicit consent, anonymous campaign-scoped cookies, optimistic draft revisions, 24-hour access expiry, encrypted draft envelopes, idempotent submission, private research grants/audit, raw export, and full A–J print rendering.
- M3: browser-cookie auth with legacy Bearer compatibility; secure OTP generation and row-lock consumption/attempt enforcement; suspended-session rejection; class-code school scope; explicit migrations/seeding; serverless reject-teacher parity; template question persistence/version snapshots/soft archive; validated legacy arithmetic; full SQL report totals/rollups and tied-timestamp-safe user pagination; authenticated legacy drafts instead of answer localStorage; server-owned chat session IDs; consistent build entry and Docker runtime assets.
- M4 local smoke checks: 320/390/768/1280 home layout; 390px handbook/article and four account roles; consent → A–J → review → explicitly labeled demo submission. Server integration exercises actual disposable PostgreSQL, not mocks or a pre-existing DB.

## Deliberate boundaries / remaining gates

- Demo fixtures are browser-memory only. Demo reload intentionally loses the simulated draft; server resume/expiry is validated separately against disposable PostgreSQL. Do not use demo to enter real information.
- `SURVEY_REAL_COLLECTION_ENABLED=false`, the current instrument version is explicitly `draft`, and production server demo collection is off. Real pilot cannot be opened merely by setting approval booleans in an API body.
- Approve exact questionnaire wording, scoring interpretation, consent, retention, instrument rights, actual support contacts and research grantees before a reviewed release version is published. Arithmetic tests are not clinical validation.
- Drafts are inaccessible after 24 hours; expired ciphertext erasure requires an explicitly configured maintenance scheduler calling `/api/internal/survey-maintenance` with this project's `CRON_SECRET`. No scheduler was activated or key provisioned. The guarded endpoint is ready; do not promise physical deletion timing until deployment scheduling is configured and tested.
- No Docker executable is available locally. Container startup and Vercel preview deployment were not executed. Build entry/runtime file alignment was checked locally only.
- No 800-person load benchmark, full assistive-technology audit, real SMTP/Gemini delivery, or production canary was executed.
- Legacy features remain in a lazy compatibility module (`LegacyApp`) rather than being fully rewritten. This preserves existing workflows; further decomposition is technical debt, not a claimed completed refactor.
- Client-only profile/password/phone-verification and user-delete actions are visibly disabled. They do not fake persistence. Contact is direct call/email, not a fake message inbox.
- New/unreviewed arithmetic must not be interpreted as diagnosis. Existing historical scores are retained; new submissions include provenance and an unapproved-interpretation label.

## Rollout and rollback

1. Review the demo and permission/data-flow tests.
2. Select an isolated development DB, explicitly apply additive migrations, and validate cookies/CSRF/runtime configuration.
3. Configure and test maintenance scheduling, approved retention, grantees and operator policies.
4. Publish an approved immutable instrument release; keep real collection locked until explicit rollout authorization.
5. Run container/platform/E2E/load acceptance in that environment.
6. Roll back via application/release flags. Do not reset, reseed, re-score or delete historical study records for rollback.
