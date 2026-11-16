import crypto from 'node:crypto';
import { consumeRate } from './rate-limits.js';
import { sendChatMessage } from './chat-core.js';
import { cookies, setCookie, tokenHash, sameOrigin, requestToken } from './http-security.js';
import { getCurrentUser } from './auth-core.js';
export const CHAT_COOKIE = 'tram_an_chat_guest';
export async function chatHttp(req: any, res: any) {
    sameOrigin(req);
    let cookie = cookies(req)[CHAT_COOKIE];
    if (!cookie || !/^[A-Za-z0-9_-]{43}$/.test(cookie)) {
        cookie = crypto.randomBytes(32).toString('base64url');
        setCookie(res, CHAT_COOKIE, cookie, 2700, '/api/chat');
    }
    const auth = requestToken(req);
    let owner = 'guest';
    if (auth) {
        const user = await getCurrentUser(auth);
        owner = user.id;
    }
    await consumeRate('chat', `${owner}:${tokenHash(cookie)}`);
    // Caller session IDs/history are not accepted as ownership. Survey answers never enter this interface.
    return sendChatMessage({ message: req.body?.message, mode: 'support', sessionId: `${owner}:${tokenHash(cookie)}` });
}
