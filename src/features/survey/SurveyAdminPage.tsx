import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Download, Printer, ShieldCheck, Lock, Eye, Plus, RefreshCw } from 'lucide-react';
import type { AuthAccount } from '../../types/auth';
import type { Campaign, SurveyRecord } from '../../../shared/surveys/contracts';
import { surveyService, DEMO_MODE } from '../../services/surveyService';
import Modal from '../shell/Modal';
import SurveyPrint from './SurveyPrint';
export default function SurveyAdminPage({ account }: {
    account: AuthAccount;
}) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]), [selected, setSelected] = useState(''), [report, setReport] = useState<Awaited<ReturnType<typeof surveyService.report>> | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [detail, setDetail] = useState<SurveyRecord | null>(null), [print, setPrint] = useState(false), [title, setTitle] = useState(''), [school, setSchool] = useState(account.profile.school), [grantUser, setGrantUser] = useState(''), [readRaw, setReadRaw] = useState(false), [canExport, setCanExport] = useState(false), [reload, setReload] = useState(0);
    const closeDetail = useCallback(() => setDetail(null), []);
    const closePrint = useCallback(() => setPrint(false), []);
    useEffect(() => { let active = true; setBusy(true); setError(''); surveyService.list().then(data => { if (!active)
        return; setCampaigns(data); setSelected(s => data.some(c => c.id === s) ? s : data[0]?.id ?? ''); }).catch(e => active && setError(e.message)).finally(() => active && setBusy(false)); return () => { active = false; }; }, [reload, account.id]);
    useEffect(() => { let active = true; setReport(null); if (selected)
        surveyService.report(selected).then(data => active && setReport(data)).catch(e => active && setError(e.message)); return () => { active = false; }; }, [selected, reload]);
    async function act(work: () => Promise<unknown>) { setBusy(true); setError(''); try {
        await work();
        setReload(v => v + 1);
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        setBusy(false);
    } }
    if (!['Admin', 'Quản trị viên cấp cao'].includes(account.role))
        return <div className="page-wrap"><section className="surface-card"><Lock /><h1>Chưa có quyền nghiên cứu</h1><p>Giáo viên/học sinh không mặc định được xem phản hồi của người khác.</p><Link to="/">Về trang chủ</Link></section></div>;
    return <div className="page-wrap admin-page"><header className="surface-card page-heading"><span className="eyebrow">NHÓM NGHIÊN CỨU</span><h1>Dữ liệu khảo sát sức khỏe tâm thần</h1><p>Quản lý theo đợt và quyền được cấp. Không lấy dữ liệu giả làm fallback khi backend lỗi.</p><div className="toolbar"><button className="secondary-button" onClick={() => setReload(v => v + 1)} disabled={busy}><RefreshCw size={16}/> Làm mới</button><button className="secondary-button" onClick={() => setPrint(true)}><Printer size={16}/> In phiếu A–J</button></div></header>
 <div className="notice"><ShieldCheck /><p>Thu dữ liệu thật đang khóa. Mở đợt thật cần server cho phép và chính sách/scoring đã được duyệt. Superadmin cũng cần grant riêng để đọc/export dữ liệu thô.</p></div>
 {error && <p className="error-note" role="alert">{error}</p>}
 <div className="surface-card"><label htmlFor="campaign-choice">Chọn đợt</label><select id="campaign-choice" value={selected} onChange={e => setSelected(e.target.value)}><option value="">{busy ? 'Đang tải…' : 'Chưa có đợt'}</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.title} · {c.school}</option>)}</select></div>
 {report && <><section className="stats-grid"><div className="surface-card"><span>{DEMO_MODE ? 'Số phiếu mô phỏng' : 'Tổng phiếu từ backend'}</span><strong>{report.total}</strong></div><div className="surface-card"><span>Loại đợt</span><strong>{report.campaign.isDemo ? 'Demo' : 'Thật · có phê duyệt'}</strong></div><div className="surface-card"><span>Dữ liệu thô</span><strong>{report.permissions.readRaw ? DEMO_MODE ? 'Quyền mô phỏng' : 'Đã cấp quyền' : 'Khóa'}</strong></div></section>
 <section className="surface-card"><h2>{report.campaign.title}</h2><p>Mã đợt: <strong>{report.campaign.code}</strong> · {report.campaign.status}</p><Link className="secondary-button" to={`/khao-sat/${report.campaign.code}`}>Mở trang tham gia</Link><div className="toolbar"><button className="secondary-button" disabled={DEMO_MODE || busy} onClick={() => void act(() => surveyService.update(selected, { status: 'open' }))}>Mở đợt demo/đợt đã duyệt</button><button className="secondary-button" disabled={DEMO_MODE || busy} onClick={() => void act(() => surveyService.update(selected, { status: 'closed' }))}>Đóng đợt</button><button className="primary-button" disabled={DEMO_MODE || !report.permissions.export || busy} onClick={() => void act(() => surveyService.exportCsv(selected))}><Download size={16}/> Xuất dữ liệu thô CSV</button></div>
 {!report.permissions.readRaw ? <p className="muted"><Lock size={16}/> Chưa có grant đọc. Không hiển thị danh sách hoặc nội dung phản hồi.</p> : report.responses.length === 0 ? <p className="muted">Chưa có phản hồi. Không tự thêm dữ liệu mẫu.</p> : <div className="table-scroll"><table><thead><tr><th>Mã phiếu</th><th>Thời gian nộp</th><th>Phiên bản</th><th>Chi tiết</th></tr></thead><tbody>{report.responses.map(r => <tr key={r.responseId}><td>{r.responseId}</td><td>{new Date(r.savedAt).toLocaleString('vi-VN')}</td><td>{r.definitionVersion}</td><td><button className="icon-button" aria-label={`Xem phản hồi ${r.responseId}`} onClick={() => setDetail(r)}><Eye size={18}/></button></td></tr>)}</tbody></table></div>}
 {report.nextCursor && <button className="secondary-button" onClick={async () => { try {
            const next = await surveyService.report(selected, report.nextCursor!);
            setReport({ ...next, responses: [...report.responses, ...next.responses] });
        }
        catch (e) {
            setError((e as Error).message);
        } }}>Xem thêm</button>}</section></>}
 <section className="surface-card"><h2>Tạo đợt mới</h2><p className="muted">Không cấp quyền đọc dữ liệu thô tự động cho người tạo đợt.</p><form onSubmit={e => { e.preventDefault(); void act(() => surveyService.create(title, school, true)); }}><label htmlFor="new-title">Tên đợt</label><input id="new-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={160} required/><label htmlFor="new-school">Trường</label><input id="new-school" value={school} onChange={e => setSchool(e.target.value)} readOnly={account.role === 'Admin'} required/><button className="primary-button" disabled={DEMO_MODE || busy}><Plus size={16}/> Tạo đợt development/demo</button><small>Đợt thu dữ liệu thật chỉ được cấu hình sau khi có hồ sơ phê duyệt và ủy quyền mở pilot.</small></form></section>
 {account.role === 'Quản trị viên cấp cao' && selected && <section className="surface-card"><h2>Cấp quyền nghiên cứu riêng</h2><form onSubmit={e => { e.preventDefault(); void act(() => surveyService.grant(selected, grantUser, readRaw, canExport)); }}><label htmlFor="grant-user">ID tài khoản quản trị đang hoạt động</label><input id="grant-user" value={grantUser} onChange={e => setGrantUser(e.target.value)} required/><label className="consent-checkbox"><input type="checkbox" checked={readRaw} onChange={e => setReadRaw(e.target.checked)}/>Cho phép đọc phản hồi thô</label><label className="consent-checkbox"><input type="checkbox" checked={canExport} onChange={e => setCanExport(e.target.checked)}/>Cho phép export riêng</label><button className="primary-button" disabled={DEMO_MODE || busy}>Lưu quyền theo đợt (có audit)</button></form></section>}
 {detail && <Modal title="Phản hồi · quyền nghiên cứu" onClose={closeDetail}><SurveyPrint record={detail}/><button className="secondary-button" onClick={() => window.print()}>In phản hồi</button></Modal>}
 {print && <Modal title="Phiếu dành cho học sinh · A–J" onClose={closePrint}><SurveyPrint /><button className="primary-button" onClick={() => window.print()}>In phiếu (không có phụ lục/khóa chấm)</button></Modal>}</div>;
}
