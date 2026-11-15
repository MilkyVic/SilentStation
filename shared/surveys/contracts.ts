import { SDQ_QUESTIONS, PHQA_QUESTIONS, GAD7_QUESTIONS, SBQR_QUESTIONS, LIFESTYLE_QUESTIONS, KNOWLEDGE_QUESTIONS, ATTITUDE_QUESTIONS, SELF_CARE_SKILLS } from './question-bank.js';
export const DEFINITION_VERSION = 'student-mental-health-v1-draft';
export const SCORE_VERSION = 'survey-arithmetic-v1';
export const CONSENT_VERSION = 'survey-consent-v1-draft';
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
export type SectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
export type Answer = {
    status: 'unanswered' | 'skipped';
} | {
    status: 'answered';
    value: string | number;
};
export type Answers = Record<string, Answer>;
export type Question = {
    code: string;
    section: SectionId;
    label: string;
    kind: 'single' | 'integer' | 'text';
    options?: {
        value: string | number;
        label: string;
    }[];
    min?: number;
    max?: number;
};
export type Score = {
    status: 'computed';
    total: number;
    subscales?: Record<string, number>;
} | {
    status: 'insufficient_data' | 'unapproved';
    missing: number;
};
export type Scores = Record<string, Score>;
export type Campaign = {
    id: string;
    code: string;
    title: string;
    school: string;
    status: 'draft' | 'open' | 'closed';
    isDemo: boolean;
    definitionVersion: string;
    consentVersion: string;
    scoringApproved: boolean;
    policyApproved: boolean;
    retentionDays: number | null;
    permissions?: {
        readRaw: boolean;
        export: boolean;
    };
};
export type Draft = {
    answers: Answers;
    reviewedSections: SectionId[];
    revision: number;
    expiresAt: string;
    submitted: boolean;
    receipt?: Receipt;
};
export type Receipt = {
    responseId: string;
    savedAt: string;
};
export type SurveyRecord = Receipt & {
    campaignId: string;
    definitionVersion: string;
    scoreVersion: string;
    consentVersion: string;
    answers: Answers;
    reviewedSections: SectionId[];
    scores: Scores;
};
export type Grant = {
    userId: string;
    readRaw: boolean;
    export: boolean;
};
export type Definition = {
    version: string;
    consentVersion: string;
    sections: {
        id: SectionId;
        title: string;
        instruction: string;
    }[];
    questions: Question[];
};
const opts = (labels: string[], start = 0) => labels.map((label, i) => ({ value: i + start, label }));
const questions: Question[] = [];
const add = (code: string, section: SectionId, label: string, kind: Question['kind'], extra: Partial<Question> = {}) => questions.push({ code, section, label, kind, ...extra });
const single = (code: string, section: SectionId, label: string, options: Question['options']) => add(code, section, label, 'single', { options });
add('A.birthYear', 'A', 'A1. Năm sinh của em', 'integer', { min: 1900, max: 2100 });
single('A.gender', 'A', 'A2. Giới tính', [{ value: '1', label: 'Nam' }, { value: '2', label: 'Nữ' }]);
single('A.grade', 'A', 'A3. Đang học lớp', ['6', '7', '8', '9', '10', '11', '12'].map(value => ({ value, label: value })));
single('A.schoolType', 'A', 'A4. Cấp trường', [{ value: '1', label: 'THCS' }, { value: '2', label: 'THPT' }]);
single('A.screenTime', 'A', 'A5. Trong 7 ngày qua, trung bình mỗi ngày em sử dụng thiết bị có màn hình (điện thoại, máy tính bảng, máy tính, ti vi…) ngoài thời gian học khoảng bao lâu? Tính cả thời gian xem video, chơi trò chơi, dùng mạng xã hội hoặc nhắn tin. Nếu dùng hai thiết bị cùng lúc, chỉ tính khoảng thời gian đó một lần.', ['Không sử dụng', 'Dưới 2 giờ', 'Từ 2 đến dưới 4 giờ', 'Từ 4 giờ trở lên'].map((label, i) => ({ value: String(i), label })));
for (const parent of ['father', 'mother']) {
    add(`A.${parent}.age`, 'A', `Tuổi của ${parent === 'father' ? 'bố' : 'mẹ'}`, 'integer', { min: 1, max: 120 });
    single(`A.${parent}.educationLevel`, 'A', `Trình độ học vấn của ${parent === 'father' ? 'bố' : 'mẹ'}`, ['Chưa tốt nghiệp THPT', 'Tốt nghiệp THPT', 'Cao đẳng – đại học', 'Thạc sĩ – Tiến sĩ'].map((label, i) => ({ value: String(i + 1), label })));
}
SDQ_QUESTIONS.forEach(q => single(`B.${q.id}`, 'B', q.text, opts(['Không đúng', 'Đúng một phần', 'Chắc chắn đúng'])));
PHQA_QUESTIONS.forEach(q => single(`C.${q.id}`, 'C', q.text, opts(['Không có ngày nào', 'Một vài ngày', 'Hơn nửa số ngày', 'Gần như mỗi ngày'])));
single('C.c10SadMostDays', 'C', 'Trong 1 năm qua, em có cảm thấy buồn hoặc chán nản hầu hết các ngày, ngay cả khi thỉnh thoảng em vẫn cảm thấy ổn không?', [{ value: 'co', label: 'Có' }, { value: 'khong', label: 'Không' }]);
single('C.c11Difficulty', 'C', 'C11. Nếu em đang gặp bất kỳ vấn đề nào được liệt kê trong biểu mẫu này, những vấn đề đó đã khiến em gặp khó khăn như thế nào trong việc học tập, chăm sóc bản thân ở nhà hoặc hoà hợp với người khác?', ['none', 'somewhat', 'very', 'extreme'].map((value, i) => ({ value, label: ['Không khó khăn', 'Hơi khó khăn', 'Khá khó khăn', 'Cực kỳ khó khăn'][i] })));
single('C.c12SuicideAttemptLifetime', 'C', 'Em đã bao giờ, trong suốt cuộc đời mình, cố gắng tự sát hoặc thực hiện hành vi tự sát chưa?', [{ value: 'co', label: 'Có' }, { value: 'khong', label: 'Không' }]);
GAD7_QUESTIONS.forEach(q => single(`D.${q.id}`, 'D', q.text, opts(['Không bao giờ', 'Vài ngày', 'Hơn một nửa số ngày', 'Gần như hàng ngày'])));
for (const [name, q] of Object.entries(SBQR_QUESTIONS))
    single(`E.${name}`, 'E', q.question, q.options.map(o => ({ value: o.code, label: o.label })));
