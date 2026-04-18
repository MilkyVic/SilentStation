import { healthCheck } from '../server/auth-core';
import { ensureMethod, handleApiError } from './_lib/handler';

export default async function handler(req: any, res: any) {
  if (!ensureMethod(req, res, ['GET'])) return;

  try {
    const data = await healthCheck();
    res.status(200).json(data);
  } catch (error) {
    handleApiError(res, error);
  }
}
