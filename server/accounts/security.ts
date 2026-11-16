import crypto from 'node:crypto';
import { database } from '../database.js';
import { consumeRate, passwordAttempt } from '../rate-limits.js';
import { validateSessionSecret } from '../runtime-config.js';
import { sameOrigin, requestToken, setCookie, AUTH_COOKIE } from '../http-security.js';
import { actor, audit, controlKeys, dto, fail, fields, hashPassword, manage, mutation, password, reauth, revision, revoke, uuid, verifyPassword } from './common.js';
import { emailAvailable, enqueue,seal,unseal } from './outbox.js';
import type { PoolClient } from 'pg';
const code = () => String(crypto.randomInt(100000, 1000000));
const digest = (id: string, value: string) => crypto.createHmac('sha256', validateSessionSecret()).update(`${id}:${value}`).digest('hex');
const dev = () => process.env.NODE_ENV === 'test' && process.env.AUTH_ACCOUNT_OTP_EXPOSE_DEV_CODE === 'true';
export const normalizeEmail = (s: unknown) => { if (typeof s !== 'string' || s.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()))
    fail(400, 'ACCOUNT_EMAIL_INVALID', 'Email không hợp lệ.'); return s.trim().toLowerCase(); };
function correct(hash: string | null, id: string, v: any) { const a = Buffer.from(hash ?? '', 'hex'), b = Buffer.from(digest(id, String(v ?? '')), 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); }
async function challenge(c: PoolClient, user: any, purpose: string, state: any, jti: string | null = null, secondEmail?: string) { const id = crypto.randomUUID(), otp = code(), second = secondEmail ? code() : null; await c.query("INSERT INTO account_challenges(id,user_id,purpose,session_jti,otp_hash,second_hash,state,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,NOW()+INTERVAL '10 minutes')", [id, user?.id ?? null, purpose, jti, digest(id, otp), second ? digest(id, second) : null, JSON.stringify(state)]); if (user) {
    await enqueue(c, user.profile_email, 'Trạm An · Xác nhận tài khoản', `Mã xác nhận: ${otp}\nCó hiệu lực 10 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua. Không gửi mật khẩu cho người khác.`, id);
    if (secondEmail)
        await enqueue(c, secondEmail, 'Trạm An · Xác nhận email mới', `Mã xác nhận email mới: ${second}\nCó hiệu lực 10 phút.`, id);
} return { challengeId: id, message: 'Đã tiếp nhận yêu cầu. Chưa xác nhận email đã được gửi.', ...(dev() ? { devOtpCode: otp, ...(second ? { devNewOtpCode: second } : {}) } : {}) }; }
async function consume(c: PoolClient, id: string, b: any, purposes: string[], a?: any) { const r = (await c.query('SELECT * FROM account_challenges WHERE id=$1 FOR UPDATE', [id])).rows[0]; if (!r || !purposes.includes(r.purpose) || a && (r.user_id !== a.id || r.session_jti !== a.jti) || r.consumed_at || new Date(r.expires_at).getTime() <= Date.now() || r.attempts_left <= 0)
    fail(400, 'ACCOUNT_OTP_INVALID', 'Mã không hợp lệ, đã sử dụng hoặc hết hạn.'); if (!correct(r.otp_hash, id, b.otpCode) || r.second_hash && !correct(r.second_hash, id, b.newOtpCode)) {
    await c.query('UPDATE account_challenges SET attempts_left=attempts_left-1 WHERE id=$1', [id]);
    return null;
} await c.query('UPDATE account_challenges SET consumed_at=NOW() WHERE id=$1', [id]); return r; }
// Public request always persists a decoy challenge for unknown/ineligible accounts. Minimum
// duration and identical response shape avoid an identity oracle, including after SMTP failure.
export async function requestReset(req: any, b: any) {
    sameOrigin(req);
    fields(b, ['username', 'requestId']);
    uuid(b.requestId);
    if (!emailAvailable())
        fail(503, 'ACCOUNT_EMAIL_UNAVAILABLE', 'Chưa có dịch vụ email để tiếp nhận khôi phục.');
    const started = Date.now(), name = typeof b.username === 'string' ? b.username.trim().toLowerCase() : '';
    if (!name || name.length > 150)
        fail(400, 'ACCOUNT_INVALID', 'Tên tài khoản không hợp lệ.');
    const owner = crypto.createHmac('sha256', validateSessionSecret()).update(name).digest('hex');
    const c = await database().connect();
    try {
        await c.query('BEGIN');
        await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`reset:${owner}`]);
        const hash = crypto.createHash('sha256').update(name).digest('hex'), prior = (await c.query('SELECT * FROM account_receipts WHERE actor_id=$1 AND request_id=$2 AND expires_at>NOW()', [`public:${owner}`, b.requestId])).rows[0];
        if (prior) {
            if (prior.digest !== hash)
                fail(409, 'ACCOUNT_IDEMPOTENCY_CONFLICT', 'Request ID không khớp.');
            await c.query('COMMIT');
            return unseal(prior.response,`public-reset:${owner}:${b.requestId}`);
        }
        const row = (await c.query('SELECT * FROM auth_users WHERE username=$1 FOR SHARE', [name])).rows[0];
        await consumeRate('otp', `account-reset:${owner}`, c);
        let eligible = row && (row.status === 'active' && row.email_verified_at || row.activation_pending);
        if (eligible) {
            try {
                await consumeRate('otp', row.profile_email, c);
            }
            catch (e) {
                if ((e as any).code === 'RATE_LIMITED')
                    eligible = false;
                else
                    throw e;
            }
        }
        const result = await challenge(c, eligible ? row : null, eligible && row.activation_pending ? 'invite' : 'reset', { credentialVersion: row?.credential_version ?? 0 });
        await c.query('INSERT INTO account_receipts(actor_id,request_id,action,digest,response) VALUES($1,$2,\'reset-request\',$3,$4::jsonb)', [`public:${owner}`, b.requestId, hash, JSON.stringify(seal(result,`public-reset:${owner}:${b.requestId}`))]);
        await audit(c, null, result.challengeId, 'reset_request', b.requestId);
        await c.query('COMMIT');
        return result;
    }
    catch (e) {
        await c.query('ROLLBACK');
        throw e;
    }
    finally {
        c.release();
        await new Promise(r => setTimeout(r, Math.max(0, 400 - (Date.now() - started))));
    }
}
export async function confirmReset(req: any, b: any) { sameOrigin(req); fields(b, ['challengeId', 'otpCode', 'newPassword', 'requestId']); const id = uuid(b.challengeId), p = password(b.newPassword), request = uuid(b.requestId), c = await database().connect(); try {
    await c.query('BEGIN');
    await c.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:account-writes'))");
    const payloadDigest = digest(id, JSON.stringify(b)), prior = (await c.query('SELECT * FROM account_receipts WHERE actor_id=$1 AND request_id=$2 AND expires_at>NOW()', [`reset-confirm:${id}`, request])).rows[0];
    if (prior) {
        if (prior.digest !== payloadDigest)
            fail(409, 'ACCOUNT_IDEMPOTENCY_CONFLICT', 'Request ID không khớp.');
        await c.query('COMMIT');
        return { ...unseal(prior.response,`reset-confirm:${id}:${request}`), replayed: true };
    }
    const ch = await consume(c, id, b, ['reset', 'invite']);
    if (!ch) {
        await c.query('COMMIT');
        fail(400, 'ACCOUNT_OTP_INVALID', 'Mã không hợp lệ.');
    }
    if (!ch.user_id)
        fail(400, 'ACCOUNT_OTP_INVALID', 'Mã không hợp lệ.');
    const user = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [ch.user_id])).rows[0];
    if (!user || user.credential_version !== ch.state.credentialVersion || user.status !== 'active' && !user.activation_pending)
        fail(400, 'ACCOUNT_OTP_INVALID', 'Yêu cầu không còn hợp lệ.');
    await c.query("UPDATE auth_users SET password_hash=$2,credential_version=credential_version+1,revision=revision+1,status=CASE WHEN activation_pending THEN 'active' ELSE status END,activation_pending=FALSE,email_verified_at=COALESCE(email_verified_at,NOW()),updated_at=NOW() WHERE id=$1", [user.id, hashPassword(p)]);
    await revoke(c, user.id);
    await enqueue(c, user.profile_email, 'Trạm An · Mật khẩu đã thay đổi', 'Mật khẩu tài khoản của bạn đã được thay đổi. Tất cả phiên cũ đã được thu hồi. Nếu không phải bạn, liên hệ quản trị trường.');
    await audit(c, user.id, user.id, ch.purpose === 'invite' ? 'admin_activate' : 'password_reset', request);
    const response = { ok: true, message: 'Server đã xác nhận đổi mật khẩu. Vui lòng đăng nhập lại.' };
    await c.query("INSERT INTO account_receipts(actor_id,request_id,action,digest,response) VALUES($1,$2,'reset-confirm',$3,$4::jsonb)", [`reset-confirm:${id}`, request, payloadDigest, JSON.stringify(seal(response,`reset-confirm:${id}:${request}`))]);
    await c.query('COMMIT');
    return response;
}
catch (e) {
    await c.query('ROLLBACK');
    throw e;
}
finally {
    c.release();
} }
export async function changePassword(req: any, b: any) { fields(b, [...controlKeys, 'currentPassword', 'newPassword']); password(b.newPassword); const before = await actor(req); if (!await passwordAttempt(`reauth:${before.id}`, async () => verifyPassword(b.currentPassword, before.password_hash)))
    fail(400, 'ACCOUNT_PASSWORD_INVALID', 'Mật khẩu hiện tại không đúng.'); return mutation(req, 'password-change', 'self', b, async (c, a) => { revision(b, a); const valid = verifyPassword(b.currentPassword, a.password_hash); if (!valid)
    fail(400, 'ACCOUNT_PASSWORD_INVALID', 'Mật khẩu hiện tại không đúng.'); await c.query('UPDATE auth_users SET password_hash=$2,credential_version=credential_version+1,revision=revision+1,updated_at=NOW() WHERE id=$1', [a.id, hashPassword(b.newPassword)]); await revoke(c, a.id); await enqueue(c, a.profile_email, 'Trạm An · Mật khẩu đã thay đổi', 'Mật khẩu đã đổi. Tất cả phiên cũ đã thu hồi.'); return { ok: true, loginRequired: true }; }); }
