import {requestToken,stateChangeCsrf,sameOrigin} from '../../server/http-security.js';
import { RateLimitError } from '../../server/rate-limits.js';
import { AuthHttpError } from '../../server/auth-core.js';

export const CORS_ORIGIN = process.env.AUTH_API_CORS_ORIGIN || '*';

export const applyCors = (res: any) => {
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');
  if (CORS_ORIGIN !== '*') {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
};

export const ensureMethod = (req: any, res: any, methods: string[]) => {
  applyCors(res);
  try { stateChangeCsrf(req); if(req.method==='POST'&&readJsonBody(req).transport==='cookie')sameOrigin(req); } catch(error) {handleApiError(res,error);return false;}

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }

  if (!methods.includes(req.method || '')) {
    res.status(405).json({ ok: false, error: { code: 'AUTH_SERVER_ERROR', message: 'Method Not Allowed' } });
    return false;
  }

  return true;
};

export const getBearerToken = requestToken;

export const readJsonBody = (req: any) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new AuthHttpError(400,'INVALID_JSON','JSON không hợp lệ.');
    }
  }

  return req.body ?? {};
};

export const handleApiError = (res: any, error: unknown) => {
  if (error instanceof AuthHttpError || error instanceof RateLimitError) {
    res.status(error.statusCode).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  console.error('[vercel-auth-api] unexpected failure');
  res.status(500).json({
    ok: false,
    error: {
      code: 'AUTH_SERVER_ERROR',
      message: 'May chu xac thuc tam thoi loi.',
    },
  });
};

