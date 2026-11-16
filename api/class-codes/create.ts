import {accountsEnabled,accountHandler} from '../../server/accounts/http.js';
import { createClassJoinCode } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
 if(accountsEnabled())return accountHandler(req,res,'codeCreate');
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
