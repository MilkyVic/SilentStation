import {MaintenanceBudget,CLEANUP_LIMIT,MAIL_LIMIT} from '../maintenance-budget.js';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import type { PoolClient } from 'pg';
import { database } from '../database.js';
import { smtpConfig, validateSessionSecret } from '../runtime-config.js';
const key = () => crypto.createHash('sha256').update('silentstation:account-outbox:v1\0' + validateSessionSecret()).digest();
export function seal(value: unknown,context='outbox-v1') { const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key(), iv); cipher.setAAD(Buffer.from(context));
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]); return { v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') }; }
export function unseal(p: any,context='outbox-v1') { if (p?.v !== 1)
    throw new Error('Unsupported encrypted mail'); const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(p.iv, 'base64')); decipher.setAAD(Buffer.from(context));
    decipher.setAuthTag(Buffer.from(p.tag, 'base64')); return JSON.parse(Buffer.concat([decipher.update(Buffer.from(p.ciphertext, 'base64')), decipher.final()]).toString()); }
export function emailAvailable() { return !!smtpConfig() || process.env.NODE_ENV === 'test' && process.env.AUTH_ACCOUNT_OTP_EXPOSE_DEV_CODE === 'true'; }
export async function enqueue(c: PoolClient, to: string, subject: string, body: string, challenge: string | null = null) { await c.query('INSERT INTO account_email_outbox(id,challenge_id,payload,expires_at) VALUES($1,$2,$3::jsonb,NOW()+($4::int*INTERVAL \'1 minute\'))', [crypto.randomUUID(), challenge, JSON.stringify(seal({ to, subject, text: body })), challenge ? 10 : 1440]); }
// Leases prevent two workers from acknowledging each other's delivery. SMTP is at-least-once;
// retries send the same challenge, never create additional OTPs. No mail content is logged.
export async function drainEmailOutbox(send?: (mail: any) => Promise<void>,options:{budgetMs?:number;maxMessages?:number;sendTimeoutMs?:number}={}) {
    const budget=new MaintenanceBudget(options.budgetMs),config=smtpConfig(),limit=Math.min(MAIL_LIMIT,Math.max(0,options.maxMessages??MAIL_LIMIT));
    const transport=send||!config?null:nodemailer.createTransport({...config,connectionTimeout:2500,greetingTimeout:2500,socketTimeout:4500});
    let sent=0,failed=0,uncertain=0,cleaned=0,processed=0;const cleanup=await database().connect();
    try{await budget.query(cleanup,'BEGIN');await budget.query(cleanup,"SET LOCAL statement_timeout='2s'");
      const r=await budget.query(cleanup,`WITH picked AS (SELECT id FROM account_email_outbox WHERE payload IS NOT NULL AND (expires_at<=NOW() OR challenge_id IN (SELECT id FROM account_challenges WHERE consumed_at IS NOT NULL OR expires_at<=NOW()) OR (status='processing' AND attempts>=3 AND lease_until<=NOW())) ORDER BY expires_at,id FOR UPDATE SKIP LOCKED LIMIT $1) UPDATE account_email_outbox o SET payload=NULL,status='failed',lease_id=NULL,lease_until=NULL FROM picked p WHERE o.id=p.id`,[CLEANUP_LIMIT]);cleaned+=r.rowCount;
      const left=CLEANUP_LIMIT-cleaned;if(left>0){const r=await budget.query(cleanup,`WITH picked AS (SELECT actor_id,request_id FROM account_receipts WHERE expires_at<=NOW() ORDER BY expires_at FOR UPDATE SKIP LOCKED LIMIT $1) DELETE FROM account_receipts r USING picked p WHERE r.actor_id=p.actor_id AND r.request_id=p.request_id`,[left]);cleaned+=r.rowCount;}
      if(cleaned<CLEANUP_LIMIT){const r=await budget.query(cleanup,`WITH picked AS (SELECT id FROM account_reauth WHERE expires_at<=NOW() ORDER BY expires_at FOR UPDATE SKIP LOCKED LIMIT $1) DELETE FROM account_reauth r USING picked p WHERE r.id=p.id`,[CLEANUP_LIMIT-cleaned]);cleaned+=r.rowCount;}
      await budget.query(cleanup,'COMMIT');
    }catch(e){await cleanup.query('ROLLBACK').catch(()=>{});throw e;}finally{cleanup.release();}
    try{for(let n=0;n<limit&&(send||transport)&&budget.enough(9000);n++){
      const c=await database().connect();let row:any;const lease=crypto.randomUUID();
      try{await budget.query(c,'BEGIN');await budget.query(c,"SET LOCAL statement_timeout='2s'");row=(await budget.query(c,`SELECT * FROM account_email_outbox WHERE payload IS NOT NULL AND attempts<3 AND expires_at>NOW() AND (challenge_id IS NULL OR EXISTS(SELECT 1 FROM account_challenges ch WHERE ch.id=challenge_id AND ch.consumed_at IS NULL AND ch.expires_at>NOW())) AND ((status='pending' AND next_at<=NOW()) OR (status='processing' AND lease_until<=NOW())) ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT 1`)).rows[0];
       if(row)await budget.query(c,"UPDATE account_email_outbox SET status='processing',attempts=attempts+1,lease_id=$2,lease_until=NOW()+INTERVAL '60 seconds' WHERE id=$1",[row.id,lease]);await budget.query(c,'COMMIT');
      }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}if(!row)break;processed++;
      const abort=new AbortController();const timeout=Math.min(6000,options.sendTimeoutMs??6000,budget.remaining()-3000);let timer:ReturnType<typeof setTimeout>;
      try{const mail=unseal(row.payload),delivery=send?send(mail):transport!.sendMail({...mail,from:process.env.AUTH_EMAIL_FROM||'no-reply@tram-an.vn',signal:abort.signal});
       await Promise.race([delivery,new Promise<never>((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('Mail delivery uncertain'));},timeout);})]);
       // SMTP may have accepted mail before an ACK is lost. Only the matching lease can acknowledge.
       const ack=await budget.query(database(),"UPDATE account_email_outbox SET status='sent',payload=NULL,lease_id=NULL,lease_until=NULL WHERE id=$1 AND lease_id=$2",[row.id,lease]);if(ack.rowCount)sent++;else uncertain++;
      }catch{
       if(abort.signal.aborted||!budget.enough(2500)){uncertain++;}
       else{await budget.query(database(),"UPDATE account_email_outbox SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'pending' END,payload=CASE WHEN attempts>=3 THEN NULL ELSE payload END,next_at=NOW()+INTERVAL '1 minute',lease_id=NULL,lease_until=NULL WHERE id=$1 AND lease_id=$2",[row.id,lease]);failed++;}
      }finally{clearTimeout(timer!);abort.abort();}
    }}finally{transport?.close();}
    return {available:!!(config||send),sent,failed,uncertain,processed,cleaned,budgetExhausted:!budget.enough(9000),batchLimit:limit};
}
