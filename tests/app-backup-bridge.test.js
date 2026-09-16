'use strict';
const assert=require('assert');
const B=require('../app-backup-bridge.js');
function mem(seed){let o=Object.assign({},seed||{});return {get length(){return Object.keys(o).length},key(i){return Object.keys(o)[i]||null},getItem(k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:null},setItem(k,v){o[k]=String(v)},dump(){return o}}}
const s=mem({'bruno-ac-v1':'JOB','bruno-ac-service-journal-v2':'JOURNAL','bruno-ac-room-plan-v1':'ROOM','other-app':'NO'});
const b=B.buildBackup(s);
assert.strictEqual(b.type,'bruno-ac-full-app-backup');
assert.strictEqual(b.storage['bruno-ac-service-journal-v2'],'JOURNAL');
assert.strictEqual(b.storage['bruno-ac-room-plan-v1'],'ROOM');
assert.strictEqual(b.storage['other-app'],undefined);
assert.strictEqual(B.validateBackup(b),true);
const target=mem();const written=B.restoreBackup(b,target);
assert(written.includes('bruno-ac-service-journal-v2'));
assert.strictEqual(target.getItem('bruno-ac-service-journal-v2'),'JOURNAL');
assert.throws(()=>B.restoreBackup({product:'bruno-ac',type:'bruno-ac-full-app-backup',version:2,storage:{'other':'x'}},target));
console.log('app-backup-bridge tests passed');
