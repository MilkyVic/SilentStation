import {runMaintenance,type MaintenanceEnv} from '../../../shared/maintenance-client.js';
export default {
 async scheduled(_event:unknown,env:MaintenanceEnv){const result=await runMaintenance(env);if(!result.enabled)return;for(const j of result.jobs)console.log(JSON.stringify({job:j.job,status:j.status,durationMs:j.durationMs,httpStatus:j.httpStatus}));if(!result.ok)throw Error('Maintenance tick incomplete.');},
 async fetch(){return new Response('Not found',{status:404});}
};
