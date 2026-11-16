import {ui,useLocale} from '../preferences/ui';
import {PreferencesSettings} from '../preferences/Preferences';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AVATARS, type ManagedUser } from '../../../shared/accounts';
import { Feedback, useRead, useWrite, useReauth, accountApi } from './client';
export default function AccountPage({ onSessionChanged }: {
    onSessionChanged: () => Promise<void>;
}) {useLocale();
    const read = useRead('/auth/capabilities'), write = useWrite(), reauth = useReauth();
    const [form, setForm] = useState<any>(null), [notice, setNotice] = useState(''), [secret, setSecret] = useState({ currentPassword: '', newPassword: '', confirm: '' }), [email, setEmail] = useState({ currentPassword: '', newEmail: '', otpCode: '', newOtpCode: '' }), [challenge, setChallenge] = useState<any>(null);
    const u: ManagedUser | undefined = read.data?.user;
    useEffect(() => { if (u)
        setForm({ ...u.profile }); }, [read.data]);
    const change = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));
    async function save(e: any) { e.preventDefault(); if (!u)
        return; try {
        const p: any = { name: form.name, phone: form.phone, birthYear: form.birthYear, gender: form.gender, bio: form.bio, avatarKey: form.avatarKey, expectedRevision: u.revision, expectedUserId: u.id };
        if (u.role === 'teacher')
            p.subject = form.subject;
        await write.run('/auth/me/profile', 'PATCH', p);
        setNotice('Server đã xác nhận lưu hồ sơ.');
        read.reload();
        await onSessionChanged();
    }
    catch { } }
    async function password(e: any) { e.preventDefault(); if (secret.newPassword !== secret.confirm) {
        write.setError('Hai mật khẩu mới không khớp.');
        return;
    } try {
        await write.run('/auth/password/change', 'POST', { currentPassword: secret.currentPassword, newPassword: secret.newPassword, expectedRevision: u!.revision, expectedUserId: u!.id });
        setSecret({ currentPassword: '', newPassword: '', confirm: '' });
        setNotice('Server đã đổi mật khẩu và thu hồi phiên. Đăng nhập lại.');
        await onSessionChanged();
    }
    catch { } }
    async function emailAction(e: any) { e.preventDefault(); try {
        if (challenge) {
            await write.run('/auth/email/confirm', 'POST', { challengeId: challenge.challengeId, otpCode: email.otpCode, ...(challenge.devNewOtpCode || email.newEmail.trim().toLowerCase() !== u!.profile.email.trim().toLowerCase() ? { newOtpCode: email.newOtpCode } : {}) });
            setChallenge(null);
            await onSessionChanged();
        }
        else {
            const r = await write.run('/auth/email/request', 'POST', { currentPassword: email.currentPassword, newEmail: email.newEmail || u!.profile.email });
            setChallenge(r);
            setEmail(p => ({ ...p, currentPassword: '' }));
            setNotice('Server đã tiếp nhận yêu cầu xác minh; email hiện tại chưa thay đổi.');
        }
    }
    catch { } }
    async function deactivate() { if (!u)
        return; try {
        const key = await reauth.request('deactivate', u.id, 'Vô hiệu hóa tài khoản của tôi — giữ lịch sử');
        await write.run('/auth/me/deactivate', 'POST', { expectedRevision: u.revision, expectedUserId: u.id, reauthId: key });
        await onSessionChanged();
    }
    catch (e) {
        write.setError((e as Error).message);
    } }
    if (read.loading)
        return <div className="page-wrap"><p role="status">{ui("Đang đọc hồ sơ từ server…")}</p></div>;
    if (read.error || !u || !form)
        return <div className="page-wrap"><p role="alert" className="error-note">{read.error || 'Không có hồ sơ.'}</p><button onClick={read.reload}>{ui("Tải lại")}</button><Link to="/dang-nhap">{ui("Đăng nhập")}</Link></div>;
    return <div className="page-wrap account-console"><header><h1>{ui("Tài khoản của tôi")}</h1><p>@{u.username} · {u.profile.school}{u.classId ? ` · ${u.profile.className}` : ['student','teacher'].includes(u.role) ? ` · ${ui("Chưa phân lớp")}` : ''}</p></header>{['student','teacher'].includes(u.role) && !u.classId && <p role="status" className="unavailable-note">{ui("Niên khóa và phân lớp chưa được thiết lập. Bạn vẫn có thể dùng hồ sơ và bài tự đánh giá; quản trị xác nhận lớp/niên khóa sau.")}</p>}<Feedback busy={write.busy} error={write.error} notice={notice}/>{write.uncertain && <div><p>{ui("Giữ nguyên lần gửi đang chờ; không chuyển sang thao tác khác.")}</p><button className="primary-button" onClick={()=>void write.retry().then(async r=>{setNotice('Server đã xác nhận lần gửi đang chờ.');if(r.challengeId)setChallenge(r);if(r.loginRequired)await onSessionChanged();else read.reload();}).catch(()=>{})}>{ui("Retry cùng lần gửi đang chờ")}</button></div>}
 <section className="surface-card"><h2>{ui("Hồ sơ cá nhân")}</h2><form onSubmit={save}><fieldset disabled={write.busy || write.uncertain}><div className="profile-avatar-picker">{Object.entries(AVATARS).map(([key, src]) => <label key={key}><img src={src} alt={key}/><input type="radio" name="avatar" value={key} checked={form.avatarKey === key} onChange={() => change('avatarKey', key)}/>{key}</label>)}</div><div className="account-form-grid"><label>{ui("Họ và tên")}{' '}<input required maxLength={150} value={form.name} onChange={e => change('name', e.target.value)}/></label><label>{ui("Năm sinh")}{' '}<input inputMode="numeric" value={form.birthYear} onChange={e => change('birthYear', e.target.value)}/></label><label>{ui("Giới tính")}{' '}<select value={form.gender} onChange={e => change('gender', e.target.value)}><option value="">{ui("Chưa cung cấp")}</option>{['Nam', 'Nữ', 'Khác'].map(v => <option key={v}>{ui(v)}</option>)}</select></label><label>{ui("Điện thoại (tùy chọn, chưa xác minh)")}{' '}<input type="tel" value={form.phone} onChange={e => change('phone', e.target.value)}/></label>{u.role === 'teacher' && <label>{ui("Môn giảng dạy")}{' '}<input value={form.subject} onChange={e => change('subject', e.target.value)}/></label>}<label>{ui("Giới thiệu")}{' '}<textarea maxLength={500} value={form.bio} onChange={e => change('bio', e.target.value)}/></label></div><p className="muted">{ui("Tên đăng nhập, vai trò, trường/lớp và phân công do quản trị quản lý. Không thu ảnh cá nhân.")}</p></fieldset><button className="primary-button" disabled={write.busy||write.uncertain}>{write.uncertain ? ui("Thử lại lần gửi đang chờ") : ui("Lưu hồ sơ")}</button></form></section>
 <section className="surface-card"><h2>{ui("Đổi mật khẩu")}</h2><form onSubmit={password}><fieldset disabled={write.busy || write.uncertain}><label>{ui("Mật khẩu hiện tại")}{' '}<input required type="password" autoComplete="current-password" value={secret.currentPassword} onChange={e => setSecret(p => ({ ...p, currentPassword: e.target.value }))}/></label><label>{ui("Mật khẩu mới (15–128 ký tự)")}{' '}<input required type="password" autoComplete="new-password" value={secret.newPassword} onChange={e => setSecret(p => ({ ...p, newPassword: e.target.value }))}/></label><label>{ui("Nhập lại mật khẩu mới")}{' '}<input required type="password" autoComplete="new-password" value={secret.confirm} onChange={e => setSecret(p => ({ ...p, confirm: e.target.value }))}/></label></fieldset><button className="primary-button" disabled={write.busy||write.uncertain}>{ui("Đổi mật khẩu và đăng nhập lại")}</button></form><Link to="/khoi-phuc">{ui("Khôi phục mật khẩu qua OTP email")}</Link></section>
 <section className="surface-card"><h2>{ui("Email ·")}{' '}{u.emailVerified ? ui("Đã xác minh") : ui("Chưa xác minh")}</h2><p>{u.profile.email}</p>{read.data.emailDelivery === 'unavailable' ? <p className="unavailable-note">{ui("Dịch vụ email chưa được cấu hình; không thể xác minh/đổi email lúc này.")}</p> : <form onSubmit={emailAction}>{challenge ? <><p>{ui("Email cũ/mới phải được xác nhận trước khi thay đổi.")}</p><label>{ui("OTP email hiện tại")}{' '}<input required value={email.otpCode} autoComplete="one-time-code" onChange={e => setEmail(p => ({ ...p, otpCode: e.target.value }))}/></label>{email.newEmail && email.newEmail.trim().toLowerCase() !== u.profile.email.trim().toLowerCase() && <label>{ui("OTP email mới")}{' '}<input required value={email.newOtpCode} onChange={e => setEmail(p => ({ ...p, newOtpCode: e.target.value }))}/></label>}{challenge.devOtpCode && <p className="unavailable-note">{ui("TEST · OTP hiện tại:")}{' '}{challenge.devOtpCode}{ui("; OTP mới:")}{' '}{challenge.devNewOtpCode || 'không cần'}{ui(". Không gửi email thật.")}</p>}</> : <><label>{ui("Mật khẩu hiện tại")}{' '}<input required type="password" autoComplete="current-password" value={email.currentPassword} onChange={e => setEmail(p => ({ ...p, currentPassword: e.target.value }))}/></label><label>{ui("Email mới (để trống để xác minh email hiện tại)")}{' '}<input type="email" value={email.newEmail} onChange={e => setEmail(p => ({ ...p, newEmail: e.target.value }))}/></label></>}<div className="button-row"><button disabled={write.busy||write.uncertain} className="primary-button">{challenge ? ui("Xác nhận email và đăng nhập lại") : ui("Tiếp nhận yêu cầu xác minh")}</button>{challenge && <button type="button" className="secondary-button" onClick={() => setChallenge(null)}>{ui("Hủy")}</button>}</div></form>}</section>
 <PreferencesSettings/><section className="surface-card"><h2>{ui("Ngừng sử dụng tài khoản")}</h2><p>{ui("Vô hiệu hóa sẽ thu hồi phiên và quyền truy cập. Lịch sử không bị xóa; quản trị có thể khôi phục theo quyền. Superadmin cuối cùng không thể bị vô hiệu hóa.")}</p><button className="secondary-button" disabled={write.busy||write.uncertain} onClick={() => void deactivate()}>{ui("Vô hiệu hóa tài khoản của tôi")}</button><p className="muted">{ui("SMS, hộp thư và lịch không thuộc phiên bản này.")}</p></section>{reauth.dialog}</div>;
}
