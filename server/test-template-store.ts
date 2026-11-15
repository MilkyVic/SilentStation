import crypto from 'node:crypto';
import type { PoolClient } from 'pg';
import { AuthHttpError } from './auth-core.js';
export type EditableQuestion = {
    text: string;
    options: {
        text: string;
        score: number;
    }[];
};
export function validateQuestionList(input: unknown): EditableQuestion[] {
    if (!Array.isArray(input) || input.length > 300)
        throw new AuthHttpError(400, 'TEST_INVALID', 'Danh sách câu hỏi không hợp lệ.');
    return input.map(raw => {
        if (!raw || typeof raw.text !== 'string' || !raw.text.trim() || raw.text.length > 5000 || !Array.isArray(raw.options) || raw.options.length < 2 || raw.options.length > 12)
            throw new AuthHttpError(400, 'TEST_INVALID', 'Câu hỏi hoặc lựa chọn không hợp lệ.');
        return { text: raw.text.trim(), options: raw.options.map((option: any) => { if (!option || typeof option.text !== 'string' || !option.text.trim() || option.text.length > 1000 || !Number.isInteger(option.score) || option.score < -100 || option.score > 100)
                throw new AuthHttpError(400, 'TEST_INVALID', 'Điểm lựa chọn không hợp lệ.'); return { text: option.text.trim(), score: option.score }; }) };
    });
}
export async function replaceQuestions(client: PoolClient, id: string, questions: EditableQuestion[]) {
    await client.query('DELETE FROM test_questions WHERE template_id=$1', [id]);
    for (let i = 0; i < questions.length; i++) {
        const qid = crypto.randomUUID();
        await client.query('INSERT INTO test_questions(id,template_id,question_order,content) VALUES($1,$2,$3,$4)', [qid, id, i + 1, questions[i].text]);
        for (let j = 0; j < questions[i].options.length; j++) {
            const o = questions[i].options[j];
            await client.query('INSERT INTO test_options(id,question_id,option_order,label,score) VALUES($1,$2,$3,$4,$5)', [crypto.randomUUID(), qid, j + 1, o.text, o.score]);
        }
    }
}
export async function appendVersion(client: PoolClient, row: any, action: string, actorId: string) {
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [row.id]);
    const v = await client.query('SELECT COALESCE(MAX(version_number),0)+1 AS n FROM test_template_versions WHERE template_id=$1', [row.id]);
    const q = await client.query('SELECT q.question_order,q.content,q.subscale,q.is_reverse,o.option_order,o.label,o.score FROM test_questions q LEFT JOIN test_options o ON o.question_id=q.id WHERE q.template_id=$1 ORDER BY q.question_order,o.option_order', [row.id]);
    await client.query('INSERT INTO test_template_versions(id,template_id,version_number,action,actor_user_id,snapshot) VALUES($1,$2,$3,$4,$5,$6::jsonb)', [crypto.randomUUID(), row.id, v.rows[0].n, action, actorId, JSON.stringify({ template: row, questions: q.rows })]);
}
