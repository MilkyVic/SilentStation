> Local suite runs a real compiled API on its OWN disposable database. See docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md; hosted HTTPS remains a separate gate.

# Compiled-entry browser integration (not hosted Vercel Preview acceptance)

Use Node 22 and PostgreSQL 16 binaries (PG_BIN, macOS Homebrew default). Keep Chromium under a project-scoped PLAYWRIGHT_BROWSERS_PATH, then run `npm run test:ui-live`.

The launcher creates a NEW random ss_test DB/cluster in OS temp, only loopback, applies explicit migrations, generates private random fake credentials, explicitly imports the six original system banks (111 questions / 512 options), and starts **dist-server/server/auth-server.js** with external providers/real collection disabled. Frontend is production build with TEST banner; no demo role selector. It cleans its cluster/credentials after the suite; never uses inherited DB DSN. It does not modify hosted Vercel Preview contexts, global trust/config, credentials or other projects.

Cases: four role backend login/status with complete role-scoped system catalogs/banks, fresh metadata editor, equal-score option identity, resume, lost commit ACK replay, double click, receipt after campaign closure, bank-change explicit restart. No traces/video/password/OTP/raw response evidence. Test OTP is explicit dev response only in this isolated NODE_ENV=test run; production Mailpit/TLS is tested by the separate hosted Vercel Preview suite.
