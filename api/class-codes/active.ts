import { listActiveClassJoinCodes } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  try {
    const codes = await listActiveClassJoinCodes(getBearerToken(req));
    res.status(200).json({
      ok: true,
      codes,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
