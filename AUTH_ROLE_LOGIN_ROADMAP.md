# Định hướng phát triển: Login không chọn role, role xác định theo tài khoản

## 1) Hiện trạng logic auth trong codebase

Tham chiếu chính: `src/App.tsx` (khối `auth` từ khoảng dòng 4970 trở đi).

- Màn hình đăng nhập hiện có chọn `role` ngay trên form.
- Khi submit login:
  - `setIsLoggedIn(true)`
  - `setUserData(... role: authForm.role ...)`
  - Điều hướng theo role vừa chọn (`admin`, `superadmin`, `home`).
- Nghĩa là role hiện tại được quyết định bởi UI người dùng chọn, không phải lấy từ một nguồn tài khoản đáng tin cậy.

Đăng ký:

- Role được chọn khi đăng ký.
- Học sinh cần `regCode` (mã giáo viên cấp).
- Giáo viên đưa vào `pendingTeachers` để chờ duyệt.
- Admin/SuperAdmin không xuất hiện trong register mode (đúng hướng hơn so với login).

## 2) Nhận định

Ý tưởng của bạn là đúng hướng:  
`login` nên chỉ xác thực danh tính, còn `role` phải lấy từ dữ liệu tài khoản đã lưu.

Nếu vẫn cho chọn role ở login, các rủi ro chính là:

- Người dùng có thể chọn sai role và đi nhầm luồng.
- Khó kiểm soát phân quyền thật sự.
- Sau này chuyển sang backend sẽ phải refactor lớn.

## 3) Mục tiêu thiết kế mới

- Login form chỉ còn:
  - `username/email`
  - `password`
- Sau khi xác thực thành công:
  - Server (hoặc source account) trả về `role`, `status`, `permissions`.
  - Frontend điều hướng theo role trả về.
- Register vẫn cho chọn role hợp lệ để tạo tài khoản:
  - `Học sinh`
  - `Giáo viên`
- `Admin` và `Quản trị viên cấp cao` không tự đăng ký từ UI công khai.

## 4) Luồng đề xuất (chuẩn hóa)

### 4.1 Đăng ký

1. Người dùng chọn role trong register.
2. Nếu `Học sinh`: bắt buộc mã lớp/mã giáo viên (`regCode`) hợp lệ.
3. Nếu `Giáo viên`: tạo tài khoản trạng thái `pending`.
4. Nếu được duyệt -> `active`.

### 4.2 Đăng nhập

1. Nhập tài khoản + mật khẩu (không chọn role).
2. Xác thực.
3. Nhận `account`:
   - `role`: `student | teacher | admin | superadmin`
   - `status`: `active | pending | suspended`
4. Điều hướng:
   - `student` -> `home/test-list`
   - `teacher` -> `teacher-class`
   - `admin` -> `admin`
   - `superadmin` -> `superadmin`
5. Nếu `pending` -> trang thông báo chờ duyệt, không vào hệ thống chính.

## 5) Đề xuất model dữ liệu tối thiểu

```ts
type Role = 'Học sinh' | 'Giáo viên' | 'Admin' | 'Quản trị viên cấp cao';
type AccountStatus = 'active' | 'pending' | 'suspended';

type UserAccount = {
  id: string;
  username: string;
  email?: string;
  passwordHash: string; // backend xử lý hash
  role: Role;
  status: AccountStatus;
  schoolId?: string;
  className?: string;
  createdAt: number;
};
```

## 6) Kế hoạch triển khai theo phase

### Phase 1: Chuẩn hóa logic ở frontend (mock/in-memory)

- Tạo `accounts` store riêng (không phụ thuộc vào `authForm.role` khi login).
- Login:
  - Tìm account theo `username/email`.
  - So khớp password (mock).
  - Gán `userData.role` theo account.
- Register:
  - Vẫn chọn role.
  - Tạo account mới tương ứng.

Kết quả: đạt mục tiêu UX ngay, ít phá vỡ code hiện tại.

### Phase 2: Tách service auth

