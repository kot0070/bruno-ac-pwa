const assert=require('assert');
const H=require('../calculation-history-core.js');
const R=require('../room-estimator-engine.js');
(function saveAndFreeze(){const plan=R.preset('typical-3-2');const snap={name:'Test calc',createdAt:'2026-09-15T22:00:00Z',roomPlan:plan,pricing:{customerTotal:1000,yourTotal:700,marginDollar:300,marginPct:.3,customerText:'$1,000.00',yourText:'$700.00',marginText:'$300.00',marginPctText:'30.0%'},bom:[{label:'Register',qty:8}],compliance:{ready:true}};const res=H.saveSnapshot({},snap);assert.strictEqual(res.store.history.length,1);assert.strictEqual(res.store.activeCalculationId,res.snapshot.id);snap.roomPlan.rooms[0].count=99;assert.notStrictEqual(res.snapshot.roomPlan.rooms[0].count,99,'snapshot must be frozen by value');})();
(function duplicatePreservesSource(){const plan=R.preset('typical-3-2');const s=H.normalizeSnapshot({id:'old',name:'House A',roomPlan:plan,pricing:{customerTotal:1,yourTotal:1}});const d=H.duplicateForEdit(s);assert.strictEqual(d.sourceCalculationId,'old');assert.notStrictEqual(d.roomPlan,s.roomPlan);})();
(function exportImport(){const plan=R.preset('typical-3-2');let store=H.saveSnapshot({}, {name:'A',roomPlan:plan,pricing:{customerTotal:10,yourTotal:5}}).store;const bundle=H.exportBundle(store);const imported=H.importPayload(bundle,{});assert.strictEqual(imported.added.length,1);assert.strictEqual(imported.store.history[0].sourceType,'imported');assert.notStrictEqual(imported.store.history[0].id,store.history[0].id);})();
(function invalidImportFails(){assert.throws(()=>H.importPayload({type:'wat'},{}),/unsupported_import_format/);})();
(function invalidPricingIsRejected(){const plan=R.preset('typical-3-2');[
  {customerTotal:'bad',yourTotal:null},
  {customerTotal:-1,yourTotal:5},
  {customerTotal:10,yourTotal:-2},
  {customerTotal:10,yourTotal:5,marginDollar:'oops'},
  {customerTotal:10,yourTotal:5,marginPct:'oops'}
].forEach(function(pricing){const v=H.validateSnapshot({name:'Bad',roomPlan:plan,pricing:pricing});assert.strictEqual(v.ok,false);assert.ok(v.errors.includes('invalid_pricing_snapshot'))});const imported=H.importPayload({type:'calculation-history-bundle',calculations:[{name:'Bad',roomPlan:plan,pricing:{customerTotal:10,yourTotal:5,marginPct:'oops'}}]},{});assert.strictEqual(imported.added.length,0);assert.strictEqual(imported.errors.length,1);})();
(function negativeMarginCanRemainTruthful(){const plan=R.preset('typical-3-2');const v=H.validateSnapshot({name:'Loss job',roomPlan:plan,pricing:{customerTotal:100,yourTotal:120,marginDollar:-20,marginPct:-.2}});assert.strictEqual(v.ok,true,'negative margin is a valid historical outcome even though negative totals are not');})();
console.log('calculation-history-core tests: PASS');
