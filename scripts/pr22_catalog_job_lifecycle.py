from pathlib import Path
import re

core = Path('financial-integrity-core.js')
index = Path('index.html')
calc_test = Path('tests/ac-calculator-pricing.test.js')
fin_test = Path('tests/financial-integrity.test.js')

c = core.read_text()
s = index.read_text()
t = calc_test.read_text()
f = fin_test.read_text()

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
    if anchor not in c: raise SystemExit('core helper anchor missing')
    c = c.replace(anchor, helper + anchor, 1)
export_old = "    reconcileMaterialCosts: reconcileMaterialCosts,\n    validateAcrCompany: validateAcrCompany\n"
export_new = "    reconcileMaterialCosts: reconcileMaterialCosts,\n    setCatalogCustomerPrice: setCatalogCustomerPrice,\n    validateAcrCompany: validateAcrCompany\n"
if export_old in c: c = c.replace(export_old, export_new, 1)
elif 'setCatalogCustomerPrice: setCatalogCustomerPrice' not in c: raise SystemExit('core export anchor missing')

old_parse = "      var parsedPrice = parseFloat(inputEl.value);\n      var price = (isFinite(parsedPrice) && parsedPrice >= 0) ? parsedPrice : window.BrunoFinancial.INVALID_FINANCIAL;\n"
new_parse = "      var rawPrice = String(inputEl.value == null ? '' : inputEl.value).trim();\n      var result = window.BrunoFinancial.setCatalogCustomerPrice(state, cid, rawPrice === '' ? window.BrunoFinancial.INVALID_FINANCIAL : rawPrice);\n      var price = result.value;\n"
if old_parse not in s: raise SystemExit('catalog price parse anchor missing')
s = s.replace(old_parse, new_parse, 1)
s = s.replace("          cat[ci].unitCost = price;\n          cat[ci].priceUpdated = stamp;", "          cat[ci].priceUpdated = stamp;", 1)

catalog_mats = re.compile(r"\n      var mats = \(state && state\.materialsUsed\) \|\| \[\];\n      for \(var mi = 0; mi < mats\.length; mi\+\+\) \{\n        if \(String\(mats\[mi\]\.id\) === String\(cid\) \|\| String\(mats\[mi\]\.catalogId \|\| ''\) === String\(cid\)\) \{\n          mats\[mi\]\.unitCost = price;\n          mats\[mi\]\.priceUpdated = stamp;\n        \}\n      \}")
s, n = catalog_mats.subn("\n      /* Catalog edits are template changes only. Existing Job Materials retain their stored quote basis until explicit Calculator Apply/Re-Apply. */", s, count=1)
if n != 1: raise SystemExit('catalog -> Job propagation block missing')

# Remove the complete legacy Margins -> Job sync block, preserving surrounding listener braces.
old_margin_sync = """      // sync job materials customer price if same id
      if (e.target.classList.contains('mrg-cust')) {
        var mats = (state && state.materialsUsed) || [];
        for (var mi = 0; mi < mats.length; mi++) {
          if (String(mats[mi].id) === String(id) || String(mats[mi].catalogId || '') === String(id)) mats[mi].unitCost = row.unitCost;
        }
      }
"""
new_margin_sync = """      // Catalog/Margins edits update the pricing template only.
      // Existing Job Materials remain immutable until explicit Calculator Apply/Re-Apply.
"""
if old_margin_sync not in s: raise SystemExit('exact margins sync block missing')
s = s.replace(old_margin_sync, new_margin_sync, 1)

old_cost_map = "      if (Object.prototype.hasOwnProperty.call(map, id)) row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);\n      else if (row.yourCost == null || row.yourCost === '') row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);\n"
new_cost_map = "      if (Object.prototype.hasOwnProperty.call(map, id)) row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);\n      /* No map entry means Your Cost remains genuinely blank. Effective fallback is resolved at read time so provenance remains customer-price-fallback. */\n"
if old_cost_map not in s: raise SystemExit('applyCatalogCostMap fallback anchor missing')
s = s.replace(old_cost_map, new_cost_map, 1)

old_render = "          var catYour = (c.yourCost != null && c.yourCost !== '') ? nonNegativeFinancial(c.yourCost) : catPrice;\n          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-your' + (catYour === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (catYour === null ? '' : catYour) + '\" title=\"' + (catYour === null ? 'Invalid direct cost — correct before profitability' : 'Your cost after supplier discount') + '\" aria-label=\"Your cost\"' + (catYour === null ? ' aria-invalid=\"true\"' : '') + ' /></td>';\n"
new_render = "          var catYourSupplied = c.yourCost != null && c.yourCost !== '';\n          var catYour = catYourSupplied ? nonNegativeFinancial(c.yourCost) : null;\n          var catYourInvalid = catYourSupplied && catYour === null;\n          var catYourPlaceholder = !catYourSupplied && catPrice !== null ? ('fallback ' + catPrice) : '';\n          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-your' + (catYourInvalid ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (catYourSupplied && catYour !== null ? catYour : '') + '\" placeholder=\"' + esc(catYourPlaceholder) + '\" title=\"' + (catYourInvalid ? 'Invalid direct cost — correct before profitability' : (catYourSupplied ? 'Your cost after supplier discount' : 'Blank: Customer Price fallback; enter a value to create explicit Catalog Your Cost')) + '\" aria-label=\"Your cost\"' + (catYourInvalid ? ' aria-invalid=\"true\"' : '') + ' /></td>';\n"
if old_render not in s: raise SystemExit('Catalog Your Cost renderer anchor missing')
s = s.replace(old_render, new_render, 1)

f = f.replace("  assert(src.includes(\"price = (isFinite(parsedPrice) && parsedPrice >= 0) ? parsedPrice : window.BrunoFinancial.INVALID_FINANCIAL\"));", "  assert(src.includes('setCatalogCustomerPrice(state, cid'), 'catalog edit must use strict lifecycle helper');")
f = f.replace("  assert(src.includes(\"mats[mi].unitCost = price\"), 'catalog edit must propagate the same valid/invalid state to matching job material');", "  assert(!src.includes(\"mats[mi].unitCost = price\"), 'Catalog edit must not mutate historical Job Material');")
f = f.replace("  assert(src.includes(\"mats[mi].unitCost = row.unitCost\"), 'margins edit must propagate the same valid/invalid state to matching job material');", "  assert(!src.includes(\"mats[mi].unitCost = row.unitCost\"), 'Margins Catalog edit must not mutate historical Job Material');")

append = r'''

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
'''
if 'Catalog -> historical Job lifecycle' not in t:
    if "const F = require('../financial-integrity-core.js');" not in t:
        t = t.replace("const E = require('../ac-calculator-engine.js');", "const E = require('../ac-calculator-engine.js');\nconst F = require('../financial-integrity-core.js');", 1)
    t += append

core.write_text(c)
index.write_text(s)
calc_test.write_text(t)
fin_test.write_text(f)
