import type {PoolClient} from 'pg';
import {CORE_TEMPLATES} from './catalog.js';
import {SYSTEM_TEMPLATE_QUESTIONS} from '../test-question-bank.js';

// Explicit fixture setup only. The caller owns the test DB and its transaction;
// this module is excluded from the API runtime build and never runs on health/startup.
export async function seedCoreTestFixtures(client:PoolClient) {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:core-test-fixtures'))");
    const existing=await client.query('SELECT id FROM test_templates WHERE id=ANY($1::text[]) OR template_code=ANY($2::text[])', [CORE_TEMPLATES.map(t=>t.id),CORE_TEMPLATES.map(t=>t.templateCode)]);
    if(existing.rows.length) throw new Error('Core test fixtures already exist; never overwrite a bank or historical data.');
    for(const t of CORE_TEMPLATES) {
        const questions=SYSTEM_TEMPLATE_QUESTIONS[t.id];
        if(!questions?.length) throw new Error('Core test fixture bank is missing.');
        await client.query('INSERT INTO test_templates(id,title,description,target_audience,template_code,is_system,is_active,display_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [t.id,t.title,t.description,t.targetAudience,t.templateCode,t.isSystem,t.isActive,t.displayOrder]);
        for(const q of questions) {
            const id=`${t.id}-q${q.order}`;
            await client.query('INSERT INTO test_questions(id,template_id,question_order,content,subscale,is_reverse) VALUES($1,$2,$3,$4,$5,$6)', [id,t.id,q.order,q.text,q.subscale??'',!!q.isReverse]);
            for(const o of q.options) await client.query('INSERT INTO test_options(id,question_id,option_order,label,score) VALUES($1,$2,$3,$4,$5)', [`${id}-o${o.order}`,id,o.order,o.label,o.score]);
        }
    }
}