export async function requestReauth(req: any, b: any) { fields(b, ['currentPassword', 'action', 'targetId', 'requestId']); if (!['status', 'assignment', 'password-reset', 'deactivate', 'invite-admin'].includes(b.action) || typeof b.targetId !== 'string')
    fail(400, 'ACCOUNT_INVALID', 'Thao tác xác thực không hợp lệ.'); const a = await actor(req); if (!await passwordAttempt(`reauth:${a.id}`, async () => verifyPassword(b.currentPassword, a.password_hash)))
    fail(400, 'ACCOUNT_PASSWORD_INVALID', 'Mật khẩu hiện tại không đúng.'); if (['admin', 'superadmin'].includes(a.role) && !emailAvailable())
    fail(503, 'ACCOUNT_EMAIL_UNAVAILABLE', 'Cần dịch vụ email xác thực lại.'); return mutation(req, 'reauth-request', a.id, b, async (c, current) => { if (['admin', 'superadmin'].includes(current.role)) {
    await consumeRate('otp', current.profile_email, c);
    return { ok: true, ...await challenge(c, current, 'reauth', { action: b.action, targetId: b.targetId }, current.jti) };
} const id = crypto.randomUUID(); await c.query("INSERT INTO account_reauth VALUES($1,$2,$3,$4,$5,NOW()+INTERVAL '5 minutes',NULL)", [id, current.id, current.jti, b.action, b.targetId]); return { ok: true, reauthId: id }; }); }
export async function confirmReauth(req: any, b: any) { fields(b, ['challengeId', 'otpCode']); sameOrigin(req); const c = await database().connect(); try {
    await c.query('BEGIN');
    const a = await actor(req, c), ch = await consume(c, uuid(b.challengeId), b, ['reauth'], a);
    if (!ch) {
        await c.query('COMMIT');
        fail(400, 'ACCOUNT_OTP_INVALID', 'Mã không hợp lệ.');
    }
    const id = crypto.randomUUID();
    await c.query("INSERT INTO account_reauth VALUES($1,$2,$3,$4,$5,NOW()+INTERVAL '5 minutes',NULL)", [id, a.id, a.jti, ch.state.action, ch.state.targetId]);
    await c.query('COMMIT');
    return { ok: true, reauthId: id };
}
catch (e) {
    await c.query('ROLLBACK');
    throw e;
}
finally {
    c.release();
} }
export async function requestEmail(req: any, b: any) { fields(b, ['currentPassword', 'newEmail', 'requestId']); if (!emailAvailable())
    fail(503, 'ACCOUNT_EMAIL_UNAVAILABLE', 'Chưa có dịch vụ xác minh email.'); const a = await actor(req); if (!await passwordAttempt(`reauth:${a.id}`, async () => verifyPassword(b.currentPassword, a.password_hash)))
    fail(400, 'ACCOUNT_PASSWORD_INVALID', 'Mật khẩu hiện tại không đúng.'); const email = normalizeEmail(b.newEmail ?? a.profile_email), change = email !== a.profile_email.toLowerCase(); return mutation(req, 'email-request', a.id, b, async (c, current) => { await consumeRate('otp', current.profile_email, c); if (change)
    await consumeRate('otp', email, c); if (!verifyPassword(b.currentPassword, current.password_hash))
    fail(409, 'ACCOUNT_CONFLICT', 'Thông tin bảo mật đã thay đổi.'); return { ok: true, ...await challenge(c, current, change ? 'email' : 'verify-email', { oldEmail: current.profile_email, newEmail: email, credentialVersion: current.credential_version }, current.jti, change ? email : undefined) }; }); }
