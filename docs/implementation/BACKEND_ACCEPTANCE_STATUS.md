# Backend acceptance — evidence boundaries

Branch `review/import-student-survey`. No commit/push, remote SSH, Docker daemon operation, deployment, existing DB access or global Git/credential configuration change.

Implemented: compiled migration CLI; transactional ledger/checksum/advisory lock; explicit reference-schema baseline; score numeric-domain preflight; no bootstrap fixtures in runtime; shared verified TLS/CA configuration; strong production secret/origin gates; readiness; configurable verified SMTP; atomic PostgreSQL rate limits; JSON/body-limit errors; shutdown/timeouts; null/unreviewed reports; definition-version export/print rejection; Express/serverless parity; isolated Docker acceptance topology, private secret/CA volumes, Mailpit, one-minute maintenance, actual-image Chromium/API tests, source-only archive and operator runbook.

Local checks on official checksum-verified Node 22.23.5: typecheck, offline unit tests (35 pass, two database harnesses intentionally skipped), disposable PostgreSQL integration (28 pass, including migration and parity tests). These database tests use a NEW local PostgreSQL 16 cluster, not Docker, and remove only that cluster. Chromium suite collection has 6 tests; collection is not an E2E pass.

Clean-package build/unit verification and final archive hashes are recorded during handoff. Runtime API dependencies are pruned separately from frontend/build/test tooling. Targeted security updates include Nodemailer 10.5.0 (released before the current date) and compatible API transitive overrides; React 19/Vite 6 stay unchanged. Remaining source/build dependency advisories must not be mistaken for a clean security audit.

Remote evidence required: Docker/Alpine fresh build, actual container startup, DB/SMTP negative CA/hostname tests, browser certificate/cookie enforcement, Mailpit delivery, restart persistence, maintenance timing, four roles and responsive UI. No such Docker/E2E pass is claimed locally.

Real collection remains locked. Clinical arithmetic/reference tests are not medical validation. All acceptance data and credentials are synthetic. Existing source folder is unchanged. No physical-retention promise or real-response purge was enabled.
