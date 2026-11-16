# Hướng dẫn giáo viên — SilentStation / Trạm An

## Mục lục
1. [Điều kiện và giới hạn quyền](#điều-kiện-và-giới-hạn-quyền)
2. [Đăng ký, hồ sơ và bảo mật](#đăng-ký-hồ-sơ-và-bảo-mật)
3. [Phát mã/QR khảo sát](#phát-mãqr-khảo-sát)
4. [Thu hồi và quản lý mã](#thu-hồi-và-quản-lý-mã)
5. [Chức năng riêng của GVCN](#chức-năng-riêng-của-gvcn)
6. [Tùy chọn và xử lý lỗi](#tùy-chọn-và-xử-lý-lỗi)

## Điều kiện và giới hạn quyền
- Tài khoản phải được Admin duyệt, đang hoạt động và có phân công trường còn hiệu lực.
- Cả giáo viên bộ môn và GVCN đều phát được mã **khi Admin/Superadmin bật cho phép giáo viên phát mã của đợt**.
- Chỉ phát mã của đợt có sẵn trong trường; không tạo/mở đợt, sửa nội dung phiếu hoặc tự cấp quyền nghiên cứu.
- Mã mời không cấp quyền đọc/export phản hồi. Không có danh sách “học sinh đã trả lời” hoặc thống kê theo người phát mã.
- Banner TEST chỉ cho phép thông tin/câu trả lời giả. Không hứa khảo sát có người theo dõi tức thời.

## Đăng ký, hồ sơ và bảo mật
1. Mở Đăng ký/Register, chọn Giáo viên, nhập thông tin và đề nghị phân công.
2. Chờ Admin xác nhận. Đề nghị trường/lớp không tự trở thành quyền GVCN.
3. Đăng nhập sau duyệt; dùng menu profile (avatar bên trái tên).
4. Tài khoản/Account cho lưu hồ sơ, môn giảng dạy, avatar whitelist; điện thoại tùy chọn/chưa xác minh.
5. Mật khẩu, reset OTP, đổi email và tự vô hiệu hóa theo [hướng dẫn chung trong student.md](student.md#hồ-sơ-và-bảo-mật). Không tự sửa trường, lớp hoặc loại giáo viên.

## Phát mã/QR khảo sát
1. Mở **Phát mã khảo sát / Distribute survey invitations** từ menu quản lý/profile.
2. Chọn đợt trong phạm vi. Nếu không có đợt, hỏi Admin về phân công và cờ **Cho giáo viên phát mã / Allow teachers to issue invitations**.
3. Kiểm tra tên đợt, trường và tình trạng khả dụng. Server vẫn chặn đợt chưa mở/chưa vượt gate thu dữ liệu.
4. Để trống hạn dùng để mặc định 7 ngày; hoặc chọn thời điểm tương lai, tối đa 30 ngày.
5. Chọn **Tạo mã mời / Create invitation**. Chỉ dùng mã đã được server xác nhận.
6. Mở **Xem QR / link / View QR / link**: sao chép link/mã, tải PNG hoặc in thẻ QR.
7. Học sinh dùng camera điện thoại quét, đọc thông tin và đồng thuận; không phải đăng nhập hoặc đăng ký lớp để làm A–J.

QR chỉ chứa link `/#/tham-gia/KS-…`. Không chứa tài khoản, token hay đáp án. Không gửi mã qua dịch vụ tạo QR bên ngoài. Link localhost không truy cập được từ điện thoại khác; nghiệm thu LAN cần địa chỉ được người vận hành cấu hình.

## Thu hồi và quản lý mã
- Chỉ xem/thu hồi mã của mình; không quản lý mã của giáo viên khác.
- Chọn **Thu hồi / Revoke**, đọc thông báo và xác nhận. Thu hồi vĩnh viễn, không “mở lại” mã.
- Hết hạn/thu hồi chặn lượt mới. Phiên đã bắt đầu vẫn hoàn tất được trong hạn 24 giờ nếu đợt mở.
- Đợt đóng, bị vô hiệu hóa hoặc chuyển trường sẽ thu hồi mã liên quan. Khôi phục tài khoản/mở lại đợt không hồi sinh mã cũ.
- Không đặt quota học sinh và không coi một phiên là một học sinh duy nhất. Học sinh có mã khác hợp lệ vẫn có thể tham gia.

## Chức năng riêng của GVCN
1. Vào **Khu vực của tôi / My workspace**, xem lớp được phân công và danh sách học sinh tối thiểu.
2. Tạo **mã đăng ký lớp** bằng **Tạo mã 10 phút / tối đa 60 lượt / Create code · 10 minutes / up to 60 uses**.
3. Chia sẻ mã cho học sinh đăng ký; mã gắn class ID/niên khóa hiện tại. Tạo mã mới thu hồi mã cũ đang hoạt động của mình.
4. Thu hồi mã khi không còn cần sử dụng.

Giáo viên bộ môn không được quyền GVCN chỉ vì có quyền phát mã khảo sát. GVCN không sửa/khóa tài khoản học sinh và không đọc thông tin liên hệ của cả lớp. Bài tự đánh giá/lịch sử của bản thân và báo cáo được backend cho phép là độc lập với A–J.

## Tùy chọn và xử lý lỗi
- Theme Sáng/Tối/Theo hệ thống và Việt–Anh ở Cài đặt/Settings; đồng bộ chỉ sau **Lưu tùy chọn / Save preferences** và xác nhận server.
- Phiếu, đồng thuận và nội dung chuyên môn giữ tiếng Việt. Phiếu/QR khi in luôn nền trắng.
- Mã khác trường/thiếu phân công: nhờ Admin đối chiếu ID/phân công; đổi nhãn trường trên UI không thay phạm vi quyền.
- Mất mạng khi tạo/thu hồi: retry cùng request, không nhấn tạo nhiều mã để thay một lần gửi chưa rõ kết quả.
- Conflict: tải lại danh sách trước khi thao tác. Mã đã thu hồi/hết hạn không phục hồi được.
- Hủy/Đóng không lưu thay đổi. Email/chat chưa cấu hình phải hiện chưa khả dụng, không coi là gửi thành công.

## Niên khóa được thiết lập sau
Giáo viên có trường hợp lệ vẫn đăng nhập, dùng hồ sơ/bài tự đánh giá và phát mã khảo sát theo quyền của đợt. Khi chưa có lớp/niên khóa được xác nhận, nhãn GVCN trong hồ sơ không tự cấp quyền đọc danh sách học sinh hoặc tạo mã lớp. Giáo viên cung cấp thông tin niên khóa/lớp để Admin xác nhận; việc tạo lớp và phân công chính thức vẫn theo ma trận quyền, không tự mở rộng quyền giáo viên.
