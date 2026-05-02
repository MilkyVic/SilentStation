# Kế hoạch tinh chỉnh hệ thống test học sinh/giáo viên (Trạm An)

## 1) Mục tiêu
- Chuẩn hóa toàn bộ bộ test theo tài liệu nghiệp vụ mới.
- Tách rõ luồng `học sinh` và `giáo viên` (nội dung, chấm điểm, hiển thị, báo cáo).
- Chuyển từ state local frontend sang kiến trúc có backend + lưu vết kết quả.
- Đảm bảo cảnh báo sớm (risk flag) nhưng vẫn tuân thủ nguyên tắc "tham khảo, không chẩn đoán".

## Trạng thái thực hiện
- Phase A: `hoàn tất`.
- Phase B: `hoàn tất` (đã có schema DB, scoring pipeline, API catalog/submit/result me/template CRUD, và API detail test theo id).
- Phase C: `đang triển khai`:
- Đã chuyển luồng làm bài sang API thật (`/api/tests/catalog`, `/api/tests/submit`, `/api/tests/results/me`).
- Đã có cơ chế lưu nháp/resume khi làm bài theo từng user + từng test.
- Đã chặn submit trùng (double submit) trong lúc đang nộp.
- Đã hiển thị mức đánh giá trả về từ backend (`scoreLevel`) trong kết quả.
- Phase D: `đang triển khai`:
- Đã thêm endpoint báo cáo tổng hợp `/api/tests/reports/overview` (lọc theo thời gian/trường/lớp, có phân quyền theo role).
- Dashboard báo cáo đã dùng dữ liệu thật: chỉ số tổng quan, trend theo tháng, phân bố nguy cơ, top bài test, top lớp cần theo dõi.
- Đã có khối "Cảnh báo rủi ro gần nhất" để theo dõi các lượt làm bài nguy cơ cao.
- Phase E: `đang triển khai`:
- Đã thêm `versioning` cho template test (`test_template_versions`) với action: `create/update/publish/unpublish/delete`.
- Đã thêm API quản trị template:
- `GET /api/tests/templates/manage`
- `GET /api/tests/templates/:id/versions`
- `POST /api/tests/templates/:id/publish`
- Đã nối màn quản trị test để Admin/Superadmin thao tác create/update/delete/publish bằng API thật thay vì chỉ local state.
- Phase F: `đang triển khai`:
- Đã thêm load test script pilot 800 user (`npm run loadtest:pilot`).
- Đã thêm endpoint theo dõi vận hành: `GET /api/tests/ops/summary?hours=...`.
- Đã thêm tài liệu pilot/hardening/runbook: `PHASE_F_PILOT_HARDENING.md`.
- Đã khởi tạo `scoring engine` cho PHQ-9, GAD-7, DASS-21 và bộ unit test nền.
- Đã áp dụng rule FE:
- Điểm `>= 10` ở các bài 1-4 sẽ gợi ý làm bài 5 (DASS-21) qua popup.
- 5 bài test lõi (`1..5`) luôn được ưu tiên hiển thị ở đầu danh sách.

## 2) Phạm vi test cần hỗ trợ

### Học sinh
- Thang đo môi trường học đường thân thiện sức khỏe tâm thần (27 câu, Likert 1-5).
- SDQ-25.
- PHQ-9.
- GAD-7.
- DASS-21.

### Giáo viên
- DASS-21.
- MBI-22 (Maslach Burnout Inventory).

### Quy tắc sở hữu bộ test (bắt buộc)
- Tất cả bài test nằm trong tài liệu chuẩn `tram_an_noi_dung (1).md` được gắn loại `system` và thuộc quyền quản trị của `Superadmin`.
- Các role thấp hơn (`Admin`, `Giáo viên`, `Học sinh`) không được sửa/xóa các bài test `system`.
- `Admin` được phép thêm bài test mới loại `custom`.
- `Giáo viên` và `Học sinh` không có quyền thêm/sửa/xóa bài test.

## 3) Quy tắc chấm điểm chuẩn hóa (theo tài liệu)

