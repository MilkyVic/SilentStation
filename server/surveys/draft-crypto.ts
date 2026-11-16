import crypto from 'node:crypto';
function key(token: string, campaignId: string, sessionId: string) { return Buffer.from(crypto.hkdfSync('sha256', token, campaignId, `survey-draft:${sessionId}`, 32)); }
export function encryptDraft(answers: unknown, token: string, campaignId: string, sessionId: string) { const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key(token, campaignId, sessionId), iv); cipher.setAAD(Buffer.from(`${campaignId}:${sessionId}`)); const data = Buffer.concat([cipher.update(JSON.stringify(answers), 'utf8'), cipher.final()]); return { v: 1, iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), data: data.toString('base64url') }; }
export function decryptDraft(envelope: any, token: string, campaignId: string, sessionId: string) { if (!envelope?.v) {
    if (envelope && typeof envelope === 'object' && !Object.keys(envelope).length)
        return {};
    throw new Error('Unencrypted persisted draft rejected.');
} const decipher = crypto.createDecipheriv('aes-256-gcm', key(token, campaignId, sessionId), Buffer.from(envelope.iv, 'base64url')); decipher.setAAD(Buffer.from(`${campaignId}:${sessionId}`)); decipher.setAuthTag(Buffer.from(envelope.tag, 'base64url')); return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64url')), decipher.final()]).toString('utf8')); }
