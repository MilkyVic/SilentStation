import {maintenanceHandler} from '../../server/survey-maintenance.js';
export default async function handler(req:any,res:any){if(req.method!=='GET')return res.status(405).end();return maintenanceHandler(req,res);}
