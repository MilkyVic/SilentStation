import { DASS21_ANXIETY_RANGES, DASS21_DEPRESSION_RANGES, DASS21_STRESS_RANGES, DASS21_SUBSCALE_ITEMS, GAD7_SCORE_RANGES, PHQ9_SCORE_RANGES, } from './rules.js';
const clampScore = (value, min, max) => {
    const num = Number(value);
    if (!Number.isFinite(num))
        return min;
    if (num < min)
        return min;
    if (num > max)
        return max;
    return num;
};
const resolveLevel = (score, ranges) => {
    const found = ranges.find((range) => score >= range.min && score <= range.max);
    return found?.label || 'Chưa phân loại';
};
export const scorePhq9 = (answers) => {
    const total = answers.reduce((sum, value) => sum + clampScore(value, 0, 3), 0);
    return {
        total,
        level: resolveLevel(total, PHQ9_SCORE_RANGES),
        shouldRecommendSupport: total >= 10,
    };
};
export const scoreGad7 = (answers) => {
    const total = answers.reduce((sum, value) => sum + clampScore(value, 0, 3), 0);
    return {
        total,
        level: resolveLevel(total, GAD7_SCORE_RANGES),
        shouldRecommendSupport: total >= 10,
    };
};
const computeDassSubscale = (answers, itemIndexes, ranges) => {
    const raw = itemIndexes.reduce((sum, index) => {
        const answer = answers[index - 1];
        return sum + clampScore(answer, 0, 3);
    }, 0);
    const score = raw * 2;
    return { score, level: resolveLevel(score, ranges) };
};
export const scoreDass21 = (answers) => {
    const stress = computeDassSubscale(answers, DASS21_SUBSCALE_ITEMS.stress, DASS21_STRESS_RANGES);
    const anxiety = computeDassSubscale(answers, DASS21_SUBSCALE_ITEMS.anxiety, DASS21_ANXIETY_RANGES);
    const depression = computeDassSubscale(answers, DASS21_SUBSCALE_ITEMS.depression, DASS21_DEPRESSION_RANGES);
    return { stress, anxiety, depression };
};
export const shouldSuggestDass21ByCoreTest = (testId, score) => (['1', '2', '3', '4'].includes(String(testId)) && score >= 10);
