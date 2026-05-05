import { listScopedUsers } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  try {
    const data = await listScopedUsers(getBearerToken(req), req.query ?? {});
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}
