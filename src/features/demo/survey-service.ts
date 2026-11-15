import { DEFINITION, DEFINITION_VERSION, CONSENT_VERSION, emptyAnswers, type Campaign, type Draft, type Answers, type SectionId, type Receipt, type SurveyRecord } from '../../../shared/surveys/contracts';
export const campaign: Campaign = { id: 'DEMO', code: 'DEMO', title: 'Một hành trình nhỏ để hiểu mình hơn', school: 'Đợt minh họa · không thu dữ liệu thật', status: 'open', isDemo: true, definitionVersion: DEFINITION_VERSION, consentVersion: CONSENT_VERSION, scoringApproved: false, policyApproved: false, retentionDays: null, permissions: { readRaw: true, export: false } };
let draft: Draft | undefined;
export const records: SurveyRecord[] = [];
export const demoSurvey = {
    campaign: async (code: string) => { if (code.toUpperCase() !== 'DEMO')
        throw new Error('Demo chỉ có mã đợt DEMO.'); return { campaign, definition: DEFINITION }; },
    start: async () => { draft ??= { answers: emptyAnswers(), reviewedSections: [], revision: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), submitted: false }; return structuredClone(draft); },
    load: async () => { if (!draft)
        throw new Error('Chưa có phiên demo.'); return structuredClone(draft); },
    save: async (_code: string, answers: Answers, reviewedSections: SectionId[], revision: number) => { if (!draft || draft.revision !== revision)
        throw new Error('Nháp demo đã thay đổi.'); draft = { ...draft, answers: structuredClone(answers), reviewedSections: [...reviewedSections], revision: revision + 1 }; return structuredClone(draft); },
    clear: async () => { draft = undefined; },
    submit: async () => { if (!draft)
        throw new Error('Chưa có nháp.'); if (draft.receipt)
        return draft.receipt; const receipt: Receipt = { responseId: `DEMO-${crypto.randomUUID()}`, savedAt: new Date().toISOString() }; draft = { ...draft, submitted: true, receipt }; records.unshift({ ...receipt, campaignId: 'DEMO', answers: structuredClone(draft.answers), reviewedSections: [...draft.reviewedSections], definitionVersion: DEFINITION_VERSION, scoreVersion: 'demo-unapproved', consentVersion: CONSENT_VERSION, scores: {} }); return receipt; },
    list: async () => [campaign],
    report: async () => ({ campaign, total: records.length, permissions: { readRaw: true, export: false }, responses: structuredClone(records), nextCursor: null }),
};