### 3.1 Môi trường học đường (27 câu)
- Thang điểm 1-5.
- Câu đảo chiều: `5, 9, 17, 22`.
- Có 5 nhóm chỉ số (an toàn, tôn trọng, hỗ trợ, môi trường tích cực, nhận thức SKTT).
- Điểm tổng = trung bình 27 câu sau đảo chiều.
- Phân loại tổng:
- `< 2.5`: môi trường chưa tích cực.
- `2.5 - < 3.5`: trung bình.
- `>= 3.5`: tích cực.
- Hiển thị:
- Học sinh: điểm tổng + mức độ.
- Giáo viên/Admin: điểm tổng + điểm từng nhóm.

### 3.2 SDQ-25
- Mỗi câu 0-2.
- Câu đảo chiều: `7, 11, 14, 21, 25`.
- 5 thang con: cảm xúc, hành vi, tăng động, bạn bè, prosocial.
- Tổng khó khăn = 4 thang đầu (0-40).
- Phân loại tổng khó khăn: `0-13`, `14-16`, `17-40`.
- Prosocial tách riêng: `6-10`, `5`, `0-4`.
- Hiển thị:
- Học sinh: tổng khó khăn + mức độ.
- Giáo viên/Admin: tổng + 5 thang con.

### 3.3 PHQ-9
- Mỗi câu 0-3, tổng 0-27.
- Phân loại: `0-4`, `5-9`, `10-14`, `15-19`, `20-27`.
- Nếu `>= 10`: thêm khuyến nghị tìm hỗ trợ.

### 3.4 GAD-7
- Mỗi câu 0-3, tổng 0-21.
- Phân loại: `0-4`, `5-9`, `10-14`, `15-21`.
- Nếu `>= 10`: thêm khuyến nghị tìm hỗ trợ.
- Với giáo viên/admin có thể hiển thị thêm mức ảnh hưởng chức năng (nếu có câu hỏi ảnh hưởng).

### 3.5 DASS-21 (học sinh và giáo viên)
- 3 thang con: Stress / Lo âu / Trầm cảm.
- Mỗi thang lấy 7 câu, cộng điểm rồi nhân `x2`.
- Hiển thị tách 3 thang (không gộp 1 điểm chung).
- Dùng ngưỡng phân loại theo tài liệu cho từng thang.

### 3.6 MBI-22 (giáo viên)
- Thang 0-6.
- 3 chỉ số:
- EE: câu `1,2,3,6,8,13,14,16,20`.
- DP: câu `5,10,11,15,22`.
- PA: câu `4,7,9,12,17,18,19,21`.
- Phân loại theo tài liệu:
- EE: thấp/trung bình/cao.
- DP: thấp/trung bình/cao.
- PA: tốt/trung bình/thấp.
- Cờ nguy cơ burnout cao khi đồng thời: `EE cao + DP cao + PA thấp`.

## 4) Thiết kế sản phẩm theo vai trò

### Học sinh
- Chỉ thấy thông tin tự thân: điểm tổng, mức độ, gợi ý tự chăm sóc ngắn.
- Không hiển thị quá kỹ thuật (không phơi toàn bộ thang con gây quá tải).
- Có CTA "Tìm hỗ trợ" khi vượt ngưỡng.

### Giáo viên
- Thấy kết quả cá nhân (DASS, MBI) + gợi ý giảm stress/burnout.
- Nếu là giáo viên chủ nhiệm: thấy dashboard lớp dạng tổng hợp ẩn danh (không lộ dữ liệu nhạy cảm cá nhân nếu chưa được cấp quyền).

### Admin/Superadmin
- Dashboard theo trường/lớp/thời gian.
- Thấy phân phối mức độ, top rủi ro theo nhóm, xu hướng theo tháng.
- Có bộ lọc theo trường/lớp/khối/bộ test.

## 5) Kiến trúc kỹ thuật cần chuyển đổi

### 5.1 Dữ liệu
Đề xuất thêm các bảng:
- `test_templates` (metadata bộ test).
- `test_questions` (câu hỏi, thứ tự, nhóm thang con, cờ đảo chiều).
- `test_options` (nhãn + điểm).
- `test_assignments` (giao test theo role/lớp/trường).
- `test_attempts` (lần làm bài).
- `test_answers` (đáp án từng câu).
- `test_scores` (điểm tổng + thang con + mức độ + risk flags).

