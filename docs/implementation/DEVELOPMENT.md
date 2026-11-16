# SilentStation development (native)

Run from this checkout only. The parent source folder and other projects are not write targets. Node 22, PostgreSQL 16, OpenSSL and Chromium must already be available; no automatic global installs/config changes.

## Real local UI vs demo
The existing 4189 serves a production frontend + actual compiled API and its retained test DB. Build/test must not restart/reset it. UI demo remains a separate optional mode on 4173; no demo role switch or fixture fallback is allowed in real mode.

## Gates
```sh
npm ci
npm run lint
npm test
npm run build
npm run build:api
npm run build:acceptance
npm run test:integration
npm run test:native
```

Unit DB harnesses skip outside their explicitly selected disposable DB. Integration creates its own cluster, binds loopback and disables real providers/collection; it never uses a Neon target from environment. Native acceptance uses a separate production-mode API, private CA, PG TLS and Node SMTP sink. No CA is installed globally and no mail is relayed.

For actual-API browser tests select a free non-4189 port:
```sh
SS_UI_BASE=http://127.0.0.1:4211 SS_WEB_PORT=4211 SS_WEB_ORIGIN=http://127.0.0.1:4211 \
SS_WEB_CREDENTIAL_FILE=.acceptance/native-ui-credentials.json npm run test:ui-live
npm run test:ui-print
```

Local HTTP is not the Vercel Preview HTTPS/cookie gate. See [native/cloud runbook](NATIVE_ACCEPTANCE_RUNBOOK.md) for TLS, SMTP, scheduler and cloud evidence boundaries.

## Migrations and fixtures
MIGRATION_CONFIRM=yes must be deliberate, against an explicitly selected DB. No startup/request/health migration or seed. Ledger/checksum mismatch or unknown baseline fails closed. Native initializer accepts only a NEW empty loopback database with namespace/run-id confirmation; never Neon. Do not use demo seeding for cloud bootstrapping.

## Package and maintenance
`npm run package:acceptance` includes untracked source, excludes credentials/input documents and produces manifest format 2. Validate extracted package via `python3 scripts/acceptance.py verify` and `preflight`, then clean install/build/test.

Cloudflare Worker is code only, disabled/no triggers. Optional native maintenance requires explicit HTTPS base and project CRON_SECRET; no automatic attachment to 4189. Cloud activation/Neon migration/deploy/push require separate authorization. Keep SURVEY_REAL_COLLECTION_ENABLED=false and do not change auth encryption secrets for existing data.
