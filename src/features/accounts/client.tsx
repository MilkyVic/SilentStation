import {ui,useLocale,uiError} from '../preferences/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '../shell/Modal';
export class AccountError extends Error {
    constructor(public code: string, message: string) { super(uiError(code,message)); }
}
export async function accountApi(path: string, method = 'GET', body?: any, signal?: AbortSignal) { let r: Response; try {
    r = await fetch('/api' + path, { method, credentials: 'include', cache: 'no-store', signal: signal ?? AbortSignal.timeout(20000), headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
catch {
    throw new AccountError('NETWORK_UNCERTAIN', 'Chưa nhận được xác nhận từ server. Không coi thao tác là đã lưu.');
} const d = await r.json().catch(() => null); if (!r.ok || !d?.ok)
    throw new AccountError(d?.error?.code ?? 'ACCOUNT_ERROR', d?.error?.message ?? 'Không xác nhận được thao tác.'); return d; }
export function useRead(path: string | null) { const [state, set] = useState<any>({ loading: true, data: null, error: '' }), [generation, reload] = useState(0); useEffect(() => { if (!path)
    return; let active = true; const abort = new AbortController(); set({ loading: true, data: null, error: '' }); accountApi(path, 'GET', undefined, abort.signal).then(data => active && set({ loading: false, data, error: '' })).catch(e => active && set({ loading: false, data: null, error: e.message })); return () => { active = false; abort.abort(); }; }, [path, generation]); return { ...state, reload: () => reload(v => v + 1) }; }
export function useWrite(owner?:string|null) { const [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [error, setError] = useState(''); const generation=useRef(0);const lock = useRef(false), pending = useRef<any>(null), active = useRef(true);useEffect(()=>{generation.current++;lock.current=false;pending.current=null;setBusy(false);setUncertain(false);setError('');},[owner]); useEffect(() => { active.current = true; return () => { active.current = false; pending.current = null; }; }, []); async function run(path: string, method: string, body: any) { const epoch=generation.current;if (lock.current)
    throw new AccountError('BUSY', 'Một thao tác đang xử lý.'); lock.current = true; setBusy(true); setError(''); if(pending.current&&pending.current.path!==path){lock.current=false;setBusy(false);throw new AccountError('PENDING_OPERATION','Hãy retry hoặc đối chiếu thao tác đang chờ trước khi thực hiện mục khác.');}
        const job = pending.current ?? { path, method, body: { ...body, requestId: body.requestId ?? crypto.randomUUID() } }; pending.current = job; try {
    const result = await accountApi(job.path, job.method, job.body);
    if(epoch!==generation.current)throw new AccountError('ACCOUNT_OWNER_CHANGED','Tài khoản đã đổi.');
    pending.current = null;
    if (active.current)
        setUncertain(false);
    return result;
}
catch (e) {
    if(epoch!==generation.current)throw e;
    if ((e as AccountError).code === 'NETWORK_UNCERTAIN') {
        if (active.current)
            setUncertain(true);
    }
    else {
        pending.current = null;
        if (active.current)
            setUncertain(false);
    }
    if (active.current)
        setError((e as Error).message);
    throw e;
}
finally {
    if(epoch===generation.current)lock.current = false;
    if (active.current&&epoch===generation.current)
        setBusy(false);
} } return { run,retry:()=>{if(!pending.current)return Promise.reject(new AccountError('NO_PENDING','Không có lần gửi đang chờ.'));return run(pending.current.path,pending.current.method,pending.current.body);}, busy, uncertain, error, setError }; }
export function useReauth() {
    const [pending, set] = useState<any>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), lock = useRef(false);
    const p = useRef<any>(null);
    useEffect(() => () => { p.current?.reject(new AccountError('CANCELLED', 'Trang đã đóng.')); p.current = null; }, []);
    const close = useCallback(() => { p.current?.reject(new AccountError('CANCELLED', 'Đã hủy thao tác.')); p.current = null; set(null); setError(''); }, []);
    const request = (action: string, targetId: string, label: string) => { if (p.current)
        return Promise.reject(new AccountError('BUSY', 'Hãy hoàn tất hoặc hủy xác thực hiện tại.')); return new Promise<string>((resolve, reject) => { const value = { action, targetId, label, currentPassword: '', otpCode: '', requestId: crypto.randomUUID(), resolve, reject }; p.current = value; set(value); }); };
    async function submit(e: any) { e.preventDefault(); if (lock.current || !p.current)
        return; lock.current = true; setBusy(true); setError(''); const current = p.current; try {
        const r = current.challengeId ? await accountApi('/auth/reauth/confirm', 'POST', { challengeId: current.challengeId, otpCode: current.otpCode }) : await accountApi('/auth/reauth/request', 'POST', { currentPassword: current.currentPassword, action: current.action, targetId: current.targetId, requestId: current.requestId });
        if (p.current !== current)
            return;
        if (r.reauthId) {
            current.resolve(r.reauthId);
            p.current = null;
            set(null);
        }
        else {
            const next = { ...current, ...r, currentPassword: '' };
            p.current = next;
            set(next);
        }
    }
    catch (e) {
        setError((e as Error).message);
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    const dialog = pending ? <Modal title={'Xác thực lại · ' + pending.label} onClose={close}><form onSubmit={submit}><p>{ui("Chỉ thực hiện sau khi server xác nhận. Thao tác:")}{' '}{pending.label}.</p>{pending.challengeId ? <><label>{ui("Mã OTP email")}{' '}<input autoComplete="one-time-code" inputMode="numeric" required value={pending.otpCode} onChange={e => { const v = { ...p.current, otpCode: e.target.value }; p.current = v; set(v); }}/></label>{pending.devOtpCode && <p className="unavailable-note">{ui("TEST · OTP kiểm thử:")}{' '}{pending.devOtpCode}{ui(". Không có email thật.")}</p>}</> : <label>{ui("Mật khẩu hiện tại")}{' '}<input type="password" autoComplete="current-password" required value={pending.currentPassword} onChange={e => { const v = { ...p.current, currentPassword: e.target.value }; p.current = v; set(v); }}/></label>}{error && <p role="alert" className="error-note">{ui(error)}</p>}<div className="button-row"><button type="button" className="secondary-button" onClick={close}>{ui("Hủy")}</button><button disabled={busy} className="primary-button">{busy ? ui("Đang xác thực…") : pending.challengeId ? ui("Xác thực OTP") : ui("Xác thực mật khẩu")}</button></div></form></Modal> : null;
    return { request, dialog };
}
export function Feedback({ busy, error, notice }: {
    busy?: boolean;
    error?: string;
    notice?: string;
}) {useLocale(); return <>{busy && <p role="status">{ui("Đang chờ server…")}</p>}{error && <p className="error-note" role="alert">{ui(error)}</p>}{notice && <p className="save-note" role="status">{ui(notice)}</p>}</>; }
