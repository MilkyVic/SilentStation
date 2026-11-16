# Deploy SilentStation: Vercel + Neon

Đây là hướng triển khai, không phải bằng chứng project cloud đã kết nối hoặc được phép thu dữ liệu thật. Runbook hiện hành: [native acceptance/cloud gates](docs/implementation/NATIVE_ACCEPTANCE_RUNBOOK.md).

1. Chọn đúng Vercel project/environment và Neon development database riêng. Không trộn fixture với DB thật.
2. Đặt DATABASE_URL, DB_TLS_MODE=verify-full, APP_URL/AUTH_API_CORS_ORIGIN HTTPS, AUTH_SESSION_SECRET riêng và CRON_SECRET. Không VITE_ secret, không credential global; giữ secret cũ khi DB chứa dữ liệu mã hóa/phiên cần bảo toàn.
3. App DATABASE_URL không có tham số SSL override; cấu hình TLS qua DB_TLS_MODE. Direct cho migration, pooled cho runtime theo preflight.
4. Read-only kiểm tra schema/ledger; backup và ủy quyền migration additive trước. Không startup seed/baseline tự động/restore đè.
5. Vercel API gọi cùng core, include SQL/knowledge files; actual hosted HTTPS/cookie/CSRF/SMTP/grant/regression phải nghiệm thu riêng.
6. Hobby không được cấu hình Cron mỗi phút. Cloudflare Worker chỉ gọi endpoint bảo trì, mặc định tắt/no triggers; activation/account/secret/quota cần xác nhận riêng.
7. SURVEY_REAL_COLLECTION_ENABLED=false tiếp tục giữ. Secret/config không tự chuyển dữ liệu local lên Neon hoặc mở pilot.
