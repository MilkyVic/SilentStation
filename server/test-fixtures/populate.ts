import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {Pool} from 'pg';
import {migrationDefinitions} from '../migrate.js';
import {DEFINITION,DEFINITION_VERSION,SCORE_VERSION,CONSENT_VERSION} from '../../shared/surveys/contracts.js';
import {generateInvitationCode} from '../surveys/invitations.js';
import {seedOrganizationFixtures} from './organizations.js';
import {seedCoreTestFixtures} from './core-tests.js';
export async function populateOwnedFixtures(pool:Pool,snapshot:string,output:string,qaAccounts=false){
 if(!/^[a-f0-9]{12}$/.test(snapshot)||!output||!path.isAbsolute(output))throw Error('Invalid private fixture destination.');
 for(const file of [output,output+'.pending']){try{await fs.lstat(file);throw Error('Private credential destination already exists.');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}
 const client=await pool.connect();try{
  await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:fixtures'))");
  const definitions=await migrationDefinitions(),ledger=(await client.query('SELECT name,checksum FROM schema_migrations')).rows;
  if(ledger.length!==definitions.length||definitions.some(d=>!ledger.some(l=>l.name===d.name&&l.checksum===d.checksum)))throw Error('Complete verified migration ledger required.');
        const exists=await client.query("SELECT to_regclass('acceptance_identity') AS present");
        if(exists.rows[0].present) throw new Error('Fixtures already initialized; never overwrite.');
        for(const {table_name:table} of (await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name<>'schema_migrations'")).rows) if((await client.query(`SELECT 1 FROM "${String(table).replaceAll('"','""')}" LIMIT 1`)).rows.length) throw new Error('Nonempty database; fixtures refused.');
        await client.query('CREATE TABLE acceptance_identity(snapshot TEXT PRIMARY KEY)');await client.query('INSERT INTO acceptance_identity VALUES($1)',[snapshot]);
        const credentials:any[]=[];
        for(const [username,role,school] of [['student','student','School A'],['teacher','teacher','School A'],['teacher-subject','teacher','School A'],['admin','admin','School A'],['superadmin','superadmin','School A'],['admin-b','admin','School B']]){
            const password=crypto.randomBytes(24).toString('base64url'),salt=crypto.randomBytes(16).toString('hex');
            const hash=`scrypt$${salt}$${crypto.scryptSync(password,salt,64).toString('hex')}`;
            await client.query("INSERT INTO auth_users(id,username,password_hash,role,status,profile_name,profile_email,profile_school,profile_class_name,profile_teacher_type,is_qa,qa_access_expires_at) VALUES($1,$1,$2,$3,'active',$1,$4,$5,'12A1',$6,$7,CASE WHEN $7 THEN NOW()+INTERVAL '30 days' ELSE NULL END)",[username,hash,role,`${username}@acceptance.invalid`,school,username==='teacher'?'homeroom':role==='teacher'?'subject':'',qaAccounts]);
            credentials.push({username,password,role,school});
        }
        await seedOrganizationFixtures(client);await seedCoreTestFixtures(client);
        await client.query('INSERT INTO survey_definitions(version,definition,score_version) VALUES($1,$2::jsonb,$3)',[DEFINITION_VERSION,JSON.stringify(DEFINITION),SCORE_VERSION]);
        for(const [code,school] of [['TESTA','School A'],['TESTB','School B']]) await client.query("INSERT INTO survey_campaigns(id,code,title,school,status,is_demo,definition_version,consent_version,created_by,retention_days) VALUES($1,$2,'TEST — KHÔNG NHẬP DỮ LIỆU THẬT',$3,'open',TRUE,$4,$5,'superadmin',1)",[crypto.randomUUID(),code,school,DEFINITION_VERSION,CONSENT_VERSION]);
        for(const c of (await client.query('SELECT id FROM survey_campaigns')).rows)await client.query("INSERT INTO survey_invitations(id,campaign_id,issued_by,code,expires_at) VALUES($1,$2,'superadmin',$3,NOW()+INTERVAL '7 days')",[crypto.randomUUID(),c.id,generateInvitationCode()]);
        // Credentials are private operator material, never stdout or evidence. A staged file is renamed only after commit.

        await fs.writeFile(output+'.pending',JSON.stringify(credentials),{mode:0o600,flag:'wx'});await client.query("UPDATE survey_campaigns SET school_id=CASE WHEN school='School A' THEN 'school-a' ELSE 'school-b' END");await client.query('COMMIT');await fs.rename(output+'.pending',output);
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
