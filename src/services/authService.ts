import type {
  ApiRole,
  ApiStatus,
  AuthAccount,
  AuthApiClassCodeCreateResponse,
  AuthApiClassCodeListResponse,
  AuthApiClassCodeRevokeResponse,
  AuthApiClassCodeEventsResponse,
  AuthApiClassCodeEvent,
  AuthApiClassJoinCode,
  AuthApiErrorResponse,
  AuthApiSuccessResponse,
  AuthApiUser,
  AuthApiRegisterOtpResponse,
  AuthErrorCode,
  AuthResult,
  AuthRole,
  AuthStatus,
} from '../types/auth';

type Session = {
  accountId: string;
  loggedInAt: number;
};

type RegisterPayload = {
  username: string;
  password: string;
  regCode?: string;
  otpSessionId?: string;
  otpCode?: string;
  profile: {
    name: string;
    email: string;
    birthYear: string;
    gender: string;
    school: string;
    className: string;
    teacherType: 'homeroom' | 'subject' | '';
    subject: string;
  };
};

type ClassJoinCodeInfo = {
  id: string;
  className: string;
  school: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  revokedAt: string | null;
};


type ClassJoinCodeEventInfo = {
  id: string;
  eventType: 'created' | 'revoked' | 'redeem_success' | 'redeem_failed';
  actorUserId: string | null;
  teacherId: string | null;
  classJoinCodeId: string | null;
  className: string;
  school: string;
  studentUsername: string;
  note: string;
  createdAt: string;
};

type RegisterOtpRequestPayload = {
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
    teacherType: 'homeroom' | 'subject' | '';
    subject: string;
  };
};

type CreateClassJoinCodePayload = {
  className?: string;
  ttlMinutes?: number;
  maxUses?: number;
};

type ServiceResult<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: {
    code: AuthErrorCode;
    message: string;
  };
};

const AUTH_TOKEN_KEY = 'tram_an_auth_token';
const AUTH_API_PREFIX = '/api/auth';
const CLASS_CODE_API_PREFIX = '/api/class-codes';

const TEST_AUTH_ACCOUNTS: AuthAccount[] = [
  {
    id: 'acc-student-1',
    username: 'student_test',
    password: '123456',
    role: 'Học sinh',
    status: 'active',
    profile: {
      name: 'Học sinh test',
      email: 'student_test@tram-an.vn',
      birthYear: '2008',
      gender: 'Nữ',
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      className: '12A1',
      teacherType: '',
      subject: '',
    },
  },
  {
    id: 'acc-teacher-1',
    username: 'teacher_test',
    password: '123456',
    role: 'Giáo viên',
    status: 'active',
    profile: {
      name: 'Giáo viên test',
      email: 'teacher_test@tram-an.vn',
      birthYear: '1988',
      gender: 'Nam',
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      className: '12A1',
      teacherType: 'homeroom',
      subject: '',
    },
  },
  {
    id: 'acc-teacher-subject-1',
    username: 'teacher_subject_test',
    password: '123456',
    role: 'Giáo viên',
    status: 'active',
    profile: {
      name: 'Giao vien bo mon test',
      email: 'teacher_subject_test@tram-an.vn',
      birthYear: '1989',
      gender: 'Nu',
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      className: '',
      teacherType: 'subject',
      subject: 'toan',
    },
  },
  {
    id: 'acc-admin-1',
    username: 'admin_test',
    password: '123456',
    role: 'Admin',
    status: 'active',
    profile: {
      name: 'Admin test',
      email: 'admin_test@tram-an.vn',
      birthYear: '1985',
      gender: 'Nam',
      school: 'THPT Chuyên Hà Nội - Amsterdam',
      className: '',
      teacherType: '',
      subject: '',
    },
  },
  {
    id: 'acc-superadmin-1',
    username: 'superadmin_test',
    password: '123456',
    role: 'Quản trị viên cấp cao',
    status: 'active',
    profile: {
      name: 'Super Admin test',
      email: 'superadmin_test@tram-an.vn',
      birthYear: '1983',
      gender: 'Nữ',
      school: '',
      className: '',
      teacherType: '',
      subject: '',
    },
  },
];

let accounts: AuthAccount[] = [...TEST_AUTH_ACCOUNTS];
let currentSession: Session | null = null;

const normalizeUsername = (username: string) => username.trim().toLowerCase();
const makeError = (code: AuthErrorCode, message: string): AuthResult => ({
  ok: false,
  error: { code, message },
});

