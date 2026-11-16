import { AuthHttpError } from '../auth-core.js';
import { RateLimitError } from '../rate-limits.js';
import { sameOrigin, setCookie, AUTH_COOKIE } from '../http-security.js';
import { secretValue } from '../runtime-config.js';
import crypto from 'node:crypto';
import { createCode, revokeCode } from './class-codes.js';
import * as org from './organizations.js';
import * as security from './security.js';
import {preferences} from './preferences.js';
import { actor, dto, fail, fields } from './common.js';
import { drainEmailOutbox, emailAvailable } from './outbox.js';
export const accountsEnabled = () => process.env.ACCOUNT_MANAGEMENT_ENABLED === 'true';
export async function accountHandler(req: any, res: any, action: string) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Access-Control-Allow-Origin', process.env.AUTH_API_CORS_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        if(req.method==='OPTIONS')return res.status(204).end();
        if (!accountsEnabled())
            fail(503, 'ACCOUNT_FEATURE_DISABLED', 'Tính năng tài khoản 1.1.0 chưa được bật cho môi trường này.');
        if (req.method === 'OPTIONS')
            return res.status(204).end();
        const method = req.method, id = String(req.params?.id ?? req.query?.id ?? ''), query = req.query ?? {};
        let b = req.body ?? {};
        if (typeof b === 'string') {
            try {
                b = JSON.parse(b);
            }
            catch {
                fail(400, 'INVALID_JSON', 'JSON không hợp lệ.');
            }
        }
        if (Buffer.byteLength(JSON.stringify(b)) > 256 * 1024)
            fail(413, 'BODY_TOO_LARGE', 'Yêu cầu quá lớn.');
        if(method!=='GET'&&(!String(req.headers?.authorization||'').startsWith('Bearer ')||req.headers?.cookie||['resetRequest','resetConfirm'].includes(action)))sameOrigin(req);
        const methods: any = { preferences: ['GET','PATCH'], profile: ['PATCH'], password: ['POST'], resetRequest: ['POST'], resetConfirm: ['POST'], emailRequest: ['POST'], emailConfirm: ['POST'], reauthRequest: ['POST'], reauthConfirm: ['POST'], deactivate: ['POST'], users: ['GET'], user: ['GET', 'PATCH'], status: ['POST'], assignment: ['POST'], managedReset: ['POST'], approve: ['POST'], reject: ['POST'], admins: ['POST'], schools: ['GET', 'POST'], school: ['PATCH'], classes: ['GET', 'POST'], class: ['PATCH'], members: ['GET'], capabilities: ['GET'], maintenance: ['GET'], codeCreate: ['POST'], codeRevoke: ['POST'] };
        if (!methods[action]?.includes(method))
            fail(405, 'ACCOUNT_METHOD', 'Phương thức không hợp lệ.');
        let result: any;
        switch (action) {
            case 'preferences': result=await preferences(req,b); break;
            case 'codeCreate':
                result = await createCode(req, b);
                break;
            case 'codeRevoke':
                result = await revokeCode(req, b);
                break;
            case 'profile':
                result = await org.userProfile(req, 'self', b, true);
                break;
            case 'password':
                result = await security.changePassword(req, b);
                break;
            case 'resetRequest':
                result = { ok: true, ...await security.requestReset(req, b) };
                break;
            case 'resetConfirm':
                result = await security.confirmReset(req, b);
                break;
            case 'emailRequest':
                result = await security.requestEmail(req, b);
                break;
            case 'emailConfirm':
                result = await security.confirmEmail(req, b);
                break;
            case 'reauthRequest':
                result = await security.requestReauth(req, b);
                break;
            case 'reauthConfirm':
                result = await security.confirmReauth(req, b);
                break;
            case 'deactivate':
                result = await org.userStatus(req, 'self', b, true);
                break;
            case 'user':
                result = method === 'GET' ? await org.userDetail(req, id) : await org.userProfile(req, id, b);
                break;
            case 'users':
                result = await org.usersList(req, query);
                break;
            case 'status':
                result = await org.userStatus(req, id, b);
                break;
            case 'assignment':
                result = await org.assignment(req, id, b);
                break;
            case 'managedReset':
                result = await security.managedReset(req, id, b);
                break;
            case 'approve':
            case 'reject':
                result = await org.reviewTeacher(req, id, b, action === 'approve');
                break;
            case 'admins':
                result = await security.inviteAdmin(req, b);
                break;
            case 'schools':
                result = method === 'GET' ? await org.schoolList(req) : await org.schoolWrite(req, undefined, b);
                break;
            case 'school':
                result = await org.schoolWrite(req, id, b);
                break;
            case 'classes':
                result = method === 'GET' ? await org.classList(req, query) : await org.classWrite(req, undefined, b);
                break;
            case 'class':
                result = await org.classWrite(req, id, b);
                break;
            case 'members':
                result = await org.usersList(req, { ...query, classId: id });
                break;
            case 'capabilities': {
                const a = await actor(req);
                result = { ok: true, user: (await org.userDetail(req, a.id)).user, emailDelivery: emailAvailable() ? 'configured' : 'unavailable', phoneVerification: 'not_supported', accountManagement: true };
                break;
            }
            case 'maintenance': {
                const secret = secretValue('CRON_SECRET') ?? '', supplied = String(req.headers?.authorization ?? '').replace(/^Bearer /, '');
                if (secret.length < 32)
                    fail(503, 'ACCOUNT_MAINTENANCE_DISABLED', 'Bảo trì chưa được cấu hình.');
                const x = Buffer.from(secret), y = Buffer.from(supplied);
                if (x.length !== y.length || !crypto.timingSafeEqual(x, y))
                    fail(401, 'ACCOUNT_FORBIDDEN', 'Không có quyền.');
                result = { ok: true, ...await drainEmailOutbox() };
                break;
            }
        }
        if (result?.loginRequired)
            setCookie(res, AUTH_COOKIE, '', 0);
        return res.status(method === 'POST' && ['admins', 'schools', 'classes'].includes(action) ? 201 : 200).json(result);
    }
    catch (e) {
        if (e instanceof AuthHttpError || e instanceof RateLimitError)
            return res.status(e.statusCode).json({ ok: false, error: { code: e.code, message: e.message } });
        if ((e as any)?.code === '23505')
            return res.status(409).json({ ok: false, error: { code: 'ACCOUNT_CONFLICT', message: 'Bản ghi hoặc phân công đã tồn tại.' } });
        return res.status(500).json({ ok: false, error: { code: 'ACCOUNT_ERROR', message: 'Server chưa xác nhận thao tác. Giữ bản sửa và thử lại.' } });
    }
}
export const ACCOUNT_ROUTES: [
    string,
    string,
    string
][] = [['GET','/api/auth/me/preferences','preferences'],['PATCH','/api/auth/me/preferences','preferences'],['PATCH', '/api/auth/me/profile', 'profile'], ['POST', '/api/auth/password/change', 'password'], ['POST', '/api/auth/password/reset/request', 'resetRequest'], ['POST', '/api/auth/password/reset/confirm', 'resetConfirm'], ['POST', '/api/auth/email/request', 'emailRequest'], ['POST', '/api/auth/email/confirm', 'emailConfirm'], ['POST', '/api/auth/reauth/request', 'reauthRequest'], ['POST', '/api/auth/reauth/confirm', 'reauthConfirm'], ['POST', '/api/auth/me/deactivate', 'deactivate'], ['GET', '/api/auth/capabilities', 'capabilities'], ['GET', '/api/users/:id', 'user'], ['PATCH', '/api/users/:id', 'user'], ['POST', '/api/users/:id/status', 'status'], ['POST', '/api/users/:id/assignment', 'assignment'], ['POST', '/api/users/:id/password-reset', 'managedReset'], ['POST', '/api/users/:id/approve', 'approve'], ['POST', '/api/users/:id/reject', 'reject'], ['GET', '/api/schools', 'schools'], ['POST', '/api/schools', 'schools'], ['PATCH', '/api/schools/:id', 'school'], ['GET', '/api/classes', 'classes'], ['POST', '/api/classes', 'classes'], ['PATCH', '/api/classes/:id', 'class'], ['GET', '/api/classes/:id/members', 'members'], ['GET', '/api/internal/account-maintenance', 'maintenance']];
