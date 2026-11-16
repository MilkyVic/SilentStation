import {SaveQueue} from '../../lib/save-queue.js';
import type {LegacyAnswers,LegacyDraft,LegacyReceipt,LegacyWrite} from '../../../shared/legacy-tests.js';
type Api={saveDraft:(id:string,p:LegacyWrite)=>Promise<LegacyDraft>;readDraft:(id:string)=>Promise<LegacyDraft|null>;submit:(p:LegacyWrite & {templateId:string})=>Promise<LegacyReceipt>};
export class LegacyCoordinator{
 readonly queue:SaveQueue<LegacyDraft,LegacyAnswers>;private frozen:(LegacyWrite & {templateId:string})|null=null;
 constructor(readonly templateId:string,initial:LegacyDraft,private api:Api){this.queue=new SaveQueue(initial,d=>d.answers,(answers,d)=>api.saveDraft(templateId,{draftId:d.draftId!,definitionDigest:d.definitionDigest!,revision:d.revision,answers}),async()=>{const d=await api.readDraft(templateId);if(!d||d.draftId!==initial.draftId){const e=new Error('Một lượt làm khác đã thay đổi nháp.') as Error & {code:string};e.code='TEST_DRAFT_CONFLICT';throw e;}if(d.restartRequired){const e=new Error('Bank câu hỏi đã đổi. Xác nhận bắt đầu lại.') as Error & {code:string};e.code='TEST_VERSION_CHANGED';throw e;}return d;});}
 get uncertain(){return !!this.frozen;}
 async submit(){if(!this.frozen){const d=await this.queue.flush();if(d.receipt)return d.receipt;this.frozen={templateId:this.templateId,draftId:d.draftId!,definitionDigest:d.definitionDigest!,revision:d.revision,answers:structuredClone(this.queue.snapshot.payload)};this.queue.pause();}
  try{const receipt=await this.api.submit(this.frozen);this.queue.replace({...this.queue.snapshot.ack,answers:{},submitted:true,receipt});this.frozen=null;return receipt;}catch(e){const c=String((e as any)?.code??'');if(c&&!['NETWORK_ERROR','AUTH_SERVER_ERROR'].includes(c)){this.frozen=null;this.queue.fail(e as Error);}throw e;}
 }
}