export async function confirmEmail(req: any, b: any) { fields(b, ['challengeId', 'otpCode', 'newOtpCode', 'requestId']); sameOrigin(req); const c = await database().connect(); try {
    await c.query('BEGIN');
    await c.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:account-writes'))");
    const challengeId=uuid(b.challengeId),requestId=uuid(b.requestId),payloadDigest=digest(challengeId,JSON.stringify(b));
    const prior=(await c.query('SELECT * FROM account_receipts WHERE actor_id=$1 AND request_id=$2 AND expires_at>NOW()',[`email-confirm:${challengeId}`,requestId])).rows[0];if(prior){if(prior.digest!==payloadDigest)fail(409,'ACCOUNT_IDEMPOTENCY_CONFLICT','Request ID không khớp.');await c.query('COMMIT');return {...unseal(prior.response,`email-confirm:${challengeId}:${requestId}`),replayed:true};}
    const a = await actor(req, c), ch = await consume(c, uuid(b.challengeId), b, ['email', 'verify-email'], a);
    if (!ch) {
        await c.query('COMMIT');
        fail(400, 'ACCOUNT_OTP_INVALID', 'Mã không hợp lệ.');
    }
    if (a.credential_version !== ch.state.credentialVersion || a.profile_email !== ch.state.oldEmail)
        fail(409, 'ACCOUNT_CONFLICT', 'Thông tin bảo mật đã thay đổi.');
    await c.query('UPDATE auth_users SET profile_email=$2,email_verified_at=NOW(),revision=revision+1,credential_version=credential_version+1,updated_at=NOW() WHERE id=$1', [a.id, ch.state.newEmail]);
    await revoke(c, a.id);
    await enqueue(c, ch.state.oldEmail, 'Trạm An · Email tài khoản đã xác nhận', 'Email tài khoản đã được xác nhận/cập nhật. Các phiên cũ đã thu hồi.');
    await audit(c, a.id, a.id, 'email_confirm', uuid(b.requestId), ['email']);
    const response={ok:true,loginRequired:true};await c.query("INSERT INTO account_receipts(actor_id,request_id,action,digest,response) VALUES($1,$2,'email-confirm',$3,$4::jsonb)",[`email-confirm:${challengeId}`,requestId,payloadDigest,JSON.stringify(seal(response,`email-confirm:${challengeId}:${requestId}`))]);await c.query('COMMIT');
    return response;
}
catch (e) {
    await c.query('ROLLBACK');
    throw e;
}
finally {
    c.release();
} }
export async function managedReset(req: any, id: string, b: any) { fields(b, controlKeys); if (!emailAvailable())
    fail(503, 'ACCOUNT_EMAIL_UNAVAILABLE', 'Dịch vụ email chưa khả dụng.'); return mutation(req, 'managed-reset', id, b, async (c, a) => { const u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [id])).rows[0]; if (!u)
    fail(404, 'ACCOUNT_NOT_FOUND', 'Không có tài khoản.'); manage(a, u); revision(b, u); if (u.status !== 'active' || !u.email_verified_at)
    fail(409, 'ACCOUNT_EMAIL_UNVERIFIED', 'Tài khoản chưa có email đã xác minh hoặc không hoạt động.'); await reauth(c, a, b, 'password-reset', id); await consumeRate('otp', u.profile_email, c); return { ok: true, ...await challenge(c, u, 'reset', { credentialVersion: u.credential_version }) }; }); }
