import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {database,closeDatabase} from '../database.js';
import {populateOwnedFixtures} from './populate.js';
import {validatePreviewFixtureScope,type PreviewFixtureScope} from './cloud-policy.js';
export async function initializePreviewFixtures(){
 const file=process.env.QA_SCOPE_FILE;if(!file)throw Error('QA_PRIVATE_SCOPE_REQUIRED');
 const stat=await fs.lstat(file);if(!stat.isFile()||(stat.mode&0o077)!==0)throw Error('QA_PRIVATE_SCOPE_REQUIRED');
 const scope=JSON.parse(await fs.readFile(file,'utf8')) as PreviewFixtureScope;
 const confirmed=validatePreviewFixtureScope(scope);
 // Separate entry point: never weaken the native loopback/database guard.
 await populateOwnedFixtures(database(),confirmed.snapshotId,process.env.ACCEPTANCE_CREDENTIAL_FILE!,true);
 return {ok:true,snapshotId:confirmed.snapshotId,createdRoles:6,realCollection:false};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)initializePreviewFixtures().then(r=>console.info(JSON.stringify(r))).catch(e=>{console.error(/^QA_[A-Z_]+$/.test(e?.message)?e.message:'QA_INITIALIZER_REFUSED_NO_DETAILS');process.exitCode=1;}).finally(closeDatabase);
