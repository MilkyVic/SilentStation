import test from 'node:test';
import assert from 'node:assert/strict';
import {qaAccessAllowed,includeQa,canSuspendSuperadmin} from './qa-policy.js';
test('QA expiry is strict at the deadline, fails closed and leaves live accounts unchanged',()=>{
 const now=Date.parse('2026-11-16T00:00:00Z');
 assert.equal(qaAccessAllowed({isQa:false},now),true);
 for(const d of [null,'invalid','2026-11-16T00:00:00Z','2026-11-15'])assert.equal(qaAccessAllowed({isQa:true,qaAccessExpiresAt:d},now),false);
 assert.equal(qaAccessAllowed({is_qa:true,qa_access_expires_at:'2026-11-16T00:00:01Z'},now),true);
});
test('QA report inclusion must be explicit; invalid inputs never broaden scope',()=>{
 for(const v of [undefined,false,'false'])assert.equal(includeQa(v),false);
 for(const v of [true,'true'])assert.equal(includeQa(v),true);
 for(const v of ['1','',null,[],{}])assert.throws(()=>includeQa(v));
});
test('QA superadmin cannot replace the last operational superadmin',()=>{
 assert.equal(canSuspendSuperadmin(false,2,1),false);
 assert.equal(canSuspendSuperadmin(true,2,1),true);
 assert.equal(canSuspendSuperadmin(true,1,0),false);
 assert.equal(canSuspendSuperadmin(false,3,2),true);
});
