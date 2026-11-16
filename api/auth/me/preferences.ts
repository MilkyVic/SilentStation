import {accountHandler} from '../../../server/accounts/http.js';
export default async function handler(req:any,res:any){return accountHandler(req,res,'preferences');}
