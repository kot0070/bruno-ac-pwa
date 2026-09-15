from pathlib import Path
import re

p = Path('index.html')
src = p.read_text(encoding='utf-8')
marker_start = '/* PR22_LIFECYCLE_HELPERS_START */'
if marker_start in src:
    raise SystemExit('lifecycle helper marker already present unexpectedly')

anchor = '  function saveCatalogCostMapFromState() {'
if src.count(anchor) != 1:
    raise SystemExit(f'expected one saveCatalogCostMapFromState anchor, got {src.count(anchor)}')

helper = r'''  /* PR22_LIFECYCLE_HELPERS_START */
  function lifecycleCatalogRow(s, cid) {
    var cat = (s && s.catalog) || [];
    for (var i = 0; i < cat.length; i++) {
      if (cat[i] && String(cat[i].id) === String(cid)) return cat[i];
    }
    return null;
  }
  function lifecycleSetCatalogCustomerPrice(s, cid, rawValue) {
    var raw = String(rawValue == null ? '' : rawValue).trim();
    var result = window.BrunoFinancial.setCatalogCustomerPrice(
      s,
      cid,
      raw === '' ? window.BrunoFinancial.INVALID_FINANCIAL : raw
    );
    result.row = lifecycleCatalogRow(s, cid);
    return result;
  }
  function lifecycleSetCatalogYourCost(s, cid, rawValue) {
    var row = lifecycleCatalogRow(s, cid);
    if (!row) return { ok: false, blank: false, value: window.BrunoFinancial.INVALID_FINANCIAL, row: null };
    var raw = String(rawValue == null ? '' : rawValue).trim();
    if (raw === '') {
      delete row.yourCost;
      return { ok: true, blank: true, value: null, row: row };
    }
    var parsed = Number(raw);
    var value = (isFinite(parsed) && parsed >= 0) ? parsed : window.BrunoFinancial.INVALID_FINANCIAL;
    row.yourCost = value;
    return { ok: value !== window.BrunoFinancial.INVALID_FINANCIAL, blank: false, value: value, row: row };
  }
  function lifecycleCatalogCostMapFromState(s) {
    var cat = (s && s.catalog) || [];
    var map = {};
    for (var i = 0; i < cat.length; i++) {
      if (cat[i] && cat[i].id != null && cat[i].yourCost != null && cat[i].yourCost !== '') {
        map[String(cat[i].id)] = window.BrunoFinancial.normalizePersistentFinancial(cat[i].yourCost, 0);
      }
    }
    return map;
  }
  function lifecycleApplyCatalogCostMap(s, map) {
    if (!s || !Array.isArray(s.catalog)) return s;
    map = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
    for (var i = 0; i < s.catalog.length; i++) {
      var row = s.catalog[i];
      if (!row || row.id == null) continue;
      var id = String(row.id);
      if (Object.prototype.hasOwnProperty.call(map, id)) {
        row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);
      }
    }
    return s;
  }
  window.BrunoPricingLifecycle = {
    setCatalogCustomerPrice: lifecycleSetCatalogCustomerPrice,
    setCatalogYourCost: lifecycleSetCatalogYourCost,
    catalogCostMapFromState: lifecycleCatalogCostMapFromState,
    applyCatalogCostMap: lifecycleApplyCatalogCostMap
  };
  /* PR22_LIFECYCLE_HELPERS_END */

'''
src = src.replace(anchor, helper + anchor, 1)

save_pat = re.compile(r"  function saveCatalogCostMapFromState\(\) \{\n.*?\n  \}", re.S)
save_repl = '''  function saveCatalogCostMapFromState() {
    try {
      localStorage.setItem(catalogCostsKey(), JSON.stringify(window.BrunoPricingLifecycle.catalogCostMapFromState(state)));
    } catch (e) {}
  }'''
src, n = save_pat.subn(save_repl, src, count=1)
if n != 1:
    raise SystemExit(f'expected one saveCatalogCostMapFromState replacement, got {n}')

