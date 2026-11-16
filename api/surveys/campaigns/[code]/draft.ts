import { surveyHandler } from '../../../../server/surveys/core.js';
export default async function handler(req: any, res: any) { await surveyHandler(req, res, 'draft'); }
