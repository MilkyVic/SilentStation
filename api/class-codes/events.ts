import { listClassJoinCodeEvents } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  try {
    const payload = { ...(req.query || {}), ...(readJsonBody(req) || {}) };
    const events = await listClassJoinCodeEvents(getBearerToken(req), payload);
    res.status(200).json({
      ok: true,
      events,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
