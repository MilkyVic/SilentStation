import {qaAccessAllowed} from '../qa-policy.js';
import {seal,unseal} from './outbox.js';
import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
import { database } from '../database.js';
import { AuthHttpError, getCurrentUser } from '../auth-core.js';
import { requestToken, sameOrigin } from '../http-security.js';
import { validateSessionSecret } from '../runtime-config.js';
import { AVATARS, type ManagedUser } from '../../shared/accounts.js';
export function fail(status: number, code: string, message: string): never { throw new AuthHttpError(status, code, message); }
export function fields(b: any, keys: string[]) { if (!b || typeof b !== 'object' || Array.isArray(b) || Object.keys(b).some(k => !keys.includes(k)))
    fail(400, 'ACCOUNT_INVALID', 'Trường dữ liệu không hợp lệ.'); return b; }
export function text(v: unknown, name: string, max = 200, required = false) { if (typeof v !== 'string' || v.length > max || (required && !v.trim()))
    fail(400, 'ACCOUNT_INVALID', `${name} không hợp lệ.`); return v.trim(); }
export function password(v: unknown) { if (typeof v !== 'string' || Array.from(v).length < 15 || Array.from(v).length > 128 || Buffer.byteLength(v) > 1024)
    fail(400, 'ACCOUNT_PASSWORD_POLICY', 'Mật khẩu cần 15–128 ký tự, không bị cắt hoặc bỏ khoảng trắng.'); return v; }
export function hashPassword(v: string) { const salt = crypto.randomBytes(16).toString('hex'); return `scrypt$${salt}$${crypto.scryptSync(v, salt, 64).toString('hex')}`; }
export function verifyPassword(v: unknown, hash: string) { if (typeof v !== 'string' || Buffer.byteLength(v) > 1024)
    return false; const [algo, salt, digest] = hash.split('$'); if (algo !== 'scrypt' || !salt || !digest)
    return false; const a = crypto.scryptSync(v, salt, 64), b = Buffer.from(digest, 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); }
export function uuid(v: unknown) { if (typeof v !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))
    fail(400, 'ACCOUNT_INVALID', 'Request/challenge ID không hợp lệ.'); return v; }
export function revision(b: any, row: any) { if (!Number.isInteger(b.expectedRevision) || b.expectedRevision < 0)
    fail(400, 'ACCOUNT_REFRESH_REQUIRED', 'Tải lại để sử dụng revision hiện tại.'); if (b.expectedRevision !== row.revision)
    fail(409, 'ACCOUNT_CONFLICT', 'Dữ liệu đã đổi ở nơi khác; tải lại trước khi lưu.'); }
