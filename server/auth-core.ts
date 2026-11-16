// @ts-nocheck
import crypto from 'node:crypto';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import { databaseConfig, validateSessionSecret, validateRuntime, smtpConfig, secretValue } from './runtime-config.js';
import { registrationContext } from './accounts/registration.js';
import { password as validateNewPassword } from './accounts/common.js';
import { consumeRate, passwordAttempt } from './rate-limits.js';
export class AuthHttpError extends Error {
    statusCode;
    code;
    constructor(statusCode, code, message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
const normalizeUsername = (value) => value.trim().toLowerCase();
const DATABASE_URL = process.env.DATABASE_URL;
const AUTH_SESSION_SECRET = validateSessionSecret();
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS || 60 * 60 * 8);
const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_JOIN_CODE_TTL_MINUTES = Number(process.env.AUTH_JOIN_CODE_TTL_MINUTES || 10);
const DEFAULT_JOIN_CODE_MAX_USES = Number(process.env.AUTH_JOIN_CODE_MAX_USES || 60);
const MAX_JOIN_CODE_TTL_MINUTES = 60;
const MAX_JOIN_CODE_USES = 300;
const JOIN_CODE_LENGTH = 8;
const JOIN_CODE_GENERATE_ATTEMPTS = 12;
const AUTH_REGISTER_OTP_TTL_SECONDS = Number(process.env.AUTH_REGISTER_OTP_TTL_SECONDS || 300);
const AUTH_REGISTER_OTP_MAX_ATTEMPTS = Number(process.env.AUTH_REGISTER_OTP_MAX_ATTEMPTS || 5);
const AUTH_REGISTER_OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.AUTH_REGISTER_OTP_RESEND_COOLDOWN_SECONDS || 30);
const AUTH_REGISTER_OTP_EXPOSE_DEV_CODE = process.env.NODE_ENV !== 'production' && (process.env.AUTH_REGISTER_OTP_EXPOSE_DEV_CODE
    ? process.env.AUTH_REGISTER_OTP_EXPOSE_DEV_CODE === 'true'
    : true);
const AUTH_GMAIL_SMTP_USER = (process.env.AUTH_GMAIL_SMTP_USER || '').trim();
const AUTH_GMAIL_SMTP_APP_PASSWORD = (process.env.AUTH_GMAIL_SMTP_APP_PASSWORD || '').trim();
const AUTH_EMAIL_FROM = (process.env.AUTH_EMAIL_FROM || AUTH_GMAIL_SMTP_USER || 'no-reply@tram-an.vn').trim();
const AUTH_ADMIN_LOGIN_OTP_TTL_SECONDS = Number(process.env.AUTH_ADMIN_LOGIN_OTP_TTL_SECONDS || 300);
const AUTH_ADMIN_LOGIN_OTP_MAX_ATTEMPTS = Number(process.env.AUTH_ADMIN_LOGIN_OTP_MAX_ATTEMPTS || 5);
const AUTH_ADMIN_LOGIN_OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.AUTH_ADMIN_LOGIN_OTP_RESEND_COOLDOWN_SECONDS || 30);
const AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE = process.env.NODE_ENV !== 'production' && (process.env.AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE
    ? process.env.AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE === 'true'
    : true);
const CANONICAL_SCHOOL_NAMES = {
    chuyenHaNoiAmsterdam: 'THPT Chuyên Hà Nội - Amsterdam',
    chuVanAn: 'THPT Chu Văn An',
    phanDinhPhung: 'THPT Phan Đình Phùng',
    luongTheVinh: 'THPT Lương Thế Vinh',
    kimLien: 'THPT Kim Liên',
};
const SCHOOL_NAME_ALIASES = new Map([
    ['thpt chuyen ha noi amsterdam', CANONICAL_SCHOOL_NAMES.chuyenHaNoiAmsterdam],
    ['thpt chu van an', CANONICAL_SCHOOL_NAMES.chuVanAn],
    ['thpt phan dinh phung', CANONICAL_SCHOOL_NAMES.phanDinhPhung],
    ['thpt luong the vinh', CANONICAL_SCHOOL_NAMES.luongTheVinh],
    ['thpt kim lien', CANONICAL_SCHOOL_NAMES.kimLien],
]);
let pool = null;
const toSchoolLookupKey = (value) => value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const normalizeSchoolName = (value) => {
    const school = typeof value === 'string' ? value.trim() : '';
    if (!school)
        return '';
    return SCHOOL_NAME_ALIASES.get(toSchoolLookupKey(school)) || school;
};
const getPool = () => { validateRuntime(); return pool ??= new Pool(databaseConfig()); };
const hashPassword = (password, salt) => {
    const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
    const digest = crypto.scryptSync(password, passwordSalt, 64).toString('hex');
    return `scrypt$${passwordSalt}$${digest}`;
};
const verifyPassword = (password, storedHash) => {
    const [algo, salt, digest] = storedHash.split('$');
    if (algo !== 'scrypt' || !salt || !digest)
        return false;
    const candidateDigest = crypto.scryptSync(password, salt, 64).toString('hex');
    const expectedBuffer = Buffer.from(digest, 'hex');
    const candidateBuffer = Buffer.from(candidateDigest, 'hex');
    if (expectedBuffer.length !== candidateBuffer.length)
        return false;
    return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
};
const normalizeJoinCode = (value) => value.trim().toUpperCase();
const hashJoinCode = (code) => crypto
    .createHmac('sha256', AUTH_SESSION_SECRET)
    .update(normalizeJoinCode(code))
    .digest('hex');
const createJoinCode = () => Array.from({ length: JOIN_CODE_LENGTH }, () => JOIN_CODE_ALPHABET[crypto.randomInt(JOIN_CODE_ALPHABET.length)]).join('');
const sanitizeTtlMinutes = (ttlMinutes) => {
    const value = Number(ttlMinutes ?? DEFAULT_JOIN_CODE_TTL_MINUTES);
    if (!Number.isFinite(value) || value <= 0)
        return DEFAULT_JOIN_CODE_TTL_MINUTES;
    return Math.min(Math.floor(value), MAX_JOIN_CODE_TTL_MINUTES);
};
const sanitizeMaxUses = (maxUses) => {
    const value = Number(maxUses ?? DEFAULT_JOIN_CODE_MAX_USES);
    if (!Number.isFinite(value) || value <= 0)
        return DEFAULT_JOIN_CODE_MAX_USES;
    return Math.min(Math.floor(value), MAX_JOIN_CODE_USES);
};
const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const createRegisterOtpCode = () => String(crypto.randomInt(100000, 1000000));
const hashRegisterOtp = (sessionId, otpCode) => crypto
    .createHmac('sha256', AUTH_SESSION_SECRET)
    .update(`${sessionId}:${otpCode}`)
    .digest('hex');
