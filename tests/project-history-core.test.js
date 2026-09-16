'use strict';
const assert=require('assert');
const H=require('../project-history-core.js');

function snap(id,sqft){return {schemaVersion:1,id:id,createdAt:'2026-09-15T20:00:00.000Z',projectPlan:{schemaVersion:2,projectType:'residential',sqft:sqft,rooms:[{id:'r1',type:'bedroom',count:3,area:100}],quantities:[{key:'q',final:3}],extras:[{id:'e1',catalogId:'cat-1',label:'Item',qty:2,customerUnitPrice:100,yourUnitCost:70}]},calculatorInputs:{sqft:String(sqft)},bom:[{label:'Item',qty:2}],totals:{customerMaterials:200,yourCost:140,marginDollar:60,marginPct:30},pricingFrozen:true};}
function extended(){return {buildingEnvelope:{schemaVersion:4,project:{conditionedFloorArea:2000}},loadResult:{status:'complete',sources:['LOAD_SOURCE']},equipmentResult:{status:'ready',sources:['EQUIPMENT_SOURCE']},electricalResult:{status:'ready',sources:['ELECTRICAL_SOURCE']},mechanicalBOM:{status:'ready',rows:[{key:'x'}],sources:['MECH_SOURCE']},pricedBOM:{status:'ready',rows:[{key:'x',catalogId:'cat-1'}],totals:{customerMaterials:200,yourCost:140,marginDollar:60,marginPct:30}},complianceGate:{status:'ready'},catalogBindings:{x:'cat-1'},quantityOverrides:{},complianceMetadata:{},sourceRefs:['LOAD_SOURCE','EQUIPMENT_SOURCE','ELECTRICAL_SOURCE','MECH_SOURCE'],chainVersion:1,frozenAt:'2026-09-16T13:00:00.000Z'};}

let store=H.normalizeStore(null);
let a=H.add(store,snap('',2000));
assert.strictEqual(a.ok,true);
assert.strictEqual(a.store.items.length,1);
assert.strictEqual(a.store.activeId,a.snapshot.id);
assert.strictEqual(H.validateSnapshot(a.snapshot).ok,true);

let b=H.add(a.store,snap('',2500));
assert.strictEqual(b.store.items.length,2);
let act=H.activate(b.store,b.store.items[1].id);
assert.strictEqual(act.ok,true);
assert.strictEqual(act.store.activeId,b.store.items[1].id);

let dup=H.duplicatePlan(b.store.items[0]);
assert.strictEqual(dup.ok,true);
assert.strictEqual(dup.plan.sqft,2500);
assert.strictEqual(dup.plan.extras[0].catalogId,'cat-1');
assert.strictEqual(Object.prototype.hasOwnProperty.call(dup.plan.extras[0],'customerUnitPrice'),false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(dup.plan.extras[0],'yourUnitCost'),false);
assert.strictEqual(dup.plan.duplicatedFromSnapshotId,b.store.items[0].id);

// Extended snapshots freeze the full calculation chain and duplicate only project/building inputs.
const full=snap('full',2000);full.extended=extended();
assert.strictEqual(H.validateSnapshot(full).ok,true);
const fullDup=H.duplicatePlan(full);
assert.strictEqual(fullDup.ok,true);
assert.strictEqual(fullDup.buildingEnvelope.schemaVersion,4);
assert.strictEqual(fullDup.plan.duplicatedFromSnapshotId,'full');
const malformedExtended=JSON.parse(JSON.stringify(full));delete malformedExtended.extended.electricalResult;
assert.strictEqual(H.validateSnapshot(malformedExtended).ok,false);
assert.strictEqual(H.validateSnapshot(malformedExtended).error,'missing_extended_electricalResult');
const malformedRefs=JSON.parse(JSON.stringify(full));malformedRefs.extended.sourceRefs='LOAD_SOURCE';
assert.strictEqual(H.validateSnapshot(malformedRefs).ok,false);
assert.strictEqual(H.validateSnapshot(malformedRefs).error,'invalid_extended_sourceRefs');

let one=H.exportOne(b.store.items[0]);
assert.strictEqual(one.ok,true);
assert.strictEqual(one.payload.type,'project-calculation-snapshot');
let imported=H.importPayload(one.payload,H.normalizeStore(null));
assert.strictEqual(imported.ok,true);
assert.strictEqual(imported.added,1);
assert.notStrictEqual(imported.store.items[0].id,b.store.items[0].id);
assert.strictEqual(imported.store.items[0].importedFromId,b.store.items[0].id);

const fullExport=H.exportOne(full);assert.strictEqual(fullExport.ok,true);
const fullImport=H.importPayload(fullExport.payload,H.normalizeStore(null));
assert.strictEqual(fullImport.ok,true);
assert.deepStrictEqual(fullImport.store.items[0].extended.pricedBOM.totals,full.extended.pricedBOM.totals);
assert.deepStrictEqual(fullImport.store.items[0].extended.sourceRefs,full.extended.sourceRefs);

let all=H.exportAll(b.store);
assert.strictEqual(all.type,'project-calculation-history');
let importedAll=H.importPayload(all,H.normalizeStore(null));
assert.strictEqual(importedAll.ok,true);
assert.strictEqual(importedAll.added,2);
assert.strictEqual(new Set(importedAll.store.items.map(x=>x.id)).size,importedAll.store.items.length,'imported IDs must be collision-free');

// Atomic full-history import: one malformed member rejects the entire batch and leaves store unchanged.
const target=H.add(H.normalizeStore(null),snap('',1800)).store;
const mixed=H.exportAll(b.store);
mixed.history.items[1]=JSON.parse(JSON.stringify(mixed.history.items[1]));
delete mixed.history.items[1].projectPlan;
const atomic=H.importPayload(mixed,target);
assert.strictEqual(atomic.ok,false);
assert.strictEqual(atomic.added,0);
assert.deepStrictEqual(atomic.store,target);

// totals are required and strictly number|null; no missing/coercible values.
const missingTotal=snap('missing',2000);delete missingTotal.totals.marginPct;
assert.strictEqual(H.validateSnapshot(missingTotal).ok,false);
assert.strictEqual(H.validateSnapshot(missingTotal).error,'missing_total_marginPct');
const stringTotal=snap('string',2000);stringTotal.totals.customerMaterials='200';
assert.strictEqual(H.validateSnapshot(stringTotal).ok,false);
assert.strictEqual(H.validateSnapshot(stringTotal).error,'invalid_total_customerMaterials');
const boolTotal=snap('bool',2000);boolTotal.totals.yourCost=false;
assert.strictEqual(H.validateSnapshot(boolTotal).ok,false);
assert.strictEqual(H.validateSnapshot(boolTotal).error,'invalid_total_yourCost');
const nullTotals=snap('nulls',2000);nullTotals.totals={customerMaterials:null,yourCost:null,marginDollar:null,marginPct:null};
assert.strictEqual(H.validateSnapshot(nullTotals).ok,true);

// Unsupported/coercible payload version is rejected strictly.
const badVersion=H.exportAll(b.store);badVersion.version='1';
assert.strictEqual(H.importPayload(badVersion,target).ok,false);

let removed=H.remove(b.store,b.store.activeId);
assert.strictEqual(removed.items.length,1);
console.log('project-history-core tests passed');
