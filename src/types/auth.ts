export type AuthRole = 'Học sinh' | 'Giáo viên' | 'Admin' | 'Quản trị viên cấp cao';
export type AuthStatus = 'active' | 'pending' | 'suspended';

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
  };
};

export type AuthErrorCode =
  | 'AUTH_USERNAME_EXISTS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_PENDING_APPROVAL'
  | 'AUTH_INVALID_ROLE'
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

export type AuthApiSuccessResponse = AuthApiUserResponse | AuthApiLoginSuccessResponse;

export type AuthApiErrorResponse = {
  ok: false;
  error: AuthError;
};