const buildRegisterOtpFingerprint = (payload) => {
    const username = typeof payload.username === 'string' ? normalizeUsername(payload.username) : '';
    const role = payload.role === 'teacher' ? 'teacher' : 'student';
    const email = normalizeEmail(payload?.profile?.email);
    return `${username}|${role}|${email}`;
};
const getRegisterOtpPurpose = (role) => (role === 'teacher' ? 'register_teacher' : 'register_student');
const maskEmailForLog = (email) => {
    const [name = '', domain = ''] = String(email || '').split('@');
    if (!name || !domain)
        return email;
    if (name.length <= 2)
        return `${name[0] || '*'}***@${domain}`;
    return `${name.slice(0, 2)}***@${domain}`;
};
let registerOtpMailer = null;
const getRegisterOtpMailer = () => {
    if (registerOtpMailer) return registerOtpMailer;
    const config = smtpConfig();
    return config ? registerOtpMailer = nodemailer.createTransport(config) : null;
};
const sendRegisterOtpEmail = async ({ email, otpCode, purpose, fullName }) => {
    const mailer = getRegisterOtpMailer();
    if (!mailer)
        return false;
    const subject = purpose === 'register_teacher'
        ? 'Ma OTP dang ky tai khoan giao vien - Tram An'
        : 'Ma OTP dang ky tai khoan hoc sinh - Tram An';
    const greetingName = fullName || 'ban';
    const bodyText = [
        `Xin chao ${greetingName},`,
        '',
        'Ma OTP dang ky cua ban la:',
        otpCode,
        '',
        `Ma co hieu luc trong ${Math.floor(AUTH_REGISTER_OTP_TTL_SECONDS / 60)} phut.`,
        'Neu khong phai ban thuc hien yeu cau nay, vui long bo qua email.',
        '',
        'Tram An',
    ].join('\n');
    await mailer.sendMail({
        from: AUTH_EMAIL_FROM,
        to: email,
        subject,
        text: bodyText,
    });
    return true;
};
const sendAdminLoginOtpEmail = async ({ email, otpCode, fullName, role }) => {
    const mailer = getRegisterOtpMailer();
    if (!mailer)
        return false;
    const subject = role === 'superadmin'
        ? 'Ma OTP dang nhap Super Admin - Tram An'
        : 'Ma OTP dang nhap Admin - Tram An';
    const greetingName = fullName || 'ban';
    const bodyText = [
        `Xin chao ${greetingName},`,
        '',
        'Ma OTP dang nhap quan tri cua ban la:',
        otpCode,
        '',
        `Ma co hieu luc trong ${Math.floor(AUTH_ADMIN_LOGIN_OTP_TTL_SECONDS / 60)} phut.`,
        'Neu khong phai ban thuc hien yeu cau nay, vui long doi mat khau tai khoan ngay.',
        '',
        'Tram An',
    ].join('\n');
    await mailer.sendMail({
        from: AUTH_EMAIL_FROM,
        to: email,
        subject,
        text: bodyText,
    });
    return true;
};
const sendTeacherRejectedEmail = async ({ email, fullName, adminName, school }) => {
    const mailer = getRegisterOtpMailer();
    if (!mailer)
        return false;
    const normalizedEmail = normalizeEmail(email || '');
    if (!normalizedEmail || !normalizedEmail.includes('@'))
        return false;
    const greetingName = fullName || 'ban';
    const reviewerName = adminName || 'admin';
    const schoolText = school ? `Tai truong: ${school}` : '';
    const subject = 'Thong bao tu choi tai khoan giao vien - Tram An';
    const bodyText = [
        `Xin chao ${greetingName},`,
        '',
        'Tai khoan giao vien cua ban tren he thong Tram An da bi tu choi boi Admin.',
        schoolText,
        `Nguoi duyet: ${reviewerName}.`,
        '',
        'Neu ban can ho tro, vui long lien he bo phan quan tri nha truong de duoc huong dan dang ky lai.',
        '',
        'Tram An',
    ]
        .filter((line) => line !== '')
        .join('\n');
    await mailer.sendMail({
        from: AUTH_EMAIL_FROM,
        to: normalizedEmail,
        subject,
        text: bodyText,
    });
    return true;
};
const normalizePhone = (value) => String(value || '').replace(/\D+/g, '');
const maskPhoneForLog = (phone) => {
    const normalized = normalizePhone(phone);
    if (normalized.length <= 4)
        return normalized || '***';
    return `${'*'.repeat(Math.max(normalized.length - 4, 2))}${normalized.slice(-4)}`;
};
const createAdminLoginOtpCode = () => String(crypto.randomInt(100000, 1000000));
const hashAdminLoginOtp = (sessionId, otpCode) => crypto
    .createHmac('sha256', AUTH_SESSION_SECRET)
    .update(`${sessionId}:${otpCode}`)
    .digest('hex');
