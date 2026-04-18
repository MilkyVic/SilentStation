import { logoutToken } from '../../server/auth-core';
import { ensureMethod, getBearerToken, handleApiError } from '../_lib/handler';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    await logoutToken(getBearerToken(req));
    res.status(200).json({ ok: true });
  } catch (error) {
    handleApiError(res, error);
  }
}
