import {configuredCorsOrigin} from './runtime-config.js';
import {legacyExport} from './accounts/reports.js';
import 'dotenv/config';
import {ACCOUNT_ROUTES,accountHandler,accountsEnabled} from './accounts/http.js';
import { readiness, readyHandler } from './readiness.js';
import { closeDatabase } from './database.js';
import { closeAuthDatabase } from './auth-core.js';
import { closeTestDatabase } from './test-core.js';
import { RateLimitError } from './rate-limits.js';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {requestToken,stateChangeCsrf,sameOrigin,browserLogin,setCookie,AUTH_COOKIE} from './http-security.js';
import {maintenanceHandler} from './survey-maintenance.js';
import {chatHttp,CHAT_COOKIE} from './chat-http.js';
import {legacyDraftHandler} from './legacy-drafts.js';
import {surveyHandler} from './surveys/core.js';
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
  approveTeacherAccount,
  rejectTeacherAccount,
  listScopedUsers,
  listRegistrationSchools,
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
  getManageTestTemplateDetail,
  initializeTestCore,
  listMyTestResults,
  publishTestTemplate,
  listTestCatalog,
  submitTestResult,
  updateCustomTestTemplate,
} from './test-core.js';

export const createApp = () => {
const app = express();
app.disable('x-powered-by');
app.use((_req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cache-Control','no-store');next();});
app.use(express.json({limit:'256kb'}));
app.use((req,res,next)=>{try{stateChangeCsrf(req); if(req.body?.transport==='cookie'&&req.method==='POST')sameOrigin(req);next();}catch(e){next(e);}});

const CORS_ORIGIN = configuredCorsOrigin();
const PORT = Number(process.env.AUTH_API_PORT || 3001);

const getBearerToken = requestToken;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

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

app.get('/api/internal/survey-maintenance',asyncHandler(async(req,res)=>{await maintenanceHandler(req,res);}));

app.get('/api/ready',asyncHandler(async(req,res)=>{await readyHandler(req,res);}));

app.get('/api/health', asyncHandler(async (_req, res) => {
  const data = await healthCheck();
  res.status(200).json(data);
}));

app.get('/api/auth/schools',asyncHandler(async(_req,res)=>{res.json({ok:true,schools:await listRegistrationSchools()});}));

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
  res.status(200).json({ ok: true, ...browserLogin(req,res,result) });
}));

app.get('/api/auth/me', asyncHandler(async (req, res) => {
  const user = await getCurrentUser(getBearerToken(req));
  res.status(200).json({ ok: true, user });
}));

app.post('/api/auth/logout', asyncHandler(async (req, res) => {
  await logoutToken(getBearerToken(req));
  setCookie(res,AUTH_COOKIE,'',0);
  setCookie(res,CHAT_COOKIE,'',0,'/api/chat');
  res.status(200).json({ ok: true });
}));

app.get('/api/admins', asyncHandler(async (req, res) => {
  const data = await listAdminAccounts(getBearerToken(req));
  res.status(200).json({ ok: true, ...data });
}));

