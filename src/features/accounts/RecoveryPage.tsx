import {ui,useLocale} from '../preferences/ui';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Feedback, useWrite } from './client';
export default function RecoveryPage() {useLocale(); const w = useWrite(), [username, setUsername] = useState(''), [challenge, setChallenge] = useState<any>(null), [code, setCode] = useState(''), [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState(''), [notice, setNotice] = useState(''); async function submit(e: any) { e.preventDefault(); try {
    if (!challenge) {
        const r = await w.run('/auth/password/reset/request', 'POST', { username });
        setChallenge(r);
        setNotice('Yêu cầu được tiếp nhận. Nếu tài khoản đủ điều kiện, OTP sẽ được gửi tới email đã xác minh.');
    }
    else {
        if (password !== confirmation) {
            w.setError('Hai mật khẩu không khớp.');
            return;
        }
        await w.run('/auth/password/reset/confirm', 'POST', { challengeId: challenge.challengeId, otpCode: code, newPassword: password });
        setPassword('');
        setConfirmation('');
        setCode('');
        setChallenge(null);
        setNotice('Server đã xác nhận đổi mật khẩu/kích hoạt. Vui lòng đăng nhập lại.');
    }
}
catch { } } return <div className="page-wrap account-console"><section className="surface-card"><h1>{ui("Khôi phục hoặc kích hoạt tài khoản")}</h1><p>{ui("Quản trị không biết mật khẩu mới. Chỉ OTP đúng và còn hiệu lực mới đổi được mật khẩu.")}</p><Feedback busy={w.busy} error={w.error} notice={notice}/><form onSubmit={submit}><fieldset disabled={w.busy || w.uncertain}>{!challenge ? <label>{ui("Tên đăng nhập")}{' '}<input required autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}/></label> : <><label>{ui("Mã OTP email")}{' '}<input required inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)}/></label><label>{ui("Mật khẩu mới (15–128 ký tự)")}{' '}<input required type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}/></label><label>{ui("Nhập lại mật khẩu mới")}{' '}<input required type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)}/></label>{challenge.devOtpCode && <p className="unavailable-note">{ui("TEST · OTP kiểm thử:")}{' '}{challenge.devOtpCode}{ui(". Không có email thật.")}</p>}</>}</fieldset><div className="button-row"><button disabled={w.busy} className="primary-button">{w.uncertain ? ui("Retry cùng lần gửi") : challenge ? ui("Xác nhận mật khẩu mới") : ui("Tiếp nhận yêu cầu OTP")}</button>{challenge && <button type="button" className="secondary-button" onClick={() => { setChallenge(null); setPassword(''); setConfirmation(''); setCode(''); }}>{ui("Hủy")}</button>}</div></form><Link to="/dang-nhap">{ui("Về đăng nhập")}</Link></section></div>; }
