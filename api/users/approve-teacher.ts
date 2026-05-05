import { approveTeacherAccount } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const data = await approveTeacherAccount(getBearerToken(req), readJsonBody(req));
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}
