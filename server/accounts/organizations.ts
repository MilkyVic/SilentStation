import {canSuspendSuperadmin} from '../qa-policy.js';
import crypto from 'node:crypto';
import { database } from '../database.js';
import type { PoolClient } from 'pg';
import { actor, controlKeys, dto, fail, fields, manage, manageSchool, mutation, profile, reauth, revision, revoke, text, updateProfile, userSql } from './common.js';
export async function schoolList(req: any) { const a = await actor(req); if (!['admin', 'superadmin', 'teacher'].includes(a.role))
    fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền xem danh mục quản trị.'); const r = await database().query('SELECT * FROM org_schools WHERE ($1=\'superadmin\' OR id=$2) ORDER BY name,id', [a.role, a.school_id]); return { ok: true, schools: r.rows }; }
export async function schoolWrite(req: any, id: string | undefined, b: any) { fields(b, [...controlKeys, 'name', 'address', 'status']); return mutation(req, id ? 'school-update' : 'school-create', id ?? 'new-school', b, async (c, a) => { manageSchool(a, id ?? '', true); let row: any; if (id) {
    row = (await c.query('SELECT * FROM org_schools WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!row)
        fail(404, 'ACCOUNT_NOT_FOUND', 'Không có trường.');
    revision(b, row);
} const name = b.name === undefined ? row?.name : text(b.name, 'Tên trường', 200, true), address = b.address === undefined ? row?.address ?? '' : text(b.address, 'Địa chỉ', 500), status = b.status ?? row?.status ?? 'active'; if (!['active', 'archived'].includes(status))
    fail(400, 'ACCOUNT_INVALID', 'Trạng thái không hợp lệ.'); if (status === 'archived') {
    const inUse = (await c.query("SELECT 1 FROM auth_users WHERE school_id=$1 AND status IN ('active','pending') UNION ALL SELECT 1 FROM org_classes WHERE school_id=$1 AND status='active' UNION ALL SELECT 1 FROM survey_campaigns WHERE school_id=$1 AND status='open' LIMIT 1", [id])).rows.length;
    if (inUse)
        fail(409, 'ACCOUNT_IN_USE', 'Trường còn tài khoản, lớp hoặc đợt khảo sát đang hoạt động.');
} const sid = id ?? crypto.randomUUID(); row = id ? (await c.query('UPDATE org_schools SET name=$2,address=$3,status=$4,revision=revision+1 WHERE id=$1 RETURNING *', [sid, name, address, status])).rows[0] : (await c.query('INSERT INTO org_schools(id,name,address,status,is_qa) VALUES($1,$2,$3,$4,$5) RETURNING *', [sid, name, address, status,!!a.is_qa])).rows[0]; await c.query('UPDATE auth_users SET profile_school=$2 WHERE school_id=$1', [sid, name]); return { ok: true, school: row }; }); }
export async function classList(req: any, q: any = {}) { const a = await actor(req); if (!['superadmin', 'admin', 'teacher'].includes(a.role))
    fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền quản lý lớp.'); if (q.schoolId)
    manageSchool(a, String(q.schoolId)); const rows = await database().query(`SELECT c.*,u.id AS homeroom_teacher_id,u.profile_name AS homeroom_teacher_name,(SELECT COUNT(*)::int FROM auth_users s WHERE s.class_id=c.id AND s.role='student' AND s.status='active') AS student_count FROM org_classes c LEFT JOIN org_assignments x ON x.class_id=c.id AND x.homeroom AND x.ended_at IS NULL LEFT JOIN auth_users u ON u.id=x.user_id WHERE ($1='superadmin' OR c.school_id=$2) AND ($3='' OR c.school_id=$3) AND ($1<>'teacher' OR c.id=$4 AND $5='homeroom') ORDER BY c.academic_year DESC,c.name,c.id`, [a.role, a.school_id, String(q.schoolId ?? ''), a.class_id, a.profile_teacher_type]); return { ok: true, classes: rows.rows.map(r => ({ id: r.id, schoolId: r.school_id, name: r.name, academicYear: r.academic_year, status: r.status, revision: r.revision, homeroomTeacherId: r.homeroom_teacher_id, homeroomTeacherName: r.homeroom_teacher_name, studentCount: r.student_count })) }; }
export async function classWrite(req: any, id: string | undefined, b: any) { fields(b, [...controlKeys, 'schoolId', 'name', 'academicYear', 'status']); return mutation(req, id ? 'class-update' : 'class-create', id ?? 'new-class', b, async (c, a) => { let row: any; if (id) {
    row = (await c.query('SELECT * FROM org_classes WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!row)
        fail(404, 'ACCOUNT_NOT_FOUND', 'Không có lớp.');
    revision(b, row);
    if (b.schoolId && b.schoolId !== row.school_id)
        fail(400, 'ACCOUNT_INVALID', 'Không chuyển lớp sang trường khác.');
} const schoolId = row?.school_id ?? b.schoolId; manageSchool(a, schoolId); const school = (await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active' FOR SHARE", [schoolId])).rows[0]; if (!school)
    fail(400, 'ACCOUNT_INVALID', 'Trường không hoạt động.'); const name = b.name === undefined ? row?.name : text(b.name, 'Tên lớp', 80, true), year = b.academicYear ?? row?.academic_year; if (typeof year !== 'string' || !/^\d{4}-\d{4}$/.test(year) || +year.slice(5) !== +year.slice(0, 4) + 1)
    fail(400, 'ACCOUNT_INVALID', 'Niên khóa cần dạng 2026-2027; không tự suy từ ngày hiện tại.'); const status = b.status ?? row?.status ?? 'active'; if (!['active', 'archived'].includes(status))
    fail(400, 'ACCOUNT_INVALID', 'Trạng thái không hợp lệ.'); const members = (await c.query("SELECT 1 FROM auth_users WHERE class_id=$1 AND status IN ('active','pending') LIMIT 1", [id])).rows.length; if (row && row.academic_year !== year && members)
    fail(409, 'ACCOUNT_IN_USE', 'Tạo lớp niên khóa mới; không đổi niên khóa lớp đã có thành viên.'); if (status === 'archived' && members)
    fail(409, 'ACCOUNT_IN_USE', 'Chuyển/vô hiệu hóa thành viên trước khi lưu trữ lớp.'); const cid = id ?? crypto.randomUUID(); row = id ? (await c.query('UPDATE org_classes SET name=$2,academic_year=$3,status=$4,revision=revision+1 WHERE id=$1 RETURNING *', [cid, name, year, status])).rows[0] : (await c.query('INSERT INTO org_classes(id,school_id,name,academic_year,status) VALUES($1,$2,$3,$4,$5) RETURNING *', [cid, schoolId, name, year, status])).rows[0]; await c.query('UPDATE auth_users SET profile_class_name=$2 WHERE class_id=$1', [cid, name]); if (status === 'archived')
    await c.query("UPDATE class_join_codes SET status='revoked',revoked_at=NOW() WHERE class_id=$1 AND status='active'", [cid]); return { ok: true, class: row }; }); }
export async function usersList(req: any, q: any = {}) { const a = await actor(req); if (!['admin', 'superadmin', 'teacher'].includes(a.role))
    fail(403, 'ACCOUNT_FORBIDDEN', 'Không có quyền xem tài khoản khác.'); if (a.role === 'teacher' && (a.profile_teacher_type !== 'homeroom' || !a.class_id))
    fail(403, 'ACCOUNT_FORBIDDEN', 'Chỉ GVCN được xem danh sách tối thiểu của lớp.'); const params: any[] = []; const where: string[] = ['TRUE']; const bind = (v: any) => { params.push(v); return '$' + params.length; }; if (a.role !== 'superadmin')
    where.push('u.school_id=' + bind(a.school_id)); if (a.role === 'teacher')
    where.push("u.role='student' AND u.class_id=" + bind(a.class_id));
else if (a.role === 'admin')
    where.push("u.role IN ('student','teacher')"); if (q.schoolId) {
    manageSchool(a, q.schoolId);
    where.push('u.school_id=' + bind(q.schoolId));
} if (q.classId)
    where.push('u.class_id=' + bind(q.classId)); if (q.role) {
    if (!['student', 'teacher', 'admin'].includes(q.role))
        fail(400, 'ACCOUNT_INVALID', 'Role filter không hợp lệ.');
    where.push('u.role=' + bind(q.role));
} if (q.q)
    where.push('STRPOS(LOWER(u.profile_name||\' \'||u.username),LOWER(' + bind(text(q.q, 'Tìm kiếm', 100)) + '))>0'); const total = (await database().query(`SELECT COUNT(*)::int AS n FROM auth_users u WHERE ${where.join(' AND ')}`, params)).rows[0].n; if (q.cursor)
    where.push('u.id>' + bind(text(q.cursor, 'Cursor', 100))); const limit = Math.min(100, Math.max(1, Number(q.limit) || 50)), rows = (await database().query(`${userSql} WHERE ${where.join(' AND ')} ORDER BY u.id LIMIT ${limit + 1}`, params)).rows; const data = rows.slice(0, limit).map(u => a.role === 'teacher' ? { id: u.id, name: u.profile_name, username: u.username, classId: u.class_id, status: u.status } : dto(u, a)); return { ok: true, users: data, total, nextCursor: rows.length > limit ? rows[limit - 1].id : null }; }
export async function userDetail(req: any, id: string) { const a = await actor(req), u = (await database().query(userSql + ' WHERE u.id=$1', [id])).rows[0]; if (!u)
    fail(404, 'ACCOUNT_NOT_FOUND', 'Không có tài khoản.'); if (id !== a.id)
    manage(a, u); return { ok: true, user: dto(u, a) }; }
export async function userProfile(req: any, id: string, b: any, self = false) { fields(b, [...controlKeys, 'name', 'phone', 'birthYear', 'gender', 'bio', 'avatarKey', 'subject']); const p = profile(b); if (self && !b.expectedUserId)
    fail(400, 'ACCOUNT_REFRESH_REQUIRED', 'Cần định danh tài khoản đang sửa.'); return mutation(req, self ? 'self-profile' : 'managed-profile', id, b, async (c, a) => { const uid = self ? a.id : id, u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [uid])).rows[0]; if (!u)
    fail(404, 'ACCOUNT_NOT_FOUND', 'Không có tài khoản.'); if (!self)
    manage(a, u); revision(b, u); if (Object.hasOwn(p, 'subject') && u.role !== 'teacher')
    fail(400, 'ACCOUNT_INVALID', 'Môn giảng dạy chỉ dành cho giáo viên.'); return { ok: true, user: dto(await updateProfile(c, uid, p), a) }; }); }
export async function userStatus(req: any, id: string, b: any, self = false) { fields(b, [...controlKeys, 'status']); if (self && !b.expectedUserId)
    fail(400, 'ACCOUNT_REFRESH_REQUIRED', 'Cần định danh tài khoản đang sửa.'); return mutation(req, 'account-status', id, b, async (c, a) => { const uid = self ? a.id : id, u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [uid])).rows[0]; if (!u)
    fail(404, 'ACCOUNT_NOT_FOUND', 'Không có tài khoản.'); if (!self)
    manage(a, u); revision(b, u); await reauth(c, a, b, self ? 'deactivate' : 'status', uid); const status = self ? 'suspended' : b.status; if (!['active', 'suspended'].includes(status))
    fail(400, 'ACCOUNT_INVALID', 'Trạng thái không hợp lệ.'); if (status === u.status)
    fail(409, 'ACCOUNT_CONFLICT', 'Tài khoản đã ở trạng thái này.'); if (status === 'active' && (u.disabled_from_status !== 'active' || u.activation_pending))
    fail(409, 'ACCOUNT_REVIEW_REQUIRED', 'Không tự phê duyệt/kích hoạt tài khoản chưa được duyệt.'); if (status === 'suspended' && u.role === 'superadmin') { const n=(await c.query("SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE NOT is_qa)::int AS live FROM auth_users WHERE role='superadmin' AND status='active'")).rows[0]; if(!canSuspendSuperadmin(u.is_qa,n.total,n.live)) fail(409, 'ACCOUNT_LAST_SUPERADMIN', 'Không vô hiệu hóa Superadmin cuối cùng hoặc Superadmin vận hành cuối cùng.'); } if(status==='active'&&u.school_id){const school=(await c.query("SELECT 1 FROM org_schools WHERE id=$1 AND status='active'",[u.school_id])).rows[0];const classroom=u.class_id?(await c.query("SELECT 1 FROM org_classes WHERE id=$1 AND school_id=$2 AND status='active'",[u.class_id,u.school_id])).rows[0]:true;if(!school||!classroom)fail(409,'ACCOUNT_ASSIGNMENT_REQUIRED','Đơn vị đã lưu trữ; cần phân công hợp lệ trước khi khôi phục.');if(u.profile_teacher_type==='homeroom'&&(await c.query('SELECT 1 FROM org_assignments WHERE class_id=$1 AND homeroom AND ended_at IS NULL AND user_id<>$2',[u.class_id,u.id])).rows.length)fail(409,'ACCOUNT_ASSIGNMENT_REQUIRED','Lớp đã có GVCN khác; cần phân công lại.');}
        await c.query('UPDATE org_assignments SET ended_at=NOW() WHERE user_id=$1 AND ended_at IS NULL',[uid]);if(status==='active'&&u.school_id)await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id,homeroom) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),uid,u.school_id,u.class_id,u.role==='teacher'&&u.profile_teacher_type==='homeroom']);
        await c.query("UPDATE auth_users SET disabled_from_status=CASE WHEN $2='suspended' THEN status ELSE NULL END,disabled_at=CASE WHEN $2='suspended' THEN NOW() ELSE NULL END,status=$2,credential_version=credential_version+1,revision=revision+1,updated_at=NOW() WHERE id=$1", [uid, status]); await revoke(c, uid, true,a.id); const r = (await c.query('SELECT * FROM auth_users WHERE id=$1', [uid])).rows[0]; return { ok: true, user: dto(r, a), loginRequired: self }; }); }
