import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Menu, 
  X, 
  Zap, 
  Heart, 
  Code,
  Info,
  Home,
  Phone,
  MessageCircle,
  Send,
  ExternalLink,
  Mail,
  MapPin,
  Globe,
  User,
  Camera,
  LogOut,
  LogIn,
  ArrowRight,
  School,
  Sparkles,
  Lock,
  Mail as MailIcon,
  GraduationCap,
  Users,
  Clock,
  Bell,
  Trash2,
  Settings,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Eye,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { HANDBOOK_DATA } from './data';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { authService } from './services/authService';
import { chatService } from './services/chatService';
import type { AuthAccount, AuthRole } from './types/auth';
import type { ChatUiMessage } from './types/chat';
import AuthView from './components/auth/AuthView';

const MOCK_STUDENTS = [
  { id: '1', name: 'Nguyễn Văn An', username: 'an_nguyen', gender: 'Nam', stressLevel: 65, testsCompleted: 4, className: '12A1', schoolId: 's1', phone: '0912345678', dob: '2008-05-15', accomType: 'Hosteller', transport: 'No', location: 'Singanallur', rank: '001', points: 65 },
  { id: '2', name: 'Trần Thị Bình', username: 'binh_tran', gender: 'Nữ', stressLevel: 42, testsCompleted: 6, className: '12A1', schoolId: 's1', phone: '0987654321', dob: '2008-11-20', accomType: 'Day Scholar', transport: 'Yes', location: 'Peelamedu', rank: '005', points: 42 },
  { id: '3', name: 'Lê Hoàng Nam', username: 'nam_le', gender: 'Nam', stressLevel: 78, testsCompleted: 2, className: '12A2', schoolId: 's2', phone: '0900112233', dob: '2008-02-10', accomType: 'Hosteller', transport: 'No', location: 'Gandhipuram', rank: '012', points: 78 },
  { id: '4', name: 'Phạm Minh Huệ', username: 'hue_pham', gender: 'Nữ', stressLevel: 35, testsCompleted: 5, className: '12A2', schoolId: 's2', phone: '0933445566', dob: '2008-07-25', accomType: 'Day Scholar', transport: 'Yes', location: 'RS Puram', rank: '002', points: 35 },
  { id: '5', name: 'Võ Văn Đức', username: 'duc_vo', gender: 'Nam', stressLevel: 55, testsCompleted: 3, className: '11B1', schoolId: 's3', phone: '0966778899', dob: '2009-01-12', accomType: 'Hosteller', transport: 'No', location: 'Saibaba Colony', rank: '008', points: 55 },
  { id: '6', name: 'Đặng Thu Thảo', username: 'thao_dang', gender: 'Nữ', stressLevel: 82, testsCompleted: 1, className: '11B1', schoolId: 's3', phone: '0911223344', dob: '2009-09-30', accomType: 'Day Scholar', transport: 'No', location: 'Race Course', rank: '020', points: 82 },
  { id: '7', name: 'Bùi Anh Tuấn', username: 'tuan_bui', gender: 'Nam', stressLevel: 48, testsCompleted: 4, className: '10C1', schoolId: 's1', phone: '0922334455', dob: '2010-03-18', accomType: 'Hosteller', transport: 'Yes', location: 'Vadavalli', rank: '004', points: 48 },
  { id: '8', name: 'Ngô Mỹ Linh', username: 'linh_ngo', gender: 'Nữ', stressLevel: 60, testsCompleted: 5, className: '10C1', schoolId: 's1', phone: '0944556677', dob: '2010-12-05', accomType: 'Day Scholar', transport: 'No', location: 'Thudiyalur', rank: '003', points: 60 },
  { id: '9', name: 'Hoàng Văn Cường', username: 'cuong_hoang', gender: 'Nam', stressLevel: 25, testsCompleted: 3, className: '12A1', schoolId: 's1', phone: '0911223355', dob: '2008-04-10', accomType: 'Day Scholar', transport: 'Yes', location: 'Hà Nội', rank: '010', points: 25 },
  { id: '10', name: 'Lý Thu Trang', username: 'trang_ly', gender: 'Nữ', stressLevel: 90, testsCompleted: 2, className: '12A1', schoolId: 's1', phone: '0922334466', dob: '2008-08-15', accomType: 'Hosteller', transport: 'No', location: 'Hà Nội', rank: '015', points: 90 },
  { id: '11', name: 'Mai Xuân Tùng', username: 'tung_mai', gender: 'Nam', stressLevel: 50, testsCompleted: 4, className: '12A2', schoolId: 's2', phone: '0933445577', dob: '2008-12-20', accomType: 'Day Scholar', transport: 'No', location: 'Hà Nội', rank: '007', points: 50 },
  { id: '12', name: 'Trịnh Công Sơn', username: 'son_trinh', gender: 'Nam', stressLevel: 15, testsCompleted: 5, className: '11B1', schoolId: 's3', phone: '0944556688', dob: '2009-03-05', accomType: 'Day Scholar', transport: 'Yes', location: 'Hà Nội', rank: '025', points: 15 },
];

const MOCK_TEACHERS = [
  { id: 't1', name: 'Nguyễn Thị Minh', fullName: 'Nguyễn Thị Minh', username: 'minh_nguyen', email: 'minh.nguyen@school.edu.vn', phoneNumber: '0912345678', birthYear: '1985', school: 'THPT Chuyên Hà Nội - Amsterdam', schoolId: 's1', role: 'Giáo viên', className: '12A1' },
  { id: 't2', name: 'Trần Văn Hùng', fullName: 'Trần Văn Hùng', username: 'hung_tran', email: 'hung.tran@school.edu.vn', phoneNumber: '0987654321', birthYear: '1980', school: 'THPT Chu Văn An', schoolId: 's2', role: 'Giáo viên', className: '12A2' },
  { id: 't3', name: 'Lê Thị Mai', fullName: 'Lê Thị Mai', username: 'mai_le', email: 'mai.le@school.edu.vn', phoneNumber: '0900112233', birthYear: '1990', school: 'THPT Phan Đình Phùng', schoolId: 's3', role: 'Giáo viên', className: '11B1' },
];

const MOCK_CLASSES = [
  { id: 'c1', name: '12A1', studentCount: 45, avgStress: 52, teacherName: 'Nguyễn Thị Minh', schoolId: 's1' },
  { id: 'c2', name: '12A2', studentCount: 42, avgStress: 68, teacherName: 'Trần Văn Hùng', schoolId: 's2' },
  { id: 'c3', name: '11B1', studentCount: 48, avgStress: 45, teacherName: 'Lê Thị Mai', schoolId: 's3' },
  { id: 'c4', name: '10C1', studentCount: 50, avgStress: 38, teacherName: 'Phạm Văn Dũng', schoolId: 's1' },
  { id: 'c5', name: '12D1', studentCount: 40, avgStress: 55, teacherName: 'Hoàng Thị Lan', schoolId: 's2' },
];

const MOCK_ADMINS = [
  { id: 'a1', name: 'Nguyễn Văn Quản', username: 'admin_amsterdam', school: 'THPT Chuyên Hà Nội - Amsterdam', schoolId: 's1', role: 'Admin' },
  { id: 'a2', name: 'Trần Minh Lý', username: 'admin_chuvanan', school: 'THPT Chu Văn An', schoolId: 's2', role: 'Admin' },
  { id: 'a3', name: 'Lê Thu Hà', username: 'admin_phandinhphung', school: 'THPT Phan Đình Phùng', schoolId: 's3', role: 'Admin' },
];

const MOCK_SCHOOLS = [
  { id: 's1', name: 'THPT Chuyên Hà Nội - Amsterdam', address: '1 Hoàng Minh Giám, Cầu Giấy, Hà Nội', teacherCount: 120, classCount: 45, adminId: 'a1' },
  { id: 's2', name: 'THPT Chu Văn An', address: '10 Thụy Khuê, Tây Hồ, Hà Nội', teacherCount: 110, classCount: 42, adminId: 'a2' },
  { id: 's3', name: 'THPT Phan Đình Phùng', address: '67B Cửa Bắc, Ba Đình, Hà Nội', teacherCount: 95, classCount: 38, adminId: 'a3' },
];

const STRESS_LEVEL_DATA = [
  { name: 'Thấp (0-30)', value: 1, color: '#10B981' },
  { name: 'Trung bình (31-60)', value: 4, color: '#F59E0B' },
  { name: 'Cao (61-85)', value: 2, color: '#EF4444' },
  { name: 'Rất cao (>85)', value: 1, color: '#7C3AED' },
];

const STRESS_HISTORY_DATA = [
  { month: 'Tháng 1', avg: 45 },
  { month: 'Tháng 2', avg: 52 },
  { month: 'Tháng 3', avg: 48 },
  { month: 'Tháng 4', avg: 61 },
];

const IconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={18} />,
  Zap: <Zap size={18} />,
  Heart: <Heart size={18} />,
  Code: <Code size={18} />,
  Info: <Info size={18} />,
  School: <School size={18} />,
  Sparkles: <Sparkles size={18} />,
};

type View = 'home' | 'handbook' | 'test-list' | 'contact' | 'auth' | 'admin' | 'superadmin' | 'test-editor' | 'test-taking' | 'account' | 'settings' | 'admin-list' | 'school-list' | 'class-list' | 'teacher-list' | 'reports' | 'teacher-class';

type Question = {
  id: string;
  text: string;
  options: { id: string; text: string; score: number }[];
};

type TestResult = {
  id: string;
  testId: string;
  testTitle: string;
  userId: string;
  userName: string;
  username: string;
  userRole: string;
  userClass?: string;
  score: number;
  timestamp: number;
};

