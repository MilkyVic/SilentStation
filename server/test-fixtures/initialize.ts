import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { database, closeDatabase } from '../database.js';
import { secretValue } from '../runtime-config.js';
import { DEFINITION, DEFINITION_VERSION, SCORE_VERSION, CONSENT_VERSION } from '../../shared/surveys/contracts.js';
import { CORE_TEMPLATES } from './catalog.js';
import { SYSTEM_TEMPLATE_QUESTIONS } from '../test-question-bank.js';
export async function initializeFixtures() {
    const snapshot=process.env.SS_SNAPSHOT_ID;
    if (!snapshot || !/^[a-f0-9]{12}$/.test(snapshot) || process.env.ACCEPTANCE_CONFIRM!==snapshot || process.env.SURVEY_REAL_COLLECTION_ENABLED!=='false') throw new Error('Acceptance fixture confirmation required.');
    const url=new URL(secretValue('DATABASE_URL')!);
    if(url.hostname!=='db'||url.pathname!==`/ss_test_${snapshot}`) throw new Error('Fixture initializer only supports its NEW Compose database.');
    const client=await database().connect();
    try {
        await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:fixtures'))");
        const exists=await client.query("SELECT to_regclass('acceptance_identity') AS present");
        if(exists.rows[0].present) throw new Error('Fixtures already initialized; never overwrite.');
        for(const table of ['auth_users','auth_sessions','test_templates','test_attempts','survey_campaigns','survey_sessions','survey_responses','survey_definitions']) if((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rows.length) throw new Error('Nonempty database; fixtures refused.');
        await client.query('CREATE TABLE acceptance_identity(snapshot TEXT PRIMARY KEY)');await client.query('INSERT INTO acceptance_identity VALUES($1)',[snapshot]);
        const credentials:any[]=[];
        for(const [username,role,school] of [['student','student','School A'],['teacher','teacher','School A'],['admin','admin','School A'],['superadmin','superadmin','School A'],['admin-b','admin','School B']]){
            const password=crypto.randomBytes(24).toString('base64url'),salt=crypto.randomBytes(16).toString('hex');
            const hash=`scrypt$${salt}$${crypto.scryptSync(password,salt,64).toString('hex')}`;
            await client.query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_name,profile_email,profile_school,profile_class_name,profile_teacher_type) VALUES($1,$1,$2,$3,'active',$1,$4,$5,'12A1',$6)",[username,hash,role,`${username}@acceptance.invalid`,school,role==='teacher'?'homeroom':'']);
            credentials.push({username,password,role,school});
        }
        for(const t of CORE_TEMPLATES){
            await client.query('INSERT INTO test_templates(id,title,description,target_audience,template_code,is_system,is_active,display_order) VALUES($1,$2,$3,$4,$5,TRUE,TRUE,$6)',[t.id,t.title,t.description,t.targetAudience,t.templateCode,t.displayOrder]);
            for(const q of SYSTEM_TEMPLATE_QUESTIONS[t.id]??[]){const id=`${t.id}-q${q.order}`;await client.query('INSERT INTO test_questions(id,template_id,question_order,content,subscale,is_reverse) VALUES($1,$2,$3,$4,$5,$6)',[id,t.id,q.order,q.text,q.subscale??'',!!q.isReverse]);for(const o of q.options)await client.query('INSERT INTO test_options(id,question_id,option_order,label,score) VALUES($1,$2,$3,$4,$5)',[`${id}-o${o.order}`,id,o.order,o.label,o.score]);}
        }
        await client.query('INSERT INTO survey_definitions(version,definition,score_version) VALUES($1,$2::jsonb,$3)',[DEFINITION_VERSION,JSON.stringify(DEFINITION),SCORE_VERSION]);
        for(const [code,school] of [['TESTA','School A'],['TESTB','School B']]) await client.query("INSERT INTO survey_campaigns(id,code,title,school,status,is_demo,definition_version,consent_version,created_by,retention_days) VALUES($1,$2,'TEST — KHÔNG NHẬP DỮ LIỆU THẬT',$3,'open',TRUE,$4,$5,'superadmin',1)",[crypto.randomUUID(),code,school,DEFINITION_VERSION,CONSENT_VERSION]);
        // Credentials are private operator material, never stdout or evidence. A staged file is renamed only after commit.
        const output=process.env.ACCEPTANCE_CREDENTIAL_FILE||'/private-operator/accounts.json';
        await fs.writeFile(output+'.pending',JSON.stringify(credentials),{mode:0o600});await fs.chown(output+'.pending',1000,1000);await client.query('COMMIT');await fs.rename(output+'.pending',output);
    }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
initializeFixtures().then(()=>console.info('Acceptance fixtures initialized; credentials are in private operator volume.')).catch(()=>{console.error('Fixture initialization refused/failed.');process.exitCode=1;}).finally(closeDatabase);
