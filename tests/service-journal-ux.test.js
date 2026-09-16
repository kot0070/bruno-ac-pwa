'use strict';
const assert=require('assert');
const fs=require('fs');
const UX=require('../service-journal-ux.js');
const src=fs.readFileSync('service-journal-ux.js','utf8');
const loader=fs.readFileSync('sw-register.js','utf8');

assert.deepStrictEqual(UX.rangeBounds('2026-09-11','week'),{start:'2026-09-07',end:'2026-09-13'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','month'),{start:'2026-09-01',end:'2026-09-30'});
assert.deepStrictEqual(UX.rangeBounds('2026-09-11','quarter'),{start:'2026-07-01',end:'2026-09-30'});
assert.strictEqual(UX.shiftPeriod('2026-01-31','month',1),'2026-02-28');
assert.strictEqual(UX.shiftPeriod('2026-02-28','month',1),'2026-03-28');
assert.strictEqual(UX.shiftPeriod('2026-12-31','quarter',1),'2027-01-31');
assert.strictEqual(UX.shiftPeriod('2027-01-31','quarter',-1),'2026-10-31');

assert.strictEqual(UX.UI_VERSION,'5');
assert(src.includes('<details class="sj5-card sj5-tax" id="sj5-tax"><summary>'),'tax/payroll settings must be a real details control');
assert(!src.includes('<details open class="sj5-card sj5-tax"'),'tax/payroll settings must default collapsed');
assert(src.includes('id="sj5-tax-close"'),'expanded tax settings must expose explicit collapse action');
assert(src.includes('sj5-tax:not([open]) .sj5-tax-body{display:none!important}'),'closed tax state must be enforced in runtime CSS');
assert(src.includes('callCardHtml'),'saved calls must render through static compact card markup');
assert(src.includes('data-edit-call='),'saved calls must expose explicit Edit action');
assert(src.includes('sj5-call-modal'),'editing must use modal instead of persistent inline controls');
assert(loader.includes("loadScript('service-journal-ux-js','./service-journal-ux.js')"),'primary Journal loader must not depend on workspace-v5');
assert(loader.indexOf("loadScript('service-journal-ux-js','./service-journal-ux.js')") < loader.indexOf("if(document.getElementById('phase2-nav-js'))return"),'Journal loader must execute before optional navigation/workspace early return');

const card=UX.callCardHtml({id:'c1',date:'2026-09-11',time:'08:00',address:'123 Long Address Rd',description:'Replace capacitor',hours:1.5,gross:245,status:'done'});
assert(card.includes('sj5-call-card'));
assert(card.includes('data-edit-call="c1"'));
assert(!card.includes('<input'),'saved call card must contain no inline edit inputs');
assert(!card.includes('<textarea'),'saved call card must contain no inline edit textarea');
assert(card.includes('$245.00'));

const ts=UX.taxSummary(Object.assign(UX.defaultState().settings,{jurisdiction:'TX'}));
assert(ts.includes('TX'));
assert(ts.includes('employee payroll'));

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

function storage(raw){let writes=0,o={};if(raw!==undefined)o[UX.STORAGE_KEY]=raw;return {get length(){return Object.keys(o).length},key(i){return Object.keys(o)[i]||null},getItem(k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:null},setItem(k,v){writes++;o[k]=String(v)},writes(){return writes},dump(){return Object.assign({},o)}}}
const corrupt=storage('{bad json');
const corruptRead=UX.loadFromStorage(corrupt);
assert.strictEqual(corruptRead.status,'invalid');
assert.strictEqual(UX.storageStatus().locked,true);
assert.strictEqual(corrupt.writes(),0,'corrupt current Journal must never be overwritten during load');
assert.strictEqual(corrupt.getItem(UX.STORAGE_KEY),'{bad json');
assert.strictEqual(UX.save(UX.defaultState(),corrupt),false,'locked Journal storage must reject normal saves');
assert.strictEqual(corrupt.getItem(UX.STORAGE_KEY),'{bad json');
const missing=storage(undefined);
const missingRead=UX.loadFromStorage(missing);
assert.strictEqual(missingRead.status,'missing');
assert.strictEqual(UX.storageStatus().locked,false);
assert.strictEqual(UX.save(missingRead.state,missing),true);
assert.strictEqual(UX.parseStoredJournal(missing.getItem(UX.STORAGE_KEY)).status,'valid');

console.log('service-journal-ux tests passed');
