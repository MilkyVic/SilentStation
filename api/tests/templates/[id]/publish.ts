import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../../../_lib/handler.js';
import { publishTestTemplate } from '../../../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  const templateId = String(req.query?.id || '').trim();
  if (!templateId) {
    res.status(400).json({ ok: false, error: { code: 'AUTH_SERVER_ERROR', message: 'Thieu id bai test.' } });
    return;
  }

  try {
    const payload = readJsonBody(req);
    const data = await publishTestTemplate(getBearerToken(req), templateId, payload);
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

