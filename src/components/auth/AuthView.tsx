import { useState } from 'react';
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

const STUDENT_ROLE = 'H\u1ECDc sinh' as AuthRole;
const TEACHER_ROLE = 'Gi\u00E1o vi\u00EAn' as AuthRole;

const getAuthErrorMessage = (
  result: AuthResult,
  fallback: string,
) => {
  if ('error' in result) {
    return result.error.message || fallback;
  }

  return fallback;
};

export default function AuthView({
  teacherRegCode,
  schools,
  onBack,
  onTeacherPending,
  onLoginSuccess,
}: AuthViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [verificationStep, setVerificationStep] = useState<'none' | 'success'>('none');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    birthYear: '',
    gender: '',
    school: '',
    className: '',
    teacherType: 'homeroom' as 'homeroom' | 'subject',
    subject: '',
    role: STUDENT_ROLE,
    regCode: '',
  });

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
              <p className="text-gray-500 text-sm leading-relaxed">
                Bạn có thể đăng nhập ngay với tài khoản vừa tạo.
              </p>
            </div>
            <button
              onClick={() => {
                setVerificationStep('none');
                setAuthMode('login');
                setAuthForm({ ...authForm, password: '', regCode: '' });
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
                setRegError(null);
                setRegSuccess(null);

                const normalizedUsername = authForm.username.trim().toLowerCase();
                if (!normalizedUsername) {
                  setRegError('Vui lòng nhập tên đăng nhập.');
                  return;
                }

                if (authMode === 'register') {
                  if (authForm.role === STUDENT_ROLE) {
                    if (!authForm.regCode) {
                      setRegError('Vui lòng nhập mã đăng ký học sinh.');
                      return;
                    }

                    if (
                      !teacherRegCode ||
                      authForm.regCode !== teacherRegCode.code ||
                      Date.now() > teacherRegCode.expiry
                    ) {
                      setRegError('Mã đăng ký không hợp lệ hoặc đã hết hạn.');
                      return;
                    }

                    const assignedClassName =
                      teacherRegCode.className || authForm.className || 'Lớp mặc định';
                    const studentRegistration = await authService.registerStudent({
                      username: normalizedUsername,
                      password: authForm.password,
                      regCode: authForm.regCode,
                      profile: {
                        name: authForm.fullName || authForm.username,
                        email: authForm.email || `${normalizedUsername}@tram-an.vn`,
                        birthYear: authForm.birthYear || '',
                        gender: authForm.gender || '',
                        school: authForm.school,
                        className: assignedClassName,
                        teacherType: '',
                        subject: '',
                      },
                    });

                    if (!studentRegistration.ok) {
                      setRegError(getAuthErrorMessage(studentRegistration, 'Đăng ký học sinh thất bại.'));
                      return;
                    }

                    setVerificationStep('success');
                    return;
                  }

                  if (authForm.role === TEACHER_ROLE) {
                    if (authForm.teacherType !== 'homeroom' && authForm.teacherType !== 'subject') {
                      setRegError('Vui long chon loai giao vien.');
                      return;
                    }

                    if (authForm.teacherType === 'homeroom' && !authForm.className.trim()) {
                      setRegError('Vui long nhap lop chu nhiem.');
                      return;
                    }

                    if (authForm.teacherType === 'subject' && !authForm.subject.trim()) {
                      setRegError('Vui long nhap mon giang day.');
                      return;
                    }

                    const linkedSchoolId = schools.find((school) => school.name === authForm.school)?.id;
                    const normalizedClassName =
                      authForm.teacherType === 'homeroom' ? authForm.className.trim() : '';
                    const normalizedSubject =
                      authForm.teacherType === 'subject' ? authForm.subject.trim() : '';

                    const newPendingTeacher = {
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
                    };

                    const teacherRegistration = await authService.registerTeacherPending({
                      username: normalizedUsername,
                      password: authForm.password,
                      profile: {
                        name: authForm.fullName || authForm.username,
                        email: authForm.email || `${normalizedUsername}@tram-an.vn`,
                        birthYear: authForm.birthYear || '',
                        gender: authForm.gender || '',
                        school: authForm.school,
                        className: normalizedClassName,
                        teacherType: authForm.teacherType,
                        subject: normalizedSubject,
                      },
                    });

                    if (!teacherRegistration.ok) {
                      setRegError(getAuthErrorMessage(teacherRegistration, 'Đăng ký giáo viên thất bại.'));
                      return;
                    }

                    setRegSuccess('Yêu cầu đăng ký đã được gửi. Vui lòng chờ Admin phê duyệt.');
                    onTeacherPending(newPendingTeacher);
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                    Vai trò
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[STUDENT_ROLE, TEACHER_ROLE].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() =>
                          setAuthForm({
                            ...authForm,
                            role,
                            teacherType: role === TEACHER_ROLE ? authForm.teacherType : 'homeroom',
                            subject: role === TEACHER_ROLE ? authForm.subject : '',
                            className: role === TEACHER_ROLE ? authForm.className : '',
                          })
                        }
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={authForm.fullName}
                        onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                        Năm sinh
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          value={authForm.birthYear}
                          onChange={(e) => setAuthForm({ ...authForm, birthYear: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                          placeholder="YYYY"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                        Giới tính
                      </label>
                      <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          required
                          value={authForm.gender}
                          onChange={(e) => setAuthForm({ ...authForm, gender: e.target.value })}
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                        placeholder="Nhập địa chỉ email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                      Trường
                    </label>
                    <div className="relative">
                      <School className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={authForm.school}
                        onChange={(e) => setAuthForm({ ...authForm, school: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                        placeholder="Nhập tên trường"
                      />
                    </div>
                  </div>

                  {authForm.role === TEACHER_ROLE && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                          Loại giáo viên
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'homeroom', label: 'Giáo viên chủ nhiệm' },
                            { id: 'subject', label: 'Giáo viên bộ môn' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setAuthForm({
                                  ...authForm,
                                  teacherType: item.id as 'homeroom' | 'subject',
                                  className: item.id === 'homeroom' ? authForm.className : '',
                                  subject: item.id === 'subject' ? authForm.subject : '',
                                })
                              }
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
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                            Lớp chủ nhiệm
                          </label>
                          <div className="relative">
                            <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              required
                              value={authForm.className}
                              onChange={(e) => setAuthForm({ ...authForm, className: e.target.value })}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                              placeholder="Nhập tên lớp"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                            Môn giảng dạy
                          </label>
                          <div className="relative">
                            <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              required
                              value={authForm.subject}
                              onChange={(e) => setAuthForm({ ...authForm, subject: e.target.value })}
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
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">
                        Mã đăng ký
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          value={authForm.regCode}
                          onChange={(e) => setAuthForm({ ...authForm, regCode: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700"
                          placeholder="Nhập mã từ giáo viên"
                        />
                      </div>
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
                  setRegError(null);
                  setRegSuccess(null);
                  setAuthMode(newMode);
                  setAuthForm({
                    ...authForm,
                    password: '',
                    regCode: '',
                    role: newMode === 'register'
                      ? (authForm.role === TEACHER_ROLE ? TEACHER_ROLE : STUDENT_ROLE)
                      : authForm.role,
                    teacherType: authForm.role === TEACHER_ROLE ? authForm.teacherType : 'homeroom',
                    subject: authForm.role === TEACHER_ROLE ? authForm.subject : '',
                  });
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

