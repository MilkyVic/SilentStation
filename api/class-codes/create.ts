import { createClassJoinCode } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const result = await createClassJoinCode(getBearerToken(req), readJsonBody(req));
    res.status(201).json({
      ok: true,
      code: result.code,
      data: result.data,
    });
  } catch (error) {
    handleApiError(res, error);
  }
}
