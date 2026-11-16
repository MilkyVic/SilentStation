import { SYSTEM_TEMPLATE_QUESTIONS } from '../../../server/test-question-bank';
export const MOCK_STUDENTS = [
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
export const MOCK_TEACHERS = [
    { id: 't1', name: 'Nguyễn Thị Minh', fullName: 'Nguyễn Thị Minh', username: 'minh_nguyen', email: 'minh.nguyen@school.edu.vn', phoneNumber: '0912345678', birthYear: '1985', school: 'THPT Chuyên Hà Nội - Amsterdam', schoolId: 's1', role: 'Giáo viên', className: '12A1' },
    { id: 't2', name: 'Trần Văn Hùng', fullName: 'Trần Văn Hùng', username: 'hung_tran', email: 'hung.tran@school.edu.vn', phoneNumber: '0987654321', birthYear: '1980', school: 'THPT Chu Văn An', schoolId: 's2', role: 'Giáo viên', className: '12A2' },
    { id: 't3', name: 'Lê Thị Mai', fullName: 'Lê Thị Mai', username: 'mai_le', email: 'mai.le@school.edu.vn', phoneNumber: '0900112233', birthYear: '1990', school: 'THPT Phan Đình Phùng', schoolId: 's3', role: 'Giáo viên', className: '11B1' },
];
export const MOCK_CLASSES = [
    { id: 'c1', name: '12A1', studentCount: 45, avgStress: 52, teacherName: 'Nguyễn Thị Minh', schoolId: 's1' },
    { id: 'c2', name: '12A2', studentCount: 42, avgStress: 68, teacherName: 'Trần Văn Hùng', schoolId: 's2' },
    { id: 'c3', name: '11B1', studentCount: 48, avgStress: 45, teacherName: 'Lê Thị Mai', schoolId: 's3' },
    { id: 'c4', name: '10C1', studentCount: 50, avgStress: 38, teacherName: 'Phạm Văn Dũng', schoolId: 's1' },
    { id: 'c5', name: '12D1', studentCount: 40, avgStress: 55, teacherName: 'Hoàng Thị Lan', schoolId: 's2' },
];
export const MOCK_ADMINS = [
    { id: 'a1', name: 'Nguyễn Văn Quản', username: 'admin_amsterdam', school: 'THPT Chuyên Hà Nội - Amsterdam', schoolId: 's1', role: 'Admin' },
    { id: 'a2', name: 'Trần Minh Lý', username: 'admin_chuvanan', school: 'THPT Chu Văn An', schoolId: 's2', role: 'Admin' },
    { id: 'a3', name: 'Lê Thu Hà', username: 'admin_phandinhphung', school: 'THPT Phan Đình Phùng', schoolId: 's3', role: 'Admin' },
];
export const MOCK_SCHOOLS = [
    { id: 's1', name: 'THPT Chuyên Hà Nội - Amsterdam', address: '1 Hoàng Minh Giám, Cầu Giấy, Hà Nội', teacherCount: 120, classCount: 45, adminId: 'a1' },
    { id: 's2', name: 'THPT Chu Văn An', address: '10 Thụy Khuê, Tây Hồ, Hà Nội', teacherCount: 110, classCount: 42, adminId: 'a2' },
    { id: 's3', name: 'THPT Phan Đình Phùng', address: '67B Cửa Bắc, Ba Đình, Hà Nội', teacherCount: 95, classCount: 38, adminId: 'a3' },
];
const tests = ['PHQ-9', 'GAD-7', 'SDQ-25', 'Môi trường học đường', 'DASS-21', 'MBI-22'].map((name, index) => { const id = String(index + 1), questions = SYSTEM_TEMPLATE_QUESTIONS[id] ?? []; return { id, title: `Bài tự đánh giá ${name}`, desc: 'Dữ liệu demo, chưa có diễn giải được duyệt.', time: 'Không giới hạn', questions: `${questions.length} câu`, icon: 'BookOpen', color: 'bg-brand-primary', isOpen: true, isPredefined: true, targetAudience: index === 5 ? 'Giáo viên' : index === 4 ? 'Cả hai' : 'Học sinh', questionList: questions.map(q => ({ id: `${id}-q${q.order}`, text: q.text, options: q.options.map(o => ({ id: `${id}-q${q.order}-o${o.order}`, text: o.label, score: o.score })) })) }; });
export const legacyFixtures = { students: MOCK_STUDENTS, teachers: MOCK_TEACHERS, classes: MOCK_CLASSES, admins: MOCK_ADMINS, schools: MOCK_SCHOOLS, tests };
