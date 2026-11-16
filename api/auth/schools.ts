import {listRegistrationSchools} from '../../server/auth-core.js';
import {ensureMethod,handleApiError} from '../_lib/handler.js';
export default async function handler(req:any,res:any){if(!ensureMethod(req,res,['GET']))return;try{res.json({ok:true,schools:await listRegistrationSchools()});}catch(error){handleApiError(res,error);}}
