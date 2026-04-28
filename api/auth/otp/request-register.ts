import { issueRegisterOtp } from '../../../server/auth-core.js';
import { ensureMethod, handleApiError, readJsonBody } from '../../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const result = await issueRegisterOtp(readJsonBody(req));
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    handleApiError(res, error);
  }
}
