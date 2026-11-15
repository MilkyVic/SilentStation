import crypto from 'node:crypto';
import { AuthHttpError } from './auth-core.js';
export const AUTH_COOKIE = 'tram_an_session';
export function cookies(req: any): Record<string, string> {
    const result: Record<string, string> = {};
    for (const part of String(req.headers?.cookie || '').split(';')) {
        const index = part.indexOf('=');
        if (index < 1)
            continue;
        const key = part.slice(0, index).trim();
        try {
            result[key] = decodeURIComponent(part.slice(index + 1));
        }
        catch { /* Ignore malformed cookie. */ }
    }
    return result;
}
export function requestToken(req: any): string | null {
    const h = String(req.headers?.authorization || '');
    const bearer = h.startsWith('Bearer ') ? h.slice(7).trim() : null, cookie = cookies(req)[AUTH_COOKIE] || null;
    if (cookie && bearer && cookie !== bearer)
        throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Thông tin phiên không nhất quán.');
    return bearer || cookie;
}
export function sameOrigin(req: any) {
    const origin = String(req.headers?.origin || '');
    const configured = [process.env.APP_URL, process.env.AUTH_API_CORS_ORIGIN].filter(v => v && v !== '*').map(v => { try {
        return new URL(v!).origin;
    }
    catch {
        return '';
    } }).filter(Boolean);
    const allowed = configured.length ? configured : process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'] : [];
    if (!origin || !allowed.includes(origin))
        throw new AuthHttpError(403, 'CSRF_REJECTED', 'Nguồn yêu cầu không được phép.');
}
export function stateChangeCsrf(req: any) { if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && cookies(req)[AUTH_COOKIE])
    sameOrigin(req); }
export function setCookie(res: any, name: string, value: string, maxAge: number, path = '/api') {
    const cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    const previous = res.getHeader?.('Set-Cookie');
    res.setHeader('Set-Cookie', [...(Array.isArray(previous) ? previous : previous ? [String(previous)] : []), cookie]);
}
export function browserLogin(req: any, res: any, result: any) {
    if (req.body?.transport !== 'cookie' || !result.session)
        return result;
    setCookie(res, AUTH_COOKIE, result.session.accessToken, Math.max(0, Math.floor((new Date(result.session.expiresAt).getTime() - Date.now()) / 1000)));
    return { ...result, session: { tokenType: 'Cookie', expiresAt: result.session.expiresAt } };
}
export const tokenHash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
