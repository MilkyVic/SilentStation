import crypto from 'node:crypto';
import { Pool } from 'pg';

export type ApiRole = 'student' | 'teacher' | 'admin' | 'superadmin';
export type ApiStatus = 'active' | 'pending' | 'suspended';
export type AuthErrorCode =
  | 'AUTH_USERNAME_EXISTS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_PENDING_APPROVAL'
  | 'AUTH_INVALID_ROLE'
  | 'AUTH_SERVER_ERROR';

type StoredAccount = {
  id: string;
  username: string;
  passwordHash: string;
  role: ApiRole;
  status: ApiStatus;
  profile: {
    name: string;
    email: string;
    birthYear: string;
    gender: string;
    school: string;
    className: string;
  };
};

type SeedAccount = Omit<StoredAccount, 'passwordHash'> & { password: string };

type AccessTokenPayload = {
  sub: string;
  username: string;
  role: ApiRole;
  status: ApiStatus;
  iat: number;
  exp: number;
  jti: string;
};

type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: ApiRole;
  status: ApiStatus;
  profile_name: string;
  profile_email: string;
  profile_birth_year: string;
  profile_gender: string;
  profile_school: string;
  profile_class_name: string;
};

export type RegisterInput = {
  username: string;
  password: string;
  role: 'student' | 'teacher';
  regCode?: string;
  profile: {
    name: string;
    email: string;
    birthYear: string;
    gender: string;
    school: string;
    className: string;
  };
};

export type LoginInput = {
  username: string;
  password: string;
};

export type ApiUser = {
  id: string;
  username: string;
  role: ApiRole;
  status: ApiStatus;
  profile: {
    name: string;
    email: string;
    birthYear: string;
    gender: string;
    school: string;
    className: string;
  };
};

export type LoginOutput = {
  user: ApiUser;
  session: {
    tokenType: 'Bearer';
    accessToken: string;
    expiresAt: string;
  };
};

export class AuthHttpError extends Error {
  statusCode: number;
  code: AuthErrorCode;

