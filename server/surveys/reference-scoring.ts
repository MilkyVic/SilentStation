import type { SDQAnswers, SectionCData, GAD7Answers, SectionEData, KnowledgeAnswers, AttitudeAnswers, LifestyleAnswers, SurveyCalculatedScores, } from '../../shared/surveys/reference-types.js';
import { KNOWLEDGE_ANSWER_KEY } from './scoring-rules.js';
/**
 * Calculate SDQ 25 scores with reversed items according to standard SDQ youth scoring rules.
 */
export function calculateSDQScore(answers: SDQAnswers) {
    // Emotional symptoms: 3, 8, 13, 16, 24
    const emotional = (answers[3] ?? 0) +
        (answers[8] ?? 0) +
        (answers[13] ?? 0) +
        (answers[16] ?? 0) +
        (answers[24] ?? 0);
    // Conduct problems: 5, 7 (reversed), 12, 18, 22
    const item7Reversed = answers[7] !== undefined ? 2 - answers[7] : 0;
    const conduct = (answers[5] ?? 0) +
        item7Reversed +
        (answers[12] ?? 0) +
        (answers[18] ?? 0) +
        (answers[22] ?? 0);
    // Hyperactivity: 2, 10, 15, 21 (reversed), 25 (reversed)
    const item21Reversed = answers[21] !== undefined ? 2 - answers[21] : 0;
    const item25Reversed = answers[25] !== undefined ? 2 - answers[25] : 0;
    const hyperactivity = (answers[2] ?? 0) +
        (answers[10] ?? 0) +
        (answers[15] ?? 0) +
        item21Reversed +
        item25Reversed;
    // Peer problems: 6, 11 (reversed), 14 (reversed), 19, 23
    const item11Reversed = answers[11] !== undefined ? 2 - answers[11] : 0;
    const item14Reversed = answers[14] !== undefined ? 2 - answers[14] : 0;
    const peer = (answers[6] ?? 0) +
        item11Reversed +
        item14Reversed +
        (answers[19] ?? 0) +
        (answers[23] ?? 0);
    // Prosocial behavior: 1, 4, 9, 17, 20
    const prosocial = (answers[1] ?? 0) +
        (answers[4] ?? 0) +
        (answers[9] ?? 0) +
        (answers[17] ?? 0) +
        (answers[20] ?? 0);
    // Total difficulties excludes prosocial
    const totalDifficulties = emotional + conduct + hyperactivity + peer;
    return {
        emotional,
        conduct,
        hyperactivity,
        peer,
        prosocial,
        totalDifficulties,
    };
}
/**
 * Calculate PHQ-A depression score (0-27)
 */
export function calculatePHQAScore(data: SectionCData) {
    let score = 0;
    for (let i = 1; i <= 9; i++) {
        score += data.items[i] ?? 0;
    }
    const hasSuicidalThoughts = (data.items[9] ?? 0) > 0;
    let severity = 'Bình thường / Tối thiểu';
    let levelKey: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe' = 'minimal';
    if (score >= 20) {
        severity = 'Trầm cảm nặng';
        levelKey = 'severe';
    }
    else if (score >= 15) {
        severity = 'Trầm cảm nặng vừa';
        levelKey = 'moderately_severe';
    }
    else if (score >= 10) {
        severity = 'Trầm cảm vừa';
        levelKey = 'moderate';
    }
    else if (score >= 5) {
        severity = 'Trầm cảm nhẹ';
        levelKey = 'mild';
    }
    return {
        score,
        severity,
        levelKey,
        hasSuicidalThoughts,
    };
}
/**
 * Calculate GAD-7 anxiety score (0-21)
 */
export function calculateGAD7Score(answers: GAD7Answers) {
    let score = 0;
    for (let i = 1; i <= 7; i++) {
        score += answers[i] ?? 0;
    }
    let severity = 'Lo âu tối thiểu';
    let levelKey: 'minimal' | 'mild' | 'moderate' | 'severe' = 'minimal';
    if (score >= 15) {
        severity = 'Lo âu nặng';
        levelKey = 'severe';
    }
    else if (score >= 10) {
        severity = 'Lo âu mức độ vừa';
        levelKey = 'moderate';
    }
    else if (score >= 5) {
        severity = 'Lo âu nhẹ';
        levelKey = 'mild';
    }
    return {
        score,
        severity,
        levelKey,
    };
}
/**
 * Calculate SBQ-R suicidal risk score (range 3 to 18)
 */
