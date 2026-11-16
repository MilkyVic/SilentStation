import {accountHandler} from '../../../server/accounts/http.js';
import {applyCors} from '../../_lib/handler.js';
export default async function handler(req:any,res:any){applyCors(res);return accountHandler(req,res,'profile');}
