import crypto from 'node:crypto';
import type {PoolClient} from 'pg';
import { database } from './database.js';
import { validateSessionSecret } from './runtime-config.js';
export class RateLimitError extends Error { statusCode = 429; code = 'RATE_LIMITED'; constructor() { super('Quá nhiều yêu cầu. Vui lòng thử lại sau.'); } }
const bucketKey = (scope: string, owner: string) => `${scope}:${crypto.createHmac('sha256', validateSessionSecret()).update(owner).digest('hex')}`;
export async function checkLoginLimit(username: string) {
    const r = await database().query("SELECT requests FROM runtime_rate_limits WHERE bucket=$1 AND window_started>NOW()-INTERVAL '15 minutes'", [bucketKey('login', username)]);
    if (r.rows[0]?.requests >= 5) throw new RateLimitError();
}
// Callback runs under a row lock so concurrent password checks cannot overshoot the account limit.
export async function passwordAttempt<T>(username: string, verify: () => Promise<T | null>): Promise<T | null> {
    const client = await database().connect();
    try {
        await client.query('BEGIN'); const bucket = bucketKey('login', username);
        await client.query('INSERT INTO runtime_rate_limits(bucket,window_started) VALUES($1,NOW()) ON CONFLICT DO NOTHING', [bucket]);
        const r = await client.query("SELECT *,window_started<=NOW()-INTERVAL '15 minutes' AS expired FROM runtime_rate_limits WHERE bucket=$1 FOR UPDATE", [bucket]);
        const count = r.rows[0].expired ? 0 : r.rows[0].requests;
        if (count >= 5) throw new RateLimitError();
        const result = await verify();
        await client.query('UPDATE runtime_rate_limits SET requests=$2,window_started=CASE WHEN $3 THEN NOW() ELSE window_started END WHERE bucket=$1', [bucket, result ? 0 : count + 1, r.rows[0].expired]);
        await client.query('COMMIT'); return result;
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
export async function consumeRate(scope: 'otp' | 'chat', owner: string,transactionClient?:PoolClient) {
    const client = transactionClient??await database().connect(), bucket = bucketKey(scope, owner);
    const minutes = scope === 'otp' ? 15 : 1, limit = scope === 'otp' ? 3 : 20;
    try {
        if(!transactionClient)await client.query('BEGIN');
        await client.query('INSERT INTO runtime_rate_limits(bucket,window_started) VALUES($1,NOW()) ON CONFLICT DO NOTHING', [bucket]);
        const r = await client.query("SELECT *,window_started<=NOW()-($2::int*INTERVAL '1 minute') AS expired,last_sent_at>NOW()-INTERVAL '30 seconds' AS cooldown FROM runtime_rate_limits WHERE bucket=$1 FOR UPDATE", [bucket, minutes]);
        const row = r.rows[0], count = row.expired ? 0 : row.requests;
        if (count >= limit || (scope === 'otp' && row.cooldown)) throw new RateLimitError();
        await client.query('UPDATE runtime_rate_limits SET requests=$2,window_started=CASE WHEN $3 THEN NOW() ELSE window_started END,last_sent_at=NOW() WHERE bucket=$1', [bucket, count + 1, row.expired]);
        if(!transactionClient)await client.query('COMMIT');
    } catch (e) { if(!transactionClient)await client.query('ROLLBACK'); throw e; } finally { if(!transactionClient)client.release(); }
}
