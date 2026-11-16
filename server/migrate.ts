import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { database, closeDatabase } from './database.js';
import type { PoolClient } from 'pg';
export const MIGRATION_FILES = ['001_auth_schema.sql', '002_test_schema.sql', '003_survey_schema.sql', '004_legacy_versions.sql', '005_runtime_hardening.sql','006_legacy_draft_identity.sql','007_account_management.sql','008_survey_invitations_preferences.sql'];
export type Migration = { name: string; sql: string; checksum: string };
export async function migrationDefinitions(): Promise<Migration[]> {
    return Promise.all(MIGRATION_FILES.map(async name => { const sql = (await fs.readFile(path.resolve('server/sql', name), 'utf8')).replace(/^\uFEFF/, ''); return { name, sql, checksum: crypto.createHash('sha256').update(sql).digest('hex') }; }));
}
// Explicit legacy baseline checks against a transactional reference schema, including columns and constraints.
async function verifyBaseline(client: PoolClient, definitions: Migration[]) {
    const schema = `ss_baseline_${crypto.randomBytes(6).toString('hex')}`;
    await client.query(`CREATE SCHEMA ${schema}`); await client.query(`SET LOCAL search_path TO ${schema}`);
    for (const m of definitions.slice(0, 2)) await client.query(m.sql);
    const columns = await client.query(`SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema=$1 ORDER BY table_name,ordinal_position`, [schema]);
    const actual = await client.query(`SELECT table_name,column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1::text[]) ORDER BY table_name,ordinal_position`, [[...new Set(columns.rows.map(r => r.table_name))]]);
    const constraints = async (s: string) => (await client.query("SELECT c.relname AS table_name,pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=ANY($2::text[]) ORDER BY 1,2", [s, [...new Set(columns.rows.map(r => r.table_name))]])).rows;
    const expectedConstraints = await constraints(schema);
    const indexes=async(s:string)=>(await client.query("SELECT c.relname AS table_name,i.relname AS name,k.indisunique,k.indisprimary,pg_get_indexdef(i.oid) AS definition FROM pg_index k JOIN pg_class c ON c.oid=k.indrelid JOIN pg_class i ON i.oid=k.indexrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=ANY($2::text[]) ORDER BY 1,2",[s,[...new Set(columns.rows.map(r=>r.table_name))]])).rows.map(r=>({...r,definition:r.definition.replaceAll(s+'.','')}));
    const expectedIndexes=await indexes(schema);
    await client.query('SET LOCAL search_path TO public');
    if (JSON.stringify(columns.rows) !== JSON.stringify(actual.rows) || JSON.stringify(expectedConstraints) !== JSON.stringify(await constraints('public')) || JSON.stringify(expectedIndexes)!==JSON.stringify(await indexes('public'))) throw new Error('Legacy baseline schema does not match migrations 001/002.');
    await client.query(`DROP SCHEMA ${schema} CASCADE`);
}
export async function migrate(options: { baselineThrough?: string; definitions?: Migration[] } = {}) {
    const definitions = options.definitions ?? await migrationDefinitions(), client = await database().connect();
    try {
        await client.query('BEGIN'); await client.query("SELECT pg_advisory_xact_lock(hashtext('silentstation:migrations'))");
        const prior = await client.query("SELECT to_regclass('public.schema_migrations') AS ledger");
        if (!prior.rows[0].ledger) {
            const existing = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
            if (existing.rows.length) {
                if (options.baselineThrough !== '002_test_schema.sql') throw new Error('Existing schema requires an explicitly verified baseline; automatic adoption is refused.');
                await verifyBaseline(client, definitions);
                const expected = definitions.slice(0, 2).flatMap(m => [...m.sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map(x => x[1]));
                if (existing.rows.some(r => !expected.includes(r.table_name))) throw new Error('Unknown tables in baseline.');
            } else if (options.baselineThrough) throw new Error('Baseline requires an existing legacy schema.');
        } else if (options.baselineThrough) throw new Error('A ledger already exists; baseline refused.');
        await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY,checksum TEXT NOT NULL,baselined BOOLEAN NOT NULL DEFAULT FALSE,applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
        if (options.baselineThrough) for (const m of definitions.slice(0, 2)) await client.query('INSERT INTO schema_migrations(name,checksum,baselined) VALUES($1,$2,TRUE)', [m.name, m.checksum]);
        const applied = (await client.query('SELECT name,checksum FROM schema_migrations')).rows;
        if (applied.some(r => !definitions.some(m => m.name === r.name && m.checksum === r.checksum))) throw new Error('Migration checksum or release mismatch.');
        for (const m of definitions) if (!applied.some(r => r.name === m.name)) { await client.query(m.sql); await client.query('INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)', [m.name, m.checksum]); }
        await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
    if (process.env.MIGRATION_CONFIRM !== 'yes') throw new Error('Explicit MIGRATION_CONFIRM=yes is required.');
    migrate({ baselineThrough: process.env.MIGRATION_BASELINE_THROUGH }).then(() => console.info('Explicit migrations applied.')).catch(() => { console.error('Migration refused/failed; database unchanged by this transaction.'); process.exitCode = 1; }).finally(closeDatabase);
}
