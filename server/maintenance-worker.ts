// Optional native operator runner; never started by API/health or attached to a preview automatically.
import {secretValue} from './runtime-config.js';
import {runMaintenance} from '../shared/maintenance-client.js';
const env={APP_BASE_URL:process.env.MAINTENANCE_BASE_URL,CRON_SECRET:secretValue('CRON_SECRET'),SCHEDULER_ENABLED:process.env.SCHEDULER_ENABLED,VERCEL_PROTECTION_BYPASS:secretValue('VERCEL_PROTECTION_BYPASS')};
if(env.SCHEDULER_ENABLED!=='true'){console.info('Maintenance scheduler disabled.');}else{
 let stopping=false,inFlight=false;const tick=async()=>{if(stopping||inFlight)return;inFlight=true;try{const r=await runMaintenance(env);for(const j of r.jobs)console.log(JSON.stringify(j));}catch{console.error('Maintenance configuration/tick failed.');}finally{inFlight=false;}};
 const timer=setInterval(()=>void tick(),60000);process.once('SIGTERM',()=>{stopping=true;clearInterval(timer);});process.once('SIGINT',()=>{stopping=true;clearInterval(timer);});await tick();
}
