import {ui,useLocale} from '../preferences/ui';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../shell/Modal';
import type { ClassDto, ManagedUser, SchoolDto } from '../../../shared/accounts';
import { accountApi, Feedback, useRead, useWrite, useReauth } from './client';
const roleName: any = { student: 'Học sinh', teacher: 'Giáo viên', admin: 'Admin', superadmin: 'Superadmin' };
export default function ManagementPage({ view = 'overview', onSessionChanged }: {
    view?: string;
    onSessionChanged: () => Promise<void>;
}) {useLocale();
    const cap = useRead('/auth/capabilities'), schools = useRead('/schools'), classes = useRead('/classes'), [reload, setReload] = useState(0), [selected, setSelected] = useState<ManagedUser | null>(null), [orgEdit, setOrgEdit] = useState<any>(null), [invite, setInvite] = useState(false);
    const a: ManagedUser | undefined = cap.data?.user;
    const [role, setRole] = useState(view === 'teacher-list' ? 'teacher' : view === 'admin-list' ? 'admin' : ''), [search, setSearch] = useState(''), [cursor, setCursor] = useState('');
    const users = useRead(a && !(a.role === 'teacher' && !a.classId) && (view === 'overview' || ['teacher-list', 'admin-list', 'users', 'class-list'].includes(view)) ? `/users?limit=50&role=${role}&q=${encodeURIComponent(search)}&cursor=${encodeURIComponent(cursor)}&refresh=${reload}` : null);
    const refresh = () => { setReload(v => v + 1); classes.reload(); schools.reload(); };
    if (cap.loading)
        return <div className="page-wrap"><p role="status">{ui("Đang xác nhận quyền từ server…")}</p></div>;
    if (cap.error || !a)
        return <div className="page-wrap"><p role="alert" className="error-note">{cap.error}</p><button onClick={cap.reload}>{ui("Tải lại")}</button></div>;
    const teacher = a.role === 'teacher';
    if (teacher && (a.profile.teacherType !== 'homeroom' || !a.classId))
        return <div className="page-wrap"><section className="surface-card"><h1>{ui("Khu vực giáo viên")}</h1><p>{ui("Chưa có phân công lớp/niên khóa hợp lệ. Không thể xem danh sách học sinh hoặc tạo mã lớp; quản trị có thể thiết lập sau.")}</p><Link className="secondary-button" to="/khao-sat">{ui("Khảo sát ẩn danh")}</Link><Link className="primary-button" to="/bai-danh-gia">{ui("Bài tự đánh giá")}</Link></section></div>;
    return <div className="page-wrap account-console"><header><h1>{view === 'reports' ? ui("Báo cáo bài test") : view === 'school-list' ? ui("Quản lý trường") : view === 'class-list' ? ui("Quản lý lớp và niên khóa") : teacher ? ui("Lớp chủ nhiệm") : ui("Quản trị tài khoản và đơn vị")}</h1><p>{ui(roleName[a.role])}{' '} · {a.profile.school || 'Phạm vi liên trường'}</p></header><nav className="button-row account-tabs"><Link to="/quan-tri">{ui("Tài khoản")}</Link>{!teacher && <><Link to="/quan-tri/teacher-list">{ui("Giáo viên")}</Link><Link to="/quan-tri/class-list">{ui("Lớp/niên khóa")}</Link>{a.role === 'superadmin' && <><Link to="/quan-tri/school-list">{ui("Trường")}</Link><Link to="/quan-tri/admin-list">{ui("Admin")}</Link></>}</>}<Link to="/quan-tri/reports">{ui("Báo cáo")}</Link><Link to={teacher?"/khao-sat":"/nghien-cuu"}>{teacher?ui("Khảo sát ẩn danh"):ui("Đợt khảo sát A–J")}</Link><Link to={teacher?"/bai-danh-gia":"/quan-tri/test-list"}>{teacher?ui("Bài tự đánh giá"):ui("Quản lý bài test")}</Link></nav>
 {view === 'reports' ? <Reports actor={a}/> : view === 'school-list' ? <section className="surface-card"><h2>{ui("Trường học")}</h2>{a.role === 'superadmin' && <button className="primary-button" onClick={() => setOrgEdit({ kind: 'school', name: '', address: '', status: 'active' })}>{ui("Tạo trường")}</button>}<Feedback busy={schools.loading} error={schools.error}/>{schools.data?.schools?.map((s: SchoolDto) => <article className="management-record" key={s.id}><div><h3>{s.name}</h3><p>{s.address} · {s.status === 'active' ? ui("Hoạt động") : ui("Đã lưu trữ")}</p></div><button className="secondary-button" onClick={() => setOrgEdit({ ...s, kind: 'school' })}>{ui("Chỉnh sửa trường")}</button></article>)}</section> : <>
 {(view === 'class-list' || teacher) && <section className="surface-card"><h2>{ui("Lớp/niên khóa")}</h2>{!teacher && <button className="primary-button" onClick={() => setOrgEdit({ kind: 'class', schoolId: a.schoolId ?? schools.data?.schools?.[0]?.id ?? '', name: '', academicYear: '', status: 'active' })}>{ui("Tạo lớp")}</button>}<Feedback busy={classes.loading} error={classes.error}/>{classes.data?.classes?.map((c: ClassDto) => <article className="management-record" key={c.id}><div><h3>{c.name} · {c.academicYear}</h3><p>{c.studentCount} {ui("học sinh · GVCN:")}{' '}{c.homeroomTeacherName || 'Chưa phân công'} · {c.status}</p></div>{!teacher && <button className="secondary-button" onClick={() => setOrgEdit({ ...c, kind: 'class' })}>{ui("Chỉnh sửa lớp")}</button>}</article>)}</section>}
 <section className="surface-card"><h2>{teacher ? ui("Học sinh trong lớp") : ui("Tài khoản")}</h2>{view === 'admin-list' && a.role === 'superadmin' && <button className="primary-button" onClick={() => setInvite(true)}>{ui("Mời Admin qua email")}</button>}{!teacher && <div className="account-form-grid"><label>{ui("Lọc vai trò")}{' '}<select value={role} onChange={e => { setRole(e.target.value); setCursor(''); }}><option value="">{ui("Tất cả trong phạm vi")}</option><option value="student">{ui("Học sinh")}</option><option value="teacher">{ui("Giáo viên")}</option>{a.role === 'superadmin' && <option value="admin">{ui("Admin")}</option>}</select></label><label>{ui("Tìm tên/username")}{' '}<input value={search} onChange={e => { setSearch(e.target.value); setCursor(''); }}/></label></div>}<Feedback busy={users.loading} error={users.error}/><p role="status">{ui("Tổng từ server:")}{' '}{users.data?.total ?? '—'}</p>{users.data?.users?.map((u: any) => <article key={u.id} className="management-record"><div><h3>{u.profile?.name ?? u.name} · @{u.username}</h3><p>{u.role ? roleName[u.role] : ''} · {u.activationPending ? ui("Chưa kích hoạt") : u.status} {u.profile?.className ? `· ${u.profile.className}` : ''}</p></div>{!teacher && <button className="secondary-button" onClick={() => setSelected(u)}>{ui("Xem / quản lý")}</button>}</article>)}{!users.loading && users.data?.total === 0 && <p>{ui("Không có tài khoản phù hợp bộ lọc.")}</p>}<div className="button-row"><button className="secondary-button" disabled={!cursor} onClick={() => setCursor('')}>{ui("Trang đầu")}</button><button className="secondary-button" disabled={!users.data?.nextCursor || users.loading} onClick={() => setCursor(users.data.nextCursor)}>{ui("Trang tiếp theo")}</button></div>{teacher && <p className="muted">{ui("Chỉ hiển thị danh sách tối thiểu. Email, số điện thoại và thao tác sửa/khóa thuộc quyền quản trị.")}</p>}</section>{teacher && <ClassCodes actor={a}/>}</>}
 {selected && <UserEditor key={selected.id} initial={selected} actor={a} classes={classes.data?.classes ?? []} schools={schools.data?.schools ?? []} onClose={() => setSelected(null)} onSaved={refresh} onSessionChanged={onSessionChanged}/>}{orgEdit && <OrganizationEditor initial={orgEdit} schools={schools.data?.schools ?? []} onClose={() => setOrgEdit(null)} onSaved={refresh}/>}{invite && <InviteAdmin schools={schools.data?.schools ?? []} onClose={() => setInvite(false)} onSaved={refresh}/>}</div>;
}
function OrganizationEditor({ initial, schools, onClose, onSaved }: {
    initial: any;
    schools: SchoolDto[];
    onClose: () => void;
    onSaved: () => void;
}) {useLocale(); const [form, set] = useState(initial), w = useWrite(); async function submit(e: any) { e.preventDefault(); try {
    const body = form.kind === 'school' ? { name: form.name, address: form.address, status: form.status } : { name: form.name, schoolId: form.schoolId, academicYear: form.academicYear, status: form.status };
    await w.run('/' + (form.kind === 'school' ? 'schools' : 'classes') + (form.id ? '/' + form.id : ''), form.id ? 'PATCH' : 'POST', { ...body, ...(form.id ? { expectedRevision: form.revision } : {}) });
    onSaved();
    onClose();
}
catch { } } return <Modal title={form.kind === 'school' ? 'Thông tin trường' : 'Thông tin lớp/niên khóa'} onClose={onClose}><Feedback busy={w.busy} error={w.error}/>{w.uncertain&&<button className="primary-button" onClick={()=>void w.retry().then(()=>{onSaved();onClose();}).catch(()=>{})}>{ui("Retry cùng lần gửi đang chờ")}</button>}<form onSubmit={submit}><fieldset disabled={w.busy||w.uncertain}><label>{ui("Tên")}{' '}<input required value={form.name} onChange={e => set((p: any) => ({ ...p, name: e.target.value }))}/></label>{form.kind === 'school' ? <label>{ui("Địa chỉ")}{' '}<input value={form.address} onChange={e => set((p: any) => ({ ...p, address: e.target.value }))}/></label> : <><label>{ui("Trường")}{' '}<select required disabled={!!form.id} value={form.schoolId} onChange={e => set((p: any) => ({ ...p, schoolId: e.target.value }))}><option value="">{ui("Chọn trường")}</option>{schools.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>{ui("Niên khóa do quản trị xác nhận")}{' '}<input required placeholder="2026-2027" value={form.academicYear} onChange={e => set((p: any) => ({ ...p, academicYear: e.target.value }))}/></label></>}<label>{ui("Trạng thái")}{' '}<select value={form.status} onChange={e => set((p: any) => ({ ...p, status: e.target.value }))}><option value="active">{ui("Hoạt động")}</option><option value="archived">{ui("Lưu trữ — không xóa lịch sử")}</option></select></label><p>{ui("Server sẽ chặn lưu trữ nếu còn phụ thuộc hoạt động. Không tự suy niên khóa.")}</p></fieldset><div className="button-row"><button className="secondary-button" type="button" onClick={onClose}>{ui("Hủy")}</button><button className="primary-button" disabled={w.busy||w.uncertain}>{w.uncertain ? ui("Retry cùng lần gửi") : ui("Lưu vào server")}</button></div></form></Modal>; }
function UserEditor({ initial, actor, classes, schools, onClose, onSaved, onSessionChanged }: {
    initial: ManagedUser;
    actor: ManagedUser;
    classes: ClassDto[];
    schools: SchoolDto[];
    onClose: () => void;
    onSaved: () => void;
    onSessionChanged: () => Promise<void>;
}) {useLocale();
    const [u, setUser] = useState(initial), [f, set] = useState({ ...initial.profile }), [assignment, setAssignment] = useState({ schoolId: initial.schoolId ?? '', classId: initial.classId ?? '', teacherType: initial.profile.teacherType || 'subject' }), [notice, setNotice] = useState('');
    const w = useWrite(), reauth = useReauth();
    async function act(action: string) { try {
        let path = '/users/' + u.id, method = 'POST', body: any = { expectedRevision: u.revision };
        if (action === 'profile') {
            method = 'PATCH';
            body = { ...body, name: f.name, phone: f.phone, birthYear: f.birthYear, gender: f.gender, bio: f.bio, avatarKey: f.avatarKey, ...(u.role === 'teacher' ? { subject: f.subject } : {}) };
        }
        else if (action === 'assignment')
            body = { ...body, ...assignment, reauthId: await reauth.request('assignment', u.id, 'Thay đổi phân công của @' + u.username) };
        else if (action === 'status')
            body = { ...body, status: u.status === 'active' ? 'suspended' : 'active', reauthId: await reauth.request('status', u.id, (u.status === 'active' ? 'Vô hiệu hóa' : 'Khôi phục') + ' @' + u.username) };
        else if (action === 'password-reset')
            body.reauthId = await reauth.request('password-reset', u.id, 'Gửi yêu cầu khôi phục mật khẩu cho @' + u.username);
        else if (action === 'approve')
            body = { ...body, ...assignment };
        if (action !== 'profile')
            path += '/' + action;
        const r = await w.run(path, method, body);
        if(r.replayed&&!r.user&&actor.id!==u.id){const fresh=await accountApi('/users/'+u.id);r.user=fresh.user;}
        if (r.user) {
            setUser(r.user);
            set({ ...r.user.profile });
        }
        setNotice('Server đã xác nhận ' + (action === 'password-reset' ? 'tiếp nhận yêu cầu email, chưa xác nhận đã gửi.' : 'thao tác.'));
        onSaved();
        if (r.loginRequired || actor.id === u.id && ['assignment', 'status'].includes(action))
            await onSessionChanged();
    }
    catch (e) {
        w.setError((e as Error).message);
    } }
    return <Modal title={'Quản lý @' + u.username} onClose={onClose}><Feedback busy={w.busy} error={w.error} notice={notice}/>{w.uncertain&&<button className="primary-button" onClick={()=>void w.retry().then(async r=>{if(!r.user&&actor.id!==u.id){const fresh=await accountApi('/users/'+u.id);r.user=fresh.user;}if(r.user){setUser(r.user);set({...r.user.profile});}setNotice("Server đã xác nhận lần gửi đang chờ.");onSaved();if(r.loginRequired)await onSessionChanged();}).catch(()=>{})}>{ui("Retry cùng lần gửi đang chờ")}</button>}<p>{ui(roleName[u.role])}{' '} · {u.status}{ui(". Email:")}{' '}{u.profile.email} ({u.emailVerified ? ui("đã xác minh") : ui("chưa xác minh")}).</p><fieldset disabled={w.busy||w.uncertain}><label>{ui("Họ và tên")}{' '}<input value={f.name} onChange={e => set(p => ({ ...p, name: e.target.value }))}/></label><label>{ui("Điện thoại — chưa xác minh")}{' '}<input value={f.phone} onChange={e => set(p => ({ ...p, phone: e.target.value }))}/></label><label>{ui("Năm sinh")}{' '}<input value={f.birthYear} onChange={e => set(p => ({ ...p, birthYear: e.target.value }))}/></label><label>{ui("Giới tính")}{' '}<select value={f.gender} onChange={e => set(p => ({ ...p, gender: e.target.value }))}><option value="">{ui("Chưa cung cấp")}</option>{['Nam', 'Nữ', 'Khác'].map(v => <option key={v}>{ui(v)}</option>)}</select></label>{u.role === 'teacher' && <label>{ui("Môn giảng dạy")}{' '}<input value={f.subject} onChange={e => set(p => ({ ...p, subject: e.target.value }))}/></label>}</fieldset><button className="primary-button" disabled={w.busy||w.uncertain} onClick={() => void act('profile')}>{ui("Lưu hồ sơ cơ bản")}</button><h3>{ui("Phân công / xét duyệt")}</h3><fieldset disabled={w.busy||w.uncertain}><label>{ui("Trường")}{' '}<select value={assignment.schoolId} onChange={e => setAssignment(p => ({ ...p, schoolId: e.target.value, classId: '' }))}>{schools.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>{!['admin', 'superadmin'].includes(u.role) && <label>{ui("Lớp / niên khóa")}{' '}<select value={assignment.classId} onChange={e => setAssignment(p => ({ ...p, classId: e.target.value }))}><option value="">{ui("Chưa phân lớp")}</option>{classes.filter(c => c.schoolId === assignment.schoolId && c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.name} · {c.academicYear}</option>)}</select></label>}{u.role === 'teacher' && <label>{ui("Phân công giáo viên")}{' '}<select value={assignment.teacherType} onChange={e => setAssignment(p => ({ ...p, teacherType: e.target.value }))}><option value="subject">{ui("Giáo viên bộ môn")}</option><option value="homeroom">{ui("GVCN một lớp")}</option></select></label>}</fieldset><div className="button-row">{u.status === 'pending' && u.role === 'teacher' ? <><button className="primary-button" disabled={w.busy||w.uncertain} onClick={() => void act('approve')}>{ui("Phê duyệt với phân công đã chọn")}</button><button className="secondary-button" disabled={w.busy||w.uncertain} onClick={() => void act('reject')}>{ui("Từ chối — không xóa")}</button></> : <button className="secondary-button" disabled={w.busy||w.uncertain} onClick={() => void act('assignment')}>{ui("Lưu phân công")}</button>}<button className="secondary-button" disabled={w.busy||w.uncertain || u.status === 'pending'||u.status==='suspended'&&!u.canRestore} title={u.status==='suspended'&&!u.canRestore?'Chưa được phê duyệt hoặc không có trạng thái để khôi phục':undefined} onClick={() => void act('status')}>{u.status === 'active' ? ui("Vô hiệu hóa tài khoản") : ui("Khôi phục tài khoản")}</button><button className="secondary-button" disabled={w.busy||w.uncertain || !u.emailVerified || u.status !== 'active'} title={!u.emailVerified ? 'Cần email đã xác minh' : 'Người nhận tự đặt mật khẩu'} onClick={() => void act('password-reset')}>{ui("Gửi OTP khôi phục")}</button><button className="secondary-button" onClick={onClose}>{ui("Đóng")}</button></div><p className="muted">{ui("Email/mật khẩu không được sửa trực tiếp. Vai trò/username không được tự nâng quyền.")}</p>{reauth.dialog}</Modal>;
}
function InviteAdmin({ schools, onClose, onSaved }: {
    schools: SchoolDto[];
    onClose: () => void;
    onSaved: () => void;
}) {useLocale(); const [f, set] = useState({ username: '', name: '', email: '', schoolId: schools.find(s => s.status === 'active')?.id ?? '' }), w = useWrite(), reauth = useReauth(); async function submit(e: any) { e.preventDefault(); try {
    const reauthId = await reauth.request('invite-admin', 'new-admin', 'Mời Admin mới qua email');
    await w.run('/admins', 'POST', { ...f, reauthId });
    onSaved();
    onClose();
}
catch (e) {
    w.setError((e as Error).message);
} } return <Modal title={ui("Mời Admin · người nhận tự đặt mật khẩu")} onClose={onClose}><Feedback busy={w.busy} error={w.error}/>{w.uncertain&&<button className="primary-button" onClick={()=>void w.retry().then(()=>{onSaved();onClose();}).catch(()=>{})}>{ui("Retry cùng lần gửi đang chờ")}</button>}<form onSubmit={submit}><fieldset disabled={w.busy||w.uncertain}>{(['username', 'name', 'email'] as const).map(k => <label key={k}>{k}<input required type={k === 'email' ? 'email' : 'text'} value={f[k]} onChange={e => set(p => ({ ...p, [k]: e.target.value }))}/></label>)}<label>{ui("Trường phụ trách")}{' '}<select value={f.schoolId} onChange={e => set(p => ({ ...p, schoolId: e.target.value }))}>{schools.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label></fieldset><p>{ui("Lời mời được xếp hàng email; không có mật khẩu tạm được hiển thị cho quản trị.")}</p><div className="button-row"><button type="button" className="secondary-button" onClick={onClose}>{ui("Hủy")}</button><button className="primary-button" disabled={w.busy||w.uncertain}>{ui("Tạo và tiếp nhận lời mời")}</button></div></form>{reauth.dialog}</Modal>; }
function Reports({ actor }: {
    actor: ManagedUser;
}) {useLocale();
    const [includeQa,setIncludeQa]=useState(false);
    const [cursor, setCursor] = useState(''), [group, setGroup] = useState(''), [exportError, setExportError] = useState(''), [exporting, setExporting] = useState(false);
    const q = new URLSearchParams({ days: '365',includeQa:String(includeQa), limit: '50', ...(cursor ? { cursor } : {}), ...(group ? JSON.parse(group) : {}) }).toString(), r = useRead('/tests/reports/overview?' + q);
    async function download() { if (exporting)
        return; setExporting(true); setExportError(''); try {
        const response = await fetch('/api/tests/reports/export?' + new URLSearchParams({ days: '365',includeQa:String(includeQa), ...(group ? JSON.parse(group) : {}) }), { credentials: 'include', signal: AbortSignal.timeout(60000) });
        if (!response.ok) {
            const d = await response.json();
            throw Error(d.error?.message ?? 'Export không được xác nhận.');
        }
        const blob = await response.blob(), url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url;
        a.download = 'tram-an-legacy-results.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
    catch (e) {
        setExportError((e as Error).message);
    }
    finally {
        setExporting(false);
    } }
    return <section className="surface-card"><h2>{ui("Kết quả theo ngữ cảnh lúc nộp")}</h2><p>{ui("Dữ liệu cũ thiếu bằng chứng: legacy_unknown, không suy từ hồ sơ hiện tại. Trung bình chỉ tính trong cùng bank/thang/score version; không có STRESS TB chung.")}</p><Feedback busy={r.loading} error={r.error || exportError}/><label><input type="checkbox" checked={includeQa} onChange={e=>{setIncludeQa(e.target.checked);setCursor('');}}/>{ui("Bao gồm kết quả TEST/QA")}</label><label>{ui("Lọc bank/score version")}{' '}<select value={group} onChange={e => { setGroup(e.target.value); setCursor(''); }}><option value="">{ui("Tất cả — không trộn trung bình")}</option>{r.data?.byTemplate?.map((t: any) => <option key={[t.templateId, t.scoreVersion, t.definitionDigest].join(':')} value={JSON.stringify({ templateId: t.templateId, scoreVersion: t.scoreVersion, ...(t.definitionDigest ? { definitionDigest: t.definitionDigest } : {}) })}>{t.templateTitle} · {t.scoreVersion} · {t.definitionDigest?.slice(0, 8) || 'legacy'}</option>)}</select></label><p>{ui("Tổng SQL:")}{' '}{r.data?.summary?.totalAttempts ?? '—'} {ui("lượt ·")}{' '}{r.data?.summary?.uniqueUsers ?? '—'} {ui("người · Trung bình:")}{' '}{r.data?.summary?.avgScore ?? 'Không áp dụng'} {ui("· Diễn giải: Chưa duyệt")}</p><div className="account-table-wrap"><table><thead><tr><th>{ui("Tài khoản")}</th><th>{ui("Bài test/version")}</th><th>{ui("Điểm đã lưu")}</th><th>{ui("Trường/lớp/niên khóa lúc nộp")}</th></tr></thead><tbody>{r.data?.attempts?.map((a: any) => <tr key={a.attemptId}><td>{a.username}{a.isQa&&<strong> · TEST/QA</strong>}</td><td>{a.templateTitle}<br />{a.scoreVersion}</td><td>{a.scoreTotal}<br />{a.scoreLevel}</td><td>{a.contextStatus === 'legacy_unknown' ? ui("Chưa xác định") : `${a.school} · ${a.className} · ${a.academicYear}`}</td></tr>)}</tbody></table></div><div className="button-row"><button className="secondary-button" disabled={!cursor} onClick={() => setCursor('')}>{ui("Trang đầu")}</button><button className="secondary-button" disabled={!r.data?.nextCursor || r.loading} onClick={() => setCursor(r.data.nextCursor)}>{ui("Trang tiếp theo")}</button><button className="primary-button" disabled={exporting || r.loading || !!r.error} onClick={() => void download()}>{exporting ? ui("Đang export…") : ui("Xuất CSV toàn bộ bộ lọc")}</button><Link className="secondary-button" to="/nghien-cuu">{ui("Báo cáo/export A–J theo grant riêng")}</Link></div></section>;
}
function ClassCodes({ actor }: {
    actor: ManagedUser;
}) {useLocale(); const r = useRead('/class-codes/active'), w = useWrite(), [code, setCode] = useState(''); async function create() { try {
    const x = await w.run('/class-codes/create', 'POST', { ttlMinutes: 10, maxUses: 60, classId: actor.classId, expectedRevision: actor.revision });
    setCode(x.code);
    r.reload();
}
catch { } } async function revoke(id: string) { try {
    await w.run('/class-codes/revoke', 'POST', { codeId: id });
    r.reload();
    setCode('');
}
catch { } } return <section className="surface-card"><h2>{ui("Mã tham gia lớp được phân công")}</h2><Feedback busy={r.loading || w.busy} error={r.error || w.error}/><button className="primary-button" disabled={w.busy||w.uncertain} onClick={() => void create()}>{ui("Tạo mã 10 phút / tối đa 60 lượt")}</button>{code && <p role="status">{ui("Mã server cấp:")}{' '}<strong>{code}</strong></p>}{(r.data?.codes ?? r.data?.items ?? []).map((x: any) => <div className="management-record" key={x.id}><span>{x.className} {ui("· hết hạn")}{' '}{x.expiresAt}</span><button className="secondary-button" disabled={w.busy||w.uncertain} onClick={() => void revoke(x.id)}>{ui("Thu hồi mã")}</button></div>)}</section>; }
