# Backend acceptance — native / Vercel–Neon

## Implemented locally
- Shared Express/Vercel core, additive migrations/ledger/checksum, readiness; no startup seed.
- Native runner for actual compiled production API, verified PostgreSQL/HTTPS/SMTP TLS and synthetic SMTP-only recipients.
- Bounded maintenance: each endpoint at most 100 cleanup records, outbox at most 5 messages/20 seconds with lease/attempt/ACK safety.
- Cloudflare maintenance client and disabled/no-trigger config; native optional runner has configurable HTTPS origin.
- Actual-API Chromium and A4 UI/print regression suites retained. Local HTTP is not a hosted HTTPS gate.
- Source-only manifest format 2, current source/build/runtime hashes and redacted evidence.

## Pending separate authorization/evidence
- Actual Vercel Preview HTTPS/Secure cookies/routing and deployment protection.
- Dedicated Neon development schema/ledger/TLS checks and explicitly authorized migrations/data preparation.
- Approved SMTP sandbox and Cloudflare account/configuration/quota/activation window.
- Real collection, production migration/deploy/bootstrap and retention remain separate; real collection false.

Older engineering handoffs and archived package/evidence are historical, not operating instructions. Current runbook: NATIVE_ACCEPTANCE_RUNBOOK.md. Never reset/down-migrate/restore over existing data or alter unrelated projects.
