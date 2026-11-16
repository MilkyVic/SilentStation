# Predeploy 1.1.1 — Vercel/Neon và phục hồi tài khoản vận hành

> **Quyết định cập nhật 2026-11-16:** Neon chỉ có nhánh Production. Xem
> `PRODUCTION_ONLY.md`; các mục tạo branch QA/development dưới đây là phương án
> cũ, không được thực hiện trong vòng này. Gate runtime thật vẫn phải kiểm tra
> có kiểm soát, không seed dữ liệu giả vào Production.

## Trạng thái và ranh giới

Bản này sửa source; không phải chứng nhận Production đã sẵn sàng. Phiên 4189
được giữ nguyên. Production migration, tạo role/key, gửi email thật, deploy và
commit/push phải có xác nhận tại checkpoint. Cron và thu khảo sát thật vẫn tắt.

Quyết định mới thay thế phương án QA account 30 ngày: năm tài khoản import là
**tài khoản chính thức**, `is_qa=false`, không có hạn tự hết. Trạng thái QA và
hạn 30 ngày chỉ còn dùng cho tài khoản TEST khác được tạo rõ ràng trên môi trường
QA. Không chuyển nhãn kết quả TEST thành dữ liệu thật hoặc suy nhãn lịch sử.

## Những thay đổi

- Node 22.x, release 1.1.1; giữ React/Vite và UI đã duyệt.
- API tracing loại frontend assets, output build, fixtures, CLI, secrets và docs;
  giữ SQL/knowledge runtime. Frontend vẫn chứa assets và được deploy riêng.
- Baseline 001/002 so sánh cột theo tên, không theo thứ tự vật lý. Type,
  null/default, constraint/index và checksum vẫn phải khớp; không tự adopt DB.
- Migration 009 additive: immutable QA markers, QA expiry và receipt cho CLI.
  Các bản SQL 001–008 không thay đổi. Dữ liệu hiện có mặc định non-QA.
- Reports/CSV mặc định loại QA trước COUNT/LIMIT; `includeQa=true` vẫn bị giới hạn
  bởi quyền trường/lớp. Lịch sử cá nhân không bị mất kết quả TEST.
- Không được vô hiệu hóa Superadmin vận hành cuối cùng chỉ vì còn QA Superadmin.
- Pending teacher không có phân công hiện tại trước phê duyệt. Mapping có receipt,
  revision và niên khóa được đối chiếu, không suy năm học từ ngày hiện tại.

## Tài khoản vận hành cần import

| Username local | Username đích | Role |
|---|---|---|
| student | student | Student |
| teacher | teacher | Teacher/GVCN |
| admin | admin | Admin trường A được đối chiếu |
| admin-b | admin-b | Admin trường B được đối chiếu |
| superadmin | traman-superadmin | Superadmin vận hành liên trường |

Có thể ưu tiên Superadmin trước bằng private plan với `ACCOUNT_IMPORT_USERNAMES=traman-superadmin`
và assignment `{username:'traman-superadmin',schoolId:null,classId:null}`. Sau khi xác minh
đăng nhập, lập plan mới cho bốn tài khoản còn lại với IDs trường/lớp đã duyệt và
baseline counts mới. Mỗi giai đoạn transaction riêng; không bỏ qua collision.

Không overwrite username `superadmin` cũ. Giữ local password/hash; kiểm tra policy
15–128 ký tự trước chuyển. Không có password trong chat/Git/SQL/log/evidence.
Hộp thư riêng do người vận hành xác nhận qua `ACCOUNT_IMPORT_OWNED_INBOX`; các
alias `+ss-student`, `+ss-teacher`, `+ss-admin`, `+ss-admin-b`, `+ss-superadmin`
không mang theo trạng thái verified giả. Admin/Superadmin vẫn cần email OTP.

Không sao chép session/OTP/grant/join code, test attempt, campaign hay phản hồi.
Các trường/lớp dùng **ID thực đã đối chiếu**. Không tạo trường TEST trong DB thật.
Superadmin có thể chưa gán trường/lớp; bốn tài khoản còn lại cần phạm vi hợp lệ.
Không tự cấp quyền raw/export A–J.

## Preflight chỉ đọc

Chạy với config riêng đúng project, không dùng config phiên 4189 hoặc DSN trong
lệnh shell/history. `npm run deploy:preflight` chỉ SELECT và đọc transaction,
trả mã gate/fingerprint, không trả DSN/credential. Ledger thiếu trả
`EXPLICIT_BASELINE_REVIEW_REQUIRED`; chưa phải phép migrate.

- `AUTH_SESSION_SECRET` mạnh và đúng kế hoạch rotation có backup; không tự đổi.
- `DATABASE_URL` không tham số SSL ghi đè; `DB_TLS_MODE=verify-full`.
- APP/CORS phải origin HTTPS, không đường dẫn/hash/query/credential.
- Runtime role không owner/createdb/createrole/bypassRLS.
- Production seed/dev OTP/demo/real collection đều false.
- Mapping trường/lớp và readiness schema 001–009 phải pass.
- Không nối deployment kiểm thử ghi dữ liệu giả tới DB Production. Kiểm thử
  PG17/SMTP sink thực hiện cô lập local/CI; build cloud không được seed dữ liệu.
  Smoke trên Production chỉ bằng tài khoản vận hành và thao tác đã được duyệt.

## CLI import (mặc định dry-run)

Config/source/password record/assignments/plan/handover đều ở file private 0600
bên ngoài source package. `ACCOUNT_IMPORT_SOURCE_CONFIG_FILE` chọn runtime local
TEST loopback đang giữ; chỉ SELECT từ DB này. Không migrate/reset/restart nguồn.
`ACCOUNT_IMPORT_SOURCE_CREDENTIALS_FILE` dùng bản credential local đã có để kiểm
tra hash trong bộ nhớ; CLI không in password/hash.

