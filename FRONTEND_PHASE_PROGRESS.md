# Frontend + Cẩm Nang - Phase Progress

Ngày bắt đầu: **2026-05-05**

## Trạng thái tổng quan
1. Phase 0 (Baseline): **Completed (technical baseline)**
2. Phase 1 (Content + Encoding): **In progress (core items implemented)**
3. Phase 2 (Refactor module handbook): **In progress (started with markdown module extraction)**
4. Phase 3 (Role sync backend): **Started (scoping)**
5. Phase 4 (Handbook <-> Chatbot): **Started (scoping)**
6. Phase 5 (Hardening deploy): **Started (scoping)**

## Việc đã làm trong lượt này
1. Đã tạo kế hoạch tích hợp: `FRONTEND_CAM_NANG_INTEGRATION_PLAN.md`.
2. Đã nhập cẩm nang chi tiết vào codebase chính:
   - `src/content/handbook/handbookData.ts` (copy từ bản frontend hoàn chỉnh)
   - `src/data.ts` đổi sang re-export để tương thích code cũ.
3. Đã copy bộ ảnh handbook vào `public/assets`.
4. Đã chặn TypeScript quét thư mục tham chiếu bằng `tsconfig.json`.
5. Đã chạy build kỹ thuật và ghi baseline vào `PHASE0_BASELINE_CHECKLIST.md`.
6. Đã cài `rehype-raw` để render được raw HTML trong handbook (`details/summary`).
7. Đã tách renderer handbook riêng:
   - `src/components/handbook/HandbookMarkdown.tsx`
   - `src/App.tsx` gọi component mới thay vì render markdown trực tiếp.
8. Đã xác nhận lại sau thay đổi: `npm run lint` PASS, `npm run build` PASS.
9. Đã tiếp tục Phase 2: tách Sidebar handbook ra component riêng:
   - `src/components/handbook/HandbookSidebar.tsx`
   - `src/App.tsx` dùng `<HandbookSidebar ... />`.
10. Đã cập nhật chi tiết hoàn thành vào:
   - `FRONTEND_CAM_NANG_INTEGRATION_PLAN.md`
   - `FRONTEND_PHASE_PROGRESS.md`
11. Đã tách thêm `HandbookContent` khỏi `App.tsx`:
   - `src/components/handbook/HandbookContent.tsx`
   - `src/App.tsx` chuyển phần content area sang component mới.
12. Đã chạy xác nhận sau refactor mới: `npm run lint` PASS, `npm run build` PASS.
13. Đã tách `HandbookView` khỏi `App.tsx`:
   - `src/components/handbook/HandbookView.tsx`
   - gom `HandbookSidebar` + `HandbookContent` vào component cấp cao.
14. Đã chạy xác nhận sau khi tách `HandbookView`: `npm run lint` PASS, `npm run build` PASS.
15. Sau khi khôi phục `src/App.tsx` để xử lý lỗi encoding, đã bật lại UI handbook mới nhất:
   - `src/App.tsx` render lại bằng `<HandbookView ... />` thay block handbook inline.
   - giữ nguyên logic auth/test/chat backend hiện tại (không rollback service flow).
16. Đã cập nhật bộ icon handbook trong `IconMap` để hiển thị đầy đủ section từ dữ liệu cẩm nang mới.
17. Đã xác nhận kỹ thuật sau cập nhật UI:
   - `npm run lint` PASS
   - `npm run build` PASS
18. Đã tiếp tục Phase 3 (role sync backend) cho màn quản trị:
   - `src/App.tsx` đồng bộ teacher/student theo backend qua `authService.listUsers(...)`.
   - tự dựng lại danh sách lớp từ dữ liệu teacher/student backend (không phụ thuộc hoàn toàn mock).
   - đồng bộ/merge danh sách trường theo dữ liệu backend để filter admin/superadmin ổn định.
19. Đã đổi state classes về `MOCK_CLASSES` làm fallback chuẩn khi backend chưa trả dữ liệu.
20. Đã xác nhận sau khi tích hợp Phase 3 bước 1:
   - `npm run lint` PASS
   - `npm run build` PASS
21. Đã tiếp tục Phase 3 bước 2: chuyển luồng phê duyệt giáo viên từ mock sang backend thật.
   - Backend thêm hàm `approveTeacherAccount(...)` trong `server/auth-core.ts`.
   - Local API thêm route `POST /api/users/approve-teacher` trong `server/auth-server.ts`.
   - Vercel API thêm function `api/users/approve-teacher.ts`.
