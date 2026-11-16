import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../../_lib/handler.js';
import { deleteCustomTestTemplate, updateCustomTestTemplate,getManageTestTemplateDetail } from '../../../server/test-core.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET','PATCH', 'DELETE'])) return;

  const templateId = String(req.query?.id || '').trim();
  if (!templateId) {
    res.status(400).json({ ok: false, error: { code: 'AUTH_SERVER_ERROR', message: 'Thieu id bai test.' } });
    return;
  }

  try {
    res.setHeader('Cache-Control','no-store');
    if(req.method==='GET'){return res.status(200).json({ok:true,...await getManageTestTemplateDetail(getBearerToken(req),templateId)});}
    if (req.method === 'PATCH') {
      const payload = readJsonBody(req);
      const data = await updateCustomTestTemplate(getBearerToken(req), templateId, payload);
      res.status(200).json({ ok: true, ...data });
      return;
    }

    const data = await deleteCustomTestTemplate(getBearerToken(req), templateId,readJsonBody(req));
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}