const shouldUseAdminOtp = (role) => role === 'admin' || role === 'superadmin';
const createLoginSessionResult = async (account) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ACCESS_TOKEN_TTL_SECONDS;
    const tokenPayload = {
        sub: account.id,
        username: account.username,
        role: account.role,
        status: account.status,
        iat: now,
        exp,
        jti: crypto.randomUUID(), credentialVersion:account.credentialVersion??0,
    };
    await insertSession(tokenPayload);
    const accessToken = signAccessToken(tokenPayload);
    return {
        user: toApiUser(account),
        session: {
            tokenType: 'Bearer',
            accessToken,
            expiresAt: new Date(exp * 1000).toISOString(),
        },
    };
};
const issueAdminLoginOtp = async (account) => {
    if (!shouldUseAdminOtp(account.role)) {
        return createLoginSessionResult(account);
    }
    const adminEmail = normalizeEmail(account.profile.email || '');
    if (!adminEmail || !adminEmail.includes('@')) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Tai khoan quan tri chua co email OTP hop le.');
    }
    const cooldownCheck = await getPool().query(`
      SELECT resend_available_at
      FROM auth_admin_login_otps
      WHERE user_id = $1
        AND consumed_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [account.id]);
    if (cooldownCheck.rows.length > 0) {
        const availableAt = new Date(cooldownCheck.rows[0].resend_available_at).getTime();
        if (availableAt > Date.now()) {
            const waitSeconds = Math.ceil((availableAt - Date.now()) / 1000);
            throw new AuthHttpError(429, 'AUTH_OTP_RATE_LIMIT', `Vui long cho ${waitSeconds}s de gui lai OTP.`);
        }
    }
    await consumeRate('otp', adminEmail);
    const otpSessionId = `aotp-${crypto.randomUUID()}`;
    const otpCode = createAdminLoginOtpCode();
    const otpHash = hashAdminLoginOtp(otpSessionId, otpCode);
    const expiresAt = new Date(Date.now() + AUTH_ADMIN_LOGIN_OTP_TTL_SECONDS * 1000);
    const resendAvailableAt = new Date(Date.now() + AUTH_ADMIN_LOGIN_OTP_RESEND_COOLDOWN_SECONDS * 1000);
    await getPool().query(`
      INSERT INTO auth_admin_login_otps (
        id, user_id, username, role, phone, otp_hash, expires_at, resend_available_at, attempts_left
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
    `, [
        otpSessionId,
        account.id,
        account.username,
        account.role,
        adminEmail,
        otpHash,
        expiresAt,
        resendAvailableAt,
        AUTH_ADMIN_LOGIN_OTP_MAX_ATTEMPTS,
    ]);
    let delivery = 'dev_console';
    try {
        const sent = await sendAdminLoginOtpEmail({
            email: adminEmail,
            otpCode,
            fullName: account.profile.name || account.username,
            role: account.role,
        });
        delivery = sent ? (process.env.AUTH_SMTP_HOST ? 'smtp' : 'gmail') : 'dev_console';
        if (!sent && process.env.NODE_ENV === 'production') {
            throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'OTP email chua duoc cau hinh Gmail SMTP.');
        }
    }
    catch (error) {
        console.error('[auth-admin-otp] send email failed');
        if (process.env.NODE_ENV === 'production') {
            throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'Khong the gui OTP qua email.');
        }
    }
    if (delivery === 'dev_console') {
        console.info('[auth-otp] development delivery available only in explicit dev response.');
    }
    return {
        otpRequired: true,
        otpSessionId,
        expiresAt: expiresAt.toISOString(),
        delivery,
        maskedEmail: maskEmailForLog(adminEmail),
        ...(AUTH_ADMIN_LOGIN_OTP_EXPOSE_DEV_CODE ? { devOtpCode: otpCode } : {}),
    };
};

const verifyOtpAtomic = async (table, sessionId, otpCode, hashFn, validateSession = null) => {
    const client = await getPool().connect();
    let committed = false;
    try {
        await client.query('BEGIN');
        const result = await client.query(`SELECT * FROM ${table} WHERE id=$1 FOR UPDATE`, [sessionId]);
        const row = result.rows[0];
        if (!row || row.consumed_at || Number(row.attempts_left) <= 0) throw new AuthHttpError(400, 'AUTH_OTP_INVALID', 'OTP không tồn tại, đã dùng hoặc đã hết lượt thử.');
        if (new Date(row.expires_at).getTime() <= Date.now()) throw new AuthHttpError(400, 'AUTH_OTP_EXPIRED', 'OTP đã hết hạn.');
        if (validateSession) validateSession(row);
        const incoming = Buffer.from(hashFn(sessionId, otpCode), 'hex');
        const expected = Buffer.from(row.otp_hash, 'hex');
        if (incoming.length !== expected.length || !crypto.timingSafeEqual(incoming, expected)) {
            await client.query(`UPDATE ${table} SET attempts_left=GREATEST(attempts_left-1,0),updated_at=NOW() WHERE id=$1`, [sessionId]);
            await client.query('COMMIT'); committed = true;
            throw new AuthHttpError(400, 'AUTH_OTP_INVALID', 'OTP không hợp lệ.');
        }
        await client.query(`UPDATE ${table} SET consumed_at=NOW(),updated_at=NOW() WHERE id=$1`, [sessionId]);
        await client.query('COMMIT'); committed = true;
        return row;
    } catch (error) { if (!committed) await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
};
const verifyAdminLoginOtpAndCreateSession = async (payload) => {
    const otpSessionId = typeof payload.otpSessionId === 'string' ? payload.otpSessionId.trim() : '';
    const otpCode = typeof payload.otpCode === 'string' ? payload.otpCode.trim() : '';
    if (!otpSessionId || !otpCode) throw new AuthHttpError(400,'AUTH_OTP_REQUIRED','Vui lòng nhập OTP.');
    const row = await verifyOtpAtomic('auth_admin_login_otps',otpSessionId,otpCode,hashAdminLoginOtp);
    const account = await findAccountById(row.user_id);
    if (!account || !shouldUseAdminOtp(account.role) || account.status !== 'active') throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Tài khoản không còn đủ quyền.');
    return createLoginSessionResult(account);
};
const encodeBase64Url = (value) => Buffer.from(value).toString('base64url');
const decodeBase64Url = (value) => Buffer.from(value, 'base64url').toString('utf8');
const signAccessToken = (payload) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = encodeBase64Url(JSON.stringify(header));
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', AUTH_SESSION_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};
const verifyAccessToken = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSignature = crypto
        .createHmac('sha256', AUTH_SESSION_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(encodedSignature);
    if (expectedBuffer.length !== actualBuffer.length)
        return null;
    if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer))
        return null;
    try {
        const payload = JSON.parse(decodeBase64Url(encodedPayload));
        if (!payload?.sub || !payload.exp || Date.now() >= payload.exp * 1000)
            return null;
        return payload;
    }
    catch {
        return null;
    }
};
const mapUserRow = (row) => ({
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status, revision:row.revision??0,credentialVersion:row.credential_version??0,
    profile: {
        name: row.profile_name,
        email: row.profile_email, schoolId:row.school_id??null,classId:row.class_id??null,revision:row.revision??0,bio:row.profile_bio??'',avatarKey:row.avatar_key??'mascot',emailVerified:!!row.email_verified_at,
        birthYear: row.profile_birth_year,
        gender: row.profile_gender,
        school: normalizeSchoolName(row.profile_school),
        className: row.profile_class_name,
        phone: row.profile_phone || '',
        teacherType: row.profile_teacher_type || (row.profile_class_name ? 'homeroom' : ''),
        subject: row.profile_subject || '',
    },
});
const toApiUser = (account) => ({
    id: account.id,
    username: account.username,
    role: account.role,
    status: account.status,revision:account.revision??0,
    profile: account.profile,
});
const mapJoinCodeRow = (row) => ({
    id: row.id,
    className: row.class_name,
    school: normalizeSchoolName(row.school),
    expiresAt: row.expires_at,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    status: row.status,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
});
const insertClassJoinCodeEvent = async (event, client = null) => {
    const runner = client || getPool();
    await runner.query(`
      INSERT INTO class_join_code_events (
        id,
        event_type,
        actor_user_id,
        teacher_id,
        class_join_code_id,
        class_name,
        school,
        student_username,
        note
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
    `, [
        `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        event.eventType,
        event.actorUserId || null,
        event.teacherId || null,
        event.classJoinCodeId || null,
        event.className || '',
        normalizeSchoolName(event.school || ''),
        event.studentUsername || '',
        event.note || '',
    ]);
};