const findAccount = (username: string) =>
  accounts.find((account) => account.username.toLowerCase() === normalizeUsername(username));

const upsertLocalAccount = (account: AuthAccount) => {
  const normalized = normalizeUsername(account.username);
  const existingIndex = accounts.findIndex((item) => item.username.toLowerCase() === normalized);
  if (existingIndex < 0) {
    accounts = [...accounts, account];
    return;
  }

  accounts = accounts.map((item, index) => {
    if (index !== existingIndex) return item;
    return { ...item, ...account, profile: { ...item.profile, ...account.profile } };
  });
};

const buildAccount = (
  role: AuthRole,
  status: AuthStatus,
  payload: RegisterPayload,
): AuthAccount => ({
  id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  username: normalizeUsername(payload.username),
  password: payload.password,
  role,
  status,
  profile: {
    name: payload.profile.name,
    email: payload.profile.email || `${normalizeUsername(payload.username)}@tram-an.vn`,
    birthYear: payload.profile.birthYear || '',
    gender: payload.profile.gender || '',
    school: payload.profile.school || '',
    className: payload.profile.className || '',
    teacherType:
      role === 'Giáo viên'
        ? (payload.profile.teacherType || (payload.profile.className ? 'homeroom' : 'subject'))
        : '',
    subject: role === 'Giáo viên' ? payload.profile.subject || '' : '',
  },
});

const mapApiRoleToAuthRole = (role: ApiRole): AuthRole => {
  if (role === 'teacher') return 'Giáo viên';
  if (role === 'admin') return 'Admin';
  if (role === 'superadmin') return 'Quản trị viên cấp cao';
  return 'Học sinh';
};

const mapApiStatusToAuthStatus = (status: ApiStatus): AuthStatus => {
  if (status === 'suspended') return 'suspended';
  if (status === 'pending') return 'pending';
  return 'active';
};

const mapApiUserToAccount = (user: AuthApiUser, password = ''): AuthAccount => {
  const role = mapApiRoleToAuthRole(user.role);
  const teacherType = role === 'Giáo viên'
    ? (user.profile.teacherType || (user.profile.className ? 'homeroom' : 'subject'))
    : '';

  return {
    id: user.id,
    username: normalizeUsername(user.username),
    password,
    role,
    status: mapApiStatusToAuthStatus(user.status),
    profile: {
      name: user.profile.name || user.username,
      email: user.profile.email || `${user.username}@tram-an.vn`,
      birthYear: user.profile.birthYear || '',
      gender: user.profile.gender || '',
      school: user.profile.school || '',
      className: user.profile.className || '',
      teacherType,
      subject: role === 'Giáo viên' ? (user.profile.subject || '') : '',
    },
  };
};

const mapClassJoinCode = (item: AuthApiClassJoinCode) => ({
  id: item.id,
  className: item.className,
  school: item.school,
  expiresAt: item.expiresAt,
  maxUses: item.maxUses,
  usedCount: item.usedCount,
  status: item.status,
  createdAt: item.createdAt,
  revokedAt: item.revokedAt,
});

const mapClassJoinCodeEvent = (item: AuthApiClassCodeEvent): ClassJoinCodeEventInfo => ({
  id: item.id,
  eventType: item.eventType,
  actorUserId: item.actorUserId,
  teacherId: item.teacherId,
  classJoinCodeId: item.classJoinCodeId,
  className: item.className,
  school: item.school,
  studentUsername: item.studentUsername,
  note: item.note,
  createdAt: item.createdAt,
});
const isBrowser = () => typeof window !== 'undefined';

const getAuthApiBaseUrl = () => {
  if (!isBrowser()) return '';
  const envBaseUrl = (import.meta as { env?: Record<string, unknown> }).env?.VITE_AUTH_API_BASE_URL;
  return typeof envBaseUrl === 'string' ? envBaseUrl.trim().replace(/\/$/, '') : '';
};

const shouldUseLocalFallback = () => {
  if (!isBrowser()) return true;
  const env = (import.meta as { env?: Record<string, unknown> }).env || {};
  const fallbackFlag = env.VITE_ENABLE_AUTH_FALLBACK;
  if (typeof fallbackFlag === 'string') {
    return fallbackFlag === 'true';
  }
  return env.DEV === true;
};

const buildAuthApiUrl = (path: string) => `${getAuthApiBaseUrl()}${AUTH_API_PREFIX}${path}`;

const getStoredToken = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

