import {database} from '../database.js';
import {MaintenanceBudget,CLEANUP_LIMIT} from '../maintenance-budget.js';
// Authorization/expiry is enforced on requests; this bounded job only clears expired ciphertext/counters.
export async function expireDrafts(options:{budgetMs?:number}={}){
 const b=new MaintenanceBudget(options.budgetMs),c=await database().connect();let cleaned=0;
 try{await b.query(c,'BEGIN');await b.query(c,"SET LOCAL statement_timeout='2s'");
 const queries=[
  `WITH picked AS (SELECT id FROM survey_sessions WHERE expires_at<=NOW() AND (answers<>'{}'::jsonb OR reviewed_sections<>'[]'::jsonb) ORDER BY expires_at,id FOR UPDATE SKIP LOCKED LIMIT $1) UPDATE survey_sessions s SET answers='{}'::jsonb,reviewed_sections='[]'::jsonb FROM picked p WHERE s.id=p.id`,
  `WITH picked AS (SELECT user_id,template_id FROM legacy_test_drafts WHERE expires_at<=NOW() AND answers<>'{}'::jsonb ORDER BY expires_at FOR UPDATE SKIP LOCKED LIMIT $1) UPDATE legacy_test_drafts d SET answers='{}'::jsonb FROM picked p WHERE d.user_id=p.user_id AND d.template_id=p.template_id`,
  `WITH picked AS (SELECT bucket FROM runtime_rate_limits WHERE window_started<NOW()-INTERVAL '1 day' ORDER BY window_started FOR UPDATE SKIP LOCKED LIMIT $1) DELETE FROM runtime_rate_limits r USING picked p WHERE r.bucket=p.bucket`,
  `WITH picked AS (SELECT bucket,minute FROM survey_rate_limits WHERE minute<NOW()-INTERVAL '1 day' ORDER BY minute FOR UPDATE SKIP LOCKED LIMIT $1) DELETE FROM survey_rate_limits r USING picked p WHERE r.bucket=p.bucket AND r.minute=p.minute`];
 for(const q of queries){if(cleaned>=CLEANUP_LIMIT||!b.enough())break;cleaned+=(await b.query(c,q,[CLEANUP_LIMIT-cleaned])).rowCount;}
 await b.query(c,'COMMIT');return {cleaned,batchLimit:CLEANUP_LIMIT,budgetExhausted:!b.enough()};
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}
}
