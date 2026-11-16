import {APP_RELEASE} from '../shared/release.js';
import { database } from './database.js';
import { migrationDefinitions } from './migrate.js';
import { validateRuntime } from './runtime-config.js';
export const REQUIRED_SCHEMA_QUERIES = [
            'SELECT id,code,revision,expires_at,revoked_at FROM survey_invitations LIMIT 0',
            'SELECT ui_theme,ui_locale,preferences_revision,is_qa,qa_access_expires_at FROM auth_users LIMIT 0',
            'SELECT is_qa FROM org_schools LIMIT 0',
            'SELECT is_qa FROM test_templates LIMIT 0',
            'SELECT is_qa FROM test_attempts LIMIT 0',
            'SELECT operation_id,digest FROM deployment_receipts LIMIT 0',
            'SELECT teacher_distribution_enabled FROM survey_campaigns LIMIT 0',
            'SELECT jti,user_id,exp_at,revoked_at FROM auth_sessions LIMIT 0',
            'SELECT role,status,profile_school,profile_teacher_type FROM auth_users LIMIT 0',
            'SELECT otp_hash,attempts_left,consumed_at FROM auth_register_otps LIMIT 0',
            'SELECT otp_hash,attempts_left,consumed_at FROM auth_admin_login_otps LIMIT 0',
            'SELECT code_hash,school,used_count FROM class_join_codes LIMIT 0',
            'SELECT event_type,school FROM class_join_code_events LIMIT 0',
            'SELECT archived_at,created_by_user_id FROM test_templates LIMIT 0',
            'SELECT content,is_reverse FROM test_questions LIMIT 0', 'SELECT question_id,score FROM test_options LIMIT 0',
            'SELECT score_total,score_version,template_snapshot FROM test_attempts LIMIT 0',
            'SELECT version_number,snapshot FROM test_template_versions LIMIT 0',
            'SELECT definition,score_version FROM survey_definitions LIMIT 0',
            'SELECT consent_version,retention_days,policy_approved FROM survey_campaigns LIMIT 0',
            'SELECT token_hash,answers,revision,expires_at FROM survey_sessions LIMIT 0',
            'SELECT answers,score_version,definition_version,consent_version FROM survey_responses LIMIT 0',
            'SELECT read_raw,can_export FROM survey_grants LIMIT 0', 'SELECT actor_id,action FROM survey_audit LIMIT 0',
            'SELECT bucket,requests FROM survey_rate_limits LIMIT 0', 'SELECT answers,revision,expires_at FROM legacy_test_drafts LIMIT 0',
            'SELECT draft_id,definition_digest,submitted_at FROM legacy_test_drafts LIMIT 0', 'SELECT draft_id,definition_digest,answer_options FROM test_attempts LIMIT 0', 'SELECT requests,window_started,last_sent_at FROM runtime_rate_limits LIMIT 0','SELECT revision,credential_version,school_id,class_id FROM auth_users LIMIT 0','SELECT academic_year FROM org_classes LIMIT 0','SELECT payload,status,lease_until FROM account_email_outbox LIMIT 0','SELECT context_status,context_snapshot FROM test_attempts LIMIT 0'] as const;
export async function readiness(): Promise<{ ok: boolean; service: string; release:string; snapshotId?:string }> {
    try {
        validateRuntime(); const pool = database();
        const definitions = await migrationDefinitions(), ledger = await pool.query('SELECT name,checksum FROM schema_migrations');
        if (ledger.rows.length !== definitions.length || definitions.some(m => !ledger.rows.some(r => r.name === m.name && r.checksum === m.checksum))) throw new Error();
        for (const sql of REQUIRED_SCHEMA_QUERIES) await pool.query(sql);
        return { ok: true, service: 'silentstation-api', release:APP_RELEASE.version,...(/^[a-f0-9]{12}$/i.test(process.env.SS_SNAPSHOT_ID||'')?{snapshotId:process.env.SS_SNAPSHOT_ID}:{}) };
    } catch { return { ok: false, service: 'silentstation-api', release:APP_RELEASE.version,...(/^[a-f0-9]{12}$/i.test(process.env.SS_SNAPSHOT_ID||'')?{snapshotId:process.env.SS_SNAPSHOT_ID}:{}) }; }
}
export async function readyHandler(req: any, res: any) {
    res.setHeader('Cache-Control', 'no-store');
    if(req.method==='OPTIONS')return res.status(204).end();
    if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).json({ ok: false });
    const result = await readiness(); return res.status(result.ok ? 200 : 503).json(result);
}