### 5.2 API
- `GET /api/tests/catalog?role=student|teacher`
- `GET /api/tests/:templateId`
- `POST /api/tests/:templateId/submit`
- `GET /api/tests/results/me`
- `GET /api/tests/reports/*` (teacher/admin/superadmin theo quyền)
- `POST /api/tests/templates` (chỉ admin/superadmin; admin chỉ tạo `custom`)
- `PATCH /api/tests/templates/:id` (superadmin sửa mọi test; admin chỉ sửa `custom` do mình tạo)
- `DELETE /api/tests/templates/:id` (superadmin xóa mọi test; admin chỉ xóa `custom` do mình tạo; không ai xóa được `system` trừ superadmin)

### 5.3 Scoring engine
- Tạo module `server/test-scoring.ts` độc lập, test unit cho từng thang.
- Cấu hình quy tắc theo JSON (reverse items, subscales, thresholds) để dễ cập nhật.

## 6) Phân quyền & bảo mật
- Student: chỉ đọc kết quả của chính mình.
- Teacher subject: không truy cập dữ liệu lớp ngoài quyền.
- Teacher homeroom: xem tổng hợp lớp chủ nhiệm.
- Admin: xem dữ liệu trong phạm vi trường.
- Superadmin: liên trường.
- Superadmin:
- Toàn quyền với test `system` và `custom`.
- Admin:
- Được thêm test `custom`.
- Không được sửa/xóa test `system`.
- Chỉ sửa/xóa test `custom` do chính admin đó tạo.
- Teacher/Student:
- Không có quyền tạo/sửa/xóa test.
- Log audit mọi hành động xem báo cáo nhạy cảm.
- Log audit bắt buộc cho tạo/sửa/xóa test (lưu `actor_role`, `actor_id`, `template_id`, `action`, `timestamp`).
- Mã hóa dữ liệu nhạy cảm khi lưu (at-rest), ẩn thông tin cá nhân trong export mặc định.

## 7) Lộ trình triển khai (đề xuất 6 phase)

### Phase A - Chuẩn hóa bộ test và quy tắc
- Chốt bank câu hỏi + mapping thang con + ngưỡng.
- Viết file cấu hình scoring chuẩn.
- Viết unit tests chấm điểm cho từng thang.

### Phase B - Backend nền tảng
- Tạo schema DB + migration.
- Tạo API catalog, submit, result me.
- Tạo scoring pipeline khi submit.

### Phase C - Frontend làm bài
- Tách `TestTakingView` dùng API thật.
- Thêm trạng thái hoàn thành, resume, chống submit trùng.
- Hiển thị kết quả đúng theo role.

### Phase D - Dashboard giáo viên/admin
- Thêm báo cáo tổng hợp theo lớp/trường/thời gian.
- Thêm filter và biểu đồ xu hướng.
- Thêm cảnh báo mức rủi ro theo ngưỡng.

### Phase E - Quản trị bộ test
- Màn quản trị template/câu hỏi có versioning.
- Rule phân quyền cứng:
- Test `system` (đến từ file chuẩn): chỉ `Superadmin` sửa/xóa.
- `Admin` chỉ được thêm test `custom`.
- `Giáo viên/Học sinh` không có quyền thêm/sửa/xóa.
- Cơ chế publish/unpublish an toàn.

### Phase F - Pilot và hardening
- Chạy thử 1 trường (khoảng 800 user).
- Theo dõi hiệu năng submit đồng thời + dashboard.
- Hoàn thiện backup, monitor, incident runbook.

## 8) KPI nghiệm thu
- 100% bộ test trong tài liệu có scoring tự động đúng theo unit test.
- API submit kết quả p95 < 500ms ở tải bình thường.
- Không rò rỉ dữ liệu ngoài phạm vi role.
- Dashboard hiển thị đúng phân loại theo tài liệu.
- Có log audit đầy đủ cho hành động xem dữ liệu nhạy cảm.

## 9) Gap hiện tại cần xử lý ngay
- Logic test hiện còn nhiều phần nằm ở state frontend, chưa bền vững khi reload/deploy.
- Chưa có scoring engine thống nhất theo tài liệu mới.
- Chưa có persistence và báo cáo backend chuẩn cho giáo viên/admin.

## 10) Ưu tiên triển khai ngay tuần tới
- Ưu tiên 1: Phase A + B cho 2 bộ cốt lõi `PHQ-9`, `GAD-7`.
- Ưu tiên 2: thêm `DASS-21` cho học sinh và giáo viên.
- Ưu tiên 3: hoàn tất dashboard teacher/admin bản đầu.
