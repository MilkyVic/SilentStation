# Phase 0 - Baseline Checklist

Ngày chạy baseline: **2026-05-05**

## Mục tiêu
Đóng băng trạng thái kỹ thuật trước khi tích hợp frontend handbook chi tiết.

## Kết quả lệnh
1. `npm run build:api`: PASS
2. `npm run build`: PASS
3. `npm run lint`: PASS sau khi loại thư mục tham chiếu `trạm-an (1) (1)` khỏi `tsconfig.json`

## Ghi chú phát hiện
1. Thư mục tham chiếu `trạm-an (1) (1)` chứa code mẫu không dùng trực tiếp cho production, nếu để TypeScript quét chung sẽ gây fail lint.
2. Project chính đã tách kiểm soát bằng `exclude` trong `tsconfig.json`.

## Checklist baseline chức năng (để test tay)
1. Đăng nhập đủ role: student / teacher / admin / superadmin.
2. Kiểm tra catalog test hiển thị theo role.
3. Nộp kết quả test và xem lịch sử test cá nhân.
4. Kiểm tra chatbot gửi/nhận bình thường.
5. Kiểm tra quản lý admin bằng superadmin.
