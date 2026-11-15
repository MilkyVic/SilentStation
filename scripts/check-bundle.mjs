import fs from 'node:fs/promises';import path from 'node:path';import {gzipSync} from 'node:zlib';
const directory=process.argv[2]||'dist',html=await fs.readFile(path.join(directory,'index.html'),'utf8');const entry=html.match(/src="(\/assets\/[^\"]+\.js)"/)[1];const visited=new Set();let total=0;
async function visit(file){if(visited.has(file))return;visited.add(file);const code=await fs.readFile(path.join(directory,file.replace(/^\//,'')),'utf8');total+=gzipSync(code).length;for(const match of code.matchAll(/(?:from\s*|import\s*)["'](\.\/[^"']+\.js)["']/g))await visit('/assets/'+match[1].slice(2));}
await visit(entry);console.log(JSON.stringify({entry,eagerJsGzipBytes:total,eagerChunks:[...visited],budgetBytes:200*1024,pass:total<=200*1024},null,2));if(total>200*1024)process.exitCode=1;
