import { Pool } from 'pg';
import { databaseConfig } from './runtime-config.js';
let pool: Pool | undefined;
export function database() { return pool ??= new Pool(databaseConfig()); }
export async function closeDatabase() { if (pool) { await pool.end(); pool = undefined; } }
