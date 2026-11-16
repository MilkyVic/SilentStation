// Local SDK artifact gate, never a substitute for a real Vercel Preview deployment.
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';import {spawn} from 'node:child_process';
const options=Object.fromEntries(process.argv.slice(2).reduce((pairs,x,i,all)=>{if(i%2===0)pairs.push([x.replace(/^--/,''),all[i+1]]);return pairs;},[]));
if(!options.source||!options.output||!options.tools||! /^[a-f0-9]{12}$/.test(options.snapshot??''))throw Error('Use --source CLEAN_SOURCE --output OWNED_OUTPUT --tools ISOLATED_BUILDER_DIR --snapshot SOURCE_SNAPSHOT');
const root=path.resolve(options.source),out=path.resolve(options.output);
if(!path.relative(root,out).startsWith('..')||root===out)throw Error('Artifact output must not overwrite source.');
try{await fs.lstat(out);throw Error('ARTIFACT_OUTPUT_MUST_BE_NEW');}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.mkdir(out,{recursive:true});
const seal=JSON.parse(await fs.readFile(path.join(root,'package-manifest.json'),'utf8'));
if(seal.snapshotId!==options.snapshot||seal.target!=='native-vercel-neon'||seal.realCollection!==false)throw Error('SEALED_SOURCE_SNAPSHOT_REQUIRED');
for(const [name,digest]of Object.entries(seal.files)){if(path.isAbsolute(name)||name.split('/').includes('..'))throw Error('UNSAFE_SEALED_PATH');const file=path.join(root,name);if((await fs.lstat(file)).isSymbolicLink()||crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')!==digest)throw Error('SEALED_SOURCE_MISMATCH');}
const req=createRequire(path.resolve(options.tools,'package.json'));
const builderVersion=req('@vercel/node/package.json').version;
if(builderVersion!=='31.0.0')throw Error('Reproduce the audited @vercel/node 31.0.0 builder before changing its version.');
const {build}=req('@vercel/node'),{FileFsRef}=req('@vercel/build-utils');
const config=JSON.parse(await fs.readFile(path.join(root,'vercel.json'),'utf8')).functions['api/**/*.ts'];
for(const key of ['excludeFiles','includeFiles'])if(typeof config[key]!=='string'||config[key].length>256)throw Error('VERCEL_CONFIG_GLOB_SCHEMA_INVALID');
const entries=[];
async function visit(dir){for(const f of await fs.readdir(dir,{withFileTypes:true})){if(f.name.startsWith('_'))continue;const p=path.join(dir,f.name);if(f.isDirectory())await visit(p);else if(f.name.endsWith('.ts'))entries.push(path.relative(root,p));}}
await visit(path.join(root,'api'));const reports=[];
const env={PATH:process.env.PATH,NODE_ENV:'production',AUTH_SESSION_SECRET:crypto.randomBytes(32).toString('hex'),AUTH_SESSION_SECRET_FILE:'',AUTH_API_CORS_ORIGIN:'https://api.example.invalid',APP_URL:'https://api.example.invalid',DATABASE_URL:'postgresql://fake@127.0.0.1:1/fake',DATABASE_URL_FILE:'',DB_TLS_MODE:'verify-full',DB_TLS_CA_FILE:'',PGSSL_CA:'',GEMINI_API_KEY:'',AUTH_GMAIL_SMTP_USER:'',AUTH_GMAIL_SMTP_APP_PASSWORD:'',AUTH_SMTP_HOST:'',AUTH_SMTP_PASSWORD:'',AUTH_SEED_TEST_USERS:'false',SURVEY_REAL_COLLECTION_ENABLED:'false'};
for(const entry of entries){
 const start=Date.now();let report;
 try{
 const built=await build({files:{[entry]:new FileFsRef({fsPath:path.join(root,entry)})},entrypoint:entry,workPath:root,repoRootPath:root,config:{...config,nodeVersion:'22.x',zeroConfig:true,functions:{'api/**/*.ts':{installCommand:''}},projectSettings:{installCommand:'',nodeVersion:'22.x'}},meta:{skipDownload:true},considerBuildCommand:false});
 const outputs=built.output?.files?[built.output]:Object.values(built.output||{}),lambda=outputs.find(v=>v?.files);if(!lambda)throw Error('NO_LAMBDA');
 const dir=path.join(out,'bundles',entry.replaceAll('/','_').replace(/\.ts$/,''));await fs.mkdir(dir,{recursive:true});
 let bytes=0;const names=Object.keys(lambda.files);const forbidden=names.filter(n=>/^(?:public|src|tests|docs|dist|dist-demo|dist-server|scripts|workers|artifacts|\.acceptance|tram-an-fe)\//.test(n)||/(^|\/)\.env/.test(n)||n.startsWith('server/test-fixtures/')||n.startsWith('server/deployment/'));
 if(forbidden.length)throw Error('FORBIDDEN_RUNTIME_FILES');
 for(const [name,file] of Object.entries(lambda.files)){if(path.isAbsolute(name)||name.split('/').includes('..'))throw Error('UNSAFE_RUNTIME_PATH');const to=path.join(dir,name);await fs.mkdir(path.dirname(to),{recursive:true});let buffer;if(file.fsPath)buffer=await fs.readFile(file.fsPath);else if(typeof file.data==='string'||Buffer.isBuffer(file.data))buffer=Buffer.from(file.data);else {const chunks=[];for await(const c of file.toStream())chunks.push(Buffer.from(c));buffer=Buffer.concat(chunks);}bytes+=buffer.length;await fs.writeFile(to,buffer);}
 const sql=(await fs.readdir(path.join(root,'server/sql'))).filter(n=>n.endsWith('.sql'));if(sql.some(n=>!names.includes('server/sql/'+n)))throw Error('MISSING_MIGRATION_SQL');
 const knowledge=(await fs.readdir(path.join(root,'chatbot-knowledge'))).filter(n=>n.endsWith('.md'));if(knowledge.some(n=>!names.includes('chatbot-knowledge/'+n)))throw Error('MISSING_KNOWLEDGE_FILES');
 const js=entry.replace(/\.ts$/,'.js');if(!names.includes(js))throw Error('MISSING_TRANSFORMED_ENTRY');
 const probe=await new Promise((resolve,reject)=>{let text='';const child=spawn(process.execPath,['--input-type=module','-e',`const m=await import(${JSON.stringify('file://'+path.join(dir,js))});if(typeof m.default!=='function')throw Error('HANDLER_EXPORT');console.log('IMPORT_OK');`],{cwd:dir,env,stdio:['ignore','pipe','pipe']});child.stdout.on('data',s=>text+=s);child.stderr.on('data',s=>text+=s);const timer=setTimeout(()=>{child.kill('SIGTERM');reject(Error('PACKAGED_IMPORT_TIMEOUT'));},10000);child.on('error',e=>{clearTimeout(timer);reject(e);});child.on('exit',code=>{clearTimeout(timer);resolve({code,text});});});
 if(probe.code!==0){await fs.writeFile(path.join(dir,'probe-error.log'),probe.text);throw Error('PACKAGED_IMPORT_FAILED');}
 report={entry,ok:true,runtime:lambda.runtime,bytes,miB:bytes/1024/1024,fileCount:names.length,sqlCount:sql.length,knowledgeCount:knowledge.length,imported:true,handler:lambda.handler,ms:Date.now()-start};if(bytes>=250*1024*1024)throw Error('FUNCTION_SIZE_GATE');
 }catch(e){report={entry,ok:false,error:e.message,ms:Date.now()-start};}
 reports.push(report);await fs.writeFile(path.join(out,'report.json'),JSON.stringify({sourceSnapshot:options.snapshot,actualCloudBuild:false,builder:'@vercel/node@'+builderVersion,node:process.version,entries:reports},null,2)+'\n');console.log(JSON.stringify(report));
 if(!report.ok){process.exitCode=1;break;}
}
