from pathlib import Path
import re

core = Path('financial-integrity-core.js')
index = Path('index.html')
test = Path('tests/ac-calculator-pricing.test.js')

c = core.read_text()
s = index.read_text()
t = test.read_text()

# 1) Executable lifecycle helper: Catalog Customer Price edits mutate Catalog only.
anchor = "  function validateAcrCompany(company) {\n"
helper = r'''  function setCatalogCustomerPrice(state, catalogId, rawValue) {
    state = state || {};
    var catalog = Array.isArray(state.catalog) ? state.catalog : [];
    var value = normalizePersistentFinancial(rawValue, INVALID_FINANCIAL);
    var found = false;
    for (var i = 0; i < catalog.length; i++) {
      var row = catalog[i];
      if (!row || String(row.id) !== String(catalogId)) continue;
      row.unitCost = value;
      found = true;
      break;
    }
    return { ok: found && value !== INVALID_FINANCIAL, found: found, value: value };
  }

'''
if 'function setCatalogCustomerPrice(state, catalogId, rawValue)' not in c:
    if anchor not in c:
        raise SystemExit('core helper anchor missing')
    c = c.replace(anchor, helper + anchor, 1)

export_old = "    reconcileMaterialCosts: reconcileMaterialCosts,\n    validateAcrCompany: validateAcrCompany\n"
export_new = "    reconcileMaterialCosts: reconcileMaterialCosts,\n    setCatalogCustomerPrice: setCatalogCustomerPrice,\n    validateAcrCompany: validateAcrCompany\n"
if export_old in c:
    c = c.replace(export_old, export_new, 1)
elif 'setCatalogCustomerPrice: setCatalogCustomerPrice' not in c:
    raise SystemExit('core export anchor missing')

# 2) Catalog Customer Price edit: strict helper + no direct propagation into historical Job Materials.
old_parse = "      var parsedPrice = parseFloat(inputEl.value);\n      var price = (isFinite(parsedPrice) && parsedPrice >= 0) ? parsedPrice : window.BrunoFinancial.INVALID_FINANCIAL;\n"
new_parse = "      var rawPrice = String(inputEl.value == null ? '' : inputEl.value).trim();\n      var result = window.BrunoFinancial.setCatalogCustomerPrice(state, cid, rawPrice === '' ? window.BrunoFinancial.INVALID_FINANCIAL : rawPrice);\n      var price = result.value;\n"
if old_parse not in s:
    raise SystemExit('catalog price parse anchor missing')
s = s.replace(old_parse, new_parse, 1)

# helper owns the Catalog unitCost write; caller still stamps priceUpdated.
s = s.replace("          cat[ci].unitCost = price;\n          cat[ci].priceUpdated = stamp;", "          cat[ci].priceUpdated = stamp;", 1)

mats_pattern = re.compile(r"\n      var mats = \(state && state\.materialsUsed\) \|\| \[\];\n      for \(var mi = 0; mi < mats\.length; mi\+\+\) \{\n        if \(String\(mats\[mi\]\.id\) === String\(cid\) \|\| String\(mats\[mi\]\.catalogId \|\| ''\) === String\(cid\)\) \{\n          mats\[mi\]\.unitCost = price;\n          mats\[mi\]\.priceUpdated = stamp;\n        \}\n      \}")
s, n = mats_pattern.subn("\n      /* Catalog edits are template changes only. Existing Job Materials retain their stored quote basis until explicit Calculator Apply/Re-Apply. */", s, count=1)
if n != 1:
    raise SystemExit('historical Job Material propagation block missing')

# 3) Preserve genuinely blank Your Cost. No upstream materialization from Customer Price.
old_cost_map = "      if (Object.prototype.hasOwnProperty.call(map, id)) row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);\n      else if (row.yourCost == null || row.yourCost === '') row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);\n"
new_cost_map = "      if (Object.prototype.hasOwnProperty.call(map, id)) row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);\n      /* No map entry means Your Cost remains genuinely blank. Effective fallback is resolved at read time so provenance remains customer-price-fallback. */\n"
if old_cost_map not in s:
    raise SystemExit('applyCatalogCostMap fallback anchor missing')
