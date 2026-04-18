import { AuthHttpError } from '../../server/auth-core';

export const CORS_ORIGIN = process.env.AUTH_API_CORS_ORIGIN || '*';

export const applyCors = (res: any) => {
  if (CORS_ORIGIN !== '*') {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
};

export const ensureMethod = (req: any, res: any, methods: string[]) => {
  applyCors(res);

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

export const getBearerToken = (req: any): string | null => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim() || null;
};

export const readJsonBody = (req: any) => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body ?? {};
};

export const handleApiError = (res: any, error: unknown) => {
  if (error instanceof AuthHttpError) {
    res.status(error.statusCode).json({
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  console.error('[vercel-auth-api] unexpected error', error);
  res.status(500).json({
    ok: false,
    error: {
      code: 'AUTH_SERVER_ERROR',
      message: 'May chu xac thuc tam thoi loi.',
    },
  });
};
