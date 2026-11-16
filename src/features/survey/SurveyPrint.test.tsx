import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DEFINITION,type SurveyRecord} from '../../../shared/surveys/contracts.js';
import SurveyPrint from './SurveyPrint.js';
import AudienceBadge from '../../components/tests/AudienceBadge.js';
const record:SurveyRecord={responseId:'synthetic',campaignId:'synthetic',savedAt:'2026-11-15T00:00:00Z',definitionVersion:DEFINITION.version,scoreVersion:'survey-arithmetic-v1',consentVersion:DEFINITION.consentVersion,answers:{},reviewedSections:[],scores:{}};
test('print has 155 human-facing labels and 10 sections without internal codes in visible text',()=>{
 const html=renderToStaticMarkup(<SurveyPrint/>),text=html.replace(/<[^>]*>/g,'');
 assert.equal((html.match(/data-question-code=/g)||[]).length,155);assert.equal((html.match(/data-print-section=/g)||[]).length,10);
 assert.ok(text.includes('A1.'));assert.ok(text.includes('I14.'));assert.ok(text.includes('J4.'));assert.ok(!text.includes('A.birthYear'));assert.ok(!text.includes('c10SadMostDays'));
 assert.equal((html.match(/class="print-matrix"/g)||[]).length,7);assert.equal((html.match(/class="print-writing-lines"/g)||[]).length,6);
 for(const q of DEFINITION.questions){assert.ok(html.includes(`data-question-code="${q.code}"`));}
});
test('print preserves selected raw options, skipped/unanswered and multiline text',()=>{
 const answers:SurveyRecord['answers']={'B.1':{status:'answered',value:2},'B.2':{status:'skipped'},'I.1':{status:'answered',value:'K'},'G.1':{status:'answered',value:'khong_biet'},'E.e1':{status:'answered',value:'3b'},'J.1':{status:'answered',value:'Dòng một\nDòng hai'}};
 const html=renderToStaticMarkup(<SurveyPrint record={{...record,answers}}/>);
 assert.equal((html.match(/print-mark is-selected/g)||[]).length,4);assert.ok(html.includes('Bỏ qua'));assert.ok(html.includes('Chưa trả lời'));assert.ok(html.includes('Dòng một\nDòng hai'));assert.ok(html.includes('3a. '));assert.ok(html.includes('3b. '));assert.ok(html.includes('4a. '));assert.ok(html.includes('4b. '));
 assert.ok(html.includes('>K</th>'));assert.ok(!html.includes('print-writing-lines'));
});
test('audience badge supports all labels without opacity utility or absolute positioning',()=>{
 for(const [audience,label] of [['Học sinh','Học sinh'],['Giáo viên','Giáo viên'],['Cả hai','Giáo viên, Học sinh']]){
  const html=renderToStaticMarkup(<AudienceBadge audience={audience}/>);assert.ok(html.includes(label));assert.ok(html.includes('test-audience-badge'));assert.ok(!html.includes('absolute'));assert.ok(!html.includes('bg-brand-primary'));
 }
});
