'use strict';
const assert = require('assert');
const E = require('../ac-calculator-engine.js');
const F = require('../financial-integrity-core.js');

function close(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${expected}, got ${actual}`);
}
function scopeFor(key, qty) {
  return {
    version: E.ENGINE_VERSION,
    inputs: { systemType: 'split-heat-pump' },
    requirements: [{
      key, qty, units:'ea', label:key, level:'scope', reason:'fixture', code:'', category:'Fixture',
      includeTokens:[key], excludeTokens:[], preferredIds:[], allowPackagedLength:false, compatibleSystems:[], selected:true,
      forceUnresolved:false, requiredLengthFt:0, customPart:''
    }]
  };
}
function catalog(id, item, customer, your, includeYour = true) {
  const row = { id, item, part:id, vendor:'Fixture', units:'ea', category:'Fixture', unitCost:customer };
  if (includeYour) row.yourCost = your;
  return row;
}

// 1. Catalog match returns both independent price tracks.
{
  const hit = E.resolveCatalogItem([catalog('CAT-A','fixture-a',100,70)], scopeFor('fixture-a',2).requirements[0], 'split-heat-pump');
  assert(hit);
  assert.strictEqual(hit.customerUnitPrice, 100);
  assert.strictEqual(hit.yourUnitCost, 70);
  assert.strictEqual(hit.customerPriceSource, 'catalog-customer-price');
  assert.strictEqual(hit.yourCostSource, 'catalog-your-cost');
}

// 2. Valid dual-price row fixture.
let stateA = { catalog:[catalog('CAT-A','fixture-a',100,70)], materialsUsed:[] };
let bomA = E.buildResolvedBom(stateA, scopeFor('fixture-a',2));
assert.strictEqual(bomA[0].unitCost, 100, 'compatibility unitCost must remain Customer Price');
assert.strictEqual(bomA[0].customerUnitPrice, 100);
assert.strictEqual(bomA[0].customerExtension, 200);
assert.strictEqual(bomA[0].yourUnitCost, 70);
assert.strictEqual(bomA[0].yourExtension, 140);
assert.strictEqual(bomA[0].materialMargin, 60);
close(bomA[0].materialMarginPct, 0.30);

// 3. Missing Your Cost falls back to Customer Price and records provenance.
let bomB = E.buildResolvedBom({catalog:[catalog('CAT-B','fixture-b',50,null,false)],materialsUsed:[]}, scopeFor('fixture-b',3));
assert.strictEqual(bomB[0].customerExtension, 150);
assert.strictEqual(bomB[0].yourExtension, 150);
assert.strictEqual(bomB[0].materialMargin, 0);
assert.strictEqual(bomB[0].yourCostSource, 'customer-price-fallback');

// 4. Invalid Customer Price remains invalid and blocks aggregate/apply.
for (const bad of [E.INVALID_FINANCIAL, NaN, Infinity, -Infinity, 'Infinity', 'NaN', 'abc', -1]) {
  const b = E.buildResolvedBom({catalog:[catalog('CAT-X','fixture-x',bad,70)],materialsUsed:[]}, scopeFor('fixture-x',1));
  assert.strictEqual(b[0].customerUnitPrice, E.INVALID_FINANCIAL);
  assert.strictEqual(E.calculateBomPricing(b).ok, false);
  assert.strictEqual(E.applyBomToJob({catalog:[],materialsUsed:[]}, scopeFor('fixture-x',1), b).ok, false);
}

// 5. Invalid Your Cost remains invalid; Customer estimate remains separate but Apply blocks.
{
  const b = E.buildResolvedBom({catalog:[catalog('CAT-Y','fixture-y',100,E.INVALID_FINANCIAL)],materialsUsed:[]}, scopeFor('fixture-y',1));
  assert.strictEqual(b[0].customerUnitPrice, 100);
  assert.strictEqual(b[0].yourUnitCost, E.INVALID_FINANCIAL);
  assert.strictEqual(b[0].yourCostSource, 'invalid');
  assert.strictEqual(E.calculateBomPricing(b).ok, false);
  assert.strictEqual(E.applyBomToJob({catalog:[],materialsUsed:[]}, scopeFor('fixture-y',1), b).ok, false);
}

// 6. Legitimate zero is valid but marked operationally for review.
{
  const b = E.buildResolvedBom({catalog:[catalog('CAT-Z','fixture-z',0,0)],materialsUsed:[]}, scopeFor('fixture-z',1));
  assert.strictEqual(b[0].customerUnitPrice, 0);
  assert.strictEqual(b[0].yourUnitCost, 0);
  assert.strictEqual(b[0].financialInvalid, false);
  assert.strictEqual(b[0].zeroPriceReview, true);
  assert.strictEqual(E.calculateBomPricing(b).ok, true);
  assert.strictEqual(E.calculateBomPricing(b).customerTotal, 0);
}

// 7-9. Customer / Your Cost / margin aggregate precision.
{
  const a = E.buildResolvedBom({catalog:[catalog('CAT-A','fixture-a',100,70)],materialsUsed:[]}, scopeFor('fixture-a',2))[0];
  const b = E.buildResolvedBom({catalog:[catalog('CAT-B','fixture-b',50,40)],materialsUsed:[]}, scopeFor('fixture-b',3))[0];
  const totals = E.calculateBomPricing([a,b]);
  assert.strictEqual(totals.ok, true);
  assert.strictEqual(totals.customerTotal, 350);
  assert.strictEqual(totals.yourTotal, 260);
  assert.strictEqual(totals.marginDollar, 90);
  close(totals.marginPct, 90/350);
  assert.strictEqual(E.totalBomCustomerCost([a,b]), 350);
  assert.strictEqual(E.totalBomYourCost([a,b]), 260);
  assert.strictEqual(E.totalBomMargin([a,b]), 90);
}

// 10-11. Apply mapping and snapshot provenance; never actualCost.
{
  const state = { catalog:stateA.catalog, materialsUsed:[] };
  const res = E.applyBomToJob(state, scopeFor('fixture-a',2), bomA);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.added.length, 1);
  const m = res.added[0];
  assert.strictEqual(m.qty, 2);
  assert.strictEqual(m.unitCost, 100);
  assert.strictEqual(m.procurementCostSnapshot, 70);
  assert.strictEqual(m.procurementCostSource, 'catalog-your-cost');
  assert.strictEqual(Object.prototype.hasOwnProperty.call(m, 'actualCost'), false);
}
{
  const state = { catalog:[], materialsUsed:[] };
  const res = E.applyBomToJob(state, scopeFor('fixture-b',3), bomB);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.added[0].unitCost, 50);
  assert.strictEqual(res.added[0].procurementCostSnapshot, 50);
  assert.strictEqual(res.added[0].procurementCostSource, 'customer-price-fallback');
}

// 12-13. Re-Apply replaces only Calculator rows with current pricing; manual material survives.
{
  const manual = {id:'MANUAL-1',item:'Manual fixture',qty:1,unitCost:999};
  const oldGenerated = {id:'OLD',item:'fixture-a',qty:2,unitCost:100,procurementCostSnapshot:70,calcSource:E.SOURCE_TAG};
  const state = {catalog:[catalog('CAT-A','fixture-a',100,55)],materialsUsed:[manual,oldGenerated]};
  const currentBom = E.buildResolvedBom(state, scopeFor('fixture-a',2));
  const res = E.applyBomToJob(state, scopeFor('fixture-a',2), currentBom);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.state.materialsUsed.includes(manual), true, 'manual row identity must survive');
  const generated = res.state.materialsUsed.find(x => x && x.calcSource === E.SOURCE_TAG);
  assert(generated);
  assert.notStrictEqual(generated.id, 'OLD');
  assert.strictEqual(generated.procurementCostSnapshot, 55);
}

// 14-15. Export-ready JSON is unambiguous; invalid sentinel survives JSON cycle.
{
  const roundTrip = JSON.parse(JSON.stringify({product:'bruno-ac',type:'ac-calculator-plan',version:2,bom:bomA}));
  assert.strictEqual(roundTrip.bom[0].customerUnitPrice, 100);
  assert.strictEqual(roundTrip.bom[0].yourUnitCost, 70);
  assert.strictEqual(roundTrip.bom[0].customerPriceSource, 'catalog-customer-price');
  assert.strictEqual(roundTrip.bom[0].yourCostSource, 'catalog-your-cost');
  const invalid = JSON.parse(JSON.stringify({v:E.INVALID_FINANCIAL}));
  assert.strictEqual(invalid.v, E.INVALID_FINANCIAL);
}

// Manual duplicate remains unchecked by default.
{
  const state = {catalog:[catalog('CAT-A','fixture-a',100,70)],materialsUsed:[{id:'manual',catalogId:'CAT-A',item:'fixture-a'}]};
  const b = E.buildResolvedBom(state, scopeFor('fixture-a',2));
  assert.strictEqual(b[0].manualDuplicate, true);
  assert.strictEqual(b[0].selected, false);
}

// Financial path source guards: no invalid-to-zero defect family.
{
  const fs = require('fs');
  const path = require('path');
  const engineSource = fs.readFileSync(path.join(__dirname,'..','ac-calculator-engine.js'),'utf8');
  const uiSource = fs.readFileSync(path.join(__dirname,'..','ac-calculator.js'),'utf8');
  for (const forbidden of ['Number(n)||0','Number(n) || 0','parseFloat(value) || 0','Math.max(0, parseFloat(value) || 0)']) {
    assert.strictEqual(engineSource.includes(forbidden), false, `engine contains unsafe financial coercion: ${forbidden}`);
    assert.strictEqual(uiSource.includes(forbidden), false, `UI contains unsafe financial coercion: ${forbidden}`);
  }
  assert(uiSource.includes("return x===null?'—'"), 'invalid calculator money must render dash');
}

console.log('ac-calculator-pricing: all deterministic tests passed');


// Catalog -> historical Job lifecycle: template edits do not mutate an accepted Job until explicit Apply.
{
  const state = {
    catalog: [{ id: 'CAT-A', unitCost: 100, yourCost: 70 }],
    materialsUsed: [{ id: 'job-1', catalogId: 'CAT-A', qty: 2, unitCost: 100, procurementCostSnapshot: 70, calcSource: 'ac-calculator' }]
  };
  const beforeJob = JSON.parse(JSON.stringify(state.materialsUsed[0]));
  const edit = F.setCatalogCustomerPrice(state, 'CAT-A', 110);
  assert.strictEqual(edit.ok, true);
  assert.strictEqual(state.catalog[0].unitCost, 110);
  assert.deepStrictEqual(state.materialsUsed[0], beforeJob, 'Catalog edit must not mutate historical Job Material before explicit Apply');

  const scope = scopeFor('fixture-a', 2);
  const currentBom = E.buildResolvedBom({catalog:[catalog('CAT-A','fixture-a',110,55)],materialsUsed:state.materialsUsed}, scope);
  const reapplied = E.applyBomToJob(state, scope, currentBom).state;
  const generated = reapplied.materialsUsed.find(r => r.calcSource === E.SOURCE_TAG);
  assert.strictEqual(generated.unitCost, 110, 'explicit re-Apply should update Customer Price');
  assert.strictEqual(generated.procurementCostSnapshot, 55, 'explicit re-Apply should update procurement snapshot');
}

// Blank Your Cost remains a transparent Customer Price fallback.
{
  const b = E.buildResolvedBom({catalog:[catalog('CAT-B','fixture-b',50,null,false)],materialsUsed:[]}, scopeFor('fixture-b',1));
  assert.strictEqual(b[0].customerUnitPrice, 50);
  assert.strictEqual(b[0].yourUnitCost, 50);
  assert.strictEqual(b[0].yourCostSource, 'customer-price-fallback');
}

{
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  assert.ok(!source.includes('mats[mi].unitCost = price'), 'Catalog Customer Price edit must not rewrite existing Job Materials');
  assert.ok(!source.includes('mats[mi].unitCost = row.unitCost'), 'Margins Customer Price edit must not rewrite existing Job Materials');
  assert.ok(!source.includes("else if (row.yourCost == null || row.yourCost === '') row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0)"), 'blank Your Cost must remain blank for provenance');
  assert.ok(source.includes('setCatalogCustomerPrice(state, cid'), 'Catalog Customer Price edit should use executable lifecycle helper');
}
