export type SavePhase='idle'|'dirty'|'saving'|'saved'|'error'|'conflict'|'version_changed'|'expired';
export type SaveState<D,P>={ack:D;payload:P;phase:SavePhase;error:Error|null};
export const canonical=(v:unknown):string=>JSON.stringify(Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,JSON.parse(canonical(x))])):v);
const code=(e:unknown)=>String((e as {code?:string})?.code??'');
/** A rejected request never becomes the internal queue's next promise. No persistent browser storage. */
export class SaveQueue<D extends {revision:number},P>{
 private state:SaveState<D,P>;private pending:P|undefined;private running:Promise<void>|null=null;private timer:ReturnType<typeof setTimeout>|undefined;private listeners=new Set<()=>void>();private paused=false;private stopped=false;
 constructor(initial:D,private payloadOf:(d:D)=>P,private write:(p:P,ack:D)=>Promise<D>,private read:()=>Promise<D>){this.state={ack:initial,payload:payloadOf(initial),phase:'idle',error:null};}
 get snapshot(){return this.state;}get dirty(){return !this.stopped&&(!!this.running||this.pending!==undefined||canonical(this.state.payload)!==canonical(this.payloadOf(this.state.ack)));}
 subscribe(listener:()=>void){this.listeners.add(listener);return()=>{this.listeners.delete(listener);};}
 private publish(next:Partial<SaveState<D,P>>){this.state={...this.state,...next};for(const listener of this.listeners)listener();}
 set(payload:P,delay=700){if(this.stopped||this.paused||['conflict','version_changed','expired'].includes(this.state.phase))return;this.pending=structuredClone(payload);this.publish({payload:this.pending,phase:'dirty',error:null});clearTimeout(this.timer);this.timer=setTimeout(()=>{void this.run();},delay);}
 async flush(payload?:P){if(payload!==undefined)this.set(payload);clearTimeout(this.timer);if(this.stopped)throw new Error('Phiên đã kết thúc.');if(['conflict','version_changed','expired'].includes(this.state.phase))throw this.state.error;this.paused=false;await this.run();if(this.state.error)throw this.state.error;return this.state.ack;}
 fail(error:Error){const phase:SavePhase=/EXPIRED/.test(code(error))?'expired':/VERSION/.test(code(error))?'version_changed':/CONFLICT|SUBMITTED/.test(code(error))?'conflict':'error';this.paused=false;this.publish({phase,error});}
 resume(){this.stopped=false;this.paused=false;this.set(this.state.payload);}
 pause(){this.paused=true;clearTimeout(this.timer);}
 async stop(){this.stopped=true;this.pending=undefined;clearTimeout(this.timer);await this.running;}
 replace(ack:D){this.pending=undefined;this.publish({ack,payload:this.payloadOf(ack),phase:'saved',error:null});}
 private async run(){
  if(this.running)return this.running;if(this.stopped||this.paused)return;
  this.running=(async()=>{while(this.pending!==undefined&&!this.stopped&&!this.paused){
   const payload=this.pending;this.pending=undefined;
   if(canonical(payload)===canonical(this.payloadOf(this.state.ack))){if(!this.pending)this.publish({phase:'saved',error:null});continue;}
   this.publish({phase:'saving',error:null});const before=this.state.ack;
   try{const ack=await this.write(payload,before);this.publish({ack,phase:this.pending===undefined?'saved':'dirty',error:null});}
   catch(raw){const error=raw instanceof Error?raw:new Error('Không xác nhận được lưu.');
    // A lost acknowledgement can be reconciled only when server state exactly equals this write.
    if(!/VERSION|INVALID|INCOMPLETE|EXPIRED/.test(code(error))){try{const ack=await this.read();if((ack as any).submitted){this.replace(ack);this.paused=true;break;}if(ack.revision>=before.revision&&canonical(this.payloadOf(ack))===canonical(payload)){this.publish({ack,phase:this.pending===undefined?'saved':'dirty',error:null});continue;}}catch{/* Keep failure explicit. */}}
    this.pending??=structuredClone(this.state.payload);const phase:SavePhase=/EXPIRED/.test(code(error))?'expired':/VERSION/.test(code(error))?'version_changed':/CONFLICT|ALREADY_SUBMITTED/.test(code(error))?'conflict':'error';this.publish({phase,error});break;
   }
  }})().finally(()=>{this.running=null;});return this.running;
 }
}
