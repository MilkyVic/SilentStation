import type {Campaign,Definition,Draft} from './surveys/contracts.js';
export const INVITATION_PATTERN = /^KS-[A-HJ-NP-Z2-9]{12}$/;
export type Invitation={id:string;campaignId:string;code:string;joinUrl:string;issuedBy:string;expiresAt:string;revokedAt:string|null;revision:number;status:'active'|'expired'|'revoked';createdAt:string};
export type DistributionCampaign={id:string;title:string;school:string;status:Campaign['status'];teacherDistributionEnabled:boolean;canIssue:boolean;unavailableReason:string|null};
export type InvitationEntry={campaign:Campaign;definition:Definition;entryStatus:'active'|'expired'|'revoked'|'unavailable';canStart:boolean;draft?:Draft};
