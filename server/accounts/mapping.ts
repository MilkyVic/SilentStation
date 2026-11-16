import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import { database, closeDatabase } from '../database.js';
import { audit, revoke } from './common.js';
export async function applyOrganizationMapping(plan: any, commit = false) {
    if (!plan || !Array.isArray(plan.users) || !Array.isArray(plan.campaigns))
        throw Error('Explicit users/campaign mapping required.');
    const c = await database().connect();
    try {
        await c.query('BEGIN');
        await c.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:account-writes'))");
        for (const p of plan.users) {
            const u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [p.id])).rows[0], school = (await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active'", [p.schoolId])).rows[0], cls = p.classId ? (await c.query("SELECT * FROM org_classes WHERE id=$1 AND school_id=$2 AND status='active'", [p.classId, p.schoolId])).rows[0] : null;
            if (!u || u.school_id || u.revision !== p.expectedRevision || u.profile_school !== p.oldSchool || u.profile_class_name !== p.oldClassName || !school || p.classId && !cls)
                throw Error('Mapping conflict or incomplete evidence; no inference performed.');
            const home = u.role === 'teacher' && p.teacherType === 'homeroom';
            if (home && !cls)
                throw Error('GVCN requires an explicitly identified year/class.');
            await c.query('UPDATE auth_users SET school_id=$2,class_id=$3,profile_school=$4,profile_class_name=$5,profile_teacher_type=$6,revision=revision+1,credential_version=credential_version+1 WHERE id=$1', [u.id, school.id, cls?.id ?? null, school.name, cls?.name ?? '', u.role === 'teacher' ? p.teacherType : '']);
            await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id,homeroom) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), u.id, school.id, cls?.id ?? null, home]);
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
        await c.query(commit ? 'COMMIT' : 'ROLLBACK');
        return { ok: true, committed: commit, users: plan.users.length, campaigns: plan.campaigns.length };
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
