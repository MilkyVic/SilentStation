import {
  DASS21_ANXIETY_RANGES,
  DASS21_DEPRESSION_RANGES,
  DASS21_STRESS_RANGES,
  DASS21_SUBSCALE_ITEMS,
  GAD7_SCORE_RANGES,
  PHQ9_SCORE_RANGES,
  ScoreRange,
} from './rules.js';

export type ScaleScore = {
  score: number;
  level: string;
};

const clampScore = (value: unknown, min: number, max: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  if (num < min) return min;
  if (num > max) return max;
  return num;
};

const resolveLevel = (score: number, ranges: ScoreRange[]) => {
  const found = ranges.find((range) => score >= range.min && score <= range.max);
  return found?.label || 'Chưa phân loại';
};

export const scorePhq9 = (answers: number[]) => {
  const total = answers.reduce((sum, value) => sum + clampScore(value, 0, 3), 0);
  return {
    total,
    level: resolveLevel(total, PHQ9_SCORE_RANGES),
    shouldRecommendSupport: total >= 10,
  };
};

export const scoreGad7 = (answers: number[]) => {
  const total = answers.reduce((sum, value) => sum + clampScore(value, 0, 3), 0);
  return {
    total,
    level: resolveLevel(total, GAD7_SCORE_RANGES),
    shouldRecommendSupport: total >= 10,
  };
};

const computeDassSubscale = (answers: number[], itemIndexes: readonly number[], ranges: ScoreRange[]): ScaleScore => {
  const raw = itemIndexes.reduce((sum, index) => {
    const answer = answers[index - 1];
    return sum + clampScore(answer, 0, 3);
  }, 0);
  const score = raw * 2;
  return { score, level: resolveLevel(score, ranges) };
};

export const scoreDass21 = (answers: number[]) => {
  const stress = computeDassSubscale(answers, DASS21_SUBSCALE_ITEMS.stress, DASS21_STRESS_RANGES);
  const anxiety = computeDassSubscale(answers, DASS21_SUBSCALE_ITEMS.anxiety, DASS21_ANXIETY_RANGES);
  const depression = computeDassSubscale(answers, DASS21_SUBSCALE_ITEMS.depression, DASS21_DEPRESSION_RANGES);

  return { stress, anxiety, depression };
};

export const shouldSuggestDass21ByCoreTest = (testId: string, score: number) => (
  ['1', '2', '3', '4'].includes(String(testId)) && score >= 10
);

