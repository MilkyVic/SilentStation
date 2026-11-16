> HISTORICAL RECORD — Các bước triển khai/acceptance cũ đã được thay bằng native/Vercel–Neon. Không chạy theo runbook này. Xem docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md; code/phiếu/version lịch sử không bị đổi.

# Mã mời khảo sát, theme và Việt–Anh — handoff

## Contract và cách ly
- Migration **008_survey_invitations_preferences.sql** là additive; ledger/checksum cũ không thay đổi. Readiness yêu cầu schema mới. Startup/health không migrate/seed.
- Mã lớp vẫn là mã đăng ký của GVCN. Mã `KS-` là link mời công khai, không phải auth token hoặc định danh học sinh; không có link từ response/session sang invitation/issuer.
- Teacher phải active, có school ID/phân công còn hiệu lực; campaign bật `teacher_distribution_enabled`. Bộ môn và GVCN có cùng quyền phát, không có cùng quyền roster/mã lớp.
- Tạo/thu hồi dùng request ID; revoke dùng revision. Transaction tạo phiên dùng cùng lock thứ tự với account writes và khóa campaign/invitation để xử lý revoke/close/disable.
- Mã hết hạn hoặc thu hồi chặn phiên mới, không xóa nháp. Đóng campaign chặn save/submit và thu hồi mã vĩnh viễn; GET thông tin/nháp/receipt vẫn tôn trọng phiên 24 giờ.
- Campaign link cũ không bypass mã mời. Client cũ chưa gửi contract mới nhận INVITATION_REQUIRED, không tạo dữ liệu mơ hồ.
- Tắt phát cho giáo viên thu hồi mã teacher của campaign. Disable/chuyển assignment thu hồi mã liên quan cùng transaction; logout/đổi mật khẩu không tự thu hồi link phân phối công khai.
- `SURVEY_REAL_COLLECTION_ENABLED=false` vẫn là cấu hình bàn giao. Các test gate thu thật chỉ dùng DB disposable và phục hồi flag trong finally; không đổi runtime người dùng.

## Preferences và i18n
- `GET/PATCH /api/auth/me/preferences`: theme light/dark/system, locale vi/en, revision độc lập; PATCH có expectedUserId, expectedPreferencesRevision và requestId.
- Profile revision/form không bị reset vì lưu preference. Callback pending của account trước bị vô hiệu khi đổi owner.
- `ss.ui.preferences.v1` chỉ chứa theme/locale; không có ID tài khoản, token, đáp án hoặc profile. Không dùng nó làm auth.
- Dictionary UI chạy local; không dùng dịch vụ dịch bên ngoài. Role/scope/route và dữ liệu gửi API giữ canonical values; text specialist/consent/history không dịch hoặc lưu đè.
- Print A–J/QR giữ trắng/đen; QR sinh local và lazy-load dependency. Sai public origin khiến phát mã unavailable, không lấy request Host làm URL.

## API mới
- GET `/api/surveys/distribution/campaigns`
- GET/POST `/api/surveys/distribution/campaigns/:id/invitations` (list 50, cursor)
- POST `/api/surveys/distribution/invitations/:id/revoke`
- GET `/api/surveys/invitations/:code`
- Session existing: nhận invitationCode cho lượt mới, không cần mã khi khôi phục phiên còn hiệu lực.
- GET/PATCH `/api/auth/me/preferences`
- Express/Vercel dùng cùng core. Grant raw/export không thay đổi.

## Cấu hình URL
`SURVEY_PUBLIC_BASE_URL` là origin canonical (không credentials/path/query/hash), mặc định lấy APP_URL nếu chưa đặt. Production bắt buộc HTTPS. QR của acceptance qua SSH tunnel/localhost chỉ dùng được trên máy có tunnel, không chứng minh điện thoại khác truy cập được.

## LAN HTTP — chỉ thao tác sau ủy quyền chạy riêng
Không mở LAN từ build/test mặc định. Giữ 4188/4189 nguyên trạng. Người vận hành chọn private IPv4 thực sự của interface Wi-Fi và cổng còn trống; nếu thiếu IP/port hoặc port bận thì dừng, không kill tiến trình khác.

```sh
# Trước đó: clean install Node 22, npm run lint/test/build:api/build:acceptance.
# Build production frontend với banner TEST, không dùng demo role switch:
VITE_ACCEPTANCE_BANNER=true npx vite build --outDir .acceptance/ui-lan
# Thay IP bên dưới bằng private IPv4 của interface đã chọn; không dùng 0.0.0.0:
SS_LAN_BIND=192.168.1.50 SS_LAN_CONFIRM=TEST_ONLY \
SS_WEB_PORT=4212 SS_WEB_ORIGIN=http://192.168.1.50:4212 \
SS_WEB_BUILD=.acceptance/ui-lan SS_WEB_CREDENTIAL_FILE=.acceptance/ui-lan-credentials.json \
node scripts/test-web-db.mjs
```

Launcher tạo cluster/DB giả mới, API/PG chỉ loopback, web bind đúng private IP; không đổi firewall/router/context host. Credential ngẫu nhiên là operator material mode0600, không đưa vào evidence. Dừng launcher chỉ xóa cluster/credential của launcher này; không dùng nó giữ dữ liệu nghiên cứu.

1. Người vận hành dùng fixture Admin trên máy chủ để tạo/mở campaign TEST, bật teacher distribution nếu cần.
2. Teacher/Admin phát QR với origin LAN đã cấu hình.
3. Điện thoại cùng Wi-Fi quét camera, **không đăng nhập quản trị**, không nhập dữ liệu thật.
4. Xác nhận thông tin campaign, đồng thuận, start/resume/revoke và receipt bằng dữ liệu giả.
5. Ghi evidence chỉ PASS/FAIL, viewport, snapshot và transport; không kèm OTP/password/cookie/đáp án.

HTTP LAN không xác minh TLS/Secure cookie. Không thay production cookie policy hoặc cài CA/trust store để làm bước này pass. Gate Docker HTTPS/Mailpit actual-image vẫn bắt buộc trên máy Docker được chọn; không tự deploy hoặc mở pilot.

## Kiểm thử/package
- Unit, integration disposable, Chromium actual compiled API và UI/print dùng cổng/DB riêng.
- Test QR bằng decoder độc lập jsQR, không chỉ nhìn ảnh QR hoặc mở URL biết trước.
- E2E kiểm tra teacher bộ môn, revoke, resume, preference khác thiết bị, unsaved profile, system media và mobile.
- Bốn role guides ở docs/user-guides. Archive mới gồm cả untracked source/docs, không dùng git archive HEAD; không chứa .acceptance/.git/.env/credential/DB/folder nguồn.
- Giải nén sạch, frozen install Node22 và build/test lại trước bàn giao. Snapshot trước vòng này không đại diện code mới.
- Evidence local không thay bằng chứng điện thoại hoặc Docker. Các gate chưa chạy được phải ghi pending, không báo nghiệm thu hoàn tất.
- Rollback giữ schema/data; reader cũ không hiểu 008 và gate mã mời không dùng làm đường rollback. Không down-migrate/reset/prune.
