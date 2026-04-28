# Hệ thống OTP: Email và SMS

## 1) Email OTP

### Cách hoạt động
1. Người dùng nhập email.
2. Backend sinh mã OTP ngẫu nhiên (thường 6 chữ số).
3. Backend lưu bản băm OTP + thời hạn (TTL) vào DB/cache.
4. Hệ thống gửi OTP qua email.
5. Người dùng nhập OTP để xác minh.

### Ưu điểm
1. Chi phí thấp.
2. Triển khai nhanh.
3. Dễ áp dụng cho luồng đăng ký, quên mật khẩu, xác minh tài khoản.

### Nhược điểm
1. Có thể vào thư rác/spam.
2. Độ trễ email không ổn định theo từng nhà cung cấp.
3. Trải nghiệm có thể chậm hơn SMS.

## 2) SMS OTP

### Cách hoạt động
1. Người dùng nhập số điện thoại.
2. Backend sinh OTP và lưu bản băm + TTL.
3. Hệ thống gửi OTP qua SMS gateway.
4. Người dùng nhập OTP để xác minh.

### Ưu điểm
1. Tỷ lệ người dùng nhìn thấy OTP nhanh cao.
2. Phù hợp cho xác thực thao tác nhạy cảm.
3. Tăng độ tin cậy cho xác thực danh tính theo số điện thoại.

### Nhược điểm
1. Tốn chi phí theo từng tin nhắn.
2. Cần kiểm soát spam/fraud kỹ.
3. Phụ thuộc chất lượng nhà mạng và gateway.

## 3) So sánh nhanh

| Tiêu chí | Email OTP | SMS OTP |
|---|---|---|
| Chi phí | Thấp | Cao hơn |
| Tốc độ nhận mã | Trung bình | Nhanh |
| Độ ổn định nhận mã | Phụ thuộc inbox/spam | Phụ thuộc nhà mạng |
| Mức phù hợp đại trà | Cao | Trung bình |
| Mức phù hợp tác vụ nhạy cảm | Trung bình | Cao |

## 4) Khuyến nghị cho Trạm An

1. Mặc định dùng **Email OTP** cho học sinh và giáo viên (đăng ký, khôi phục mật khẩu).
2. Dùng **SMS OTP** cho tài khoản Admin/Superadmin hoặc thao tác rủi ro cao.
3. Cho phép cấu hình theo môi trường:
- `dev/staging`: ưu tiên email/mock OTP để tiết kiệm chi phí.
- `production`: bật email thật + SMS cho luồng nhạy cảm.

## 5) Chuẩn bảo mật nên có (áp dụng cho cả 2 kênh)

1. Không lưu OTP thô, chỉ lưu hash OTP.
2. TTL ngắn (3-5 phút).
3. Giới hạn số lần nhập sai (ví dụ: 5 lần).
4. Rate limit theo IP + tài khoản + thiết bị.
5. Khóa tạm thời nếu vượt ngưỡng.
6. Audit log cho gửi OTP, nhập sai, xác minh thành công.
7. Không trả lỗi quá chi tiết (tránh lộ thông tin tài khoản).

## 6) Quy trình triển khai thực tế (MVP)

1. Tạo bảng/collection `otp_verifications`:
- `id`, `channel` (`email`/`sms`), `target`, `otp_hash`, `expires_at`, `attempt_count`, `max_attempts`, `status`, `created_at`.
2. Tạo API:
- `POST /api/otp/send`
- `POST /api/otp/verify`
3. Gắn vào luồng:
- đăng ký tài khoản,
- quên mật khẩu,
- thao tác quản trị nhạy cảm.

## 7) Định hướng đề xuất cho giai đoạn hiện tại

1. Triển khai **Email OTP trước** để nhanh lên production demo.
2. Bổ sung **SMS OTP** ở phase sau cho phân quyền quản trị và bảo mật nâng cao.
