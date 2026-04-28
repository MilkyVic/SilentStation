# Auth API Contract (Phase 2 -> Phase 3)

This contract is the backend target for replacing frontend in-memory auth.

## Goals

- Login does not accept role from client.
- Role and status come from persisted account data.
- Frontend routes by backend response only.
- Teacher profile supports `teacherType` and `subject`.

## Endpoints

### `POST /api/auth/register`

Create a public account (`student` or `teacher` only).

Request body:

```json
{
  "username": "string",
  "password": "string",
  "role": "student | teacher",
  "profile": {
    "name": "string",
    "email": "string",
    "birthYear": "string",
    "gender": "string",
    "school": "string",
    "className": "string",
    "teacherType": "'' | homeroom | subject",
    "subject": "string"
  },
  "regCode": "string (required for student)",
  "otpSessionId": "string",
  "otpCode": "string"
}
```

Rules:

- `student`: `teacherType = ''`, `subject = ''`, bắt buộc có `regCode` hợp lệ.
- `teacher + homeroom`: should provide `className`.
- `teacher + subject`: should provide `subject`, `className` can be empty.
- OTP đăng ký là bắt buộc với cả học sinh và giáo viên.

Success response (`201`):

```json
{
  "ok": true,
  "user": {
    "id": "string",
    "username": "string",
    "role": "student | teacher | admin | superadmin",
    "status": "active | pending | suspended",
    "profile": {
      "name": "string",
      "email": "string",
      "birthYear": "string",
      "gender": "string",
      "school": "string",
      "className": "string",
      "teacherType": "'' | homeroom | subject",
      "subject": "string"
    }
  }
}
```

### `POST /api/auth/otp/request-register`

Request OTP for registration (student/teacher):

```json
{
  "username": "string",
  "password": "string",
  "role": "student | teacher",
  "regCode": "string (required for student)",
  "profile": {
    "name": "string",
    "email": "string",
    "birthYear": "string",
    "gender": "string",
    "school": "string",
    "className": "string",
    "teacherType": "'' | homeroom | subject",
    "subject": "string"
  }
}
```

Success response (`200`):

```json
{
  "ok": true,
  "otpSessionId": "otp-...",
  "expiresAt": "ISO datetime",
  "delivery": "gmail | dev_console",
  "devOtpCode": "123456 (optional, dev only)"
}
```

### `POST /api/auth/login`

Authenticate with username + password only.

### `POST /api/auth/logout`

Invalidate current session/token.

### `GET /api/auth/me`

Return current authenticated user + role/status.

## Error Envelope

All auth endpoints return a consistent error body:

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_USERNAME_EXISTS | AUTH_INVALID_CREDENTIALS | AUTH_PENDING_APPROVAL | AUTH_INVALID_ROLE | AUTH_OTP_REQUIRED | AUTH_OTP_INVALID | AUTH_OTP_EXPIRED | AUTH_OTP_RATE_LIMIT | AUTH_SERVER_ERROR",
    "message": "string"
  }
}
```

## Frontend Mapping Rules

- `student` -> `home`
- `teacher` + `teacherType=homeroom` -> `teacher-class`
- `teacher` + `teacherType=subject` -> `home`
- `admin` -> `admin`
- `superadmin` -> `superadmin`
- Any non-`active` status blocks dashboard access.

## Dev/Staging Test Accounts

Internal only:

1. `student_test / 123456`
2. `teacher_test / 123456`
3. `teacher_subject_test / 123456`
4. `admin_test / 123456`
5. `superadmin_test / 123456`

Never show these credentials on UI or production docs.
