# Hướng dẫn Admin — SilentStation / Trạm An

## Mục lục
1. [Phạm vi và điều kiện](#phạm-vi-và-điều-kiện)
2. [Tài khoản, giáo viên và lớp](#tài-khoản-giáo-viên-và-lớp)
3. [Đợt khảo sát và phát mã](#đợt-khảo-sát-và-phát-mã)
4. [Bài test, báo cáo và export](#bài-test-báo-cáo-và-export)
5. [Hồ sơ, tùy chọn và xử lý lỗi](#hồ-sơ-tùy-chọn-và-xử-lý-lỗi)

## Phạm vi và điều kiện
- Admin quản lý học sinh/giáo viên và lớp trong trường đã được đối chiếu bằng ID ổn định; không quản lý Admin hoặc trường khác.
- Không sửa email/mật khẩu trực tiếp để vượt luồng xác minh; reset dùng OTP để người nhận tự đặt mật khẩu.
- Chức năng có quyền UI vẫn được server kiểm tra từng request. Banner TEST nghĩa là chỉ dùng dữ liệu giả.
- Backend sẵn sàng không có nghĩa SMTP/Gemini đang hoạt động hoặc thu dữ liệu thật đã được phép.

## Tài khoản, giáo viên và lớp
1. Vào **Tổng quan / Overview** hoặc **Giáo viên / Teacher**; tìm tên/username, lọc vai trò, chuyển trang.
2. Mở **Xem / quản lý / View / manage**, kiểm tra trạng thái và các action được phép.
3. Chỉnh hồ sơ cơ bản, lưu vào server. Không thay role/username/email tùy ý.
4. Với giáo viên pending, chọn phân công đúng trường/lớp/loại, rồi **Phê duyệt với phân công đã chọn / Approve with selected assignment** hoặc từ chối.
5. Trong **Lớp học / Classes**, tạo/sửa tên lớp và niên khóa do người phụ trách xác nhận. Cùng tên khác niên khóa là lớp khác, không tự chuyển năm học.
6. Chuyển lớp/phân công cần xác thực lại khi yêu cầu; lịch sử kết quả không được chuyển nhóm theo hồ sơ mới.
7. **Vô hiệu hóa tài khoản / Deactivate account** thu hồi phiên, mã/grant liên quan nhưng giữ lịch sử. Khôi phục không phục hồi quyền nghiên cứu/mã cũ hoặc tự duyệt giáo viên pending/rejected.
8. Archive lớp không xóa; server chặn nếu còn phân công hoặc phụ thuộc hoạt động. Xử lý phụ thuộc trước, không cascade xóa.

Mã đăng ký lớp vẫn thuộc GVCN. Admin không tạo mã lớp chỉ vì có quyền phát mã khảo sát.

## Đợt khảo sát và phát mã
1. Vào **Đợt khảo sát / Survey campaigns**; tạo đợt trong trường. Mặc định chưa mở, không tự cấp grant dữ liệu thô.
2. Kiểm thử dùng loại TEST, không dùng dữ liệu thật. Đợt chính thức cần hồ sơ phê duyệt đã có, version hỗ trợ, retention và server flag riêng.
3. Hồ sơ không phải giấy phê duyệt tự sinh. Đóng đợt trước khi đổi hồ sơ chính sách/scoring/retention.
4. Muốn giáo viên phát QR, bật **Cho giáo viên phát mã / Allow teachers to issue invitations**. Mặc định tắt.
5. Vào **Phát mã khảo sát / Distribute survey invitations**, chọn đợt đang khả dụng và tạo mã. Mặc định 7 ngày, tùy chọn thời điểm tương lai không quá 30 ngày.
6. Xem QR/link, tải PNG, sao chép và in thẻ. Không nhúng tài khoản/token/đáp án hoặc thông tin học sinh vào QR.
7. Admin xem và thu hồi mã trong trường, gồm mã do giáo viên phát. Thu hồi vĩnh viễn; mã khác hợp lệ vẫn có thể dùng.
8. Tắt phát mã của giáo viên thu hồi mã do giáo viên phát của đợt; không thu hồi mã Admin. Đóng đợt thu hồi mọi mã còn hoạt động.
9. Mở lại đợt không hồi sinh mã; phát mã mới. Hết hạn/thu hồi mã không xóa nháp đang làm nếu đợt còn mở.

**Quyền nghiên cứu:** phát/quản lý mã không cấp grant raw/export. Hai grant độc lập, cần Superadmin cấp riêng theo đợt. Thiếu grant thì danh sách phản hồi/CSV bị khóa; không dùng báo cáo tài khoản để vượt quyền khảo sát ẩn danh.

## Bài test, báo cáo và export
- **Quản lý bài test / Manage assessments**: tải đủ bank trước Lưu; lỗi tải không phải bank rỗng.
- System bank khóa nội dung, chỉ sửa metadata được phép. Custom test chỉ người tạo/Admin có quyền tương ứng sửa; active bank rỗng bị chặn.
- Thời gian/icon/màu là metadata, không làm mất nháp. Đổi bank khiến người làm phải xác nhận làm lại, không tự chuyển đáp án.
- Báo cáo test dùng school/class/niên khóa tại lúc nộp. Kết quả cũ thiếu bằng chứng không tự gán vào lớp hiện tại.
- Trung bình tách bank/thang/score version, không có trung bình STRESS chung. Thiếu dữ liệu/chưa duyệt diễn giải không thành nguy cơ 0.
- **Xuất CSV toàn bộ bộ lọc / Export the complete filtered CSV** lấy toàn bộ dữ liệu đúng scope qua endpoint, không chỉ trang đang hiển thị.
- Export/in A–J dùng quyền/version riêng. Phiếu trắng và phản hồi vẫn đủ A–J, không lấy definition mới thay lịch sử không hỗ trợ.

## Hồ sơ, tùy chọn và xử lý lỗi
- Profile, đổi/reset mật khẩu, đổi email, avatar: theo [student.md](student.md#hồ-sơ-và-bảo-mật). Admin có thể cần OTP khi đăng nhập; không lưu OTP/password trong tài liệu hoặc evidence.
- Theme Sáng/Tối/Theo hệ thống và Việt–Anh được lưu bằng revision riêng. Preview chưa có ACK không phải đã đồng bộ. Nội dung chuyên môn/đồng thuận giữ tiếng Việt.
- Conflict khi sửa: giữ form, tải bản lưu/đối chiếu; không ghi đè im lặng.
- Lỗi mạng sau gửi: retry cùng request ID. Không tạo success từ đóng modal hay state local.
- Đợt chưa vượt gate: kiểm tra trạng thái, cấu hình TEST/chính thức và hồ sơ; không yêu cầu bật flag production từ nút UI.
- QR localhost không dùng được từ điện thoại khác. LAN HTTP chỉ là nghiệm thu dữ liệu giả, không phải bằng chứng TLS/production.

## Hoàn tất phân lớp/niên khóa sau khi đưa tài khoản vào sử dụng
Tài khoản mới có thể chỉ được gán trường, chưa có lớp/niên khóa. Trong **Lớp/niên khóa — Class / academic year**, tạo lớp bằng niên khóa đã đối chiếu rồi phân công học sinh/GVCN. Không điền năm giả hoặc dùng ngày hiện tại để suy niên khóa. Giáo viên pending vẫn chờ duyệt, chưa có quyền GVCN. Dữ liệu lịch sử không được tự gán ngược vào lớp mới.
