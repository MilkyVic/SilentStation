import { registerAccount } from '../../server/auth-core.js';
import { ensureMethod, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const user = await registerAccount(readJsonBody(req));
    res.status(201).json({ ok: true, user });
  } catch (error) {
    handleApiError(res, error);
  }
}

