// QA is provenance, not an authorization role. Normal role/school/grant checks
// still apply. Expiry is enforced on requests, independently of maintenance.
export function qaAccessAllowed(account: {isQa?: boolean; qaAccessExpiresAt?: string | Date | null; is_qa?: boolean; qa_access_expires_at?: string | Date | null}, now = Date.now()) {
    if (!(account.isQa ?? account.is_qa)) return true;
    const deadline = account.qaAccessExpiresAt ?? account.qa_access_expires_at;
    return !!deadline && Number.isFinite(new Date(deadline).getTime()) && new Date(deadline).getTime() > now;
}
export function includeQa(value: unknown): boolean {
    if (value === undefined || value === false || value === 'false') return false;
    if (value === true || value === 'true') return true;
    throw new Error('INVALID_QA_FILTER');
}
export function canSuspendSuperadmin(targetIsQa: boolean, activeTotal: number, activeLive: number) {
    return activeTotal > 1 && (targetIsQa || activeLive > 1);
}
