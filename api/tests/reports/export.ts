import {legacyExport} from '../../../server/accounts/reports.js';
import {ensureMethod,handleApiError} from '../../_lib/handler.js';
export default async function handler(req:any,res:any){if(!ensureMethod(req,res,['GET']))return;try{await legacyExport(req,res);}catch(e){handleApiError(res,e);}}
