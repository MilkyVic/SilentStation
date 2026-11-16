import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSDQScore, calculatePHQAScore, calculateGAD7Score, calculateSBQRScore, calculateKnowledgeScore, calculateAttitudeScore, calculateAllSurveyScores, } from './reference-scoring.js';
import type { SDQAnswers, SectionCData, GAD7Answers, SectionEData, KnowledgeAnswers, AttitudeAnswers, LifestyleAnswers } from '../../shared/surveys/reference-types.js';
test('SDQ 25 calculation correctly inverts reverse items and calculates subscales', () => {
    // Test case where item 7 is 2 (reversed to 0), item 21 is 2 (reversed to 0), item 25 is 2 (reversed to 0)
    // item 11 is 2 (reversed to 0), item 14 is 2 (reversed to 0)
    const allZeroAnswers: SDQAnswers = {};
    for (let i = 1; i <= 25; i++) {
        allZeroAnswers[i] = 0;
    }
    // If all are 0:
    // Emotional (3,8,13,16,24) = 0 + 0 + 0 + 0 + 0 = 0
    // Conduct (5, 7 rev, 12, 18, 22) -> 7 is 0, reversed = 2. Total = 2
    // Hyperactivity (2, 10, 15, 21 rev, 25 rev) -> 21 rev = 2, 25 rev = 2. Total = 4
    // Peer (6, 11 rev, 14 rev, 19, 23) -> 11 rev = 2, 14 rev = 2. Total = 4
    // Prosocial (1, 4, 9, 17, 20) = 0
    // Total difficulties = 0 + 2 + 4 + 4 = 10
    const result = calculateSDQScore(allZeroAnswers);
    assert.equal(result.emotional, 0);
    assert.equal(result.conduct, 2);
    assert.equal(result.hyperactivity, 4);
    assert.equal(result.peer, 4);
    assert.equal(result.prosocial, 0);
    assert.equal(result.totalDifficulties, 10);
});
test('PHQ-A score calculation and severity levels', () => {
    const normalData: SectionCData = {
        items: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 },
        c10SadMostDays: 'khong',
        c11Difficulty: 'none',
        c12SuicideAttemptLifetime: 'khong',
    };
    const normalRes = calculatePHQAScore(normalData);
    assert.equal(normalRes.score, 2);
    assert.equal(normalRes.levelKey, 'minimal');
    assert.equal(normalRes.hasSuicidalThoughts, false);
    const severeData: SectionCData = {
        items: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 3, 6: 3, 7: 2, 8: 1, 9: 1 },
        c10SadMostDays: 'co',
        c11Difficulty: 'extreme',
        c12SuicideAttemptLifetime: 'khong',
    };
    const severeRes = calculatePHQAScore(severeData);
    assert.equal(severeRes.score, 21);
    assert.equal(severeRes.levelKey, 'severe');
    assert.equal(severeRes.hasSuicidalThoughts, true);
});
test('GAD-7 anxiety calculation matches standard cutoffs', () => {
    const answers: GAD7Answers = { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2 };
    const res = calculateGAD7Score(answers);
    assert.equal(res.score, 14);
    assert.equal(res.levelKey, 'moderate');
});
test('SBQ-R score calculation correctly maps options to standard point scales', () => {
    const sbqLow: SectionEData = {
        e1Lifetime: '1', // 1 pt
        e2PastYear: '1', // 1 pt
        e3Threat: '1', // 1 pt
        e4Likelihood: '0', // 0 pt
    };
    const resLow = calculateSBQRScore(sbqLow);
    assert.equal(resLow.score, 3);
    assert.equal(resLow.riskLevel, 'low');
    const sbqHigh: SectionEData = {
        e1Lifetime: '4b', // 4 pt
        e2PastYear: '4', // 4 pt
        e3Threat: '3b', // 3 pt
        e4Likelihood: '4', // 4 pt
    };
    const resHigh = calculateSBQRScore(sbqHigh);
    assert.equal(resHigh.score, 15);
    assert.equal(resHigh.riskLevel, 'high');
});
test('Knowledge score correctly evaluates all 28 items according to research appendix', () => {
    // Sai items: 3, 10, 12, 13, 15, 17, 18, 19, 25, 28
    // All others: Dung
    const perfectAnswers: KnowledgeAnswers = {};
    const saiList = [3, 10, 12, 13, 15, 17, 18, 19, 25, 28];
    for (let i = 1; i <= 28; i++) {
        perfectAnswers[i] = saiList.includes(i) ? 'sai' : 'dung';
    }
    const res = calculateKnowledgeScore(perfectAnswers);
    assert.equal(res.correctCount, 28);
    assert.equal(res.percentage, 100);
    // If student answered all 'dung'
    const allDungAnswers: KnowledgeAnswers = {};
    for (let i = 1; i <= 28; i++) {
        allDungAnswers[i] = 'dung';
    }
    const allDungRes = calculateKnowledgeScore(allDungAnswers);
    assert.equal(allDungRes.correctCount, 18); // 28 - 10 sai items = 18
});
test('Attitude score correctly inverts items 1, 2, 3, 7, 8 (score = 8 - original)', () => {
    // If answers are all 1:
    // items 1, 2, 3, 7, 8 become 8 - 1 = 7 (x 5 = 35)
    // items 4, 5, 6 remain 1 (x 3 = 3)
    // total = 38
    const all1Answers: AttitudeAnswers = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 };
    const res1 = calculateAttitudeScore(all1Answers);
    assert.equal(res1.score, 38);
    // If answers are all 7:
    // items 1, 2, 3, 7, 8 become 8 - 7 = 1 (x 5 = 5)
    // items 4, 5, 6 remain 7 (x 3 = 21)
    // total = 26
    const all7Answers: AttitudeAnswers = { 1: 7, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7, 7: 7, 8: 7 };
    const res7 = calculateAttitudeScore(all7Answers);
    assert.equal(res7.score, 26);
});
test('calculateAllSurveyScores triggers attention flag when safety risk exists', () => {
    const mockSDQ: SDQAnswers = {};
    for (let i = 1; i <= 25; i++) {
        // healthy items: 7, 21, 25, 11, 14 (reversed in SDQ) = 2, prosocial (1,4,9,17,20) = 2, difficulties = 0
        if ([7, 21, 25, 11, 14, 1, 4, 9, 17, 20].includes(i)) {
            mockSDQ[i] = 2;
        }
        else {
            mockSDQ[i] = 0;
        }
    }
    const mockGAD: GAD7Answers = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    const mockLife: LifestyleAnswers = {};
    const mockKnow: KnowledgeAnswers = {};
    const mockAtt: AttitudeAnswers = {};
    const safeRes = calculateAllSurveyScores({
        sectionB: mockSDQ,
        sectionC: {
            items: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
            c10SadMostDays: 'khong',
            c11Difficulty: 'none',
            c12SuicideAttemptLifetime: 'khong',
        },
        sectionD: mockGAD,
        sectionE: { e1Lifetime: '1', e2PastYear: '1', e3Threat: '1', e4Likelihood: '0' },
        sectionF: mockLife,
        sectionG: mockKnow,
        sectionH: mockAtt,
    });
    assert.equal(safeRes.needsAttention, false);
    const flaggedRes = calculateAllSurveyScores({
        sectionB: mockSDQ,
        sectionC: {
            items: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1 }, // suicidal ideation
            c10SadMostDays: 'khong',
            c11Difficulty: 'none',
            c12SuicideAttemptLifetime: 'co',
        },
        sectionD: mockGAD,
        sectionE: { e1Lifetime: '4a', e2PastYear: '2', e3Threat: '1', e4Likelihood: '2' },
        sectionF: mockLife,
        sectionG: mockKnow,
        sectionH: mockAtt,
    });
    assert.equal(flaggedRes.needsAttention, true);
    assert.ok(flaggedRes.attentionReasons.length >= 2);
});