1. Đối chiếu từng `schoolId/classId/academicYear`; ghi file assignment riêng:
   `[{"username":"student","schoolId":"REVIEWED_ID","classId":"REVIEWED_CLASS_ID"}, …]`.
   Superadmin có thể `schoolId=null,classId=null`; Admin không có classId.
2. Preflight target; duyệt fingerprint, số users/attempts thực tại thời điểm đó.
3. Đặt `ACCOUNT_IMPORT_EXPECTED_TARGET_FINGERPRINT`, `ACCOUNT_IMPORT_EXPECTED_USERS`,
   `ACCOUNT_IMPORT_EXPECTED_ATTEMPTS`, `ACCOUNT_IMPORT_ASSIGNMENTS_FILE`,
   `ACCOUNT_IMPORT_OWNED_INBOX` và hai source file paths trong config riêng.
4. `npm run accounts:import -- prepare /PRIVATE/operational-import.json`.
   Đọc private handover; verify username/role/email/scope với người vận hành.
5. `npm run accounts:import -- check /PRIVATE/operational-import.json` thực hiện
   đầy đủ transaction rồi ROLLBACK, không lưu user hay receipt.
6. **Dừng xác nhận Production**. Khi được phép, chạy `apply` với
   `ACCOUNT_IMPORT_CONFIRM=yes` và đúng fingerprint. Không đặt flag mặc định.
7. Retry cùng plan/operation ID trả receipt. Collision hoặc thay baseline dừng
   toàn bộ; không upsert overwrite. Receipt drift không tự khôi phục mật khẩu.
8. Kiểm tra đăng nhập từng tài khoản + OTP thật, role/scope, persistence,
   expiry null. Chỉ mở traffic khi readiness 200 và các gate Production pass.

## Bàn giao/gate còn phải nghiệm thu

Local: type-check, unit/integration, actual compiled API+TLS, Chromium role flows,
QR/themes/languages và PDF 155 câu/10 phần. Build source package sạch Node 22.
Runtime còn phải xác minh: PG17 disposable upgrade/restore, actual Vercel build
size/routes, rồi HTTPS/cookie/SMTP trên deployment Production trong cửa sổ smoke
được duyệt. Không tạo nhánh/DB QA trên Neon hoặc seed phản hồi giả vào Production.

Maintenance window: chặn legacy writer/traffic + drain trước migration; backup
mã hóa và restore rehearsal riêng. Baseline 001/002 chỉ sau kiểm tra strict;
003–009 additive, reviewed mapping rồi import. Rollback bằng artifact/reader
compatible và giữ dữ liệu; không down-migrate/reset/reseed để làm test pass.
Không xóa/vô hiệu hóa Superadmin cũ trước khi tài khoản thay thế hoạt động và được
người vận hành xác nhận riêng. Không mua/nâng gói tự động.

## Neon một nhánh: gate runtime và rollout

Theo `PRODUCTION_ONLY.md`, không chạy `qa:initialize:cloud` hoặc tạo nhánh Neon
QA trong vòng này. Helper cloud cũ chỉ là công cụ development không thuộc
runtime API và không được dùng để seed Production. Không thay bằng DB/schema
TEST trên cùng nhánh để né quyết định của người vận hành.

- QA: Node22 + PostgreSQL17 disposable + SMTP TLS sink và Chromium local/CI.
- Vercel: build artifact thật trước khi mở traffic; không chạy migration/seed
  từ build/startup/health. Không lấy SDK macOS làm bằng chứng Linux/cloud.
- Production: chỉ read-only preflight trước checkpoint; backup và rehearsal
  restore riêng, drain legacy writer, additive migration/import/deploy đã duyệt.
- Smoke: đăng nhập OTP, role/scope/cookie/HTTPS/readiness và persistence bằng
  tài khoản vận hành. Không tạo campaign demo, submit phản hồi A–J giả hoặc chạy
  benchmark/load test trên DB thật. Việc thu dữ liệu thật vẫn khóa.
- Khi gate fail: giữ maintenance/DB và bằng chứng; không reset/down-migrate,
  reseed hoặc xóa dữ liệu. Không tự đổi secret, quyền DB, mua gói hoặc bật Cron.

## Gate artifact Vercel local

`excludeFiles` là **một glob string** dài không quá 256 ký tự, không phải mảng;
SDK builder có thể chấp nhận mảng nhưng schema project sẽ từ chối. Regression
kiểm tra kiểu, độ dài và các path retain/exclude; khi thêm thư mục mới phải
đối chiếu lại pattern, không đổi sang mảng để vượt giới hạn.

Dùng clean source đã giải nén/verified và bộ tool Vercel 31.0.0 cài trong thư mục
tạm riêng (không dependency runtime và không cài global):

```sh
node scripts/check-vercel-artifacts.mjs \
  --source /PRIVATE/CLEAN_SOURCE/SilentStation \
  --output /PRIVATE/OWNED_ARTIFACT_OUTPUT \
  --tools /PRIVATE/ISOLATED_BUILDER_TOOLS \
  --snapshot SOURCE_SNAPSHOT_ID
```

Gate build từng adapter, đo file bytes, kiểm tra SQL/knowledge, private path và
import module từ **bundle độc lập** trên Node 22, không request DB/provider.
Manifest luôn `actualCloudBuild=false`. Không thay chứng cứ actual Preview
HTTPS/cookie/SMTP hoặc runtime Linux bằng SDK local. Nếu gate schema/file/module
fail thì không push/deploy để thử may rủi; sửa rồi chạy lại trên cùng source mới.
