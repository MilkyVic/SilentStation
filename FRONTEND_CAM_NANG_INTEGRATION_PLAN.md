# Kế Hoạch Tích Hợp Frontend Hoàn Chỉnh + Cẩm Nang Chi Tiết (Trạm An)

## Trạng thái triển khai (cập nhật 2026-05-05)
- Phase 0: Hoàn thành baseline kỹ thuật (`PHASE0_BASELINE_CHECKLIST.md`).
- Phase 1: Đang triển khai, đã nhập dữ liệu handbook + assets + renderer markdown nâng cao.
- Phase 2: Đang triển khai, đã tách module handbook và bật lại render qua `HandbookView` sau khi khôi phục file do lỗi encoding.
- Phase 3: Đã bắt đầu ở mức scoping (đồng bộ role UI theo backend).
- Phase 4: Đã bắt đầu ở mức scoping (thiết kế handbook <-> chatbot bridge).
- Phase 5: Đã bắt đầu ở mức scoping (hardening trước deploy).


## 1) Phạm vi đã rà soát
Nguồn tham chiếu: `d:\trạm-an (1)\trạm-an (1) (1)`.

Đã đọc kỹ các phần chính:
- `src/App.tsx` (khoảng 6162 dòng, cấu trúc UI gần như full trong 1 file).
- `src/data.ts` (khoảng 296 dòng, nội dung cẩm nang chi tiết, có nhiều section và hình minh họa).
- `public/assets/*` (28 ảnh phục vụ handbook).
- `package.json`, `.env.example`, `README.md`, `metadata.json`.

## 2) Nhận định hiện trạng của bản frontend hoàn chỉnh

### Điểm mạnh có thể tái sử dụng ngay
- UI/UX khá đầy đủ cho nhiều vai trò: học sinh, giáo viên, admin, superadmin.
- Luồng handbook giàu nội dung:
  - Có cấu trúc section rõ ràng.
  - Có phần `Q&A`, `Danh bạ liên hệ`, `Góc đồng hành cho cha mẹ`.
  - Có cơ chế tooltip nội tuyến kiểu `#tooltip:`.
  - Có render `<details>/<summary>` để hiển thị FAQ dạng accordion.
- Có sẵn nhiều ảnh minh họa đúng bối cảnh sức khỏe tinh thần học đường.

### Điểm yếu/kỹ thuật cần xử lý trước khi merge
- `App.tsx` quá lớn (monolith), khó bảo trì, khó test.
- Data và logic đang mock nhiều (students/teachers/admin/tests...), chưa bám backend thực tế.
- Có dấu hiệu lỗi encoding/hiển thị ký tự ở một số môi trường terminal.
- Có trùng lặp import/icon và key map, cần dọn để tránh bug UI nhỏ.
- Phân quyền hiện tại trên UI chưa đủ chặt nếu không dựa vào backend gate.

## 3) Chiến lược tích hợp đề xuất
Nguyên tắc: **giữ backend/auth/test/report/chat hiện tại làm nguồn sự thật**, chỉ lấy có chọn lọc từ bản frontend hoàn chỉnh.

Không nên copy toàn bộ `App.tsx` từ thư mục tham chiếu vào codebase chính.
Nên tách theo module rồi ghép dần theo phase.

## 4) Kế hoạch triển khai theo phase

## Phase 0 - Baseline & An toàn merge
Mục tiêu: chuẩn bị để merge không vỡ hệ thống đang chạy.

Công việc:
- Tạo branch tích hợp riêng cho frontend handbook.
- Chụp baseline bằng checklist:
  - Đăng nhập 4 role (student/teacher/admin/superadmin).
  - Catalog test, làm test, submit kết quả.
  - Chatbot hoạt động.
- Xác định danh sách file “được phép thay đổi” và “không đụng”.

Tiêu chí hoàn tất:
- Có baseline trước/sau để so sánh regression.