const setStoredToken = (token: string | null) => {
  if (!isBrowser()) return;
  if (!token) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const parseAuthApiResponse = (
  payload: unknown,
): AuthApiSuccessResponse | AuthApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }
  return payload as AuthApiSuccessResponse | AuthApiErrorResponse;
};

const parseClassCodeCreateResponse = (
  payload: unknown,
): AuthApiClassCodeCreateResponse | AuthApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }

  if ('error' in payload) return payload as AuthApiErrorResponse;

  if ('code' in payload && 'data' in payload) {
    return payload as AuthApiClassCodeCreateResponse;
  }

  return null;
};

const parseClassCodeListResponse = (
  payload: unknown,
): AuthApiClassCodeListResponse | AuthApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }

  if ('error' in payload) return payload as AuthApiErrorResponse;

  if ('codes' in payload) {
    return payload as AuthApiClassCodeListResponse;
  }

  return null;
};


const parseClassCodeEventsResponse = (
  payload: unknown,
): AuthApiClassCodeEventsResponse | AuthApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }

  if ('error' in payload) return payload as AuthApiErrorResponse;

  if ('events' in payload) {
    return payload as AuthApiClassCodeEventsResponse;
  }

  return null;
};


const parseRegisterOtpResponse = (
  payload: unknown,
): AuthApiRegisterOtpResponse | AuthApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }

  if ('error' in payload) return payload as AuthApiErrorResponse;

  if ('otpSessionId' in payload && 'expiresAt' in payload && 'delivery' in payload) {
    return payload as AuthApiRegisterOtpResponse;
  }

  return null;
};const parseClassCodeRevokeResponse = (
  payload: unknown,
): AuthApiClassCodeRevokeResponse | AuthApiErrorResponse | null => {
  if (!payload || typeof payload !== 'object' || !('ok' in payload)) {
    return null;
  }

  if ('error' in payload) return payload as AuthApiErrorResponse;

  if ('code' in payload) {
    return payload as AuthApiClassCodeRevokeResponse;
  }

  return null;
};

const callApi = async (url: string, init?: RequestInit): Promise<unknown | null> => {
  if (!isBrowser()) return null;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });

    const body = await response.json().catch(() => null);
    if (body) {
      return body;
    }

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: 'AUTH_SERVER_ERROR',
          message: 'Không thể xử lý phản hồi từ máy chủ.',
        },
      };
    }
  } catch {
    return null;
  }

  return null;
};

const callAuthApi = async (
  path: string,
  init?: RequestInit,
): Promise<AuthApiSuccessResponse | AuthApiErrorResponse | null> => {
  const payload = await callApi(buildAuthApiUrl(path), init);
  return parseAuthApiResponse(payload);
};

const buildClassCodeApiUrl = (path: string) => `${getAuthApiBaseUrl()}${CLASS_CODE_API_PREFIX}${path}`;

const callClassCodeApi = async (path: string, init?: RequestInit): Promise<unknown | null> => {
  return callApi(buildClassCodeApiUrl(path), init);
};
const localRegisterStudent = (payload: RegisterPayload): AuthResult => {
  if (findAccount(payload.username)) {
    return makeError('AUTH_USERNAME_EXISTS', 'Tên đăng nhập đã tồn tại.');
  }

  const account = buildAccount('Học sinh', 'active', payload);
  accounts = [...accounts, account];
  return { ok: true, account };
};

const localRegisterTeacherPending = (payload: RegisterPayload): AuthResult => {
  if (findAccount(payload.username)) {
    return makeError('AUTH_USERNAME_EXISTS', 'Tên đăng nhập đã tồn tại.');
  }

  const account = buildAccount('Giáo viên', 'pending', payload);
  accounts = [...accounts, account];
  return { ok: true, account };
};

const localLogin = (params: { username: string; password: string }): AuthResult => {
  const account = accounts.find(
    (candidate) =>
      candidate.username.toLowerCase() === normalizeUsername(params.username) &&
      candidate.password === params.password,
  );

  if (!account) {
    return makeError('AUTH_INVALID_CREDENTIALS', 'Tài khoản hoặc mật khẩu không chính xác.');
  }

  if (account.status !== 'active') {
    return makeError('AUTH_PENDING_APPROVAL', 'Tài khoản của bạn đang chờ Admin phê duyệt.');
  }

  currentSession = {
    accountId: account.id,
    loggedInAt: Date.now(),
  };

  return { ok: true, account };
};

const localGetCurrentSession = (): AuthAccount | null => {
  if (!currentSession) return null;
  return accounts.find((account) => account.id === currentSession?.accountId) || null;
};

