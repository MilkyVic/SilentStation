import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import { authService } from './authService';

const buildRegisterPayload = (username: string) => ({
  username,
  password: '123456',
  profile: {
    name: `User ${username}`,
    email: `${username}@example.com`,
    birthYear: '2000',
    gender: 'Other',
    school: 'Demo School',
    className: '12A1',
    teacherType: 'homeroom' as const,
    subject: '',
  },
});

describe('authService', () => {
  beforeEach(() => {
    authService.__resetForTests();
  });

  test('logs in with seeded account and restores session', async () => {
    const login = await authService.login({
      username: 'student_test',
      password: '123456',
    });

    assert.equal(login.ok, true);
    if (!login.ok) {
      return;
    }

    const session = await authService.getCurrentSession();
    assert.ok(session);
    assert.equal(session?.id, login.account.id);
  });

  test('logs in with seeded subject teacher account', async () => {
    const login = await authService.login({
      username: 'teacher_subject_test',
      password: '123456',
    });

    assert.equal(login.ok, true);
    if (!login.ok) {
      return;
    }

    assert.equal(login.account.status, 'active');
  });

  test('returns AUTH_INVALID_CREDENTIALS when password is wrong', async () => {
    const login = await authService.login({
      username: 'student_test',
      password: 'wrong-pass',
    });

    assert.equal(login.ok, false);
    if (login.ok) {
      return;
    }

    assert.equal(login.error.code, 'AUTH_INVALID_CREDENTIALS');
  });

  test('returns AUTH_USERNAME_EXISTS when username is duplicated', async () => {
    const register = await authService.registerStudent(buildRegisterPayload('student_test'));

    assert.equal(register.ok, false);
    if (register.ok) {
      return;
    }

    assert.equal(register.error.code, 'AUTH_USERNAME_EXISTS');
  });

  test('teacher account must be approved before login', async () => {
    const register = await authService.registerTeacherPending(buildRegisterPayload('teacher_pending_case'));
    assert.equal(register.ok, true);
    if (!register.ok) {
      return;
    }

    const loginPending = await authService.login({
      username: 'teacher_pending_case',
      password: '123456',
    });
    assert.equal(loginPending.ok, false);
    if (loginPending.ok) {
      return;
    }
    assert.equal(loginPending.error.code, 'AUTH_PENDING_APPROVAL');

    const approved = authService.approveTeacherAccount('teacher_pending_case');
    assert.ok(approved);
    assert.equal(approved?.status, 'active');

    const loginAfterApproval = await authService.login({
      username: 'teacher_pending_case',
      password: '123456',
    });
    assert.equal(loginAfterApproval.ok, true);
  });

  test('logout clears current session', async () => {
    const login = await authService.login({
      username: 'admin_test',
      password: '123456',
    });
    assert.equal(login.ok, true);

    await authService.logout();
    assert.equal(await authService.getCurrentSession(), null);
  });
});

