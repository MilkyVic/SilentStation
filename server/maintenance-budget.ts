export const CLEANUP_LIMIT=100,MAIL_LIMIT=5,MAINTENANCE_MS=20000;
export class MaintenanceBudget {
 readonly started:number;readonly deadline:number;
 constructor(ms=MAINTENANCE_MS,private clock=Date.now){this.started=clock();this.deadline=this.started+Math.min(MAINTENANCE_MS,Math.max(1,ms));}
 remaining(){return Math.max(0,this.deadline-this.clock());}
 enough(ms=2500){return this.remaining()>ms;}
 async query(c:any,text:string,values:any[]=[]){if(!this.enough(50))throw Error('Maintenance budget exhausted.');return c.query({text,values,query_timeout:Math.min(2000,this.remaining())});}
}
