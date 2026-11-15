import { useState, useCallback } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { chatService } from '../../services/chatService';
import { DEMO_MODE } from '../../services/surveyService';
export default function ChatPanel() {
    const [open, setOpen] = useState(false), [text, setText] = useState(''), [busy, setBusy] = useState(false), [messages, setMessages] = useState<{
        role: string;
        text: string;
        sections?: string[];
    }[]>([]);
    const close = useCallback(() => setOpen(false), []);
    async function send() { if (!text.trim() || busy)
        return; const message = text.trim(); setText(''); setMessages(m => [...m, { role: 'Em', text: message }]); setBusy(true); if (DEMO_MODE) {
        setMessages(m => [...m, { role: 'Demo', text: 'Đây là demo giao diện. Không gửi tin nhắn đến Gemini và không lưu hội thoại thật. Em có thể xem cẩm nang hoặc kênh liên hệ.' }]);
    }
    else {
        const result = await chatService.sendMessage(message);
        setMessages(m => [...m, { role: 'Trạm An', text: 'error' in result ? result.error.message : result.data.reply, ...('data' in result ? { sections: result.data.handbookSectionIds } : {}) }]);
    } setBusy(false); }
    return <><button className="chat-launch icon-button" aria-label="Mở chatbot Trạm An" onClick={() => setOpen(true)}><img src="/assets/surveys/mascot.webp" alt=""/></button>{open && <Modal title="Một góc tâm sự cùng Trạm An" onClose={close}><p className="muted">Không nhập thông tin nhận diện. Khi dùng dịch vụ thật, tin nhắn có thể được xử lý qua Gemini; chatbot không tự lấy đáp án khảo sát và không thay thế hỗ trợ trực tiếp.</p><div className="chat-messages" role="log" aria-live="polite">{messages.length === 0 ? <p>Chào em 🌿. Em muốn bắt đầu từ đâu?</p> : messages.map((m, i) => <div key={i} className={`chat-message ${m.role === 'Em' ? 'chat-user' : ''}`}><strong>{m.role}</strong><p>{m.text}</p>{m.sections?.length ? <Link to="/cam-nang" onClick={close}>Mở cẩm nang liên quan</Link> : null}</div>)}</div><form onSubmit={e => { e.preventDefault(); void send(); }} className="chat-input"><label className="sr-only" htmlFor="chat-text">Tin nhắn</label><textarea id="chat-text" value={text} maxLength={1200} onChange={e => setText(e.target.value)} placeholder="Em muốn chia sẻ điều gì?"/><button className="primary-button" disabled={busy || !text.trim()} aria-label="Gửi tin nhắn"><Send size={18}/></button></form></Modal>}</>;
}
