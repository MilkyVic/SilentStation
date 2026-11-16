import fs from 'node:fs';
import type { PoolConfig } from 'pg';
type Env = Record<string, string | undefined>;
export function secretValue(name: string, env: Env = process.env): string | undefined {
    if (env[name] && env[`${name}_FILE`]) throw new Error(`Configure only ${name} or its file, not both.`);
    return env[`${name}_FILE`] ? fs.readFileSync(env[`${name}_FILE`]!, 'utf8').trim() : env[name];
}
export function validateSessionSecret(env: Env = process.env) {
    const secret = secretValue('AUTH_SESSION_SECRET', env) || 'dev-only-change-me';
    if (env.NODE_ENV === 'production' && (Buffer.byteLength(secret) < 32 || /change|placeholder|example|dev-only|your-|MY_/i.test(secret) || new Set(secret).size < 8))
        throw new Error('A strong project-specific AUTH_SESSION_SECRET is required.');
    return secret;
}
export function databaseConfig(env: Env = process.env): PoolConfig {
    const url = secretValue('DATABASE_URL', env);
    if (!url) throw new Error('DATABASE_URL is required.');
    let parsed: URL; try { parsed = new URL(url); } catch { throw new Error('Invalid database URL.'); }
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('Invalid database protocol.');
    if ([...parsed.searchParams.keys()].some(k => /^ssl/i.test(k) || k === 'uselibpqcompat')) throw new Error('SSL URL parameters are forbidden; configure DB_TLS_MODE explicitly.');
    const mode = env.DB_TLS_MODE || (env.NODE_ENV === 'production' ? 'verify-full' : 'disable');
    if (!['verify-full', 'disable'].includes(mode) || (env.NODE_ENV === 'production' && mode !== 'verify-full')) throw new Error('Production requires verified database TLS.');
    if (env.DB_TLS_CA_FILE && env.PGSSL_CA) throw new Error('Configure a single database CA source.');
    const ca = env.DB_TLS_CA_FILE ? fs.readFileSync(env.DB_TLS_CA_FILE, 'utf8') : env.PGSSL_CA;
    return { connectionString: url, max: 5, connectionTimeoutMillis: 5000, query_timeout: 15000, statement_timeout: 15000,
        application_name: 'silentstation', ssl: mode === 'verify-full' ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) } : false };
}
export function validateRuntime(env: Env = process.env) {
    validateSessionSecret(env); databaseConfig(env);
    if (env.NODE_ENV === 'production') {
        for (const name of ['APP_URL', 'AUTH_API_CORS_ORIGIN']) {
            try { const origin=new URL(env[name] || ''); if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error(); }
            catch { throw new Error(`${name} must be an explicit HTTPS origin in production.`); }
        }
    }
}
export function smtpConfig(env: Env = process.env): any | null {
    if (env.AUTH_SMTP_HOST) {
        const secure = env.AUTH_SMTP_SECURE === 'true', port = Number(env.AUTH_SMTP_PORT || (secure ? 465 : 587));
        if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid SMTP port.');
        const user = secretValue('AUTH_SMTP_USER', env), pass = secretValue('AUTH_SMTP_PASSWORD', env);
        if (!!user !== !!pass) throw new Error('SMTP authentication requires both user and password.');
        return { host: env.AUTH_SMTP_HOST, port, secure, requireTLS: !secure,
            connectionTimeout: 5000, socketTimeout: 15000,
            tls: { rejectUnauthorized: true, ...(env.AUTH_SMTP_CA_FILE ? { ca: fs.readFileSync(env.AUTH_SMTP_CA_FILE, 'utf8') } : {}) },
            ...(user ? { auth: { user, pass } } : {}) };
    }
    const user = secretValue('AUTH_GMAIL_SMTP_USER', env), pass = secretValue('AUTH_GMAIL_SMTP_APP_PASSWORD', env);
    return user && pass ? { service: 'gmail', auth: { user, pass }, connectionTimeout: 5000, socketTimeout: 15000, tls: { rejectUnauthorized: true } } : null;
}

export function configuredCorsOrigin(env:Env=process.env){const value=env.AUTH_API_CORS_ORIGIN||'*';if(value==='*'){if(env.NODE_ENV==='production')throw Error('Explicit production CORS origin required.');return value;}const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.pathname!=='/'||u.search||u.hash||env.NODE_ENV==='production'&&u.protocol!=='https:')throw Error('Invalid CORS origin.');return u.origin;}
