import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import { database, closeDatabase } from '../database.js';
import { audit, revoke } from './common.js';
export async function applyOrganizationMapping(plan: any, commit = false) {
    if (!plan || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(plan.operationId) || !Array.isArray(plan.users) || !Array.isArray(plan.campaigns))
        throw Error('Explicit users/campaign mapping required.');
    const c = await database().connect();
    try {
        await c.query('BEGIN');
        await c.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:account-writes'))");
        const digest=crypto.createHash('sha256').update(JSON.stringify(plan)).digest('hex');
        const receipt=(await c.query('SELECT * FROM deployment_receipts WHERE operation_id=$1',[plan.operationId])).rows[0];
        if(receipt){if(receipt.operation!=='organization-mapping'||receipt.digest!==digest)throw Error('Mapping receipt conflict.');await c.query('ROLLBACK');return {...receipt.response,committed:commit,replayed:true};}
        for(const school of plan.schools??[]){
            if(typeof school.id!=='string'||!school.id||typeof school.name!=='string'||!school.name.trim())throw Error('Explicit school identity required.');
            await c.query('INSERT INTO org_schools(id,name,address) VALUES($1,$2,$3)',[school.id,school.name,school.address??'']);
        }
        for(const cls of plan.classes??[]){
            if(typeof cls.id!=='string'||typeof cls.name!=='string'||!cls.name.trim()||typeof cls.academicYear!=='string'||!/^\d{4}-\d{4}$/.test(cls.academicYear)||+cls.academicYear.slice(5)!==+cls.academicYear.slice(0,4)+1)throw Error('Explicit reviewed class and year required.');
            await c.query('INSERT INTO org_classes(id,school_id,name,academic_year) VALUES($1,$2,$3,$4)',[cls.id,cls.schoolId,cls.name,cls.academicYear]);
        }
        for (const p of plan.users) {
            const u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [p.id])).rows[0], school = (await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active'", [p.schoolId])).rows[0], cls = p.classId ? (await c.query("SELECT * FROM org_classes WHERE id=$1 AND school_id=$2 AND status='active'", [p.classId, p.schoolId])).rows[0] : null;
            if (!u || u.school_id || u.revision !== p.expectedRevision || u.profile_school !== p.oldSchool || u.profile_class_name !== p.oldClassName || !school || p.classId && !cls)
                throw Error('Mapping conflict or incomplete evidence; no inference performed.');
            if(u.role==='teacher'&&!['homeroom','subject'].includes(p.teacherType))throw Error('Explicit teacher type required.');
            if(['admin','superadmin'].includes(u.role)&&cls)throw Error('Admin cannot have a classroom.');
            const pending = u.role === 'teacher' && u.status !== 'active';
            if(pending&&p.classId)throw Error('Unapproved teacher cannot claim a current class.');
            if(p.deferClassAssignment!==undefined&&typeof p.deferClassAssignment!=='boolean'||p.deferClassAssignment&&p.classId)throw Error('Deferred class assignment must be explicit and have no class.');
            const requestedHome = u.role === 'teacher' && !pending && p.teacherType === 'homeroom';
            if (requestedHome && !cls && !p.deferClassAssignment)
                throw Error('GVCN requires an explicitly identified year/class.');
            const home = requestedHome && !!cls;
            await c.query('UPDATE auth_users SET school_id=$2,class_id=$3,profile_school=$4,profile_class_name=$5,profile_teacher_type=$6,revision=revision+1,credential_version=credential_version+1 WHERE id=$1', [u.id, school.id, cls?.id ?? null, school.name, cls?.name ?? (p.deferClassAssignment ? u.profile_class_name : ''), u.role === 'teacher' ? p.teacherType : '']);
            if(u.status==='active')await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id,homeroom) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), u.id, school.id, cls?.id ?? null, home]);
            await revoke(c, u.id, true,null);
            await audit(c, null, u.id, 'explicit_organization_mapping', crypto.randomUUID(), ['schoolId', 'classId']);
        }
        for (const p of plan.campaigns) {
            const row = (await c.query('SELECT * FROM survey_campaigns WHERE id=$1 FOR UPDATE', [p.id])).rows[0], school = (await c.query('SELECT * FROM org_schools WHERE id=$1', [p.schoolId])).rows[0];
            if (!row || row.school_id || row.school !== p.oldSchool || row.status === 'open' || !school)
                throw Error('Close and explicitly verify campaign before mapping.');
            await c.query('UPDATE survey_campaigns SET school_id=$2 WHERE id=$1', [p.id, p.schoolId]);
            await audit(c, null, p.id, 'explicit_campaign_mapping', crypto.randomUUID(), ['schoolId']);
        }
        const response={ok:true,users:plan.users.length,campaigns:plan.campaigns.length};
        await c.query('INSERT INTO deployment_receipts(operation_id,operation,digest,response) VALUES($1,\'organization-mapping\',$2,$3::jsonb)',[plan.operationId,digest,JSON.stringify(response)]);
        await c.query(commit ? 'COMMIT' : 'ROLLBACK');
        return {...response,committed:commit,replayed:false};
    }
    catch (e) {
        await c.query('ROLLBACK');
        throw e;
    }
    finally {
        c.release();
    }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    const file = process.argv[2];
    if (!file)
        throw Error('Provide a private, reviewed mapping JSON. Default is dry run.');
    applyOrganizationMapping(JSON.parse(await fs.readFile(file, 'utf8')), process.env.ACCOUNT_MAPPING_CONFIRM === 'yes').then(r => console.info(JSON.stringify(r))).catch(() => { console.error('Explicit mapping refused; no changes committed.'); process.exitCode = 1; }).finally(closeDatabase);
}
