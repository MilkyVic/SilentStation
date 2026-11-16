# SilentStation — current local status

Current branch: review/import-student-survey. Existing 4189/DB/accounts/history must remain unchanged during build/test.

- Folder-based UI, A–J anonymous campaigns, legacy six banks, account/org/grants, invitation/QR, light/dark/system and vi/en retained.
- Schema 001–008/scoring/consent/history unchanged in the native-maintenance release.
- Deployment target: Vercel Hobby + Neon; Cloudflare scheduling prepared but disabled, no active triggers.
- No container build/Compose/service alias required by source, packager or tests.
- Native TLS/SMTP/API acceptance replaces image-specific tests; local browser/API and A4 regression remain separate gates.
- SMTP sink is dev-only, loopback/synthetic-only/no relay. Hosted browser HTTPS/Neon/sandbox/scheduler proof pending authorization.
- Existing source/evidence archives are historical. Current package uses manifest format 2/source/build/runtime identity.
- No cloud credentials used, migrations run only on disposable local DB, no push/deploy/pilot/response purge.

Runbook: NATIVE_ACCEPTANCE_RUNBOOK.md; older handoff documents are explicitly non-operational records.
