import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreDass21, scoreGad7, scorePhq9, shouldSuggestDass21ByCoreTest } from './engine.js';
test('scorePhq9 returns correct level and support recommendation', () => {
    const result = scorePhq9([2, 2, 2, 2, 2, 1, 1, 0, 0]); // total 12
    assert.equal(result.total, 12);
    assert.equal(result.level, 'Trầm cảm nhẹ');
    assert.equal(result.shouldRecommendSupport, true);
});
test('scoreGad7 returns severe level', () => {
    const result = scoreGad7([3, 3, 2, 2, 2, 2, 2]); // total 16
    assert.equal(result.total, 16);
    assert.equal(result.level, 'Lo âu nặng');
    assert.equal(result.shouldRecommendSupport, true);
});
test('scoreDass21 computes 3 subscales with x2 multiplier', () => {
    const answers = new Array(21).fill(0);
    // Stress items: 1, 6, 8, 11, 12, 14, 18
    [1, 6, 8, 11, 12, 14, 18].forEach((index) => {
        answers[index - 1] = 1;
    });
    const result = scoreDass21(answers);
    assert.equal(result.stress.score, 14);
    assert.equal(result.stress.level, 'Bình thường');
    assert.equal(result.anxiety.score, 0);
    assert.equal(result.depression.score, 0);
});
test('shouldSuggestDass21ByCoreTest only for core tests with score >= 10', () => {
    assert.equal(shouldSuggestDass21ByCoreTest('1', 10), true);
    assert.equal(shouldSuggestDass21ByCoreTest('4', 15), true);
    assert.equal(shouldSuggestDass21ByCoreTest('5', 20), false);
    assert.equal(shouldSuggestDass21ByCoreTest('9', 20), false);
    assert.equal(shouldSuggestDass21ByCoreTest('2', 9), false);
});