export async function inviteAdmin(req: any, b: any) { fields(b, ['username', 'name', 'email', 'schoolId', 'requestId', 'reauthId']); if (!emailAvailable())
    fail(503, 'ACCOUNT_EMAIL_UNAVAILABLE', 'Chưa có dịch vụ gửi lời mời.'); return mutation(req, 'invite-admin', 'new-admin', b, async (c, a) => { if (a.role !== 'superadmin')
    fail(403, 'ACCOUNT_FORBIDDEN', 'Chỉ Superadmin tạo Admin.'); await reauth(c, a, b, 'invite-admin', 'new-admin'); const username = typeof b.username === 'string' ? b.username.trim().toLowerCase() : ''; if (!/^[a-z0-9_.-]{3,100}$/.test(username) || typeof b.name !== 'string' || !b.name.trim())
    fail(400, 'ACCOUNT_INVALID', 'Tên/username không hợp lệ.'); const email = normalizeEmail(b.email), s = (await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active'", [b.schoolId])).rows[0]; if (!s)
    fail(400, 'ACCOUNT_INVALID', 'Cần trường đang hoạt động.'); const id = crypto.randomUUID(); await c.query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_name,profile_email,profile_school,school_id,activation_pending) VALUES($1,$2,$3,'admin','pending',$4,$5,$6,$7,TRUE)", [id, username, hashPassword(crypto.randomBytes(48).toString('base64url')), b.name.trim(), email, s.name, s.id]); const u = (await c.query('SELECT * FROM auth_users WHERE id=$1', [id])).rows[0]; const ch = await challenge(c, u, 'invite', { credentialVersion: 0 }); await c.query('INSERT INTO org_assignments(id,user_id,school_id) VALUES($1,$2,$3)', [crypto.randomUUID(), id, s.id]); return { ok: true, user: dto(u, a), ...ch }; }); }
