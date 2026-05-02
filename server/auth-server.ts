import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  AuthHttpError,
  createAdminAccount,
  createClassJoinCode,
  getCurrentUser,
  healthCheck,
  initializeAuthCore,
  issueRegisterOtp,
  listAdminAccounts,
  listActiveClassJoinCodes,
  listClassJoinCodeEvents,
  loginAccount,
  logoutToken,
  registerAccount,
  revokeClassJoinCode,
} from './auth-core.js';
import { sendChatMessage } from './chat-core.js';
import {
  createCustomTestTemplate,
  deleteCustomTestTemplate,
  getTestOpsSummary,
  getTestReportsOverview,
  listManageTestTemplates,
  listTemplateVersions,
  getTestTemplateDetail,
  initializeTestCore,
  listMyTestResults,
  publishTestTemplate,
  listTestCatalog,
  submitTestResult,
  updateCustomTestTemplate,
} from './test-core.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');

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

app.get('/api/admins', asyncHandler(async (req, res) => {
  const data = await listAdminAccounts(getBearerToken(req));
  res.status(200).json({ ok: true, ...data });
}));

app.post('/api/admins', asyncHandler(async (req, res) => {
  const data = await createAdminAccount(getBearerToken(req), req.body ?? {});
  res.status(201).json({ ok: true, ...data });
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

app.get('/api/tests/catalog', asyncHandler(async (req, res) => {
  const data = await listTestCatalog(getBearerToken(req));
  res.status(200).json({ ok: true, ...data });
}));

app.post('/api/tests/submit', asyncHandler(async (req, res) => {
  const data = await submitTestResult(getBearerToken(req), req.body ?? {});
  res.status(201).json({ ok: true, ...data });
}));

app.get('/api/tests/results/me', asyncHandler(async (req, res) => {
  const data = await listMyTestResults(getBearerToken(req));
  res.status(200).json({ ok: true, ...data });
}));

app.get('/api/tests/reports/overview', asyncHandler(async (req, res) => {
  const data = await getTestReportsOverview(getBearerToken(req), req.query ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.get('/api/tests/ops/summary', asyncHandler(async (req, res) => {
  const data = await getTestOpsSummary(getBearerToken(req), req.query ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.get('/api/tests/templates/manage', asyncHandler(async (req, res) => {
  const data = await listManageTestTemplates(getBearerToken(req));
  res.status(200).json({ ok: true, ...data });
}));

app.get('/api/tests/templates/:id/versions', asyncHandler(async (req, res) => {
  const templateId = String(req.params.id || '').trim();
  const data = await listTemplateVersions(getBearerToken(req), templateId);
  res.status(200).json({ ok: true, ...data });
}));

app.post('/api/tests/templates', asyncHandler(async (req, res) => {
  const data = await createCustomTestTemplate(getBearerToken(req), req.body ?? {});
  res.status(201).json({ ok: true, ...data });
}));

app.post('/api/tests/templates/:id/publish', asyncHandler(async (req, res) => {
  const templateId = String(req.params.id || '').trim();
  const data = await publishTestTemplate(getBearerToken(req), templateId, req.body ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.patch('/api/tests/templates/:id', asyncHandler(async (req, res) => {
  const templateId = String(req.params.id || '').trim();
  const data = await updateCustomTestTemplate(getBearerToken(req), templateId, req.body ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.delete('/api/tests/templates/:id', asyncHandler(async (req, res) => {
  const templateId = String(req.params.id || '').trim();
  const data = await deleteCustomTestTemplate(getBearerToken(req), templateId);
  res.status(200).json({ ok: true, ...data });
}));

app.get('/api/tests/:templateId', asyncHandler(async (req, res) => {
  const templateId = String(req.params.templateId || '').trim();
  const data = await getTestTemplateDetail(getBearerToken(req), templateId);
  res.status(200).json({ ok: true, ...data });
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
  await initializeTestCore();

  app.listen(PORT, () => {
    console.log(`[auth-api] running at http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('[auth-api] failed to start', error);
  process.exit(1);
});