export async function assign(c: PoolClient, a: any, u: any, b: any) { const school = (await c.query("SELECT * FROM org_schools WHERE id=$1 AND status='active' FOR SHARE", [b.schoolId])).rows[0]; if (!school)
    fail(400, 'ACCOUNT_INVALID', 'Trường không hoạt động.'); manageSchool(a, school.id); let cls: any; if (b.classId) {
    cls = (await c.query("SELECT * FROM org_classes WHERE id=$1 AND school_id=$2 AND status='active' FOR SHARE", [b.classId, school.id])).rows[0];
    if (!cls)
        fail(400, 'ACCOUNT_INVALID', 'Lớp không thuộc trường/không hoạt động.');
} const type = u.role === 'teacher' ? b.teacherType ?? u.profile_teacher_type : ''; if (u.role === 'teacher' && !['homeroom', 'subject'].includes(type) || type === 'homeroom' && !cls)
    fail(400, 'ACCOUNT_INVALID', 'GVCN cần lớp hợp lệ.'); if (['admin', 'superadmin'].includes(u.role) && cls)
    fail(400, 'ACCOUNT_INVALID', 'Không phân Admin vào lớp học.'); if (type === 'homeroom') {
    const other = (await c.query('SELECT 1 FROM org_assignments WHERE class_id=$1 AND homeroom AND ended_at IS NULL AND user_id<>$2', [cls.id, u.id])).rows.length;
    if (other)
        fail(409, 'ACCOUNT_CONFLICT', 'Lớp đã có GVCN; kết thúc phân công cũ trước.');
} await c.query('UPDATE org_assignments SET ended_at=NOW() WHERE user_id=$1 AND ended_at IS NULL', [u.id]); await c.query('INSERT INTO org_assignments(id,user_id,school_id,class_id,homeroom) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), u.id, school.id, cls?.id ?? null, type === 'homeroom']); await c.query('UPDATE auth_users SET school_id=$2,class_id=$3,profile_school=$4,profile_class_name=$5,profile_teacher_type=$6,credential_version=credential_version+1,revision=revision+1,updated_at=NOW() WHERE id=$1', [u.id, school.id, cls?.id ?? null, school.name, cls?.name ?? '', type]); await revoke(c, u.id, true,a.id); }
export async function assignment(req: any, id: string, b: any) { fields(b, [...controlKeys, 'schoolId', 'classId', 'teacherType']); return mutation(req, 'assignment', id, b, async (c, a) => { const u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [id])).rows[0]; if (!u)
    fail(404, 'ACCOUNT_NOT_FOUND', 'Không có tài khoản.'); manage(a, u); revision(b, u); await reauth(c, a, b, 'assignment', id); await assign(c, a, u, b); return { ok: true, user: dto((await c.query('SELECT * FROM auth_users WHERE id=$1', [id])).rows[0], a) }; }); }
