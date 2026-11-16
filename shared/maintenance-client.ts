export type MaintenanceEnv={APP_BASE_URL?:string;CRON_SECRET?:string;SCHEDULER_ENABLED?:string;VERCEL_PROTECTION_BYPASS?:string};
export type JobResult={job:string;status:'ok'|'failed'|'unavailable'|'timeout';httpStatus?:number;durationMs:number};
export function maintenanceOrigin(value:string|undefined){const u=new URL(value??'');if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('Invalid maintenance origin.');return u.origin;}
export async function runMaintenance(env:MaintenanceEnv,fetcher:typeof fetch=fetch,timeoutMs=25000):Promise<{enabled:boolean;ok:boolean;jobs:JobResult[]}>{
 if(env.SCHEDULER_ENABLED!=='true')return {enabled:false,ok:true,jobs:[]};
 const origin=maintenanceOrigin(env.APP_BASE_URL),secret=env.CRON_SECRET??'';if(secret.length<32||/[\r\n]/.test(secret))throw Error('Invalid maintenance secret.');
 const jobs=await Promise.all(['survey-maintenance','account-maintenance'].map(async job=>{
  const start=Date.now(),abort=new AbortController();let timer:ReturnType<typeof setTimeout>;
  try{
   const headers:Record<string,string>={Authorization:`Bearer ${secret}`};if(env.VERCEL_PROTECTION_BYPASS)headers['x-vercel-protection-bypass']=env.VERCEL_PROTECTION_BYPASS;
   const request=(async()=>{const r=await fetcher(`${origin}/api/internal/${job}`,{headers,redirect:'error',signal:abort.signal});if(!r.ok)return {job,status:'failed' as const,httpStatus:r.status,durationMs:Date.now()-start};const text=await r.text();if(text.length>8192)throw Error('Oversized response.');const d=JSON.parse(text);return {job,status:!d?.ok?'failed' as const:d.available===false?'unavailable' as const:'ok' as const,httpStatus:r.status,durationMs:Date.now()-start};})();
   const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('Timeout'));},Math.min(25000,Math.max(1,timeoutMs)));});return await Promise.race([request,deadline]);
  }catch{return {job,status:abort.signal.aborted?'timeout' as const:'failed' as const,durationMs:Date.now()-start};}finally{clearTimeout(timer!);abort.abort();}
 }));return {enabled:true,ok:jobs.every(j=>j.status==='ok'),jobs};
}
