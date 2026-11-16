import {SaveQueue} from '../../lib/save-queue.js';
import type {Answers,Draft,Receipt,SectionId} from '../../../shared/surveys/contracts.js';
type Payload={answers:Answers;reviewedSections:SectionId[]};
export type SurveyApi={save:(code:string,a:Answers,s:SectionId[],revision:number)=>Promise<Draft>;load:(code:string)=>Promise<Draft>;submit:(code:string,revision:number,key:string)=>Promise<Receipt>;clear:(code:string)=>Promise<unknown>};
export class SurveyCoordinator{
 readonly queue:SaveQueue<Draft,Payload>;private frozen:{revision:number;key:string}|null=null;
 constructor(readonly code:string,initial:Draft,private api:SurveyApi){this.queue=new SaveQueue(initial,d=>({answers:d.answers,reviewedSections:d.reviewedSections}),(p,d)=>api.save(code,p.answers,p.reviewedSections,d.revision),()=>api.load(code));}
 get view(){return {...this.queue.snapshot.ack,...this.queue.snapshot.payload};}get uncertain(){return !!this.frozen;}
 async submit(){
  if(!this.frozen){const ack=await this.queue.flush();if(ack.receipt)return ack.receipt;this.frozen={revision:ack.revision,key:crypto.randomUUID()};this.queue.pause();}
  try{const receipt=await this.api.submit(this.code,this.frozen.revision,this.frozen.key);this.queue.replace({...this.view,answers:{},reviewedSections:[],submitted:true,receipt});this.frozen=null;return receipt;}
  catch(e){const c=String((e as any)?.code??'');if(c&&!['NETWORK_ERROR','SURVEY_SERVER_ERROR'].includes(c)){this.frozen=null;this.queue.fail(e as Error);}throw e;}
 }
 async clear(){await this.queue.stop();try{await this.api.clear(this.code);}catch(e){this.queue.resume();throw e;}}
}
// Scope is the anonymous campaign/session expiry, never the logged-in account.
const controllers=new Map<string,SurveyCoordinator>();
export function surveyCoordinator(id:string,code:string,draft:Draft,api:SurveyApi){for(const [key,c] of controllers)if(new Date(c.view.expiresAt).getTime()<=Date.now())controllers.delete(key);const key=`${id}:${draft.expiresAt}`;let controller=controllers.get(key);if(!controller){controller=new SurveyCoordinator(code,draft,api);controllers.set(key,controller);}return controller;}