export async function reviewTeacher(req: any, id: string, b: any, approve: boolean) { fields(b, [...controlKeys, 'schoolId', 'classId', 'teacherType']); return mutation(req, approve ? 'teacher-approve' : 'teacher-reject', id, b, async (c, a) => { const u = (await c.query('SELECT * FROM auth_users WHERE id=$1 FOR UPDATE', [id])).rows[0]; if (!u)
    fail(404, 'ACCOUNT_NOT_FOUND', 'Không có tài khoản.'); manage(a, u); revision(b, u); if (u.role !== 'teacher' || u.status !== 'pending')
    fail(409, 'ACCOUNT_REVIEW_REQUIRED', 'Chỉ xét duyệt giáo viên đang chờ.'); if (approve) {
    await assign(c, a, u, { schoolId: b.schoolId ?? u.school_id, classId: b.classId ?? null, teacherType: b.teacherType ?? 'subject' });
    await c.query("UPDATE auth_users SET status='active' WHERE id=$1", [id]);
}
else {
    await c.query("UPDATE auth_users SET status='suspended',disabled_from_status=NULL,disabled_at=NOW(),revision=revision+1,credential_version=credential_version+1 WHERE id=$1", [id]);
    await revoke(c, id, true,a.id);
} return { ok: true, user: dto((await c.query('SELECT * FROM auth_users WHERE id=$1', [id])).rows[0], a) }; }); }