const mapJoinCodeEventRow = (row) => ({
    id: row.id,
    eventType: row.event_type,
    actorUserId: row.actor_user_id,
    teacherId: row.teacher_id,
    classJoinCodeId: row.class_join_code_id,
    className: row.class_name,
    school: normalizeSchoolName(row.school),
    studentUsername: row.student_username,
    note: row.note,
    createdAt: row.created_at,
});
const findAccountByUsername = async (username) => {
    const result = await getPool().query(`
      SELECT
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject, revision,credential_version,school_id,class_id,profile_bio,avatar_key,email_verified_at,activation_pending,disabled_from_status
      FROM auth_users
      WHERE username = $1
      LIMIT 1
    `, [username]);
    if (result.rows.length === 0)
        return null;
    return mapUserRow(result.rows[0]);
};
const findAccountById = async (id) => {
    const result = await getPool().query(`
      SELECT
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject, revision,credential_version,school_id,class_id,profile_bio,avatar_key,email_verified_at,activation_pending,disabled_from_status
      FROM auth_users
      WHERE id = $1
      LIMIT 1
    `, [id]);
    if (result.rows.length === 0)
        return null;
    return mapUserRow(result.rows[0]);
};
const insertAccount = async (account) => {
    await getPool().query(`
      INSERT INTO auth_users (
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `, [
        account.id,
        account.username,
        account.passwordHash,
        account.role,
        account.status,
        account.profile.name,
        account.profile.email,
        account.profile.birthYear,
        account.profile.gender,
        normalizeSchoolName(account.profile.school),
        account.profile.className,
        account.profile.phone || '',
        account.profile.teacherType || '',
        account.profile.subject || '',
    ]);
};
const insertAccountWithClient = async (client, account) => {
    await client.query(`
      INSERT INTO auth_users (
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
    `, [
        account.id,
        account.username,
        account.passwordHash,
        account.role,
        account.status,
        account.profile.name,
        account.profile.email,
        account.profile.birthYear,
        account.profile.gender,
        normalizeSchoolName(account.profile.school),
        account.profile.className,
        account.profile.phone || '',
        account.profile.teacherType || '',
        account.profile.subject || '',
    ]);
};
const insertSession = async (payload) => {
    await getPool().query(`
      INSERT INTO auth_sessions (jti, user_id, exp_at)
      VALUES ($1, $2, TO_TIMESTAMP($3))
      ON CONFLICT (jti)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        exp_at = EXCLUDED.exp_at,
        revoked_at = NULL
    `, [payload.jti, payload.sub, payload.exp]);
};
const isSessionActive = async (jti) => {
    const result = await getPool().query(`
      SELECT 1
      FROM auth_sessions
      WHERE jti = $1
        AND revoked_at IS NULL
        AND exp_at > NOW()
      LIMIT 1
    `, [jti]);
    return (result.rowCount || 0) > 0;
};
const revokeSession = async (jti) => {
    await getPool().query(`
      UPDATE auth_sessions
      SET revoked_at = NOW()
      WHERE jti = $1
        AND revoked_at IS NULL
    `, [jti]);
};
const cleanupExpiredSessions = async () => {
    await getPool().query('DELETE FROM auth_sessions WHERE exp_at <= NOW()');
};
const cleanupExpiredJoinCodes = async () => {
    await getPool().query(`
      UPDATE class_join_codes
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active'
        AND expires_at <= NOW()
    `);
};
let initializedPromise = null;
export const initializeAuthCore = async () => {
    if (!initializedPromise) initializedPromise = getPool().query('SELECT 1 FROM auth_users LIMIT 0').catch(() => {
        initializedPromise = null;
        throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'Database chưa sẵn sàng. Chạy migration rõ ràng trên DB development riêng.');
    });
    return initializedPromise;
};
export const healthCheck = async () => {
    await initializeAuthCore();
    await getPool().query('SELECT 1');
    return { ok: true, service: 'auth-api' };
};
const validateRegisterInputForOtp = (payload) => {
    validateNewPassword(payload?.password);
    const normalizedUsername = typeof payload.username === 'string'
        ? normalizeUsername(payload.username)
        : '';
    if (!normalizedUsername || typeof payload.password !== 'string' || !payload.profile) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Du lieu dang ky khong hop le.');
    }
    if (payload.role !== 'student' && payload.role !== 'teacher') {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Vai tro dang ky khong hop le.');
    }
    if (payload.role === 'student' && (!payload.regCode || typeof payload.regCode !== 'string')) {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Ma dang ky hoc sinh khong hop le.');
    }
    const requestedTeacherType = payload.profile.teacherType;
    const teacherType = payload.role === 'teacher'
        ? (requestedTeacherType === 'homeroom' || requestedTeacherType === 'subject'
            ? requestedTeacherType
            : (payload.profile.className ? 'homeroom' : 'subject'))
        : '';
    const normalizedClassName = payload.role === 'teacher' && teacherType === 'subject'
        ? ''
        : String(payload.profile.className || '').trim();
    const normalizedSubject = payload.role === 'teacher' && teacherType === 'subject'
        ? String(payload.profile.subject || '').trim()
        : '';
    if (payload.role === 'teacher' && teacherType === 'homeroom' && !normalizedClassName) {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Vui long nhap lop chu nhiem.');
    }
    if (payload.role === 'teacher' && teacherType === 'subject' && !normalizedSubject) {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Vui long nhap mon giang day.');
    }
    const normalizedEmail = normalizeEmail(payload.profile.email || `${normalizedUsername}@tram-an.vn`);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Email dang ky khong hop le.');
    }
    const normalizedSchool = normalizeSchoolName(payload.profile.school || '');
    return {
        normalizedUsername,
        normalizedEmail,
        normalizedSchool,
        role: payload.role,
        teacherType,
        normalizedClassName,
        normalizedSubject,
    };
};
const consumeRegisterOtpOrThrow = async ({payload,normalizedUsername,role,normalizedEmail}) => {
    const sessionId = typeof payload.otpSessionId === 'string' ? payload.otpSessionId.trim() : '';
    const code = typeof payload.otpCode === 'string' ? payload.otpCode.trim() : '';
    if (!sessionId || !code) throw new AuthHttpError(400,'AUTH_OTP_REQUIRED','Vui lòng nhập OTP.');
    await verifyOtpAtomic('auth_register_otps',sessionId,code,hashRegisterOtp,row => {
        if (row.username !== normalizedUsername || row.role !== role || row.email !== normalizedEmail) throw new AuthHttpError(400,'AUTH_OTP_INVALID','Thông tin không khớp phiên OTP.');
    });
};
export const issueRegisterOtp = async (payload) => {
    await initializeAuthCore();
    const { normalizedUsername, normalizedEmail, role } = validateRegisterInputForOtp(payload);
    const existing = await findAccountByUsername(normalizedUsername);
    if (existing) {
        throw new AuthHttpError(409, 'AUTH_USERNAME_EXISTS', 'Ten dang nhap da ton tai.');
    }
    const cooldownCheck = await getPool().query(`
      SELECT resend_available_at
      FROM auth_register_otps
      WHERE username = $1
        AND role = $2
        AND email = $3
        AND consumed_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [normalizedUsername, role, normalizedEmail]);
    if (cooldownCheck.rows.length > 0) {
        const availableAt = new Date(cooldownCheck.rows[0].resend_available_at).getTime();
        if (availableAt > Date.now()) {
            const waitSeconds = Math.ceil((availableAt - Date.now()) / 1000);
            throw new AuthHttpError(429, 'AUTH_OTP_RATE_LIMIT', `Vui long cho ${waitSeconds}s de gui lai OTP.`);
        }
    }
    await consumeRate('otp', normalizedEmail);
    const otpSessionId = `otp-${crypto.randomUUID()}`;
    const otpCode = createRegisterOtpCode();
    const otpHash = hashRegisterOtp(otpSessionId, otpCode);
    const purpose = getRegisterOtpPurpose(role);
    const fingerprint = buildRegisterOtpFingerprint({
        username: normalizedUsername,
        role,
        profile: { email: normalizedEmail },
    });
    const expiresAt = new Date(Date.now() + AUTH_REGISTER_OTP_TTL_SECONDS * 1000);
    const resendAvailableAt = new Date(Date.now() + AUTH_REGISTER_OTP_RESEND_COOLDOWN_SECONDS * 1000);
    await getPool().query(`
      INSERT INTO auth_register_otps (
        id, purpose, username, email, role, request_fingerprint, otp_hash, expires_at, resend_available_at, attempts_left
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
    `, [
        otpSessionId,
        purpose,
        normalizedUsername,
        normalizedEmail,
        role,
        fingerprint,
        otpHash,
        expiresAt,
        resendAvailableAt,
        AUTH_REGISTER_OTP_MAX_ATTEMPTS,
    ]);
    let delivery = 'dev_console';
    try {
        const sent = await sendRegisterOtpEmail({
            email: normalizedEmail,
            otpCode,
            purpose,
            fullName: String(payload?.profile?.name || '').trim(),
        });
        delivery = sent ? (process.env.AUTH_SMTP_HOST ? 'smtp' : 'gmail') : 'dev_console';
        if (!sent && process.env.NODE_ENV === 'production') {
            throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'OTP email chua duoc cau hinh Gmail SMTP.');
        }
    }
    catch (error) {
        console.error('[auth-otp] send email failed');
        if (process.env.NODE_ENV === 'production') {
            throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'Khong the gui OTP qua email.');
        }
    }
    if (delivery === 'dev_console') {
        console.info('[auth-otp] development delivery available only in explicit dev response.');
    }
    return {
        otpSessionId,
        expiresAt: expiresAt.toISOString(),
        delivery,
        ...(AUTH_REGISTER_OTP_EXPOSE_DEV_CODE ? { devOtpCode: otpCode } : {}),
    };
};
export const registerAccount = async (payload) => {
    await initializeAuthCore();
    const {
        normalizedUsername,
        normalizedEmail,
        normalizedSchool,
        role,
        teacherType,
        normalizedClassName,
        normalizedSubject,
    } = validateRegisterInputForOtp(payload);
    await consumeRegisterOtpOrThrow({
        payload,
        normalizedUsername,
        role,
        normalizedEmail,
    });
    const account = {
        id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: normalizedUsername,
        passwordHash: hashPassword(payload.password),
        role,
        status: role === 'teacher' ? 'pending' : 'active',
        profile: {
            name: payload.profile.name || normalizedUsername,
            email: normalizedEmail,
            birthYear: payload.profile.birthYear || '',
            gender: payload.profile.gender || '',
            school: normalizedSchool,
            className: normalizedClassName,
            phone: String(payload.profile.phone || '').trim(),
            teacherType,
            subject: normalizedSubject,
        },
    };
    if (role !== 'student') {
        const existing = await findAccountByUsername(normalizedUsername);
        if (existing) {
            throw new AuthHttpError(409, 'AUTH_USERNAME_EXISTS', 'Ten dang nhap da ton tai.');
        }
        const created=await getPool().connect();try{await created.query('BEGIN');await insertAccountWithClient(created,account);await registrationContext(created,account);await created.query('COMMIT');}catch(e){await created.query('ROLLBACK');throw e;}finally{created.release();}
        return toApiUser(account);
    }
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const existing = await client.query('SELECT 1 FROM auth_users WHERE username = $1 LIMIT 1', [normalizedUsername]);
        if ((existing.rowCount || 0) > 0) {
            throw new AuthHttpError(409, 'AUTH_USERNAME_EXISTS', 'Ten dang nhap da ton tai.');
        }
        const normalizedJoinCode = normalizeJoinCode(payload.regCode || '');
        const joinCodeHash = hashJoinCode(normalizedJoinCode);
        const joinCodeResult = await client.query(`
        SELECT
          id,
          teacher_id,
          school,
          class_name,
          code_hash,
          expires_at,
          max_uses,
          used_count,
          status,
          created_at,
          revoked_at,school_id,class_id
        FROM class_join_codes
        WHERE code_hash = $1
        LIMIT 1
        FOR UPDATE
      `, [joinCodeHash]);
        if (joinCodeResult.rows.length === 0) {
            await insertClassJoinCodeEvent({
                eventType: 'redeem_failed',
                studentUsername: normalizedUsername,
                note: 'invalid_code_not_found',
            }, client);
            throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Ma dang ky hoc sinh khong hop le.');
        }
        const joinCode = joinCodeResult.rows[0];
        const joinCodeExpired = new Date(joinCode.expires_at).getTime() <= Date.now();
        const joinCodeFull = joinCode.used_count >= joinCode.max_uses;
        const joinCodeInactive = joinCode.status !== 'active';
        if (joinCodeExpired || joinCodeFull || joinCodeInactive) {
            await client.query(`
          UPDATE class_join_codes
          SET
            status = CASE
              WHEN status = 'active' AND expires_at <= NOW() THEN 'expired'
              WHEN status = 'active' AND used_count >= max_uses THEN 'expired'
              ELSE status
            END,
            updated_at = NOW()
          WHERE id = $1
        `, [joinCode.id]);
            await insertClassJoinCodeEvent({
                eventType: 'redeem_failed',
                teacherId: joinCode.teacher_id,
                classJoinCodeId: joinCode.id,
                className: joinCode.class_name,
                school: normalizeSchoolName(joinCode.school),
                studentUsername: normalizedUsername,
                note: joinCodeExpired ? 'expired' : (joinCodeFull ? 'max_uses_reached' : 'inactive_status'),
            }, client);
            throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Ma dang ky hoc sinh khong hop le.');
        }
        const nextUsedCount = joinCode.used_count + 1;
        const nextStatus = nextUsedCount >= joinCode.max_uses ? 'expired' : 'active';
        await client.query(`
        UPDATE class_join_codes
        SET
          used_count = $2,
          status = $3,
          updated_at = NOW()
        WHERE id = $1
      `, [joinCode.id, nextUsedCount, nextStatus]);
        account.profile.school = normalizeSchoolName(joinCode.school);
        account.profile.className = joinCode.class_name;
        account.profile.teacherType = '';
        account.profile.subject = '';
        await insertAccountWithClient(client, account);
        await registrationContext(client,account,joinCode);
        await insertClassJoinCodeEvent({
            eventType: 'redeem_success',
            teacherId: joinCode.teacher_id,
            classJoinCodeId: joinCode.id,
            className: joinCode.class_name,
            school: normalizeSchoolName(joinCode.school),
            studentUsername: normalizedUsername,
            note: 'student_registered',
        }, client);
        await client.query('COMMIT');
        return toApiUser(account);
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
const validateCreateAdminPayload = (payload) => {
    const normalizedUsername = typeof payload?.username === 'string'
        ? normalizeUsername(payload.username)
        : '';
    const password = typeof payload?.password === 'string' ? payload.password : '';
    const name = typeof payload?.profile?.name === 'string' ? payload.profile.name.trim() : '';
    const email = normalizeEmail(payload?.profile?.email || `${normalizedUsername}@tram-an.vn`);
    const school = normalizeSchoolName(typeof payload?.profile?.school === 'string' ? payload.profile.school : '');
    const birthYear = typeof payload?.profile?.birthYear === 'string' ? payload.profile.birthYear.trim() : '';
    const gender = typeof payload?.profile?.gender === 'string' ? payload.profile.gender.trim() : '';
    const phone = typeof payload?.profile?.phone === 'string' ? payload.profile.phone.trim() : '';
    if (!normalizedUsername) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu ten dang nhap admin.');
    }
    validateNewPassword(password);
    if (!password) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Mat khau admin toi thieu 6 ky tu.');
    }
    if (!name) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu ho ten admin.');
    }
    if (!email || !email.includes('@')) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Email admin khong hop le.');
    }
    if (!school) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu ten truong cho admin.');
    }
    return {
        normalizedUsername,
        password,
        name,
        email,
        school,
        birthYear,
        gender,
        phone,
    };
};
export const listAdminAccounts = async (token) => {
    await initializeAuthCore();
    const actor = await getCurrentUser(token);
    if (actor.role !== 'superadmin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Superadmin moi duoc xem danh sach Admin.');
    }
    const result = await getPool().query(`
      SELECT
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject, revision,credential_version,school_id,class_id,profile_bio,avatar_key,email_verified_at,activation_pending,disabled_from_status
      FROM auth_users
      WHERE role = 'admin'
      ORDER BY created_at ASC
    `);
    return {
        admins: result.rows.map((row) => toApiUser(mapUserRow(row))),
    };
};
const parseListScopedUsersQuery = (actor, query = {}) => {
    const actorRole = actor.role;
    if (actorRole !== 'superadmin' && actorRole !== 'admin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Khong co quyen xem danh sach nguoi dung.');
    }
    const allowedRoles = actorRole === 'superadmin'
        ? ['student', 'teacher', 'admin']
        : ['student', 'teacher'];
    const requestedRole = typeof query?.role === 'string'
        ? String(query.role).trim().toLowerCase()
        : '';
    if (requestedRole && !allowedRoles.includes(requestedRole)) {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Role duoc yeu cau khong hop le voi quyen hien tai.');
    }
    const roleFilter = requestedRole || null;
    const schoolFilterFromQuery = typeof query?.school === 'string'
        ? normalizeSchoolName(String(query.school).trim())
        : '';
    const schoolFilter = actorRole === 'admin'
        ? normalizeSchoolName(actor.profile.school || '')
        : schoolFilterFromQuery;
    if (actorRole === 'admin' && !schoolFilter) {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Tai khoan Admin chua duoc gan truong.');
    }
    const classNameFilter = typeof query?.className === 'string'
        ? String(query.className).trim()
        : '';
    const limitValue = Number(query?.limit ?? 120);
    const limit = Number.isFinite(limitValue)
        ? Math.min(Math.max(Math.floor(limitValue), 1), 200)
        : 120;
    return {
        roleFilter,
        schoolFilter,
        classNameFilter,
        limit,
    };
};
export const listScopedUsers = async (token, query = {}) => {
    await initializeAuthCore();
    const actor = await getCurrentUser(token);
    const parsed = parseListScopedUsersQuery(actor, query);
    const clauses = [];
    const params = [];
    if (parsed.roleFilter) {
        params.push(parsed.roleFilter);
        clauses.push(`role = $${params.length}`);
    }
    else {
        const defaultRoles = actor.role === 'superadmin'
            ? ['student', 'teacher', 'admin']
            : ['student', 'teacher'];
        params.push(defaultRoles);
        clauses.push(`role = ANY($${params.length})`);
    }
    if (parsed.schoolFilter) {
        params.push(parsed.schoolFilter);
        clauses.push(`profile_school = $${params.length}`);
    }
    if (parsed.classNameFilter) {
        params.push(parsed.classNameFilter);
        clauses.push(`profile_class_name = $${params.length}`);
    }
    const totalResult=await getPool().query(`SELECT COUNT(*)::int AS total FROM auth_users WHERE ${clauses.join(' AND ')}`,params);
    if(query.cursor){try{const cursor=JSON.parse(Buffer.from(String(query.cursor),'base64url').toString('utf8'));if(!Array.isArray(cursor)||cursor.length!==2||typeof cursor[0]!=='string'||!Number.isFinite(Date.parse(cursor[0]))||typeof cursor[1]!=='string'||cursor[1].length>150)throw new Error();params.push(cursor[0],cursor[1]);clauses.push(`(created_at,id)<($${params.length-1}::timestamptz,$${params.length})`);}catch{throw new AuthHttpError(400,'AUTH_SERVER_ERROR','Cursor không hợp lệ.');}}
    params.push(parsed.limit+1);

    const result = await getPool().query(`
      SELECT
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject,created_at,
        TO_CHAR(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time, revision,credential_version,school_id,class_id,profile_bio,avatar_key,email_verified_at,activation_pending,disabled_from_status
      FROM auth_users
      WHERE ${clauses.join(' AND ')}
      ORDER BY created_at DESC,id DESC
      LIMIT $${params.length}
    `, params);
    return {
        users: result.rows.slice(0,parsed.limit).map((row) => toApiUser(mapUserRow(row))),
        total:totalResult.rows[0].total,
        nextCursor:result.rows.length>parsed.limit?Buffer.from(JSON.stringify([result.rows[parsed.limit-1].cursor_time,result.rows[parsed.limit-1].id])).toString('base64url'):null,
    };
};
export const approveTeacherAccount = async (token, payload = {}) => {
    await initializeAuthCore();
    const actor = await getCurrentUser(token);
    if (actor.role !== 'superadmin' && actor.role !== 'admin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Khong co quyen phe duyet giao vien.');
    }
    const teacherId = typeof payload?.teacherId === 'string'
        ? String(payload.teacherId).trim()
        : '';
    if (!teacherId) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu teacherId can phe duyet.');
    }
    const teacherResult = await getPool().query(`
      SELECT
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject, revision,credential_version,school_id,class_id,profile_bio,avatar_key,email_verified_at,activation_pending,disabled_from_status
      FROM auth_users
      WHERE id = $1
      LIMIT 1
    `, [teacherId]);
    if (teacherResult.rows.length === 0) {
        throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay tai khoan giao vien.');
    }
    const teacher = mapUserRow(teacherResult.rows[0]);
    if (teacher.role !== 'teacher') {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Tai khoan duoc chon khong phai giao vien.');
    }
    if (actor.role === 'admin') {
        const actorSchool = normalizeSchoolName(actor.profile.school || '');
        const teacherSchool = normalizeSchoolName(teacher.profile.school || '');
        if (!actorSchool || actorSchool !== teacherSchool) {
            throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Admin chi duoc phe duyet giao vien trong truong cua minh.');
        }
    }
    if (teacher.status === 'active') {
        return { teacher: toApiUser(teacher) };
    }
    const updatedResult = await getPool().query(`
      UPDATE auth_users
      SET status = 'active', updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject
    `, [teacherId]);
    return {
        teacher: toApiUser(mapUserRow(updatedResult.rows[0])),
    };
};
export const rejectTeacherAccount = async (token, payload = {}) => {
    await initializeAuthCore();
    const actor = await getCurrentUser(token);
    if (actor.role !== 'superadmin' && actor.role !== 'admin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Khong co quyen tu choi giao vien.');
    }
    const teacherId = typeof payload?.teacherId === 'string'
        ? String(payload.teacherId).trim()
        : '';
    if (!teacherId) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu teacherId can tu choi.');
    }
    const teacherResult = await getPool().query(`
      SELECT
        id,
        username,
        password_hash,
        role,
        status,
        profile_name,
        profile_email,
        profile_birth_year,
        profile_gender,
        profile_school,
        profile_class_name,
        profile_phone,
        profile_teacher_type,
        profile_subject, revision,credential_version,school_id,class_id,profile_bio,avatar_key,email_verified_at,activation_pending,disabled_from_status
      FROM auth_users
      WHERE id = $1
      LIMIT 1
    `, [teacherId]);
    if (teacherResult.rows.length === 0) {
        throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay tai khoan giao vien.');
    }
    const teacher = mapUserRow(teacherResult.rows[0]);
    if (teacher.role !== 'teacher') {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Tai khoan duoc chon khong phai giao vien.');
    }
    if (actor.role === 'admin') {
        const actorSchool = normalizeSchoolName(actor.profile.school || '');
        const teacherSchool = normalizeSchoolName(teacher.profile.school || '');
        if (!actorSchool || actorSchool !== teacherSchool) {
            throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Admin chi duoc tu choi giao vien trong truong cua minh.');
        }
    }
    if (teacher.status !== 'pending') {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Chi co the tu choi giao vien dang cho duyet.');
    }
    await getPool().query(`
      UPDATE auth_users SET status='suspended',disabled_at=NOW(),disabled_from_status=NULL,revision=revision+1,credential_version=credential_version+1
      WHERE id = $1
    `, [teacherId]);
    try {
        const sent = await sendTeacherRejectedEmail({
            email: teacher.profile.email,
            fullName: teacher.profile.name || teacher.username,
            adminName: actor.profile.name || actor.username,
            school: teacher.profile.school || '',
        });
        if (!sent) {
            console.warn(`[auth-teacher-reject] Gmail SMTP chua cau hinh, khong gui email cho ${maskEmailForLog(teacher.profile.email || '')}.`);
        }
    }
    catch (error) {
        console.error('[auth-teacher-reject] send email failed');
    }
    return {
        teacherId,
    };
};
export const createAdminAccount = async (token, payload) => {
    await initializeAuthCore();
    const actor = await getCurrentUser(token);
    if (actor.role !== 'superadmin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi Superadmin moi duoc tao Admin.');
    }
    const parsed = validateCreateAdminPayload(payload);
    const existing = await findAccountByUsername(parsed.normalizedUsername);
    if (existing) {
        throw new AuthHttpError(409, 'AUTH_USERNAME_EXISTS', 'Ten dang nhap da ton tai.');
    }
    const account = {
        id: `acc-admin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: parsed.normalizedUsername,
        passwordHash: hashPassword(parsed.password),
        role: 'admin',
        status: 'active',
        profile: {
            name: parsed.name,
            email: parsed.email,
            birthYear: parsed.birthYear,
            gender: parsed.gender,
            school: parsed.school,
            className: '',
            phone: parsed.phone,
            teacherType: '',
            subject: '',
        },
    };
    await insertAccount(account);
    return {
        admin: toApiUser(account),
    };
};
export const createClassJoinCode = async (token, input = {}) => {
    await initializeAuthCore();
    const user = await getCurrentUser(token);
    if(process.env.ACCOUNT_MANAGEMENT_ENABLED==='true'){const r=(await getPool().query("SELECT 1 FROM auth_users u JOIN org_classes c ON c.id=u.class_id JOIN org_schools s ON s.id=u.school_id JOIN org_assignments x ON x.user_id=u.id AND x.class_id=c.id AND x.homeroom AND x.ended_at IS NULL WHERE u.id=$1 AND c.status='active' AND s.status='active'",[user.id])).rows;if(!r.length)throw new AuthHttpError(403,'AUTH_INVALID_ROLE','Cần phân công GVCN và lớp/niên khóa hợp lệ.');}
    if (user.role !== 'teacher') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi giao vien moi duoc tao ma lop.');
    }
    const userTeacherType = user.profile.teacherType || (user.profile.className ? 'homeroom' : 'subject');
    if (userTeacherType !== 'homeroom') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Chi giao vien chu nhiem moi duoc tao ma lop.');
    }
    const className = (input.className || user.profile.className || '').trim();
    if (!className) {
        throw new AuthHttpError(400, 'AUTH_INVALID_ROLE', 'Khong tim thay lop chu nhiem de tao ma.');
    }
    if (user.profile.className && className !== user.profile.className) {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Giao vien chi duoc tao ma cho lop cua minh.');
    }
    const ttlMinutes = sanitizeTtlMinutes(input.ttlMinutes);
    const maxUses = sanitizeMaxUses(input.maxUses);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        // Serialize create-code operations per teacher/class to avoid multiple active codes.
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`${user.id}:${className}`]);
        await client.query(`
      UPDATE class_join_codes
      SET status = 'revoked', revoked_at = NOW(), updated_at = NOW()
      WHERE teacher_id = $1
        AND class_name = $2
        AND status = 'active'
    `, [user.id, className]);
        for (let attempt = 0; attempt < JOIN_CODE_GENERATE_ATTEMPTS; attempt += 1) {
            const code = createJoinCode();
            const codeHash = hashJoinCode(code);
            const inserted = await client.query(`
        INSERT INTO class_join_codes (
          id,
          teacher_id,
          school,
          class_name,
          code_hash,
          expires_at,
          max_uses,
          used_count,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 0, 'active'
        )
        ON CONFLICT (code_hash)
        DO NOTHING
        RETURNING
          id,
          teacher_id,
          school,
          class_name,
          code_hash,
          expires_at,
          max_uses,
          used_count,
          status,
          created_at,
          revoked_at
      `, [
                `join-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                user.id,
                normalizeSchoolName(user.profile.school || ''),
                className,
                codeHash,
                expiresAt,
                maxUses,
            ]);
            if ((inserted.rowCount || 0) > 0) {
                await insertClassJoinCodeEvent({
                    eventType: 'created',
                    actorUserId: user.id,
                    teacherId: user.id,
                    classJoinCodeId: inserted.rows[0].id,
                    className,
                    school: normalizeSchoolName(user.profile.school || ''),
                    note: 'teacher_created_code',
                }, client);
                if(process.env.ACCOUNT_MANAGEMENT_ENABLED==='true')await client.query('UPDATE class_join_codes SET school_id=$2,class_id=$3 WHERE id=$1',[inserted.rows[0].id,user.profile.schoolId,user.profile.classId]);
            await client.query('COMMIT');
                return {
                    code,
                    data: mapJoinCodeRow(inserted.rows[0]),
                };
            }
        }
        throw new AuthHttpError(500, 'AUTH_SERVER_ERROR', 'Khong the tao ma lop. Vui long thu lai.');
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
export const listActiveClassJoinCodes = async (token) => {
    await initializeAuthCore();
    const user = await getCurrentUser(token);
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'superadmin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Khong co quyen xem ma lop.');
    }
    const teacherClause = user.role === 'teacher' ? 'AND teacher_id = $1' : user.role === 'admin' ? 'AND school = $1' : '';
    const params = user.role === 'teacher' ? [user.id] : user.role === 'admin' ? [user.profile.school || '__unassigned__'] : [];
    const result = await getPool().query(`
      SELECT
        id,
        teacher_id,
        school,
        class_name,
        code_hash,
        expires_at,
        max_uses,
        used_count,
        status,
        created_at,
        revoked_at
      FROM class_join_codes
      WHERE status = 'active'
        AND expires_at > NOW()
        ${teacherClause}
      ORDER BY created_at DESC
      LIMIT 20
    `, params);
    return result.rows.map(mapJoinCodeRow);
};
export const revokeClassJoinCode = async (token, payload) => {
    await initializeAuthCore();
    const user = await getCurrentUser(token);
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'superadmin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Khong co quyen thu hoi ma lop.');
    }
    const codeId = typeof payload.id === 'string' ? payload.id.trim() : '';
    if (!codeId) {
        throw new AuthHttpError(400, 'AUTH_SERVER_ERROR', 'Thieu id ma lop can thu hoi.');
    }
    const ownershipClause = user.role === 'teacher' ? 'AND teacher_id = $2' : user.role === 'admin' ? 'AND school = $2' : '';
    const params = user.role === 'teacher' ? [codeId, user.id] : user.role === 'admin' ? [codeId,user.profile.school || '__unassigned__'] : [codeId];
    const result = await getPool().query(`
      UPDATE class_join_codes
      SET
        status = 'revoked',
        revoked_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND status = 'active'
        ${ownershipClause}
      RETURNING
        id,
        teacher_id,
        school,
        class_name,
        code_hash,
        expires_at,
        max_uses,
        used_count,
        status,
        created_at,
        revoked_at
    `, params);
    if ((result.rowCount || 0) === 0) {
        throw new AuthHttpError(404, 'AUTH_SERVER_ERROR', 'Khong tim thay ma lop de thu hoi.');
    }
    await insertClassJoinCodeEvent({
        eventType: 'revoked',
        actorUserId: user.id,
        teacherId: result.rows[0].teacher_id,
        classJoinCodeId: result.rows[0].id,
        className: result.rows[0].class_name,
        school: normalizeSchoolName(result.rows[0].school),
        note: 'manual_revoke',
    });
    return mapJoinCodeRow(result.rows[0]);
};
export const listClassJoinCodeEvents = async (token, input = {}) => {
    await initializeAuthCore();
    const user = await getCurrentUser(token);
    if (user.role !== 'teacher' && user.role !== 'admin' && user.role !== 'superadmin') {
        throw new AuthHttpError(403, 'AUTH_INVALID_ROLE', 'Khong co quyen xem lich su ma lop.');
    }
    const limit = Math.min(Math.max(Number(input.limit || 50), 1), 200);
    const restricted = user.role === 'teacher' || user.role === 'admin';
    const teacherClause = user.role === 'teacher' ? 'AND teacher_id = $1' : user.role === 'admin' ? 'AND school = $1' : '';
    const params = restricted ? [user.role === 'teacher' ? user.id : user.profile.school || '__unassigned__', limit] : [limit];
    const result = await getPool().query(`
      SELECT
        id,
        event_type,
        actor_user_id,
        teacher_id,
        class_join_code_id,
        class_name,
        school,
        student_username,
        note,
        created_at
      FROM class_join_code_events
      WHERE 1 = 1
        ${teacherClause}
      ORDER BY created_at DESC
      LIMIT $${restricted ? '2' : '1'}
    `, params);
    return result.rows.map(mapJoinCodeEventRow);
};
export const loginAccount = async (payload) => {
    await initializeAuthCore();
    if (typeof payload?.otpSessionId === 'string' || typeof payload?.otpCode === 'string') {
        return verifyAdminLoginOtpAndCreateSession(payload);
    }
    const normalizedUsername = typeof payload.username === 'string'
        ? normalizeUsername(payload.username)
        : '';
    const account = await passwordAttempt(normalizedUsername, async () => {
        const found = await findAccountByUsername(normalizedUsername);
        return found && typeof payload.password === 'string' && verifyPassword(payload.password, found.passwordHash) ? found : null;
    });
    if (!account) {
        throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Tai khoan hoac mat khau khong chinh xac.');
    }
    if (account.status !== 'active') {
        throw new AuthHttpError(403, 'AUTH_PENDING_APPROVAL', 'Tai khoan chua duoc kich hoat.');
    }
    if (shouldUseAdminOtp(account.role)) {
        return issueAdminLoginOtp(account);
    }
    return createLoginSessionResult(account);
};
export const getCurrentUser = async (token) => {
    await initializeAuthCore();
    if (!token) {
        throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Phien dang nhap khong hop le.');
    }
    const payload = verifyAccessToken(token);
    if (!payload) {
        throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Phien dang nhap da het han.');
    }
    const activeSession = await isSessionActive(payload.jti);
    if (!activeSession) {
        throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Phien dang nhap da het hieu luc.');
    }
    const account = await findAccountById(payload.sub);
    if (!account) {
        throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Khong tim thay tai khoan dang nhap.');
    }
    if ((payload.credentialVersion??0)!==(account.credentialVersion??0)) throw new AuthHttpError(401,'AUTH_INVALID_CREDENTIALS','Thông tin phiên đã thay đổi.');
    if (account.status !== 'active') throw new AuthHttpError(403, 'AUTH_PENDING_APPROVAL', 'Tài khoản không còn hoạt động.');
    return toApiUser(account);
};
export const logoutToken = async (token) => {
    await initializeAuthCore();
    if (!token)
        return;
    const payload = verifyAccessToken(token);
    if (!payload)
        return;
    await revokeSession(payload.jti);
};
















export const closeAuthDatabase = async () => { if (pool) { await pool.end(); pool=null; initializedPromise=null; } };

export const listRegistrationSchools = async () => { await initializeAuthCore(); if(process.env.ACCOUNT_MANAGEMENT_ENABLED==='true')return (await getPool().query("SELECT id,name FROM org_schools WHERE status='active' ORDER BY name,id")).rows; const r=await getPool().query("SELECT DISTINCT profile_school FROM auth_users WHERE role='admin' AND status='active' AND profile_school<>'' ORDER BY profile_school"); return r.rows.map((row,index)=>({id:String(index),name:normalizeSchoolName(row.profile_school)})); };