app.get('/api/users', asyncHandler(async (req, res) => {
  if(accountsEnabled()){await accountHandler(req,res,'users');return;}
  const data = await listScopedUsers(getBearerToken(req), req.query ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.post('/api/users/approve-teacher', asyncHandler(async (req, res) => {
  if(accountsEnabled()){req.params.id=req.body?.teacherId;await accountHandler(req,res,'approve');return;}
  const data = await approveTeacherAccount(getBearerToken(req), req.body ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.post('/api/users/reject-teacher', asyncHandler(async (req, res) => {
  if(accountsEnabled()){req.params.id=req.body?.teacherId;await accountHandler(req,res,'reject');return;}
  const data = await rejectTeacherAccount(getBearerToken(req), req.body ?? {});
  res.status(200).json({ ok: true, ...data });
}));

app.post('/api/admins', asyncHandler(async (req, res) => {
  if(accountsEnabled()||process.env.NODE_ENV==='production'){await accountHandler(req,res,'admins');return;}
  const data = await createAdminAccount(getBearerToken(req), req.body ?? {});
  res.status(201).json({ ok: true, ...data });
}));

app.post('/api/class-codes/create', asyncHandler(async (req, res) => {
  if(accountsEnabled()){await accountHandler(req,res,'codeCreate');return;}
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
  const result = await chatHttp(req,res);
  res.status(200).json({ ok: true, ...result });
}));

for(const [url,action] of new Map(ACCOUNT_ROUTES.map(([,url,action])=>[url,action])))app.all(url,asyncHandler(async(req,res)=>{await accountHandler(req,res,action);}));

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

app.get('/api/tests/reports/export',asyncHandler(async(req,res)=>{await legacyExport(req,res);}));
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

app.get('/api/tests/templates/:id',asyncHandler(async(req,res)=>{res.setHeader('Cache-Control','no-store');res.json({ok:true,...await getManageTestTemplateDetail(getBearerToken(req),String(req.params.id))});}));

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
  const data = await deleteCustomTestTemplate(getBearerToken(req), templateId,req.body??{});
  res.status(200).json({ ok: true, ...data });
}));

app.all('/api/tests/drafts/:templateId',asyncHandler(async(req,res)=>{await legacyDraftHandler(req,res);}));

app.get('/api/tests/:templateId', asyncHandler(async (req, res) => {
  const templateId = String(req.params.templateId || '').trim();
  const data = await getTestTemplateDetail(getBearerToken(req), templateId);
  res.status(200).json({ ok: true, ...data });
}));


app.get('/api/surveys/distribution/campaigns',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'distribution-campaigns');}));
app.all('/api/surveys/distribution/campaigns/:id/invitations',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'invitations');}));
app.post('/api/surveys/distribution/invitations/:id/revoke',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'invitation-revoke');}));
app.get('/api/surveys/invitations/:code',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'invitation');}));
app.get('/api/surveys/campaigns/:code',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'campaign');}));
app.post('/api/surveys/campaigns/:code/session',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'session');}));
app.all('/api/surveys/campaigns/:code/draft',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'draft');}));
app.post('/api/surveys/campaigns/:code/submit',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'submit');}));
app.all('/api/surveys/admin/campaigns',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'campaigns');}));
app.patch('/api/surveys/admin/campaigns/:id',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'campaign-admin');}));
app.get('/api/surveys/admin/campaigns/:id/grant-candidates',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'grant-candidates');}));
app.all('/api/surveys/admin/campaigns/:id/grants',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'grants');}));
app.get('/api/surveys/admin/campaigns/:id/report',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'report');}));
app.get('/api/surveys/admin/campaigns/:id/responses/:responseId',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'response');}));
app.get('/api/surveys/admin/campaigns/:id/export',asyncHandler(async(req,res)=>{await surveyHandler(req,res,'export');}));
app.use('/api',(req,res)=>{const matched=(app as any)._router.stack.some((l:any)=>l.route&&l.regexp.test(req.originalUrl.split('?')[0]));errorResponse(res,matched?405:404,'HTTP_ROUTE_ERROR',matched?'Method Not Allowed':'Not Found');});
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if ((error as any)?.type === 'entity.parse.failed') { errorResponse(res,400,'INVALID_JSON','JSON không hợp lệ.'); return; }
  if ((error as any)?.type === 'entity.too.large') { errorResponse(res,413,'BODY_TOO_LARGE','Yêu cầu vượt giới hạn.'); return; }
  if (error instanceof AuthHttpError || error instanceof RateLimitError) {
    const authError = error as AuthHttpError;
    errorResponse(res, authError.statusCode, authError.code, authError.message);
    return;
  }

  console.error('[auth-api] unexpected failure');
  errorResponse(res, 500, 'AUTH_SERVER_ERROR', 'May chu xac thuc tam thoi loi.');
});

return app;
};

export const startServer = async () => {
  const PORT=Number(process.env.AUTH_API_PORT||3001);
  if (!(await readiness()).ok) throw new Error('API readiness failed; explicit migrations/configuration required.');
  await initializeAuthCore();
  await initializeTestCore();

  return createApp().listen(PORT,process.env.AUTH_API_HOST||(process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1'), () => {
    console.log(`[auth-api] running at http://localhost:${PORT}`);
  });
};

if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) startServer().then(server => {
  let stopping = false;
  const shutdown = () => { if (stopping) return; stopping = true; const deadline = setTimeout(() => process.exit(1),10000); deadline.unref();
    server.close(async () => { await Promise.all([closeDatabase(),closeAuthDatabase(),closeTestDatabase()]); clearTimeout(deadline); process.exit(0); });
    server.closeIdleConnections(); };
  process.once('SIGTERM',shutdown); process.once('SIGINT',shutdown);
}).catch(() => {
  console.error('[auth-api] failed to start; verify isolated DB and migration configuration.');
  process.exit(1);
});




