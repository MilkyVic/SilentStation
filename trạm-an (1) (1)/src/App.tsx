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
  ArrowLeft,
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
  ChevronDown,
  Activity,
  Map,
  Cloud,
  Package,
  Check,
  CloudRain,
  Mic,
  PhoneCall,
  HelpCircle,
  Users,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
  { id: 't4', name: 'Phạm Văn Dũng', fullName: 'Phạm Văn Dũng', username: 'dung_pham', email: 'dung.pham@school.edu.vn', phoneNumber: '0911223344', birthYear: '1988', school: 'THPT Chuyên Hà Nội - Amsterdam', schoolId: 's1', role: 'Giáo viên' },
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
  Map: <Map size={18} />,
  Cloud: <Cloud size={18} />,
  Package: <Package size={18} />,
  Users: <Users size={18} />,
  Phone: <Phone size={18} />,
  MessageSquare: <MessageSquare size={18} />,
  CloudRain: <CloudRain size={18} />,
  Mic: <Mic size={18} />,
  PhoneCall: <PhoneCall size={18} />,
  HelpCircle: <HelpCircle size={18} />,
  Users: <Users size={18} />,
  Lock: <Lock size={18} />,
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

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerateCode = () => {
    if (setTeacherRegCode) {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setTeacherRegCode({ code: newCode, expiry: Date.now() + 60000, className: userData.className });
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

            {formData.role !== 'Admin' && formData.role !== 'Quản trị viên cấp cao' && (
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
                {!(formData.role === 'Giáo viên' && formData.teacherType === 'Bộ môn') && (
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
                )}
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

            {userData.role === 'Giáo viên' && (
              <div className="pt-8 border-t border-gray-100">
                <h4 className="text-lg font-bold text-brand-primary mb-4">Mã đăng ký lớp học</h4>
                <p className="text-sm text-gray-500 mb-6">Tạo mã để học sinh có thể đăng ký vào lớp của bạn. Mã sẽ hết hạn sau 1 phút.</p>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleGenerateCode}
                    className="px-6 py-4 bg-brand-secondary/20 text-brand-secondary rounded-2xl font-bold text-sm hover:bg-brand-secondary/30 transition-colors"
                  >
                    Tạo mã mới
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
                onClick={() => {
                  if (initialSelectedClass && selectedClass.id === initialSelectedClass.id) {
                    onBack();
                  } else {
                    setSelectedClass(null);
                  }
                }}
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
                className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
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
  onViewTeacher,
  onViewClass,
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
  onViewTeacher: (teacher: any) => void,
  onViewClass: (cls: any) => void,
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
  const [selectedSubjectClassId, setSelectedSubjectClassId] = useState<string | null>(null);

  const activeClass = useMemo(() => {
    if (userData.className) {
      return classes.find(c => c.name === userData.className) || null;
    }
    return classes.find(c => c.id === selectedSubjectClassId) || null;
  }, [classes, userData.className, selectedSubjectClassId]);

  const classStudents = useMemo(() => {
    return students.filter(s => s.className === activeClass?.name);
  }, [students, activeClass]);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  if (!userData.className && !activeClass) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-5xl font-serif italic text-brand-primary mb-4">Các lớp giảng dạy</h2>
          <p className="text-gray-500 text-lg font-medium">Chào mừng, Giáo viên bộ môn {userData.name}. Vui lòng chọn một lớp học để xem chi tiết.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedSubjectClassId(cls.id)}
              className="text-left bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-primary/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black text-gray-800 mb-1">Lớp {cls.name}</h3>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 inline-block px-2 py-1 rounded-md">
                    Sĩ số: {students.filter(s => s.className === cls.name).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                  <ArrowRight size={20} />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-brand-primary" />
                    <span className="text-xs font-bold text-gray-600">Mức stress TB</span>
                  </div>
                  <span className={cn(
                    "text-sm font-black",
                    cls.avgStress > 60 ? 'text-brand-orange' : 'text-brand-primary'
                  )}>
                    {cls.avgStress}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            {!userData.className && (
              <button 
                onClick={() => setSelectedSubjectClassId(null)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-sm hover:scale-110 transition-transform"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-5xl font-serif italic text-brand-primary">Lớp học {activeClass?.name}</h2>
          </div>
          <p className="text-gray-500 text-lg font-medium">Chào mừng, Giáo viên {userData.name}. Đây là thông tin chi tiết của lớp học.</p>
        </div>
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
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
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

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const query = searchQuery.toLowerCase();
    return teachers.filter(t => 
      t.name.toLowerCase().includes(query) || 
      (t.school && t.school.toLowerCase().includes(query)) ||
      (t.className && t.className.toLowerCase().includes(query))
    );
  }, [searchQuery, teachers]);

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
                  <p className="text-lg font-bold text-gray-800 truncate flex flex-wrap items-center gap-2 mb-1 group-hover:text-brand-primary transition-colors">
                    {teacher.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {teacher.className ? (
                      <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] uppercase tracking-widest rounded-full font-black">Chủ nhiệm {teacher.className}</span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] uppercase tracking-widest rounded-full font-black whitespace-nowrap">Bộ môn</span>
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
              Không tìm thấy giáo viên nào kết quả hợp lệ với "{searchQuery}"
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

        <div className="grid grid-cols-1 gap-12">
          <div className="space-y-12">
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

// --- Interactive Components for Handbook ---
const FlipCard = ({ title, imgFront, backContent }: { title: string, imgFront?: string, backContent: React.ReactNode }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="relative w-full h-[400px] md:h-[500px] [perspective:1000px] my-8 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] duration-500 rounded-3xl"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] w-full h-full bg-orange-50/50 border border-brand-orange/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl transition-shadow overflow-hidden">
          {imgFront ? (
            <>
              <img src={imgFront} alt={title} className="w-full h-full object-contain mb-8 mix-blend-multiply" />
              <p className="absolute bottom-6 text-brand-primary/60 font-medium inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm">
                 Chạm để lật thẻ <ArrowRight size={14} className="animate-pulse" />
              </p>
            </>
          ) : (
            <>
               <Sparkles className="text-brand-orange w-12 h-12 mb-4 opacity-50" />
               <h3 className="text-3xl font-serif font-bold text-brand-primary mb-3">{title}</h3>
               <p className="text-brand-primary/60 font-medium inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm">
                 Chạm để lật thẻ <ArrowRight size={14} className="animate-pulse" />
               </p>
            </>
          )}
        </div>
        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] w-full h-full bg-white border border-brand-primary/20 rounded-3xl p-8 shadow-md" style={{ transform: 'rotateY(180deg)' }}>
          <div className="h-full overflow-y-auto flex flex-col justify-center gap-6 prose prose-teal text-left">
            {backContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AccordionItem = ({ question, answer, isOpen, onClick }: { question: React.ReactNode, answer: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border border-brand-primary/20 rounded-2xl mb-4 overflow-hidden bg-white">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left bg-teal-50/50 hover:bg-teal-50 transition-colors"
      >
        <span className="font-bold text-brand-primary flex items-center gap-3">
          {question}
        </span>
        <ChevronRight className={cn("text-brand-orange transition-transform duration-300 transform", isOpen ? "rotate-90" : "")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-2 text-gray-600 leading-relaxed border-t border-brand-primary/10">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LenTiengInteractive = () => {
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(0);

  return (
    <div className="mt-12">
      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <BookOpen className="text-brand-orange" />
          Sẻ chia an toàn cùng "cạ cứng"
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Ở lứa tuổi cấp 3, khao khát khẳng định bản thân khiến những tình bạn trở nên vô cùng sâu sắc. Bạn có thể sử dụng sức mạnh của tình bạn đúng cách.
        </p>
        <FlipCard
          title="Bộ luật tình bạn"
          imgFront="/assets/Bộ luật tình bạn.png"
          backContent={
            <>
              <p className="flex items-start gap-3">
                <span className="text-2xl mt-1">🤝</span>
                <span>
                  <strong>Hiểu về "Bộ luật":</strong> Tình bạn cần sự chân thành, đồng cảm và cam kết giữ bí mật. Hãy chia sẻ với người bạn đáp ứng được "bộ luật" này.
                </span>
              </p>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 mt-4">
                <span className="text-2xl mt-1">⚠️</span>
                <span className="text-red-700">
                  <strong>Nguyên tắc An toàn:</strong> Nếu bạn thân có suy nghĩ tiêu cực nghiêm trọng (tự làm hại bản thân), <strong>sự an toàn tính mạng lớn hơn việc giữ bí mật</strong>. Hãy dũng cảm đi tìm người lớn!
                </span>
              </div>
            </>
          }
        />
      </section>

      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Home className="text-brand-orange" />
          Góc tâm tình cùng gia đình
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          Thực ra, những mâu thuẫn hay xung đột tâm lý giữa cha mẹ và con cái ở tuổi này là điều khó tránh khỏi do khoảng cách thế hệ khiến suy nghĩ và cảm nhận rất khác nhau.
        </p>
        <FlipCard
          title="Mở lời không cãi vã"
          imgFront="/assets/Góc tâm tình cùng gia đình.png"
          backContent={
            <div className="space-y-4">
              <p className="flex items-start gap-3">
                <span className="text-2xl mt-1">⏱️</span>
                <span>
                  <strong>Chọn "thời điểm vàng":</strong> Lúc gia đình vui vẻ, thư giãn. <span className="text-brand-orange italic font-medium">Tránh: Lúc ba mẹ bận rộn, mệt mỏi.</span>
                </span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl mt-1">🗣️</span>
                <span>
                  <strong>Dùng "Thông điệp Tôi" (I-message):</strong> Nói <em>"Con đang cảm thấy áp lực..."</em> thay vì buộc tội <em>"Bố mẹ lúc nào cũng ép con!"</em>.
                </span>
              </p>
            </div>
          }
        />
      </section>

      <section className="mb-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <School className="text-brand-orange" />
          Phòng Tham vấn học đường - "Trạm SOS" an toàn và không phán xét
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Nếu áp lực từ điểm số, bạo lực mạng hay những rắc rối tình cảm quá phức tạp mà bạn không thể nói cùng ai, hãy mạnh dạn gõ cửa Phòng Tham vấn học đường.
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 flex-shrink-0 relative overflow-hidden rounded-3xl md:h-[400px]">
             <img src="/assets/Gemini_Generated_Image_8krlki8krlki8krl.png" alt="Trạm SOS Tâm Lý" className="w-full h-full object-cover mix-blend-multiply" />
          </div>
          
          <div className="w-full md:w-2/3">
            <AccordionItem 
              isOpen={openAccordionId === 0} 
              onClick={() => setOpenAccordionId(openAccordionId === 0 ? null : 0)}
              question={<><span className="text-xl">🏥</span> Nơi này làm gì cho mình?</>}
              answer={<p>Đây là "Trạm SOS" giúp bạn giải quyết rắc rối tâm lý, khai thác điểm mạnh tiềm ẩn để tự tin quay lại học tập và phát triển kỹ năng sống.</p>}
            />
            <AccordionItem 
              isOpen={openAccordionId === 1} 
              onClick={() => setOpenAccordionId(openAccordionId === 1 ? null : 1)}
              question={<><span className="text-xl">🤝</span> Thầy cô có "giải quyết hộ" rắc rối cho mình không?</>}
              answer={<p><strong>KHÔNG.</strong> Chuyên viên làm việc dựa trên nguyên tắc <strong>Tăng quyền lực (Empowerment)</strong>. Họ không ban phát lời khuyên mà sẽ cung cấp kinh nghiệm, hỗ trợ công cụ để chính <strong>BẠN</strong> tự kiểm soát và tự giải quyết vấn đề của mình.</p>}
            />
            <AccordionItem 
              isOpen={openAccordionId === 2} 
              onClick={() => setOpenAccordionId(openAccordionId === 2 ? null : 2)}
              question={<><span className="text-xl">🔒</span> Có sợ bị lộ bí mật cho giáo viên chủ nhiệm không?</>}
              answer={<p><strong>HOÀN TOÀN KHÔNG!</strong> Chuyên viên cam kết bảo mật thông tin nghiêm ngặt. Bước vào đây, bạn được tôn trọng vô điều kiện, được yêu thương và tuyệt đối không bao giờ bị phán xét.</p>}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const BatteryCheckSection = ({ isLoggedIn, onNavigateToTestList }: { isLoggedIn: boolean, onNavigateToTestList?: () => void }) => {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  const toggleItem = (index: number) => {
    const newChecked = checkedItems.includes(index)
      ? checkedItems.filter(i => i !== index)
      : [...checkedItems, index];
    setCheckedItems(newChecked);
    
    if (isLoggedIn && newChecked.length >= 2) setShowPopup(true);
    else setShowPopup(false);
  };

  const batteryPercent = Math.max(10, 100 - (checkedItems.length * 22.5));
  const batteryColor = batteryPercent > 75 ? 'bg-green-500' : batteryPercent > 50 ? 'bg-yellow-500' : batteryPercent > 25 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="font-sans text-gray-800 clear-both mt-12">
      {/* INTERACTIVE MINI-TEST */}
      <section className="bg-gray-50 rounded-[3rem] p-8 md:p-16 mb-20 border border-gray-100 shadow-inner">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-800 mb-4 uppercase tracking-widest">🔋 Pin Tinh Thần Của Bạn Đang Ở Mức Nào?</h2>
          <p className="text-center text-gray-500 mb-12 italic font-medium">Đọc những dấu hiệu trên, bạn có thấy "bóng dáng" của mình trong đó không? Đừng đoán mò nữa, hãy để Trạm An giúp bạn "bắt mạch" cảm xúc nhé!</p>
          
          {/* Battery Bar */}
          <div className="relative w-full max-w-md mx-auto h-20 bg-white rounded-3xl mb-16 p-2 shadow-inner border-2 border-gray-100">
            <div className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden relative">
              <motion.div 
                initial={false}
                animate={{ width: `${batteryPercent}%` }}
                className={cn("h-full transition-colors duration-500 shadow-lg", batteryColor)}
              />
              <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-gray-800 tracking-widest whitespace-nowrap">
                MỨC PIN: {batteryPercent}%
              </div>
            </div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-8 bg-gray-200 rounded-r-lg" />
          </div>

          <div className="space-y-4">
            {[
              "Ngủ rất nhiều nhưng mỗi sáng thức dậy vẫn thấy nặng nề.",
              "Dễ cáu gắt và nổi nóng vì những chuyện rất nhỏ xíu.",
              "Không còn thấy hứng thú với sở thích cũ.",
              "Muốn thu mình lại, ngại giao tiếp."
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleItem(idx)}
                className={cn(
                  "p-8 rounded-[2rem] cursor-pointer transition-all flex items-center justify-between border-2",
                  checkedItems.includes(idx) 
                    ? "bg-brand-orange/5 border-brand-orange/30 shadow-md translate-x-2" 
                    : "bg-white border-transparent hover:border-gray-200 shadow-sm"
                )}
              >
                <p className={cn("font-bold text-lg", checkedItems.includes(idx) ? "text-brand-orange" : "text-gray-700")}>
                  {item}
                </p>
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-4",
                  checkedItems.includes(idx) ? "bg-brand-orange border-brand-orange text-white" : "border-gray-200 bg-gray-50"
                )}>
                  {checkedItems.includes(idx) && <Check size={18} strokeWidth={4} />}
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {showPopup && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-12 bg-white p-8 rounded-3xl border border-red-100 shadow-xl flex flex-col justify-center items-center text-center gap-6"
              >
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center shrink-0 mb-4">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Trạm An gửi tín hiệu!</h4>
                  <p className="text-gray-600 leading-relaxed font-medium mb-8">Pin của bạn đang khá thấp! Bạn có muốn ghé Trạm an để kiểm tra không?</p>
                   <button 
                      onClick={() => {
                        setShowPopup(false);
                        if (onNavigateToTestList) onNavigateToTestList();
                      }}
                      className="bg-[#FF7F50] hover:bg-[#FF6b36] shadow-[0_0_20px_rgba(255,127,80,0.4)] text-white px-8 py-4 rounded-xl font-black uppercase text-sm inline-block transition-colors"
                    >
                      BẠN ĐANG Ở MỨC ĐỘ NÀO? LÀM BÀI MINI-TEST TẠI ĐÂY!
                    </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};


const TooltipWord = ({ word, tooltipText }: { word: React.ReactNode; tooltipText: string }) => {
  const [show, setShow] = useState(false);
  return (
    <span 
      className="relative inline-block group" 
      onClick={(e) => {
        e.preventDefault();
        setShow(!show);
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="font-black border-b-[3px] border-dotted border-brand-orange text-brand-primary cursor-pointer hover:bg-brand-orange/10 transition-colors px-1 rounded">{word}</span>
      <AnimatePresence>
        {show && (
          <motion.span 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 bg-white text-gray-800 text-sm rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-brand-orange/20 font-medium font-sans leading-relaxed pointer-events-none block"
          >
            {tooltipText}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-white drop-shadow-sm"></span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(HANDBOOK_DATA[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>(HANDBOOK_DATA[0].category);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHandbookHovered, setIsHandbookHovered] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isTeacherDetailOpen, setIsTeacherDetailOpen] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [adminPasswordPrompt, setAdminPasswordPrompt] = useState<{isOpen: boolean, callback: (() => void) | null}>({ isOpen: false, callback: null });
  const [filterSchoolId, setFilterSchoolId] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (currentView !== 'handbook') return;

    let isThrottled = false;
    const handleScrollSpy = () => {
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => { isThrottled = false; }, 50);

      const sectionElements = document.querySelectorAll('div[id^="section-"]');
      const activeZone = 250; 

      for (let i = 0; i < sectionElements.length; i++) {
        const el = sectionElements[i];
        const rect = el.getBoundingClientRect();
        
        if (rect.bottom > activeZone) {
          const id = el.id.replace('section-', '');
          setActiveSectionId(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    // setTimeout to ensure DOM is fully rendered before initial calculation
    setTimeout(handleScrollSpy, 100);

    return () => {
      window.removeEventListener('scroll', handleScrollSpy);
    };
  }, [currentView, selectedCategory, searchQuery]);


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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [verificationStep, setVerificationStep] = useState<'none' | 'success'>('none');
  const [teacherRegCode, setTeacherRegCode] = useState<{ code: string, expiry: number, className?: string } | null>(null);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    birthYear: '',
    gender: '',
    school: '',
    className: '',
    subject: '',
    teacherType: 'Chủ nhiệm',
    role: 'Học sinh',
    regCode: ''
  });
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
    schoolId: '',
    className: '',
    role: 'Học sinh',
    teacherType: undefined as string | undefined,
    subject: undefined as string | undefined
  };

  const [userData, setUserData] = useState(DEFAULT_USER_DATA);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(DEFAULT_USER_DATA);
    setCurrentView('home');
    setFilterSchoolId(null);
  };

  const generateRegCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    setTeacherRegCode({ code, expiry });
  };

  const markdownComponents = useMemo(() => ({
    img: ({ node, src, alt, ...props }: any) => {
      let layoutClass = "mx-auto w-full block clear-both";
      if (src) {
        if (src.includes('2.png') || src.includes('5.png') || src.includes('7.png') || src.includes('10.png')) {
          layoutClass = "md:float-left md:mr-8 md:mb-6 md:max-w-md";
        } else if (src.includes('.png') && !src.includes('Gemini_Generated_Image')) {
          if (!src.includes('1.png') && !src.includes('8.png') && !src.includes('12.png')) {
            layoutClass = "md:float-right md:ml-8 md:mb-6 md:max-w-md";
          }
        }
      }
      return <img src={src} alt={alt} className={cn("rounded-2xl shadow-md my-12 object-cover border border-gray-100", layoutClass)} {...props} />;
    },
    a: ({ node, ...props }: any) => {
      if (props.href?.startsWith('#tooltip:')) {
        const tooltipText = decodeURIComponent(props.href.replace('#tooltip:', '')).replace(/_/g, ' ');
        return <TooltipWord word={props.children} tooltipText={tooltipText} />;
      }
      if (props.href?.endsWith('.mp4')) {
        return (
          <span className="block my-8 aspect-video w-full md:w-3/4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-black mx-auto clear-both">
            <video src={props.href} controls className="w-full h-full" />
          </span>
        );
      }
      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-orange font-medium underline underline-offset-2" />;
    },
    h1: () => null,
    h2: ({node, ...props}: any) => <h2 className="text-3xl font-serif text-gray-800 border-b pb-2 mt-12 mb-6" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-l-4 border-brand-primary pl-4" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-brand-orange pl-6 my-6 bg-brand-orange/5 py-4 pr-4 rounded-r-2xl italic text-gray-700" {...props} />,
    details: ({node, ...props}: any) => <details className="border border-brand-primary/10 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white group" {...props} />,
    summary: ({node, ...props}: any) => <summary className="w-full px-6 py-5 flex items-center justify-between font-bold text-brand-primary cursor-pointer list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-brand-primary/10 group-open:bg-brand-primary/5 transition-colors" {...props} />
  }), []);

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
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  const userSchoolId = useMemo(() => {
    if (userData.schoolId) {
      return userData.schoolId;
    }
    if (userData.school) {
      return schools.find(s => s.name === userData.school)?.id || null;
    }
    return null;
  }, [userData.school, userData.schoolId, schools]);

  const filteredPendingTeachers = useMemo(() => {
    if ((userData.role === 'Admin' || userData.role === 'Giáo viên') && userSchoolId) {
      return pendingTeachers.filter(t => t.schoolId === userSchoolId || t.school === userData.school);
    }
    return pendingTeachers;
  }, [pendingTeachers, userData, userSchoolId]);

  const filteredTeachers = useMemo(() => {
    if ((userData.role === 'Admin' || userData.role === 'Giáo viên') && userSchoolId) {
      return teachers.filter(t => t.schoolId === userSchoolId || t.school === userData.school);
    }
    return teachers;
  }, [teachers, userData, userSchoolId]);

  const filteredClasses = useMemo(() => {
    if ((userData.role === 'Admin' || userData.role === 'Giáo viên') && userSchoolId) {
      return classes.filter(c => (c as any).schoolId === userSchoolId);
    }
    return classes;
  }, [classes, userData, userSchoolId]);

  const filteredStudents = useMemo(() => {
    if ((userData.role === 'Admin' || userData.role === 'Giáo viên') && userSchoolId) {
      return students.filter(s => s.schoolId === userSchoolId);
    }
    return students;
  }, [students, userData, userSchoolId]);

  const filteredTestResults = useMemo(() => {
    if ((userData.role === 'Admin' || userData.role === 'Giáo viên') && userSchoolId) {
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
                    setAuthMode('login');
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
          className={cn(
            "bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm transition-transform duration-300",
            !isHeaderVisible && "-translate-y-full"
          )}
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
                    onClick={() => {
                      setCurrentView('handbook');
                      setIsHandbookHovered(false);
                      // default to first
                      if (!selectedCategory || !categories.includes(selectedCategory)) {
                        setSelectedCategory(categories[0]);
                        const firstSection = HANDBOOK_DATA.find(s => s.category === categories[0]);
                        if (firstSection) setActiveSectionId(firstSection.id);
                      }
                    }}
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

                {isLoggedIn && userData.role === 'Giáo viên' && userData.teacherType === 'Chủ nhiệm' && (
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
                    {categories.map((category) => {
                      const isLocked = category === 'Cẩm nang xây dựng môi trường học đường thân thiện với sức khỏe tâm thần của học sinh THPT';
                      return (
                      <div key={category} className="space-y-6">
                        <button 
                          onClick={() => {
                            if (isLocked) return;
                            setSelectedCategory(category);
                            const firstSection = HANDBOOK_DATA.find(s => s.category === category);
                            if (firstSection) {
                              setActiveSectionId(firstSection.id);
                            }
                            setCurrentView('handbook');
                            setIsHandbookHovered(false);
                            if (firstSection) {
                              setTimeout(() => {
                                document.getElementById(`section-${firstSection.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }
                          }}
                          className={cn(
                            "text-[11px] font-black w-full text-left uppercase tracking-[0.2em] border-b pb-4 flex items-center justify-between",
                            isLocked 
                              ? "cursor-not-allowed text-gray-400 border-gray-100" 
                              : "cursor-pointer hover:text-brand-orange transition-colors text-brand-primary border-brand-primary/10"
                          )}
                        >
                          <span className="flex-1">{category}</span>
                          {isLocked && <Lock size={14} />}
                        </button>
                        <div className="flex flex-col gap-1">
                          {isLocked ? (
                            <div className="text-[13px] font-medium text-gray-400 py-2">
                              Phần này đang được cập nhật. Bạn vui lòng quay lại sau nhé!
                            </div>
                          ) : (
                            HANDBOOK_DATA.filter(s => s.category === category).map((section) => (
                              <button
                                key={section.id}
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setActiveSectionId(section.id);
                                  setCurrentView('handbook');
                                  setIsHandbookHovered(false);
                                  setTimeout(() => {
                                    document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 100);
                                }}
                                className="group flex items-center justify-between gap-4 text-left py-2 hover:translate-x-1 transition-all"
                              >
                                <span className="text-[13px] font-bold text-gray-500 group-hover:text-brand-primary transition-colors">
                                  {section.title}
                                </span>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-all" />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )})}
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
                        setAuthMode('login');
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
                      <div className="w-full aspect-square bg-brand-primary/5 rounded-[3rem] overflow-hidden relative shadow-2xl border-8 border-white flex items-center justify-center">
                        <img 
                          src="/assets/hero.png" 
                          alt="Hero" 
                          className="w-full h-full object-contain p-8"
                        />
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

              {/* Psychology Content Grid */}
              <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-12 rounded-[2.5rem] text-white shadow-2xl shadow-brand-primary/20">
                  <h2 className="text-4xl font-serif italic mb-6">Tin tức Tâm lý học</h2>
                  <p className="text-white/80 leading-relaxed mb-10 text-lg">
                    Cập nhật những nghiên cứu mới nhất và các khái niệm tâm lý giúp bạn thấu hiểu bản thân và thế giới xung quanh.
                  </p>
                  <a href="https://memart.vn/tin-tuc/suc-khoe-4/tim-hieu-ve-tam-ly-hoc-duong-la-gi-va-vai-tro-cua-no-vi-cb.html" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-brand-primary px-10 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg">
                    XEM KIẾN THỨC
                  </a>
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { link: "https://congdankhuyenhoc.vn/bao-luc-hoc-duong-khang-the-tam-ly-co-hoa-giai-duoc-tu-goc-re-179260426092104485.htm", title: "Bạo lực học đường: Kháng thể tâm lý có hóa giải được từ gốc rễ?", desc: "Khám phá cách xây dựng kháng thể tâm lý để ứng phó với bạo lực học đường.", image: "https://congdankhuyenhoc.qltns.mediacdn.vn/zoom/600_315/449484899827462144/2026/4/26/bao-luc-hoc-duong-chuyen-de-1777166795399394408654-242-0-1238-1902-crop-17771668241001509486727.jpg" },
                    { link: "https://thanhnien.vn/doi-mat-khung-hoang-hoc-duong-giao-vien-co-biet-cach-ung-pho-185260419104421475.htm", title: "Đối mặt khủng hoảng học đường, giáo viên có biết cách ứng phó?", desc: "Những kỹ năng và biện pháp cần thiết dành cho giáo viên.", image: "https://images2.thanhnien.vn/zoom/1200_630/528068263637045248/2026/4/19/avatar1776570267065-17765702675191104234315.jpeg" },
                    { link: "https://giaoducthoidai.vn/tang-cuong-la-chan-tam-ly-hoc-duong-sau-thien-tai-post775333.html", title: "Tăng cường 'lá chắn' tâm lý học đường sau thiên tai", desc: "Cách bảo vệ và hỗ trợ học sinh vượt qua khủng hoảng.", image: "https://cdn.giaoducthoidai.vn/images/e68bd0ae7e0a4d2e84e451c6db68f2d42cd6f45d7fdc6180c18e5fab26afb0cbf8c05f521d99b507670d688b4cdbc5c38c1b93beb816d35b6be7aa7c4b8b8e1e/tamlyhocduongjpg2.jpg.webp" },
                    { link: "https://thanhnien.vn/tu-van-tam-ly-hoc-duong-nang-hinh-thuc-bo-gd-dt-ra-quy-dinh-moi-185250922172348001.htm", title: "Tư vấn tâm lý học đường 'nặng hình thức': Bộ GD-ĐT ra quy định mới", desc: "Cập nhật những quy định mới nhất từ Bộ GD-ĐT về tư vấn tâm lý.", image: "https://images2.thanhnien.vn/zoom/1200_630/528068263637045248/2025/9/22/edit-chon-mon-lop-10-3-17549089375832022375288-78-0-1156-1725-crop-1758536289688678954583.jpeg" }
                  ].map((item, i) => (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} className="cursor-pointer bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group block overflow-hidden flex flex-col">
                      <div className="h-48 w-full overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-8 flex-1 flex flex-col">
                        <h4 className="font-bold text-lg text-brand-primary mb-3 group-hover:translate-x-1 transition-transform line-clamp-2">{item.title}</h4>
                        <div className="mt-auto">
                          <div className="h-1.5 w-12 bg-brand-orange rounded-full mb-4"></div>
                          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{item.desc}</p>
                        </div>
                      </div>
                    </a>
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
              className="flex min-h-screen relative items-start"
            >
              {/* Sidebar */}
              <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className={cn(
                  "border-r border-gray-100 bg-white flex flex-col z-20 sticky top-[88px] h-[calc(100vh-88px)] overflow-hidden shrink-0 transition-all duration-300",
                  !isHeaderVisible && "-translate-y-20 h-screen",
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
                  {categories.filter(c => c === selectedCategory).map(category => {
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
                            onClick={() => {
                              setActiveSectionId(section.id);
                              setTimeout(() => {
                                document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }}
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
                <div className={cn("sticky top-[88px] z-30 bg-white/90 backdrop-blur-md h-14 border-b border-gray-100 flex items-center px-8 transition-transform duration-300", !isHeaderVisible && "-translate-y-[88px]")}>
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
                <div className="w-full p-12 md:p-20 scroll-smooth">
                  {filteredSections
                    .filter(s => s.category === selectedCategory)
                    .map((section, index) => (
                    <div id={`section-${section.id}`} key={section.id} className={cn("scroll-mt-40", index > 0 ? "mt-32 pt-16 border-t border-gray-100" : "")}>
                        <article className="max-w-3xl mx-auto">
                          <div className="mb-12">
                            <span className="text-brand-primary/60 font-black text-[11px] uppercase tracking-[0.3em] mb-4 block">{section.category}</span>
                            <h2 className="text-5xl font-serif italic text-brand-primary leading-tight">{section.title}</h2>
                            <div className="h-1.5 w-24 bg-brand-orange rounded-full mt-8"></div>
                          </div>
                          <div className="markdown-body prose prose-teal lg:prose-lg max-w-none">
                            <Markdown
                              rehypePlugins={[rehypeRaw]}
                              components={markdownComponents as any}
                            >
                              {section.content}
                            </Markdown>
                          </div>
                        </article>
                        {section.id === 'nhan-dien-may-den' && <BatteryCheckSection isLoggedIn={isLoggedIn} onNavigateToTestList={() => setCurrentView('test-list')} />}
                        {section.id === 'len-tieng-khi-can' && <LenTiengInteractive />}
                    </div>
                  ))}
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
                  setCurrentView('class-list');
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
                onViewTeacher={(teacher) => {
                  requireAdminPassword(() => {
                    setSelectedTeacher(teacher);
                    setIsTeacherDetailOpen(true);
                  });
                }}
                onViewClass={(cls) => {
                  setSelectedClassForView(cls);
                  setCurrentView('class-list');
                }}
                setFilterSchoolId={setFilterSchoolId}
              />
            </motion.div>
          )}

          {currentView === 'teacher-class' && isLoggedIn && userData.role === 'Giáo viên' && userData.teacherType === 'Chủ nhiệm' && (
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
                      { icon: <Mail />, label: "Email", value: "hello@tram-an.vn", color: "bg-brand-secondary/20 text-gray-700" },
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
                  if (userData.role === 'Giáo viên' && userData.teacherType === 'Chủ nhiệm') setCurrentView('teacher-class');
                  else setCurrentView('home');
                }}
                onSave={(updatedData) => {
                  setUserData(updatedData);
                  if (userData.role === 'Giáo viên' && userData.teacherType === 'Chủ nhiệm') setCurrentView('teacher-class');
                  else setCurrentView('home');
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
                      setUserData(null);
                      setCurrentView('home');
                      alert('Đã xóa tài khoản thành công.');
                    }
                  }}
                />
              </ManagementLayout>
            ) : (
              <SettingsView 
                onBack={() => {
                  if (userData.role === 'Giáo viên' && userData.teacherType === 'Chủ nhiệm') setCurrentView('teacher-class');
                  else setCurrentView('home');
                }}
                onDeleteAccount={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
                    setIsLoggedIn(false);
                    setUserData(null);
                    setCurrentView('home');
                    alert('Đã xóa tài khoản thành công.');
                  }
                }}
              />
            )
          )}

          {currentView === 'auth' && (
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
                      } else {
                        setCurrentView('home');
                      }
                    }}
                    className="absolute -left-2 top-0 p-2 text-gray-400 hover:text-brand-primary transition-colors"
                  >
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <h2 className="text-4xl font-serif italic text-brand-primary mb-2">
                    {verificationStep === 'success' ? 'Đăng ký thành công' :
                     authMode === 'login' ? 'Chào mừng trở lại' : 'Tham gia cùng chúng tôi'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {verificationStep === 'success' ? 'Tài khoản của bạn đã sẵn sàng để sử dụng' :
                     authMode === 'login' ? 'Đăng nhập để tiếp tục hành trình của bạn' : 'Tạo tài khoản mới để khám phá thêm nhiều điều'}
                  </p>
                </div>

                {verificationStep === 'success' ? (
                  <div className="text-center space-y-8">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-green-500/10">
                      <Sparkles size={48} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-800">Chúc mừng bạn!</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Bạn đã đăng ký tài khoản thành công. Hãy bắt đầu hành trình khám phá bản thân cùng Trạm An ngay bây giờ.
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
                    <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  setRegError(null);
                  setRegSuccess(null);

                  if (authMode === 'register') {
                    if (authForm.role === 'Học sinh') {
                      if (!authForm.regCode) {
                        setRegError('Vui lòng nhập mã đăng ký từ giáo viên');
                        return;
                      }
                      if (!teacherRegCode || authForm.regCode !== teacherRegCode.code || Date.now() > teacherRegCode.expiry) {
                        setRegError('Mã đăng ký sai hoặc đã hết hạn');
                        return;
                      }
                      // Assign class from teacher's code
                      setAuthForm(prev => ({ ...prev, className: teacherRegCode.className || 'Lớp mặc định' }));
                    }

                    if (authForm.role === 'Giáo viên') {
                      setPendingTeachers([
                        ...pendingTeachers,
                        {
                          id: `p${Date.now()}`,
                          name: authForm.username,
                          school: authForm.school,
                          username: authForm.username,
                          role: 'Giáo viên',
                          className: authForm.teacherType === 'Chủ nhiệm' ? authForm.className : undefined,
                          subject: authForm.subject,
                          teacherType: authForm.teacherType,
                          timestamp: Date.now()
                        }
                      ]);
                      setAuthMode('login');
                      setRegSuccess('Yêu cầu đăng ký đã được gửi. Vui lòng chờ Admin phê duyệt.');
                      return;
                    }

                    // Registration flow for students: go directly to success
                    setVerificationStep('success');
                    return;
                  }

                  setIsLoggedIn(true);
                  
                  let finalRole = authForm.role;
                  let finalClassName = authForm.className;
                  let finalTeacherType = undefined;
                  
                  if (authMode === 'login') {
                    if (authForm.role === 'Giáo viên') {
                      finalClassName = '12A1';
                      finalTeacherType = 'Chủ nhiệm';
                    } else if (authForm.role === 'Giáo viên bộ môn') {
                      finalRole = 'Giáo viên';
                      finalClassName = '';
                      finalTeacherType = 'Bộ môn';
                    }
                  }

                  setUserData({
                    ...userData,
                    name: authForm.fullName || authForm.username,
                    username: authForm.username,
                    email: authForm.email || 'user@tram-an.vn',
                    birthYear: authForm.birthYear || '',
                    gender: authForm.gender,
                    school: authForm.school,
                    className: finalClassName,
                    role: finalRole,
                    teacherType: finalTeacherType
                  });
                  if (finalRole === 'Admin') {
                    setCurrentView('admin');
                  } else if (finalRole === 'Quản trị viên cấp cao') {
                    setCurrentView('superadmin');
                  } else {
                    setCurrentView('home');
                  }
                }}>
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Chức vụ</label>
                    <div className="flex flex-wrap gap-4">
                      {(authMode === 'login' 
                        ? ['Học sinh', 'Giáo viên', 'Giáo viên bộ môn', 'Admin', 'Quản trị viên cấp cao'] 
                        : ['Học sinh', 'Giáo viên']
                      ).map((role) => (
                        <button
                          key={role as string}
                          type="button"
                          onClick={() => setAuthForm({ ...authForm, role: role as string })}
                          className={cn(
                            "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all min-w-[120px]",
                            authForm.role === role 
                              ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {authMode === 'register' && authForm.role === 'Giáo viên' && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-brand-orange font-bold italic ml-2 mt-2"
                      >
                        * Tài khoản giáo viên sẽ cần admin phê duyệt trước khi sử dụng.
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Tên đăng nhập (Tài khoản)</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={authForm.username}
                        onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
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
                        onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
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
                            onChange={(e) => setAuthForm({...authForm, fullName: e.target.value})}
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
                              onChange={(e) => setAuthForm({...authForm, birthYear: e.target.value})}
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
                              onChange={(e) => setAuthForm({...authForm, gender: e.target.value})}
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
                            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700" 
                            placeholder="Nhập địa chỉ email"
                          />
                        </div>
                      </div>

                      {authForm.role !== 'Admin' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Trường</label>
                          <div className="relative">
                            <School className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="text" 
                              required
                              value={authForm.school}
                              onChange={(e) => setAuthForm({...authForm, school: e.target.value})}
                              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700" 
                              placeholder="Nhập tên trường"
                            />
                          </div>
                        </div>
                      )}

                      {authForm.role === 'Giáo viên' && (
                        <>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Giáo viên</label>
                            <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl">
                              {['Chủ nhiệm', 'Bộ môn'].map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setAuthForm({...authForm, teacherType: type})}
                                  className={cn(
                                    "flex-1 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
                                    authForm.teacherType === type 
                                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                      : "text-gray-500 hover:text-brand-primary"
                                  )}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Môn học</label>
                            <div className="relative">
                              <School className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                              <input 
                                type="text" 
                                value={authForm.subject}
                                onChange={(e) => setAuthForm({...authForm, subject: e.target.value})}
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700" 
                                placeholder="Nhập môn học giảng dạy"
                              />
                            </div>
                          </div>

                          {authForm.teacherType === 'Chủ nhiệm' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Lớp</label>
                              <div className="relative">
                                <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                  type="text" 
                                  value={authForm.className}
                                  onChange={(e) => setAuthForm({...authForm, className: e.target.value})}
                                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-bold text-gray-700" 
                                  placeholder="Nhập tên lớp chủ nhiệm"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {authForm.role === 'Học sinh' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-2">Mã đăng ký</label>
                          <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                              type="text" 
                              required
                              value={authForm.regCode}
                              onChange={(e) => setAuthForm({...authForm, regCode: e.target.value})}
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
                      setAuthMode(newMode);
                      if (newMode === 'register' && authForm.role === 'Admin') {
                        setAuthForm({ ...authForm, role: 'Học sinh' });
                      }
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
      )}
        </AnimatePresence>
      </main>

      <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 flex items-center justify-center hover:scale-110 transition-transform relative group drop-shadow-2xl"
          >
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full border-4 border-white shadow-xl"></div>
            <img 
              src="/chatbot_mascot.png" 
              alt="Capybara" 
              className="w-20 h-20 object-contain drop-shadow-lg scale-150 absolute bottom-2 group-hover:-translate-y-2 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute bg-white w-12 h-12 rounded-full items-center justify-center shadow-inner">
              <MessageCircle size={28} className="text-brand-primary" />
            </div>
            <span className="absolute top-0 -right-1 w-5 h-5 bg-brand-orange rounded-full border-[3px] border-white animate-pulse shadow-sm z-10"></span>
          </button>
        )}
      </div>

      {/* Chat Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed bottom-24 right-8 w-96 bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl z-[60] border border-white/50 overflow-hidden"
          >
            <div className="bg-brand-primary/95 p-6 flex flex-col items-center justify-center text-white relative border-b border-brand-primary-dark">
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="w-24 h-24 flex items-center justify-center relative bg-white/10 rounded-full border-4 border-white/20 mb-3 shadow-inner">
                <img 
                  src="/chatbot_mascot.png" 
                  alt="Capybara" 
                  className="w-24 h-24 object-contain scale-[1.3] drop-shadow-md translate-y-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden">
                  <BookOpen size={32} className="text-white" />
                </div>
              </div>
              <h3 className="text-lg font-black uppercase tracking-widest text-center">Bé Trạm <span className="text-[10px] bg-white text-brand-primary px-2 py-0.5 rounded-full font-bold align-middle ml-1">Bot</span></h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                <p className="text-[11px] opacity-90 font-bold uppercase tracking-wider">Luôn lắng nghe bạn</p>
              </div>
            </div>
            
            <div className="h-80 p-6 overflow-y-auto bg-gray-50/50 flex flex-col gap-4">
              <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%] leading-relaxed border border-gray-100 font-medium">
                "Khẹc khẹc... Chào bạn! Mình là Bé Trạm đây. Mình đang nhâm nhi matcha latte, bạn cần mình hỗ trợ gì không nào? 🌱🍵"
              </div>
              <div className="bg-brand-primary text-white p-4 rounded-3xl rounded-tr-none shadow-md text-sm max-w-[85%] self-end leading-relaxed font-medium">
                Tôi muốn tìm các mẹo về lối sống lành mạnh.
              </div>
              <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm text-sm text-gray-700 max-w-[85%] leading-relaxed border border-gray-100 font-medium">
                Tuyệt vời! Bạn có thể tìm thấy chúng trong mục "Sức khỏe" của Cẩm nang nhé.
              </div>
            </div>
            
            <div className="p-4 border-t border-white/50 flex gap-3 bg-white/80">
              <input type="text" placeholder="Trút bầu tâm sự vào đây..." className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium placeholder-gray-400" />
              <button className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-[0_4px_15px_rgba(56,178,172,0.4)] hover:bg-brand-primary-light">
                <Send size={20} />
              </button>
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
              onClick={() => setIsTeacherDetailOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="bg-brand-orange p-10 text-white text-center relative shrink-0">
                <button 
                  onClick={() => {
                    setIsTeacherDetailOpen(false);
                    setIsEditingTeacher(false);
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
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Môn học</label>
                      <input 
                        type="text" 
                        value={selectedTeacher.subject || ''}
                        onChange={(e) => setSelectedTeacher({...selectedTeacher, subject: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-gray-700"
                        placeholder="VD: Toán, Ngữ Văn..."
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
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.email || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Số điện thoại</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.phoneNumber || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trường công tác</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.school}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Môn học</p>
                      <p className="font-bold text-gray-700">{selectedTeacher.subject || '-'}</p>
                    </div>
                  </div>
                )}
                  <div className="col-span-2 space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lớp phụ trách</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {classes.filter(c => c.teacherName === selectedTeacher.name).map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => {
                            setIsTeacherDetailOpen(false);
                            if (currentView === 'superadmin') {
                              // If super admin and hasn't filtered by school, class view might need school filter?
                              // Actually, the main view has `onViewClass` prop. Wait! `onViewClass` is not accessible here since this modal is in App.tsx. 
                              // So we can set `selectedClassForView`.
                              setSelectedClassForView(c);
                              setCurrentView('class-list');
                            } else {
                              setSelectedClassForView(c);
                              setCurrentView('class-list');
                            }
                          }}
                          className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-brand-orange/20 transition-colors"
                        >
                          Lớp {c.name}
                        </button>
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
                      onClick={() => {
                        // Save logic here if needed, for now just toggle back
                        setIsEditingTeacher(false);
                      }}
                      className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                    >
                      LƯU THAY ĐỔI
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditingTeacher(true)}
                      className="flex-1 bg-brand-orange text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand-orange/20 hover:scale-[1.02] transition-all"
                    >
                      CHỈNH SỬA
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsTeacherDetailOpen(false);
                      setIsEditingTeacher(false);
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