export function calculateSBQRScore(data: SectionEData) {
    let e1Score = 0;
    switch (data.e1Lifetime) {
        case '1':
            e1Score = 1;
            break;
        case '2':
            e1Score = 2;
            break;
        case '3a':
        case '3b':
            e1Score = 3;
            break;
        case '4a':
        case '4b':
            e1Score = 4;
            break;
        default:
            e1Score = 1;
    }
    const e2Score = data.e2PastYear ? parseInt(data.e2PastYear, 10) : 1;
    let e3Score = 1;
    switch (data.e3Threat) {
        case '1':
            e3Score = 1;
            break;
        case '2a':
        case '2b':
            e3Score = 2;
            break;
        case '3a':
        case '3b':
            e3Score = 3;
            break;
        default:
            e3Score = 1;
    }
    const e4Score = data.e4Likelihood ? parseInt(data.e4Likelihood, 10) : 0;
    const totalScore = e1Score + e2Score + e3Score + e4Score;
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    let riskLabel = 'Nguy cơ thấp';
    if (totalScore >= 8 || e1Score >= 4 || data.e4Likelihood === '5' || data.e4Likelihood === '6') {
        riskLevel = 'high';
        riskLabel = 'Nguy cơ cao - Cần chú ý hỗ trợ tâm lý kịp thời';
    }
    else if (totalScore >= 7 || e1Score >= 3 || e2Score >= 3) {
        riskLevel = 'moderate';
        riskLabel = 'Nguy cơ trung bình - Nên tham vấn chuyên môn';
    }
    return {
        score: totalScore,
        riskLevel,
        riskLabel,
    };
}
/**
 * Calculate Knowledge score (0 to 28)
 * According to Phụ lục:
 * Sai items: 3, 10, 12, 13, 15, 17, 18, 19, 25, 28
 * All others: Dung
 */
export function calculateKnowledgeScore(answers: KnowledgeAnswers) {
    let correctCount = 0;
    const total = 28;
    for (let i = 1; i <= total; i++) {
        const expected = KNOWLEDGE_ANSWER_KEY[i];
        if (answers[i] === expected) {
            correctCount += 1;
        }
    }
    const percentage = Math.round((correctCount / total) * 100);
    return {
        correctCount,
        total,
        percentage,
    };
}
/**
 * Calculate Attitude score (8 to 56)
 * Likert 1-7.
 * Reverse items 1, 2, 3, 7, 8 (score = 8 - response)
 * Keep items 4, 5, 6 as is
 */
export function calculateAttitudeScore(answers: AttitudeAnswers) {
    let score = 0;
    const reversedItems = [1, 2, 3, 7, 8];
    for (let i = 1; i <= 8; i++) {
        const rawVal = answers[i] ?? 4; // default neutral if unanswered
        if (reversedItems.includes(i)) {
            score += 8 - rawVal;
        }
        else {
            score += rawVal;
        }
    }
    let levelLabel = 'Thái độ tích cực, đồng cảm cao';
    if (score < 28) {
        levelLabel = 'Còn nhiều định kiến về sức khỏe tâm thần';
    }
    else if (score < 42) {
        levelLabel = 'Thái độ trung tính / Đang phát triển nhận thức';
    }
    return {
        score,
        maxScore: 56,
        levelLabel,
    };
}
/**
 * Calculate Lifestyle habits summary (1 to 4)
 */
export function calculateLifestyleScore(answers: LifestyleAnswers) {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= 44; i++) {
        if (answers[i] !== undefined) {
            sum += answers[i];
            count += 1;
        }
    }
    const averageScore = count > 0 ? parseFloat((sum / count).toFixed(2)) : 0;
    return {
        averageScore,
        categoryScores: {},
    };
}
/**
 * Master evaluation function that computes all scores and detects safety flags
 */
export function calculateAllSurveyScores(params: {
    sectionB: SDQAnswers;
    sectionC: SectionCData;
    sectionD: GAD7Answers;
    sectionE: SectionEData;
    sectionF: LifestyleAnswers;
    sectionG: KnowledgeAnswers;
    sectionH: AttitudeAnswers;
}): SurveyCalculatedScores {
    const sdq = calculateSDQScore(params.sectionB);
    const phqa = calculatePHQAScore(params.sectionC);
    const gad7 = calculateGAD7Score(params.sectionD);
    const sbqr = calculateSBQRScore(params.sectionE);
    const knowledge = calculateKnowledgeScore(params.sectionG);
    const attitude = calculateAttitudeScore(params.sectionH);
    const lifestyle = calculateLifestyleScore(params.sectionF);
    const attentionReasons: string[] = [];
    if (phqa.hasSuicidalThoughts) {
        attentionReasons.push('Có suy nghĩ tổn thương bản thân (PHQ-A câu 9)');
    }
    if (params.sectionC.c12SuicideAttemptLifetime === 'co') {
        attentionReasons.push('Từng có tiền sử tự sát trong quá khứ (PHQ-A câu 12)');
    }
    if (sbqr.riskLevel === 'high') {
        attentionReasons.push('Thang SBQ-R ở mức nguy cơ cao');
    }
    if (phqa.levelKey === 'severe' || phqa.levelKey === 'moderately_severe') {
        attentionReasons.push(`Mức độ trầm cảm: ${phqa.severity}`);
    }
    if (gad7.levelKey === 'severe') {
        attentionReasons.push(`Mức độ lo âu: ${gad7.severity}`);
    }
    if (sdq.totalDifficulties >= 20) {
        attentionReasons.push(`Tổng điểm khó khăn SDQ ở mức cao (${sdq.totalDifficulties}/40)`);
    }
    const needsAttention = attentionReasons.length > 0;
    return {
        sdq,
        phqa,
        gad7,
        sbqr,
        knowledge,
        attitude,
        lifestyle,
        needsAttention,
        attentionReasons,
    };
}
