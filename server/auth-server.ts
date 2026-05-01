import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  AuthHttpError,
  createClassJoinCode,
  getCurrentUser,
  healthCheck,
  initializeAuthCore,
  issueRegisterOtp,
  listActiveClassJoinCodes,
  listClassJoinCodeEvents,
  loginAccount,
  logoutToken,
  registerAccount,
  revokeClassJoinCode,
} from './auth-core.js';
import { sendChatMessage } from './chat-core.js';

const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.AUTH_API_CORS_ORIGIN || '*';
const PORT = Number(process.env.AUTH_API_PORT || 3001);

const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length).trim() || null;
};

const errorResponse = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
) => res.status(statusCode).json({ ok: false, error: { code, message } });

app.use((req, res, next) => {
  if (CORS_ORIGIN !== '*') {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

const asyncHandler = (
  handler: (req: Request, res: Response) => Promise<void>,
) => (req: Request, res: Response, next: NextFunction) => {
  handler(req, res).catch(next);
};

app.get('/api/health', asyncHandler(async (_req, res) => {
  const data = await healthCheck();
  res.status(200).json(data);
}));

app.post('/api/auth/otp/request-register', asyncHandler(async (req, res) => {
  const result = await issueRegisterOtp(req.body ?? {});
  res.status(200).json({ ok: true, ...result });
}));
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const user = await registerAccount(req.body ?? {});
  res.status(201).json({ ok: true, user });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const result = await loginAccount(req.body ?? {});
  res.status(200).json({ ok: true, ...result });
}));

app.get('/api/auth/me', asyncHandler(async (req, res) => {
  const user = await getCurrentUser(getBearerToken(req));
  res.status(200).json({ ok: true, user });
}));

app.post('/api/auth/logout', asyncHandler(async (req, res) => {
  await logoutToken(getBearerToken(req));
  res.status(200).json({ ok: true });
}));

app.post('/api/class-codes/create', asyncHandler(async (req, res) => {
  const result = await createClassJoinCode(getBearerToken(req), req.body ?? {});
  res.status(201).json({ ok: true, code: result.code, data: result.data });
}));

app.get('/api/class-codes/active', asyncHandler(async (req, res) => {
  const codes = await listActiveClassJoinCodes(getBearerToken(req));
  res.status(200).json({ ok: true, codes });
}));

app.post('/api/class-codes/revoke', asyncHandler(async (req, res) => {
  const code = await revokeClassJoinCode(getBearerToken(req), req.body ?? {});
  res.status(200).json({ ok: true, code });
}));

app.get('/api/class-codes/events', asyncHandler(async (req, res) => {
  const events = await listClassJoinCodeEvents(getBearerToken(req), req.query ?? {});
  res.status(200).json({ ok: true, events });
}));

app.post('/api/chat/send', asyncHandler(async (req, res) => {
  const result = await sendChatMessage(req.body ?? {});
  res.status(200).json({ ok: true, ...result });
}));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AuthHttpError) {
    const authError = error as AuthHttpError;
    errorResponse(res, authError.statusCode, authError.code, authError.message);
    return;
  }

  console.error('[auth-api] unexpected error', error);
  errorResponse(res, 500, 'AUTH_SERVER_ERROR', 'May chu xac thuc tam thoi loi.');
});

const startServer = async () => {
  await initializeAuthCore();

  app.listen(PORT, () => {
    console.log(`[auth-api] running at http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('[auth-api] failed to start', error);
  process.exit(1);
});




