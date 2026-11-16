import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
const config=JSON.parse(fs.readFileSync('vercel.json','utf8')),fn=config.functions['api/**/*.ts'];
test('Vercel include/exclude configuration follows vendor schema: one glob string, maximum 256 chars',()=>{for(const field of ['includeFiles','excludeFiles']){assert.equal(typeof fn[field],'string');assert.ok(fn[field].length>0&&fn[field].length<=256);}assert.equal(fn.maxDuration,30);});
test('bounded function glob preserves runtime SQL/knowledge while excluding assets, tools, private folders and tests',()=>{
 const req=createRequire(import.meta.url),match=req('picomatch')(fn.excludeFiles,{dot:true});
 for(const path of ['public/logo.webp','src/App.tsx','dist/index.html','dist-server/server/auth-server.js','.acceptance/credentials.json','.git/private/github-push-token','server/deployment/account-import-cli.ts','server/test-fixtures/initialize-cloud.ts','server/accounts/mapping.ts','server/surveys/contracts.test.ts','server/.env.private'])assert.ok(match(path),path);
 for(const path of ['api/auth/logout.ts','server/auth-core.ts','server/accounts/common.ts','server/sql/009_qa_provenance.sql','chatbot-knowledge/SYSTEM_PROMPT_TRAM_AN.md','shared/accounts.ts','node_modules/pg/lib/index.js'])assert.equal(match(path),false,path);
});
test('local/CI/runtime agree on Node 22 and software release 1.1.1',()=>{const p=JSON.parse(fs.readFileSync('package.json','utf8'));assert.equal(p.engines.node,'22.x');assert.equal(p.version,'1.1.1');assert.match(fs.readFileSync('.github/workflows/quality.yml','utf8'),/node-version: 22\.x/);});

test('pushing release source does not authorize an automatic cloud deployment',()=>{assert.equal(config.git.deploymentEnabled,false);});
