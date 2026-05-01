# SMS OTP Roadmap (Version Sau)

## Mục tiêu

- Chuyển lớp 2FA của `admin/superadmin` từ email OTP sang SMS OTP trong bản phát hành tiếp theo.
- Giữ cơ chế fallback email OTP khi SMS provider lỗi hoặc vượt rate limit.
- Đảm bảo chi phí dự đoán được và có khả năng mở rộng khi số trường tăng.

## Trạng thái hiện tại

- `admin/superadmin` đang xác thực đăng nhập bằng **email OTP** (2 bước).
- `student/teacher` đang dùng OTP email cho đăng ký.
- OTP hiện có cơ chế: TTL, attempts, cooldown, dev code.

## Phạm vi bản SMS OTP

- Chỉ áp dụng cho đăng nhập `admin/superadmin` ở phase đầu.
- Chưa áp dụng cho `student/teacher` để tránh tăng chi phí vận hành quá sớm.

## Kiến trúc đề xuất

1. `OtpProvider` interface (strategy pattern)
- `sendOtp({ channel, destination, content, metadata })`
- `channel = sms | email`

2. Provider triển khai
- `SmsProvider` (Twilio/eSMS/SpeedSMS/VietSMS - chọn 1 chính, 1 backup)
- `EmailProvider` (Gmail SMTP hoặc provider email production)

3. Routing policy
- Với `admin/superadmin`: ưu tiên SMS.
- Nếu SMS fail: fallback email (có cờ cấu hình).

4. Audit log
- Lưu `provider`, `channel`, `cost_estimate`, `error_code`, `delivery_status`.

## Thiết kế dữ liệu

Mở rộng bảng OTP quản trị:

- `channel` (`sms|email`)
- `destination_masked`
- `provider`
- `provider_message_id`
- `delivery_status` (`queued|sent|failed`)
- `last_error`

## Cấu hình môi trường (đề xuất)

- `AUTH_ADMIN_OTP_CHANNEL=sms`
- `AUTH_ADMIN_OTP_FALLBACK_EMAIL=true`
- `AUTH_ADMIN_OTP_PROVIDER=esms` (hoặc twilio/speedsms/...)
- `AUTH_ADMIN_OTP_SMS_FROM=...`
- `AUTH_ADMIN_OTP_SMS_TEMPLATE=...`
- `AUTH_ADMIN_OTP_COST_LIMIT_DAILY=...`

## Bảo mật và chống lạm dụng

- Rate limit theo `username + IP + device fingerprint`.
- Cooldown gửi lại OTP (>= 30s).
- Khóa tạm sau N lần nhập sai.
- Chặn dải số rủi ro / anti-SMS pumping.
- Không log OTP plaintext ở production.

## Kế hoạch triển khai theo phase

### Phase S1: Provider abstraction
- Tách logic gửi OTP khỏi auth-core.
- Chuẩn hóa response OTP challenge cho nhiều channel.

### Phase S2: Tích hợp provider SMS chính
- Tích hợp API provider.
- Mapping lỗi provider -> `AUTH_OTP_*` chuẩn.

### Phase S3: Fallback + observability
- Bật fallback email tự động khi SMS fail.
- Dashboard nội bộ: tỉ lệ gửi thành công, latency, chi phí/ngày.

### Phase S4: Production rollout
- Canary 10% admin accounts -> 50% -> 100%.
- Theo dõi lỗi trong 7-14 ngày rồi bỏ fallback nếu ổn định.

## Tiêu chí nghiệm thu

- OTP SMS gửi thành công >= 98% cho số VN.
- P95 thời gian nhận OTP < 20 giây.
- Không phát sinh brute-force bypass.
- Có log đủ để truy vết khi khiếu nại.

## Rủi ro chính

- Delay OTP theo từng nhà mạng.
- Giá SMS thay đổi theo sản lượng/thời điểm.
- Nội dung mẫu OTP bị từ chối duyệt (brandname/compliance).

## Gợi ý vận hành

- Giai đoạn đầu dùng SMS cho `admin/superadmin` trước để kiểm soát chi phí.
- Dùng email OTP làm fallback trong ít nhất 1 release cycle.
- Chốt 2 nhà cung cấp: 1 chính + 1 dự phòng.