const createChatMessage = (role: 'user' | 'assistant', text: string, sources: string[] = []): ChatUiMessage => ({
  id: `chat-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  text,
  createdAt: Date.now(),
  ...(sources.length ? { sources } : {}),
});

const TestEditorView = ({ 
  test, 
  onSave, 
  onBack 
}: { 
  test: any, 
  onSave: (updatedTest: any) => void, 
  onBack: () => void 
}) => {
  const [questions, setQuestions] = useState<Question[]>(test?.questionList || []);
  const [title, setTitle] = useState(test?.title || 'Bài test mới');
  const [desc, setDesc] = useState(test?.desc || 'Mô tả bài test');
  const [time, setTime] = useState(test?.time || '15 phút');
  const [targetAudience, setTargetAudience] = useState(test?.targetAudience || 'Học sinh');
  const [icon, setIcon] = useState(test?.icon || 'Zap');
  const [color, setColor] = useState(test?.color || 'bg-brand-primary');

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      text: "Câu hỏi mới",
      options: [
        { id: `o${Date.now()}-1`, text: "Lựa chọn 1", score: 0 },
        { id: `o${Date.now()}-2`, text: "Lựa chọn 2", score: 0 }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: [...q.options, { id: `o${Date.now()}`, text: "Lựa chọn mới", score: 0 }]
        };
      }
      return q;
    }));
  };

  const updateOption = (qId: string, oId: string, updates: any) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.map(o => o.id === oId ? { ...o, ...updates } : o)
        };
      }
      return q;
    }));
  };

  const deleteOption = (qId: string, oId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.filter(o => o.id !== oId)
        };
      }
      return q;
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto px-4 py-20"
    >
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:shadow-lg transition-all"
          >
            <ArrowRight size={20} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-3xl font-serif italic text-brand-primary">Quản lý câu hỏi</h2>
            <p className="text-gray-500 font-medium">{title}</p>
          </div>
        </div>
        <button 
          onClick={() => onSave({ ...test, title, desc, time, targetAudience, icon, color, questionList: questions, questions: `${questions.length} câu` })}
          className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all"
        >
          LƯU TẤT CẢ
        </button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm mb-8 space-y-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Tiêu đề bài test</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold text-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Mô tả</label>
          <textarea 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-brand-primary/10 outline-none resize-none h-24"
          />
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Thời gian</label>
            <input 
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-brand-primary/10 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Đối tượng</label>
            <select 
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-brand-primary/10 outline-none"
            >
              <option value="Học sinh">Học sinh</option>
              <option value="Giáo viên">Giáo viên</option>
              <option value="Cả hai">Cả hai</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Biểu tượng</label>
            <select 
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-brand-primary/10 outline-none"
            >
              <option value="Zap">Tia chớp</option>
              <option value="Heart">Trái tim</option>
              <option value="Users">Người dùng</option>
              <option value="Clock">Đồng hồ</option>
              <option value="School">Trường học</option>
              <option value="AlertCircle">Cảnh báo</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Màu sắc</label>
            <select 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-600 focus:ring-2 focus:ring-brand-primary/10 outline-none"
            >
              <option value="bg-brand-primary">Xanh ngọc</option>
              <option value="bg-brand-secondary">Xanh dương</option>
              <option value="bg-brand-orange">Cam</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-8 gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Câu hỏi {qIndex + 1}</label>
                <input 
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestionText(q.id, e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold text-brand-primary focus:ring-2 focus:ring-brand-primary/10 outline-none"
                />
              </div>
              <button 
                onClick={() => deleteQuestion(q.id)}
                className="mt-8 p-3 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Các lựa chọn trả lời</label>
              {q.options.map((o) => (
                <div key={o.id} className="flex items-center gap-4">
                  <input 
                    type="text"
                    value={o.text}
                    onChange={(e) => updateOption(q.id, o.id, { text: e.target.value })}
                    className="flex-1 px-6 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/10 outline-none"
                  />
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ĐIỂM:</span>
                    <input 
                      type="number"
                      value={o.score}
                      onChange={(e) => updateOption(q.id, o.id, { score: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-transparent border-none text-sm font-black text-brand-primary focus:ring-0 outline-none text-center"
                    />
                  </div>
                  <button 
                    onClick={() => deleteOption(q.id, o.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => addOption(q.id)}
                className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-brand-primary/20 hover:text-brand-primary transition-all"
              >
                + THÊM LỰA CHỌN
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addQuestion}
          className="w-full py-8 border-2 border-dashed border-brand-primary/20 rounded-[3rem] flex flex-col items-center justify-center gap-4 group hover:bg-brand-primary/5 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <span className="text-xs font-black text-brand-primary uppercase tracking-[0.2em]">THÊM CÂU HỎI MỚI</span>
        </button>
      </div>
    </motion.div>
  );
};

const AccountView = ({ 
  userData, 
  onSave, 
  onBack,
  teacherRegCode,
  setTeacherRegCode
}: { 
  userData: any, 
  onSave: (updatedData: any) => void, 
  onBack: () => void,
  teacherRegCode?: { code: string, expiry: number, className?: string } | null,
  setTeacherRegCode?: (code: { code: string, expiry: number, className?: string } | null) => void
}) => {
  const [formData, setFormData] = useState({ ...userData });
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(!!userData.phoneNumber);
  
  const [tick, setTick] = useState(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generateCodeError, setGenerateCodeError] = useState<string | null>(null);
  const [activeCodes, setActiveCodes] = useState<Array<{ id: string; className: string; school: string; expiresAt: string; maxUses: number; usedCount: number }>>([]);
  const [isCodesLoading, setIsCodesLoading] = useState(false);
  const [codesError, setCodesError] = useState<string | null>(null);
  const [revokingCodeId, setRevokingCodeId] = useState<string | null>(null);
  const [codeEvents, setCodeEvents] = useState<Array<{ id: string; eventType: string; className: string; school: string; studentUsername: string; note: string; createdAt: string }>>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsPage, setEventsPage] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleValue = typeof userData.role === 'string' ? userData.role : '';
  const isTeacherRole = roleValue === 'Giáo viên';
  const isSuperAdminRole = roleValue === 'Quản trị viên cấp cao';
  const isHomeroomTeacher = isTeacherRole
    && (userData.teacherType === 'homeroom' || (!userData.teacherType && userData.className));
  const canViewCodeEvents = isHomeroomTeacher || roleValue === 'Admin' || isSuperAdminRole;
  const eventsPageSize = 6;
  const eventsTotalPages = Math.max(1, Math.ceil(codeEvents.length / eventsPageSize));
  const pagedCodeEvents = codeEvents.slice(
    (eventsPage - 1) * eventsPageSize,
    eventsPage * eventsPageSize,
  );

  useEffect(() => {
    if (eventsPage > eventsTotalPages) {
      setEventsPage(eventsTotalPages);
    }
  }, [eventsPage, eventsTotalPages]);

  const loadActiveCodes = async () => {
    if (!isHomeroomTeacher) return;
    setIsCodesLoading(true);
    setCodesError(null);

    const result = await authService.listActiveClassJoinCodes();

    if ('error' in result) {
      setCodesError(result.error.message || 'Không thể tải danh sách mã lớp.');
      setIsCodesLoading(false);
      return;
    }

    const className = (userData.className || formData.className || '').trim();
    const nextCodes = result.data.filter((item) => !className || item.className === className);
    setActiveCodes(nextCodes);
    setIsCodesLoading(false);
  };

  const loadCodeEvents = async () => {
    if (!canViewCodeEvents) return;
    setIsEventsLoading(true);
    setEventsError(null);

    const result = await authService.listClassJoinCodeEvents(60);

    if ('error' in result) {
      setEventsError(result.error.message || 'Không thể tải lịch sử mã lớp.');
      setIsEventsLoading(false);
      return;
    }

    setCodeEvents(result.data);
    setIsEventsLoading(false);
  };

  useEffect(() => {
    if (!isHomeroomTeacher) return;

    void loadActiveCodes();
    const poll = setInterval(() => {
      void loadActiveCodes();
    }, 15000);

    return () => clearInterval(poll);
  }, [isHomeroomTeacher, userData.className, formData.className]);

  useEffect(() => {
    if (!canViewCodeEvents) return;

    void loadCodeEvents();
    const poll = setInterval(() => {
      void loadCodeEvents();
    }, 15000);

    return () => clearInterval(poll);
  }, [canViewCodeEvents]);

  const handleRevokeCode = async (codeId: string) => {
    setRevokingCodeId(codeId);
    setCodesError(null);

    const result = await authService.revokeClassJoinCode(codeId);

    if ('error' in result) {
      setCodesError(result.error.message || 'Không thể thu hồi mã lớp.');
      setRevokingCodeId(null);
      return;
    }

    if (teacherRegCode?.code && activeCodes.find((item) => item.id === codeId)) {
      setTeacherRegCode?.(null);
    }

    setRevokingCodeId(null);
    await loadActiveCodes();
    await loadCodeEvents();
  };

  const handleGenerateCode = async () => {
    if (!setTeacherRegCode) return;

    const className = (userData.className || formData.className || '').trim();
    if (!className) {
      setGenerateCodeError('Không tìm thấy lớp chủ nhiệm để tạo mã.');
      return;
    }

    setGenerateCodeError(null);
    setIsGeneratingCode(true);
    try {
      const result = await authService.createClassJoinCode({ className });

      if ('error' in result) {
        setGenerateCodeError(result.error.message || 'Không thể tạo mã lớp. Vui lòng thử lại.');
        return;
      }

      const expiresAtMs = new Date(result.data.info.expiresAt).getTime();
      setTeacherRegCode({
        code: result.data.code,
        expiry: Number.isFinite(expiresAtMs) ? expiresAtMs : Date.now(),
        className: result.data.info.className,
      });

      await loadActiveCodes();
      await loadCodeEvents();
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleVerifyPhone = () => {
    if (otpCode === '123456') {
      setIsPhoneVerified(true);
      setIsOtpModalOpen(false);
      setOtpCode('');
      alert('Xác nhận số điện thoại thành công!');
    } else {
      alert('Mã OTP không chính xác (Mã mẫu: 123456)');
    }
  };

  const formatEventType = (eventType: string) => {
    if (eventType === 'created') return 'Tạo mã';
    if (eventType === 'revoked') return 'Thu hồi';
    if (eventType === 'redeem_success') return 'Dùng mã thành công';
    return 'Dùng mã thất bại';
  };

  const formatEventTypeClassName = (eventType: string) => {
    if (eventType === 'created') return 'bg-brand-primary/10 text-brand-primary';
    if (eventType === 'revoked') return 'bg-red-100 text-red-600';
    if (eventType === 'redeem_success') return 'bg-green-100 text-green-600';
    return 'bg-amber-100 text-amber-700';
  };

  const formatEventNote = (note: string) => {
    if (note === 'teacher_created_code') return 'Giáo viên tạo mã mới';
    if (note === 'manual_revoke') return 'Thu hồi thủ công';
    if (note === 'student_registered') return 'Học sinh đăng ký thành công';
    if (note === 'invalid_code_not_found') return 'Mã không tồn tại';
    if (note === 'expired') return 'Mã đã hết hạn';
    if (note === 'max_uses_reached') return 'Mã đã hết lượt sử dụng';
    if (note === 'inactive_status') return 'Mã đã bị vô hiệu hóa';
    return note || 'Không có ghi chú';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto px-4 py-20"
    >
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:shadow-lg transition-all"
        >
          <ArrowRight size={20} className="rotate-180" />
        </button>
        <div>
          <h2 className="text-4xl font-serif italic text-brand-primary">Thông tin cá nhân</h2>
          <p className="text-gray-500 font-medium">Cập nhật thông tin tài khoản của bạn tại đây.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-brand-primary/10 shadow-xl">
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                <Camera size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black text-brand-primary mb-1">{formData.name}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{formData.role}</p>
            <div className="pt-6 border-t border-gray-50 space-y-4">
              <div className="flex items-center justify-between text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tài khoản</span>
                <span className="text-xs font-bold text-brand-primary">@{formData.username}</span>
              </div>
              <div className="flex items-center justify-between text-left">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tham gia</span>
                <span className="text-xs font-bold text-gray-500">06/04/2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Họ và tên</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Tên tài khoản</label>
                <input 
                  type="text" 
                  value={formData.username}
                  disabled
                  className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-none outline-none font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Năm sinh</label>
                <input 
                  type="text" 
                  value={formData.birthYear}
                  onChange={(e) => setFormData({...formData, birthYear: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Giới tính</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700 appearance-none"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Số điện thoại</label>
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      setFormData({...formData, phoneNumber: e.target.value});
                      setIsPhoneVerified(false);
                    }}
                    className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                  />
                  {formData.phoneNumber && !isPhoneVerified && (
                    <button 
                      onClick={() => setIsOtpModalOpen(true)}
                      className="px-4 bg-brand-orange text-white rounded-2xl font-bold text-xs hover:bg-brand-orange/90 transition-colors whitespace-nowrap"
                    >
                      Xác nhận
                    </button>
                  )}
                  {isPhoneVerified && formData.phoneNumber && (
                    <div className="px-4 bg-green-100 text-green-600 rounded-2xl font-bold text-xs flex items-center justify-center whitespace-nowrap">
                      Đã xác nhận
                    </div>
                  )}
                </div>
              </div>
            </div>

            {formData.role !== 'Admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Trường</label>
                  <input 
                    type="text" 
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    readOnly={formData.role === 'Học sinh'}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700",
                      formData.role === 'Học sinh' ? "opacity-70 cursor-not-allowed" : "focus:ring-2 focus:ring-brand-primary/20"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Lớp</label>
                  <input 
                    type="text" 
                    value={formData.className}
                    onChange={(e) => setFormData({...formData, className: e.target.value})}
                    readOnly={formData.role === 'Học sinh'}
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none font-bold text-gray-700",
                      formData.role === 'Học sinh' ? "opacity-70 cursor-not-allowed" : "focus:ring-2 focus:ring-brand-primary/20"
                    )}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Giới thiệu bản thân</label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700 resize-none"
              />
            </div>

            <div className="pt-6 flex gap-4">
              <button 
                onClick={() => {
                  if (formData.phoneNumber && !isPhoneVerified) {
                    alert('Vui lòng xác nhận số điện thoại trước khi lưu.');
                    return;
                  }
                  onSave(formData);
                }}
                className="flex-1 bg-brand-primary text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
              >
                LƯU THAY ĐỔI
              </button>
            </div>

            {isHomeroomTeacher && (
              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-lg font-bold text-brand-primary mb-4">Mã đăng ký lớp học</h4>
                <p className="text-sm text-gray-500 mb-6">Tạo mã để học sinh đăng ký vào lớp. Mã được backend quản lý và tự động hết hạn theo cấu hình hệ thống.</p>
                <p className="text-xs text-brand-orange font-bold mb-6">Mỗi lần tạo mã mới, mã active cũ của cùng lớp sẽ tự động bị thu hồi.</p>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      void handleGenerateCode();
                    }}
                    disabled={isGeneratingCode}
                    className={cn(
                      'px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg',
                      isGeneratingCode
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-brand-secondary text-white hover:brightness-110 hover:shadow-xl',
                    )}
                  >
                    {isGeneratingCode ? 'Đang tạo...' : 'Tạo mã mới'}
                  </button>
                  
                  {teacherRegCode && teacherRegCode.expiry > Date.now() ? (
                    <div className="flex-1 flex items-center justify-between bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
                      <span className="font-mono text-2xl font-black text-gray-800 tracking-widest">{teacherRegCode.code}</span>
                      <span className="text-sm font-bold text-brand-orange flex items-center gap-2">
                        <Clock size={16} /> 
                        {Math.ceil((teacherRegCode.expiry - Date.now()) / 1000)}s
                      </span>
                    </div>
                  ) : teacherRegCode ? (
                    <div className="flex-1 flex items-center justify-center bg-red-50 text-red-500 px-6 py-4 rounded-2xl border border-red-100 font-bold text-sm">
                      Mã đã hết hạn
                    </div>
                  ) : null}
                </div>
                {generateCodeError && (
                  <p className="mt-4 text-sm text-red-500 font-bold">{generateCodeError}</p>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <h5 className="text-sm font-black text-brand-primary uppercase tracking-widest">Mã đang hiệu lực</h5>
                    <button
                      onClick={() => {
                        void loadActiveCodes();
                      }}
                      disabled={isCodesLoading}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors',
                        isCodesLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20',
                      )}
                    >
                      {isCodesLoading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                  </div>

                  {codesError && (
                    <p className="text-sm text-red-500 font-bold">{codesError}</p>
                  )}

                  {!isCodesLoading && activeCodes.length === 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-500">
                      Chưa có mã active cho lớp này.
                    </div>
                  )}

                  {activeCodes.map((code) => {
                    const expiresAtMs = new Date(code.expiresAt).getTime();
                    const remainingSeconds = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
                    const isExpired = remainingSeconds <= 0;

                    return (
                      <div key={code.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500 font-bold">Lớp {code.className}</p>
                            <p className="text-sm font-black text-brand-primary">
                              {code.usedCount}/{code.maxUses} lượt
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              void handleRevokeCode(code.id);
                            }}
                            disabled={revokingCodeId === code.id}
                            className={cn(
                              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors',
                              revokingCodeId === code.id
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-red-100 text-red-600 hover:bg-red-200',
                            )}
                          >
                            {revokingCodeId === code.id ? 'Đang thu hồi...' : 'Thu hồi'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Hết hạn: {new Date(code.expiresAt).toLocaleString()}</span>
                          <span className={cn('font-bold', isExpired ? 'text-red-500' : 'text-brand-orange')}>
                            {isExpired ? 'Đã hết hạn' : `Còn ${remainingSeconds}s`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {canViewCodeEvents && (
              <div className="pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h4 className="text-lg font-bold text-brand-primary">Lịch sử mã lớp</h4>
                  <button
                    onClick={() => {
                      void loadCodeEvents();
                    }}
                    disabled={isEventsLoading}
                    className={cn(
                      'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors',
                      isEventsLoading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20',
                    )}
                  >
                    {isEventsLoading ? 'Đang tải...' : 'Làm mới'}
                  </button>
                </div>

                {eventsError && (
                  <p className="text-sm text-red-500 font-bold mb-4">{eventsError}</p>
                )}

                {!isEventsLoading && codeEvents.length === 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-500">
                    Chưa có sự kiện nào.
                  </div>
                )}

                <div className="space-y-3">
                  {pagedCodeEvents.map((event) => (
                    <div key={event.id} className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <span className={cn('px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', formatEventTypeClassName(event.eventType))}>
                          {formatEventType(event.eventType)}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-bold text-brand-primary">
                        Lớp {event.className || 'N/A'} {event.school ? `- ${event.school}` : ''}
                      </p>
                      {event.studentUsername && (
                        <p className="text-xs text-gray-600 mt-1">Học sinh: @{event.studentUsername}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatEventNote(event.note)}</p>
                    </div>
                  ))}
                </div>

                {codeEvents.length > eventsPageSize && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {Array.from({ length: eventsTotalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      const isActive = pageNumber === eventsPage;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setEventsPage(pageNumber)}
                          className={cn(
                            'w-9 h-9 rounded-xl text-xs font-black transition-colors',
                            isActive
                              ? 'bg-brand-primary text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                          )}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {isOtpModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="text-2xl font-serif italic text-brand-primary mb-2">Xác nhận SĐT</h3>
                <p className="text-sm text-gray-500">Nhập mã OTP 6 số được gửi đến {formData.phoneNumber}</p>
              </div>
              
              <input 
                type="text" 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-3xl tracking-[0.5em] font-mono font-black py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none mb-8"
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsOtpModalOpen(false)}
                  className="flex-1 py-4 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleVerifyPhone}
                  className="flex-1 py-4 bg-brand-primary text-white font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-brand-primary/30 transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TestTakingView = ({ 
  test, 
  userData,
  onComplete, 
  onBack,
  onTakeDass21
}: { 
  test: any, 
  userData: any,
  onComplete: (score: number) => void, 
  onBack: () => void,
  onTakeDass21?: () => void
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showDassPrompt, setShowDassPrompt] = useState(false);

  const questions = test.questionList || [];

  const getEvaluation = (title: string, score: number) => {
    const t = title.toUpperCase();
    if (t.includes('PHQ-9')) {
      if (score <= 4) return 'Không có biểu hiện trầm cảm';
      if (score <= 9) return 'Trầm cảm nhẹ';
      if (score <= 14) return 'Trầm cảm vừa';
      if (score <= 19) return 'Trầm cảm nặng vừa';
      return 'Trầm cảm nặng';
    }
    if (t.includes('GAD-7')) {
      if (score <= 4) return 'Không có biểu hiện lo âu';
      if (score <= 9) return 'Lo âu nhẹ';
      if (score <= 14) return 'Lo âu vừa';
      return 'Lo âu nặng';
    }
    if (t.includes('SDQ-25')) {
      if (score <= 13) return 'Bình thường';
      if (score <= 16) return 'Ranh giới';
      return 'Bất thường';
    }
    if (t.includes('MT')) {
      if (score <= 20) return 'Sức bật tinh thần thấp';
      if (score <= 40) return 'Sức bật tinh thần trung bình';
      return 'Sức bật tinh thần cao';
    }
    if (t.includes('DASS-21')) {
      if (score <= 20) return 'Bình thường';
      if (score <= 40) return 'Mức độ nhẹ đến vừa';
      return 'Mức độ nặng';
    }
    return 'Đã hoàn thành bài test';
  };

  const handleSelectOption = (qId: string, score: number) => {
    setAnswers({ ...answers, [qId]: score });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0);
      setFinalScore(totalScore);
      setIsFinished(true);
      onComplete(totalScore);

      const t = test.title.toUpperCase();
      if ((t.includes('PHQ-9') || t.includes('GAD-7')) && totalScore >= 10) {
        setShowDassPrompt(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-40 text-center">
        <h2 className="text-3xl font-serif italic text-brand-primary mb-6">Bài test đang được cập nhật</h2>
        <p className="text-gray-500 mb-10">Vui lòng quay lại sau khi giáo viên đã thêm câu hỏi.</p>
        <button onClick={onBack} className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest">QUAY LẠI</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-4 py-40 text-center"
      >
        <div className="w-32 h-32 bg-brand-primary/10 text-brand-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
          <Zap size={64} />
        </div>
        <h2 className="text-4xl font-serif italic text-brand-primary mb-4">Hoàn thành bài trắc nghiệm!</h2>
        <p className="text-gray-500 text-lg mb-12">Cảm ơn bạn đã dành thời gian thực hiện bài test này.</p>
        
        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl mb-12">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">TỔNG ĐIỂM CỦA BẠN</p>
          <p className="text-7xl font-black text-brand-primary mb-6">{finalScore}</p>
          <div className="inline-block px-6 py-3 bg-brand-primary/10 rounded-2xl">
            <p className="text-lg font-bold text-brand-primary">{getEvaluation(test.title, finalScore)}</p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="px-12 py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all"
        >
          QUAY LẠI TRẠM GIẢI MÃ
        </button>

        {showDassPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-primary mb-4">Đánh giá chi tiết hơn</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Dựa trên kết quả của bạn, chúng tôi đề xuất bạn thực hiện thêm bài test DASS-21 để có đánh giá chi tiết hơn về mức độ căng thẳng, lo âu và trầm cảm. Bạn có muốn thực hiện ngay không?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDassPrompt(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  BỎ QUA
                </button>
                <button 
                  onClick={() => {
                    setShowDassPrompt(false);
                    if (onTakeDass21) onTakeDass21();
                  }}
                  className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-brand-primary/20 transition-all"
                >
                  LÀM DASS-21
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-gray-400 hover:text-brand-primary transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
            <ArrowRight size={16} className="rotate-180" /> THOÁT
          </button>
          <span className="text-xs font-black text-brand-primary uppercase tracking-widest">CÂU HỎI {currentQuestionIndex + 1} / {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-brand-primary"
          />
        </div>
      </div>

      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 md:p-16 rounded-[4rem] border border-gray-100 shadow-xl"
      >
        <h3 className="text-3xl font-bold text-brand-primary mb-12 leading-tight">{currentQuestion.text}</h3>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option: any) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(currentQuestion.id, option.score)}
              className={cn(
                "w-full p-6 rounded-3xl text-left font-bold transition-all border-2",
                answers[currentQuestion.id] === option.score
                  ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                  : "bg-gray-50 text-gray-600 border-transparent hover:border-brand-primary/20 hover:bg-white"
              )}
            >
              {option.text}
            </button>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="px-8 py-4 text-gray-400 font-black text-xs uppercase tracking-widest disabled:opacity-30"
          >
            QUAY LẠI
          </button>
          <button 
            onClick={handleNext}
            disabled={answers[currentQuestion.id] === undefined}
            className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {currentQuestionIndex === questions.length - 1 ? "HOÀN THÀNH" : "TIẾP THEO"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StudentTestsView = ({ 
  tests, 
  onTakeTest,
  userData,
  setCurrentView,
  onLogout
}: { 
  tests: any[], 
  onTakeTest: (test: any) => void,
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void
}) => {
  const filteredTests = tests.filter(t => t.isOpen && (t.targetAudience === 'Cả hai' || t.targetAudience === userData.role));

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
        >
          <Zap size={14} /> TRẠM GIẢI MÃ
        </motion.div>
        <h2 className="text-5xl md:text-6xl font-serif italic text-brand-primary mb-6 leading-tight">
          Thấu hiểu bản thân qua các bài trắc nghiệm
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Khám phá những góc khuất trong tâm hồn, định hướng tương lai và tìm ra cách cân bằng cuộc sống học đường.
        </p>
      </div>

      {filteredTests.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[4rem] border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">Hiện chưa có bài trắc nghiệm nào dành cho bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTests.map((test) => (
            <motion.div
              key={test.id}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative"
            >
              <div className="absolute top-8 right-8 px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                {test.targetAudience === 'Cả hai' ? 'Giáo viên, Học sinh' : test.targetAudience}
              </div>
              <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg mb-10 group-hover:scale-110 transition-transform", test.color)}>
                {IconMap[test.icon || 'Zap']}
              </div>
              
              <h3 className="text-2xl font-black text-brand-primary mb-4">{test.title}</h3>
              <p className="text-gray-500 leading-relaxed mb-10 flex-1">{test.desc}</p>
              
              <div className="flex items-center justify-between pt-8 border-t border-gray-50 mb-10">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-brand-orange" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{test.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-brand-secondary" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{test.questions}</span>
                </div>
              </div>

              <button 
                onClick={() => onTakeTest(test)}
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                BẮT ĐẦU LÀM TEST
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChangePasswordModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (password: string) => void,
  userName: string
}) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Lock size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <h3 className="text-2xl font-display font-black text-brand-primary mb-1">Đổi mật khẩu</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Người dùng: {userName}</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Mật khẩu mới</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              HỦY
            </button>
            <button 
              onClick={() => {
                onConfirm(password);
                setPassword('');
                onClose();
              }}
              className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
            >
              XÁC NHẬN
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SchoolListView = ({ 
  schools, 
  onBack,
  userData,
  setCurrentView,
  onLogout,
  setFilterSchoolId
}: { 
  schools: any[], 
  onBack: () => void,
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void
}) => {
  return (
    <ManagementLayout 
      userData={userData} 
      currentView="school-list" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
          >
            <ArrowRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-display font-black text-brand-primary">Quản lý Trường học</h2>
            <p className="text-gray-500">Danh sách các trường học trong hệ thống.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {schools.map((school) => (
            <div 
              key={school.id} 
              onClick={() => {
                setFilterSchoolId(school.id);
                setCurrentView('class-list');
              }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-black text-2xl">
                  <School size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{school.name}</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500">
                  <MapPin size={16} className="text-brand-primary" />
                  <span className="text-sm font-medium">{school.address}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Users size={16} className="text-brand-orange" />
                  <span className="text-sm font-medium">{school.teacherCount} Giáo viên</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <GraduationCap size={16} className="text-brand-secondary" />
                  <span className="text-sm font-medium">{school.classCount} Lớp học</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ManagementLayout>
  );
};

const AdminListView = ({ 
  admins, 
  onBack,
  userData,
  setCurrentView,
  onLogout,
  onViewTeachersOfSchool,
  onViewStudentsOfSchool,
  setFilterSchoolId,
  onDeleteAdmin,
  onChangePassword
}: { 
  admins: any[], 
  onBack: () => void,
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  onViewTeachersOfSchool: (schoolId: string) => void,
  onViewStudentsOfSchool: (schoolId: string) => void,
  setFilterSchoolId: (id: string | null) => void,
  onDeleteAdmin?: (id: string) => void,
  onChangePassword?: (id: string, name: string) => void
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  return (
    <ManagementLayout 
      userData={userData} 
      currentView="admin-list" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
          >
            <ArrowRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-display font-black text-brand-primary">Quản lý Admin</h2>
            <p className="text-gray-500">Mỗi Admin đại diện cho một trường học trong hệ thống.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {admins.map((admin) => (
            <div 
              key={admin.id} 
              onClick={() => onViewTeachersOfSchool(admin.schoolId)}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative cursor-pointer"
            >
              {userData.role === 'Quản trị viên cấp cao' && (
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdmin(admin);
                    }}
                    className="p-2 bg-white rounded-xl shadow-lg text-gray-400 hover:text-brand-secondary transition-all"
                    title="Xem thông tin"
                  >
                    <Info size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangePassword?.(admin.id, admin.name);
                    }}
                    className="p-2 bg-white rounded-xl shadow-lg text-gray-400 hover:text-brand-primary transition-all"
                    title="Đổi mật khẩu"
                  >
                    <Lock size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAdmin?.(admin.id);
                    }}
                    className="p-2 bg-white rounded-xl shadow-lg text-gray-400 hover:text-red-500 transition-all"
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-2xl">
                  {admin.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{admin.name}</h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{admin.role}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500">
                  <School size={16} className="text-brand-primary" />
                  <span className="text-sm font-medium">{admin.school}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <User size={16} className="text-brand-primary" />
                  <span className="text-sm font-medium">@{admin.username}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selectedAdmin && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAdmin(null)}
                className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-brand-orange/10 flex items-center justify-center text-brand-orange text-3xl font-black">
                      {selectedAdmin.name.charAt(0)}
                    </div>
                    <button 
                      onClick={() => setSelectedAdmin(null)}
                      className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-display font-black text-brand-primary mb-1">{selectedAdmin.name}</h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">{selectedAdmin.role}</p>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                        <School size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Trường học</p>
                        <p className="font-bold text-gray-700">{selectedAdmin.school}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-orange shadow-sm">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tên đăng nhập</p>
                        <p className="font-bold text-gray-700">@{selectedAdmin.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-secondary shadow-sm">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</p>
                        <p className="font-bold text-gray-700">{selectedAdmin.email || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10">
                    <button 
                      onClick={() => {
                        onDeleteAdmin?.(selectedAdmin.id);
                        setSelectedAdmin(null);
                      }}
                      className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                    >
                      XÓA TÀI KHOẢN
                    </button>
                    <button 
                      onClick={() => setSelectedAdmin(null)}
                      className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                      ĐÓNG
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ManagementLayout>
  );
};

const AdminPasswordPromptModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (password: string) => void
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Demo password
      onConfirm(password);
      setPassword('');
      setError('');
    } else {
      setError('Mật khẩu không chính xác (Mã mẫu: admin123)');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <Lock size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <h3 className="text-2xl font-display font-black text-brand-primary mb-1">Xác thực quyền Admin</h3>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Vui lòng nhập mật khẩu để tiếp tục</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Mật khẩu Admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 outline-none transition-all"
                placeholder="Nhập mật khẩu..."
                autoFocus
              />
              {error && <p className="text-red-500 text-xs font-bold mt-2 ml-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-brand-primary/20 transition-all"
            >
              Xác nhận
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const ClassListView = ({ 
  classes, 
  students, 
  teachers, 
  onBack,
  onViewClass,
  userData,
  setCurrentView,
  onLogout,
  setFilterSchoolId,
  onDeleteStudent,
  onChangePassword,
  onRequireAdminPassword,
  initialSelectedClass
}: { 
  classes: any[], 
  students: any[],
  teachers: any[],
  onBack: () => void,
  onViewClass: (cls: any) => void,
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void,
  onDeleteStudent?: (id: string) => void,
  onChangePassword?: (id: string, name: string) => void,
  onRequireAdminPassword?: (callback: () => void) => void,
  initialSelectedClass?: any
}) => {
  const [selectedClass, setSelectedClass] = useState<any>(initialSelectedClass || null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [expandedGrades, setExpandedGrades] = useState<string[]>([]);

  useEffect(() => {
    if (initialSelectedClass) {
      setSelectedClass(initialSelectedClass);
    }
  }, [initialSelectedClass]);

  const handleSelectMember = (member: any) => {
    if (onRequireAdminPassword) {
      onRequireAdminPassword(() => setSelectedStudent(member));
    } else {
      setSelectedStudent(member);
    }
  };

  const classMembers = useMemo(() => {
    if (!selectedClass) return [];
    
    const classStudents = students
      .filter(s => s.className === selectedClass.name)
      .map(s => ({ ...s, role: 'Học sinh', type: 'student' }));
      
    const classTeachers = teachers
      .filter(t => t.className === selectedClass.name)
      .map(t => ({ 
        ...t, 
        role: 'Giáo viên', 
        type: 'teacher',
        username: t.username || t.name,
        points: 0,
        rank: '-',
        location: t.school || '-',
        transport: '-',
        accomType: '-',
        phone: t.phoneNumber || '-'
      }));
      
    return [...classTeachers, ...classStudents];
  }, [students, teachers, selectedClass]);

  if (selectedClass) {
    return (
      <ManagementLayout 
        userData={userData} 
        currentView="class-list" 
        setCurrentView={setCurrentView}
        onLogout={onLogout}
        setFilterSchoolId={setFilterSchoolId}
      >
        <div className="p-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSelectedClass(null)}
                className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
              >
                <ArrowRight className="rotate-180" size={24} />
              </button>
              <div>
                <h2 className="text-4xl font-display font-black text-brand-primary">Danh sách Lớp {selectedClass.name}</h2>
                <p className="text-gray-500">Quản lý thành viên lớp học và theo dõi thông tin.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên hoặc mã..."
                  className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none w-80"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">No</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên tài khoản</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chức vụ</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Liên hệ</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mức độ stress</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {classMembers.map((member, idx) => (
                  <tr key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-gray-400">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-6">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group/name"
                        onClick={() => handleSelectMember(member)}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black overflow-hidden shadow-sm",
                          member.type === 'teacher' ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-orange/10 text-brand-orange"
                        )}>
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 group-hover/name:text-brand-primary transition-colors">{member.name || member.username}</p>
                          <p className="text-[10px] text-gray-400 font-medium">@{member.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase",
                        member.type === 'teacher' ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-orange/10 text-brand-orange"
                      )}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">{member.phone}</td>
                    <td className="px-8 py-6">
                      {member.type === 'student' ? (
                        <span className="text-sm font-black text-brand-primary">{member.points} ĐIỂM</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {member.type === 'student' ? (
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          member.points > 60 ? "bg-red-50 text-red-500" : 
                          member.points > 40 ? "bg-brand-orange/10 text-brand-orange" : 
                          "bg-brand-primary/10 text-brand-primary"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            member.points > 60 ? "bg-red-500" : 
                            member.points > 40 ? "bg-brand-orange" : 
                            "bg-brand-primary"
                          )} />
                          {member.points > 60 ? "Cao" : member.points > 40 ? "Trung bình" : "Thấp"}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleSelectMember(member)}
                          className="p-2 text-gray-300 hover:text-brand-primary transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {userData.role === 'Quản trị viên cấp cao' && (
                          <>
                            <button 
                              onClick={() => onChangePassword?.(member.id, member.username)}
                              className="p-2 text-gray-300 hover:text-brand-primary transition-colors"
                              title="Đổi mật khẩu"
                            >
                              <Lock size={18} />
                            </button>
                            <button 
                              onClick={() => onDeleteStudent?.(member.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {selectedStudent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStudent(null)}
                className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
              >
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-brand-orange/10 flex items-center justify-center text-brand-orange text-3xl font-black">
                      {selectedStudent.username.charAt(0).toUpperCase()}
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedStudent(null);
                        setIsEditingStudent(false);
                      }}
                      className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-display font-black text-brand-primary mb-1">@{selectedStudent.username}</h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Học sinh lớp {selectedStudent.className}</p>

                  <div className="space-y-6">
                    {isEditingStudent ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Số điện thoại</label>
                          <input 
                            type="text" 
                            value={selectedStudent.phone || ''}
                            onChange={(e) => setSelectedStudent({...selectedStudent, phone: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ngày sinh</label>
                          <input 
                            type="text" 
                            value={selectedStudent.dob || ''}
                            onChange={(e) => setSelectedStudent({...selectedStudent, dob: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Địa chỉ</label>
                          <input 
                            type="text" 
                            value={selectedStudent.location || ''}
                            onChange={(e) => setSelectedStudent({...selectedStudent, location: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                            <Phone size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                            <p className="font-bold text-gray-700">{selectedStudent.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-orange shadow-sm">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Ngày sinh</p>
                            <p className="font-bold text-gray-700">{selectedStudent.dob}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-secondary shadow-sm">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Địa chỉ</p>
                            <p className="font-bold text-gray-700">{selectedStudent.location}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-4 mt-10">
                    {isEditingStudent ? (
                      <button 
                        onClick={() => {
                          // Save logic here if needed, for now just toggle back
                          setIsEditingStudent(false);
                        }}
                        className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                      >
                        LƯU THAY ĐỔI
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            onDeleteStudent?.(selectedStudent.id);
                            setSelectedStudent(null);
                          }}
                          className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                        >
                          XÓA TÀI KHOẢN
                        </button>
                        <button 
                          onClick={() => setIsEditingStudent(true)}
                          className="flex-1 py-4 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-[1.02] transition-all"
                        >
                          CHỈNH SỬA
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedStudent(null);
                        setIsEditingStudent(false);
                      }}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      ĐÓNG
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ManagementLayout>
    );
  }

  const groupedClasses = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    classes.forEach(cls => {
      // Extract grade from class name (e.g., "12A1" -> "12", "10A2" -> "10")
      const match = cls.name.match(/^(\d+)/);
      const grade = match ? `Khối ${match[1]}` : 'Khác';
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(cls);
    });
    
    // Sort groups by grade number
    return Object.keys(groups).sort((a, b) => {
      if (a === 'Khác') return 1;
      if (b === 'Khác') return -1;
      const numA = parseInt(a.replace('Khối ', ''));
      const numB = parseInt(b.replace('Khối ', ''));
      return numA - numB;
    }).map(grade => ({
      grade,
      classes: groups[grade]
    }));
  }, [classes]);

  return (
    <ManagementLayout 
      userData={userData} 
      currentView="class-list" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
          >
            <ArrowRight className="rotate-180" size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-display font-black text-brand-primary">Quản lý Lớp học</h2>
            <p className="text-gray-500">Theo dõi hiệu suất và sự tham gia của học sinh theo từng lớp.</p>
          </div>
        </div>

        <div className="space-y-6">
          {groupedClasses.map((group) => {
            const isExpanded = expandedGrades.includes(group.grade);
            return (
              <div key={group.grade} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <button 
                  onClick={() => {
                    setExpandedGrades(prev => 
                      prev.includes(group.grade) 
                        ? prev.filter(g => g !== group.grade)
                        : [...prev, group.grade]
                    );
                  }}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-2 h-8 bg-brand-primary rounded-full"></div>
                    {group.grade}
                  </h3>
                  <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {group.classes.map((cls) => (
                          <div 
                            key={cls.id} 
                            onClick={() => setSelectedClass(cls)}
                            className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:bg-white transition-all group cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div className="px-8 py-2 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-2xl">
                                {cls.name}
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">STRESS TB</p>
                                <p className={cn(
                                  "text-xl font-black",
                                  cls.avgStress > 60 ? "text-red-500" : cls.avgStress > 40 ? "text-brand-orange" : "text-brand-primary"
                                )}>{cls.avgStress}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <Users size={18} className="text-brand-secondary" />
                                  <span className="text-sm font-bold text-gray-600">Sĩ số</span>
                                </div>
                                <span className="text-sm font-black text-brand-primary">{cls.studentCount} HS</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-white rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <GraduationCap size={18} className="text-brand-secondary" />
                                  <span className="text-sm font-bold text-gray-600">Giáo viên</span>
                                </div>
                                <span className="text-sm font-black text-brand-primary">{cls.teacherName}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </ManagementLayout>
  );
};

const TestListView = ({ 
  tests, 
  onEdit, 
  onDelete, 
  onToggle,
  userData,
  setCurrentView,
  onLogout,
  setFilterSchoolId
}: { 
  tests: any[], 
  onEdit: (test: any) => void, 
  onDelete: (id: string) => void,
  onToggle: (id: string) => void,
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void
}) => {
  return (
    <ManagementLayout 
      userData={userData} 
      currentView="test-list" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-display font-black text-brand-primary">Quản lý Bài test</h2>
            <p className="text-gray-500">Tạo và chỉnh sửa các bài trắc nghiệm tâm lý.</p>
          </div>
          <button 
            onClick={() => onEdit(null)}
            className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-3"
          >
            <Zap size={18} /> THÊM BÀI TEST MỚI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tests.map((test) => (
            <div 
              key={test.id} 
              className={cn(
                "bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative",
                !test.isOpen && "opacity-75 grayscale-[0.5]"
              )}
            >
              <div className="absolute top-6 right-6 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                {test.targetAudience === 'Cả hai' ? 'Giáo viên, Học sinh' : test.targetAudience}
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg", test.color)}>
                  {IconMap[test.icon || 'Zap']}
                </div>
                <div className="flex gap-2 mt-8">
                  {(userData.role === 'Quản trị viên cấp cao' || !test.isPredefined) && (
                    <>
                      <button 
                        onClick={() => onEdit(test)}
                        className="p-2 text-gray-300 hover:text-brand-primary transition-colors"
                      >
                        <Settings size={20} />
                      </button>
                      <button 
                        onClick={() => onDelete(test.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-brand-primary mb-2">{test.title}</h3>
              <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2">{test.desc}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-brand-orange" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{test.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-brand-secondary" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {test.targetAudience === 'Cả hai' ? 'Giáo viên, Học sinh' : test.targetAudience}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => onToggle(test.id)}
                  className={cn(
                    "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    test.isOpen 
                      ? "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500" 
                      : "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white"
                  )}
                >
                  {test.isOpen ? 'ĐÓNG BÀI TEST' : 'MỞ BÀI TEST'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ManagementLayout>
  );
};

const ReportsView = ({ 
  userData,
  setCurrentView,
  onLogout,
  setFilterSchoolId,
  teachers,
  testResults
}: { 
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void,
  teachers: any[],
  testResults: any[]
}) => {
  const [studentReportType, setStudentReportType] = useState<'pie' | 'bar'>('pie');
  const [teacherReportType, setTeacherReportType] = useState<'pie' | 'bar'>('pie');

  const teacherStressData = useMemo(() => {
    return teachers.map(teacher => {
      const results = testResults.filter(r => r.userId === teacher.id);
      const avgScore = results.length > 0 
        ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
        : 0;
      return {
        name: teacher.name,
        avgStress: avgScore
      };
    }).filter(t => t.avgStress > 0);
  }, [teachers, testResults]);

  const teacherPieData = useMemo(() => {
    let low = 0, medium = 0, high = 0;
    teacherStressData.forEach(t => {
      if (t.avgStress > 60) high++;
      else if (t.avgStress > 40) medium++;
      else low++;
    });
    
    // If no data, provide some mock data for visual purposes
    if (low === 0 && medium === 0 && high === 0) {
      return [
        { name: 'Thấp (0-40)', value: 12, fill: '#18A5A7' },
        { name: 'Trung bình (41-60)', value: 8, fill: '#F59E0B' },
        { name: 'Cao (>60)', value: 3, fill: '#EF4444' },
      ];
    }

    return [
      { name: 'Thấp (0-40)', value: low, fill: '#18A5A7' },
      { name: 'Trung bình (41-60)', value: medium, fill: '#F59E0B' },
      { name: 'Cao (>60)', value: high, fill: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [teacherStressData]);

  const pieData = [
    { name: 'Hoàn thành', value: 400, fill: '#18A5A7' },
    { name: 'Chưa hoàn thành', value: 300, fill: '#F59E0B' },
    { name: 'Đang thực hiện', value: 300, fill: '#EF4444' },
  ];

  const barData = [
    { name: 'Th1', value: 400 },
    { name: 'Th2', value: 300 },
    { name: 'Th3', value: 200 },
    { name: 'Th4', value: 278 },
    { name: 'Th5', value: 189 },
    { name: 'Th6', value: 239 },
    { name: 'Th7', value: 349 },
    { name: 'Th8', value: 200 },
    { name: 'Th9', value: 278 },
    { name: 'Th10', value: 189 },
    { name: 'Th11', value: 239 },
    { name: 'Th12', value: 349 },
  ];

  const teacherBarData = [
    { name: 'Th1', value: 45 },
    { name: 'Th2', value: 52 },
    { name: 'Th3', value: 38 },
    { name: 'Th4', value: 65 },
    { name: 'Th5', value: 48 },
    { name: 'Th6', value: 35 },
    { name: 'Th7', value: 28 },
    { name: 'Th8', value: 42 },
    { name: 'Th9', value: 55 },
    { name: 'Th10', value: 60 },
    { name: 'Th11', value: 45 },
    { name: 'Th12', value: 50 },
  ];

  return (
    <ManagementLayout 
      userData={userData} 
      currentView="reports" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12 space-y-12">
        <div>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-display font-black text-brand-primary">Báo cáo kết quả Học sinh</h2>
              <p className="text-gray-500">
                {studentReportType === 'pie' ? 'Thống kê kết quả bài test trong tháng vừa qua.' : 'Thống kê kết quả bài test theo từng tháng trong năm.'}
              </p>
            </div>
            {studentReportType === 'pie' ? (
              <button 
                onClick={() => setStudentReportType('bar')}
                className="px-6 py-3 bg-brand-primary/5 text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2"
              >
                TỔNG QUAN <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={() => setStudentReportType('pie')}
                className="px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/10 hover:text-brand-primary transition-all flex items-center gap-2"
              >
                <ArrowRight className="rotate-180" size={16} /> QUAY LẠI
              </button>
            )}
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
            {studentReportType === 'pie' ? (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-8 mt-8">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      <span className="text-xs font-bold text-gray-500">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#18A5A7" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Teacher Stress Report Section */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-display font-black text-brand-primary">Báo cáo mức độ Stress của Giáo viên</h2>
              <p className="text-gray-500">
                {teacherReportType === 'pie' ? 'Thống kê mức độ stress hiện tại của đội ngũ giáo viên.' : 'Thống kê mức độ stress trung bình theo từng tháng trong năm.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-orange/5 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-widest hidden md:flex">
                <Users size={14} /> DỮ LIỆU GIÁO VIÊN
              </div>
              {teacherReportType === 'pie' ? (
                <button 
                  onClick={() => setTeacherReportType('bar')}
                  className="px-6 py-3 bg-brand-primary/5 text-brand-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2"
                >
                  TỔNG QUAN <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => setTeacherReportType('pie')}
                  className="px-6 py-3 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/10 hover:text-brand-primary transition-all flex items-center gap-2"
                >
                  <ArrowRight className="rotate-180" size={16} /> QUAY LẠI
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
            {teacherReportType === 'pie' ? (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teacherPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {teacherPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-8 mt-8">
                  {teacherPieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                      <span className="text-xs font-bold text-gray-500">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherBarData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#F59E0B" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
};

const NotificationBoard = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="absolute top-full right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[60]">
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-black text-brand-primary">Bảng thông báo</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 max-h-[400px] overflow-y-auto no-scrollbar space-y-4">
        {[
          { title: 'Sự kiện trường', content: 'Họp phụ huynh học sinh dự kiến vào thứ Sáu.', time: '2 giờ trước' },
          { title: 'Thông báo', content: 'Trường sẽ nghỉ lễ vào tuần tới.', time: 'Đăng ngày: 12 Th10 2023' },
          { title: 'Cập nhật hệ thống', content: 'Hệ thống Trạm An vừa được cập nhật tính năng mới.', time: '1 ngày trước' }
        ].map((notif, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-transparent hover:border-brand-primary/20 transition-all cursor-pointer group">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">{notif.title}</p>
            <p className="text-sm font-bold text-gray-700 mb-2 group-hover:text-brand-primary transition-colors">{notif.content}</p>
            <p className="text-[10px] text-gray-400 font-medium">{notif.time}</p>
          </div>
        ))}
      </div>
      <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
        <button className="text-[11px] font-black text-brand-primary uppercase tracking-widest hover:underline">
          XEM TẤT CẢ THÔNG BÁO
        </button>
      </div>
    </div>
  );
};

const ManagementLayout = ({ 
  children, 
  userData, 
  currentView, 
  setCurrentView, 
  onLogout,
  setFilterSchoolId
}: { 
  children: React.ReactNode, 
  userData: any, 
  currentView: View, 
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const menuItems = userData.role === 'Admin' ? [
    { id: 'admin', label: 'Bảng điều khiển', icon: <LayoutDashboard size={20} /> },
    { id: 'class-list', label: 'Lớp học', icon: <School size={20} /> },
    { id: 'teacher-list', label: 'Giáo viên', icon: <Users size={20} /> },
    { id: 'test-list', label: 'Quản lý bài test', icon: <Zap size={20} /> },
    { id: 'reports', label: 'Báo cáo kết quả', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
  ] : [
    { id: userData.role === 'Quản trị viên cấp cao' ? 'superadmin' : 'admin', label: 'Bảng điều khiển', icon: <LayoutDashboard size={20} /> },
    { id: 'school-list', label: 'Trường học', icon: <School size={20} /> },
    { id: 'teacher-list', label: 'Giáo viên', icon: <Users size={20} /> },
    { id: 'test-list', label: 'Bài test', icon: <Zap size={20} /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
  ];

  if (userData.role === 'Quản trị viên cấp cao') {
    // Add admin-list for superadmin if not already present
    if (!menuItems.find(item => item.id === 'admin-list')) {
      menuItems.splice(1, 0, { id: 'admin-list', label: 'Quản lý Admin', icon: <User size={20} /> });
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-8">
          <button 
            onClick={() => {
              setFilterSchoolId(null);
              setCurrentView(userData.role === 'Quản trị viên cấp cao' ? 'superadmin' : 'admin');
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Trạm An Logo" className="h-20 w-auto object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.classList.remove('hidden');
            }} />
            <div className="hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                <BookOpen size={24} />
              </div>
              <h1 className="text-xl font-black text-brand-primary tracking-tight">TRẠM AN</h1>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setFilterSchoolId(null);
                setCurrentView(item.id as View);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all group",
                currentView === item.id 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-brand-primary"
              )}
            >
              <span className={cn("transition-transform group-hover:scale-110", currentView === item.id ? "text-white" : "text-gray-400 group-hover:text-brand-primary")}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-24 bg-white border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative",
                    showNotifications ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-gray-50 text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary"
                  )}
                >
                  <Bell size={22} />
                  {!showNotifications && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-orange rounded-full border-2 border-white"></span>}
                </button>
                {showNotifications && <NotificationBoard onClose={() => setShowNotifications(false)} />}
              </div>
              <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all">
                <MessageSquare size={22} />
              </button>
            </div>
            
            <div className="h-10 w-[1px] bg-gray-100"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-800 leading-none mb-1">{userData.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{userData.role}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-lg shadow-sm">
                {userData.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

const SuperAdminView = ({ 
  setCurrentView, 
  admins,
  schools,
  teachers,
  classes,
  onViewSchool,
  onViewAdmin,
  userData,
  onLogout,
  setFilterSchoolId
}: { 
  setCurrentView: (view: View) => void,
  admins: any[],
  schools: any[],
  teachers: any[],
  classes: any[],
  onViewSchool: (school: any) => void,
  onViewAdmin: (admin: any) => void,
  userData: any,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void
}) => {
  return (
    <ManagementLayout 
      userData={userData} 
      currentView="superadmin" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-display font-black text-brand-primary mb-2">Chào mừng, {userData.name}!</h2>
            <p className="text-gray-500 font-medium">Quản lý cơ sở của bạn một cách dễ dàng. Theo dõi mọi thứ ở một nơi.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('admin-list')}
              className="px-6 py-3 bg-white text-brand-primary border-2 border-brand-primary/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <User size={16} /> QUẢN LÝ ADMIN
            </button>
            <button className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all shadow-lg shadow-brand-primary/20">
              TẠO BÁO CÁO
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Học sinh', value: '5,909', icon: <GraduationCap />, color: "bg-brand-primary/10", textColor: "text-brand-primary", view: 'class-list' },
            { label: 'Giáo viên', value: teachers.length, icon: <Users />, color: "bg-brand-orange/10", textColor: "text-brand-orange", view: 'teacher-list' },
            { label: 'Trường học', value: schools.length, icon: <School />, color: "bg-brand-secondary/10", textColor: "text-brand-secondary", view: 'school-list' },
            { label: 'Admins', value: admins.length, icon: <User />, color: "bg-red-50", textColor: "text-red-500", view: 'admin-list' },
          ].map((stat, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentView(stat.view as View)}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color, stat.textColor)}>
                {React.cloneElement(stat.icon as any, { size: 28 })}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-display font-black text-brand-primary">Tổng quan theo trường học</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                    <span className="text-xs font-bold text-gray-500">Học sinh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-brand-orange"></div>
                    <span className="text-xs font-bold text-gray-500">Giáo viên</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schools.map(s => ({ name: s.name.split(' ').pop(), students: s.teacherCount * 10, teachers: s.teacherCount }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="students" fill="#18A5A7" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="teachers" fill="#F59E0B" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              {/* Removed Tin nhắn section */}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-12">
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-display font-black text-brand-primary mb-8">Calendar</h3>
              <div className="aspect-square bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 font-medium italic">
                [ Calendar Placeholder ]
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-display font-black text-brand-primary mb-8">Recent Admins</h3>
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div 
                    key={admin.id} 
                    onClick={() => onViewAdmin(admin)}
                    className="p-4 rounded-2xl bg-gray-50 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-sm">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{admin.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{admin.school}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
};

const TeacherClassView = ({ 
  userData, 
  setCurrentView, 
  onLogout, 
  setFilterSchoolId,
  classes,
  students,
  teachers,
  testResults
}: { 
  userData: any, 
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void,
  classes: any[],
  students: any[],
  teachers: any[],
  testResults: any[]
}) => {
  const teacherClass = useMemo(() => {
    return classes.find(c => c.name === userData.className) || null;
  }, [classes, userData.className]);

  const classStudents = useMemo(() => {
    return students.filter(s => s.className === userData.className);
  }, [students, userData.className]);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-5xl font-serif italic text-brand-primary mb-4">Lớp học {userData.className}</h2>
        <p className="text-gray-500 text-lg font-medium">Chào mừng, Giáo viên {userData.name}. Đây là thông tin lớp học của bạn.</p>
      </div>

      <div className="space-y-12">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stress Level Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-bold text-brand-primary">Tỉ lệ mức độ Stress trung bình</h4>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Clock size={14} /> CẬP NHẬT: HÔM NAY
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={STRESS_HISTORY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#F9FAFB' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="avg" 
                    fill="#4F46E5" 
                    radius={[8, 8, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 flex justify-center gap-8">
              {STRESS_LEVEL_DATA.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <h4 className="text-xl font-bold text-brand-primary mb-6">Phân bổ mức độ</h4>
            <div className="flex-1 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STRESS_LEVEL_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {STRESS_LEVEL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-6">
              {STRESS_LEVEL_DATA.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-brand-primary">{item.value} HS</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student List Table */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif italic text-brand-primary">Danh sách Học sinh</h3>
            <div className="px-4 py-2 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
              {classStudents.length} HỌC SINH
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-8 md:-mx-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên tài khoản</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm test</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mức độ Stress</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group/name"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black overflow-hidden shadow-sm">
                          {student.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700 group-hover/name:text-brand-primary transition-colors">{student.name || student.username}</p>
                          <p className="text-[10px] text-gray-400 font-medium">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-brand-primary">{student.points} ĐIỂM</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        student.points > 60 ? "bg-red-50 text-red-500" : 
                        student.points > 40 ? "bg-brand-orange/10 text-brand-orange" : 
                        "bg-brand-primary/10 text-brand-primary"
                      )}>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          student.points > 60 ? "bg-red-500" : 
                          student.points > 40 ? "bg-brand-orange" : 
                          "bg-brand-primary"
                        )} />
                        {student.points > 60 ? "Cao" : student.points > 40 ? "Trung bình" : "Thấp"}
                      </div>
                    </td>
                  </tr>
                ))}
                {classStudents.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium">
                      Chưa có học sinh nào trong lớp này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-brand-primary/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-brand-orange/10 flex items-center justify-center text-brand-orange text-3xl font-black">
                    {selectedStudent.username.charAt(0).toUpperCase()}
                  </div>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <h3 className="text-2xl font-display font-black text-brand-primary mb-1">@{selectedStudent.username}</h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Học sinh lớp {selectedStudent.className}</p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                      <p className="font-bold text-gray-700">{selectedStudent.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-orange shadow-sm">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Ngày sinh</p>
                      <p className="font-bold text-gray-700">{selectedStudent.dob}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-secondary shadow-sm">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Địa chỉ</p>
                      <p className="font-bold text-gray-700">{selectedStudent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                  >
                    ĐÓNG
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeacherListView = ({ 
  teachers, 
  onBack,
  onViewTeacher,
  userData,
  setCurrentView,
  onLogout,
  setFilterSchoolId
}: { 
  teachers: any[], 
  onBack: () => void,
  onViewTeacher: (teacher: any) => void,
  userData: any,
  setCurrentView: (view: View) => void,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [teacherTypeFilter, setTeacherTypeFilter] = useState<'all' | 'homeroom' | 'subject'>('all');

  const resolveTeacherType = (teacher: any) => {
    if (teacher.teacherType === 'homeroom' || teacher.teacherType === 'subject') {
      return teacher.teacherType;
    }
    return teacher.className?.trim() ? 'homeroom' : 'subject';
  };

  const schoolOptions = useMemo(
    () =>
      Array.from(
        new Set(
          teachers
            .map((teacher) => (teacher.school || '').trim())
            .filter((schoolName) => schoolName.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b, 'vi')),
    [teachers],
  );

  const teacherStats = useMemo(() => {
    const homeroomCount = teachers.filter((teacher) => resolveTeacherType(teacher) === 'homeroom').length;
    return {
      total: teachers.length,
      homeroom: homeroomCount,
      subject: teachers.length - homeroomCount,
    };
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const isHomeroom = resolveTeacherType(teacher) === 'homeroom';
      const matchesType =
        teacherTypeFilter === 'all' ||
        (teacherTypeFilter === 'homeroom' && isHomeroom) ||
        (teacherTypeFilter === 'subject' && !isHomeroom);

      if (!matchesType) return false;

      const matchesSchool = schoolFilter === 'all' || teacher.school === schoolFilter;
      if (!matchesSchool) return false;

      if (!query) return true;

      return (
        teacher.name.toLowerCase().includes(query) ||
        (teacher.school && teacher.school.toLowerCase().includes(query)) ||
        (teacher.className && teacher.className.toLowerCase().includes(query)) ||
        (teacher.subject && teacher.subject.toLowerCase().includes(query))
      );
    });
  }, [searchQuery, schoolFilter, teacherTypeFilter, teachers]);

  return (
    <ManagementLayout 
      userData={userData}
      currentView="teacher-list"
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
            >
              <ArrowRight className="rotate-180" size={24} />
            </button>
            <div>
              <h2 className="text-4xl font-display font-black text-brand-primary">Danh sách Giáo viên</h2>
              <p className="text-gray-500">Quản lý và theo dõi thông tin chi tiết của tất cả giáo viên.</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <span className="px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest">
              Tổng: {teacherStats.total}
            </span>
            <span className="px-4 py-2 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest">
              Chủ nhiệm: {teacherStats.homeroom}
            </span>
            <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              Bộ môn: {teacherStats.subject}
            </span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative z-40">
          <div className="flex items-center mb-8 bg-gray-50 p-2 rounded-3xl">
            <Search className="text-gray-400 ml-4 mr-2" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, trường hoặc lớp..."
              className="flex-1 bg-transparent border-none py-3 outline-none text-gray-700 font-medium"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-brand-primary/20 outline-none"
            >
              <option value="all">Tất cả trường</option>
              {schoolOptions.map((schoolName) => (
                <option key={schoolName} value={schoolName}>
                  {schoolName}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'homeroom', label: 'Giáo viên chủ nhiệm' },
                { id: 'subject', label: 'Giáo viên bộ môn' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTeacherTypeFilter(item.id as 'all' | 'homeroom' | 'subject')}
                  className={cn(
                    'px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all',
                    teacherTypeFilter === item.id
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                      : 'bg-gray-50 text-gray-500 hover:bg-brand-primary/10 hover:text-brand-primary',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div 
                key={teacher.id}
                onClick={() => onViewTeacher(teacher)}
                className="flex items-center gap-6 p-6 rounded-3xl hover:bg-gray-50 transition-all cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-primary/20 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-110 transition-transform">
                  {teacher.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-800 truncate mb-1 group-hover:text-brand-primary transition-colors">
                    {teacher.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {resolveTeacherType(teacher) === 'homeroom' ? (
                      <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] uppercase tracking-widest rounded-full font-black">
                        Chủ nhiệm {teacher.className}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest rounded-full font-black whitespace-nowrap">
                        Bộ môn {teacher.subject ? `- ${teacher.subject}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-medium text-gray-500 truncate flex items-center gap-2 mt-2">
                    <School size={14} /> {teacher.school}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="py-12 text-center text-gray-500 font-medium bg-gray-50 rounded-3xl">
              Không tìm thấy giáo viên nào phù hợp với "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </ManagementLayout>
  );
};

