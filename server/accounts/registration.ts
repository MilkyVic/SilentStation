import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
import { fail } from './common.js';
// Caller uses the registration transaction; labels never grant authority to a student.
export async function registrationContext(c: PoolClient, account: any, code?: any) {
    if (process.env.ACCOUNT_MANAGEMENT_ENABLED !== 'true')
        return;
    let school: any, cls: any;
    if (account.role === 'student') {
        if (!code?.school_id || !code?.class_id)
            fail(400, 'ACCOUNT_CLASS_MAPPING_REQUIRED', 'Mã lớp cũ chưa có niên khóa/phân công được đối chiếu.');
        school = (await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active'", [code.school_id])).rows[0];
        cls = (await c.query("SELECT * FROM org_classes WHERE id=$1 AND school_id=$2 AND status='active'", [code.class_id, code.school_id])).rows[0];
        const teacher = (await c.query("SELECT 1 FROM auth_users WHERE id=$1 AND status='active' AND school_id=$2 AND class_id=$3 AND profile_teacher_type='homeroom'", [code.teacher_id, code.school_id, code.class_id])).rows[0];
        if (!school || !cls || !teacher)
            fail(400, 'ACCOUNT_CLASS_MAPPING_REQUIRED', 'Phân công của mã lớp không còn hiệu lực.');
    }
    else {
        const rows = (await c.query("SELECT * FROM org_schools WHERE name=$1 AND status='active' AND NOT is_qa", [account.profile.school])).rows;
        if (rows.length !== 1)
            fail(400, 'ACCOUNT_SCHOOL_MAPPING_REQUIRED', 'Chọn trường đã được quản trị tạo; tên trường chưa rõ phải đối chiếu.');
        school = rows[0];
    }
    await c.query('UPDATE auth_users SET school_id=$2,class_id=$3,profile_class_name=$4,profile_school=$5,email_verified_at=NOW() WHERE id=$1', [account.id, school.id, cls?.id ?? null, cls?.name ?? '',school.name]);
    if(account.status==='active') await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id) VALUES($1,$2,$3,$4)', [crypto.randomUUID(), account.id, school.id, cls?.id ?? null]);
    account.profile.school=school.name;account.profile.schoolId = school.id;
    account.profile.classId = cls?.id ?? null;
    account.profile.className = cls?.name ?? '';
    account.profile.emailVerified = true;
}