- Tạo lớp/hàm `authService`:
  - `register(payload)`
  - `login(payload)`
  - `logout()`
  - `getCurrentSession()`
- UI gọi service thay vì thao tác trực tiếp state lớn trong `App.tsx`.

Kết quả: chuẩn bị tốt cho backend thật.

### Phase 3: Backend + session thật

- API:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/me`
- Token/session do backend quản lý.
- Role và status chỉ lấy từ backend.

## 7) Thay đổi UI cụ thể (gợi ý nhanh)

- Ở tab login:
  - Ẩn hoàn toàn cụm chọn `role`.
- Ở tab register:
  - Giữ chọn role.
  - Ẩn `Admin` và `Quản trị viên cấp cao`.
- Thêm message rõ cho tài khoản `pending`.

## 8) Checklist chấp nhận (Definition of Done)

- Không thể chọn role khi login.
- Login đúng tài khoản tự vào đúng màn hình theo role.
- Tài khoản giáo viên `pending` không vào được dashboard giáo viên.
- Đăng ký học sinh phải qua mã hợp lệ.
- Không thể tự đăng ký Admin/SuperAdmin từ giao diện công khai.

## 9) Khuyến nghị ưu tiên

Ưu tiên triển khai ngay theo thứ tự:

1. Phase 1 (mock logic mới) để chốt UX/flow.
2. Tách `authService` để giảm độ phình của `App.tsx`.
3. Sau khi flow ổn mới gắn backend thật.

---

Nếu muốn, bước tiếp theo mình có thể implement luôn **Phase 1** trực tiếp trong code hiện tại (không đổi UI lớn, chỉ đổi auth flow trước).

## 10) Ghi chú bảo mật (quan trọng)

- Tuyệt đối **không hiển thị** tài khoản test/password trên UI (đã ẩn ở login).
- Tài khoản test hiện đang được seed nội bộ trong `src/services/authService.ts` để phục vụ phát triển local.
- Trước khi deploy production (Vercel/web chính thức), cần:
1. Bỏ seed account hard-code khỏi frontend.
2. Chuyển xác thực sang backend/session thật.
3. Quản lý secret bằng environment variables và hệ thống auth server-side.

Ghi nhớ tài khoản test hiện tại (chỉ dùng nội bộ dev/staging):

1. `student_test / 123456`
2. `teacher_test / 123456`
3. `teacher_subject_test / 123456`
4. `admin_test / 123456`
5. `superadmin_test / 123456`

## 11) Mục tiêu demo 1 trường (800 người) và thứ tự ưu tiên

Mục tiêu vận hành:

- Bản demo phục vụ 1 trường với quy mô tổng ~800 tài khoản.
- Ưu tiên độ ổn định đăng nhập, phân quyền, và kiểm soát truy cập trước.

Thứ tự triển khai bắt buộc:

1. Hoàn tất `auth_role_login roadmap` (Phase 1 -> Phase 2 -> Phase 3).
2. Chỉ sau khi auth ổn định mới chuyển sang tối ưu chịu tải và hạ tầng deploy.
3. Trước production: bỏ toàn bộ account test hard-code ở frontend.

Scope kỹ thuật sau khi xong auth:

- Backend API riêng (Express/Node) cho login/register/session.
- Database PostgreSQL managed cho users/roles/schools/classes/sessions.
- Redis cho rate-limit và session/token cache.
- Frontend Vercel chỉ gọi API backend, không tự xác định role.

Tiêu chí sẵn sàng demo 800 người:

1. Login lấy role từ backend, không chọn role ở client.
2. Có rate-limit cho login và audit log cơ bản.
3. Có seed test user theo môi trường `dev/staging`, tắt ở `production`.
4. Có bài test tải (kịch bản 800 user tổng, kiểm tra peak đồng thời).

## 12) Tiến độ thực thi

Trạng thái hiện tại:

- Phase 1: đã triển khai.
- Phase 2: hoàn tất.

Hạng mục Phase 2 đã làm:

1. Tách auth logic sang service riêng: `src/services/authService.ts`.
2. `App.tsx` đã gọi service cho `register`, `login`, `logout`, `getCurrentSession`.
3. Luồng duyệt giáo viên đã gọi service để chuyển trạng thái account từ `pending` sang `active`.
4. Chuẩn hóa shared auth types sang `src/types/auth.ts` để UI và service dùng chung một nguồn kiểu dữ liệu.
5. Bổ sung ghi nhớ tài khoản test nội bộ trong roadmap, đồng thời giữ ẩn thông tin này trên UI.
6. Tách màn hình auth khỏi `App.tsx` thành component riêng: `src/components/auth/AuthView.tsx`.
7. Chuẩn bị contract API cho Phase 3: `AUTH_API_CONTRACT.md`.
8. Bổ sung test cơ bản cho authService: `src/services/authService.test.ts` (chạy bằng `npm run test:auth`).
9. Chuẩn hóa auth error theo định dạng API-ready `error.code + error.message`.
10. Cập nhật `AuthView` để đọc lỗi từ `error.message` và chỉ thêm giáo viên vào danh sách chờ sau khi đăng ký service thành công.

## 13) Khởi động Phase 3 (đã bắt đầu)

Hạng mục đã triển khai:

1. Tạo backend auth API mock bằng Express tại `server/auth-server.ts` với các endpoint:
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   - `GET /api/auth/me`
2. Cập nhật `src/services/authService.ts` sang mô hình **API-first, fallback local**:
   - Ưu tiên gọi backend auth API nếu khả dụng.
   - Nếu API chưa chạy hoặc không truy cập được, tự động fallback luồng local hiện có để không chặn demo.
3. Chuyển các luồng auth sang async:
   - `AuthView` gọi `await authService.register/login`.
   - `App.tsx` khôi phục session và logout theo async flow.
4. Cập nhật Vite proxy cho `/api/*` trong `vite.config.ts` để frontend dev gọi backend local.
5. Bổ sung script chạy API:
   - `npm run dev:api`
6. Bổ sung env mẫu cho auth API trong `.env.example`.

Kiểm tra đã chạy:

1. `npm run lint` -> pass.
2. `npm run test:auth` -> pass.

Cập nhật bổ sung cho Phase 3 (chuẩn bị deploy production):

1. Backend auth đã nâng cấp cơ chế token ký HMAC (không dùng session map thuần) để phù hợp hơn khi deploy thật.
2. Bổ sung script build/start backend production:
   - `npm run build:api`
   - `npm run start:api`
3. Bổ sung `tsconfig.server.json` để build backend ra `dist-server`.
4. Bổ sung `Dockerfile.api` và `.dockerignore` để container hóa backend.
5. Bổ sung tài liệu deploy chi tiết: `DEPLOY_AUTH_BACKEND.md`.
6. Frontend fallback local auth đã được ràng buộc theo môi trường:
   - Dev có thể bật `VITE_ENABLE_AUTH_FALLBACK=true`.
   - Production phải đặt `VITE_ENABLE_AUTH_FALLBACK=false`.

Cap nhat tiep theo (Phase 3 - PostgreSQL):

1. Backend auth da ket noi PostgreSQL qua `DATABASE_URL` (`pg`).
2. Da co schema auth trong DB:
   - `auth_users` (users + role/status + profile)
   - `auth_sessions` (session theo `jti`, co `revoked_at`)
3. Login/me/logout da dung session duoc luu trong PostgreSQL thay vi memory map.
4. Da bo sung file schema SQL tham chieu: `server/sql/001_auth_schema.sql`.

Cap nhat deploy Vercel (fullstack):

1. Da bo sung Vercel Functions cho auth API trong `api/auth/*` va `api/health.ts`.
2. Da tach `server/auth-core.ts` lam logic dung chung cho ca Express local va Vercel Functions.
3. Da bo sung `vercel.json` de runtime `nodejs22.x` cho `api/**/*.ts`.
4. Da cap nhat tai lieu deploy Vercel chi tiet trong `DEPLOY_AUTH_BACKEND.md`.
