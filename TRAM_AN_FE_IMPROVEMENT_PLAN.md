# K? ho?ch nâng c?p t? `tram-an-fe` sang b?n hi?n t?i

## 1) M?c tiêu

- T?n d?ng các c?i ti?n UI/UX trong `tram-an-fe`.
- Gi? nguyên hu?ng ki?n trúc auth/backend dã tri?n khai ? b?n hi?n t?i (API-first, role l?y t? tài kho?n backend).
- Tránh kéo lùi v? co ch? login ch?n role trên client.

## 2) K?t lu?n rà soát nhanh

### 2.1 Ði?m t?t trong `tram-an-fe` nên cân nh?c port

1. Có màn `TeacherListView` riêng, tr?i nghi?m qu?n tr? giáo viên rõ ràng hon.
2. Ði?u hu?ng qu?n tr? d?y d? hon ? m?t s? ch?:
- Có menu `teacher-list` cho Admin/Superadmin.
- Có route render `teacher-list` d?y d?.
3. M?t s? chi ti?t UI dashboard tr?c quan hon (th? th?ng kê, CTA di d?n danh sách giáo viên).

### 2.2 Ði?m b?n hi?n t?i t?t hon (ph?i gi?)

1. Auth dã tách kh?i `App.tsx` thành component/service:
- `src/components/auth/AuthView.tsx`
- `src/services/authService.ts`
- `src/types/auth.ts`
2. Có backend auth + API route + c?u hình deploy (Vercel/DB env) d? s?n sàng production.
3. Login theo tài kho?n backend (không d?a vào role ch?n tay ? UI).

### 2.3 Regression/gap trong b?n hi?n t?i c?n x? lý s?m

1. Có di?u hu?ng d?n `teacher-list` nhung thi?u màn route tuong ?ng.
2. Menu Superadmin dang gán nh?m “Tru?ng h?c” v? `class-list` (nên là `school-list`).

## 3) Nguyên t?c tri?n khai

1. `Auth` và `phân quy?n` là lõi uu tiên cao nh?t, không phá v? roadmap hi?n t?i.
2. Ch? port ph?n UI qu?n tr? có giá tr?, không merge nguyên kh?i `App.tsx` t? `tram-an-fe`.
3. M?i thay d?i m?i ph?i di qua service/type hi?n có, tránh t?o logic auth r?i rác trong UI.
4. Gi? lu?ng deploy lên Vercel ?n d?nh trong su?t quá trình refactor.

## 4) Ph?m vi tri?n khai d? xu?t

## Phase A - S?a di?u hu?ng và màn thi?u (uu tiên cao, ít r?i ro)

M?c tiêu: lo?i b? dead route, d?ng b? di?u hu?ng.

H?ng m?c:
1. Khôi ph?c `TeacherListView` trong b?n hi?n t?i.
2. Thêm route render cho `currentView === 'teacher-list'`.
3. S?a menu Superadmin: m?c “Tru?ng h?c” v? `school-list`.
4. Ki?m tra t?t c? CTA `setCurrentView(...)` ph?i có màn tuong ?ng.

Tiêu chí hoàn thành:
1. Click vào m?i m?c menu d?u có màn hi?n th? h?p l?.
2. Không còn chuy?n trang “tr?ng” ho?c quay sai context admin/superadmin.

Tr?ng thái c?p nh?t (2026-04-25):
1. Ðã có `TeacherListView` và route `teacher-list` ho?t d?ng trong b?n hi?n t?i.
2. Menu Superadmin dã di?u hu?ng “Tru?ng h?c” v? dúng `school-list`.
3. Ðã d?i soát các CTA `setCurrentView(...)` v?i danh sách view/render, không còn route ch?t trong ph?m vi Phase A.
4. Ðã b? sung tài kho?n test giáo viên b? môn n?i b?: `teacher_subject_test / 123456` (seed ? c? frontend fallback và backend).
5. Phase A du?c xem là hoàn t?t, s?n sàng chuy?n tr?ng tâm sang Phase B.

## Phase B - Port UI qu?n tr? giáo viên ch?n l?c

M?c tiêu: nâng UX nhung không thay d?i contract auth.

H?ng m?c:
1. Port layout danh sách giáo viên, tìm ki?m theo tên/tru?ng/l?p.
2. Port lu?ng m? chi ti?t giáo viên + thao tác qu?n tr? hi?n có.
3. Ð?ng b? CTA t? dashboard sang teacher list.

Luu ý:
1. D? li?u v?n di t? state/service hi?n t?i.
2. Không dua role ch?n tay vào login.

Tiêu chí hoàn thành:
1. Teacher list ho?t d?ng cho Admin/Superadmin dúng phân quy?n.
2. Tìm ki?m và di?u hu?ng detail ch?y ?n d?nh.

