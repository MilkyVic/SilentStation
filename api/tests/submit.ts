import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';
import { submitTestResult } from '../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const payload = readJsonBody(req);
    const data = await submitTestResult(getBearerToken(req), payload);
    res.status(201).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