export const authService = {
  findAccountByUsername(username: string): AuthAccount | null {
    return findAccount(username) || null;
  },


  async requestRegisterOtp(payload: RegisterOtpRequestPayload): Promise<ServiceResult<{ otpSessionId: string; expiresAt: string; delivery: 'gmail' | 'dev_console'; devOtpCode?: string }>> {
    const rawPayload = await callAuthApi('/otp/request-register', {
      method: 'POST',
      body: JSON.stringify({
        username: normalizeUsername(payload.username),
        password: payload.password,
        role: payload.role,
        regCode: payload.regCode,
        profile: payload.profile,
      }),
    });

    const apiResult = parseRegisterOtpResponse(rawPayload);
    if (!apiResult) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ OTP.') as ServiceResult<{ otpSessionId: string; expiresAt: string; delivery: 'gmail' | 'dev_console'; devOtpCode?: string }>;
    }

    if ('error' in apiResult) {
      return { ok: false, error: apiResult.error };
    }

    return {
      ok: true,
      data: {
        otpSessionId: apiResult.otpSessionId,
        expiresAt: apiResult.expiresAt,
        delivery: apiResult.delivery,
        devOtpCode: apiResult.devOtpCode,
      },
    };
  },

  async registerStudent(payload: RegisterPayload): Promise<AuthResult> {
    const apiResult = await callAuthApi('/register', {
      method: 'POST',
      body: JSON.stringify({
        username: normalizeUsername(payload.username),
        password: payload.password,
        role: 'student',
        regCode: payload.regCode,
        otpSessionId: payload.otpSessionId,
        otpCode: payload.otpCode,
        profile: {
          ...payload.profile,
          teacherType: '',
          subject: '',
        },
      }),
    });

    if (apiResult) {
      if ('error' in apiResult) return { ok: false, error: apiResult.error };
      const account = mapApiUserToAccount(apiResult.user, payload.password);
      upsertLocalAccount(account);
      return { ok: true, account };
    }

    if (!shouldUseLocalFallback()) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ xác thực.');
    }

    return localRegisterStudent(payload);
  },

  async registerTeacherPending(payload: RegisterPayload): Promise<AuthResult> {
    const apiResult = await callAuthApi('/register', {
      method: 'POST',
      body: JSON.stringify({
        username: normalizeUsername(payload.username),
        password: payload.password,
        role: 'teacher',
        otpSessionId: payload.otpSessionId,
        otpCode: payload.otpCode,
        profile: {
          ...payload.profile,
          teacherType: payload.profile.teacherType || (payload.profile.className ? 'homeroom' : 'subject'),
          subject: payload.profile.subject || '',
        },
      }),
    });

    if (apiResult) {
      if ('error' in apiResult) return { ok: false, error: apiResult.error };
      const account = mapApiUserToAccount(apiResult.user, payload.password);
      upsertLocalAccount(account);
      return { ok: true, account };
    }

    if (!shouldUseLocalFallback()) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ xác thực.');
    }

    return localRegisterTeacherPending(payload);
  },

  async login(params: { username: string; password: string }): Promise<AuthResult> {
    const apiResult = await callAuthApi('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: normalizeUsername(params.username),
        password: params.password,
      }),
    });

    if (apiResult) {
      if ('error' in apiResult) return { ok: false, error: apiResult.error };

      if (!('session' in apiResult)) {
        return makeError('AUTH_SERVER_ERROR', 'Phản hồi đăng nhập từ máy chủ không hợp lệ.');
      }

      setStoredToken(apiResult.session.accessToken);
      const account = mapApiUserToAccount(apiResult.user, params.password);
      upsertLocalAccount(account);
      currentSession = {
        accountId: account.id,
        loggedInAt: Date.now(),
      };
      return { ok: true, account };
    }

    if (!shouldUseLocalFallback()) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ xác thực.');
    }

    return localLogin(params);
  },

  async logout(): Promise<void> {
    const token = getStoredToken();

    setStoredToken(null);
    currentSession = null;

    if (!token) return;

    await callAuthApi('/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getCurrentSession(): Promise<AuthAccount | null> {
    const token = getStoredToken();
    if (token) {
      const apiResult = await callAuthApi('/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (apiResult) {
        if (!apiResult.ok) {
          setStoredToken(null);
          return null;
        }

        const account = mapApiUserToAccount(apiResult.user);
        upsertLocalAccount(account);
        currentSession = {
          accountId: account.id,
          loggedInAt: Date.now(),
        };
        return account;
      }
    }

    if (!shouldUseLocalFallback()) {
      return null;
    }

    return localGetCurrentSession();
  },

  async createClassJoinCode(
    payload: CreateClassJoinCodePayload = {},
  ): Promise<ServiceResult<{ code: string; info: ClassJoinCodeInfo }>> {
    const token = getStoredToken();
    if (!token) {
      return makeError('AUTH_INVALID_CREDENTIALS', 'Phiên đăng nhập không hợp lệ.') as ServiceResult<{ code: string; info: ClassJoinCodeInfo }>;
    }

    const rawPayload = await callClassCodeApi('/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const apiResult = parseClassCodeCreateResponse(rawPayload);
    if (!apiResult) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ tạo mã lớp.') as ServiceResult<{ code: string; info: ClassJoinCodeInfo }>;
    }

    if ('error' in apiResult) {
      return { ok: false, error: apiResult.error };
    }

    return {
      ok: true,
      data: {
        code: apiResult.code,
        info: mapClassJoinCode(apiResult.data),
      },
    };
  },

  async listActiveClassJoinCodes(): Promise<ServiceResult<ClassJoinCodeInfo[]>> {
    const token = getStoredToken();
    if (!token) {
      return makeError('AUTH_INVALID_CREDENTIALS', 'Phiên đăng nhập không hợp lệ.') as ServiceResult<ClassJoinCodeInfo[]>;
    }

    const rawPayload = await callClassCodeApi('/active', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const apiResult = parseClassCodeListResponse(rawPayload);
    if (!apiResult) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ mã lớp.') as ServiceResult<ClassJoinCodeInfo[]>;
    }

    if ('error' in apiResult) {
      return { ok: false, error: apiResult.error };
    }

    return {
      ok: true,
      data: apiResult.codes.map(mapClassJoinCode),
    };
  },

  async listClassJoinCodeEvents(limit = 50): Promise<ServiceResult<ClassJoinCodeEventInfo[]>> {
    const token = getStoredToken();
    if (!token) {
      return makeError('AUTH_INVALID_CREDENTIALS', 'Phiên đăng nhập không hợp lệ.') as ServiceResult<ClassJoinCodeEventInfo[]>;
    }

    const rawPayload = await callClassCodeApi(`/events?limit=${Math.min(Math.max(limit, 1), 200)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const apiResult = parseClassCodeEventsResponse(rawPayload);
    if (!apiResult) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ lịch sử mã lớp.') as ServiceResult<ClassJoinCodeEventInfo[]>;
    }

    if ('error' in apiResult) {
      return { ok: false, error: apiResult.error };
    }

    return {
      ok: true,
      data: apiResult.events.map(mapClassJoinCodeEvent),
    };
  },
  async revokeClassJoinCode(id: string): Promise<ServiceResult<ClassJoinCodeInfo>> {
    const token = getStoredToken();
    if (!token) {
      return makeError('AUTH_INVALID_CREDENTIALS', 'Phiên đăng nhập không hợp lệ.') as ServiceResult<ClassJoinCodeInfo>;
    }

    const rawPayload = await callClassCodeApi('/revoke', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    const apiResult = parseClassCodeRevokeResponse(rawPayload);
    if (!apiResult) {
      return makeError('AUTH_SERVER_ERROR', 'Không kết nối được máy chủ thu hồi mã lớp.') as ServiceResult<ClassJoinCodeInfo>;
    }

    if ('error' in apiResult) {
      return { ok: false, error: apiResult.error };
    }

    return {
      ok: true,
      data: mapClassJoinCode(apiResult.code),
    };
  },
  approveTeacherAccount(
    username: string,
    profileUpdates?: Partial<AuthAccount['profile']>,
  ): AuthAccount | null {
    const normalized = normalizeUsername(username);
    let approvedAccount: AuthAccount | null = null;

    accounts = accounts.map((account) => {
      if (account.username.toLowerCase() !== normalized || account.role !== 'Giáo viên') {
        return account;
      }

      approvedAccount = {
        ...account,
        status: 'active',
        profile: {
          ...account.profile,
          ...(profileUpdates || {}),
        },
      };
      return approvedAccount;
    });

    return approvedAccount;
  },

  // Test-only helper to keep authService unit tests deterministic.
  __resetForTests(): void {
    accounts = [...TEST_AUTH_ACCOUNTS];
    currentSession = null;
    setStoredToken(null);
  },
};








