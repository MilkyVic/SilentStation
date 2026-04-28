import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Clock, GraduationCap, Lock, Mail, School, Sparkles, User, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { authService } from '../../services/authService';
import type { AuthAccount, AuthRole, AuthResult } from '../../types/auth';

type TeacherRegCode = { code: string; expiry: number; className?: string } | null;

type AuthViewProps = {
  teacherRegCode: TeacherRegCode;
  schools: { id: string; name: string }[];
  onBack: () => void;
  onTeacherPending: (teacher: any) => void;
  onLoginSuccess: (account: AuthAccount) => void;
};

type RegisterRole = 'student' | 'teacher';

type AuthFormState = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  birthYear: string;
  gender: string;
  school: string;
  className: string;
  teacherType: 'homeroom' | 'subject';
  subject: string;
  role: AuthRole;
  regCode: string;
};

const STUDENT_ROLE = 'Học sinh' as AuthRole;
const TEACHER_ROLE = 'Giáo viên' as AuthRole;

const getAuthErrorMessage = (result: AuthResult, fallback: string) => {
  if ('error' in result) return result.error.message || fallback;
  return fallback;
};

const buildInitialForm = (): AuthFormState => ({
  username: '',
  password: '',
  fullName: '',
  email: '',
  birthYear: '',
  gender: '',
  school: '',
  className: '',
  teacherType: 'homeroom',
  subject: '',
  role: STUDENT_ROLE,
  regCode: '',
});

