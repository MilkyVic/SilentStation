import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import { database, closeDatabase } from '../database.js';
import { secretValue } from '../runtime-config.js';
import { DEFINITION, DEFINITION_VERSION, SCORE_VERSION, CONSENT_VERSION } from '../../shared/surveys/contracts.js';
import {generateInvitationCode} from '../surveys/invitations.js';
import {seedOrganizationFixtures} from './organizations.js';
import {seedCoreTestFixtures} from './core-tests.js';
export async function initializeFixtures() {
    const snapshot=process.env.SS_SNAPSHOT_ID;
    if (!snapshot || !/^[a-f0-9]{12}$/.test(snapshot) || process.env.NATIVE_ACCEPTANCE_CONFIRM!==snapshot || process.env.SURVEY_REAL_COLLECTION_ENABLED!=='false') throw new Error('Acceptance fixture confirmation required.');
    const url=new URL(secretValue('DATABASE_URL')!);
    if(!['127.0.0.1','localhost'].includes(url.hostname)||url.username!=='ss_test'||url.pathname!==`/ss_test_${snapshot}`||process.env.SS_NATIVE_FIXTURE_CONFIRM!=='new-empty-owned') throw new Error('Fixture initializer requires a NEW explicitly owned loopback database.');
    const client=await database().connect();
    try {
        await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:fixtures'))");
        const exists=await client.query("SELECT to_regclass('acceptance_identity') AS present");
        if(exists.rows[0].present) throw new Error('Fixtures already initialized; never overwrite.');
        for(const table of ['auth_users','auth_sessions','test_templates','test_attempts','survey_campaigns','survey_sessions','survey_responses','survey_definitions']) if((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new Error('Nonempty database; fixtures refused.');
        await client.query('CREATE TABLE acceptance_identity(snapshot TEXT PRIMARY KEY)');await client.query('INSERT INTO acceptance_identity VALUES($1)',[snapshot]);
        const credentials:any[]=[];
        for(const [username,role,school] of [['student','student','School A'],['teacher','teacher','School A'],['teacher-subject','teacher','School A'],['admin','admin','School A'],['superadmin','superadmin','School A'],['admin-b','admin','School B']]){
            const password=crypto.randomBytes(24).toString('base64url'),salt=crypto.randomBytes(16).toString('hex');
            const hash=`scrypt$${salt}$${crypto.scryptSync(password,salt,64).toString('hex')}`;
            await client.query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_name,profile_email,profile_school,profile_class_name,profile_teacher_type) VALUES($1,$1,$2,$3,'active',$1,$4,$5,'12A1',$6)",[username,hash,role,`${username}@acceptance.invalid`,school,username==='teacher'?'homeroom':role==='teacher'?'subject':'']);
            credentials.push({username,password,role,school});
        }
        await seedOrganizationFixtures(client);await seedCoreTestFixtures(client);
        await client.query('INSERT INTO survey_definitions(version,definition,score_version) VALUES($1,$2::jsonb,$3)',[DEFINITION_VERSION,JSON.stringify(DEFINITION),SCORE_VERSION]);
        for(const [code,school] of [['TESTA','School A'],['TESTB','School B']]) await client.query("INSERT INTO survey_campaigns(id,code,title,school,status,is_demo,definition_version,consent_version,created_by,retention_days) VALUES($1,$2,'TEST — KHÔNG NHẬP DỮ LIỆU THẬT',$3,'open',TRUE,$4,$5,'superadmin',1)",[crypto.randomUUID(),code,school,DEFINITION_VERSION,CONSENT_VERSION]);
        for(const c of (await client.query('SELECT id FROM survey_campaigns')).rows)await client.query("INSERT INTO survey_invitations(id,campaign_id,issued_by,code,expires_at) VALUES($1,$2,'superadmin',$3,NOW()+INTERVAL '7 days')",[crypto.randomUUID(),c.id,generateInvitationCode()]);
        // Credentials are private operator material, never stdout or evidence. A staged file is renamed only after commit.
        const output=process.env.ACCEPTANCE_CREDENTIAL_FILE;if(!output||!path.isAbsolute(output))throw Error('Private absolute operator credential path required.');
        await fs.writeFile(output+'.pending',JSON.stringify(credentials),{mode:0o600});await client.query("UPDATE survey_campaigns SET school_id=CASE WHEN school='School A' THEN 'school-a' ELSE 'school-b' END");await client.query('COMMIT');await fs.rename(output+'.pending',output);
    }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)initializeFixtures().then(()=>console.info('Native acceptance fixtures initialized; private credentials are not evidence.')).catch(()=>{console.error('Fixture initialization refused/failed.');process.exitCode=1;}).finally(closeDatabase);
