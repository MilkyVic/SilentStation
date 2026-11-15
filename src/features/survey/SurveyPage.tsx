import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Trash2 } from 'lucide-react';
import { DEFINITION, countAnswers, type Answers, type Campaign, type Draft, type Question, type Receipt, type SectionId } from '../../../shared/surveys/contracts';
import { surveyService, DEMO_MODE, SurveyClientError } from '../../services/surveyService';
import Support from '../shell/Support';
import Modal from '../shell/Modal';
function QuestionCard({ q, answer, onChange }: {
    q: Question;
    answer: Answers[string];
    onChange: (a: Answers[string]) => void;
}) {
    const ordinal = DEFINITION.questions.filter(question => question.section === q.section).findIndex(question => question.code === q.code) + 1;
    return <fieldset className="question-card"><legend>{q.section}{ordinal}. {q.label.replace(/^([A-J]?\d+|C11)\.\s*/, '')}</legend>{q.kind === 'single' ? <div className={`answer-options options-${q.options!.length} ${q.options!.every(o => o.label.length < 40) && q.options!.length <= 4 ? 'compact-options' : ''} ${q.options!.length > 4 ? 'many-options' : ''}`} role="radiogroup" aria-label={q.label}>{q.options!.map(o => <label className={`answer-option ${answer.status === 'answered' && answer.value === o.value ? 'selected' : ''}`} key={String(o.value)}><input type="radio" name={q.code} checked={answer.status === 'answered' && answer.value === o.value} onChange={() => onChange({ status: 'answered', value: o.value })}/><span>{o.label}</span></label>)}</div> : <><label className="sr-only" htmlFor={q.code}>{q.label}</label>{q.kind === 'text' ? <textarea id={q.code} rows={3} maxLength={2000} value={answer.status === 'answered' ? String(answer.value) : ''} onChange={e => onChange(e.target.value ? { status: 'answered', value: e.target.value } : { status: 'unanswered' })} placeholder="Em có thể để trống nếu chưa sẵn sàng…"/> : <input id={q.code} type="number" min={q.min} max={q.code === 'A.birthYear' ? new Date().getFullYear() : q.max} value={answer.status === 'answered' ? answer.value : ''} onChange={e => onChange(e.target.value ? { status: 'answered', value: Number(e.target.value) } : { status: 'unanswered' })}/>}</>}
 <div className="question-actions"><button type="button" className="text-button" aria-pressed={answer.status === 'skipped'} onClick={() => onChange(answer.status === 'skipped' ? { status: 'unanswered' } : { status: 'skipped' })}>{answer.status === 'skipped' ? 'Đã bỏ qua · trả lời lại' : 'Em muốn bỏ qua câu này'}</button>{answer.status === 'answered' && <button className="text-button muted" type="button" onClick={() => onChange({ status: 'unanswered' })}>Xóa lựa chọn</button>}</div></fieldset>;
}
export default function SurveyPage() {
    const { code } = useParams(), navigate = useNavigate();
    const [entry, setEntry] = useState(DEMO_MODE ? 'DEMO' : ''), [campaign, setCampaign] = useState<Campaign | null>(null), [draft, setDraft] = useState<Draft | null>(null), [section, setSection] = useState(0), [consent, setConsent] = useState(false), [error, setError] = useState(''), [saving, setSaving] = useState(''), [busy, setBusy] = useState(false), [review, setReview] = useState(false), [receipt, setReceipt] = useState<Receipt | null>(null), [deleteOpen, setDeleteOpen] = useState(false);
    const draftRef = useRef<Draft | null>(null), chain = useRef<Promise<unknown>>(Promise.resolve()), loaded = useRef(false), idempotency = useRef(crypto.randomUUID()), conflict = useRef(false);
    useEffect(() => { let active = true; loaded.current = false; conflict.current = false; setCampaign(null); setDraft(null); draftRef.current = null; setReceipt(null); setError(''); setSection(0); if (!code)
        return; surveyService.campaign(code).then(async (data) => { if (!active)
        return; setCampaign(data.campaign); try {
        const saved = await surveyService.load(code);
        if (!active)
            return;
        draftRef.current = saved;
        setDraft(saved);
        setConsent(true);
        const next = DEFINITION.sections.findIndex(s => !saved.reviewedSections.includes(s.id));
        setSection(next < 0 ? 9 : next);
        if (saved.receipt)
            setReceipt(saved.receipt);
    }
    catch (e) {
        if (e instanceof SurveyClientError && !['SURVEY_SESSION_REQUIRED', 'SURVEY_SESSION_EXPIRED'].includes(e.code))
            setError(e.message);
    } loaded.current = true; }).catch(e => active && setError(e.message)); return () => { active = false; }; }, [code]);
    async function start() { if (!code || !campaign || !consent)
        return; setBusy(true); setError(''); try {
        const saved = await surveyService.start(code, campaign.consentVersion);
        draftRef.current = saved;
        setDraft(saved);
        if (saved.receipt)
            setReceipt(saved.receipt);
        loaded.current = true;
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    const enqueueSave = useCallback((answers: Answers, sections: SectionId[]) => { if (!code)
        return Promise.resolve(); if (conflict.current)
        return Promise.reject(new Error('Nháp có xung đột. Tải lại bản đã lưu trước khi chỉnh tiếp.')); setSaving('Đang lưu…'); const task = chain.current.catch(() => { }).then(async () => { const current = draftRef.current; if (!current)
        return; const saved = await surveyService.save(code, answers, sections, current.revision); draftRef.current = saved; setSaving(DEMO_MODE ? 'Nháp demo chỉ trong lần mở này' : 'Đã lưu trên backend'); setError(''); return saved; }); chain.current = task; task.catch(e => { if (e instanceof SurveyClientError && e.code === 'SURVEY_DRAFT_CONFLICT')
        conflict.current = true; setSaving('Lưu thất bại'); setError((e as Error).message); }); return task; }, [code]);
    function change(answers: Answers) { setDraft(d => d ? { ...d, answers } : d); }
    useEffect(() => { if (!draft || !loaded.current || draft.submitted)
        return; const timer = setTimeout(() => { void enqueueSave(draft.answers, draft.reviewedSections); }, 700); return () => clearTimeout(timer); }, [draft?.answers, draft?.reviewedSections, enqueueSave]);
    async function next() { if (!draft)
        return; const reviewed = [...new Set([...draft.reviewedSections, DEFINITION.sections[section].id])]; setDraft({ ...draft, reviewedSections: reviewed }); try {
        await enqueueSave(draft.answers, reviewed);
    }
    catch {
        return;
    } if (section === 9)
        setReview(true);
    else {
        setSection(s => s + 1);
        window.scrollTo({ top: 0, behavior: 'instant' });
    } }
    async function submit() { if (!draft || !code)
        return; setBusy(true); setError(''); try {
        await chain.current;
        const saved = await enqueueSave(draft.answers, draft.reviewedSections) as Draft;
        const result = await surveyService.submit(code, saved.revision, idempotency.current);
        loaded.current = false;
        draftRef.current = null;
        setDraft(null);
        setReceipt(result);
        setReview(false);
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    const closeDelete = useCallback(() => setDeleteOpen(false), []);
    if (!code)
        return <div className="page-wrap"><section className="surface-card entry-card"><span className="eyebrow">KHẢO SÁT HỌC SINH</span><h1>Một hành trình nhỏ để hiểu mình hơn</h1><p>Em không cần đăng nhập. Hãy nhập mã đợt do người phụ trách cung cấp, hoặc mở link mời của đợt khảo sát.</p><form onSubmit={e => { e.preventDefault(); if (entry.trim())
            navigate(`/khao-sat/${encodeURIComponent(entry.trim().toUpperCase())}`); }}><label htmlFor="campaign-code">Mã đợt khảo sát</label><div className="inline-form"><input id="campaign-code" value={entry} onChange={e => setEntry(e.target.value)} maxLength={32} placeholder="Ví dụ: mã do trường cung cấp" required/><button className="primary-button">Bắt đầu <ArrowRight size={18}/></button></div></form><p className="muted">Thu dữ liệu thật đang khóa cho đến khi phiếu, chính sách và đầu mối được duyệt.</p>{DEMO_MODE && <p className="demo-note">Mã DEMO chỉ mô phỏng giao diện. Nháp demo không khôi phục sau reload.</p>}</section><Support /></div>;
    if (receipt)
        return <div className="page-wrap"><section className="surface-card completion-card"><Check size={44}/><span className="eyebrow">{DEMO_MODE ? 'THAO TÁC DEMO' : 'SERVER ĐÃ XÁC NHẬN LƯU'}</span><h1>Cảm ơn em đã chia sẻ 🌿</h1><p>{DEMO_MODE ? 'Đây là mô phỏng. Không gửi hoặc lưu phản hồi nghiên cứu thật.' : 'Phản hồi đã được backend ghi nhận. Không hiển thị chẩn đoán hay kết luận khi chưa được duyệt.'}</p><small>Mã ghi nhận: {receipt.responseId}</small><Link className="primary-button" to="/">Về trang chủ</Link></section><Support /></div>;
    if (!campaign)
        return <div className="page-wrap"><section className="surface-card"><h1>{error ? 'Chưa thể mở đợt' : 'Đang đọc thông tin đợt…'}</h1>{error && <p role="alert">{error}</p>}<Link to="/khao-sat">Nhập mã khác</Link></section></div>;
    if (!draft)
        return <div className="page-wrap"><section className="surface-card consent-card"><span className="eyebrow">{campaign.isDemo ? 'ĐỢT DEMO' : 'KHẢO SÁT TỰ NGUYỆN'}</span><h1>Phiếu khảo sát sức khỏe tâm thần học sinh</h1><p>{campaign.title}</p><p>{campaign.school}</p><div className="notice"><ShieldCheck size={24}/><p>Không yêu cầu tài khoản hoặc họ tên. Em có thể bỏ qua câu hoặc dừng. Nháp lưu tối đa 24 giờ trên cùng trình duyệt; hãy xóa nháp khi dùng máy chung. Không ghi thông tin nhận diện trong câu tự luận.</p></div><p>{campaign.isDemo ? 'Đây là đợt demo, không nhập dữ liệu thật.' : 'Chỉ tham gia khi nội dung và chính sách của đợt đã được người phụ trách duyệt.'} Website không theo dõi tình huống khẩn cấp tức thời.</p><label className="consent-checkbox"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>Em đã đọc thông tin tham gia và đồng ý bắt đầu {campaign.isDemo ? 'demo' : ''}.</label><button className="primary-button" disabled={!consent || busy} onClick={() => void start()}>Bắt đầu phần A <ArrowRight size={18}/></button>{error && <p role="alert" className="error-note">{error}</p>}</section><Support /></div>;
    const current = DEFINITION.sections[section], counts = countAnswers(draft.answers);
    return <div className="page-wrap survey-wrap"><div className="survey-progress surface-card"><div><strong>Phần {section + 1}/10 · {current.id}</strong><span role="status" className="muted">{saving || 'Chưa có thay đổi'}</span></div><progress max={10} value={draft.reviewedSections.length} aria-label="Số phần đã xem"/><div className="survey-stepper">{DEFINITION.sections.map((s, i) => <button key={s.id} className={section === i ? 'current' : ''} aria-label={`Mở phần ${s.id}: ${s.title}`} aria-current={section === i ? 'step' : undefined} onClick={() => setSection(i)}>{s.id}{draft.reviewedSections.includes(s.id) && <Check size={12}/>}</button>)}</div><button className="text-button" onClick={() => setDeleteOpen(true)}><Trash2 size={15}/> Thoát và xóa nháp</button></div><header className="surface-card page-heading"><span className="eyebrow">PHẦN {current.id}</span><h1>{current.title}</h1><p>{current.instruction}</p><p className="muted">{counts.answered} đã trả lời · {counts.skipped} bỏ qua · {counts.unanswered} chưa trả lời</p></header>{error && <div role="alert" className="error-note">{error}<button onClick={() => { if (conflict.current) {
        if (window.confirm('Tải lại bản đã lưu có thể mất thay đổi chưa lưu ở tab này. Tiếp tục?'))
            window.location.reload();
    }
    else
        void enqueueSave(draft.answers, draft.reviewedSections); }}>{conflict.current ? 'Tải lại bản đã lưu' : 'Thử lưu lại'}</button></div>}
 {DEFINITION.questions.filter(q => q.section === current.id).map(q => <QuestionCard key={q.code} q={q} answer={draft.answers[q.code]} onChange={answer => change({ ...draft.answers, [q.code]: answer })}/>)}
 <nav className="survey-footer"><button className="secondary-button" disabled={section === 0 || busy} onClick={() => { setSection(s => s - 1); window.scrollTo({ top: 0, behavior: 'instant' }); }}><ArrowLeft size={17}/> Quay lại</button><button className="primary-button" disabled={busy} onClick={() => void next()}>{section === 9 ? 'Xem lại trước khi nộp' : 'Đã xem · Tiếp theo'}<ArrowRight size={17}/></button></nav>
 {review && <Modal title="Xem lại phiếu trước khi nộp" onClose={() => setReview(false)}><p>{counts.answered} câu đã trả lời, {counts.skipped} bỏ qua, {counts.unanswered} chưa trả lời.</p><p>Câu thiếu không bị quy thành điểm 0 hoặc kết quả bình thường. Em có thể nộp cả khi chưa trả lời mọi câu.</p>{draft.reviewedSections.length < 10 ? <p className="error-note">Em còn phần chưa xem. Mở các phần bằng thanh A–J và nhấn “Đã xem” trước khi nộp.</p> : null}<button className="primary-button" disabled={busy || draft.reviewedSections.length < 10} onClick={() => void submit()}>{busy ? 'Đang gửi…' : DEMO_MODE ? 'Mô phỏng nộp phiếu' : 'Xác nhận nộp phiếu'}</button></Modal>}
 {deleteOpen && <Modal title="Xóa nháp trên trình duyệt này?" onClose={closeDelete}><p>Nháp chưa nộp sẽ bị xóa khỏi backend. Thao tác này không xóa phản hồi đã nộp.</p><button className="danger-button" onClick={async () => { try {
        await chain.current.catch(() => { });
        await surveyService.clear(code);
        setDeleteOpen(false);
        navigate('/');
    }
    catch (e) {
        setError((e as Error).message);
        setDeleteOpen(false);
    } }}>Xác nhận xóa nháp và thoát</button></Modal>}</div>;
}
