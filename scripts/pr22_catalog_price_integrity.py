from pathlib import Path

index = Path('index.html')
tests = Path('tests/financial-integrity.test.js')
s = index.read_text()

# 1) Persist/reload catalog customer price without invalid -> zero coercion.
s = s.replace("if (Object.prototype.hasOwnProperty.call(map, id)) row.unitCost = Number(map[id]) || 0;", "if (Object.prototype.hasOwnProperty.call(map, id)) row.unitCost = window.BrunoFinancial.normalizePersistentFinancial(map[id], 0);", 1)
s = s.replace("      row.unitCost = normalizeFinancialValue(row.unitCost);\n      row.crew = asNum(row.crew) || 1;", "      row.unitCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);\n      row.crew = asNum(row.crew) || 1;", 1)

# 2) Catalog renderer: invalid customer price must not display 0.
old = """          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-cost\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (Number(c.unitCost) || 0) + '\" title=\"Customer / shop price (used in quotes)\" aria-label=\"Customer price\" /></td>';\n"""
new = """          var catPrice = nonNegativeFinancial(c.unitCost);\n          html += '<td class=\"col-cost\"><input type=\"number\" class=\"num cat-cost' + (catPrice === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" data-id=\"' + esc(c.id) + '\" value=\"' + (catPrice === null ? '' : catPrice) + '\" title=\"' + (catPrice === null ? 'Invalid customer price — correct before quoting' : 'Customer / shop price (used in quotes)') + '\" aria-label=\"Customer price\"' + (catPrice === null ? ' aria-invalid=\"true\"' : '') + ' /></td>';\n"""
if old not in s:
    raise SystemExit('catalog renderer anchor missing')
s = s.replace(old, new, 1)

# 3) Catalog customer-price edit: preserve invalid sentinel and sync same invalid state to job material.
old = """      var price = parseFloat(inputEl.value);\n      if (!isFinite(price) || price < 0) price = 0;\n      inputEl.value = price;\n"""
new = """      var parsedPrice = parseFloat(inputEl.value);\n      var price = (isFinite(parsedPrice) && parsedPrice >= 0) ? parsedPrice : window.BrunoFinancial.INVALID_FINANCIAL;\n      inputEl.value = price === window.BrunoFinancial.INVALID_FINANCIAL ? '' : price;\n      inputEl.classList.toggle('invalid-financial', price === window.BrunoFinancial.INVALID_FINANCIAL);\n      inputEl.setAttribute('aria-invalid', price === window.BrunoFinancial.INVALID_FINANCIAL ? 'true' : 'false');\n"""
if old not in s:
    raise SystemExit('applyCatalogUnitPrice parse anchor missing')
s = s.replace(old, new, 1)

# Preserve invalid values in catalog price maps instead of Number(...)||0.
s = s.replace("priceMap[String(cat[ci].id)] = Number(cat[ci].unitCost) || 0;", "priceMap[String(cat[ci].id)] = window.BrunoFinancial.normalizePersistentFinancial(cat[ci].unitCost, 0);", 2)

# 4) Margins renderer: customer price invalid must stay visibly invalid, not become 0.
old = """      var cust = Number(c.unitCost) || 0;\n      var yours = (c.yourCost != null && c.yourCost !== '') ? (Number(c.yourCost) || 0) : cust;\n      var diff = cust - yours;\n      var pct = cust > 0 ? (diff / cust) * 100 : 0;\n      sumCust += cust; sumCost += yours; n++;\n"""
new = """      var cust = nonNegativeFinancial(c.unitCost);\n      var yours = (c.yourCost != null && c.yourCost !== '') ? nonNegativeFinancial(c.yourCost) : cust;\n      var marginValid = cust !== null && yours !== null;\n      var diff = marginValid ? cust - yours : NaN;\n      var pct = marginValid && cust > 0 ? (diff / cust) * 100 : (marginValid ? 0 : NaN);\n      if (marginValid) { sumCust += cust; sumCost += yours; n++; }\n"""
if old not in s:
    raise SystemExit('renderMargins math anchor missing')
