from pathlib import Path

index = Path('index.html')
tests = Path('tests/financial-integrity.test.js')
s = index.read_text()

# Persistence: never collapse invalid direct cost to zero.
s = s.replace("map[String(cat[i].id)] = Number(cat[i].yourCost) || 0;", "map[String(cat[i].id)] = window.BrunoFinancial.normalizePersistentFinancial(cat[i].yourCost, 0);", 1)
s = s.replace("if (Object.prototype.hasOwnProperty.call(map, id)) row.yourCost = Number(map[id]) || 0;", "if (Object.prototype.hasOwnProperty.call(map, id)) row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);", 1)
s = s.replace("else if (row.yourCost == null || row.yourCost === '') row.yourCost = Number(row.unitCost) || 0;", "else if (row.yourCost == null || row.yourCost === '') row.yourCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);", 1)

# Catalog Your Cost renderer: explicit invalid state, never fake zero.
old = """          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-your\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (c.yourCost != null && c.yourCost !== '' ? (Number(c.yourCost) || 0) : (Number(c.unitCost) || 0)) + '\" title=\"Your cost after supplier discount\" aria-label=\"Your cost\" /></td>';\n"""
new = """          var catYour = (c.yourCost != null && c.yourCost !== '') ? nonNegativeFinancial(c.yourCost) : catPrice;\n          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-your' + (catYour === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (catYour === null ? '' : catYour) + '\" title=\"' + (catYour === null ? 'Invalid direct cost — correct before profitability' : 'Your cost after supplier discount') + '\" aria-label=\"Your cost\"' + (catYour === null ? ' aria-invalid=\"true\"' : '') + ' /></td>';\n"""
if old not in s:
    raise SystemExit('catalog your-cost renderer anchor missing')
s = s.replace(old, new, 1)

# Catalog direct-cost edit: strict exact semantics and visible invalid state.
old = """      var price = parseFloat(inputEl.value);\n      if (!isFinite(price) || price < 0) price = window.BrunoFinancial.INVALID_FINANCIAL;\n      inputEl.value = price;\n"""
new = """      var rawYour = String(inputEl.value == null ? '' : inputEl.value).trim();\n      var parsedYour = rawYour === '' ? NaN : Number(rawYour);\n      var price = (isFinite(parsedYour) && parsedYour >= 0) ? parsedYour : window.BrunoFinancial.INVALID_FINANCIAL;\n      inputEl.value = price === window.BrunoFinancial.INVALID_FINANCIAL ? '' : price;\n      inputEl.classList.toggle('invalid-financial', price === window.BrunoFinancial.INVALID_FINANCIAL);\n      inputEl.setAttribute('aria-invalid', price === window.BrunoFinancial.INVALID_FINANCIAL ? 'true' : 'false');\n"""
if old not in s:
    raise SystemExit('applyCatalogYourCost anchor missing')
s = s.replace(old, new, 1)

# Catalog Add: distinguish invalid customer price and preserve invalid direct-cost snapshot.
old = """      var uc = Number(c.unitCost) || 0;\n      if (uc === 0) {\n        if (!confirm('This catalog line is $0. Adding it will understate Material Cost and Method A sales until you set a unit price on Job materials.\\n\\nAdd anyway?')) return;\n      }\n"""
new = """      var uc = nonNegativeFinancial(c.unitCost);\n      if (uc === null) {\n        alert('Customer price is invalid. Correct it before adding this catalog item to the job.');\n        return;\n      }\n      if (uc === 0) {\n        if (!confirm('This catalog line is $0. Adding it will understate Material Cost and Method A sales until you set a unit price on Job materials.\\n\\nAdd anyway?')) return;\n      }\n"""
if old not in s:
    raise SystemExit('catalog add preflight anchor missing')
