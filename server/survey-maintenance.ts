import crypto from 'node:crypto';
import { secretValue } from './runtime-config.js';
import { expireDrafts } from './surveys/maintenance.js';
export async function maintenanceHandler(req: any, res: any) {
    const secret = secretValue('CRON_SECRET');
    if (!secret || secret.length < 32)
        return res.status(503).json({ ok: false, error: { code: 'MAINTENANCE_DISABLED', message: 'Chưa cấu hình bảo trì trong project này.' } });
    const supplied = String(req.headers?.authorization || '').replace(/^Bearer /, '');
    const expected = Buffer.from(secret), actual = Buffer.from(supplied);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected))
        return res.status(401).json({ ok: false });
    await expireDrafts();
    return res.json({ ok: true });
}