s = s.replace(old, new, 1)
s = s.replace("html += '<td class=\"col-cost\"><input type=\"number\" class=\"num mrg-cust\" step=\"0.01\" min=\"0\" value=\"' + cust + '\" /></td>';", "html += '<td class=\"col-cost\"><input type=\"number\" class=\"num mrg-cust' + (cust === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" value=\"' + (cust === null ? '' : cust) + '\"' + (cust === null ? ' aria-invalid=\"true\" title=\"Invalid customer price — correct before quoting\"' : '') + ' /></td>';", 1)
s = s.replace("html += '<td class=\"num-cell\">' + money(diff) + '</td>';", "html += '<td class=\"num-cell\">' + safeMoney(diff) + '</td>';", 1)
s = s.replace("html += '<td class=\"num-cell\">' + (Math.round(pct * 10) / 10) + '%</td>';", "html += '<td class=\"num-cell\">' + (isFinite(pct) ? (Math.round(pct * 10) / 10) + '%' : '—') + '</td>';", 1)

# 5) Margins customer-price edit: no Math.max/parseFloat || 0.
old = """      if (e.target.classList.contains('mrg-cust')) {\n        row.unitCost = Math.max(0, parseFloat(e.target.value) || 0);\n"""
new = """      if (e.target.classList.contains('mrg-cust')) {\n        var cp = parseFloat(e.target.value);\n        row.unitCost = (isFinite(cp) && cp >= 0) ? cp : window.BrunoFinancial.INVALID_FINANCIAL;\n"""
if old not in s:
    raise SystemExit('margins customer edit anchor missing')
s = s.replace(old, new, 1)

# Defensive sweep: a duplicate customer-price helper used the same legacy invalid->zero line.
legacy_zero = "if (!isFinite(price) || price < 0) price = 0;"
if legacy_zero in s:
    s = s.replace(legacy_zero, "if (!isFinite(price) || price < 0) price = window.BrunoFinancial.INVALID_FINANCIAL;")

index.write_text(s)

t = tests.read_text()
append = r'''

// Catalog customer-price integrity regression coverage.
{
  const src = source;
  assert(!src.includes('if (!isFinite(price) || price < 0) price = 0;'), 'catalog edit must not turn invalid customer price into zero');
  assert(!src.includes("row.unitCost = Math.max(0, parseFloat(e.target.value) || 0);"), 'margins customer price must not coerce invalid to zero');
  assert(!src.includes('priceMap[String(cat[ci].id)] = Number(cat[ci].unitCost) || 0;'), 'catalog price map must preserve invalid sentinel');
  assert(!src.includes('row.unitCost = Number(map[id]) || 0;'), 'catalog price reload must preserve invalid sentinel');
  assert(!src.includes("value=\"' + (Number(c.unitCost) || 0)"), 'catalog customer-price renderer must not show invalid as zero');
  assert(src.includes("price = (isFinite(parsedPrice) && parsedPrice >= 0) ? parsedPrice : window.BrunoFinancial.INVALID_FINANCIAL"));
  assert(src.includes("row.unitCost = (isFinite(cp) && cp >= 0) ? cp : window.BrunoFinancial.INVALID_FINANCIAL"));
  assert(src.includes("mats[mi].unitCost = price"), 'catalog edit must propagate the same valid/invalid state to matching job material');
  assert(src.includes("mats[mi].unitCost = row.unitCost"), 'margins edit must propagate the same valid/invalid state to matching job material');

  const inv = F.INVALID_FINANCIAL;
  const bad = F.normalizePersistentFinancial('abc', 0);
  assert.strictEqual(bad, inv);
  const persisted = JSON.parse(JSON.stringify({ unitCost: bad }));
  assert.strictEqual(persisted.unitCost, inv);
  assert.strictEqual(F.normalizePersistentFinancial(persisted.unitCost, 0), inv);
  assert.strictEqual(F.methodASales(persisted.unitCost, 0.25, 0.15).ok, false, 'invalid persisted customer price must not become a valid Method A zero-cost input');
}
'''
if 'Catalog customer-price integrity regression coverage.' not in t:
    t += append
tests.write_text(t)
