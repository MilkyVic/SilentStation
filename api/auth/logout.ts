import {CHAT_COOKIE} from '../../server/chat-http.js';
import {setCookie,AUTH_COOKIE} from '../../server/http-security.js';
import { logoutToken } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    await logoutToken(getBearerToken(req));
    setCookie(res,AUTH_COOKIE,'',0);
    setCookie(res,CHAT_COOKIE,'',0,'/api/chat');
    res.status(200).json({ ok: true });
  } catch (error) {
    handleApiError(res, error);
  }
}