Chi tiết đã hoàn thành:
- Tạo `PHASE0_BASELINE_CHECKLIST.md`.
- Chạy và pass: `npm run lint`, `npm run build:api`, `npm run build`.
- Loại thư mục tham chiếu `trạm-an (1) (1)` khỏi TypeScript scan bằng `tsconfig.json`.

## Phase 1 - Chuẩn hóa cẩm nang (content pipeline)
Mục tiêu: đưa cẩm nang chi tiết vào codebase chính theo chuẩn UTF-8 và dễ mở rộng.

Công việc:
- Di chuyển nội dung handbook từ `trạm-an (1) (1)/src/data.ts` sang thư mục dữ liệu riêng (ví dụ `src/content/handbook/`).
- Chuẩn hóa encoding UTF-8 toàn bộ nội dung tiếng Việt có dấu.
- Giữ cấu trúc section + icon + ảnh như bản tham chiếu.
- Rà soát các link ảnh `/assets/...` để đảm bảo file tồn tại và đúng tên URL-encoded.
- Tách phần glossary/tooltip ra cấu trúc dữ liệu riêng để dễ quản trị.

Tiêu chí hoàn tất:
- Toàn bộ section hiển thị đúng dấu tiếng Việt.
- Không còn text bị vỡ mã (mojibake).

Chi tiết đã hoàn thành:
- Nhập cẩm nang chi tiết vào `src/content/handbook/handbookData.ts`.
- `src/data.ts` chuyển sang re-export để giữ tương thích code hiện tại.
- Copy toàn bộ ảnh handbook từ bản tham chiếu vào `public/assets`.
- Bổ sung `rehype-raw` và bật render markdown nâng cao qua component riêng:
  - `src/components/handbook/HandbookMarkdown.tsx`
  - hỗ trợ `#tooltip:`, `<details>/<summary>`, custom image/link rendering.

## Phase 2 - Tách module UI handbook
Mục tiêu: loại bỏ monolith, giữ nguyên trải nghiệm.

Công việc:
- Tách từ `App.tsx` thành các component:
  - `HandbookLayout`
  - `HandbookSidebar`
  - `HandbookContent`
  - `TooltipWord`
  - `BatteryCheckSection`
- Tách markdown renderer config ra file riêng (`rehypeRaw`, custom components).
- Viết types rõ ràng cho HandbookSection, Tooltip, Category.

Tiêu chí hoàn tất:
- App vẫn render như cũ, nhưng `App.tsx` giảm mạnh kích thước.
- Không đổi hành vi người dùng.

Chi tiết đã hoàn thành:
- Tách module render markdown handbook khỏi `App.tsx`:
  - thêm `src/components/handbook/HandbookMarkdown.tsx`
  - thay `Markdown` trực tiếp trong `App.tsx` bằng `<HandbookMarkdown content={...} />`.
- Tiếp tục tách sidebar handbook khỏi `App.tsx`:
  - thêm `src/components/handbook/HandbookSidebar.tsx`
  - `App.tsx` gọi `<HandbookSidebar ... />` thay vì giữ toàn bộ JSX sidebar inline.
- Tách content panel handbook khỏi `App.tsx`:
  - thêm `src/components/handbook/HandbookContent.tsx`
  - `App.tsx` gọi `<HandbookContent ... />` cho phần header + article markdown.
- Tách toàn bộ màn handbook thành component cấp cao:
  - thêm `src/components/handbook/HandbookView.tsx`
  - `App.tsx` gọi `<HandbookView ... />` thay cho block JSX handbook inline.

## Nhật ký triển khai chi tiết (2026-05-05)
1. Nhập dữ liệu handbook chi tiết + assets từ bản frontend hoàn chỉnh.
2. Chuẩn hóa entry dữ liệu:
  - `src/data.ts` -> re-export từ `src/content/handbook/handbookData.ts`.
3. Bật markdown nâng cao cho handbook:
  - Cài `rehype-raw`.
  - Hỗ trợ tooltip inline `#tooltip:`.
  - Hỗ trợ `<details>/<summary>` trong nội dung cẩm nang.