  constructor(statusCode: number, code: AuthErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const normalizeUsername = (value: string) => value.trim().toLowerCase();

const DATABASE_URL = process.env.DATABASE_URL;
const AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'dev-only-change-me';
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS || 60 * 60 * 8);
const AUTH_SEED_TEST_USERS = process.env.AUTH_SEED_TEST_USERS
  ? process.env.AUTH_SEED_TEST_USERS === 'true'
  : process.env.NODE_ENV !== 'production';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (process.env.NODE_ENV === 'production' && AUTH_SESSION_SECRET === 'dev-only-change-me') {
  throw new Error('AUTH_SESSION_SECRET is required in production');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const authSchemaSql = `
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'superadmin')),
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'suspended')),
  profile_name TEXT NOT NULL DEFAULT '',
  profile_email TEXT NOT NULL DEFAULT '',
  profile_birth_year TEXT NOT NULL DEFAULT '',
  profile_gender TEXT NOT NULL DEFAULT '',
  profile_school TEXT NOT NULL DEFAULT '',
  profile_class_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users (username);

CREATE TABLE IF NOT EXISTS auth_sessions (
  jti TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  exp_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_exp_at ON auth_sessions (exp_at);
`;

const seedAccounts: SeedAccount[] = [
  {
    id: 'acc-student-1',
    username: 'student_test',
    password: '123456',
    role: 'student',
    status: 'active',
    profile: {
      name: 'Hoc sinh test',
      email: 'student_test@tram-an.vn',
      birthYear: '2008',
      gender: 'Nu',
      school: 'THPT Chuyen Ha Noi - Amsterdam',
      className: '12A1',
    },
  },
  {
    id: 'acc-teacher-1',
    username: 'teacher_test',
    password: '123456',
    role: 'teacher',
    status: 'active',
    profile: {
      name: 'Giao vien test',
      email: 'teacher_test@tram-an.vn',
      birthYear: '1988',
      gender: 'Nam',
      school: 'THPT Chuyen Ha Noi - Amsterdam',
      className: '12A1',
    },
  },
  {
    id: 'acc-admin-1',
    username: 'admin_test',
    password: '123456',
    role: 'admin',
    status: 'active',
    profile: {
      name: 'Admin test',
      email: 'admin_test@tram-an.vn',
      birthYear: '1985',
      gender: 'Nam',
      school: 'THPT Chuyen Ha Noi - Amsterdam',
      className: '',
    },
  },
  {
    id: 'acc-superadmin-1',
    username: 'superadmin_test',
    password: '123456',
    role: 'superadmin',
    status: 'active',
    profile: {
      name: 'Super Admin test',
      email: 'superadmin_test@tram-an.vn',
      birthYear: '1983',
      gender: 'Nu',
      school: '',
      className: '',
    },
  },
];

const hashPassword = (password: string, salt?: string) => {
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
  const digest = crypto.scryptSync(password, passwordSalt, 64).toString('hex');
  return `scrypt$${passwordSalt}$${digest}`;
};

const verifyPassword = (password: string, storedHash: string) => {
  const [algo, salt, digest] = storedHash.split('$');
  if (algo !== 'scrypt' || !salt || !digest) return false;
  const candidateDigest = crypto.scryptSync(password, salt, 64).toString('hex');
  const expectedBuffer = Buffer.from(digest, 'hex');
  const candidateBuffer = Buffer.from(candidateDigest, 'hex');
  if (expectedBuffer.length !== candidateBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
};

const encodeBase64Url = (value: string) => Buffer.from(value).toString('base64url');
const decodeBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const signAccessToken = (payload: AccessTokenPayload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', AUTH_SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(encodedSignature);
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AccessTokenPayload;
    if (!payload?.sub || !payload.exp || Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
};

const mapUserRow = (row: UserRow): StoredAccount => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  role: row.role,
  status: row.status,
  profile: {
    name: row.profile_name,
    email: row.profile_email,
    birthYear: row.profile_birth_year,
    gender: row.profile_gender,
    school: row.profile_school,
    className: row.profile_class_name,
  },
});

const toApiUser = (account: StoredAccount): ApiUser => ({
  id: account.id,
  username: account.username,
  role: account.role,
  status: account.status,
  profile: account.profile,
});

const findAccountByUsername = async (username: string): Promise<StoredAccount | null> => {
  const result = await pool.query<UserRow>(
    `
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
        profile_class_name
      FROM auth_users
      WHERE username = $1
      LIMIT 1
    `,
    [username],
  );
  if (result.rows.length === 0) return null;
  return mapUserRow(result.rows[0]);
};

const findAccountById = async (id: string): Promise<StoredAccount | null> => {
  const result = await pool.query<UserRow>(
    `
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
        profile_class_name
      FROM auth_users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  if (result.rows.length === 0) return null;
  return mapUserRow(result.rows[0]);
};

const insertAccount = async (account: StoredAccount) => {
  await pool.query(
    `
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
        profile_class_name
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11
      )
    `,
    [
      account.id,
      account.username,
      account.passwordHash,
      account.role,
      account.status,
      account.profile.name,
      account.profile.email,
      account.profile.birthYear,
      account.profile.gender,
      account.profile.school,
      account.profile.className,
    ],
  );
};

const insertSession = async (payload: AccessTokenPayload) => {
  await pool.query(
    `
      INSERT INTO auth_sessions (jti, user_id, exp_at)
      VALUES ($1, $2, TO_TIMESTAMP($3))
      ON CONFLICT (jti)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        exp_at = EXCLUDED.exp_at,
        revoked_at = NULL
    `,
    [payload.jti, payload.sub, payload.exp],
  );
};

const isSessionActive = async (jti: string): Promise<boolean> => {
  const result = await pool.query(
    `
      SELECT 1
      FROM auth_sessions
      WHERE jti = $1
        AND revoked_at IS NULL
        AND exp_at > NOW()
      LIMIT 1
    `,
    [jti],
  );
  return (result.rowCount || 0) > 0;
};

const revokeSession = async (jti: string) => {
  await pool.query(
    `
      UPDATE auth_sessions
      SET revoked_at = NOW()
      WHERE jti = $1
        AND revoked_at IS NULL
    `,
    [jti],
  );
};

const cleanupExpiredSessions = async () => {
  await pool.query('DELETE FROM auth_sessions WHERE exp_at <= NOW()');
};

let initializedPromise: Promise<void> | null = null;

export const initializeAuthCore = async () => {
  if (initializedPromise) return initializedPromise;

  initializedPromise = (async () => {
    await pool.query(authSchemaSql);

    if (!AUTH_SEED_TEST_USERS) return;

    for (const seed of seedAccounts) {
      await pool.query(
        `
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
            profile_class_name
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
          )
          ON CONFLICT (username)
          DO NOTHING
        `,
        [
          seed.id,
          normalizeUsername(seed.username),
          hashPassword(seed.password),
          seed.role,
          seed.status,
          seed.profile.name,
          seed.profile.email,
          seed.profile.birthYear,
          seed.profile.gender,
          seed.profile.school,
          seed.profile.className,
        ],
      );
    }
  })();

  return initializedPromise;
};

export const healthCheck = async () => {
  await initializeAuthCore();
  await cleanupExpiredSessions();
  await pool.query('SELECT 1');
  return { ok: true, service: 'auth-api' };
};

export const registerAccount = async (payload: RegisterInput): Promise<ApiUser> => {
  await initializeAuthCore();

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

  const existing = await findAccountByUsername(normalizedUsername);
  if (existing) {
    throw new AuthHttpError(409, 'AUTH_USERNAME_EXISTS', 'Ten dang nhap da ton tai.');
  }

  const account: StoredAccount = {
    id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: normalizedUsername,
    passwordHash: hashPassword(payload.password),
    role: payload.role,
    status: payload.role === 'teacher' ? 'pending' : 'active',
    profile: {
      name: payload.profile.name || normalizedUsername,
      email: payload.profile.email || `${normalizedUsername}@tram-an.vn`,
      birthYear: payload.profile.birthYear || '',
      gender: payload.profile.gender || '',
      school: payload.profile.school || '',
      className: payload.profile.className || '',
    },
  };

  await insertAccount(account);
  return toApiUser(account);
};

export const loginAccount = async (payload: LoginInput): Promise<LoginOutput> => {
  await initializeAuthCore();

  const normalizedUsername = typeof payload.username === 'string'
    ? normalizeUsername(payload.username)
    : '';
  const account = await findAccountByUsername(normalizedUsername);

  if (!account || typeof payload.password !== 'string' || !verifyPassword(payload.password, account.passwordHash)) {
    throw new AuthHttpError(401, 'AUTH_INVALID_CREDENTIALS', 'Tai khoan hoac mat khau khong chinh xac.');
  }

  if (account.status !== 'active') {
    throw new AuthHttpError(403, 'AUTH_PENDING_APPROVAL', 'Tai khoan chua duoc kich hoat.');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + ACCESS_TOKEN_TTL_SECONDS;
  const tokenPayload: AccessTokenPayload = {
    sub: account.id,
    username: account.username,
    role: account.role,
    status: account.status,
    iat: now,
    exp,
    jti: crypto.randomUUID(),
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

export const getCurrentUser = async (token: string | null): Promise<ApiUser> => {
  await initializeAuthCore();
  await cleanupExpiredSessions();

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

  return toApiUser(account);
};

export const logoutToken = async (token: string | null) => {
  await initializeAuthCore();

  if (!token) return;

  const payload = verifyAccessToken(token);
  if (!payload) return;
  await revokeSession(payload.jti);
};
