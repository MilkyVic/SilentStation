import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
// Explicit synthetic fixture declaration, never inferred from the runtime date or existing DB.
export async function seedOrganizationFixtures(c: PoolClient) { if ((await c.query('SELECT 1 FROM org_schools LIMIT 1')).rows.length)
    throw Error('Organization fixtures already exist; never overwrite.'); for (const school of ['School A', 'School B']) {
    const id = school === 'School A' ? 'school-a' : 'school-b', cls = id + '-12a1';
    await c.query('INSERT INTO org_schools(id,name) VALUES($1,$2)', [id, school]);
    await c.query("INSERT INTO org_classes(id,school_id,name,academic_year) VALUES($1,$2,'12A1','2026-2027')", [cls, id]);
    const users = (await c.query('SELECT * FROM auth_users WHERE profile_school=$1', [school])).rows;
    for (const u of users) {
        const classroom = ['student', 'teacher'].includes(u.role) && u.status==='active' ? cls : null;
        await c.query("UPDATE auth_users SET school_id=$2,class_id=$3,profile_class_name=CASE WHEN $3::text IS NULL THEN '' ELSE '12A1' END,email_verified_at=NOW() WHERE id=$1", [u.id, id, classroom]);
        if(u.status==='active')await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id,homeroom) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), u.id, id, classroom, u.role === 'teacher' && u.profile_teacher_type === 'homeroom']);
    }
} }
