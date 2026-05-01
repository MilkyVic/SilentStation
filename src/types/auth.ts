export type AuthRole = 'Học sinh' | 'Giáo viên' | 'Admin' | 'Quản trị viên cấp cao';
export type AuthStatus = 'active' | 'pending' | 'suspended';
export type TeacherType = 'homeroom' | 'subject' | '';

export type AuthAccount = {
  id: string;
  username: string;
  password: string; // Mock only for phase 2. Replace by backend hash in phase 3.
  role: AuthRole;
  status: AuthStatus;
  profile: {
    name: string;
    email: string;
    birthYear: string;
    gender: string;
    school: string;
    className: string;
    phone?: string;
    teacherType: TeacherType;
    subject: string;
  };
};

export type AuthErrorCode =
  | 'AUTH_USERNAME_EXISTS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_PENDING_APPROVAL'
  | 'AUTH_INVALID_ROLE'
  | 'AUTH_OTP_REQUIRED'
  | 'AUTH_OTP_INVALID'
  | 'AUTH_OTP_EXPIRED'
  | 'AUTH_OTP_RATE_LIMIT'
  | 'AUTH_SERVER_ERROR';

export type AuthError = {
  code: AuthErrorCode;
  message: string;
};

export type AuthResult = {
  ok: true;
  account: AuthAccount;
} | {
  ok: false;
  error: AuthError;
};

export type ApiRole = 'student' | 'teacher' | 'admin' | 'superadmin';
export type ApiStatus = 'active' | 'pending' | 'suspended';

export type AuthApiLoginRequest = {
  username: string;
  password: string;
  otpSessionId?: string;
  otpCode?: string;
};

export type AuthApiRegisterRequest = {
  username: string;
  password: string;
  role: Extract<ApiRole, 'student' | 'teacher'>;
  profile: {
    name: string;
    email: string;
    birthYear: string;
    gender: string;
    school: string;
    className: string;
    phone?: string;
    teacherType: TeacherType;
    subject: string;
  };
  regCode?: string;
};

export type AuthApiUser = {
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
    phone?: string;
    teacherType: TeacherType;
    subject: string;
  };
};

export type AuthApiSession = {
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
};

export type AuthApiUserResponse = {
  ok: true;
  user: AuthApiUser;
};

export type AuthApiLoginSuccessResponse = AuthApiUserResponse & {
  session: AuthApiSession;
};

export type AuthApiLoginOtpChallengeResponse = {
  ok: true;
  otpRequired: true;
  otpSessionId: string;
  expiresAt: string;
  delivery: 'gmail' | 'dev_console';
  maskedEmail: string;
  devOtpCode?: string;
};

export type AuthApiSuccessResponse =
  | AuthApiUserResponse
  | AuthApiLoginSuccessResponse
  | AuthApiLoginOtpChallengeResponse;

export type AuthApiErrorResponse = {
  ok: false;
  error: AuthError;
};

export type ClassJoinCodeStatus = 'active' | 'revoked' | 'expired';

export type AuthApiClassJoinCode = {
  id: string;
  className: string;
  school: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  status: ClassJoinCodeStatus;
  createdAt: string;
  revokedAt: string | null;
};

export type AuthApiClassCodeCreateResponse = {
  ok: true;
  code: string;
  data: AuthApiClassJoinCode;
};

export type AuthApiClassCodeListResponse = {
  ok: true;
  codes: AuthApiClassJoinCode[];
};

export type AuthApiClassCodeRevokeResponse = {
  ok: true;
  code: AuthApiClassJoinCode;
};

export type ClassJoinCodeEventType = 'created' | 'revoked' | 'redeem_success' | 'redeem_failed';

export type AuthApiClassCodeEvent = {
  id: string;
  eventType: ClassJoinCodeEventType;
  actorUserId: string | null;
  teacherId: string | null;
  classJoinCodeId: string | null;
  className: string;
  school: string;
  studentUsername: string;
  note: string;
  createdAt: string;
};

export type AuthApiClassCodeEventsResponse = {
  ok: true;
  events: AuthApiClassCodeEvent[];
};


export type AuthApiRegisterOtpResponse = {
  ok: true;
  otpSessionId: string;
  expiresAt: string;
  delivery: 'gmail' | 'dev_console';
  devOtpCode?: string;
};
