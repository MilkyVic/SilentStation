# Trạm An Scoring Blueprint

## 1) Mục tiêu tài liệu

Tài liệu này chuẩn hóa 2 phần:

1. Phương hướng phát triển hệ thống chấm điểm trong Trạm An.
2. Quy tắc tính điểm cho các thang đo đã xác định trong tài liệu nội dung.

Phạm vi hiện tại:

1. Nhóm test học sinh.
2. Nhóm test giáo viên.
3. Logic hiển thị kết quả theo vai trò học sinh, giáo viên, admin.

## 2) Nguyên tắc triển khai

1. Kết quả chỉ mang tính tham khảo, không thay thế chẩn đoán chuyên môn.
2. Engine chấm điểm phải tách riêng khỏi UI.
3. Mỗi thang đo có version (`score_version`) để tránh sai lệch khi cập nhật câu hỏi.
4. Lưu được cả điểm tổng, điểm từng nhóm con và phân loại mức độ.
5. Có cờ cảnh báo (`risk_flag`) để kích hoạt khuyến nghị hỗ trợ sớm.

## 3) Kiến trúc scoring đề xuất

## 3.1 Thành phần chính

1. `assessment_definitions`: định nghĩa bộ test, nhóm test, câu đảo chiều, ngưỡng phân loại.
2. `assessment_submissions`: lưu câu trả lời thô từng lần làm test.
3. `assessment_scores`: lưu điểm đã tính + phân loại + metadata.
4. `assessment_alerts`: lưu cảnh báo mức nguy cơ cao để theo dõi can thiệp.

## 3.2 Luồng xử lý

1. Người dùng nộp câu trả lời.
2. Backend kiểm tra hợp lệ dữ liệu.
3. Scoring engine tính điểm theo `assessment_code` + `score_version`.
4. Ghi kết quả vào DB.
5. Trả về payload hiển thị phù hợp vai trò.
6. Nếu vượt ngưỡng nguy cơ, tạo cảnh báo cho giáo viên/admin.

## 3.3 Chuẩn dữ liệu câu trả lời

Đề xuất chuẩn hóa mỗi câu trả lời:

1. `question_code`: mã câu.
2. `value_raw`: giá trị người dùng chọn.
3. `value_scored`: giá trị sau quy đổi.
4. `is_reverse`: có đảo chiều hay không.

## 4) Hệ thống thang điểm Trạm An

## 4.1 Môi trường học đường an toàn, thân thiện, hỗ trợ sức khỏe tâm thần

Thông tin chung:

1. Số câu: 27.
2. Số nhóm: 5.
3. Thang điểm cơ bản: 1-5.

Nhóm yếu tố:

1. An toàn và phòng chống bạo lực.
2. Tôn trọng và không kỳ thị.
3. Hỗ trợ từ giáo viên và nhà trường.
4. Môi trường học tập tích cực.
5. Nhận thức và thái độ về sức khỏe tâm thần.

Quy đổi điểm:

1. Câu bình thường: 1-5 theo mức đồng ý.
2. Câu đảo chiều: 5, 9, 17, 22.
3. Công thức đảo chiều: `score = 6 - value_raw`.

Phân loại theo điểm trung bình:

1. `< 2.5`: Môi trường chưa tích cực.
2. `2.5 đến < 3.5`: Mức trung bình.
3. `>= 3.5`: Môi trường tích cực.

Hiển thị:

1. Học sinh: điểm tổng + mức độ.
2. Giáo viên/Admin: điểm tổng + điểm theo từng nhóm yếu tố.

Lưu ý triển khai:

1. Cần bảng mapping chính thức `question -> group` để tính điểm nhóm ổn định.

## 4.2 SDQ-25 (Strengths and Difficulties Questionnaire)

Thông tin chung:

1. Số câu: 25.
2. Số nhóm: 5 nhóm, mỗi nhóm 5 câu.

Quy đổi điểm:

1. Câu bình thường: `Không đúng=0`, `Đúng một phần=1`, `Chắc chắn đúng=2`.
2. Câu đảo chiều: 7, 11, 14, 21, 25.
3. Câu đảo chiều quy đổi ngược: `Không đúng=2`, `Đúng một phần=1`, `Chắc chắn đúng=0`.

Điểm tổng khó khăn:

1. Cộng 4 nhóm: Cảm xúc, Hành vi, Tăng động, Quan hệ bạn bè.
2. Thang điểm: 0-40.

Phân loại tổng khó khăn:

1. 0-13: Bình thường.
2. 14-16: Cần lưu ý.
3. 17-40: Nguy cơ cao.

Phân loại Prosocial (hành vi xã hội tích cực):

1. 6-10: Tốt.
2. 5: Cần lưu ý.
3. 0-4: Thấp.

Hiển thị:

1. Học sinh: tổng điểm khó khăn + mức độ.
2. Giáo viên/Admin: tổng điểm + 5 thang con.

## 4.3 PHQ-9

Thông tin chung:

1. Mỗi câu: 0-3.
2. Tổng điểm: 0-27.

Phân loại:

1. 0-4: Bình thường.
2. 5-9: Trầm cảm tối thiểu.
3. 10-14: Trầm cảm nhẹ.
4. 15-19: Trầm cảm trung bình.
5. 20-27: Trầm cảm nặng.

Hiển thị:

1. Học sinh: tổng điểm + mức độ.
2. Nếu điểm `>=10`: thêm khuyến nghị tìm hỗ trợ.
3. Giáo viên/Admin: tổng điểm + mức độ + thống kê theo lớp/trường.

## 4.4 GAD-7

Thông tin chung:

1. Mỗi câu: 0-3.
2. Tổng điểm: 0-21.

Phân loại:

1. 0-4: Lo âu tối thiểu.
2. 5-9: Lo âu nhẹ.
3. 10-14: Lo âu trung bình.
4. 15-21: Lo âu nặng.

Hiển thị:

1. Học sinh: tổng điểm + mức độ.
2. Nếu điểm `>=10`: thêm khuyến nghị tìm hỗ trợ.
3. Giáo viên/Admin: tổng điểm + mức độ + mức ảnh hưởng học tập/công việc/quan hệ.

## 4.5 DASS-21 (học sinh và giáo viên)

Thông tin chung:

1. Mỗi câu: 0-3.
2. Có 3 thang: Stress, Lo âu, Trầm cảm.
3. Tổng mỗi thang = tổng điểm câu thành phần x 2.

Mapping câu:

1. Stress: 1, 6, 8, 11, 12, 14, 18.
2. Lo âu: 2, 4, 7, 9, 15, 19, 20.
3. Trầm cảm: 3, 5, 10, 13, 16, 17, 21.

Phân loại Stress:

1. 0-14: Bình thường.
2. 15-18: Nhẹ.
3. 19-25: Vừa.
4. 26-33: Nặng.
5. >=34: Rất nặng.

Phân loại Lo âu:

1. 0-7: Bình thường.
2. 8-9: Nhẹ.
3. 10-14: Vừa.
4. 15-19: Nặng.
5. >=20: Rất nặng.

Phân loại Trầm cảm:

1. 0-9: Bình thường.
2. 10-13: Nhẹ.
3. 14-20: Vừa.
4. 21-27: Nặng.
5. >=28: Rất nặng.

Hiển thị:

1. Học sinh/Giáo viên: hiển thị riêng 3 thang, không gộp 1 điểm chung.
2. Admin: thêm phân tích tập thể theo lớp/trường.

## 4.6 MBI (Maslach Burnout Inventory) cho giáo viên

Cấu trúc thang:

1. EE (Kiệt sức cảm xúc): câu 1, 2, 3, 6, 8, 13, 14, 16, 20.
2. DP (Giảm đồng cảm/xa cách): câu 5, 10, 11, 15, 22.
3. PA (Hiệu quả công việc): câu 4, 7, 9, 12, 17, 18, 19, 21.

Ngưỡng EE:

1. 0-16: Thấp.
2. 17-26: Trung bình.
3. >=27: Cao.

Ngưỡng DP:

1. 0-6: Thấp.
2. 7-12: Trung bình.
3. >=13: Cao.

Ngưỡng PA:

1. >=39: Tốt.
2. 32-38: Trung bình.
3. <=31: Thấp.

Điều kiện nguy cơ burnout cao:

1. EE cao.
2. DP cao.
3. PA thấp.

Hiển thị:

1. Giáo viên: điểm EE, DP, PA + mức độ + gợi ý hỗ trợ.
2. Admin: điểm chi tiết + biểu đồ theo 3 yếu tố.

## 5) Quy tắc cảnh báo và can thiệp sớm

Đề xuất tạo `risk_flag=true` khi:

1. SDQ tổng khó khăn >= 17.
2. PHQ-9 >= 10.
3. GAD-7 >= 10.
4. DASS bất kỳ thang nào ở mức Nặng/Rất nặng.
5. MBI thỏa điều kiện burnout cao.

Luồng khi có cảnh báo:

1. Ghi vào `assessment_alerts`.
2. Hiện trong dashboard giáo viên/admin.
3. Có checklist can thiệp ban đầu và lịch theo dõi.

## 6) API scoring đề xuất

Các endpoint chính:

1. `POST /assessments/:code/submit`: nộp câu trả lời + chấm điểm.
2. `GET /assessments/:code/latest`: lấy kết quả gần nhất của người dùng.
3. `GET /assessments/:code/history`: lịch sử làm test.
4. `GET /admin/assessments/alerts`: danh sách cảnh báo.

Payload trả về nên gồm:

1. `total_score`.
2. `subscale_scores`.
3. `classification`.
4. `risk_flag`.
5. `recommendations`.
6. `score_version`.

## 7) Lộ trình phát triển scoring module

Phase A - Chuẩn hóa dữ liệu:

1. Chốt mapping câu hỏi cho tất cả test.
2. Đóng gói scoring config JSON theo từng test.
3. Viết unit test cho từng công thức tính.

Phase B - Tích hợp backend:

1. Tạo bảng submissions và scores.
2. Tích hợp endpoint submit + history.
3. Tạo cảnh báo tự động theo ngưỡng.

Phase C - Dashboard và vận hành:

1. Dashboard theo lớp, trường, vai trò.
2. Theo dõi xu hướng theo thời gian.
3. Nhật ký can thiệp và phản hồi.

Phase D - Nâng cao:

1. Chuẩn hóa migration tool cho schema scoring.
2. Bổ sung export báo cáo theo kỳ.
3. Bổ sung kiểm định chất lượng dữ liệu và phát hiện bất thường.

## 8) Checklist implementation

1. Có test tự động cho công thức của tất cả thang đo.
2. Có kiểm tra câu đảo chiều đúng danh sách.
3. Có lưu score version cho mỗi kết quả.
4. Có phân quyền hiển thị theo vai trò.
5. Có cờ cảnh báo và luồng xử lý sau cảnh báo.
6. Có thông điệp đạo đức: không thay thế chẩn đoán chuyên môn.

## 9) Tên file liên quan trong codebase

1. `AUTH_API_CONTRACT.md`.
2. `AUTH_ROLE_LOGIN_ROADMAP.md`.
3. `DEPLOY_AUTH_BACKEND.md`.
4. `server/auth-core.ts` và các route auth hiện có.

Tài liệu này là chuẩn để triển khai module chấm điểm tiếp theo trong Trạm An.