s = s.replace(old, new, 1)
s = s.replace("procurementCostSnapshot: (c.yourCost != null && c.yourCost !== '' ? Number(c.yourCost) : null), procurementCostSource: (c.yourCost != null && c.yourCost !== '' ? 'catalog_yourCost_snapshot' : '')", "procurementCostSnapshot: (c.yourCost != null && c.yourCost !== '' ? window.BrunoFinancial.normalizePersistentFinancial(c.yourCost, 0) : null), procurementCostSource: (c.yourCost != null && c.yourCost !== '' ? 'catalog_yourCost_snapshot' : '')", 1)

# Margins Your Cost renderer must visibly preserve invalid direct cost.
s = s.replace("html += '<td class=\"col-cost\"><input type=\"number\" class=\"num mrg-your\" step=\"0.01\" min=\"0\" value=\"' + yours + '\" /></td>';", "html += '<td class=\"col-cost\"><input type=\"number\" class=\"num mrg-your' + (yours === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" value=\"' + (yours === null ? '' : yours) + '\"' + (yours === null ? ' aria-invalid=\"true\" title=\"Invalid direct cost — correct before profitability\"' : '') + ' /></td>';", 1)
# Margin percent editor should also show invalid state rather than NaN in number input.
s = s.replace("html += '<td class=\"col-cost\"><input type=\"number\" class=\"num mrg-pct\" step=\"0.1\" min=\"0\" max=\"100\" value=\"' + (Math.round(pct * 10) / 10) + '\" title=\"% off customer → your cost\" /></td>';", "html += '<td class=\"col-cost\"><input type=\"number\" class=\"num mrg-pct' + (!isFinite(pct) ? ' invalid-financial' : '') + '\" step=\"0.1\" min=\"0\" max=\"100\" value=\"' + (isFinite(pct) ? (Math.round(pct * 10) / 10) : '') + '\" title=\"% off customer → your cost\"' + (!isFinite(pct) ? ' aria-invalid=\"true\"' : '') + ' /></td>';", 1)

# Direct cost edit in Margins: invalid supplied value stays invalid.
s = s.replace("row.yourCost = Math.max(0, parseFloat(e.target.value) || 0);", "var ycRaw = String(e.target.value == null ? '' : e.target.value).trim(); var yc = ycRaw === '' ? NaN : Number(ycRaw); row.yourCost = (isFinite(yc) && yc >= 0) ? yc : window.BrunoFinancial.INVALID_FINANCIAL;", 1)

# Discount editor: malformed percentage or invalid customer price must not create a valid zero direct cost.
old = """        var cust = Number(row.unitCost) || 0;\n        var pct = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));\n        row.yourCost = Math.round(cust * (1 - pct / 100) * 100) / 100;\n        saveCatalogCostMapFromState();\n"""
new = """        var cust = nonNegativeFinancial(row.unitCost);\n        var pctRaw = String(e.target.value == null ? '' : e.target.value).trim();\n        var pct = pctRaw === '' ? NaN : Number(pctRaw);\n        if (cust === null || !isFinite(pct) || pct < 0 || pct > 100) row.yourCost = window.BrunoFinancial.INVALID_FINANCIAL;\n        else row.yourCost = Math.round(cust * (1 - pct / 100) * 100) / 100;\n        saveCatalogCostMapFromState();\n"""
if old not in s:
    raise SystemExit('margins pct anchor missing')
s = s.replace(old, new, 1)

# Bulk discount: each invalid customer-price row remains invalid direct cost.
s = s.replace("var cust = Number(c.unitCost) || 0;\n        c.yourCost = Math.round(cust * (1 - pct / 100) * 100) / 100;", "var cust = nonNegativeFinancial(c.unitCost);\n        c.yourCost = cust === null ? window.BrunoFinancial.INVALID_FINANCIAL : Math.round(cust * (1 - pct / 100) * 100) / 100;", 1)
# Equal-cost helper: invalid customer price stays invalid direct cost.
s = s.replace("for (var i = 0; i < cat.length; i++) if (cat[i]) cat[i].yourCost = Number(cat[i].unitCost) || 0;", "for (var i = 0; i < cat.length; i++) if (cat[i]) cat[i].yourCost = window.BrunoFinancial.normalizePersistentFinancial(cat[i].unitCost, 0);", 1)

