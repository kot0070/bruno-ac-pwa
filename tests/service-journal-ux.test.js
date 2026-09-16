'use strict';
const assert=require('assert');
const UX=require('../service-journal-ux.js');

assert.deepStrictEqual(UX.rangeBounds('2026-09-11','week'),{start:'2026-09-07',end:'2026-09-13'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','month'),{start:'2026-09-01',end:'2026-09-30'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','quarter'),{start:'2026-07-01',end:'2026-09-30'});
assert.strictEqual(UX.shiftPeriod('2026-01-31','month',1),'2026-02-28');
assert.strictEqual(UX.shiftPeriod('2026-02-28','month',1),'2026-03-28');
assert.strictEqual(UX.shiftPeriod('2026-12-31','quarter',1),'2027-03-31');
assert.strictEqual(UX.shiftPeriod('2027-01-31','quarter',-1),'2026-10-31');

const s=UX.defaultState();
s.selectedDate='2026-09-11';
s.workers=[{id:'worker-a',name:'Helper'},{id:'worker-b',name:'Helper'}];
s.calls=[
  {id:'c1',date:'2026-09-11',time:'08:00',hours:1,gross:200,status:'done'},
  {id:'c2',date:'2026-09-11',time:'10:00',hours:2,gross:300,status:'done'}
];
s.crew=[
  {id:'w1',workerId:'worker-a',date:'2026-09-11',name:'Helper',payType:'daily',rate:180,hours:0,payrollEnabled:true},
  {id:'w2',workerId:'worker-b',date:'2026-09-11',name:'Helper',payType:'hourly',rate:20,hours:8,payrollEnabled:true}
];
const sum=UX.summarize(s,UX.rangeBounds('2026-09-11','day'));
assert.strictEqual(sum.calls,2);
assert.strictEqual(sum.hours,3);
assert.strictEqual(sum.gross,500);
assert.strictEqual(sum.ownerReserve,0,'payroll FICA must not be charged against service-call revenue');
assert.strictEqual(sum.crewGross,340);
assert.strictEqual(Number(sum.crewTakeHome.toFixed(2)),313.99);
assert.strictEqual(Number(sum.employerPayrollTax.toFixed(2)),37.23);
assert.strictEqual(Number(sum.employerCrewCost.toFixed(2)),377.23);
assert.strictEqual(Number(sum.netAfterCrew.toFixed(2)),122.77);

const sameName=UX.defaultState();
sameName.workers=[{id:'a',name:'Helper'},{id:'b',name:'Helper'}];
sameName.settings.twcWageBase=9000;
sameName.settings.futaWageBase=7000;
sameName.crew=[
 {id:'a1',workerId:'a',name:'Helper',date:'2026-01-02',payType:'daily',rate:9000,hours:0,payrollEnabled:true},
 {id:'b1',workerId:'b',name:'Helper',date:'2026-01-03',payType:'daily',rate:9000,hours:0,payrollEnabled:true}
];
const sameLedger=UX.payrollLedger(sameName);
assert(sameLedger.a1.twc>0 && sameLedger.b1.twc>0,'same-name workers must keep separate wage bases');
assert(sameLedger.a1.futa>0 && sameLedger.b1.futa>0,'same-name workers must keep separate FUTA bases');

const renamed=UX.defaultState();
renamed.workers=[{id:'stable-worker',name:'New Name'}];
renamed.crew=[
 {id:'r1',workerId:'stable-worker',name:'Old Name',date:'2026-01-02',payType:'daily',rate:5000,hours:0,payrollEnabled:true},
 {id:'r2',workerId:'stable-worker',name:'New Name',date:'2026-01-03',payType:'daily',rate:5000,hours:0,payrollEnabled:true}
];
const renamedLedger=UX.payrollLedger(renamed);
assert.strictEqual(renamedLedger.r2.priorWages,5000,'rename must not reset stable worker wage base');

const migrated=UX.normalize({schemaVersion:2,settings:{revenueTaxPct:7.65},calls:[],crew:[]});
assert.strictEqual(migrated.schemaVersion,4);
assert.strictEqual(migrated.settings.ownerReserveEnabled,false);
assert.strictEqual(migrated.settings.ownerReservePct,0);

console.log('service-journal-ux tests passed');
