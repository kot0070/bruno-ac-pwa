'use strict';
const assert=require('assert');
const UX=require('../service-journal-ux.js');

assert.strictEqual(UX.friendlyTaxSummary('TX','Texas','0.00%'),'TX · Effective 0.00%');
assert.strictEqual(UX.friendlyTaxSummary('','Texas','16.21%'),'Texas · Effective 16.21%');
assert.strictEqual(UX.friendlyTaxSummary('TX','',''),'TX');
assert.strictEqual(UX.friendlyTaxSummary('','',''),'Tap to review rates');

assert.deepStrictEqual(UX.rangeBounds('2026-09-11','week'),{start:'2026-09-07',end:'2026-09-13'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','month'),{start:'2026-09-01',end:'2026-09-30'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','quarter'),{start:'2026-07-01',end:'2026-09-30'});

const s=UX.defaultState();
s.selectedDate='2026-09-11';
s.settings.revenueTaxPct=7.65;
s.settings.helperTaxPct=7.65;
s.calls=[
  {id:'c1',date:'2026-09-11',time:'08:00',hours:1,gross:200,taxPct:'',status:'done'},
  {id:'c2',date:'2026-09-11',time:'10:00',hours:2,gross:300,taxPct:'',status:'done'}
];
s.crew=[
  {id:'w1',date:'2026-09-11',name:'Helper',payType:'daily',rate:180,hours:0,taxEnabled:true,taxPct:''},
  {id:'w2',date:'2026-09-11',name:'Helper 2',payType:'hourly',rate:20,hours:8,taxEnabled:true,taxPct:''}
];
const sum=UX.summarize(s,UX.rangeBounds('2026-09-11','day'));
assert.strictEqual(sum.calls,2);
assert.strictEqual(sum.hours,3);
assert.strictEqual(sum.gross,500);
assert.strictEqual(Number(sum.tax.toFixed(2)),38.25);
assert.strictEqual(Number(sum.revenueNet.toFixed(2)),461.75);
assert.strictEqual(sum.crewGross,340);
assert.strictEqual(Number(sum.crewTakeHome.toFixed(2)),313.99);
assert.strictEqual(Number(sum.netAfterCrew.toFixed(2)),121.75);

const noCalls=UX.defaultState();
noCalls.selectedDate='2026-09-11';
noCalls.crew=[{id:'w1',date:'2026-09-11',name:'Helper',payType:'daily',rate:200,hours:0,taxEnabled:true,taxPct:''}];
assert.strictEqual(UX.summarize(noCalls,UX.rangeBounds('2026-09-11','day')).netAfterCrew,-200);

console.log('service-journal-ux tests passed');
