> HISTORICAL RECORD — Các bước triển khai/acceptance cũ đã được thay bằng native/Vercel–Neon. Không chạy theo runbook này. Xem docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md; code/phiếu/version lịch sử không bị đổi.

# Trạm An 1.0.1 — bàn giao vòng fix

## Phạm vi đã triển khai

- Editor đọc bank đầy đủ qua management GET trước khi lưu. Metadata-only không gửi questionList. expectedVersion chặn ghi đè; bank system khóa; active+empty bị từ chối. Field time/icon/color chưa có persistence bị khóa rõ.
- Legacy rounds dùng server draftId, definitionDigest, revision và TTL 24h. Chọn bằng option ID, server ánh xạ trọng số. Save/submit/version checks và full snapshot cùng transaction; draftId chỉ tạo một attempt. Version thay đổi/unversioned draft yêu cầu xác nhận restart, không chuyển đáp án hoặc sửa lịch sử.
- Save queue không bị poisoned bởi lỗi mạng, đối chiếu ACK mất chỉ khi server state đúng bản ghi đó. Async scoped theo campaign/round; double-click step được chặn. Submit unknown outcome replay cùng request thay vì PUT lại nháp đã nộp. Receipt A–J có thể đọc lại khi đợt vừa đóng, trong TTL phiên.
- Report không fallback API rỗng/lỗi sang dữ liệu cached; unknown/unreviewed không thành 0/ngưỡng stress chung. Lịch sử giữ giá trị/nhãn đã lưu.
- Policy PATCH xử lý explicit null; hồ sơ đợt đang mở bị khóa ở backend; state change+audit atomic. Grant list/candidate picker/revoke được hoàn thiện; khác trường/không role vẫn bị từ chối.
- Crisis reply/prompt không xin số điện thoại hoặc hứa can thiệp tức thời. Gemini timeout 15s, fallback hiển thị rõ. DEMO chặn provider ở service layer.
- UI unavailable giữ bố cục, giải thích; không thu mật khẩu cho chức năng chưa có. Hủy/Đóng hoạt động. Menu/hash/history, logout xác nhận backend và status API được sửa. Badge/PDF đã duyệt giữ nguyên.
- Release phần mềm 1.0.1; A–J, definition/consent/scoring versions và migration 001–005 không thay đổi.

## Contract mới

- GET `/api/tests/templates/:id`: management detail kể cả test đóng, có currentVersion/digest/bank; Admin chỉ custom do mình tạo, Superadmin đọc system metadata.
- PATCH/publish/archive yêu cầu expectedVersion. questionList omitted=không thay bank; explicit empty chỉ khi closed+confirmEmptyQuestionBank.
- POST `/api/tests/drafts/:id` bắt đầu/resume. GET đọc descriptor; unversioned/version changed/expired không trả đáp án dưới bank mới. PUT cần draftId/digest/revision/option-ID map; DELETE xác định đúng round/revision.
- POST `/api/tests/submit` xác nhận với nháp đã lưu, không tin score; replay cùng draftId trả attempt cũ. Old numeric-only writer cần refresh.
- GET `/api/surveys/admin/campaigns/:id/grant-candidates` chỉ Superadmin; metadata tối thiểu, active Admin cùng trường hoặc Superadmin. Revoke grant hiện hữu vẫn được khi người nhận bị khóa.
- Ready có release/snapshot ID an toàn. Bearer/cookie vẫn giữ; anonymous cookie không liên kết tài khoản.
- Migration 006 chỉ additive nullable provenance/identity và unique attempt per draft. Không tự baseline, re-score hoặc backfill lịch sử.

## Dependency: hai điều chỉnh so với plan

Các mục khác theo plan; **Lodash 4.18.1** thay 4.18.0 vì publisher đánh dấu 4.18.0 “bad release”; **Vite 6.4.6** thay 6.4.4 vì audit còn advisory moderate ở 6.4.4. Giữ React 19/Vite major 6. esbuild override chỉ nằm dưới tsx, không ép Vite sang 0.28. Registry/config/cache chỉ theo process/project, không dùng config công ty hoặc Git credential.

## Evidence phải phân biệt

1. Unit/integration disposable: logic/DB thật trên cluster mới; không phải Docker.
2. `test:ui-print`: Chromium demo fixture/real UI, badge và PDF actual print media.
3. `test:ui-live`: production frontend + **compiled API entry** + PostgreSQL disposable, TEST banner, no role switch. Kiểm chứng localhost persistence/editor/retry/version, nhưng HTTP/test OTP transport **không chứng minh production TLS/SMTP**.
4. `tests/acceptance`: actual Docker API image qua HTTPS, verified DB/SMTP TLS và Mailpit. Chỉ được ghi PASS khi người vận hành chạy đúng snapshot trên máy Docker.

Kết quả local cuối ghi ở artifact validation ngoài archive (không sửa manifest sau package). Không đóng gate bằng chỉnh test/skip lỗi; không xem collection test là E2E pass.

## Chạy trên máy Docker

Dùng archive mới + SHA256, giải nén vào folder mới. Theo DOCKER_ACCEPTANCE_RUNBOOK: verify → preflight chỉ đọc → init/build/up/test → preview/tunnel → evidence. Namespace riêng từ snapshot; không external DB/network/volume. `/api/ready` cần release 1.0.1 và snapshotId đúng manifest. Test thất bại thì dừng và giữ volume.

Không cần cung cấp GitHub/SSH/Gmail/Gemini/production credential cho assistant. Không đổi Docker context, CA global, reverse proxy hoặc stack khác. Không bypass certificate, `curl -k`, `down -v`, reset/reseed hoặc prune. Không chạy reader cũ lên nháp option-ID mới.

## Vẫn ngoài vòng này

Thu dữ liệu thật=false; không purge responses thật. Production bootstrap/retention/backups/withdrawal/support approval và dịch vụ tài khoản mới là vòng riêng. Contact chưa được xác minh ở đây. Không benchmark 800 người, không real provider delivery, không commit/push/deploy production. Phần LegacyApp lớn/ảnh cẩm nang multi-MB vẫn là technical debt; entry bundle được kiểm riêng, không tuyên bố full performance acceptance.
