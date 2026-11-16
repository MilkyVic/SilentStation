// Loads the compiled Vercel adapters without requests/provider calls. Runtime
// HTTPS/DB/cookie acceptance is a separate gate, never inferred from this probe.
import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]||'dist-server/api');let count=0;
async function visit(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory()){if(!e.name.startsWith('_'))await visit(file);}else if(e.name.endsWith('.js')){const m=await import(pathToFileURL(file).href);if(typeof m.default!=='function')throw Error('Adapter export missing: '+path.relative(root,file));count++;}}}
await visit(root);console.info(JSON.stringify({ok:true,compiledAdapters:count,requestsExecuted:false,cloudExecuted:false}));
