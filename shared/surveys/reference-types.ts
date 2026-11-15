/**
 * Types for Student Mental Health Survey Platform
 * Based on the survey questionnaire "Phiếu khảo sát sức khỏe tâm thần học sinh"
 */
export interface ParentInfo {
    age?: number | string;
    educationLevel?: '1' | '2' | '3' | '4' | ''; // 1: Chưa tốt nghiệp THPT, 2: Tốt nghiệp THPT, 3: Cao đẳng - ĐH, 4: Thạc sĩ - TS
}
export interface SectionAData {
    studentCode: string;
    surveyDate: string;
    birthYear: number | string;
    gender: '1' | '2' | ''; // 1: Nam, 2: Nữ
    grade: '6' | '7' | '8' | '9' | '10' | '11' | '12' | '';
    schoolType: '1' | '2' | ''; // 1: THCS, 2: THPT
    screenTime: '0' | '1' | '2' | '3' | ''; // 0: Không sử dụng, 1: < 2h, 2: 2h - <4h, 3: >= 4h
    father: ParentInfo;
    mother: ParentInfo;
}
// B: SDQ 25 items (0: Không đúng, 1: Đúng 1 phần, 2: Chắc chắn đúng)
export type SDQAnswers = Record<number, number>; // keys 1 to 25
// C: PHQ-A (0: Không có ngày nào / Hầu như không bao giờ, 1: Một vài ngày, 2: Hơn nửa số ngày, 3: Gần như mỗi ngày)
export interface SectionCData {
    items: Record<number, number>; // keys 1 to 9 (0-3)
    c10SadMostDays: 'co' | 'khong' | ''; // 1 năm qua cảm thấy buồn hoặc chán nản hầu hết các ngày
    c11Difficulty: 'none' | 'somewhat' | 'very' | 'extreme' | ''; // Mức độ khó khăn trong học tập, sinh hoạt
    c12SuicideAttemptLifetime: 'co' | 'khong' | ''; // Đã bao giờ cố gắng tự sát trong suốt cuộc đời chưa
}
// D: GAD-7 (0: Không bao giờ, 1: Vài ngày, 2: Hơn một nửa số ngày, 3: Gần như hàng ngày)
export type GAD7Answers = Record<number, number>; // keys 1 to 7
// E: SBQ-R (Suicide Behaviors Questionnaire-Revised)
export interface SectionEData {
    e1Lifetime: '1' | '2' | '3a' | '3b' | '4a' | '4b' | '';
    e2PastYear: '1' | '2' | '3' | '4' | '5' | '';
    e3Threat: '1' | '2a' | '2b' | '3a' | '3b' | '';
    e4Likelihood: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '';
}
// F: Lifestyle 44 items (1: Không bao giờ, 2: Thỉnh thoảng, 3: Thường xuyên, 4: Luôn luôn)
export type LifestyleAnswers = Record<number, number>; // keys 1 to 44
// G: Mental Health Knowledge 28 items ('dung' | 'sai' | 'khong_biet')
export type KnowledgeAnswers = Record<number, 'dung' | 'sai' | 'khong_biet'>; // keys 1 to 28
// H: Attitudes towards mental illness (1 to 7 Likert scale)
export type AttitudeAnswers = Record<number, number>; // keys 1 to 8
// I: Self-care and help seeking
export interface SectionIData {
    i1Skills: Record<number, '1' | '2' | '3' | '4' | 'K'>; // keys 1 to 12
    i2SelfCareActions: string; // Tự luận hành vi tự chăm sóc
    i3HelpSeekingExperience: string; // Tự luận tìm kiếm sự trợ giúp
}
// J: Barriers and needs
export interface SectionJData {
    j1SelfCareBarrier: string;
    j2HelpSeekingBarrier: string;
    j3GuidanceNeeds: string;
    j4SchoolFamilySupport: string;
}
export interface SurveyResponse {
    id: string;
    createdAt: string;
    completedAt?: string;
    status: 'draft' | 'completed';
    sectionA: SectionAData;
    sectionB: SDQAnswers;
    sectionC: SectionCData;
    sectionD: GAD7Answers;
    sectionE: SectionEData;
    sectionF: LifestyleAnswers;
    sectionG: KnowledgeAnswers;
    sectionH: AttitudeAnswers;
    sectionI: SectionIData;
    sectionJ: SectionJData;
    calculatedScores?: SurveyCalculatedScores;
}
export interface SurveyCalculatedScores {
    sdq: {
        emotional: number;
        conduct: number;
        hyperactivity: number;
        peer: number;
        prosocial: number;
        totalDifficulties: number;
    };
    phqa: {
        score: number;
        severity: string;
        levelKey: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
        hasSuicidalThoughts: boolean; // Item 9 > 0
    };
    gad7: {
        score: number;
        severity: string;
        levelKey: 'minimal' | 'mild' | 'moderate' | 'severe';
    };
    sbqr: {
        score: number;
        riskLevel: 'low' | 'moderate' | 'high';
        riskLabel: string;
    };
    knowledge: {
        correctCount: number;
        total: number;
        percentage: number;
    };
    attitude: {
        score: number;
        maxScore: number;
        levelLabel: string;
    };
    lifestyle: {
        averageScore: number;
        categoryScores: Record<string, number>;
    };
    needsAttention: boolean;
    attentionReasons: string[];
}
