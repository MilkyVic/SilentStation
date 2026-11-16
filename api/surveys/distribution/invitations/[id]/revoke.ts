import {surveyHandler} from '../../../../../server/surveys/core.js';
export default async function handler(req:any,res:any){return surveyHandler(req,res,'invitation-revoke');}