LIFESTYLE_QUESTIONS.forEach(q => single(`F.${q.id}`, 'F', q.text, opts(['Không bao giờ', 'Thỉnh thoảng', 'Thường xuyên', 'Luôn luôn'], 1)));
KNOWLEDGE_QUESTIONS.forEach(q => single(`G.${q.id}`, 'G', q.text, [{ value: 'dung', label: 'Đúng' }, { value: 'sai', label: 'Sai' }, { value: 'khong_biet', label: 'Không biết' }]));
ATTITUDE_QUESTIONS.forEach(q => single(`H.${q.id}`, 'H', q.text, opts(['Hoàn toàn không đồng ý', 'Không đồng ý', 'Hơi không đồng ý', 'Trung tính', 'Hơi đồng ý', 'Đồng ý', 'Hoàn toàn đồng ý'], 1)));
SELF_CARE_SKILLS.forEach(q => single(`I.${q.id}`, 'I', q.text, ['1', '2', '3', '4', 'K'].map((value, i) => ({ value, label: ['Em chưa biết cách', 'Thực hiện được một phần', 'Thực hiện được nhưng còn lúng túng', 'Thực hiện được mỗi khi cần', 'Em chưa rõ'][i] }))));
add('I.i2SelfCareActions', 'I', 'Trong 6 tháng qua, em đã làm những việc gì để giữ tinh thần khỏe mạnh hoặc giúp mình cảm thấy dễ chịu hơn khi buồn, lo lắng hay căng thẳng? Em có thể kể một ví dụ cụ thể.', 'text');
add('I.i3HelpSeekingExperience', 'I', 'Trong 6 tháng qua, khi gặp khó khăn về tinh thần, em đã tìm đến ai hoặc nguồn hỗ trợ nào để được giúp đỡ? Em đã liên hệ hoặc chia sẻ bằng cách nào?', 'text');
['Khi muốn làm một việc giúp tinh thần mình tốt hơn, em gặp khó khăn gì?', 'Điều gì khiến em ngần ngại chia sẻ hoặc khó tìm được người giúp đỡ khi gặp khó khăn về tinh thần?', 'Em muốn được hướng dẫn thêm điều gì để chăm sóc tinh thần tốt hơn? Điều nào cần nhất với em?', 'Em mong gia đình hoặc nhà trường hỗ trợ điều gì? Em muốn nhận sự hỗ trợ đó bằng cách nào?'].forEach((label, i) => add(`J.${i + 1}`, 'J', label, 'text'));
export const DEFINITION: Definition = { version: DEFINITION_VERSION, consentVersion: CONSENT_VERSION, sections: [
        { id: 'A', title: 'Thông tin cá nhân và gia đình', instruction: 'Không ghi họ tên, tài khoản hoặc thông tin liên hệ. Em có thể bỏ qua bất kỳ câu nào.' },
        { id: 'B', title: 'Điểm mạnh và khó khăn · SDQ-25', instruction: 'Trả lời theo những sự việc diễn ra trong vòng 6 tháng trở lại đây.' },
        { id: 'C', title: 'Các biểu hiện · PHQ-A', instruction: 'Trả lời theo trải nghiệm trong 2 tuần vừa qua. Em không cần trả lời nếu chưa sẵn sàng.' },
        { id: 'D', title: 'Các biểu hiện lo âu · GAD-7', instruction: 'Trong 2 tuần vừa qua, em cảm thấy khó chịu bởi mỗi vấn đề trong bao nhiêu ngày?' },
        { id: 'E', title: 'Suy nghĩ và hành vi · SBQ-R', instruction: 'Chọn một phương án phù hợp; em luôn có thể bỏ qua hoặc dừng lại. Nếu đang không an toàn, hãy tìm người lớn đáng tin cậy ngay.' },
        { id: 'F', title: 'Lối sống', instruction: 'Trả lời theo thói quen thực tế. Nếu không hiểu hoặc không muốn trả lời, em có thể bỏ qua.' },
        { id: 'G', title: 'Kiến thức sức khỏe tâm thần', instruction: 'Chọn Đúng, Sai hoặc Không biết. Không biết khác với bỏ qua câu hỏi.' },
        { id: 'H', title: 'Thái độ', instruction: 'Chọn mức đồng ý từ 1 đến 7 phù hợp với suy nghĩ của em.' },
        { id: 'I', title: 'Tự chăm sóc và tìm kiếm sự trợ giúp', instruction: 'K có nghĩa là em chưa rõ khả năng của mình; đây là một lựa chọn hợp lệ.' },
        { id: 'J', title: 'Rào cản và nhu cầu hỗ trợ', instruction: 'Các câu tự luận không bắt buộc. Không ghi chi tiết có thể nhận diện em hoặc người khác.' }
    ], questions };
