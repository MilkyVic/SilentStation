import test from 'node:test';
import assert from 'node:assert/strict';
import {seedCoreTestFixtures} from './test-fixtures/core-tests.js';
import {CORE_TEMPLATES} from './test-fixtures/catalog.js';
import {SYSTEM_TEMPLATE_QUESTIONS} from './test-question-bank.js';

test('explicit core fixtures retain all six original banks, options, scores and reverse/subscale flags',async()=>{
    const calls:{sql:string;values:any[]}[]=[];
    await seedCoreTestFixtures({query:async(sql:string,values:any[]=[])=>{calls.push({sql,values});return {rows:[]};}} as any);
    const templates=calls.filter(c=>c.sql.startsWith('INSERT INTO test_templates'));
    const questions=calls.filter(c=>c.sql.startsWith('INSERT INTO test_questions'));
    const options=calls.filter(c=>c.sql.startsWith('INSERT INTO test_options'));
    assert.equal(templates.length,6);assert.equal(questions.length,111);assert.equal(options.length,512);
    for(const t of CORE_TEMPLATES) {
        assert.deepEqual(templates.find(c=>c.values[0]===t.id)?.values,[t.id,t.title,t.description,t.targetAudience,t.templateCode,true,true,t.displayOrder]);
        for(const q of SYSTEM_TEMPLATE_QUESTIONS[t.id]) {
            const id=`${t.id}-q${q.order}`;
            assert.deepEqual(questions.find(c=>c.values[0]===id)?.values,[id,t.id,q.order,q.text,q.subscale??'',!!q.isReverse]);
            for(const o of q.options) assert.deepEqual(options.find(c=>c.values[0]===`${id}-o${o.order}`)?.values,[`${id}-o${o.order}`,id,o.order,o.label,o.score]);
        }
    }
    assert.ok(calls.every(c=>! /UPDATE|DELETE|UPSERT|ON CONFLICT/i.test(c.sql)));
});
test('core fixture setup refuses existing banks before any insert, never overwrites',async()=>{
    const calls:string[]=[];
    await assert.rejects(seedCoreTestFixtures({query:async(sql:string)=>{calls.push(sql);return {rows:sql.startsWith('SELECT id')?[{id:'1'}]:[]};}} as any),/never overwrite/);
    assert.equal(calls.length,2);assert.ok(calls.every(sql=>!sql.startsWith('INSERT')));
});
