# Trạm An development

Run all commands from the SilentStation checkout. The parent source folder is read-only input and is not a second app to modify.

## UI demo (no DB or service credentials)

```sh
npm run dev:demo -- --host 127.0.0.1 --port 4173
# or build an isolated demo output:
npm run build:demo
npm run preview:demo
```

Open localhost port 4173. Use campaign code **DEMO** and the labeled role switcher. Mutations/API calls from compatibility services are blocked in demo. Source fixtures never silently replace failed API data in ordinary mode. The demo draft is simulated in memory, not durable server storage.

## Validation

```sh
npm run lint
npm test
npm run build
npm run build:api
npm run test:integration
```

The integration runner creates a NEW PostgreSQL cluster in the OS temporary directory, binds only loopback on a free port, generates its own test DB name/auth secret, disables real collection/Gemini/SMTP, then stops and deletes exactly that cluster. It never uses DATABASE_URL inherited from an existing environment. Set `PG_BIN` to an installed PostgreSQL binary directory if needed; the current macOS default is PostgreSQL 16 in Homebrew.

A single integration harness is skipped in the offline unit command. It is exercised by `test:integration` against the disposable database.

## Explicit local API setup

Do NOT point these commands at a shared/staging/production DB without separate authorization.

```sh
# Set DATABASE_URL to your explicitly selected isolated development DB.
MIGRATION_CONFIRM=yes npm run db:migrate
# Optional, only an explicitly selected development DB:
ALLOW_DEMO_SEED=true npm run db:seed:demo
npm run dev:api
npm run dev
```

Startup/health do not create schemas, seed credentials or overwrite templates. Missing migrations are an error, not permission to mutate a DB on a GET. `start:api` uses `dist-server/server/auth-server.js`; run a fresh API build first. Old flat checked-in dist-server files are historical artifacts, not the runtime entry.

Cookie-mode web API calls use the same-origin proxy. Configure `APP_URL` to the frontend origin. Production requires a strong project-specific AUTH_SESSION_SECRET, verified DB TLS, explicit origins and HTTPS. Browser auth tokens and answer drafts are not kept in localStorage.

## Anonymous survey API

- Public: `GET /api/surveys/campaigns/:code`.
- Consent/session: `POST .../:code/session` with `{consent:true,consentVersion}`.
- Draft: `GET/PUT/DELETE .../:code/draft`; PUT requires `{answers,reviewedSections,revision}`.
- Submit: `POST .../:code/submit` with `{revision,idempotencyKey}`; returns `{receipt:{responseId,savedAt}}`.
- Admin: campaign list/create/update, grants, aggregate report, authorized response and CSV export under `/api/surveys/admin/campaigns`.
- Raw access and export are separate grants; even Superadmin is denied by default. Admin school scope still applies.
- Stored answer states are `answered`, `skipped`, `unanswered`. K/unknown knowledge are real answer values. Incomplete scales are `insufficient_data`; complete but unapproved rules are `unapproved`.
- Definitions are immutable by version. Reusing a version for different content is rejected; the current draft instrument cannot collect real data.
- Anonymous rows do not have an auth `user_id`. Do not add identification/fingerprinting or forward A–J answers into chatbot prompts.

## Maintenance / environment gates

A scheduler is NOT enabled by default. After explicit deployment approval, provision CRON_SECRET within this project and configure your chosen platform to call the guarded maintenance endpoint. Verify draft erasure timing before publishing a retention promise. Draft ciphertext keys derive from campaign/session and the browser's random cookie, which is not stored in plaintext in DB.

Full policy review, support-contact verification, runtime/platform tests and rollout authorization are required before real collection. `SURVEY_REAL_COLLECTION_ENABLED` and `SURVEY_ALLOW_SERVER_DEMO` default false. Do not activate them solely to bypass a gate.
