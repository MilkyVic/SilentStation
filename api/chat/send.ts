import {chatHttp} from '../../server/chat-http.js';
import { ensureMethod, handleApiError, readJsonBody } from '../_lib/handler.js';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['POST'])) return;

  try {
    req.body=readJsonBody(req);
    const result = await chatHttp(req,res);
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    handleApiError(res, error);
  }
}

