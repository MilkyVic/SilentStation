# Auth API Contract (Phase 2 -> Phase 3)

This contract is the backend target for replacing frontend in-memory auth.

## Goals

- Login does not accept role from client.
- Role and status come from persisted account data.
- Frontend routes by backend response only.
- Teacher profile supports `teacherType` and `subject`.

## Endpoints

### `POST /auth/register`

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
  "regCode": "string (required for student)"
}
```

Rules:

- `student`: `teacherType = ''`, `subject = ''`.
- `teacher + homeroom`: should provide `className`.
- `teacher + subject`: should provide `subject`, `className` can be empty.

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

### `POST /auth/login`

Authenticate with username + password only.

Request body:

```json
{
  "username": "string",
  "password": "string"
}
```

Success response (`200`):

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
  },
  "session": {
    "tokenType": "Bearer",
    "accessToken": "string",
    "refreshToken": "string",
    "expiresAt": "ISO datetime"
  }
}
```

### `POST /auth/logout`

Invalidate current session/token.

Success response (`200`):

```json
{
  "ok": true
}
```

### `GET /auth/me`

Return current authenticated user + role/status.

Success response (`200`):

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

## Error Envelope

All auth endpoints return a consistent error body:

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_USERNAME_EXISTS | AUTH_INVALID_CREDENTIALS | AUTH_PENDING_APPROVAL | AUTH_INVALID_ROLE",
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

