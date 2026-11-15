import { secretValue } from './runtime-config.js';
const secret=secretValue('CRON_SECRET');if(!secret||secret.length<32)throw new Error('Maintenance secret required.');
let stopping=false;process.once('SIGTERM',()=>{stopping=true;process.exit(0);});
async function tick(){try {const r=await fetch('http://api:3001/api/internal/survey-maintenance',{headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(5000)});if(!r.ok)console.error('Maintenance tick failed.');}catch{console.error('Maintenance service unavailable.');}}
await tick();const interval=setInterval(()=>{if(!stopping)void tick();},60000);
// Keep this worker alive until explicitly stopped by its own Compose project.
await new Promise(()=>{});
