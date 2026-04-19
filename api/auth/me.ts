import { getCurrentUser } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  try {
    const user = await getCurrentUser(getBearerToken(req));
    res.status(200).json({ ok: true, user });
  } catch (error) {
    handleApiError(res, error);
  }
}

