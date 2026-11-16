# Quyết định vận hành: Neon chỉ có nhánh Production

Quyết định của người vận hành ngày 2026-11-16 thay thế phương án tạo nhánh
Neon QA/development trong runbook 1.1.1 trước đó.

- Project Neon của ứng dụng chỉ giữ nhánh `production` hiện có.
- Form `qa-1740d60543cb` đã hủy trước khi bấm Create; không có tài nguyên QA để xóa.
- Không tạo nhánh QA, project QA thay thế hoặc DB/schema TEST trong Production
  nếu chưa được người vận hành yêu cầu riêng.
- Không seed fixture, phản hồi giả, phiên/OTP/grant/lịch sử local vào Neon thật.
- Năm tài khoản được chọn để import là tài khoản vận hành chính thức; không có
  hạn QA 30 ngày. Superadmin mới không ghi đè tài khoản `superadmin` cũ.

## Gate thay thế, không bỏ kiểm thử

1. Kiểm thử các flow và rehearsal schema bằng PostgreSQL disposable local/CI
   cô lập. PostgreSQL 17 phải được kiểm tra riêng; kết quả PG16 không được coi
   là bằng chứng PG17. Không cài dịch vụ hoặc thay cấu hình host ngầm.
2. Build/kiểm tra artifact và module Node22 không cần ghi DB Production. SDK
   local không thay kết quả build/runtime thực tế trên Vercel.
3. Đọc preflight Production, đối chiếu school/class/year, chuẩn bị backup mã
   hóa và restore rehearsal ở môi trường cô lập.
4. Dừng tại checkpoint trước khi đổi credential/quyền DB, migrate, import,
   commit/push hoặc deployment Production. Một nhánh không đồng nghĩa được
   phép thử nghiệm trực tiếp hay ghi dữ liệu giả lên DB thật.
5. Trong cửa sổ bảo trì đã được duyệt: drain legacy writer, migrate additive,
   import tài khoản chính thức rồi deploy artifact đã kiểm thử.
6. Kiểm tra HTTPS/cookie/readiness, OTP và quyền của các tài khoản vận hành
   trên deployment thật theo kế hoạch smoke được duyệt; không submit khảo sát
   A–J giả hoặc load test vào Production.

Khả năng lỗi chỉ xuất hiện trên cloud vẫn là gate pending cho tới khi có
bằng chứng runtime thật. Không tuyên bố hết lỗi chỉ vì local xanh.
`SURVEY_REAL_COLLECTION_ENABLED=false` và scheduler vẫn tắt; không nâng gói,
reset/down-migrate/reseed/xóa dữ liệu để làm gate pass.

## PG17 gate và rehearsal (dữ liệu tổng hợp, không phải backup thật)

Runtime QA PostgreSQL 17.12 được build từ source upstream đã đối chiếu SHA-256,
trong thư mục tạm riêng; không cài service hoặc đổi PostgreSQL16/DB 4189. Chạy
với `PG_BIN` chỉ cho process QA, không sửa PATH/host configuration toàn cục.

```sh
PG_BIN=/PRIVATE/ISOLATED_PG17/bin npm run test:integration
PG_BIN=/PRIVATE/ISOLATED_PG17/bin npm run test:native
PG_BIN=/PRIVATE/ISOLATED_PG17/bin npm run test:ui-live
PG_BIN=/PRIVATE/ISOLATED_PG17/bin npm run test:pg17-restore
```

Restore runner không nhận DSN bên ngoài: chỉ tạo cluster TLS loopback mới, hai
DB mới đúng namespace và dữ liệu tổng hợp 8 account/6 kết quả/6 bank. Nó kiểm
tra custom dump PG17, AES-GCM/wrong-key/tampering, restore file đã decrypt và
xác minh tag, fingerprint toàn bộ cột cũ, baseline schema reordered 001/002,
migration 003–009 và rerun. Không copy profile, password, đáp án hoặc dữ liệu
Production; output chỉ counters và kết quả gate. Failed rehearsal giữ vật liệu
private để điều tra; không reset DB khác. Các account tổng hợp không được
chuyển thành account vận hành hoặc nhập vào Neon.

Bằng chứng này **không thay backup Production**. Backup mã hóa thực tế và restore
rehearsal của backup đó vẫn phải được ủy quyền trước khi đọc/chuyển dữ liệu thật.
Không lấy fake rehearsal xanh làm phép migrate Production.

## Cập nhật quyết định: niên khóa thiết lập sau
Người vận hành xác nhận `Amsterdan = Amsterdam` và không yêu cầu gán niên khóa khi bootstrap. Chỉ tạo trường/gán school ID; không tạo lớp hay suy năm. Mapping/import có `deferClassAssignment: true` khi cần; profile GVCN không đồng nghĩa có phân công GVCN. class ID trống thì roster/mã lớp vẫn bị chặn tại backend. Admin xác nhận lớp + niên khóa sau; giáo viên cung cấp thông tin, không được tự nâng quyền. Các kết quả cũ tiếp tục `legacy_unknown`, không backfill.

## Checkpoint trước push release 1.1.1

- Backup Production đã được mã hóa và restore/rehearsal riêng trên PG17.12.
- Ledger 001–009 và preflight schema Production đã pass; không sửa checksum
  migration cũ, điểm hoặc lịch sử.
- Năm tài khoản vận hành được import, không gắn QA/expiry. Tổng hiện có 13 tài
  khoản, 2 trường và 0 lớp; niên khóa/phân lớp do Admin thiết lập sau.
- Role DB runtime riêng không có quyền owner/DDL hay truy cập `neon_auth`.
  Credential chỉ nằm trong Secret Production, không ở source/archive.
- `git.deploymentEnabled=false` trong `vercel.json` tắt tự deploy từ Git.
  Push/merge không thay cho ủy quyền deploy. Triển khai thủ công đúng commit
  đã nghiệm thu; không Resume bản cũ trong khi project đang Paused.
- Sau khi có bằng chứng build/runtime thật, người vận hành có thể ủy quyền bật
  lại auto-deploy bằng thay đổi cấu hình riêng. Không bật scheduler hay thu
  dữ liệu thật cùng lúc với push.

Gate còn lại: cloud build/HTTPS/cookie/readiness và email/OTP thực tế. Kết quả
SDK local về kích thước function không thay bằng chứng build Vercel.
