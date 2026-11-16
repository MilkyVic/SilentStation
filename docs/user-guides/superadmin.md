# Hướng dẫn Superadmin — SilentStation / Trạm An

## Mục lục
1. [Quyền và trách nhiệm](#quyền-và-trách-nhiệm)
2. [Trường, Admin và tài khoản](#trường-admin-và-tài-khoản)
3. [Campaign, mã mời và quyền nghiên cứu](#campaign-mã-mời-và-quyền-nghiên-cứu)
4. [Báo cáo, hồ sơ và tùy chọn](#báo-cáo-hồ-sơ-và-tùy-chọn)
5. [Kiểm chứng và xử lý sự cố](#kiểm-chứng-và-xử-lý-sự-cố)

## Quyền và trách nhiệm
- Quản lý liên trường không đồng nghĩa được đọc/export toàn bộ phản hồi A–J. Superadmin cũng cần grant riêng theo campaign.
- Không sửa nội dung/scoring/consent hoặc suy ngưỡng chuyên môn từ UI. “Official” là channel phần mềm, không phải phê duyệt pháp lý/chuyên môn.
- TEST chỉ dùng dữ liệu giả. Thu dữ liệu thật vẫn bị khóa mặc định; vòng này không mở pilot.
- Không đưa credential, OTP, cookie, đáp án hoặc phản hồi thô vào hướng dẫn/log/evidence.

## Trường, Admin và tài khoản
1. Vào **Trường / Schools**, tạo trường với ID ổn định; sửa tên/địa chỉ không đổi scope hoặc nhãn lịch sử.
2. Archive chỉ khi đã xử lý phân công/đợt mở liên quan; không cascade xóa.
3. Vào **Admin**, chọn **Mời Admin qua email / Invite Admin by email**, nhập người nhận và trường.
4. Server tiếp nhận lời mời vào outbox. “Tiếp nhận” không có nghĩa đã gửi email; người nhận xác thực OTP và tự đặt mật khẩu. Quản trị không có mật khẩu tạm để biết hộ.
5. Quản lý tài khoản/phân công/chuyển trường bằng ID và revision; xác thực lại cho thao tác nhạy cảm theo yêu cầu server.
6. Vô hiệu hóa giữ lịch sử và thu hồi phiên/mã/grant. Khôi phục không khôi phục mã/grant hoặc bỏ qua duyệt giáo viên.
7. Không vô hiệu hóa Superadmin hoạt động cuối cùng; server chặn cả yêu cầu đồng thời.

## Campaign, mã mời và quyền nghiên cứu
1. Chọn đúng trường khi tạo đợt; mặc định chưa mở, không tự cấp grant.
2. Chỉ ghi hồ sơ từ quyết định phê duyệt đã có. Đợt chính thức còn cần server cho phép, version hợp lệ, scoring/policy approved, tham chiếu phê duyệt và retention.
3. Bật **Cho giáo viên phát mã / Allow teachers to issue invitations** riêng theo đợt; quyền áp dụng giáo viên active/được duyệt/có phân công trường hợp lệ.
4. Trong **Phát mã khảo sát / Distribute survey invitations**, tạo/quản lý mã liên trường đúng campaign. Mã `KS-…` có hạn mặc định 7 ngày, tối đa 30 ngày theo lựa chọn.
5. Mã/QR không phải định danh người tham gia. Không có báo cáo lượt quét hoặc theo người phát; phản hồi không lưu liên kết mã mời/tài khoản giáo viên.
6. Thu hồi vĩnh viễn; đóng đợt thu hồi các mã. Mở lại phải phát mới. Nháp đã bắt đầu chỉ hoàn tất trong hạn khi đợt còn mở.
7. **Quyền nghiên cứu theo đợt / Campaign research grants**: chọn người nhận đủ điều kiện, cấp **Đọc phản hồi thô / Read raw responses** và **Export riêng / Separate export permission** độc lập.
8. Thu hồi cả hai grant vẫn được khi tài khoản đích đã khóa. Không phục hồi grant tự động khi khôi phục tài khoản.
9. Mỗi thao tác quyền và truy cập dữ liệu thô/export có audit; không giả định có một màn xem audit nếu UI chưa cung cấp.

## Báo cáo, hồ sơ và tùy chọn
- Báo cáo test dùng snapshot lúc nộp; nhóm `legacy_unknown` không được suy từ hồ sơ hiện tại. Superadmin xem được nhóm chưa xác định theo endpoint/UI hiện có.
- Không trộn trung bình khác bank/thang/score version. Risk chưa duyệt là unknown/unreviewed, không phải 0.
- Export test và export A–J là hai contract/quyền khác nhau. CSV lấy toàn bộ bộ lọc, không lấy riêng trang sau LIMIT.
- Profile/avatar/bảo mật tài khoản theo [student.md](student.md#hồ-sơ-và-bảo-mật); quản trị hệ thống theo [admin.md](admin.md).
- Theme Sáng/Tối/Theo hệ thống và Việt–Anh ở Cài đặt; server xác nhận mới được báo đồng bộ. Phiếu, consent, nội dung chuyên môn và nhãn lịch sử giữ nguyên tiếng Việt.
- Phiếu A4/QR khi in luôn nền trắng dù giao diện tối.

## Kiểm chứng và xử lý sự cố
- Xem trạng thái API/readiness; readiness không chứng minh SMTP đã gửi thư hoặc thu dữ liệu thật được phép.
- Kiểm thử bằng dữ liệu giả trên DB/process riêng. Không restart/reset phiên đang dùng để tiện test.
- Quét điện thoại cần URL reachable; localhost của điện thoại không phải máy chủ. LAN HTTP là test giả, không nhập dữ liệu thật/đăng nhập quản trị trên điện thoại.
- HTTPS/Secure cookie/SMTP sandbox trên actual Vercel Preview có gate riêng; không dùng ignoreHTTPSErrors hoặc kết quả UI giả làm bằng chứng.
- Conflict/mất ACK: giữ request cũ, retry/đối chiếu, không tạo thao tác thay thế có thể trùng.
- Gate fail: giữ evidence/volume để điều tra; không reset/down-migrate, reseed hoặc prune stack khác.
- GitHub, credential, production migration/deployment, bật thu dữ liệu thật và cleanup tài nguyên cần ủy quyền riêng. Không có chức năng UI thay thế các ủy quyền này.
