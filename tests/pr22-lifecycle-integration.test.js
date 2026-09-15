'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const E = require('../ac-calculator-engine.js');
const F = require('../financial-integrity-core.js');

const indexSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const helperMatch = indexSource.match(/\/\* PR22_LIFECYCLE_HELPERS_START \*\/([\s\S]*?)\/\* PR22_LIFECYCLE_HELPERS_END \*\//);
assert(helperMatch, 'production lifecycle helper block must be present');
const sandbox = { window: { BrunoFinancial: F } };
vm.runInNewContext(helperMatch[1], sandbox, { filename: 'index.html#PR22_LIFECYCLE_HELPERS' });
const L = sandbox.window.BrunoPricingLifecycle;
assert(L, 'production lifecycle API must initialize');

function scopeFor(key, qty) {
  return {
    version: E.ENGINE_VERSION,
    inputs: { systemType: 'split-heat-pump' },
    requirements: [{
      key, qty, units: 'ea', label: key, level: 'scope', reason: 'integration-fixture', code: '', category: 'Fixture',
      includeTokens: [key], excludeTokens: [], preferredIds: [], allowPackagedLength: false,
      compatibleSystems: [], selected: true, forceUnresolved: false, requiredLengthFt: 0, customPart: ''
    }]
  };
}

function generatedRow(state) {
  return state.materialsUsed.find((r) => r && r.calcSource === E.SOURCE_TAG);
}

let state = {
  catalog: [{ id: 'CAT-A', item: 'fixture-a', part: 'CAT-A', vendor: 'Fixture', units: 'ea', category: 'Fixture', unitCost: 100, yourCost: 70 }],
  materialsUsed: [{ id: 'MANUAL-1', item: 'Manual fixture', qty: 1, unitCost: 999 }]
};
const scope = scopeFor('fixture-a', 2);

const beforePreview = JSON.parse(JSON.stringify(state));
let bom = E.buildResolvedBom(state, scope);
const pricing = E.calculateBomPricing(bom);
assert.strictEqual(pricing.ok, true);
assert.deepStrictEqual(state, beforePreview, 'Calculate/preview must not mutate persisted Job state');

let applied = E.applyBomToJob(state, scope, bom);
assert.strictEqual(applied.ok, true);
state = applied.state;
let generated = generatedRow(state);
assert(generated, 'explicit Apply must create Calculator row');
assert.strictEqual(generated.unitCost, 100);
assert.strictEqual(generated.procurementCostSnapshot, 70);
assert(state.materialsUsed.some((r) => r.id === 'MANUAL-1'), 'manual material must survive initial Apply');

assert.strictEqual(L.setCatalogCustomerPrice(state, 'CAT-A', '110').ok, true);
assert.strictEqual(L.setCatalogYourCost(state, 'CAT-A', '55').ok, true);
generated = generatedRow(state);
assert.strictEqual(state.catalog[0].unitCost, 110);
assert.strictEqual(state.catalog[0].yourCost, 55);
assert.strictEqual(generated.unitCost, 100, 'Catalog Customer edit must not implicitly rewrite historical Job unitCost');
assert.strictEqual(generated.procurementCostSnapshot, 70, 'Catalog Your Cost edit must not implicitly rewrite historical Job snapshot');

assert.strictEqual(L.setCatalogCustomerPrice(state, 'CAT-A', '112').ok, true);
generated = generatedRow(state);
assert.strictEqual(generated.unitCost, 100, 'Margins Customer edit path must not rewrite historical Job unitCost');
assert.strictEqual(generated.procurementCostSnapshot, 70);
assert.strictEqual(L.setCatalogCustomerPrice(state, 'CAT-A', '110').ok, true);

const costMap = L.catalogCostMapFromState(state);
assert.deepStrictEqual(JSON.parse(JSON.stringify(costMap)), { 'CAT-A': 55 });
let reloaded = JSON.parse(JSON.stringify(state));
delete reloaded.catalog[0].yourCost;
L.applyCatalogCostMap(reloaded, JSON.parse(JSON.stringify(costMap)));
generated = generatedRow(reloaded);
assert.strictEqual(reloaded.catalog[0].unitCost, 110);
assert.strictEqual(reloaded.catalog[0].yourCost, 55);
assert.strictEqual(generated.unitCost, 100, 'save/reload must preserve historical customer snapshot until explicit action');
assert.strictEqual(generated.procurementCostSnapshot, 70, 'save/reload must preserve historical procurement snapshot until explicit action');

bom = E.buildResolvedBom(reloaded, scope);
applied = E.applyBomToJob(reloaded, scope, bom);
assert.strictEqual(applied.ok, true);
reloaded = applied.state;
generated = generatedRow(reloaded);
assert.strictEqual(generated.unitCost, 110);
assert.strictEqual(generated.procurementCostSnapshot, 55);
assert(reloaded.materialsUsed.some((r) => r.id === 'MANUAL-1'), 'manual material rows must survive re-Apply');

let clearState = {
  catalog: [{ id: 'CAT-B', item: 'fixture-b', part: 'CAT-B', vendor: 'Fixture', units: 'ea', category: 'Fixture', unitCost: 100, yourCost: 70 }],
  materialsUsed: []
};
const cleared = L.setCatalogYourCost(clearState, 'CAT-B', '   ');
assert.strictEqual(cleared.ok, true);
assert.strictEqual(cleared.blank, true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(clearState.catalog[0], 'yourCost'), false, 'blank input must remove explicit override');
assert.deepStrictEqual(JSON.parse(JSON.stringify(L.catalogCostMapFromState(clearState))), {}, 'blank clear must remove persisted cost-map entry');
assert.strictEqual(L.setCatalogCustomerPrice(clearState, 'CAT-B', '60').ok, true);
const fallbackBom = E.buildResolvedBom(clearState, scopeFor('fixture-b', 1));
assert.strictEqual(fallbackBom[0].customerUnitPrice, 60);
assert.strictEqual(fallbackBom[0].yourUnitCost, 60);
assert.strictEqual(fallbackBom[0].yourCostSource, 'customer-price-fallback');

const malformed = L.setCatalogYourCost(clearState, 'CAT-B', 'abc');
assert.strictEqual(malformed.ok, false);
assert.strictEqual(clearState.catalog[0].yourCost, F.INVALID_FINANCIAL);
const zero = L.setCatalogYourCost(clearState, 'CAT-B', '0');
assert.strictEqual(zero.ok, true);
assert.strictEqual(clearState.catalog[0].yourCost, 0);

assert(indexSource.includes('window.BrunoPricingLifecycle.setCatalogYourCost(state, cid, inputEl.value)'));
assert(indexSource.includes('window.BrunoPricingLifecycle.setCatalogYourCost(state, id, e.target.value)'));
assert(indexSource.includes('window.BrunoPricingLifecycle.setCatalogCustomerPrice(state, id, e.target.value)'));

console.log('pr22-lifecycle-integration: production lifecycle integration tests passed');