22. Frontend đồng bộ pending teacher từ backend:
   - `src/App.tsx` bỏ dữ liệu mẫu `pendingTeachers`.
   - Tách danh sách giáo viên backend thành 2 nhóm: `pendingTeachers` và `teachers` (active).
   - Nút duyệt giáo viên gọi `authService.approveTeacherAccountById(...)` thay vì mutate local.
23. `src/services/authService.ts` bổ sung `approveTeacherAccountById(teacherId)` để gọi API duyệt thật, có fallback local khi cần.
24. Đã xác nhận kỹ thuật sau khi chuyển approval sang backend:
   - `npm run lint` PASS
   - `npm run build` PASS
   - `npm run build:api` PASS
25. Đã mở rộng Phase 3 bước 2 cho dữ liệu báo cáo quản trị:
   - `src/App.tsx` chuyển luồng đồng bộ `testResults` cho Admin/Superadmin sang `testService.getReportsOverview(...)` (dùng `attempts` backend thay vì `listMyResults` local-role).
   - Vai trò Student/Teacher vẫn dùng `listMyResults` để giữ trải nghiệm cá nhân.
26. Đã sửa logic lọc `filteredTestResults` theo trường:
   - Ưu tiên `result.userSchool` từ backend report.
   - Fallback mới dùng map `students` theo `result.userId` / `username`.
   - Loại bỏ mapping sai cũ theo `result.id`.
27. Đã chuẩn hóa số liệu Superadmin khỏi hardcode:
   - Bỏ số cứng `5,909` học sinh.
   - `SuperAdminView` nhận `students` thật từ state cha.
   - Chart trường học dùng số học sinh thật theo trường + số giáo viên thật (`teacherCount`) thay vì công thức giả `teacherCount * 10`.
28. Đã bổ sung đồng bộ `teacherCount/classCount` theo dữ liệu teacher/class backend khi sync managed users.
29. Đã xác nhận kỹ thuật sau lượt mở rộng Phase 3 bước 2:
   - `npm run lint` PASS
   - `npm run build` PASS
30. Đã bắt đầu Phase 4 (handbook <-> chatbot bridge):
   - Chat popup hiển thị nguồn theo nhãn thân thiện (`Kiến thức Trạm An`, `Quy trình an toàn khẩn cấp`...) thay vì chuỗi kỹ thuật.
   - Thêm bộ rule intent để gợi ý section cẩm nang từ nội dung hội thoại (stress/lo âu/FOMO/grounding/4-7-8/TIPP/hotline...).
   - Mỗi câu trả lời assistant có nút `Mở cẩm nang: ...`; bấm vào sẽ chuyển thẳng tới `currentView='handbook'` + `activeSectionId` tương ứng.
31. Đã xác nhận kỹ thuật sau Phase 4 bước đầu:
   - `npm run lint` PASS
   - `npm run build` PASS
32. Đã tiếp tục Phase 4 bước 2 (backend metadata sync):
   - `server/chat-core.ts` trả thêm `handbookSectionIds` trong response chat (bao gồm luồng thường, scope-guard, red-code).
   - Rule gợi ý mục handbook được đặt ở backend để frontend ưu tiên dùng dữ liệu server thay vì tự đoán hoàn toàn.
33. Đồng bộ contract frontend:
   - `src/types/chat.ts` thêm `handbookSectionIds` cho API response và chat UI message.
   - `src/services/chatService.ts` parse + trả `handbookSectionIds` cho App.
   - `src/App.tsx` ưu tiên deep-link từ `handbookSectionIds`; chỉ fallback heuristic khi backend không gửi.
34. Đã xác nhận kỹ thuật sau Phase 4 bước 2:
   - `npm run lint` PASS
   - `npm run build` PASS
   - `npm run build:api` PASS

## Việc kế tiếp ngay sau lượt này
1. Chốt nốt Phase 3: thay các action quản trị còn local-only (xóa teacher/student, đổi mật khẩu) bằng API thật hoặc ẩn action chưa backend hóa.
2. Tiếp tục Phase 4: tinh chỉnh map intent theo dữ liệu hội thoại thực tế (giảm false-positive giữa các mục gần nghĩa).
3. Tinh chỉnh handbook mobile UX nếu phát hiện section dài bị tràn trên màn hình nhỏ.
