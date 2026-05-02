import { ensureMethod, getBearerToken, handleApiError } from '../../_lib/handler.js';
import { listMyTestResults } from '../../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  try {
    const data = await listMyTestResults(getBearerToken(req));
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

