'use strict';
const assert=require('assert');
const UX=require('../service-journal-ux.js');

assert.strictEqual(UX.friendlyTaxSummary('TX','Texas','0.00%'),'TX · Effective 0.00%');
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','week'),{start:'2026-09-07',end:'2026-09-13'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','month'),{start:'2026-09-01',end:'2026-09-30'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','quarter'),{start:'2026-07-01',end:'2026-09-30'});

const s=UX.defaultState();
s.selectedDate='2026-09-11';
s.calls=[
  {id:'c1',date:'2026-09-11',time:'08:00',hours:1,gross:200,status:'done'},
  {id:'c2',date:'2026-09-11',time:'10:00',hours:2,gross:300,status:'done'}
];
s.crew=[
  {id:'w1',date:'2026-09-11',name:'Helper A',payType:'daily',rate:180,hours:0,payrollEnabled:true},
  {id:'w2',date:'2026-09-11',name:'Helper B',payType:'hourly',rate:20,hours:8,payrollEnabled:true}
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

const ledger=UX.payrollLedger(s);
assert.strictEqual(Number(ledger.w2.takeHome.toFixed(2)),147.76);
assert.strictEqual(Number(ledger.w2.employerTax.toFixed(2)),17.52);
assert.strictEqual(Number(ledger.w2.employerCost.toFixed(2)),177.52);

const noCalls=UX.defaultState();
noCalls.selectedDate='2026-09-11';
noCalls.crew=[{id:'w1',date:'2026-09-11',name:'Helper',payType:'daily',rate:200,hours:0,payrollEnabled:true}];
assert.strictEqual(Number(UX.summarize(noCalls,UX.rangeBounds('2026-09-11','day')).netAfterCrew.toFixed(2)),-221.90);

const migrated=UX.normalize({schemaVersion:2,settings:{revenueTaxPct:7.65},calls:[],crew:[]});
assert.strictEqual(migrated.schemaVersion,3);
assert.strictEqual(migrated.settings.ownerReserveEnabled,false);
assert.strictEqual(migrated.settings.ownerReservePct,0);

console.log('service-journal-ux tests passed');
