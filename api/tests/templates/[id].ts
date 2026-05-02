import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../../_lib/handler.js';
import { deleteCustomTestTemplate, updateCustomTestTemplate } from '../../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['PATCH', 'DELETE'])) return;

  const templateId = String(req.query?.id || '').trim();
  if (!templateId) {
    res.status(400).json({ ok: false, error: { code: 'AUTH_SERVER_ERROR', message: 'Thieu id bai test.' } });
    return;
  }

  try {
    if (req.method === 'PATCH') {
      const payload = readJsonBody(req);
      const data = await updateCustomTestTemplate(getBearerToken(req), templateId, payload);
      res.status(200).json({ ok: true, ...data });
      return;
    }

    const data = await deleteCustomTestTemplate(getBearerToken(req), templateId);
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