4. Refactor bước đầu Phase 2:
  - Tách `HandbookMarkdown`.
  - Tách `HandbookSidebar`.
  - Tách `HandbookContent`.
  - Tách `HandbookView`.
5. Kiểm tra kỹ thuật sau mỗi bước:
  - `npm run lint`: PASS
  - `npm run build:api`: PASS
  - `npm run build`: PASS
6. Đồng bộ lại UI handbook mới nhất sau khi restore:
  - khôi phục `src/App.tsx` về trạng thái sạch để loại bỏ lỗi tiếng Việt.
  - nối lại màn handbook qua `src/components/handbook/HandbookView.tsx`.
  - mở rộng `IconMap` để hiển thị icon đầy đủ cho section handbook mới.
  - xác nhận lại `npm run lint` PASS và `npm run build` PASS.

## Phase 3 - Đồng bộ role-based UI với backend thật
Mục tiêu: mọi màn role-sensitive đều dùng dữ liệu/permission từ backend.

Công việc:
- Thay dữ liệu mock ở các màn quản trị bằng service call thật (đặc biệt admin/superadmin).
- Chốt nguyên tắc role:
  - Student: chỉ luồng học sinh.
  - Teacher (chủ nhiệm/bộ môn): khác quyền theo `teacherType` từ backend profile.
  - Admin: quản trị trong phạm vi trường.
  - Superadmin: toàn cục.
- Mọi action nhạy cảm phải có backend guard (không chỉ ẩn nút ở frontend).

Tiêu chí hoàn tất:
- Không thể thao tác vượt quyền bằng cách sửa client.

Chi tiết đã hoàn thành (bước 1):
- `src/App.tsx` đồng bộ teacher/student cho admin/superadmin bằng `authService.listUsers`.
- Dựng lại `classes` từ teacher/student backend để giảm phụ thuộc dữ liệu mock.
- Merge động danh sách `schools` theo dữ liệu backend để bộ lọc trường hoạt động ổn định.
- Giữ fallback mock khi API chưa phản hồi để UI không trắng màn.

Chi tiết đã hoàn thành (bước 2):
- Bỏ `pendingTeachers` dữ liệu mẫu trong `src/App.tsx`; danh sách chờ duyệt được đọc từ backend (`status = pending`).
- Tách teacher backend thành 2 luồng state:
  - `teachers`: giáo viên đã duyệt.
  - `pendingTeachers`: giáo viên chờ duyệt.
- Bổ sung API duyệt giáo viên có phân quyền:
  - `server/auth-core.ts`: `approveTeacherAccount(token, { teacherId })`.
  - `server/auth-server.ts`: `POST /api/users/approve-teacher`.
  - `api/users/approve-teacher.ts` cho Vercel runtime.
- Frontend đổi nút duyệt để gọi API thật qua `authService.approveTeacherAccountById(...)`, sau đó đồng bộ lại danh sách.
- Scope bảo mật:
  - `Admin` chỉ duyệt giáo viên cùng trường.
  - `Superadmin` duyệt toàn cục.
- Mở rộng dữ liệu quản trị sang report backend:
  - Admin/Superadmin đồng bộ `testResults` từ `getReportsOverview(...).attempts` để dashboard không còn phụ thuộc kết quả cục bộ `listMyResults`.
  - Giữ `listMyResults` cho Student/Teacher.
- Sửa lọc theo trường ở dashboard Admin:
  - Ưu tiên `userSchool` từ backend report.
  - Fallback mới đối chiếu `userId`/`username` với danh sách học sinh.
- Dọn số liệu hardcode ở Superadmin:
  - bỏ tổng học sinh cứng,
  - dùng số học sinh thật theo trường cho chart,
  - đồng bộ `teacherCount/classCount` theo dữ liệu backend trong quá trình sync users.

## Phase 4 - Tối ưu trải nghiệm handbook + chatbot
Mục tiêu: handbook và chatbot bổ trợ nhau.

