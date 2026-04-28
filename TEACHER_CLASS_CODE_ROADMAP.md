# Roadmap: Mã lớp giáo viên cho học sinh vào lớp

## 1) Mục tiêu

1. Cho phép giáo viên tạo mã lớp để học sinh đăng ký vào đúng lớp.
2. Không cho học sinh tự nhập tay lớp/trường khi dùng mã.
3. Đảm bảo an toàn dữ liệu và chịu được tải demo ~800 người dùng.

## 2) Nguyên tắc nghiệp vụ

1. Chỉ `Giáo viên chủ nhiệm` được tạo mã lớp.
2. Mỗi mã có thời hạn (`TTL`) ngắn: 5-15 phút.
3. Mã có số lượt dùng tối đa (`maxUses`).
4. Giáo viên/Admin có thể thu hồi mã trước hạn.
5. Đăng ký học sinh + tiêu thụ mã phải thực hiện trong 1 transaction.

## 3) Thiết kế dữ liệu (PostgreSQL)

Bảng đề xuất: `class_join_codes`

1. `id` (PK)
2. `teacher_id` (FK -> auth_users.id)
3. `school` hoặc `school_id`
4. `class_name`
5. `code_hash` (không lưu code thô)
6. `expires_at`
7. `max_uses`
8. `used_count`
9. `status` (`active`, `revoked`, `expired`)
10. `created_at`, `updated_at`, `revoked_at`

Index nên có:

1. `idx_class_join_codes_teacher`
2. `idx_class_join_codes_status_expires`
3. unique theo cặp `teacher_id + class_name + status='active'` (tuỳ chính sách 1 mã active/lớp)

## 4) API contract tối thiểu

1. `POST /api/class-codes/create`
- Role: `teacher` (teacherType = `homeroom`)
- Input: `className`, `ttlMinutes`, `maxUses`
- Output: `plainCode`, `expiresAt`, `maxUses`, `usedCount`

2. `POST /api/class-codes/redeem`
- Role: public/student-register flow
- Input: `code`, thông tin học sinh đăng ký
- Output: tạo tài khoản học sinh + gán lớp từ mã

3. `POST /api/class-codes/revoke`
- Role: `teacher` cùng lớp hoặc `admin`
- Input: `codeId`
- Output: trạng thái `revoked`

4. `GET /api/class-codes/active`
- Role: `teacher`, `admin`
- Output: danh sách mã đang hiệu lực của lớp/trường

## 5) Luồng nghiệp vụ chuẩn

### 5.1 Giáo viên tạo mã

1. Teacher đăng nhập.
2. Gọi API tạo mã.
3. Backend sinh `plainCode`, hash và lưu DB.
4. Frontend hiển thị mã + thời gian còn lại + lượt đã dùng.

### 5.2 Học sinh dùng mã để đăng ký

1. Học sinh nhập `username/password + code`.
2. Backend kiểm tra: tồn tại, `active`, chưa hết hạn, còn lượt.
3. Backend tạo account student và gán `school/class` từ mã.
4. Backend tăng `used_count`.
5. Nếu đạt ngưỡng, mã chuyển `expired`/`closed` theo chính sách.

## 6) Bảo mật bắt buộc

1. Rate limit nhập mã theo IP + username.
2. Giới hạn số lần nhập sai và khóa tạm.
3. Không trả lỗi quá chi tiết (tránh dò mã).
4. Lưu audit log cho các hành động:
- tạo mã
- nhập mã sai
- dùng mã thành công
- thu hồi mã

## 7) UI/UX đề xuất

1. Giáo viên:
- Nút `Tạo mã lớp`
- Card mã hiện tại: countdown, used/max
- Nút `Thu hồi` và `Tạo mã mới`

2. Học sinh:
- Form đăng ký chỉ nhập `mã lớp`
- Không cho sửa lớp sau khi redeem thành công ở bước đăng ký

3. Admin:
- Màn theo dõi mã theo trường/lớp
- Nhật ký tạo và sử dụng mã

## 8) Lộ trình triển khai

### Phase A (MVP backend)

1. Tạo schema + migration `class_join_codes`.
2. Implement API `create/redeem/revoke`.
3. Gắn redeem vào luồng register student.
4. Unit test cho case cơ bản.

Done khi:
1. Giáo viên tạo được mã.
2. Học sinh dùng mã vào đúng lớp.
3. Mã hết hạn hoặc hết lượt thì bị từ chối.

### Phase B (UI và quan sát)

1. UI teacher quản lý mã active.
2. UI student nhập mã rõ ràng.
3. Thêm audit log cơ bản.

Done khi:
1. Teacher thấy realtime trạng thái mã.
2. Admin xem được lịch sử sử dụng mã.

### Phase C (hardening production)

1. Rate limit + lockout.
2. Chống race condition khi redeem đồng thời.
3. Test tải mô phỏng 800 user.

Done khi:
1. Không ghi nhận oversubscribe lượt dùng.
2. API ổn định trong kịch bản demo trường.

## 9) Kiểm thử bắt buộc

1. Tạo mã thành công với giáo viên chủ nhiệm.
2. Giáo viên bộ môn không tạo được mã.
3. Mã sai/hết hạn/hết lượt bị chặn đúng.
4. Hai request redeem cùng lúc không vượt `max_uses`.
5. Đăng ký học sinh thành công thì `className` đúng với mã.

## 10) Cấu hình môi trường liên quan

1. `DATABASE_URL`
2. `AUTH_SESSION_SECRET`
3. `AUTH_SEED_TEST_USERS` (dev/staging)
4. Biến rate-limit (nếu dùng): `AUTH_CODE_RATE_LIMIT_*`

## 11) Gợi ý tích hợp với roadmap hiện tại

1. Giữ `auth_role_login` làm trục chính.
2. Feature mã lớp triển khai sau khi auth API ổn định.
3. Khi triển khai OTP thật, có thể yêu cầu OTP cho thao tác tạo mã mới nếu muốn tăng bảo mật.

## 12) Cập nhật tiến độ (2026-04-28)

### Phase B

1. Đã có UI cho giáo viên chủ nhiệm quản lý mã active:
- xem danh sách mã còn hiệu lực
- xem realtime số lượt dùng và thời gian hết hạn
- thu hồi mã trực tiếp
- tạo mã mới và tự động vô hiệu mã active cũ cùng lớp
2. Đã có audit log cơ bản ở backend (`created`, `revoked`, `redeem_success`, `redeem_failed`).
3. Đã có API lịch sử mã lớp `GET /api/class-codes/events`.
4. Đã có UI lịch sử mã lớp cho giáo viên chủ nhiệm và admin/superadmin trong trang tài khoản.
