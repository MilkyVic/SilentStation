import {accountsEnabled,accountHandler} from '../../server/accounts/http.js';
import { createAdminAccount, listAdminAccounts } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
 if((accountsEnabled()||process.env.NODE_ENV==='production') && req.method==="POST")return accountHandler(req,res,'admins');
  if (!ensureMethod(req, res, ['GET', 'POST'])) return;

  try {
    if (req.method === 'GET') {
      const data = await listAdminAccounts(getBearerToken(req));
      res.status(200).json({ ok: true, ...data });
      return;
    }

    const payload = readJsonBody(req);
    const data = await createAdminAccount(getBearerToken(req), payload);
    res.status(201).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}
