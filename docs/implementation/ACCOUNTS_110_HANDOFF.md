> HISTORICAL RECORD — Các bước triển khai/acceptance cũ đã được thay bằng native/Vercel–Neon. Không chạy theo runbook này. Xem docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md; code/phiếu/version lịch sử không bị đổi.

# SilentStation 1.1.0 — Tài khoản và quản trị

## Phạm vi bàn giao

- Hồ sơ, avatar preset, điện thoại tùy chọn/chưa xác minh; không upload ảnh.
- Mật khẩu mới 15–128 Unicode code points, không trim; mật khẩu cũ vẫn được xác thực bằng scrypt.
- OTP email reset/kích hoạt Admin, dual-proof đổi email, action-bound reauthentication.
- Outbox mã hóa AES-GCM/AAD và receipts mã hóa; SMTP tối đa ba lần thử. SMTP có thể gửi lặp cùng challenge khi mất ACK (at-least-once), không tạo mã mới mỗi lần retry.
- Vô hiệu hóa/khôi phục, thu hồi phiên/credential epoch/mã/grant, audit không chứa giá trị hồ sơ hoặc secret. Không xóa tài khoản/lịch sử/phản hồi ẩn danh.
- Trường/lớp/niên khóa ID ổn định, phân công GVCN qua user ID. Niên khóa được chọn rõ theo hai năm liên tiếp, không suy từ đồng hồ.
- Snapshot school/class/academicYear của kết quả mới; lịch sử không có chứng cứ giữ `legacy_unknown`. Admin/GVCN không đọc nhóm không xác định; chủ tài khoản và Superadmin vẫn xem lịch sử.
- Báo cáo theo snapshot và bank/score version, CSV qua SQL cursor đầy đủ, không suy nguy cơ hoặc trộn trung bình khác thang.

Không thay đổi câu hỏi, trọng số, ngưỡng, definition/scoring/consent version. Không SMS, hộp thư, lịch, theme khác hoặc ngôn ngữ khác. Backend thật không đồng nghĩa tất cả dịch vụ ngoài đã được bật.

## Bật chức năng và giới hạn

`ACCOUNT_MANAGEMENT_ENABLED=true` chỉ bật sau migration 007 và đối chiếu tổ chức. Compose acceptance bật cờ này trên DB mới/dữ liệu giả; production ngoài stack không tự bật. `SURVEY_REAL_COLLECTION_ENABLED=false` giữ nguyên.

`GET /api/ready` xác nhận schema/migration/release, không xác nhận SMTP đã gửi email. `GET /api/auth/capabilities` phân biệt email transport configured/unavailable và quyền hiện hành. Không có dev OTP ở production, kể cả khi ai đặt cờ expose; chỉ `NODE_ENV=test` cùng cờ `AUTH_ACCOUNT_OTP_EXPOSE_DEV_CODE=true` cho phép mã kiểm thử.

Mỗi mutation gửi UUID `requestId`; edit gửi `expectedRevision`. Tự sửa hồ sơ/mật khẩu/vô hiệu hóa gửi `expectedUserId` để chặn callback/màn của tài khoản trước. Conflict là 409, không ghi đè. Retry giữ nguyên body/requestId; sau critical operation chỉ trả ACK tối thiểu, không cấp phiên mới.

## Mapping cũ — không chạy tự động

Schema migration không sửa điểm, version hoặc đoán school/class/niên khóa cũ. Tạo tổ chức trước, soát mapping JSON riêng:

```json
{"users":[{"id":"existing-id","expectedRevision":0,"oldSchool":"Tên cũ chính xác","oldClassName":"12A1","schoolId":"reviewed-school-id","classId":"reviewed-class-id","teacherType":"homeroom"}],"campaigns":[{"id":"campaign-id","oldSchool":"Tên cũ chính xác","schoolId":"reviewed-school-id"}]}
```

Campaign phải đóng trước mapping. User chưa mapping có thể dùng hồ sơ của mình, nhưng không được quyền quản trị trường/lớp từ tên hiển thị. Không gán năm học từ ngày hiện tại. Không baseline schema lạ. Mapping sẽ thu hồi phiên/quyền phụ thuộc; không phục hồi grant khi khôi phục tài khoản.

```sh
# Chỉ trên DB đã được chọn/ủy quyền riêng. Mặc định chỉ dry run/rollback:
node dist-server/server/accounts/mapping.js /private/operator-reviewed-mapping.json
# Commit sau kiểm tra và ủy quyền rõ ràng, không dùng trên DB shared/production mặc định:
ACCOUNT_MAPPING_CONFIRM=yes node dist-server/server/accounts/mapping.js /private/operator-reviewed-mapping.json
```

## Local kiểm chứng không-demo, không ảnh hưởng 4188

Yêu cầu Node 22 và PG_BIN của PostgreSQL 16 đã cài; không tự cài hoặc đổi host config.

```sh
npm run build:api
VITE_ACCEPTANCE_BANNER=true npx vite build --outDir .acceptance/ui-110
SS_WEB_PORT=4189 SS_WEB_ORIGIN=http://localhost:4189 \
  SS_WEB_BUILD=.acceptance/ui-110 \
  SS_WEB_CREDENTIAL_FILE=.acceptance/ui-110-credentials.json \
  node scripts/test-web-db.mjs
```

Dùng `http://localhost:4189/` (host khác 127.0.0.1 để tách cookie khỏi 4188). Không dùng demo role switch, không API/auth fallback. Credential ngẫu nhiên chỉ trong file mode 0600 của project, không log. Launcher tạo DB/cluster mới và xóa **chính DB/credential đó khi dừng**; đây không phải nơi lưu dữ liệu nghiên cứu hoặc database lâu dài. Giữ 4188 nguyên trạng.

## Kiểm thử và Docker

```sh
npm run lint
npm test
npm run test:integration
npm run build:api
npm run build:acceptance
npm run test:ui-live
npm run test:ui-print
```

Không chạy `test:ui-live` mặc định nếu 4188 đang có phiên người dùng; dùng port/origin/build/credential riêng như trên hoặc test harness tạo stack khác. OTP test tôn trọng cooldown và dùng session cache, không tăng quota backend để test pass.

Compose acceptance dùng Mailpit TLS nội bộ; worker guarded gọi cả survey maintenance và account outbox. E2E actual-image kiểm tra OTP từ Mailpit, không dev code/ignoreHTTPSErrors. Xác nhận thêm HTTPs, cookie Secure, restart persistence và image/base digests trên máy Docker được chọn. Local Node/PG/Chromium không thay thế chứng cứ Docker.

## Rollback / điều chưa được thực hiện

- Không restart/reset DB 4188; không reset/down-migrate DB production hoặc xóa volume.
- Không rollback sang reader không hiểu snapshot/credential epoch/007. Giữ schema/data; dùng release/feature gate đã kiểm chứng.
- Không push, dùng GitHub/SSH credential, đổi global trust store, gửi Gmail/Gemini/SMS thật hoặc mở pilot.
- Clean source archive + manifest bao gồm code chưa tracked, loại secrets/.git/.acceptance/DB/input folder. Evidence không bao gồm password, OTP, cookie hoặc phản hồi thô.
- Docker/Mailpit TLS acceptance phải được operator chạy và gửi evidence đúng snapshot trước khi công bố nghiệm thu vận hành.