export function dto(r: any, actor?: any): ManagedUser { return { id: r.id, username: r.username, role: r.role, status: r.status,isQa:!!r.is_qa,qaAccessExpiresAt:r.qa_access_expires_at?new Date(r.qa_access_expires_at).toISOString():null, revision: r.revision, activationPending: r.activation_pending,canRestore:r.status==='suspended'&&r.disabled_from_status==='active'&&!r.activation_pending, emailVerified: !!r.email_verified_at, schoolId: r.school_id, classId: r.class_id, profile: { name: r.profile_name, email: r.profile_email, phone: r.profile_phone, birthYear: r.profile_birth_year, gender: r.profile_gender, bio: r.profile_bio, avatarKey: Object.hasOwn(AVATARS,r.avatar_key) ? r.avatar_key : 'mascot', school: r.school_name ?? r.profile_school, className: r.class_name ?? r.profile_class_name, teacherType: r.profile_teacher_type, subject: r.profile_subject }, allowedActions: !actor ? [] : actor.id === r.id ? ['profile', 'password', 'email', ...(r.role !== 'superadmin' ? ['deactivate'] : [])] : actor.role === 'superadmin' || actor.role === 'admin' && ['student', 'teacher'].includes(r.role) && actor.school_id && actor.school_id === r.school_id ? ['profile', 'status', 'assignment', 'password-reset', ...(r.role === 'teacher' && r.status === 'pending' ? ['approve', 'reject'] : [])] : [] }; }
export const userSql = 'SELECT u.*,s.name AS school_name,c.name AS class_name,c.academic_year FROM auth_users u LEFT JOIN org_schools s ON s.id=u.school_id LEFT JOIN org_classes c ON c.id=u.class_id';
export function manage(a: any, u: any) { if (a.role === 'superadmin')
    return; if (a.role !== 'admin' || !['student', 'teacher'].includes(u.role) || !a.school_id || a.school_id !== u.school_id)
    fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền quản lý tài khoản này.'); }
export function manageSchool(a: any, id: string, superOnly = false) { if (a.role === 'superadmin')
    return; if (superOnly || a.role !== 'admin' || !a.school_id || a.school_id !== id)
    fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền với trường/lớp này.'); }
export async function actor(req: any, c?: PoolClient) { const token = requestToken(req), u = await getCurrentUser(token); const runner = c ?? database(); const row = (await runner.query(`SELECT * FROM auth_users WHERE id=$1${c ? ' FOR SHARE' : ''}`, [u.id])).rows[0]; const jti = JSON.parse(Buffer.from(String(token).split('.')[1], 'base64url').toString()).jti; const s = (await runner.query(`SELECT jti FROM auth_sessions WHERE jti=$1 AND user_id=$2 AND revoked_at IS NULL AND exp_at>NOW()${c ? ' FOR SHARE' : ''}`, [jti, u.id])).rows[0]; if (!row || row.status !== 'active' || !s || !qaAccessAllowed(row))
    fail(401, 'ACCOUNT_SESSION_EXPIRED', 'Phiên không còn hiệu lực.'); return { ...row, jti }; }
export async function audit(c: PoolClient, a: string | null, target: string, action: string, request: string | null, changed: string[] = []) { await c.query('INSERT INTO account_audit(id,actor_id,target_id,action,request_id,fields) VALUES($1,$2,$3,$4,$5,$6)', [crypto.randomUUID(), a, target, action, request, changed]); }
export async function revoke(c: PoolClient, id: string, grants = false,actorId:string|null=id) { await c.query('UPDATE auth_sessions SET revoked_at=NOW() WHERE user_id=$1 AND revoked_at IS NULL', [id]); await c.query('UPDATE auth_admin_login_otps SET consumed_at=NOW() WHERE user_id=$1 AND consumed_at IS NULL', [id]); await c.query('UPDATE auth_register_otps SET consumed_at=NOW() WHERE username=(SELECT username FROM auth_users WHERE id=$1) AND consumed_at IS NULL', [id]); await c.query('UPDATE account_challenges SET consumed_at=NOW() WHERE user_id=$1 AND consumed_at IS NULL', [id]); await c.query('UPDATE account_reauth SET consumed_at=NOW() WHERE user_id=$1 AND consumed_at IS NULL', [id]); await c.query("UPDATE class_join_codes SET status='revoked',revoked_at=NOW() WHERE teacher_id=$1 AND status='active'", [id]); if(grants){const invitations=(await c.query('UPDATE survey_invitations SET revoked_at=NOW(),revision=revision+1 WHERE issued_by=$1 AND revoked_at IS NULL RETURNING id,campaign_id',[id])).rows;for(const i of invitations)await c.query('INSERT INTO survey_audit(id,campaign_id,actor_id,action,object_id) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),i.campaign_id,actorId??id,'invitation_revoke_account_change',i.id]);const removed=(await c.query('DELETE FROM survey_grants WHERE user_id=$1 RETURNING campaign_id',[id])).rows;for(const g of removed)await c.query('INSERT INTO survey_audit(id,campaign_id,actor_id,action,object_id) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),g.campaign_id,actorId??'system:organization-mapping','grant_revoke_account_change',id]);} }
export async function reauth(c: PoolClient, a: any, b: any, action: string, target: string) { const r = (await c.query('UPDATE account_reauth SET consumed_at=NOW() WHERE id=$1 AND user_id=$2 AND session_jti=$3 AND action=$4 AND target_id=$5 AND expires_at>clock_timestamp() AND consumed_at IS NULL RETURNING id', [uuid(b.reauthId), a.id, a.jti, action, target])).rows[0]; if (!r)
    fail(403, 'ACCOUNT_REAUTH_REQUIRED', 'Cần xác thực lại đúng thao tác.'); }
