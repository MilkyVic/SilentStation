import {ui,useLocale} from '../preferences/ui';
import Support from './Support';
export default function ContactPage() {useLocale(); return <div className="page-wrap"><header className="surface-card page-heading"><span className="eyebrow">{ui("KẾT NỐI VÀ HỖ TRỢ")}</span><h1>{ui("Trạm An luôn ở đây, lắng nghe em")}</h1><p>{ui("Chọn gọi điện hoặc gửi email trực tiếp. Không có form giả báo đã gửi, và không có dịch vụ phản hồi khẩn cấp qua website.")}</p></header><Support /></div>; }