export const emptyAnswers = (): Answers => Object.fromEntries(questions.map(q => [q.code, { status: 'unanswered' }]));
export const countAnswers = (answers: Answers) => ({ answered: Object.values(answers).filter(a => a.status === 'answered').length, skipped: Object.values(answers).filter(a => a.status === 'skipped').length, unanswered: questions.length - Object.keys(answers).filter(k => answers[k].status !== 'unanswered').length });
export class SurveyValidationError extends Error {
}
export function validateAnswers(input: unknown): Answers {
    if (!input || typeof input !== 'object' || Array.isArray(input))
        throw new SurveyValidationError('Dữ liệu câu trả lời không hợp lệ.');
    const result = emptyAnswers();
    const byCode = new Map(questions.map(q => [q.code, q]));
    for (const [code, raw] of Object.entries(input)) {
        const q = byCode.get(code);
        if (!q || !raw || typeof raw !== 'object' || Array.isArray(raw))
            throw new SurveyValidationError('Mã câu hỏi không hợp lệ.');
        const a = raw as Record<string, unknown>;
        if (a.status === 'skipped' || a.status === 'unanswered') {
            if (Object.keys(a).some(k => k !== 'status'))
                throw new SurveyValidationError('Câu bỏ qua không được có giá trị.');
            result[code] = { status: a.status };
            continue;
        }
        if (a.status !== 'answered' || Object.keys(a).some(k => !['status', 'value'].includes(k)))
            throw new SurveyValidationError('Trạng thái đáp án không hợp lệ.');
        const v = a.value;
        if (q.kind === 'single' && !q.options?.some(o => o.value === v))
            throw new SurveyValidationError(`Lựa chọn ${code} không hợp lệ.`);
        if (q.kind === 'integer' && (typeof v !== 'number' || !Number.isInteger(v) || v < (q.min ?? 0) || v > (q.code === 'A.birthYear' ? new Date().getFullYear() : q.max ?? Number.MAX_SAFE_INTEGER)))
            throw new SurveyValidationError(`Giá trị ${code} không hợp lệ.`);
        if (q.kind === 'text' && (typeof v !== 'string' || v.length > 2000 || !v.trim()))
            throw new SurveyValidationError(`Nội dung ${code} không hợp lệ hoặc vượt 2000 ký tự.`);
        result[code] = { status: 'answered', value: v as string | number };
    }
    return result;
}
export function validateSections(input: unknown): SectionId[] { if (!Array.isArray(input) || input.some(v => !DEFINITION.sections.some(s => s.id === v)))
    throw new SurveyValidationError('Phần khảo sát không hợp lệ.'); return [...new Set(input)] as SectionId[]; }
