import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFINITION, emptyAnswers, validateAnswers, validateSections, countAnswers, DRAFT_TTL_MS, type Answers } from '../../shared/surveys/contracts.js';
import { scoreSurvey } from './scoring.js';
import { legacyArithmetic } from '../test-scoring/legacy-arithmetic.js';
import { validateQuestionList } from '../test-template-store.js';
test('A–J definition has unique stable codes and no published answer key', () => { assert.equal(DEFINITION.sections.length, 10); assert.equal(DEFINITION.questions.length, 155); assert.equal(new Set(DEFINITION.questions.map(q => q.code)).size, 155); assert.equal(DRAFT_TTL_MS, 86400000); assert.ok(!JSON.stringify(DEFINITION).includes('KNOWLEDGE_ANSWER_KEY')); });
test('empty and all-skipped surveys are insufficient, never normal', () => { for (const answers of [emptyAnswers(), Object.fromEntries(DEFINITION.questions.map(q => [q.code, { status: 'skipped' }]))]) {
    const scores = scoreSurvey(answers as Answers, true);
    assert.ok(Object.values(scores).every(s => s.status === 'insufficient_data'));
} });
test('K, unknown knowledge and SBQ-R raw codes remain distinct from skipped', () => { const a = validateAnswers({ 'I.1': { status: 'answered', value: 'K' }, 'G.1': { status: 'answered', value: 'khong_biet' }, 'E.e1': { status: 'answered', value: '3b' }, 'B.1': { status: 'skipped' } }); assert.deepEqual(a['I.1'], { status: 'answered', value: 'K' }); assert.deepEqual(a['E.e1'], { status: 'answered', value: '3b' }); assert.equal(countAnswers(a).answered, 3); assert.equal(countAnswers(a).skipped, 1); });
for (const [name, payload] of Object.entries({ range: { 'C.1': { status: 'answered', value: 99 } }, coercion: { 'B.1': { status: 'answered', value: '1' } }, unknownQuestion: { user_id: { status: 'answered', value: 'x' } }, skipValue: { 'B.1': { status: 'skipped', value: 0 } }, nan: { 'B.1': { status: 'answered', value: NaN } }, longText: { 'J.1': { status: 'answered', value: 'x'.repeat(2001) } } }))
    test(`validation rejects ${name}`, () => assert.throws(() => validateAnswers(payload)));
test('complete arithmetic has provenance but unapproved rules stay unapproved', () => { const a = emptyAnswers(); for (const q of DEFINITION.questions.filter(q => q.section === 'D'))
    a[q.code] = { status: 'answered', value: 2 }; assert.equal(scoreSurvey(a).D.status, 'unapproved'); const s = scoreSurvey(a, true).D; assert.equal(s.status, 'computed'); if (s.status === 'computed')
    assert.equal(s.total, 14); assert.equal(scoreSurvey(a, true).C.status, 'insufficient_data'); });
test('section review is deduplicated and invalid IDs rejected', () => { assert.deepEqual(validateSections(['A', 'A', 'J']), ['A', 'J']); assert.throws(() => validateSections(['X'])); });
test('legacy SDQ reversals, MT mean and MBI subscales are arithmetic only', () => { assert.equal(legacyArithmetic('SDQ25', new Array(25).fill(0)).total, 10); assert.equal(legacyArithmetic('MT', new Array(27).fill(1)).total, 1.59); assert.deepEqual(legacyArithmetic('MBI22', new Array(22).fill(1)).subscales, { EE: 9, DP: 5, PA: 8 }); });
test('template questions require real options and integer score values', () => { assert.throws(() => validateQuestionList([{ text: '?', options: [{ text: 'only', score: 1 }] }])); assert.throws(() => validateQuestionList([{ text: '?', options: [{ text: 'a', score: 1.1 }, { text: 'b', score: 2 }] }])); assert.equal(validateQuestionList([{ text: '?', options: [{ text: 'a', score: 0 }, { text: 'b', score: 1 }] }]).length, 1); });
import { encryptDraft, decryptDraft } from './draft-crypto.js';
test('draft ciphertext cannot be decrypted with another token/campaign/session', () => { const encrypted = encryptDraft({ 'J.1': { status: 'answered', value: 'fictional-note' } }, 'token-a', 'campaign-a', 'session-a'); assert.ok(!JSON.stringify(encrypted).includes('fictional-note')); assert.deepEqual(decryptDraft(encrypted, 'token-a', 'campaign-a', 'session-a'), { 'J.1': { status: 'answered', value: 'fictional-note' } }); assert.throws(() => decryptDraft(encrypted, 'token-b', 'campaign-a', 'session-a')); assert.throws(() => decryptDraft(encrypted, 'token-a', 'campaign-b', 'session-a')); assert.throws(() => decryptDraft(encrypted, 'token-a', 'campaign-a', 'session-b')); });

import {getSurveyRelease,getSurveyDefinition} from '../../shared/surveys/releases.js';
import {DEFINITION_VERSION,CONSENT_VERSION} from '../../shared/surveys/contracts.js';
import {APP_RELEASE} from '../../shared/release.js';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import SurveyPrint from '../../src/features/survey/SurveyPrint.js';
test('official v1 software release preserves the immutable historical question content',()=>{
 assert.equal(APP_RELEASE.version,'1.1.0');assert.equal(DEFINITION_VERSION,'student-mental-health-v1');assert.equal(CONSENT_VERSION,'survey-consent-v1');
 assert.equal(getSurveyRelease(DEFINITION_VERSION)?.channel,'official');const old=getSurveyDefinition('student-mental-health-v1-draft')!;
 assert.equal(getSurveyRelease(old.version)?.channel,'historical');assert.deepEqual(old.questions,DEFINITION.questions);assert.deepEqual(old.sections,DEFINITION.sections);assert.equal(old.consentVersion,'survey-consent-v1-draft');
 assert.equal(getSurveyDefinition('unknown-version'),undefined);assert.equal(getSurveyDefinition('__proto__'),undefined);
});
test('printing uses the recorded version and never substitutes an unsupported one',()=>{
 const fresh=renderToStaticMarkup(React.createElement(SurveyPrint));assert.ok(fresh.includes('Phiên bản chính thức 1.0'));assert.ok(!fresh.includes('Phiên bản dự thảo'));
 const record:any={responseId:'fixture',savedAt:'2026-11-15T00:00:00Z',campaignId:'fixture',definitionVersion:'student-mental-health-v1-draft',scoreVersion:'survey-arithmetic-v1',consentVersion:'survey-consent-v1-draft',answers:{},reviewedSections:[],scores:{}};
 const historical=renderToStaticMarkup(React.createElement(SurveyPrint,{record}));assert.ok(historical.includes('student-mental-health-v1-draft'));assert.ok(historical.includes('B25.'));assert.ok(historical.includes('J4.'));
 const unsupported=renderToStaticMarkup(React.createElement(SurveyPrint,{record:{...record,definitionVersion:'unknown-version'}}));assert.ok(unsupported.includes('Không hỗ trợ in phiên bản này'));assert.ok(!unsupported.includes('B25.'));
});
