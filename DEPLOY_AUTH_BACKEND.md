# DEPLOY lên Vercel (Frontend + Auth API)

Project này đã hỗ trợ deploy full trên Vercel:

1. Frontend Vite static.
2. Auth API qua Vercel Functions trong thư mục `api/*`.
3. Dùng chung PostgreSQL qua `DATABASE_URL`.

## 1) Trước khi deploy

1. Đảm bảo PostgreSQL đã tạo sẵn (Neon/Supabase/Railway Postgres).
2. Lấy connection string `DATABASE_URL`.
3. Chuẩn bị secret mạnh cho `AUTH_SESSION_SECRET`.

## 2) Biến môi trường trên Vercel

Thiết lập các biến sau trong Project Settings -> Environment Variables:

1. `DATABASE_URL`
2. `AUTH_SESSION_SECRET`
3. `AUTH_ACCESS_TOKEN_TTL_SECONDS` (ví dụ `28800`)
4. `AUTH_SEED_TEST_USERS` (`false` cho production)
5. `AUTH_API_CORS_ORIGIN` (domain frontend, ví dụ `https://your-app.vercel.app`)
6. `VITE_AUTH_API_BASE_URL` để trống (`""`) nếu dùng cùng domain Vercel
7. `VITE_ENABLE_AUTH_FALLBACK=false`

## 3) Deploy

1. Push code lên GitHub.
2. Import repo vào Vercel.
3. Framework preset: Vite.
4. Build command: mặc định (`vite build`) hoặc `npm run build`.
5. Deploy.

Sau deploy:

- Frontend gọi `/api/auth/*` cùng domain.
- API route được xử lý bởi:
  - `api/auth/login.ts`
  - `api/auth/register.ts`
  - `api/auth/me.ts`
  - `api/auth/logout.ts`
  - `api/health.ts`

## 4) Kiểm tra sau deploy

1. Mở `https://<your-domain>/api/health` -> phải trả `{ ok: true }`.
2. Thử đăng nhập bằng tài khoản thật trong DB.
3. Kiểm tra logout -> gọi lại `/api/auth/me` phải bị từ chối.

## 5) Local dev (giữ nguyên)

1. `npm run dev:api` (Express local API)
2. `npm run dev` (frontend)

Frontend local vẫn gọi `/api/*` qua Vite proxy.

## 6) Lưu ý quan trọng

1. `AUTH_SEED_TEST_USERS` chỉ bật ở dev/staging.
2. Không để `AUTH_SESSION_SECRET` mặc định ở production.
3. Hiện tại schema được auto-create khi API start; có file SQL tham chiếu tại:
   - `server/sql/001_auth_schema.sql`
4. Bước tiếp theo nên làm: migration tooling (Prisma/Drizzle/Knex) + rate-limit Redis.