export async function mutation(req: any, action: string, target: string, b: any, fn: (c: PoolClient, a: any) => Promise<any>) { if(!String(req.headers?.authorization||'').startsWith('Bearer ')||req.headers?.cookie)sameOrigin(req); const id = uuid(b.requestId), digest = crypto.createHmac('sha256', validateSessionSecret()).update('account-receipt:' + JSON.stringify(b)).digest('hex'), c = await database().connect(); try {
    await c.query('BEGIN');
    await c.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:account-writes'))");
    // Restricted acknowledgement only: no profile, role, grant or replacement session.
    if(['password-change','account-status','assignment','managed-reset','invite-admin'].includes(action)){
        let owner:string|undefined;
        if(b.reauthId)owner=(await c.query('SELECT user_id FROM account_reauth WHERE id=$1',[uuid(b.reauthId)])).rows[0]?.user_id;
        else if(action==='password-change'&&b.currentPassword&&b.newPassword)owner=b.expectedUserId;
        if(owner){const ack=(await c.query('SELECT * FROM account_receipts WHERE actor_id=$1 AND request_id=$2 AND expires_at>NOW()',[owner,id])).rows[0];if(ack&&ack.action===action&&ack.digest===digest){await c.query('COMMIT');return {ok:true,replayed:true,loginRequired:action==='password-change'||['account-status','assignment'].includes(action)&&(target==='self'||target===owner),message:'Server đã xác nhận thao tác trước đó; không cấp phiên mới.'};}}
    }
    const a = await actor(req, c);
    if (b.expectedUserId && b.expectedUserId !== a.id)
        fail(409, 'ACCOUNT_OWNER_CHANGED', 'Tài khoản đã thay đổi; tải lại màn hình.');
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${a.id}:${id}`]);
    const prior = (await c.query('SELECT * FROM account_receipts WHERE actor_id=$1 AND request_id=$2 AND expires_at>NOW()', [a.id, id])).rows[0];
    if (prior) {
        if (prior.action !== action || prior.digest !== digest)
            fail(409, 'ACCOUNT_IDEMPOTENCY_CONFLICT', 'Request ID đã được dùng cho dữ liệu khác.');
        await c.query('COMMIT');
        return { ...unseal(prior.response,`receipt:${a.id}:${id}:${action}`), replayed: true };
    }
    const response = await fn(c, a);
    await c.query('INSERT INTO account_receipts(actor_id,request_id,action,digest,response) VALUES($1,$2,$3,$4,$5::jsonb)', [a.id, id, action, digest, JSON.stringify(seal(response,`receipt:${a.id}:${id}:${action}`))]);
    await audit(c, a.id, target, action, id, Object.keys(b).filter(k => !/password|otp|code|reauth|request|Revision/i.test(k)));
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
export const controlKeys = ['expectedRevision', 'requestId', 'reauthId', 'expectedUserId'];
export function profile(b: any) { const p: any = {}; for (const k of ['name', 'phone', 'birthYear', 'gender', 'bio', 'avatarKey', 'subject'])
    if (Object.hasOwn(b, k))
        p[k] = text(b[k], k, k === 'bio' ? 500 : k === 'name' ? 150 : k === 'phone' ? 30 : 100, k === 'name'); if (p.avatarKey && !Object.hasOwn(AVATARS, p.avatarKey))
    fail(400, 'ACCOUNT_INVALID', 'Avatar không thuộc danh mục.'); if (p.gender && !['Nam', 'Nữ', 'Khác', 'male', 'female', 'other'].includes(p.gender))
    fail(400, 'ACCOUNT_INVALID', 'Giới tính không hợp lệ.'); if (p.birthYear && (!/^\d{4}$/.test(p.birthYear) || +p.birthYear < 1900 || +p.birthYear > new Date().getFullYear()))
    fail(400, 'ACCOUNT_INVALID', 'Năm sinh không hợp lệ.'); if (p.phone && !/^\+?[0-9 ()-]{6,30}$/.test(p.phone))
    fail(400, 'ACCOUNT_INVALID', 'Số điện thoại không hợp lệ; chưa xác minh.'); return p; }
export async function updateProfile(c: PoolClient, id: string, p: any) { const map: any = { name: 'profile_name', phone: 'profile_phone', birthYear: 'profile_birth_year', gender: 'profile_gender', bio: 'profile_bio', avatarKey: 'avatar_key', subject: 'profile_subject' }; const entries = Object.entries(p); if (!entries.length)
    fail(400, 'ACCOUNT_INVALID', 'Không có thay đổi hồ sơ.'); return (await c.query(`UPDATE auth_users SET ${entries.map(([k], i) => `${map[k]}=$${i + 2}`).join(',')},revision=revision+1,updated_at=NOW() WHERE id=$1 RETURNING *`, [id, ...entries.map(([, v]) => v)])).rows[0]; }
