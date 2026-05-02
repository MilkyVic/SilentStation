import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../../_lib/handler.js';
import { createCustomTestTemplate } from '../../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const payload = readJsonBody(req);
    const data = await createCustomTestTemplate(getBearerToken(req), payload);
    res.status(201).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

