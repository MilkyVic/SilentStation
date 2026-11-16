import {shell} from './messages/shell';
import {common} from './messages/common';
import {accounts} from './messages/accounts';
import {tests} from './messages/tests';
import {auth} from './messages/auth';
import {survey} from './messages/survey';
import {chat} from './messages/chat';
import {handbook} from './messages/handbook';
export const messages:Record<string,string>={...shell,...common,...accounts,...tests,...auth,...survey,...chat,...handbook};
const lower=new Map(Object.entries(messages).map(([k,v])=>[k.toLocaleLowerCase(),v]));
export function translateUi(text:string){if(specialistTexts.has(text))return text;const exact=messages[text];if(exact)return exact;const value=lower.get(text.toLocaleLowerCase());return value?(text===text.toLocaleUpperCase()?value.toLocaleUpperCase():value):text;}

export const specialistTexts=new Set(["BÁO CÁO GIẢI MÃ EMOTION", "BÁO ĐỘNG SỨC KHỎE TÂM LÝ KHẨN CẤP", "Bài thở 4-7-8 giúp cơ thể chậm lại khi căng thẳng. Bạn có thể lặp lại vài vòng trước khi tiếp tục làm việc khác.", "Chỉ số của bạn đang ở mức cao và có thể tạo cảm giác quá tải. Trạm An khuyến khích bạn dừng lại, hít thở chậm và liên hệ ngay với một người lớn đáng tin cậy hoặc kênh hỗ trợ bên dưới.", "Chỉ tham gia khi nội dung và chính sách của đợt đã được người phụ trách duyệt.", "Dựa trên kết quả của bạn, chúng tôi đề xuất bạn thực hiện thêm bài test DASS-21 để có đánh giá chi tiết hơn về mức độ căng thẳng, lo âu và trầm cảm. Bạn có muốn thực hiện ngay không?", "Em đã đọc thông tin tham gia và đồng ý bắt đầu", "Giữ hơi thở trong 7 giây...", "Hít vào thật đều trong 4 giây...", "Hôm nay pin cảm xúc của bạn đang ở mức nào?", "Không yêu cầu tài khoản hoặc họ tên. Em có thể bỏ qua câu hoặc dừng. Nháp lưu tối đa 24 giờ trên cùng trình duyệt; hãy xóa nháp khi dùng máy chung. Không ghi thông tin nhận diện trong câu tự luận.", "KẾT QUẢ ĐÁNH GIÁ TÂM LÝ", "Kết quả chỉ mang tính sàng lọc sơ bộ và không thay thế kết luận chuyên môn y khoa hoặc tham vấn trực tiếp.", "Nếu tình trạng này lặp lại nhiều ngày, hãy thử làm một bài test tâm lý hoặc nhắn với Chat Box bé Trạm.", "Phiếu khảo sát sức khỏe tâm thần học sinh", "Pin đang báo hiệu bạn nên kiểm tra kỹ hơn.", "THỰC HÀNH THỞ SÂU 4-7-8", "Thở ra chậm rãi trong 8 giây...", "Tick những dấu hiệu bạn đang gặp. Đây chỉ là kiểm tra định hướng nhanh, không thay thế bài test chính thức.", "Trạm An gợi ý bạn chọn một bước nhẹ nhàng ngay bây giờ.", "Điều hòa nhịp thở và căng thẳng", "Đây là đợt demo, không nhập dữ liệu thật."]);