Công việc:
- Thêm cơ chế “deep-link section” để chatbot điều hướng thẳng đến mục handbook phù hợp.
- Chuẩn hóa thẻ nguồn chatbot: chỉ trả nguồn nội bộ, không lộ file hệ thống thô.
- Tạo mapping intent -> section handbook (stress, lo âu, FOMO, grounding, 4-7-8, 3C, hotline).

Tiêu chí hoàn tất:
- Chatbot có thể dẫn người dùng đến đúng section cẩm nang theo ngữ cảnh.

Chi tiết đã hoàn thành (bước 1):
- `src/App.tsx` thêm intent rules để suy luận section cẩm nang liên quan từ nội dung user/assistant và safety source.
- Popup chat chuyển hiển thị nguồn kỹ thuật sang nhãn người dùng dễ hiểu.
- Bổ sung deep-link trực tiếp:
  - mỗi câu trả lời assistant có nút `Mở cẩm nang: <section>`,
  - khi click sẽ chuyển sang màn handbook và set `activeSectionId` đúng mục.
- Rule hiện tại đã phủ các cụm chính:
  - stress, lo âu, FOMO, grounding 5-4-3-2-1, thở 4-7-8, TIPP, 3C,
  - hotline/khẩn cấp -> ưu tiên mục liên hệ + lên tiếng khi cần.

Chi tiết đã hoàn thành (bước 2):
- Backend chat (`server/chat-core.ts`) trả metadata `handbookSectionIds` cùng phản hồi để frontend điều hướng chính xác hơn.
- Áp dụng cho cả 3 nhánh:
  - phản hồi thường (knowledge-base),
  - scope-guard redirect,
  - red-code protocol.
- Frontend (`src/App.tsx`) đã chuyển sang ưu tiên section ids từ backend; heuristic cũ chỉ còn vai trò dự phòng khi metadata trống.
- Contract đã đồng bộ xuyên suốt:
  - `src/types/chat.ts`,
  - `src/services/chatService.ts`,
  - `src/App.tsx`.

## Phase 5 - Kiểm thử và hardening trước deploy
Mục tiêu: ổn định để lên Vercel.

Công việc:
- Test matrix theo role + thiết bị (mobile/desktop).
- Smoke test API liên quan auth/test/chat/class-code/admin.
- Performance pass cơ bản:
  - Ảnh handbook nặng cần nén/chia kích thước phù hợp.
  - Tránh render markdown quá nặng ở first-load.
- Kiểm tra biến môi trường Vercel (auth/chat/database).

Tiêu chí hoàn tất:
- Deploy preview không lỗi chức năng chính.
- Không có lỗi encoding hiển thị tiếng Việt.

## 5) Các ưu tiên chỉnh sửa ngay (đề xuất thứ tự thực thi)
1. Ưu tiên 1: Chuẩn hóa content handbook + encoding (Phase 1).
2. Ưu tiên 2: Tách module handbook khỏi `App.tsx` (Phase 2).
3. Ưu tiên 3: Đồng bộ role/data quản trị với backend (Phase 3).
4. Ưu tiên 4: Nối handbook <-> chatbot (Phase 4).

## 6) Rủi ro chính và cách giảm rủi ro
- Rủi ro vỡ UI khi tách file lớn:
  - Giảm rủi ro bằng tách theo cụm nhỏ, mỗi cụm có snapshot test thủ công.
- Rủi ro mismatch dữ liệu mock vs dữ liệu backend:
  - Giảm rủi ro bằng adapter normalize dữ liệu ở service layer.
- Rủi ro ảnh/đường dẫn handbook sai tên có dấu:
  - Giảm rủi ro bằng script check tồn tại asset theo danh sách link trong data.

## 7) Định nghĩa Done cho đợt chỉnh sửa tiếp theo
- Handbook đầy đủ nội dung chi tiết, tiếng Việt hiển thị chuẩn.
- Role UI nhất quán với backend permissions.
- Không còn phụ thuộc mock cho luồng quản trị chính.
- App build + run ổn định local và preview Vercel.