s = s.replace(old_cost_map, new_cost_map, 1)

# 4) Catalog renderer: blank fallback remains visibly distinguishable from explicit Your Cost.
old_render = "          var catYour = (c.yourCost != null && c.yourCost !== '') ? nonNegativeFinancial(c.yourCost) : catPrice;\n          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-your' + (catYour === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (catYour === null ? '' : catYour) + '\" title=\"' + (catYour === null ? 'Invalid direct cost — correct before profitability' : 'Your cost after supplier discount') + '\" aria-label=\"Your cost\"' + (catYour === null ? ' aria-invalid=\"true\"' : '') + ' /></td>';\n"
new_render = "          var catYourSupplied = c.yourCost != null && c.yourCost !== '';\n          var catYour = catYourSupplied ? nonNegativeFinancial(c.yourCost) : null;\n          var catYourInvalid = catYourSupplied && catYour === null;\n          var catYourPlaceholder = !catYourSupplied && catPrice !== null ? ('fallback ' + catPrice) : '';\n          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-your' + (catYourInvalid ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (catYourSupplied && catYour !== null ? catYour : '') + '\" placeholder=\"' + esc(catYourPlaceholder) + '\" title=\"' + (catYourInvalid ? 'Invalid direct cost — correct before profitability' : (catYourSupplied ? 'Your cost after supplier discount' : 'Blank: Customer Price fallback; enter a value to create explicit Catalog Your Cost')) + '\" aria-label=\"Your cost\"' + (catYourInvalid ? ' aria-invalid=\"true\"' : '') + ' /></td>';\n"
if old_render not in s:
    raise SystemExit('Catalog Your Cost renderer anchor missing')
s = s.replace(old_render, new_render, 1)

# 5) Executable lifecycle regression in Calculator suite.
append = r'''

// Catalog -> historical Job lifecycle: Catalog template edits must NOT mutate existing Job Materials.
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

  const scope = { version: 'test', inputs: {} };
  const bom = [{ key:'k1', selected:true, resolved:true, qty:2, units:'ea', label:'A', level:'scope', reason:'', code:'', catalogId:'CAT-A', item:'A', part:'', vendor:'', customerUnitPrice:110, yourUnitCost:55, customerPriceSource:'catalog-customer-price', yourCostSource:'catalog-your-cost', pricingState:'valid' }];
  const reapplied = E.applyBomToJob(state, scope, bom).state;
  const generated = reapplied.materialsUsed.find(r => r.calcSource === 'ac-calculator');
  assert.strictEqual(generated.unitCost, 110, 'explicit re-Apply should update Customer Price');
  assert.strictEqual(generated.procurementCostSnapshot, 55, 'explicit re-Apply should update procurement snapshot');
}

// Blank Your Cost must remain semantically blank upstream so Calculator can classify fallback honestly.
{
  const p = E.catalogPricing({ id:'CAT-B', unitCost:50, yourCost:'' });
  assert.strictEqual(p.customerUnitPrice, 50);
  assert.strictEqual(p.yourUnitCost, 50);
  assert.strictEqual(p.yourCostSource, 'customer-price-fallback');
}

assert.ok(!source.includes('mats[mi].unitCost = price'), 'Catalog Customer Price edit must not rewrite existing Job Materials');
assert.ok(!source.includes("else if (row.yourCost == null || row.yourCost === '') row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0)"), 'blank Your Cost must remain blank for provenance');
assert.ok(source.includes('setCatalogCustomerPrice(state, cid'), 'Catalog Customer Price edit should use executable lifecycle helper');
'''
if 'Catalog -> historical Job lifecycle' not in t:
    if "const F = require('../financial-integrity-core.js');" not in t:
        t = t.replace("const E = require('../ac-calculator-engine.js');", "const E = require('../ac-calculator-engine.js');\nconst F = require('../financial-integrity-core.js');", 1)
    t += append

core.write_text(c)
index.write_text(s)
test.write_text(t)
