export type LegacyAnswers = Record<string,string>;
export type LegacyQuestion = {id:string;text:string;subscale?:string;isReverse?:boolean;options:{id:string;text:string;score?:number}[]};
export type LegacyReceipt = {attemptId:string;scoreTotal:number;scoreLevel:string;scorePayload:Record<string,unknown>;suggestDass21:boolean};
export type LegacyDraft = {draftId:string|null;definitionDigest:string|null;revision:number;expiresAt:string;answers:LegacyAnswers;submitted:boolean;receipt?:LegacyReceipt;restartRequired?:'unversioned'|'version_changed'|'expired'};
export type LegacyWrite = {draftId:string;definitionDigest:string;revision:number;answers:LegacyAnswers};