# catalogDiscPct helper must not mask invalid direct cost/customer price as zero.
old = """  function catalogDiscPct(c) {\n    var cust = Number(c.unitCost) || 0;\n    var yours = (c.yourCost != null && c.yourCost !== '') ? (Number(c.yourCost) || 0) : cust;\n    if (cust <= 0) return 0;\n    return ((cust - yours) / cust) * 100;\n  }\n"""
new = """  function catalogDiscPct(c) {\n    var cust = nonNegativeFinancial(c.unitCost);\n    var yours = (c.yourCost != null && c.yourCost !== '') ? nonNegativeFinancial(c.yourCost) : cust;\n    if (cust === null || yours === null) return NaN;\n    if (cust <= 0) return 0;\n    return ((cust - yours) / cust) * 100;\n  }\n"""
if old not in s:
    raise SystemExit('catalogDiscPct anchor missing')
s = s.replace(old, new, 1)

# Existing labor-block header had a display-only invalid->zero path; keep it aligned with strict burden semantics.
s = s.replace("'burden $'+(Number(bur.straight)||0).toFixed(2)+'/hr · '+safeMoney(det.cost)+' · '+(Number(det.totalHrs)||0).toFixed(1)+' h'", "'burden '+(nonNegativeFinancial(bur.straight)===null?'—':money(nonNegativeFinancial(bur.straight)))+'/hr · '+safeMoney(det.cost)+' · '+(isFinite(det.totalHrs)?det.totalHrs.toFixed(1):'—')+' h'", 1)

index.write_text(s)

t = tests.read_text()
append = r'''

// Catalog direct-cost / Your Cost end-to-end integrity guards.
{
  const src = source;
  const forbidden = [
    "row.yourCost = Math.max(0, parseFloat(e.target.value) || 0);",
    "map[String(cat[i].id)] = Number(cat[i].yourCost) || 0;",
    "row.yourCost = Number(map[id]) || 0;",
    "value=\"' + (c.yourCost != null && c.yourCost !== '' ? (Number(c.yourCost) || 0)",
    "procurementCostSnapshot: (c.yourCost != null && c.yourCost !== '' ? Number(c.yourCost) : null)",
    "var uc = Number(c.unitCost) || 0;",
    "for (var i = 0; i < cat.length; i++) if (cat[i]) cat[i].yourCost = Number(cat[i].unitCost) || 0;"
  ];
  forbidden.forEach((x) => assert(!src.includes(x), `unsafe direct-cost coercion remains: ${x}`));
  assert(src.includes("row.yourCost = (isFinite(yc) && yc >= 0) ? yc : window.BrunoFinancial.INVALID_FINANCIAL"));
  assert(src.includes("normalizePersistentFinancial(cat[i].yourCost, 0)"));
  assert(src.includes("normalizePersistentFinancial(map[id], 0)"));
  assert(src.includes("procurementCostSnapshot: (c.yourCost != null && c.yourCost !== '' ? window.BrunoFinancial.normalizePersistentFinancial(c.yourCost, 0) : null)"));

  const inv = F.INVALID_FINANCIAL;
  for (const bad of ['abc', 'Infinity', Infinity, NaN, -1]) {
    const normalized = F.normalizePersistentFinancial(bad, 0);
    assert.strictEqual(normalized, inv);
    const roundTrip = JSON.parse(JSON.stringify({ yourCost: normalized, procurementCostSnapshot: normalized }));
    assert.strictEqual(roundTrip.yourCost, inv);
    assert.strictEqual(roundTrip.procurementCostSnapshot, inv);
    assert.strictEqual(F.normalizePersistentFinancial(roundTrip.yourCost, 0), inv);
  }
  assert.strictEqual(F.normalizePersistentFinancial(0, 0), 0, 'legitimate zero direct cost must remain valid zero');
  assert.strictEqual(F.normalizePersistentFinancial('75.50', 0), 75.5);
}
'''
if 'Catalog direct-cost / Your Cost end-to-end integrity guards.' not in t:
    t += append
tests.write_text(t)
