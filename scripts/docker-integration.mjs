import pg from 'pg';import fs from 'node:fs';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
const original=fs.readFileSync(process.env.DATABASE_URL_FILE,'utf8').trim(),url=new URL(original);
if(url.hostname!=='db'||!/^ss_test_[a-f0-9]{12}$/.test(url.pathname.slice(1)))throw new Error('Refuse non-acceptance database.');
const admin=new pg.Client({connectionString:original,ssl:{ca:fs.readFileSync(process.env.DB_TLS_CA_FILE,'utf8'),rejectUnauthorized:true}});await admin.connect();
const name=`ss_test_${crypto.randomBytes(6).toString('hex')}`;
try {await admin.query(`CREATE DATABASE ${name}`);url.pathname='/'+name;const env={...process.env,DATABASE_URL:url.toString(),DATABASE_URL_FILE:'',TEST_DATABASE_URL:url.toString(),SS_DISPOSABLE_TEST_CONFIRM:'yes',AUTH_SMTP_HOST:'',CRON_SECRET:'',CRON_SECRET_FILE:'',NODE_ENV:'test'};
 let r=spawnSync('node',['--test','--test-concurrency=1','dist-server/server/runtime.integration.test.js','dist-server/server/surveys/integration.test.js'],{env,stdio:'inherit'});process.exitCode=r.status??1;
}finally{await admin.query(`DROP DATABASE ${name} WITH (FORCE)`);await admin.end();}
