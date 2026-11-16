import {accountsEnabled,accountHandler} from '../../server/accounts/http.js';
import { rejectTeacherAccount } from '../../server/auth-core.js';
import { ensureMethod, getBearerToken, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
 if(accountsEnabled()){const b=readJsonBody(req);req.body=b;req.query={...req.query,id:b.teacherId};return accountHandler(req,res,'reject');}
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    const data = await rejectTeacherAccount(getBearerToken(req), readJsonBody(req));
    res.status(200).json({ ok: true, ...data });
  } catch (error) {
    handleApiError(res, error);
  }
}
