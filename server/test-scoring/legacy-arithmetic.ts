import { scoreDass21, scoreGad7, scorePhq9 } from './engine.js';
import { AuthHttpError } from '../auth-core.js';
export const LEGACY_SCORE_VERSION = 'legacy-arithmetic-v2';
export function legacyArithmetic(code: string, answers: number[]) {
    const sum = (indexes: number[]) => indexes.reduce((n, i) => n + answers[i - 1], 0);
    if (code === 'PHQ9')
        return { total: scorePhq9(answers).total };
    if (code === 'GAD7')
        return { total: scoreGad7(answers).total };
    if (code === 'DASS21') {
        const s = scoreDass21(answers);
        return { total: s.stress.score + s.anxiety.score + s.depression.score, subscales: { stress: s.stress.score, anxiety: s.anxiety.score, depression: s.depression.score } };
    }
    if (code === 'SDQ25') {
        if (answers.length !== 25)
            throw new AuthHttpError(400, 'TEST_INVALID', 'Cần đủ 25 đáp án.');
        const reversed = new Set([7, 11, 14, 21, 25]);
        const score = (indexes: number[]) => indexes.reduce((n, i) => n + (reversed.has(i) ? 2 - answers[i - 1] : answers[i - 1]), 0);
        const emotional = score([3, 8, 13, 16, 24]), conduct = score([5, 7, 12, 18, 22]), hyperactivity = score([2, 10, 15, 21, 25]), peer = score([6, 11, 14, 19, 23]), prosocial = score([1, 4, 9, 17, 20]);
        return { total: emotional + conduct + hyperactivity + peer, subscales: { emotional, conduct, hyperactivity, peer, prosocial } };
    }
    if (code === 'MT') {
        if (answers.length !== 27)
            throw new AuthHttpError(400, 'TEST_INVALID', 'Cần đủ 27 đáp án.');
        const reversed = new Set([5, 9, 17, 22]);
        const mean = (start: number, end: number) => { const values = answers.slice(start - 1, end).map((v, i) => reversed.has(start + i) ? 6 - v : v); return Number((values.reduce((n, v) => n + v, 0) / values.length).toFixed(2)); };
        return { total: mean(1, 27), subscales: { safety: mean(1, 5), respect: mean(6, 10), support: mean(11, 17), learning: mean(18, 22), awareness: mean(23, 27) } };
    }
    if (code === 'MBI22') {
        if (answers.length !== 22)
            throw new AuthHttpError(400, 'TEST_INVALID', 'Cần đủ 22 đáp án.');
        const EE = sum([1, 2, 3, 6, 8, 13, 14, 16, 20]), DP = sum([5, 10, 11, 15, 22]), PA = sum([4, 7, 9, 12, 17, 18, 19, 21]);
        return { total: EE + DP + PA, subscales: { EE, DP, PA } };
    }
    return { total: answers.reduce((n, v) => n + v, 0) };
}
