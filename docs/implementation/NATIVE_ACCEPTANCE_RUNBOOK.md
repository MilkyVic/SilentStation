# Native acceptance → Vercel Hobby + Neon → Cloudflare

## Phạm vi và gate
Source hiện tại không cần container runtime. Vòng local dùng Node 22, PostgreSQL 16, OpenSSL, Chromium và SMTP sink Node. Không tự cài phần mềm host, đổi trust store, kết nối Neon, deploy hoặc bật scheduler. Preview 4189/DB/tài khoản được giữ nguyên; không dùng nó để chạy integration.

`SURVEY_REAL_COLLECTION_ENABLED=false` ở mọi fixture/package. API startup/health không migrate/seed. Production frontend TEST không có role switch hoặc auth/data fallback. Nội dung A–J/scoring/consent/version lịch sử không thay đổi.

## Preflight và package
- Node 22, PostgreSQL 16 đã cài. Đặt PG_BIN nếu khác đường dẫn mặc định Mac; OpenSSL phải sẵn trong PATH hoặc OPENSSL_BIN.
- Thiếu dependency/cổng bận: dừng, không kill dịch vụ khác hay cài global.
- Archive gồm source chưa tracked, không gồm .git/.env/.acceptance/DB/credential/reference PDF. SHA và snapshot phải khớp.
- Trong package đã giải nén: `python3 scripts/acceptance.py verify`; `python3 scripts/acceptance.py preflight`.
- Manifest format 2 chỉ dùng native/Vercel. Archive format 1 cũ chỉ là evidence lịch sử, không chạy runner cũ.

```sh
npm ci --registry=https://registry.npmjs.org
npm run lint
npm test
npm run test:integration
npm run test:native
# Chọn port riêng, không 4189; fail nếu bận:
SS_UI_BASE=http://127.0.0.1:4211 SS_WEB_PORT=4211 SS_WEB_ORIGIN=http://127.0.0.1:4211 \
SS_WEB_CREDENTIAL_FILE=.acceptance/native-ui-credentials.json npm run test:ui-live
npm run test:ui-print
npm run package:acceptance
```

## TLS/SMTP native
`test:native` tạo cluster mới `ss_test_<run-id>`, migration explicit và fixture mới/empty có xác nhận. Fixture RNG gồm hai trường, GVCN/bộ môn/Admin/Superadmin/học sinh, sáu banks, campaign TEST và invitations. Từ chối hostname cloud hoặc DB không đúng namespace; không ghi đè dữ liệu.

CA/cert/key nằm trong thư mục tạm private. Node client, PG và SMTP xác minh CA/hostname; không cài CA global. SMTP sink bind loopback, chỉ nhận `@acceptance.invalid`, không relay; mail/OTP chỉ trong bộ nhớ harness, không log/evidence. Production API không trả dev OTP.

Gate kiểm tra actual compiled entry qua HTTPS proxy native, cookie Secure/HttpOnly/Strict, TLS sai bị từ chối, OTP/reset qua SMTP thật nội bộ, expiry/physical cleanup, restart persistence và readiness thiếu ledger. Không coi Node HTTPS test là browser HTTPS gate: Chromium local HTTP là regression riêng; browser HTTPS/cookies trên actual Vercel Preview vẫn pending đến khi có ủy quyền.

## Worker Cloudflare — mặc định tắt
Source ở workers/maintenance, không phụ thuộc DB driver hoặc backend secrets. Config không có cron đang kích hoạt và `SCHEDULER_ENABLED=false`.

Sau ủy quyền, operator tạo Worker riêng của SilentStation, đặt:
- APP_BASE_URL: origin HTTPS đúng project, không path/query/userinfo.
- CRON_SECRET: secret riêng project, giống backend; không dùng AUTH_SESSION_SECRET.
- VERCEL_PROTECTION_BYPASS: chỉ khi Preview được bảo vệ, credential đúng project, không mở bảo vệ công khai.
- SCHEDULER_ENABLED: chỉ true trong cửa sổ nghiệm thu được chọn; sau đó mới bật Cron `* * * * *`.

Worker chỉ gọi GET survey-maintenance/account-maintenance, header Authorization, redirect:error, timeout 25 giây; một job lỗi không ngăn job kia. Log chỉ job/duration/status, không body/headers/secret. Lịch best-effort, không hứa chính xác mỗi phút. Kiểm tra quota Vercel/Neon và khả năng compute bị giữ awake trước khi bật 24/7; không tự nâng gói/bật dịch vụ.

## Maintenance và email
Mỗi endpoint cleanup tối đa 100 bản ghi/lượt. Account job tối đa 5 email/lượt, ngân sách 20 giây, SMTP timeout và thời gian dành cho ACK; không bắt đầu mail mới nếu thiếu budget. Leases/attempts bảo vệ tick trùng; retry dùng cùng challenge và tối đa ba lần.

Email là at-least-once: SMTP đã nhận nhưng mất ACK có thể gửi lặp. Hết budget/ACK chưa rõ không coi là đã gửi; lease phải hết trước khi reclaim. Không tạo OTP mới để retry. Payload hết hạn/failed bị xóa có giới hạn batch.

Nháp mất quyền truy cập ngay tại deadline 24 giờ, bất kể job chạy chưa; job là thời điểm thực sự xóa ciphertext, có thể trễ khi scheduler lỗi/tắt. Không purge collected responses. Secret-file transport và auth/encryption key được giữ; không đổi AUTH_SESSION_SECRET tùy ý cho DB cũ.

Runner native tùy chọn dùng MAINTENANCE_BASE_URL/CRON_SECRET/SCHEDULER_ENABLED, mặc định tắt, không tự gắn vào 4189. Khi manual run, dùng compiled server/maintenance-worker.js và CA project-scoped qua NODE_EXTRA_CA_CERTS nếu test HTTPS; không cài trust toàn máy.

## Vercel/Neon — vòng riêng
- Chọn đúng project/environment; Preview dùng DB development riêng, không trộn fake với production.
- Native fixture initializer không seed Neon. Muốn cloud fixtures phải có target/authorization và quy trình khác; không nới guard localhost cho tiện.
- Lưu DATABASE_URL/APP_URL/AUTH_API_CORS_ORIGIN/AUTH_SESSION_SECRET/DB_TLS_MODE/CRON_SECRET đúng project. Không VITE_ secret, không global team credential.
- Kết nối Neon TLS verify-full; app URI không có SSL query override. Direct connection cho migration, pooled cho runtime theo cấu hình đã kiểm tra.
- Read-only preflight schema/ledger trước; migration additive explicit sau backup/ủy quyền. Không đoán baseline, reset hoặc suy trường/lớp/niên khóa.
- Kiểm tra actual hosted functions HTTPS, cookie/CSRF, routing parity, SMTP sandbox được duyệt, grants, autosave/retry, schedule logs và quota.
- Local PASS không thay evidence cloud. Không dùng ignoreHTTPSErrors, role switch hoặc service success giả.

## Rollback/evidence
Dừng gate fail và giữ evidence đã redaction. Sealed manifest + source/build hash + Node/platform + test results thay cho image digest. Không credentials/mail/OTP/answers trong evidence. Rollback giữ schema/data và reader hiểu format; không down-migrate/restore đè. Không chạm tài nguyên project khác.