Tr?ng thái c?p nh?t (2026-04-25 - Phase B d?t 1):
1. Ðã nâng c?p `TeacherListView` v?i tìm ki?m + l?c theo tru?ng + l?c `Giáo viên ch? nhi?m`/`Giáo viên b? môn`.
2. Ðã d?ng b? CTA dashboard Superadmin d? th? “Giáo viên” di?u hu?ng dúng sang `teacher-list`.
3. Ðã hoàn thi?n luu ch?nh s?a t? modal chi ti?t giáo viên vào state `teachers` (và c?p nh?t `classes.teacherName` khi d?i tên giáo viên).
4. Ðã b? sung l?c theo `filterSchoolId` cho Superadmin khi vào `teacher-list` t? ng? c?nh theo tru?ng.

## Phase C - B? sung nghi?p v? giáo viên ch? nhi?m/b? môn (n?u c?n)

M?c tiêu: dua ph?n c?i ti?n nghi?p v? vào dúng t?ng d? li?u.

H?ng m?c:
1. M? r?ng `types` cho `teacherType`, `subject`.
2. C?p nh?t API contract auth/profile n?u c?n luu các tru?ng này.
3. C?p nh?t schema DB và migration.
4. C?p nh?t form dang ký/h? so giáo viên theo contract m?i.

Ràng bu?c:
1. Không dùng `teacherType` d? bypass phân quy?n dang nh?p.
2. Role v?n do backend xác d?nh sau login.

Tiêu chí hoàn thành:
1. Tru?ng d? li?u m?i du?c luu và d?c nh?t quán t? backend.
2. Không phát sinh regression ? login/register/me/logout.

Tr?ng thái c?p nh?t (2026-04-26 - Phase C d?t 1):
1. Ðã m? r?ng backend auth PostgreSQL (`server/auth-core.ts`, `server/sql/001_auth_schema.sql`) v?i `profile_teacher_type`, `profile_subject` và fallback d? li?u cu.
2. Ðã c?p nh?t contract API (`AUTH_API_CONTRACT.md`) d? d?ng b? request/response cho `teacherType` và `subject`.
3. Ðã c?p nh?t form dang ký giáo viên (`src/components/auth/AuthView.tsx`) cho phép ch?n `Giáo viên ch? nhi?m`/`Giáo viên b? môn` và validate theo ng? c?nh.
4. Ðã c?p nh?t di?u hu?ng role giáo viên ? frontend (`src/App.tsx`): ch? giáo viên ch? nhi?m m?i vào `teacher-class`; giáo viên b? môn v? `home`.
5. Ðã gi? d?y d? tài kho?n test n?i b?, g?m c? `teacher_subject_test / 123456`.

## Phase D - ?n d?nh tru?c production

M?c tiêu: s?n sàng demo l?n và chu?n b? scale.

H?ng m?c:
1. Test lu?ng d?y d? theo role: student/teacher/admin/superadmin.
2. Test navigation và state restore sau reload.
3. Rà môi tru?ng:
- `VITE_ENABLE_AUTH_FALLBACK=false` ? production.
- `AUTH_SEED_TEST_USERS=false` ? production.
- DB/secret/cors c?u hình dúng.
4. Ki?m tra log API auth trên Vercel sau deploy.

Tiêu chí hoàn thành:
1. Không l?i 500 trong auth flow chu?n.
2. Không còn endpoint/route dead ho?c sai quy?n truy c?p.

## 5) Nh?ng gì KHÔNG làm trong d?t này

1. Không merge nguyên `tram-an-fe/src/App.tsx` vào b?n hi?n t?i.
2. Không quay l?i login ch?n role b?ng tay.
3. Không b? qua t?ng backend d? x? lý auth tr?c ti?p ? frontend.

## 6) R?i ro và cách gi?m thi?u

R?i ro 1: Port UI kéo theo merge xung d?t l?n trong `App.tsx`.
- Gi?m thi?u: tách theo lát c?t nh? (route/menu/view) theo phase.

R?i ro 2: Regression auth khi ch?m vào màn dang nh?p.
- Gi?m thi?u: gi? nguyên `AuthView` + `authService`, ch? d?i ph?n hi?n th? quanh nó.

R?i ro 3: L?ch d? li?u gi?a frontend type và backend schema khi thêm teacher fields.
- Gi?m thi?u: c?p nh?t theo th? t? `types -> contract -> schema -> service -> UI`.

## 7) Checklist nghi?m thu t?ng

1. Login không ch?n role ? màn dang nh?p.
2. Role sau login l?y t? backend account.
3. `teacher-list` có màn th?t, truy c?p du?c t? menu/CTA.
4. Superadmin vào dúng `school-list` t? menu.
5. Không có l?i console nghiêm tr?ng trên các lu?ng chính.
6. Auth API ho?t d?ng ?n trên Vercel v?i env production.

## 8) Th? t? th?c thi khuy?n ngh?

1. Làm Phase A tru?c d? lo?i dead-route nhanh.
2. Làm Phase B d? nâng UX qu?n tr? giáo viên.
3. Ch? làm Phase C khi ch?t rõ c?n nghi?p v? giáo viên b? môn/ch? nhi?m ? backend.
4. Ch?t b?ng Phase D tru?c khi m? demo di?n r?ng.

