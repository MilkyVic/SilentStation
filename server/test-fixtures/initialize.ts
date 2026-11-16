import {populateOwnedFixtures} from './populate.js';
import 'dotenv/config';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import { database, closeDatabase } from '../database.js';
import { secretValue } from '../runtime-config.js';
export async function initializeFixtures() {
    const snapshot=process.env.SS_SNAPSHOT_ID;
    if (!snapshot || !/^[a-f0-9]{12}$/.test(snapshot) || process.env.NATIVE_ACCEPTANCE_CONFIRM!==snapshot || process.env.SURVEY_REAL_COLLECTION_ENABLED!=='false') throw new Error('Acceptance fixture confirmation required.');
    const url=new URL(secretValue('DATABASE_URL')!);
    if(!['127.0.0.1','localhost'].includes(url.hostname)||url.username!=='ss_test'||url.pathname!==`/ss_test_${snapshot}`||process.env.SS_NATIVE_FIXTURE_CONFIRM!=='new-empty-owned') throw new Error('Fixture initializer requires a NEW explicitly owned loopback database.');
    await populateOwnedFixtures(database(),snapshot,process.env.ACCEPTANCE_CREDENTIAL_FILE!);
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)initializeFixtures().then(()=>console.info('Native acceptance fixtures initialized; private credentials are not evidence.')).catch(()=>{console.error('Fixture initialization refused/failed.');process.exitCode=1;}).finally(closeDatabase);
