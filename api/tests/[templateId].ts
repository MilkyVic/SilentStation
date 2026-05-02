import { ensureMethod, getBearerToken, handleApiError } from '../_lib/handler.js';
import { getTestTemplateDetail } from '../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  const templateId = String(req.query?.templateId || '').trim();
  if (!templateId) {
    res.status(400).json({ ok: false, error: { code: 'AUTH_SERVER_ERROR', message: 'Thieu templateId.' } });
    return;
  }

  try {
    const data = await getTestTemplateDetail(getBearerToken(req), templateId);
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

