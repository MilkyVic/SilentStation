# Completion gates — 1.1.1 (local evidence ≠ cloud acceptance)

> **Quyết định cập nhật 2026-11-16:** Neon chỉ có nhánh Production. Xem
> `PRODUCTION_ONLY.md`; các mục tạo branch QA/development dưới đây là phương án
> cũ, không được thực hiện trong vòng này. Gate runtime thật vẫn phải kiểm tra
> có kiểm soát, không seed dữ liệu giả vào Production.

## Evidence boundaries

Tests chỉ chứng minh phần thực sự được chạy. Không dùng SDK macOS/import-only,
`createApp()` integration hay local HTTP làm bằng chứng deployment Linux/Preview
HTTPS. Không dùng manifest, flag SMTP/config hay địa chỉ email làm bằng chứng
email đã tới hộp thư. Không đánh dấu hoàn tất khi còn gate pending.

| Requirement | Owning evidence | Current scope/status |
|---|---|---|
| Original SQL 001–008/checksums preserved | migration file SHA vs baseline; runtime integration | local verified; revalidate before live mutation |
| Logical 001/002 baseline, including reordered Neon columns and real drift refusal | runtime integration legacy schema/reordered/nullability tests | disposable PG16 verified; PG17.12 disposable verified; controlled real preflight still required |
| Numeric/history preservation and transactional migration rollback/idempotency/concurrency | runtime + deployment integration | disposable verified |
| Vercel config schema and bounded glob | vendor JSON schema + predeploy-config regression | string ≤256 chars; local verified, actual cloud build pending |
| Node 22/release 1.1.1 | package/CI metadata + clean build; actual SDK Lambda.runtime | local verified; Vercel project/release still needs checkpoint |
| Every packaged adapter imports; SQL/knowledge retained; private paths absent | official SDK artifact verifier on clean source | local macOS only; record exact snapshot and rerun after source/config changes |
| Real deployment bytes/runtime methods | actual Vercel build/evidence, not SDK approximation | pending |
| Deployment preflight, strong secret/TLS/origin/role/ledger/mapping | read-only CLI + config tests + actual configured target | source/local tests; cloud target pending |
| Reviewed school/class/year mapping; pending teacher has no active assignment | deployment integration with dry-run, rollback, receipt, concurrent replay | local verified; real mapping data not supplied/approved |
| Operational import, whitelist/hash preservation, collision/refusal/receipt | deployment integration all five + staged Superadmin | local verified; no Production import executed |
| No expiry/QA tag on five operational identities | import DTO/SQL + login assertions | local verified; live creation pending name/action checkpoint |
| Original Superadmin and history untouched | import integration row-for-row checks | disposable verified; verify actual target before/after approved import |
| Last operational Superadmin protected with extra QA identities | QA policy + serialized account integration | local verified |
| Native fixture loopback guard not weakened | native entry + real compiled/TLS runner | local verified |
| Historical cloud helper refuses Production/wrong project/branch/origin/TLS/SMTP/retained state | cloud-policy unit + shared fixture integration | local verified; not used under production-only policy |
| Real auth/OTP delivery for operational accounts | actual mailbox and application actions; cloud-policy guards alone insufficient | pending approved Production SMTP and owned-inbox smoke |
| Four role scope/persistence/OTP/approval/CSRF, grants and revoke | integration + 17 actual-API browser tests + native TLS/SMTP sink | local fake data verified; controlled operational Production login still pending |
| Anonymous A–J, QR, missing/skip/K/receipt/version/draft concurrency | unit/integration/browser suites | local verified; same snapshot controlled runtime smoke pending |
| Theme/VI–EN, avatar-left-name/dropdown/responsive | browser + UI/print suites | local verified; recheck operational screens in controlled Production smoke |
| A4 PDF 155 questions/10 sections/versions | actual Chromium PDF/UI suite | local verified, no question/scoring/consent rewrite |
| Clean install/build/audit/package/no secrets/SHA | sealed-source verifier + Node22 clean gates | local verified per snapshot, refresh after edits |
| Strong live credentials/scoped Neon runtime role | explicitly approved configuration + actual readiness | pending; do not substitute owner DSN or weak key |
| Encrypted backup/isolated restore rehearsal/drained legacy writer | PG17 synthetic rehearsal + concrete live operation evidence after approval | synthetic verified; actual backup/restore/drain pending |
| Production migration/import/deploy/email/login all five with backend persistence | approved actual target evidence | pending |
| Keep 4189/current DB/source folder; no global credentials/other projects | listener/PIDs + mutation scope and source diff | maintained |
| Real survey collection, scheduler, purchase/upgrade | configuration/action audit | still disabled/not performed |

## Stop conditions

Missing live gate → keep work active/pending, not "complete". Production action
requires its explicit checkpoint even if local suites are green. Do not reset,
reseed, down-migrate, overwrite passwords, reclassify historical results or
weaken TLS/auth to force a pass. Keep failed QA resources for investigation
until cleanup is separately authorized. Preserve earlier archives as history;
only a snapshot with matching complete evidence is a release candidate.