export default function AuthView({
  teacherRegCode: _teacherRegCode,
  schools,
  onBack,
  onTeacherPending,
  onLoginSuccess,
}: AuthViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [verificationStep, setVerificationStep] = useState<'none' | 'success'>('none');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState<AuthFormState>(buildInitialForm());

  const [otpSessionId, setOtpSessionId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpDelivery, setOtpDelivery] = useState<'gmail' | 'dev_console' | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  const otpExpiryDisplay = useMemo(() => {
    if (!otpExpiresAt) return null;
    return new Date(otpExpiresAt).toLocaleTimeString();
  }, [otpExpiresAt]);

  const resetOtpState = () => {
    setOtpSessionId('');
    setOtpCode('');
    setOtpDelivery(null);
    setOtpExpiresAt(null);
    setDevOtpCode(null);
  };

  const resetMessages = () => {
    setRegError(null);
    setRegSuccess(null);
  };

  const buildBaseProfile = (normalizedUsername: string) => ({
    name: authForm.fullName || authForm.username,
    email: authForm.email || `${normalizedUsername}@tram-an.vn`,
    birthYear: authForm.birthYear || '',
    gender: authForm.gender || '',
    school: authForm.school,
    className: authForm.className || '',
    teacherType: authForm.teacherType,
    subject: authForm.subject || '',
  });

  const requestOtpForRegister = async (
    role: RegisterRole,
    normalizedUsername: string,
    regCode?: string,
    className?: string,
    subject?: string,
  ) => {
    const baseProfile = buildBaseProfile(normalizedUsername);

    const otpResult = await authService.requestRegisterOtp({
      username: normalizedUsername,
      password: authForm.password,
      role,
      regCode,
      profile: {
        ...baseProfile,
        className: className ?? baseProfile.className,
        teacherType: role === 'teacher' ? baseProfile.teacherType : '',
        subject: role === 'teacher' ? (subject ?? baseProfile.subject) : '',
      },
    });

    if ('error' in otpResult) {
      setRegError(otpResult.error.message || 'Không thể gửi OTP.');
      return false;
    }

    setOtpSessionId(otpResult.data.otpSessionId);
    setOtpDelivery(otpResult.data.delivery);
    setOtpExpiresAt(new Date(otpResult.data.expiresAt).getTime());
    setDevOtpCode(otpResult.data.devOtpCode || null);

    setRegSuccess(
      otpResult.data.devOtpCode
        ? `Đã gửi OTP. Mã dev: ${otpResult.data.devOtpCode}`
        : 'Đã gửi OTP qua email của bạn.',
    );

    return true;
  };

  return (
    <motion.div
      key="auth"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto px-4 py-10 max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl">
        <div className="text-center mb-10 relative">
          <button
            onClick={() => {
              if (verificationStep !== 'none') {
                setVerificationStep('none');
                return;
              }
              onBack();
            }}
            className="absolute -left-2 top-0 p-2 text-gray-400 hover:text-brand-primary transition-colors"
          >
            <ArrowRight size={20} className="rotate-180" />
          </button>

          <h2 className="text-4xl font-serif italic text-brand-primary mb-2">
            {verificationStep === 'success'
              ? 'Đăng ký thành công'
              : authMode === 'login'
                ? 'Chào mừng trở lại'
                : 'Tạo tài khoản'}
          </h2>

          <p className="text-gray-500 text-sm">
            {verificationStep === 'success'
              ? 'Tài khoản của bạn đã sẵn sàng để sử dụng.'
              : authMode === 'login'
                ? 'Đăng nhập để tiếp tục hành trình của bạn.'
                : 'Đăng ký với vai trò và thông tin cá nhân.'}
          </p>
        </div>

        {verificationStep === 'success' ? (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
              <Sparkles size={48} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">Hoàn tất</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Bạn có thể đăng nhập ngay với tài khoản vừa tạo.</p>
            </div>

            <button
              onClick={() => {
                setVerificationStep('none');
                setAuthMode('login');
                resetMessages();
                resetOtpState();
                setAuthForm((prev) => ({ ...prev, password: '', regCode: '' }));
              }}
              className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-brand-primary/30 transition-all"
            >
              VỀ TRANG ĐĂNG NHẬP
            </button>
          </div>
        ) : (
          <>
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                resetMessages();

                const normalizedUsername = authForm.username.trim().toLowerCase();
                if (!normalizedUsername) {
                  setRegError('Vui lòng nhập tên đăng nhập.');
                  return;
                }

                if (authMode === 'register') {
                  const baseProfile = buildBaseProfile(normalizedUsername);

                  if (authForm.role === STUDENT_ROLE) {
                    if (!authForm.regCode.trim()) {
                      setRegError('Vui lòng nhập mã đăng ký học sinh.');
                      return;
                    }

                    if (!otpSessionId) {
                      await requestOtpForRegister('student', normalizedUsername, authForm.regCode.trim(), '', '');
                      return;
                    }

                    if (!otpCode.trim()) {
                      setRegError('Vui lòng nhập mã OTP đã nhận qua email.');
                      return;
                    }

                    const studentRegistration = await authService.registerStudent({
                      username: normalizedUsername,
                      password: authForm.password,
                      regCode: authForm.regCode.trim(),
                      otpSessionId,
                      otpCode: otpCode.trim(),
                      profile: {
                        ...baseProfile,
                        className: '',
                        teacherType: '',
                        subject: '',
                      },
                    });

                    if (!studentRegistration.ok) {
                      setRegError(getAuthErrorMessage(studentRegistration, 'Đăng ký học sinh thất bại.'));
                      return;
                    }

                    resetOtpState();
                    setVerificationStep('success');
                    return;
                  }

                  if (authForm.role === TEACHER_ROLE) {
                    if (authForm.teacherType !== 'homeroom' && authForm.teacherType !== 'subject') {
                      setRegError('Vui lòng chọn loại giáo viên.');
                      return;
                    }

                    const normalizedClassName = authForm.teacherType === 'homeroom' ? authForm.className.trim() : '';
                    const normalizedSubject = authForm.teacherType === 'subject' ? authForm.subject.trim() : '';

                    if (authForm.teacherType === 'homeroom' && !normalizedClassName) {
                      setRegError('Vui lòng nhập lớp chủ nhiệm.');
                      return;
                    }

                    if (authForm.teacherType === 'subject' && !normalizedSubject) {
                      setRegError('Vui lòng nhập môn giảng dạy.');
                      return;
                    }

                    if (!otpSessionId) {
                      await requestOtpForRegister(
                        'teacher',
                        normalizedUsername,
                        undefined,
                        normalizedClassName,
                        normalizedSubject,
                      );
                      return;
                    }

                    if (!otpCode.trim()) {
                      setRegError('Vui lòng nhập mã OTP đã nhận qua email.');
                      return;
                    }

                    const teacherRegistration = await authService.registerTeacherPending({
                      username: normalizedUsername,
                      password: authForm.password,
                      otpSessionId,
                      otpCode: otpCode.trim(),
                      profile: {
                        ...baseProfile,
                        className: normalizedClassName,
                        teacherType: authForm.teacherType,
                        subject: normalizedSubject,
                      },
                    });

                    if (!teacherRegistration.ok) {
                      setRegError(getAuthErrorMessage(teacherRegistration, 'Đăng ký giáo viên thất bại.'));
                      return;
                    }

                    const linkedSchoolId = schools.find((school) => school.name === authForm.school)?.id;
                    onTeacherPending({
                      id: `p${Date.now()}`,
                      name: authForm.fullName || authForm.username,
                      fullName: authForm.fullName || authForm.username,
                      school: authForm.school,
                      schoolId: linkedSchoolId,
                      username: normalizedUsername,
                      className: normalizedClassName,
                      teacherType: authForm.teacherType,
                      subject: normalizedSubject,
                      role: TEACHER_ROLE,
                      timestamp: Date.now(),
                    });

                    resetOtpState();
                    setRegSuccess('Yêu cầu đăng ký đã được gửi. Vui lòng chờ Admin phê duyệt.');
                    setAuthMode('login');
                    return;
                  }

                  setRegError('Vai trò đăng ký không hợp lệ.');
                  return;
                }

                const loginResult = await authService.login({
                  username: normalizedUsername,
                  password: authForm.password,
                });

                if (!loginResult.ok) {
                  setRegError(getAuthErrorMessage(loginResult, 'Đăng nhập thất bại.'));
                  return;
                }

                onLoginSuccess(loginResult.account);
              }}
            >
              {regError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-bold text-center"
                >
                  {regError}
                </motion.div>
              )}

              {regSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-xs font-bold text-center"
                >
                  {regSuccess}
                </motion.div>
              )}

              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Vai trò</label>
                  <div className="flex flex-wrap gap-4">
                    {[STUDENT_ROLE, TEACHER_ROLE].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          resetMessages();
                          resetOtpState();
                          setAuthForm((prev) => ({
                            ...prev,
                            role,
                            teacherType: role === TEACHER_ROLE ? prev.teacherType : 'homeroom',
                            subject: role === TEACHER_ROLE ? prev.subject : '',
                            className: role === TEACHER_ROLE ? prev.className : '',
                            regCode: role === STUDENT_ROLE ? prev.regCode : '',
                          }));
                        }}
                        className={cn(
                          'flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all',
                          authForm.role === role
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  {authForm.role === TEACHER_ROLE && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-brand-orange font-bold italic ml-2 mt-2"
                    >
                      Tài khoản giáo viên cần được Admin phê duyệt trước khi đăng nhập lần đầu.
                    </motion.p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={authForm.fullName}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Năm sinh</label>
                      <div className="relative">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          value={authForm.birthYear}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, birthYear: e.target.value }))}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                          placeholder="YYYY"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Giới tính</label>
                      <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          required
                          value={authForm.gender}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, gender: e.target.value }))}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700 appearance-none"
                        >
                          <option value="">Chọn</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        value={authForm.email}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                        placeholder="Nhập địa chỉ email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Trường</label>
                    <div className="relative">
                      <School className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={authForm.school}
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, school: e.target.value }))}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                        placeholder="Nhập tên trường"
                      />
                    </div>
                  </div>

                  {authForm.role === TEACHER_ROLE && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Loại giáo viên</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'homeroom', label: 'Giáo viên chủ nhiệm' },
                            { id: 'subject', label: 'Giáo viên bộ môn' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                resetMessages();
                                resetOtpState();
                                setAuthForm((prev) => ({
                                  ...prev,
                                  teacherType: item.id as 'homeroom' | 'subject',
                                  className: item.id === 'homeroom' ? prev.className : '',
                                  subject: item.id === 'subject' ? prev.subject : '',
                                }));
                              }}
                              className={cn(
                                'px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                                authForm.teacherType === item.id
                                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                  : 'bg-gray-50 text-gray-500 hover:bg-brand-primary/10 hover:text-brand-primary',
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {authForm.teacherType === 'homeroom' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Lớp chủ nhiệm</label>
                          <div className="relative">
                            <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              required
                              value={authForm.className}
                              onChange={(e) => setAuthForm((prev) => ({ ...prev, className: e.target.value }))}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                              placeholder="Nhập tên lớp"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Môn giảng dạy</label>
                          <div className="relative">
                            <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              required
                              value={authForm.subject}
                              onChange={(e) => setAuthForm((prev) => ({ ...prev, subject: e.target.value }))}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                              placeholder="VD: Toán, Ngữ văn, Tiếng Anh"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {authForm.role === STUDENT_ROLE && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Mã đăng ký</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          value={authForm.regCode}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, regCode: e.target.value }))}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                          placeholder="Nhập mã từ giáo viên"
                        />
                      </div>
                    </div>
                  )}

                  {otpSessionId && (
                    <div className="space-y-3 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4">
                      <p className="text-[11px] font-bold text-brand-primary">
                        Nhập mã OTP email để hoàn tất đăng ký {otpDelivery === 'gmail' ? '(đã gửi qua Gmail)' : '(chế độ dev)'}.
                      </p>

                      {otpExpiryDisplay && (
                        <p className="text-[10px] text-gray-500">Hết hạn lúc: {otpExpiryDisplay}</p>
                      )}

                      {devOtpCode && (
                        <p className="text-[10px] text-brand-orange font-bold">OTP dev: {devOtpCode}</p>
                      )}

                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                        placeholder="Nhập mã OTP email"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          resetOtpState();
                          setRegSuccess('Đã reset OTP. Bấm ĐĂNG KÝ để gửi mã mới.');
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                      >
                        Gửi lại OTP
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-brand-primary/30 transition-all mt-4"
              >
                {authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  const newMode = authMode === 'login' ? 'register' : 'login';
                  resetMessages();
                  resetOtpState();
                  setAuthMode(newMode);
                  setAuthForm((prev) => ({
                    ...prev,
                    password: '',
                    regCode: '',
                    role: newMode === 'register' ? (prev.role === TEACHER_ROLE ? TEACHER_ROLE : STUDENT_ROLE) : prev.role,
                    teacherType: prev.role === TEACHER_ROLE ? prev.teacherType : 'homeroom',
                    subject: prev.role === TEACHER_ROLE ? prev.subject : '',
                  }));
                }}
                className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest"
              >
                {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}