const AdminView = ({ 
  setCurrentView, 
  pendingTeachers, 
  onApprove,
  onDeleteTeacher,
  onViewClass,
  onViewTeacher,
  teachers,
  classes,
  students,
  testResults,
  userData,
  onLogout,
  setFilterSchoolId,
  onDeleteStudent,
  onChangePassword
}: { 
  setCurrentView: (view: View) => void,
  pendingTeachers: any[],
  onApprove: (id: string) => void,
  onDeleteTeacher: (id: string) => void,
  onViewClass: (cls: any) => void,
  onViewTeacher: (teacher: any) => void,
  teachers: any[],
  classes: any[],
  students: any[],
  testResults: any[],
  userData: any,
  onLogout: () => void,
  setFilterSchoolId: (id: string | null) => void,
  onDeleteStudent?: (id: string) => void,
  onChangePassword?: (id: string, name: string) => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    const matchedClasses = classes.filter(c => c.name.toLowerCase().includes(query)).map(c => ({
      type: 'class' as const,
      data: c,
      title: `Lớp ${c.name}`,
      subtitle: `Giáo viên: ${c.teacherName} - Trường: ${c.school}`
    }));

    const matchedTeachers = teachers.filter(t => t.name.toLowerCase().includes(query)).map(t => ({
      type: 'teacher' as const,
      data: t,
      title: `Giáo viên: ${t.name}`,
      subtitle: `Trường: ${t.school}`
    }));

    return [...matchedClasses, ...matchedTeachers];
  }, [searchQuery, classes, teachers]);

  return (
    <ManagementLayout 
      userData={userData} 
      currentView="admin" 
      setCurrentView={setCurrentView}
      onLogout={onLogout}
      setFilterSchoolId={setFilterSchoolId}
    >
      <div className="p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-display font-black text-brand-primary mb-2">Quản lý Trường học</h2>
            <p className="text-gray-500 font-medium">Chào mừng trở lại, Admin. Đây là tình hình trường học của bạn hôm nay.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('test-list')}
              className="px-6 py-3 bg-white text-brand-primary border-2 border-brand-primary/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Zap size={16} /> QUẢN LÝ BÀI TEST
            </button>
            <button className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all shadow-lg shadow-brand-primary/20">
              XUẤT BÁO CÁO
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 relative z-40">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tên lớp, tên giáo viên..." 
              className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-brand-primary/10 outline-none text-lg font-medium transition-all"
            />
          </div>
          
          <AnimatePresence>
            {searchQuery.trim() && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden max-h-[400px] overflow-y-auto"
              >
                {searchResults.length > 0 ? (
                  <div className="p-4 space-y-2">
                    {searchResults.map((result, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          if (result.type === 'class') {
                            onViewClass(result.data);
                          } else {
                            onViewTeacher(result.data);
                          }
                          setSearchQuery('');
                        }}
                        className="p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors flex items-center gap-4 group"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                          result.type === 'class' ? "bg-brand-primary" : "bg-brand-orange"
                        )}>
                          {result.type === 'class' ? <GraduationCap size={24} /> : <Users size={24} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 group-hover:text-brand-primary transition-colors">{result.title}</h4>
                          <p className="text-xs font-medium text-gray-500 mt-1">{result.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 font-medium">
                    Không tìm thấy kết quả nào cho "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pending Approvals Notification */}
        {pendingTeachers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-8 bg-brand-orange/10 border border-brand-orange/20 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg shadow-brand-orange/5"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-brand-orange/20">
                <Bell size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Yêu cầu phê duyệt mới</h3>
                <p className="text-gray-500 font-medium">Có <span className="text-brand-orange font-black">{pendingTeachers.length}</span> giáo viên đang chờ phê duyệt tài khoản.</p>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView('teacher-list')}
              className="px-8 py-4 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition-all"
            >
              XEM TẤT CẢ
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Tổng số Lớp', value: classes.length, icon: <School className="text-brand-primary" />, color: "bg-brand-primary/10", view: 'class-list' },
            { label: 'Tổng số Giáo viên', value: teachers.length, icon: <Users className="text-brand-orange" />, color: "bg-brand-orange/10", view: 'teacher-list' },
            { label: 'Tổng số Học sinh', value: students.length, icon: <GraduationCap className="text-brand-secondary" />, color: "bg-brand-secondary/10", view: 'class-list' },
          ].map((stat, i) => (
            <div 
              key={i} 
              onClick={() => setCurrentView(stat.view as View)}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
                {React.cloneElement(stat.icon as any, { size: 36 })}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-brand-primary">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Chart Section */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-display font-black text-brand-primary mb-2">Mức độ Stress trung bình theo Lớp</h3>
                  <p className="text-gray-400 text-sm font-medium">Dữ liệu thời gian thực từ các bài kiểm tra gần đây</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Zap size={14} /> DỮ LIỆU THỜI GIAN THỰC
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classes} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                      dx={-15}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ 
                        borderRadius: '2rem', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                        padding: '1.5rem'
                      }}
                    />
                    <Bar dataKey="avgStress" radius={[15, 15, 0, 0]} barSize={60}>
                      {classes.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.avgStress > 60 ? '#EF4444' : entry.avgStress > 40 ? '#F59E0B' : '#18A5A7'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-display font-black text-brand-primary">Kết quả kiểm tra gần đây</h3>
                <button 
                  onClick={() => setCurrentView('class-list')}
                  className="px-6 py-2 bg-brand-primary/5 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
                >
                  XEM TẤT CẢ
                </button>
              </div>
              <div className="space-y-4">
                {testResults.slice(0, 5).map((result) => (
                  <div key={result.id} className="p-6 rounded-[2rem] bg-gray-50 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-sm">
                        {result.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">@{result.username}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{result.testTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {userData.role === 'Quản trị viên cấp cao' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangePassword?.(result.id, result.username);
                            }}
                            className="p-2 text-gray-300 hover:text-brand-primary transition-colors"
                            title="Đổi mật khẩu"
                          >
                            <Lock size={16} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteStudent?.(result.id);
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <div className="text-right">
                        <p className="text-lg font-black text-brand-primary">{result.score}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Điểm số</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {/* Teachers List */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-display font-black text-brand-primary">Giáo viên</h3>
                <button 
                  onClick={() => setCurrentView('teacher-list')}
                  className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                >
                  XEM TẤT CẢ
                </button>
              </div>
              <div className="space-y-4">
                {teachers.slice(0, 4).map((teacher) => (
                  <div 
                    key={teacher.id} 
                    onClick={() => onViewTeacher(teacher)}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-black text-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{teacher.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{teacher.school}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ManagementLayout>
  );
};

const SettingsView = ({
  onBack,
  onDeleteAccount
}: {
  onBack: () => void;
  onDeleteAccount: () => void;
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    alert('Đổi mật khẩu thành công!');
    setShowPasswordChange(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-brand-primary/10 hover:text-brand-primary hover:border-transparent transition-all shadow-sm"
        >
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-display font-black text-brand-primary">Cài đặt</h2>
          <p className="text-gray-500 font-medium mt-2">Tùy chỉnh trải nghiệm và quản lý dữ liệu của bạn.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Settings size={24} className="text-brand-primary" />
            Tùy chỉnh giao diện
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-700">Chế độ hiển thị</p>
                <p className="text-sm text-gray-500">Sáng / Tối</p>
              </div>
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    theme === 'light' ? "bg-brand-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  Sáng
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    theme === 'dark' ? "bg-gray-800 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  Tối
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-700">Ngôn ngữ</p>
                <p className="text-sm text-gray-500">Tiếng Việt / English</p>
              </div>
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <button 
                  onClick={() => setLanguage('vi')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    language === 'vi' ? "bg-brand-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  Tiếng Việt
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    language === 'en' ? "bg-brand-primary text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Lock size={24} className="text-brand-primary" />
            Bảo mật
          </h3>
          
          <div className="space-y-4">
            {!showPasswordChange ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-700">Mật khẩu</p>
                  <p className="text-sm text-gray-500">Thay đổi mật khẩu đăng nhập của bạn</p>
                </div>
                <button 
                  onClick={() => setShowPasswordChange(true)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                >
                  Thay đổi
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="p-6 bg-gray-50 rounded-2xl space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.new}
                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2 mb-2">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.confirm}
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="flex-1 py-3 bg-white text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all border border-gray-200"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-brand-primary/20 transition-all"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-red-100 shadow-sm">
          <h3 className="text-xl font-black text-red-500 mb-6 flex items-center gap-3">
            <AlertCircle size={24} />
            Khu vực nguy hiểm
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
              <div>
                <p className="font-bold text-gray-800">Xóa tài khoản</p>
                <p className="text-sm text-gray-500">Xóa vĩnh viễn tài khoản và mọi dữ liệu liên quan.</p>
              </div>
              <button 
                onClick={onDeleteAccount}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
              >
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(HANDBOOK_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatUiMessage[]>([
    createChatMessage('assistant', 'Chào bạn! Mình là bé Trạm. Bạn cần hỗ trợ gì trong hệ thống Trạm an?'),
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHandbookHovered, setIsHandbookHovered] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isTeacherDetailOpen, setIsTeacherDetailOpen] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [editingTeacherOriginalName, setEditingTeacherOriginalName] = useState('');
  const [adminPasswordPrompt, setAdminPasswordPrompt] = useState<{isOpen: boolean, callback: (() => void) | null}>({ isOpen: false, callback: null });
  const [filterSchoolId, setFilterSchoolId] = useState<string | null>(null);

  const handleSendChatMessage = async () => {
    const message = chatInput.trim();
    if (!message || isChatSending) return;

    setChatError(null);
    setChatMessages((prev) => [...prev, createChatMessage('user', message)]);
    setChatInput('');
    setIsChatSending(true);

    const result = await chatService.sendMessage(message);
    if ('error' in result) {
      setChatError(result.error.message || 'Chatbot đang bận, vui lòng thử lại.');
      setChatMessages((prev) => [
        ...prev,
        createChatMessage('assistant', 'Mình đang gặp lỗi kết nối. Bạn thử lại sau vài giây nhé.'),
      ]);
      setIsChatSending(false);
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      createChatMessage('assistant', result.data.reply, result.data.sources),
    ]);
    setIsChatSending(false);
  };

  const requireAdminPassword = (callback: () => void) => {
    if (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') {
      setAdminPasswordPrompt({ isOpen: true, callback });
    } else {
      callback();
    }
  };
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const [schools, setSchools] = useState(MOCK_SCHOOLS);
  const [classes, setClasses] = useState([
    { id: 'c1', name: '12A1', studentCount: 45, avgStress: 52, teacherName: 'Nguyễn Thị Minh' },
    { id: 'c2', name: '12A2', studentCount: 42, avgStress: 68, teacherName: 'Trần Văn Hùng' },
    { id: 'c3', name: '11B1', studentCount: 48, avgStress: 45, teacherName: 'Lê Thị Mai' },
    { id: 'c4', name: '10C1', studentCount: 50, avgStress: 38, teacherName: 'Nguyễn Thị Minh' },
    { id: 'c5', name: '12D1', studentCount: 40, avgStress: 55, teacherName: 'Trần Văn Hùng' },
  ]);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [selectedClassForView, setSelectedClassForView] = useState<any>(null);
  const [tests, setTests] = useState([
    { 
      id: '1',
      title: "Bài test PHQ-9", 
      desc: "Đánh giá mức độ trầm cảm.",
      time: "10 phút",
      questions: "9 câu",
      icon: "Heart",
      color: "bg-brand-primary",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Học sinh',
      questionList: [
        {
          id: 'q1',
          text: "Ít hứng thú hoặc không có niềm vui trong việc làm mọi thứ?",
          options: [
            { id: 'o1', text: "Hoàn toàn không", score: 0 },
            { id: 'o2', text: "Vài ngày", score: 1 },
            { id: 'o3', text: "Hơn một nửa số ngày", score: 2 },
            { id: 'o4', text: "Gần như mỗi ngày", score: 3 }
          ]
        },
        {
          id: 'q2',
          text: "Cảm thấy buồn bã, chán nản hoặc tuyệt vọng?",
          options: [
            { id: 'o1', text: "Hoàn toàn không", score: 0 },
            { id: 'o2', text: "Vài ngày", score: 1 },
            { id: 'o3', text: "Hơn một nửa số ngày", score: 2 },
            { id: 'o4', text: "Gần như mỗi ngày", score: 3 }
          ]
        }
      ]
    },
    { 
      id: '2',
      title: "Bài test GAD-7", 
      desc: "Đánh giá mức độ lo âu.",
      time: "10 phút",
      questions: "7 câu",
      icon: "Clock",
      color: "bg-brand-orange",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Học sinh',
      questionList: [
        {
          id: 'q1',
          text: "Cảm thấy lo lắng, bồn chồn hoặc căng thẳng?",
          options: [
            { id: 'o1', text: "Hoàn toàn không", score: 0 },
            { id: 'o2', text: "Vài ngày", score: 1 },
            { id: 'o3', text: "Hơn một nửa số ngày", score: 2 },
            { id: 'o4', text: "Gần như mỗi ngày", score: 3 }
          ]
        }
      ]
    },
    { 
      id: '3',
      title: "Bài test SDQ-25", 
      desc: "Bảng hỏi điểm mạnh và điểm yếu.",
      time: "15 phút",
      questions: "25 câu",
      icon: "Users",
      color: "bg-brand-secondary",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Học sinh',
      questionList: [
        {
          id: 'q1',
          text: "Quan tâm đến cảm xúc của người khác",
          options: [
            { id: 'o1', text: "Không đúng", score: 0 },
            { id: 'o2', text: "Hơi đúng", score: 1 },
            { id: 'o3', text: "Hoàn toàn đúng", score: 2 }
          ]
        }
      ]
    },
    { 
      id: '4',
      title: "Bài test MT", 
      desc: "Đánh giá sức bật tinh thần.",
      time: "15 phút",
      questions: "20 câu",
      icon: "Zap",
      color: "bg-brand-primary",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Học sinh',
      questionList: []
    },
    { 
      id: '5',
      title: "Bài test DASS-21", 
      desc: "Đánh giá chi tiết mức độ trầm cảm, lo âu và căng thẳng.",
      time: "20 phút",
      questions: "21 câu",
      icon: "AlertCircle",
      color: "bg-brand-orange",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Học sinh',
      questionList: []
    },
    { 
      id: '6',
      title: "Trắc nghiệm Trầm cảm (PHQ-9)", 
      desc: "Sàng lọc các dấu hiệu tâm lý cần sự hỗ trợ chuyên môn.",
      time: "Không giới hạn",
      questions: "9 câu",
      icon: "Info",
      color: "bg-red-500",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Cả hai',
      questionList: []
    },
    { 
      id: '7',
      title: "Khám phá Ngôn ngữ Tình yêu", 
      desc: "Hiểu cách bạn trao đi và nhận lại sự yêu thương.",
      time: "Không giới hạn",
      questions: "30 câu",
      icon: "Sparkles",
      color: "bg-brand-orange",
      isOpen: true,
      isPredefined: true,
      targetAudience: 'Cả hai',
      questionList: []
    }
  ]);
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([
    { id: 'p1', name: 'Lê Văn Tám', school: 'THPT Lương Thế Vinh', username: 'tam_le', role: 'Giáo viên', timestamp: Date.now() - 3600000 },
    { id: 'p2', name: 'Hoàng Thị Yến', school: 'THPT Kim Liên', username: 'yen_hoang', role: 'Giáo viên', timestamp: Date.now() - 7200000 }
  ]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [teacherRegCode, setTeacherRegCode] = useState<{ code: string, expiry: number, className?: string } | null>(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState<{ id: string, name: string } | null>(null);

  const handleDeleteTest = (id: string) => {
    const testToDelete = tests.find(t => t.id === id);
    if (testToDelete?.isPredefined && userData.role !== 'Quản trị viên cấp cao') {
      alert('Bạn không có quyền xóa bài test mặc định của hệ thống.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa bài test này?')) {
      setTests(tests.filter(t => t.id !== id));
    }
  };

  const handleEditTest = (test: any) => {
    if (test) {
      if (test.isPredefined && userData.role !== 'Quản trị viên cấp cao') {
        alert('Bạn không có quyền chỉnh sửa bài test mặc định của hệ thống.');
        return;
      }
      setActiveTest(test);
    } else {
      setActiveTest({
        id: `t${Date.now()}`,
        title: 'Bài test mới',
        desc: 'Mô tả bài test',
        time: '15 phút',
        questions: '0 câu',
        icon: 'Zap',
        color: 'bg-brand-primary',
        isOpen: true,
        targetAudience: 'Cả hai',
        questionList: []
      });
    }
    setCurrentView('test-editor');
  };

  const onDeleteAdmin = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Admin này?')) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  const onDeleteTeacher = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const onDeleteStudent = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleChangePassword = (id: string, name: string) => {
    setPasswordChangeUser({ id, name });
    setIsChangePasswordModalOpen(true);
  };

  const onConfirmPasswordChange = (password: string) => {
    if (!passwordChangeUser) return;
    console.log(`Changing password for user ${passwordChangeUser.id} to ${password}`);
    alert('Đổi mật khẩu thành công!');
  };
  const handleSaveTeacherProfile = () => {
    if (!selectedTeacher) return;

    const normalizedName = (selectedTeacher.fullName || selectedTeacher.name || '').trim();
    const nextTeacherName = normalizedName || selectedTeacher.name;
    const previousTeacherName =
      editingTeacherOriginalName || selectedTeacher.fullName || selectedTeacher.name;

    const updatedTeacher = {
      ...selectedTeacher,
      name: nextTeacherName,
      fullName: nextTeacherName,
    };

    setTeachers((prevTeachers) =>
      prevTeachers.map((teacher) =>
        teacher.id === updatedTeacher.id ? { ...teacher, ...updatedTeacher } : teacher,
      ),
    );

    if (previousTeacherName && previousTeacherName !== nextTeacherName) {
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.teacherName === previousTeacherName ? { ...cls, teacherName: nextTeacherName } : cls,
        ),
      );
    }

    setSelectedTeacher(updatedTeacher);
    setIsEditingTeacher(false);
    setEditingTeacherOriginalName('');
  };

  const DEFAULT_USER_DATA = {
    id: 'u1',
    name: 'Người dùng Trạm an',
    username: 'user_tram_an',
    email: 'user@tram-an.vn',
    phoneNumber: '',
    birthYear: '',
    bio: 'Đang trên hành trình khám phá tâm hồn.',
    avatar: 'https://picsum.photos/seed/user/200/200',
    gender: '',
    school: '',
    className: '',
    teacherType: '',
    subject: '',
    role: 'Học sinh' as AuthRole
  };

  const [userData, setUserData] = useState(DEFAULT_USER_DATA);

  const hasAssignedClass = (className?: string) => Boolean(className?.trim());

  const resolveTeacherType = (teacherType?: string, className?: string) => {
    if (teacherType === 'homeroom' || teacherType === 'subject') return teacherType;
    return hasAssignedClass(className) ? 'homeroom' : 'subject';
  };

  const canAccessTeacherClassView = (role: AuthRole, className?: string, teacherType?: string) => {
    if (role !== 'Giáo viên') return false;
    if (!hasAssignedClass(className)) return false;
    return resolveTeacherType(teacherType, className) === 'homeroom';
  };

  const getDefaultViewByRole = (role: AuthRole, className?: string, teacherType?: string): View => {
    if (role === 'Admin') return 'admin';
    if (role === 'Quản trị viên cấp cao') return 'superadmin';
    if (role === 'Giáo viên') {
      return canAccessTeacherClassView(role, className, teacherType) ? 'teacher-class' : 'home';
    }
    return 'home';
  };

  const buildUserDataFromAccount = (account: AuthAccount) => ({
    ...DEFAULT_USER_DATA,
    id: account.id,
    name: account.profile.name || account.username,
    username: account.username,
    email: account.profile.email || `${account.username}@tram-an.vn`,
    birthYear: account.profile.birthYear || '',
    gender: account.profile.gender || '',
    school: account.profile.school || '',
    className: account.profile.className || '',
    teacherType: account.profile.teacherType || '',
    subject: account.profile.subject || '',
    role: account.role,
  });

  useEffect(() => {
    let isUnmounted = false;

    const syncSession = async () => {
      const sessionAccount = await authService.getCurrentSession();
      if (!sessionAccount || isUnmounted) return;

      setIsLoggedIn(true);
      setUserData(buildUserDataFromAccount(sessionAccount));
      setCurrentView(getDefaultViewByRole(sessionAccount.role, sessionAccount.profile.className, sessionAccount.profile.teacherType));
    };

    void syncSession();

    return () => {
      isUnmounted = true;
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setUserData(DEFAULT_USER_DATA);
    setCurrentView('home');
    setFilterSchoolId(null);
  };


  const filteredSections = useMemo(() => {
    return HANDBOOK_DATA.filter(section => 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const activeSection = useMemo(() => {
    return HANDBOOK_DATA.find(s => s.id === activeSectionId) || HANDBOOK_DATA[0];
  }, [activeSectionId]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(HANDBOOK_DATA.map(s => s.category)));
    return cats;
  }, []);

  const isManagementView = useMemo(() => {
    if (!isLoggedIn) return false;
    if (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') return true;
    const managementViews = ['superadmin', 'admin', 'admin-list', 'class-list', 'messages', 'reports'];
    return managementViews.includes(currentView);
  }, [currentView, userData.role, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao')) {
      if (currentView === 'home' || currentView === 'handbook' || currentView === 'contact') {
        setCurrentView(userData.role === 'Quản trị viên cấp cao' ? 'superadmin' : 'admin');
      }
    }
  }, [isLoggedIn, userData.role, currentView]);

  useEffect(() => {
    if (
      isLoggedIn &&
      !canAccessTeacherClassView(userData.role, userData.className, userData.teacherType) &&
      currentView === 'teacher-class'
    ) {
      setCurrentView('home');
    }
  }, [isLoggedIn, userData.role, userData.className, userData.teacherType, currentView]);

  const userSchoolId = useMemo(() => {
    if (userData.role === 'Admin') {
      return schools.find(s => s.name === userData.school)?.id || null;
    }
    return null;
  }, [userData.school, schools, userData.role]);

  const filteredPendingTeachers = useMemo(() => {
    if (userData.role === 'Admin' && userSchoolId) {
      return pendingTeachers.filter(t => t.schoolId === userSchoolId || t.school === userData.school);
    }
    return pendingTeachers;
  }, [pendingTeachers, userData, userSchoolId]);

  const filteredTeachers = useMemo(() => {
    if (userData.role === 'Admin' && userSchoolId) {
      return teachers.filter(t => t.schoolId === userSchoolId || t.school === userData.school);
    }

    if (userData.role === 'Quản trị viên cấp cao' && filterSchoolId) {
      const selectedSchool = schools.find((school) => school.id === filterSchoolId);
      return teachers.filter(
        (teacher) =>
          teacher.schoolId === filterSchoolId ||
          (selectedSchool && teacher.school === selectedSchool.name),
      );
    }

    return teachers;
  }, [teachers, userData, userSchoolId, filterSchoolId, schools]);

  const filteredClasses = useMemo(() => {
    if (userData.role === 'Admin' && userSchoolId) {
      return classes.filter(c => (c as any).schoolId === userSchoolId);
    }
    return classes;
  }, [classes, userData, userSchoolId]);

  const filteredStudents = useMemo(() => {
    if (userData.role === 'Admin' && userSchoolId) {
      return students.filter(s => s.schoolId === userSchoolId);
    }
    return students;
  }, [students, userData, userSchoolId]);

  const filteredTestResults = useMemo(() => {
    if (userData.role === 'Admin' && userSchoolId) {
      return testResults.filter(r => {
        const student = students.find(s => s.id === r.id || s.username === r.username);
        return student?.schoolId === userSchoolId;
      });
    }
    return testResults;
  }, [testResults, students, userData, userSchoolId]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Header Area with Logos and User Profile */}
      {!isManagementView && (
        <header className="bg-white py-6 px-4 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <button 
              onClick={() => {
                if (isLoggedIn && userData.role === 'Admin') {
                  setCurrentView('admin');
                } else if (isLoggedIn && userData.role === 'Quản trị viên cấp cao') {
                  setCurrentView('superadmin');
                } else {
                  setCurrentView('home');
                }
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
            >
              <img src="/logo.png" alt="Trạm An Logo" className="h-28 w-auto object-contain" onError={(e) => {
                // Fallback if logo.png is not uploaded yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.classList.remove('hidden');
              }} />
              <div className="hidden flex items-center gap-3">
                <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-sm">
                  <BookOpen size={32} />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-3xl font-black text-brand-primary tracking-tight leading-none">TRẠM AN</h1>
                  <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mt-2">Lặng để lắng</p>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div 
                  className="relative"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button 
                    onClick={() => setCurrentView('account')}
                    className="flex items-center gap-3 p-1 pr-4 bg-gray-50 rounded-full border border-gray-100 hover:bg-brand-primary/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img src={userData.avatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">XIN CHÀO</p>
                      <p className="text-xs font-bold text-brand-primary">{userData.name}</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-3 w-56 bg-white rounded-[2rem] shadow-2xl border border-gray-50 overflow-hidden z-[100]"
                      >
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TÀI KHOẢN</p>
                          <p className="text-xs font-bold text-brand-primary truncate">{userData.email || userData.username}</p>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => {
                              setCurrentView('account');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-primary/5 text-gray-600 hover:text-brand-primary transition-all text-left"
                          >
                            <User size={16} />
                            <span className="text-xs font-bold">Tài khoản</span>
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentView('settings');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-primary/5 text-gray-600 hover:text-brand-primary transition-all text-left"
                          >
                            <Settings size={16} />
                            <span className="text-xs font-bold">Cài đặt</span>
                          </button>
                          <div className="h-px bg-gray-50 my-2 mx-2" />
                          <button 
                            onClick={() => {
                              setIsLoggedIn(false);
                              setIsUserMenuOpen(false);
                              setCurrentView('home');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-500 transition-all text-left"
                          >
                            <LogOut size={16} />
                            <span className="text-xs font-bold">Đăng xuất</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setCurrentView('auth');
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
                >
                  <LogIn size={16} />
                  ĐĂNG NHẬP
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Navigation */}
      {!isManagementView && currentView !== 'auth' && (
        <nav 
          className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm"
          onMouseLeave={() => setIsHandbookHovered(false)}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            {isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') ? (
              <div className="flex items-center">
                {userData.role === 'Quản trị viên cấp cao' && (
                  <button 
                    onClick={() => setCurrentView('superadmin')}
                    className={cn(
                      "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                      currentView === 'superadmin' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                    )}
                  >
                    QUẢN TRỊ CẤP CAO
                  </button>
                )}
                <button 
                  onClick={() => setCurrentView('admin')}
                  className={cn(
                    "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                    currentView === 'admin' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                  )}
                >
                  QUẢN LÝ HỆ THỐNG
                </button>
                <button 
                  onClick={() => setCurrentView('test-list')}
                  className={cn(
                    "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                    currentView === 'test-list' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                  )}
                >
                  QUẢN LÝ BÀI TEST
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentView('home')}
                  onMouseEnter={() => setIsHandbookHovered(false)}
                  className={cn(
                    "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                    currentView === 'home' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                  )}
                >
                  TRANG CHỦ
                </button>
                
                <div 
                  className="relative"
                  onMouseEnter={() => setIsHandbookHovered(true)}
                >
                  <button 
                    onClick={() => setCurrentView('handbook')}
                    className={cn(
                      "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                      currentView === 'handbook' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                    )}
                  >
                    CẨM NANG
                  </button>
                </div>

                {isLoggedIn && (
                  <button 
                    onClick={() => setCurrentView('test-list')}
                    onMouseEnter={() => setIsHandbookHovered(false)}
                    className={cn(
                      "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                      currentView === 'test-list' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                    )}
                  >
                    TRẠM GIẢI MÃ
                  </button>
                )}

                {isLoggedIn && canAccessTeacherClassView(userData.role, userData.className, userData.teacherType) && (
                  <button 
                    onClick={() => setCurrentView('teacher-class')}
                    onMouseEnter={() => setIsHandbookHovered(false)}
                    className={cn(
                      "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                      currentView === 'teacher-class' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                    )}
                  >
                    LỚP HỌC
                  </button>
                )}

                <button 
                  onClick={() => setCurrentView('contact')}
                  onMouseEnter={() => setIsHandbookHovered(false)}
                  className={cn(
                    "px-8 py-5 text-sm font-bold uppercase tracking-widest transition-all border-b-4",
                    currentView === 'contact' ? "border-brand-primary text-brand-primary" : "border-transparent text-gray-400 hover:text-brand-primary"
                  )}
                >
                  LIÊN HỆ
                </button>
              </>
            )}
          </div>

          {/* Mega Menu Dropdown */}
          <AnimatePresence>
            {isHandbookHovered && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-16 z-50"
              >
                <div className="max-w-7xl mx-auto px-8">
                  <div className="grid grid-cols-2 gap-24">
                    {categories.map((category) => (
                      <div key={category} className="space-y-6">
                        <h4 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] border-b border-brand-primary/10 pb-4">
                          {category}
                        </h4>
                        <div className="flex flex-col gap-1">
                          {HANDBOOK_DATA.filter(s => s.category === category).map((section) => (
                            <button
                              key={section.id}
                              onClick={() => {
                                setActiveSectionId(section.id);
                                setCurrentView('handbook');
                                setIsHandbookHovered(false);
                              }}
                              className="group flex items-center justify-between gap-4 text-left py-2 hover:translate-x-1 transition-all"
                            >
                              <span className="text-[13px] font-bold text-gray-500 group-hover:text-brand-primary transition-colors">
                                {section.title}
                              </span>
                              <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center">
                        <Sparkles size={20} />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Khám phá hàng chục bài viết chuyên sâu về tâm lý học và kỹ năng sống tại Trạm an.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setCurrentView('handbook');
                        setIsHandbookHovered(false);
                      }}
                      className="px-8 py-3 bg-brand-primary/5 text-brand-primary rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all"
                    >
                      XEM TOÀN BỘ CẨM NANG
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}

      {/* Content Area */}
      <main className="flex-1 bg-[#F9FAFB]">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-16"
            >
              {/* Hero Section for Guest */}
              {!isLoggedIn && (
                <div className="text-center mb-24">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                  >
                    <Sparkles size={14} /> CHÀO MỪNG BẠN ĐẾN VỚI TRẠM AN
                  </motion.div>
                  <h2 className="text-6xl md:text-7xl font-serif italic text-brand-primary mb-8 leading-tight">
                    Nơi tâm hồn tìm thấy <br /> sự bình yên
                  </h2>
                  <p className="text-gray-500 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                    Khám phá những kiến thức tâm lý học chuyên sâu, cẩm nang chăm sóc sức khỏe tinh thần và kết nối với cộng đồng thấu hiểu.
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    <button 
                      onClick={() => {
                        setCurrentView('auth');
                      }}
                      className="px-10 py-5 bg-brand-primary text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-brand-primary/30 transition-all flex items-center gap-3"
                    >
                      BẮT ĐẦU NGAY <ArrowRight size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentView('handbook')}
                      className="px-10 py-5 bg-white text-brand-primary border-2 border-brand-primary/10 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all"
                    >
                      XEM CẨM NANG
                    </button>
                  </div>
                </div>
              )}

              {/* Hero Section for Logged In User */}
              {isLoggedIn && (
                <div className="mb-24">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-left">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                      >
                        <Sparkles size={14} /> DÀNH RIÊNG CHO {userData.role.toUpperCase()}
                      </motion.div>
                      <h2 className="text-5xl md:text-6xl font-serif italic text-brand-primary mb-6 leading-tight">
                        Khám phá bản thân và làm chủ cảm xúc
                      </h2>
                      <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                        Trạm An là người bạn đồng hành giúp bạn vượt qua những áp lực học đường, thấu hiểu cảm xúc và phát triển bản thân mỗi ngày.
                      </p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setCurrentView('handbook')}
                          className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:shadow-xl transition-all"
                        >
                          CẨM NANG HỌC ĐƯỜNG
                        </button>
                        <button 
                          onClick={() => setCurrentView('test-list')}
                          className="px-8 py-4 bg-white text-brand-primary border-2 border-brand-primary/10 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all"
                        >
                          LÀM TEST TÂM LÝ
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 relative">
                      <div className="w-full aspect-square bg-brand-primary/5 rounded-[3rem] overflow-hidden relative">
                        <img 
                          src="https://picsum.photos/seed/student/800/800" 
                          alt="Hero" 
                          className="w-full h-full object-cover mix-blend-multiply opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 to-transparent"></div>
                      </div>
                      <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center">
                          <Heart size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CẢM XỨC HÔM NAY</p>
                          <p className="text-sm font-bold text-brand-primary">Bạn cảm thấy thế nào?</p>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              )}

              {/* Psychology News & Concepts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: "Tâm lý học hành vi", desc: "Hiểu về những thói quen và phản ứng tự nhiên.", color: "bg-white", textColor: "text-brand-primary", icon: <Zap /> },
                  { title: "Trí tuệ cảm xúc (EQ)", desc: "Làm chủ cảm xúc để kết nối sâu sắc hơn.", color: "bg-brand-primary/5", textColor: "text-brand-primary", icon: <Heart /> },
                  { title: "Cơ chế phòng vệ", desc: "Cách tâm trí tự bảo vệ trước tổn thương.", color: "bg-white", textColor: "text-brand-primary", icon: <Globe /> },
                  { title: "Khái niệm 'Dòng chảy'", desc: "Trạng thái tập trung tối đa và hạnh phúc.", color: "bg-brand-secondary/10", textColor: "text-gray-700", icon: <MessageCircle /> }
                ].map((card, idx) => (
                  <div key={idx} className={cn("p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-2 cursor-pointer", card.color)}>
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8", card.textColor, "bg-white shadow-sm")}>
                      {React.cloneElement(card.icon as any, { size: 32 })}
                    </div>
                    <h3 className={cn("text-xl font-bold mb-3", card.textColor)}>{card.title}</h3>
                    <p className="text-xs text-gray-500 mb-8 leading-relaxed px-4">{card.desc}</p>
                    <button className={cn("text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2", card.textColor)}>
                      TÌM HIỂU THÊM <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Psychology Content Grid */}
              <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-12 rounded-[2.5rem] text-white shadow-2xl shadow-brand-primary/20">
                  <h2 className="text-4xl font-serif italic mb-6">Tin tức Tâm lý học</h2>
                  <p className="text-white/80 leading-relaxed mb-10 text-lg">
                    Cập nhật những nghiên cứu mới nhất và các khái niệm tâm lý giúp bạn thấu hiểu bản thân và thế giới xung quanh.
                  </p>
                  <button onClick={() => setCurrentView('handbook')} className="bg-white text-brand-primary px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg">
                    XEM KIẾN THỨC
                  </button>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { title: "Hội chứng Imposter", desc: "Tại sao chúng ta thường cảm thấy mình là kẻ giả mạo?" },
                    { title: "Sức mạnh của sự tổn thương", desc: "Khám phá cách chấp nhận bản thân để trưởng thành." },
                    { title: "Tâm lý học màu sắc", desc: "Màu sắc ảnh hưởng thế nào đến tâm trạng của bạn?" },
                    { title: "Kỹ thuật chánh niệm", desc: "Giảm căng thẳng thông qua sự hiện diện thuần túy." }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                      <h4 className="font-bold text-xl text-brand-primary mb-3 group-hover:translate-x-1 transition-transform">{item.title}</h4>
                      <div className="h-1.5 w-12 bg-brand-orange rounded-full mb-6"></div>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'handbook' && (
            <motion.div 
              key="handbook"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-[calc(100vh-200px)]"
            >
              {/* Sidebar */}
              <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className={cn(
                  "border-r border-gray-100 bg-white flex flex-col z-20 relative overflow-hidden",
                  !isSidebarOpen && "pointer-events-none"
                )}
              >
                <div className="p-8 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiến thức..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/10 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-6 space-y-8">
                  {categories.map(category => {
                    const sectionsInCat = filteredSections.filter(s => s.category === category);
                    if (sectionsInCat.length === 0) return null;

                    return (
                      <div key={category} className="space-y-2">
                        <h3 className="px-4 text-[11px] uppercase tracking-[0.2em] text-brand-primary font-black mb-4">
                          {category}
                        </h3>
                        {sectionsInCat.map(section => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSectionId(section.id)}
                            className={cn(
                              "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm transition-all group",
                              activeSectionId === section.id 
                                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                : "hover:bg-gray-50 text-gray-600"
                            )}
                          >
                            <span className={cn(
                              "transition-colors",
                              activeSectionId === section.id ? "text-white" : "text-brand-primary/40 group-hover:text-brand-primary"
                            )}>
                              {IconMap[section.icon || 'Info']}
                            </span>
                            <span className="flex-1 text-left font-bold truncate">{section.title}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </nav>
              </motion.aside>

              {/* Content Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-white">
                <div className="h-14 border-b border-gray-100 flex items-center px-8">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-gray-50 rounded-xl mr-6 transition-colors"
                  >
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 hover:bg-gray-50 rounded-xl mr-2 transition-colors"
                  >
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span>{activeSection.category}</span>
                    <ChevronRight size={12} />
                    <span className="text-brand-primary">{activeSection.title}</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 md:p-20">
                  <article className="max-w-3xl mx-auto">
                    <div className="mb-12">
                      <span className="text-brand-primary/60 font-black text-[11px] uppercase tracking-[0.3em] mb-4 block">{activeSection.category}</span>
                      <h2 className="text-5xl font-serif italic text-brand-primary leading-tight">{activeSection.title}</h2>
                      <div className="h-1.5 w-24 bg-brand-orange rounded-full mt-8"></div>
                    </div>
                    <div className="markdown-body prose prose-teal lg:prose-lg">
                      <Markdown>{activeSection.content}</Markdown>
                    </div>
                  </article>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'reports' && isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportsView 
                userData={userData}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
                teachers={filteredTeachers}
                testResults={filteredTestResults}
              />
            </motion.div>
          )}

          {currentView === 'test-list' && isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') && (
            <motion.div
              key="admin-test-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TestListView 
                tests={tests}
                onEdit={handleEditTest}
                onDelete={handleDeleteTest}
                onToggle={(id) => {
                  setTests(tests.map(t => t.id === id ? { ...t, isOpen: !t.isOpen } : t));
                }}
                userData={userData}
                setCurrentView={(view) => {
                  setFilterSchoolId(null);
                  setCurrentView(view);
                }}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
              />
            </motion.div>
          )}

          {currentView === 'test-list' && isLoggedIn && userData.role !== 'Admin' && userData.role !== 'Quản trị viên cấp cao' && (
            <motion.div
              key="student-test-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StudentTestsView 
                tests={tests}
                onTakeTest={(test) => {
                  setActiveTest(test);
                  setCurrentView('test-taking');
                }}
                userData={userData}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
              />
            </motion.div>
          )}

          {currentView === 'admin-list' && isLoggedIn && userData.role === 'Quản trị viên cấp cao' && (
            <motion.div
              key="admin-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminListView 
                admins={admins} 
                onBack={() => {
                  setFilterSchoolId(null);
                  setCurrentView('superadmin');
                }}
                userData={userData}
                setCurrentView={(view) => {
                  setFilterSchoolId(null);
                  setCurrentView(view);
                }}
                onLogout={handleLogout}
                onViewTeachersOfSchool={(schoolId) => {
                  setFilterSchoolId(schoolId);
                  setCurrentView('teacher-list');
                }}
                onViewStudentsOfSchool={(schoolId) => {
                  setFilterSchoolId(schoolId);
                  setCurrentView('class-list');
                }}
                setFilterSchoolId={setFilterSchoolId}
                onDeleteAdmin={onDeleteAdmin}
                onChangePassword={handleChangePassword}
              />
            </motion.div>
          )}

          {currentView === 'school-list' && isLoggedIn && userData.role === 'Quản trị viên cấp cao' && (
            <motion.div
              key="school-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SchoolListView 
                schools={schools} 
                onBack={() => {
                  setFilterSchoolId(null);
                  setCurrentView('superadmin');
                }}
                userData={userData}
                setCurrentView={(view) => {
                  setFilterSchoolId(null);
                  setCurrentView(view);
                }}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
              />
            </motion.div>
          )}

          {currentView === 'teacher-list' && isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') && (
            <motion.div
              key="teacher-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TeacherListView 
                teachers={filteredTeachers}
                onBack={() => {
                  if (userData.role === 'Quản trị viên cấp cao') {
                    if (filterSchoolId) {
                      setFilterSchoolId(null);
                      setCurrentView('school-list');
                    } else {
                      setCurrentView('superadmin');
                    }
                  } else {
                    setCurrentView('admin');
                  }
                }}
                onViewTeacher={(teacher) => {
                  requireAdminPassword(() => {
                    setSelectedTeacher(teacher);
                    setIsEditingTeacher(false);
                    setEditingTeacherOriginalName('');
                    setIsTeacherDetailOpen(true);
                  });
                }}
                userData={userData}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
              />
            </motion.div>
          )}

          {currentView === 'class-list' && isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') && (
            <motion.div
              key="class-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ClassListView 
                classes={filteredClasses} 
                students={filteredStudents}
                teachers={filteredTeachers}
                initialSelectedClass={selectedClassForView}
                onBack={() => {
                  setSelectedClassForView(null);
                  if (userData.role === 'Quản trị viên cấp cao') {
                    if (filterSchoolId) {
                      // If we are viewing classes of a specific school, go back to school list
                      setFilterSchoolId(null);
                      setCurrentView('school-list');
                    } else {
                      setCurrentView('superadmin');
                    }
                  } else {
                    setFilterSchoolId(null);
                    setCurrentView('admin');
                  }
                }}
                onViewClass={(cls) => {
                  // Handled in ClassListView
                }}
                userData={userData}
                setCurrentView={(view) => {
                  setFilterSchoolId(null);
                  setCurrentView(view);
                }}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
                onDeleteStudent={onDeleteStudent}
                onChangePassword={handleChangePassword}
                onRequireAdminPassword={requireAdminPassword}
              />
            </motion.div>
          )}

          {currentView === 'superadmin' && isLoggedIn && userData.role === 'Quản trị viên cấp cao' && (
            <motion.div
              key="superadmin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SuperAdminView 
                setCurrentView={setCurrentView}
                admins={admins}
                schools={schools}
                teachers={teachers}
                classes={classes}
                userData={userData}
                onLogout={handleLogout}
                onViewSchool={(school) => {
                  console.log('View school:', school);
                }}
                onViewAdmin={(admin) => {
                  console.log('View admin:', admin);
                }}
                setFilterSchoolId={setFilterSchoolId}
              />
            </motion.div>
          )}

          {currentView === 'teacher-class' && isLoggedIn && canAccessTeacherClassView(userData.role, userData.className, userData.teacherType) && (
            <motion.div
              key="teacher-class"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TeacherClassView 
                userData={userData}
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
                classes={filteredClasses}
                students={filteredStudents}
                teachers={filteredTeachers}
                testResults={filteredTestResults}
              />
            </motion.div>
          )}

          {currentView === 'admin' && isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminView 
                setCurrentView={setCurrentView} 
                pendingTeachers={filteredPendingTeachers}
                teachers={filteredTeachers}
                classes={filteredClasses}
                students={filteredStudents}
                testResults={filteredTestResults}
                userData={userData}
                onLogout={handleLogout}
                onApprove={(id) => {
                  const teacher = pendingTeachers.find(t => t.id === id);
                  if (teacher) {
                    setTeachers([...teachers, { ...teacher, id: `t${teachers.length + 1}` }]);
                    setPendingTeachers(pendingTeachers.filter(t => t.id !== id));
                    authService.approveTeacherAccount(teacher.username, {
                      school: teacher.school,
                      className: teacher.className,
                      teacherType: teacher.teacherType || (teacher.className ? 'homeroom' : 'subject'),
                      subject: teacher.subject || '',
                      name: teacher.name,
                    });
                  }
                }}
                onDeleteTeacher={onDeleteTeacher}
                onViewClass={(cls) => {
                  setSelectedClassForView(cls);
                  setCurrentView('class-list');
                }}
                onViewTeacher={(teacher) => {
                  requireAdminPassword(() => {
                    setSelectedTeacher(teacher);
                    setIsEditingTeacher(false);
                    setEditingTeacherOriginalName('');
                    setIsTeacherDetailOpen(true);
                  });
                }}
                setFilterSchoolId={setFilterSchoolId}
                onDeleteStudent={onDeleteStudent}
                onChangePassword={handleChangePassword}
              />
            </motion.div>
          )}

          {currentView === 'test-editor' && isLoggedIn && (userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao') && activeTest && (
            <motion.div
              key="test-editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TestEditorView 
                test={activeTest}
                onBack={() => setCurrentView('test-list')}
                onSave={(updatedTest) => {
                  if (tests.find(t => t.id === updatedTest.id)) {
                    setTests(tests.map(t => t.id === updatedTest.id ? updatedTest : t));
                  } else {
                    setTests([...tests, updatedTest]);
                  }
                  setCurrentView('test-list');
                }}
              />
            </motion.div>
          )}

          {currentView === 'test-taking' && isLoggedIn && userData.role !== 'Admin' && activeTest && (
            <motion.div
              key="test-taking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TestTakingView 
                test={activeTest}
                userData={userData}
                onBack={() => setCurrentView('test-list')}
                onComplete={(score) => {
                  const newResult: TestResult = {
                    id: `r${Date.now()}`,
                    testId: activeTest.id,
                    testTitle: activeTest.title,
                    userId: userData.id,
                    userName: userData.name,
                    username: userData.username,
                    userRole: userData.role,
                    userClass: userData.className,
                    score: score,
                    timestamp: Date.now()
                  };
                  setTestResults([...testResults, newResult]);
                }}
                onTakeDass21={() => {
                  const dassTest = tests.find(t => t.title.toUpperCase().includes('DASS-21'));
                  if (dassTest) {
                    setActiveTest(dassTest);
                    setCurrentView('test-taking');
                  } else {
                    alert('Bài test DASS-21 chưa được tạo trên hệ thống.');
                  }
                }}
              />
            </motion.div>
          )}

          {currentView === 'contact' && (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-4 py-20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div>
                  <h2 className="text-5xl font-serif italic text-brand-primary mb-8 leading-tight">Hãy kết nối với Trạm an</h2>
                  <p className="text-gray-500 text-lg leading-relaxed mb-12">
                    Mọi ý kiến đóng góp hoặc thắc mắc của bạn đều là món quà quý giá giúp Trạm an hoàn thiện hơn mỗi ngày.
                  </p>
                  <div className="space-y-8 mb-16">
                    {[
                      { icon: <Phone />, label: "Hotline", value: "0975614712", color: "bg-brand-primary/10 text-brand-primary" },
                      { icon: <Mail />, label: "Email", value: "hello.traman@gmail.com", color: "bg-brand-secondary/20 text-gray-700" },
                      { icon: <MapPin />, label: "Địa chỉ", value: "132 Ông Ích Khiêm, Đà Nẵng", color: "bg-brand-orange/10 text-brand-orange" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-6 group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                          {React.cloneElement(item.icon as any, { size: 24 })}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                          <p className="text-xl font-bold text-gray-800">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-serif italic text-brand-primary mb-6">Địa chỉ hỗ trợ tâm lý tại Đà Nẵng</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { 
                          name: "Bệnh viện Tâm thần Đà Nẵng", 
                          phone: "0236 3842 326", 
                          address: "193 Nguyễn Lương Bằng, Liên Chiểu, Đà Nẵng",
                          desc: "Cơ sở y tế công lập chuyên khoa tâm thần hàng đầu tại Đà Nẵng, cung cấp dịch vụ khám và điều trị các rối loạn tâm lý, tâm thần."
                        },
                        { 
                          name: "Trung tâm Tư vấn Tâm lý - Giáo dục Đà Nẵng", 
                          phone: "0236 3519 929", 
                          address: "33 Xô Viết Nghệ Tĩnh, Hải Châu, Đà Nẵng",
                          desc: "Chuyên tư vấn tâm lý học đường, tâm lý gia đình và các vấn đề phát triển kỹ năng sống cho trẻ em và thanh thiếu niên."
                        },
                        { 
                          name: "Bệnh viện Phụ sản - Nhi Đà Nẵng (Khoa Tâm lý)", 
                          phone: "0236 3957 777", 
                          address: "402 Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng",
                          desc: "Đơn vị chuyên sâu về tâm lý nhi khoa, hỗ trợ can thiệp sớm và điều trị các vấn đề tâm lý ở trẻ em."
                        },
                        { 
                          name: "Trung tâm Hỗ trợ Phát triển Giáo dục Hòa nhập", 
                          phone: "0236 3611 505", 
                          address: "109 Phan Đăng Lưu, Hải Châu, Đà Nẵng",
                          desc: "Hỗ trợ giáo dục đặc biệt và tư vấn tâm lý cho trẻ em có nhu cầu đặc biệt, giúp trẻ hòa nhập cộng đồng."
                        }
                      ].map((center, idx) => (
                        <div key={idx} className="group">
                          <button 
                            onClick={() => setSelectedCenter(selectedCenter === idx ? null : idx)}
                            className={cn(
                              "w-full text-left p-6 rounded-3xl border transition-all flex items-center justify-between gap-4",
                              selectedCenter === idx 
                                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20" 
                                : "bg-white border-gray-100 hover:border-brand-primary/30 hover:bg-brand-primary/5"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                selectedCenter === idx ? "bg-white/20" : "bg-brand-primary/10 text-brand-primary"
                              )}>
                                <Heart size={20} />
                              </div>
                              <span className="font-bold text-sm">{center.name}</span>
                            </div>
                            <ChevronRight size={18} className={cn("transition-transform", selectedCenter === idx && "rotate-90")} />
                          </button>
                          
                          <AnimatePresence>
                            {selectedCenter === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-8 bg-gray-50 rounded-b-[2rem] -mt-4 border-x border-b border-gray-100 space-y-4">
                                  <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-brand-primary mt-1 shrink-0" />
                                    <p className="text-sm text-gray-600 font-medium">{center.address}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-brand-primary shrink-0" />
                                    <p className="text-lg font-black text-brand-primary">{center.phone}</p>
                                  </div>
                                  <p className="text-sm text-gray-500 leading-relaxed italic">
                                    {center.desc}
                                  </p>
                                  <button className="w-full py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all">
                                    GỌI NGAY
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl self-start sticky top-32">
                  <h3 className="font-bold text-2xl mb-8 text-gray-800">Gửi lời nhắn</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Họ tên</label>
                        <input type="text" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Email</label>
                        <input type="email" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Chủ đề</label>
                      <input type="text" className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Nội dung</label>
                      <textarea rows={4} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none transition-all"></textarea>
                    </div>
                    <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-3">
                      GỬI TIN NHẮN <Send size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'account' && isLoggedIn && (
            userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao' ? (
              <ManagementLayout
                userData={userData}
                currentView="account"
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
              >
                <AccountView 
                  userData={userData}
                  teacherRegCode={teacherRegCode}
                  setTeacherRegCode={setTeacherRegCode}
                  onBack={() => {
                    if (userData.role === 'Admin') setCurrentView('admin');
                    else if (userData.role === 'Quản trị viên cấp cao') setCurrentView('superadmin');
                    else setCurrentView('home');
                  }}
                  onSave={(updatedData) => {
                    setUserData(updatedData);
                    if (userData.role === 'Admin') setCurrentView('admin');
                    else if (userData.role === 'Quản trị viên cấp cao') setCurrentView('superadmin');
                    else setCurrentView('home');
                  }}
                />
              </ManagementLayout>
            ) : (
              <AccountView 
                userData={userData}
                teacherRegCode={teacherRegCode}
                setTeacherRegCode={setTeacherRegCode}
                onBack={() => {
                  setCurrentView(getDefaultViewByRole(userData.role, userData.className, userData.teacherType));
                }}
                onSave={(updatedData) => {
                  setUserData(updatedData);
                  setCurrentView(
                    getDefaultViewByRole(
                      (updatedData.role || userData.role) as AuthRole,
                      updatedData.className,
                      updatedData.teacherType || userData.teacherType,
                    ),
                  );
                }}
              />
            )
          )}

          {currentView === 'settings' && isLoggedIn && (
            userData.role === 'Admin' || userData.role === 'Quản trị viên cấp cao' ? (
              <ManagementLayout
                userData={userData}
                currentView="settings"
                setCurrentView={setCurrentView}
                onLogout={handleLogout}
                setFilterSchoolId={setFilterSchoolId}
              >
                <SettingsView 
                  onBack={() => {
                    if (userData.role === 'Admin') setCurrentView('admin');
                    else if (userData.role === 'Quản trị viên cấp cao') setCurrentView('superadmin');
                    else setCurrentView('home');
                  }}
                  onDeleteAccount={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
                      setIsLoggedIn(false);
                      setUserData(DEFAULT_USER_DATA);
                      setCurrentView('home');
                      alert('Đã xóa tài khoản thành công.');
                    }
                  }}
                />
              </ManagementLayout>
            ) : (
              <SettingsView 
                onBack={() => {
                  setCurrentView(getDefaultViewByRole(userData.role, userData.className, userData.teacherType));
                }}
                onDeleteAccount={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
                    setIsLoggedIn(false);
                    setUserData(DEFAULT_USER_DATA);
                    setCurrentView('home');
                    alert('Đã xóa tài khoản thành công.');
                  }
                }}
              />
            )
          )}

                    {currentView === 'auth' && (
            <AuthView
              teacherRegCode={teacherRegCode}
              schools={schools}
              onBack={() => setCurrentView('home')}
              onTeacherPending={(teacher) => setPendingTeachers((prev) => [...prev, teacher])}
              onLoginSuccess={(account) => {
                setIsLoggedIn(true);
                setUserData(buildUserDataFromAccount(account));
                setCurrentView(getDefaultViewByRole(account.role, account.profile.className, account.profile.teacherType));
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-8 sticky bottom-0 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div 
              onClick={() => setCurrentView('contact')}
              className="hidden lg:flex items-center gap-6 group cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary group-hover:text-brand-orange transition-colors">LIÊN HỆ VỚI CHÚNG TÔI</span>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                    <Phone size={12} className="text-brand-primary" /> 0975614712
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                    <MailIcon size={12} className="text-brand-primary" /> hello.traman@gmail.com
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-orange/20 transition-transform group-hover:translate-x-1">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Sẵn sàng hỗ trợ</p>
              <p className="text-sm font-bold text-brand-primary">Chat Box bé Trạm</p>
            </div>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-14 h-14 bg-brand-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-brand-primary/30 hover:scale-110 transition-transform relative"
            >
              <MessageCircle size={28} />
              {!isChatOpen && <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-orange rounded-full border-4 border-white animate-pulse"></span>}
            </button>
          </div>
        </div>
      </footer>

      {/* Chat Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed bottom-24 right-8 w-96 bg-white rounded-[2.5rem] shadow-2xl z-[60] border border-gray-100 overflow-hidden"
          >
            <div className="bg-brand-primary p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest">Hỗ trợ Trạm an</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[10px] opacity-80 font-bold">Đang online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="h-80 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {chatMessages.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'p-4 rounded-3xl shadow-sm text-sm max-w-[85%] leading-relaxed',
                    item.role === 'assistant'
                      ? 'bg-white text-gray-600 rounded-tl-none'
                      : 'bg-brand-primary text-white rounded-tr-none self-end shadow-md',
                  )}
                >
                  <p>{item.text}</p>
                  {item.role === 'assistant' && item.sources && item.sources.length > 0 && (
                    <p className="mt-2 text-[10px] text-gray-400">
                      Nguồn: {item.sources.join(', ')}
                    </p>
                  )}
                </div>
              ))}
              {isChatSending && (
                <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm text-sm text-gray-500 max-w-[85%] leading-relaxed">
                  Bé Trạm đang suy nghĩ...
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {chatError && (
                <p className="text-[10px] font-bold text-red-500">{chatError}</p>
              )}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendChatMessage();
                    }
                  }}
                  placeholder="Nhập lời nhắn..."
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
                <button
                  onClick={() => {
                    void handleSendChatMessage();
                  }}
                  disabled={isChatSending || !chatInput.trim()}
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center transition-transform shadow-lg',
                    isChatSending || !chatInput.trim()
                      ? 'bg-gray-200 text-gray-400 shadow-gray-200/40 cursor-not-allowed'
                      : 'bg-brand-primary text-white hover:scale-105 shadow-brand-primary/20',
                  )}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-brand-primary/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mx-auto mb-6">
                <Clock size={40} />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-primary mb-4">Đang kiểm duyệt</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Tài khoản giáo viên của bạn đang được hệ thống kiểm duyệt. Chúng tôi sẽ gửi thông báo sớm nhất có thể.
              </p>
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="w-full bg-brand-primary text-white py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-brand-primary/20 transition-all"
              >
                ĐÃ HIỂU
              </button>
            </motion.div>
          </motion.div>
        )}

        {isChangePasswordModalOpen && (
          <ChangePasswordModal 
            isOpen={isChangePasswordModalOpen}
            onClose={() => setIsChangePasswordModalOpen(false)}
            onConfirm={onConfirmPasswordChange}
            userName={passwordChangeUser?.name || ''}
          />
        )}

        <AdminPasswordPromptModal
          isOpen={adminPasswordPrompt.isOpen}
          onClose={() => setAdminPasswordPrompt({ isOpen: false, callback: null })}
          onConfirm={() => {
            if (adminPasswordPrompt.callback) {
              adminPasswordPrompt.callback();
            }
            setAdminPasswordPrompt({ isOpen: false, callback: null });
          }}
        />

        {/* Teacher Detail Modal */}
        {isTeacherDetailOpen && selectedTeacher && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsTeacherDetailOpen(false);
                setIsEditingTeacher(false);
                setEditingTeacherOriginalName('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="bg-brand-orange p-10 text-white text-center relative shrink-0">
                <button 
                  onClick={() => {
                    setIsTeacherDetailOpen(false);
                    setIsEditingTeacher(false);
                    setEditingTeacherOriginalName('');
                  }}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-xl mx-auto mb-4 bg-white/20 flex items-center justify-center text-4xl font-black">
                  {selectedTeacher.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-black tracking-tight">{selectedTeacher.name}</h3>
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mt-1">GIÁO VIÊN TRẠM AN</p>
              </div>
              
              <div className="p-10 space-y-6 overflow-y-auto no-scrollbar">
                {isEditingTeacher ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Họ và tên</label>
                      <input 
                        type="text" 
                        value={selectedTeacher.fullName || selectedTeacher.name}
                        onChange={(e) => setSelectedTeacher({...selectedTeacher, fullName: e.target.value, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Năm sinh</label>
                        <input 
                          type="text" 
                          value={selectedTeacher.birthYear || ''}
                          onChange={(e) => setSelectedTeacher({...selectedTeacher, birthYear: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Số điện thoại</label>
                        <input 
                          type="text" 
                          value={selectedTeacher.phoneNumber || ''}
                          onChange={(e) => setSelectedTeacher({...selectedTeacher, phoneNumber: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email</label>
                      <input 
                        type="email" 
                        value={selectedTeacher.email || ''}
                        onChange={(e) => setSelectedTeacher({...selectedTeacher, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Trường công tác</label>
                      <input 
                        type="text" 
                        value={selectedTeacher.school || ''}
                        onChange={(e) => setSelectedTeacher({...selectedTeacher, school: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Họ và tên</p>
                      <p className="font-bold text-gray-700 text-lg">{selectedTeacher.fullName || selectedTeacher.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên đăng nhập</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.username}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Năm sinh</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.birthYear || '-'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.email || '-'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.phoneNumber || '-'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trường công tác</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.school}</p>
                    </div>
                  </div>
                )}
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lớp phụ trách</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {classes.filter(c => c.teacherName === selectedTeacher.name).map(c => (
                        <span key={c.id} className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-full">
                          Lớp {c.name}
                        </span>
                      ))}
                      {classes.filter(c => c.teacherName === selectedTeacher.name).length === 0 && (
                        <p className="text-sm text-gray-400 italic">Chưa phụ trách lớp nào</p>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thống kê trắc nghiệm</p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lượt test</p>
                        <p className="text-xl font-black text-brand-primary">
                          {testResults.filter(r => r.userId === selectedTeacher.id).length}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Điểm TB</p>
                        <p className="text-xl font-black text-brand-orange">
                          {testResults.filter(r => r.userId === selectedTeacher.id).length > 0
                            ? Math.round(testResults.filter(r => r.userId === selectedTeacher.id).reduce((acc, r) => acc + r.score, 0) / testResults.filter(r => r.userId === selectedTeacher.id).length)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                <div className="pt-4 flex gap-4">
                  {isEditingTeacher ? (
                    <button 
                      onClick={handleSaveTeacherProfile}
                      className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                      LƯU THAY ĐỔI
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingTeacherOriginalName(selectedTeacher.fullName || selectedTeacher.name);
                        setIsEditingTeacher(true);
                      }}
                      className="flex-1 bg-brand-orange text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand-orange/20 hover:scale-[1.02] transition-all"
                    >
                      CHỈNH SỬA
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsTeacherDetailOpen(false);
                      setIsEditingTeacher(false);
                      setEditingTeacherOriginalName('');
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                  >
                    ĐÓNG
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .markdown-body h2 {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 2.25rem;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          color: #18A5A7;
          line-height: 1.2;
        }
        .markdown-body p {
          font-size: 1.125rem;
          line-height: 1.9;
          margin-bottom: 1.75rem;
          color: #4B5563;
        }
        .markdown-body ul, .markdown-body ol {
          margin-bottom: 1.75rem;
          padding-left: 1.75rem;
        }
        .markdown-body li {
          font-size: 1.125rem;
          line-height: 1.9;
          margin-bottom: 0.75rem;
          color: #4B5563;
        }
        .markdown-body strong {
          color: #111827;
          font-weight: 700;
        }
      `}} />
    </div>
  );
}











