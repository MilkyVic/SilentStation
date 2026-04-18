import { loginAccount } from '../../server/auth-core';
import { ensureMethod, handleApiError, readJsonBody } from '../_lib/handler';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const result = await loginAccount(readJsonBody(req));
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    handleApiError(res, error);
  }
}
