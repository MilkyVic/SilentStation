export type ScoreRange = {
  min: number;
  max: number;
  label: string;
};

export const PHQ9_SCORE_RANGES: ScoreRange[] = [
  { min: 0, max: 4, label: 'Bình thường' },
  { min: 5, max: 9, label: 'Trầm cảm tối thiểu' },
  { min: 10, max: 14, label: 'Trầm cảm nhẹ' },
  { min: 15, max: 19, label: 'Trầm cảm trung bình' },
  { min: 20, max: 27, label: 'Trầm cảm nặng' },
];

export const GAD7_SCORE_RANGES: ScoreRange[] = [
  { min: 0, max: 4, label: 'Lo âu tối thiểu' },
  { min: 5, max: 9, label: 'Lo âu nhẹ' },
  { min: 10, max: 14, label: 'Lo âu trung bình' },
  { min: 15, max: 21, label: 'Lo âu nặng' },
];

export const DASS21_STRESS_RANGES: ScoreRange[] = [
  { min: 0, max: 14, label: 'Bình thường' },
  { min: 15, max: 18, label: 'Nhẹ' },
  { min: 19, max: 25, label: 'Vừa' },
  { min: 26, max: 33, label: 'Nặng' },
  { min: 34, max: 100, label: 'Rất nặng' },
];

export const DASS21_ANXIETY_RANGES: ScoreRange[] = [
  { min: 0, max: 7, label: 'Bình thường' },
  { min: 8, max: 9, label: 'Nhẹ' },
  { min: 10, max: 14, label: 'Vừa' },
  { min: 15, max: 19, label: 'Nặng' },
  { min: 20, max: 100, label: 'Rất nặng' },
];

export const DASS21_DEPRESSION_RANGES: ScoreRange[] = [
  { min: 0, max: 9, label: 'Bình thường' },
  { min: 10, max: 13, label: 'Nhẹ' },
  { min: 14, max: 20, label: 'Vừa' },
  { min: 21, max: 27, label: 'Nặng' },
  { min: 28, max: 100, label: 'Rất nặng' },
];

export const DASS21_SUBSCALE_ITEMS = {
  stress: [1, 6, 8, 11, 12, 14, 18],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  depression: [3, 5, 10, 13, 16, 17, 21],
} as const;

