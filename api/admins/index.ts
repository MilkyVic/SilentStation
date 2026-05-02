import { createAdminAccount, listAdminAccounts } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
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
