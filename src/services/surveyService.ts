import {uiError} from '../features/preferences/ui';
import type {InvitationEntry} from '../../shared/survey-invitations';
import type { Answers, Campaign, Definition, Draft, Receipt, SectionId, SurveyRecord } from '../../shared/surveys/contracts';
export const DEMO_MODE = import.meta.env.MODE === 'demo';
export class SurveyClientError extends Error {
    constructor(public code: string, message: string) { super(uiError(code,message)); }
}
async function call<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`/api/surveys${path}`, { method, credentials: 'include',signal:AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    }
    catch {
        throw new SurveyClientError('NETWORK_ERROR', 'Không kết nối được dịch vụ. Dữ liệu chưa được xác nhận lưu; vui lòng thử lại.');
    }
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok)
        throw new SurveyClientError(data?.error?.code ?? 'SURVEY_SERVER_ERROR', data?.error?.message ?? 'Dịch vụ khảo sát chưa sẵn sàng.');
    return data as T;
}
const demo = async () => (await import('../features/demo/survey-service')).demoSurvey;
const path = (code: string) => `/campaigns/${encodeURIComponent(code)}`;
export const surveyService = {
    async campaign(code: string): Promise<{
        campaign: Campaign;
        definition: Definition;
    }> { return DEMO_MODE ? (await demo()).campaign(code) : call(path(code)); },
    async invitation(code:string){return call<InvitationEntry>(`/invitations/${encodeURIComponent(code)}`);},
    async start(code: string, consentVersion: string, invitationCode?:string): Promise<Draft> { if (DEMO_MODE)
        return (await demo()).start(); return (await call<{
        draft: Draft;
    }>(`${path(code)}/session`, 'POST', { consent: true, consentVersion,...(invitationCode?{invitationCode}:{}) })).draft; },
    async load(code: string): Promise<Draft> { if (DEMO_MODE)
        return (await demo()).load(); return (await call<{
        draft: Draft;
    }>(`${path(code)}/draft`)).draft; },
    async save(code: string, answers: Answers, reviewedSections: SectionId[], revision: number): Promise<Draft> { if (DEMO_MODE)
        return (await demo()).save(code, answers, reviewedSections, revision); return (await call<{
        draft: Draft;
    }>(`${path(code)}/draft`, 'PUT', { answers, reviewedSections, revision })).draft; },
    async clear(code: string) { if (DEMO_MODE)
        return (await demo()).clear(); await call(`${path(code)}/draft`, 'DELETE'); },
    async submit(code: string, revision: number, idempotencyKey: string): Promise<Receipt> { if (DEMO_MODE)
        return (await demo()).submit(); return (await call<{
        receipt: Receipt;
    }>(`${path(code)}/submit`, 'POST', { revision, idempotencyKey })).receipt; },
    async list(): Promise<Campaign[]> { if (DEMO_MODE)
        return (await demo()).list(); return (await call<{
        campaigns: Campaign[];
    }>('/admin/campaigns')).campaigns; },
    async create(title: string, school: string, isDemo: boolean) { if (DEMO_MODE)
        throw new Error('Tạo đợt cần bản kết nối backend, không dùng chế độ mô phỏng.'); return call<{
        campaign: Campaign;
    }>('/admin/campaigns', 'POST', { title, school, isDemo }); },
    async update(id: string, changes: unknown) { if (DEMO_MODE)
        throw new Error('Thao tác cấu hình cần backend.'); return call<{
        campaign: Campaign;
    }>(`/admin/campaigns/${id}`, 'PATCH', changes); },
    async grants(id: string) { return call<{
        grants: {
            userId: string;
            readRaw: boolean;
            export: boolean;name?:string;role?:string;school?:string;status?:string;
        }[];
    }>(`/admin/campaigns/${id}/grants`); },
    async candidates(id:string,q=''){return call<{candidates:{id:string;name:string;role:string;school:string}[]}>(`/admin/campaigns/${id}/grant-candidates?q=${encodeURIComponent(q)}`);},
    async grant(id: string, userId: string, readRaw: boolean, canExport: boolean) { if (DEMO_MODE)
        throw new Error('Demo không cấp quyền thật.'); return call(`/admin/campaigns/${id}/grants`, 'PUT', { userId, readRaw, export: canExport }); },
    async report(id: string, before = ''): Promise<{
        campaign: Campaign;
        total: number;
        collection?: {serverEnabled:boolean;releaseChannel:'official'|'historical'|'unsupported'};
        permissions: {
            readRaw: boolean;
            export: boolean;
        };
        responses: SurveyRecord[];
        nextCursor: string | null;
    }> { if (DEMO_MODE)
        return (await demo()).report(); return call(`/admin/campaigns/${id}/report${before ? `?before=${encodeURIComponent(before)}` : ''}`); },
    async exportCsv(id: string) { const response = await fetch(`/api/surveys/admin/campaigns/${id}/export`, { credentials: 'include' }); if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error?.message ?? 'Không có quyền export.');
    } const url = URL.createObjectURL(await response.blob()); const a = document.createElement('a'); a.href = url; a.download = `survey-${id}.csv`; a.click(); URL.revokeObjectURL(url); },
};