apply_map_pat = re.compile(r"  function applyCatalogCostMap\(s\) \{\n.*?\n  \}", re.S)
apply_map_repl = '''  function applyCatalogCostMap(s) {
    return window.BrunoPricingLifecycle.applyCatalogCostMap(s, loadCatalogCostMap());
  }'''
src, n = apply_map_pat.subn(apply_map_repl, src, count=1)
if n != 1:
    raise SystemExit(f'expected one applyCatalogCostMap replacement, got {n}')

old_customer_call = "var result = window.BrunoFinancial.setCatalogCustomerPrice(state, cid, rawPrice === '' ? window.BrunoFinancial.INVALID_FINANCIAL : rawPrice);"
new_customer_call = "var result = window.BrunoPricingLifecycle.setCatalogCustomerPrice(state, cid, rawPrice);"
if src.count(old_customer_call) != 1:
    raise SystemExit(f'expected one Catalog customer call, got {src.count(old_customer_call)}')
src = src.replace(old_customer_call, new_customer_call, 1)

your_pat = re.compile(r"    function applyCatalogYourCost\(inputEl\) \{\n.*?\n    \}(?=\n    on\('cat-groups')", re.S)
your_repl = '''    function applyCatalogYourCost(inputEl) {
      if (!inputEl || !inputEl.classList.contains('cat-your')) return;
      var cid = inputEl.getAttribute('data-id');
      var result = window.BrunoPricingLifecycle.setCatalogYourCost(state, cid, inputEl.value);
      var invalid = !result.blank && result.value === window.BrunoFinancial.INVALID_FINANCIAL;
      inputEl.value = result.blank || invalid ? '' : result.value;
      inputEl.classList.toggle('invalid-financial', invalid);
      inputEl.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      saveCatalogCostMapFromState();
      save();
      if (typeof renderMargins === 'function') renderMargins();
    }'''
src, n = your_pat.subn(your_repl, src, count=1)
if n != 1:
    raise SystemExit(f'expected one applyCatalogYourCost replacement, got {n}')

mrg_cust_old = """        var cp = parseFloat(e.target.value);\n        row.unitCost = (isFinite(cp) && cp >= 0) ? cp : window.BrunoFinancial.INVALID_FINANCIAL;"""
mrg_cust_new = """        var cpResult = window.BrunoPricingLifecycle.setCatalogCustomerPrice(state, id, e.target.value);\n        row = cpResult.row || row;"""
if src.count(mrg_cust_old) != 1:
    raise SystemExit(f'expected one margins customer edit block, got {src.count(mrg_cust_old)}')
src = src.replace(mrg_cust_old, mrg_cust_new, 1)

mrg_your_pat = re.compile(
    r"      \} else if \(e\.target\.classList\.contains\('mrg-your'\)\) \{\n"
    r"        var ycRaw = .*?\n"
    r"        saveCatalogCostMapFromState\(\);",
    re.S,
)
mrg_your_repl = """      } else if (e.target.classList.contains('mrg-your')) {\n        window.BrunoPricingLifecycle.setCatalogYourCost(state, id, e.target.value);\n        saveCatalogCostMapFromState();"""
src, n = mrg_your_pat.subn(mrg_your_repl, src, count=1)
if n != 1:
    raise SystemExit(f'expected one margins Your Cost edit block, got {n}')

required = [
    'window.BrunoPricingLifecycle.setCatalogCustomerPrice(state, cid, rawPrice)',
    'window.BrunoPricingLifecycle.setCatalogCustomerPrice(state, id, e.target.value)',
    'window.BrunoPricingLifecycle.setCatalogYourCost(state, cid, inputEl.value)',
    'window.BrunoPricingLifecycle.setCatalogYourCost(state, id, e.target.value)',
    'JSON.stringify(window.BrunoPricingLifecycle.catalogCostMapFromState(state))',
    'window.BrunoPricingLifecycle.applyCatalogCostMap(s, loadCatalogCostMap())',
]
for needle in required:
    if needle not in src:
        raise SystemExit(f'missing expected production wiring: {needle}')

p.write_text(src, encoding='utf-8')

test = r'''\
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
'''
Path('tests/pr22-lifecycle-integration.test.js').write_text(test, encoding='utf-8')
