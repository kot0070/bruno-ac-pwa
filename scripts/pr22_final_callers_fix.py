from pathlib import Path

core = Path('financial-integrity-core.js')
index = Path('index.html')
tests = Path('tests/financial-integrity.test.js')

c = core.read_text()
# Add general JSON-safe financial sentinel/helper before exported API close by anchoring explicit helper.
anchor = "  var INVALID_EXPLICIT_LABOR = 'INVALID_EXPLICIT_LABOR';\n"
if anchor not in c:
    raise SystemExit('core anchor missing')
if "INVALID_FINANCIAL" not in c:
    c = c.replace(anchor, "  var INVALID_FINANCIAL = 'INVALID_FINANCIAL';\n" + anchor, 1)

anchor2 = "  function normalizeExplicitLaborValue(value, defaultValue) {\n"
if anchor2 not in c:
    raise SystemExit('normalizeExplicitLaborValue anchor missing')
if "function normalizePersistentFinancial" not in c:
    helper = """  function normalizePersistentFinancial(value, defaultValue) {\n    if (value === INVALID_FINANCIAL) return INVALID_FINANCIAL;\n    if (value === null || value === undefined || value === '') return defaultValue;\n    var n = Number(value);\n    return Number.isFinite(n) && n >= 0 ? n : INVALID_FINANCIAL;\n  }\n\n"""
    c = c.replace(anchor2, helper + anchor2, 1)

# Export helper/constant near existing exports.
if "INVALID_FINANCIAL: INVALID_FINANCIAL" not in c:
    c = c.replace("    INVALID_EXPLICIT_LABOR: INVALID_EXPLICIT_LABOR,", "    INVALID_FINANCIAL: INVALID_FINANCIAL,\n    INVALID_EXPLICIT_LABOR: INVALID_EXPLICIT_LABOR,", 1)
if "normalizePersistentFinancial: normalizePersistentFinancial" not in c:
    c = c.replace("    normalizeExplicitLaborValue: normalizeExplicitLaborValue,", "    normalizePersistentFinancial: normalizePersistentFinancial,\n    normalizeExplicitLaborValue: normalizeExplicitLaborValue,", 1)
core.write_text(c)

s = index.read_text()

# Persistent strict normalization for P&L actuals.
old = """    s.pnl.actualLabor = asNum(s.pnl.actualLabor);\n    s.pnl.actualEquip = asNum(s.pnl.actualEquip);\n    s.pnl.actualSub = asNum(s.pnl.actualSub);\n    if (s.pnl.actualMaterial != null && s.pnl.actualMaterial !== '') s.pnl.actualMaterial = asNum(s.pnl.actualMaterial);\n"""
new = """    s.pnl.actualLabor = window.BrunoFinancial.normalizePersistentFinancial(s.pnl.actualLabor, 0);\n    s.pnl.actualEquip = window.BrunoFinancial.normalizePersistentFinancial(s.pnl.actualEquip, 0);\n    s.pnl.actualSub = window.BrunoFinancial.normalizePersistentFinancial(s.pnl.actualSub, 0);\n    if (s.pnl.actualMaterial != null && s.pnl.actualMaterial !== '') s.pnl.actualMaterial = window.BrunoFinancial.normalizePersistentFinancial(s.pnl.actualMaterial, 0);\n"""
if old not in s: raise SystemExit('pnl normalize block missing')
s = s.replace(old, new, 1)

# Harden imported/material/equipment/sub/burden persistence against nonfinite -> JSON null -> zero.
s = s.replace("      row.qty = normalizeFinancialValue(row.qty);\n      row.unitCost = normalizeFinancialValue(row.unitCost);", "      row.qty = window.BrunoFinancial.normalizePersistentFinancial(row.qty, 0);\n      row.unitCost = window.BrunoFinancial.normalizePersistentFinancial(row.unitCost, 0);", 1)
s = s.replace("if (row && typeof row === 'object') row.cost = normalizeFinancialValue(row.cost);", "if (row && typeof row === 'object') row.cost = window.BrunoFinancial.normalizePersistentFinancial(row.cost, 0);", 1)
s = s.replace("if (row && typeof row === 'object') row.price = normalizeFinancialValue(row.price);", "if (row && typeof row === 'object') row.price = window.BrunoFinancial.normalizePersistentFinancial(row.price, 0);", 1)
s = s.replace("if (row && typeof row === 'object') row.straight = normalizeFinancialValue(row.straight);", "if (row && typeof row === 'object') row.straight = window.BrunoFinancial.normalizePersistentFinancial(row.straight, 0);", 1)

# Small-tools aggregate must not pre-coerce invalid to zero.
s = s.replace("if (stTot) stTot.textContent = money(calc.le.smallToolsCost || 0);", "if (stTot) stTot.textContent = safeMoney(calc.le.smallToolsCost);", 1)

# Strict renderers for materials/equipment/subs.
old_mat = """      var ext = (Number(m.qty) || 0) * (Number(m.unitCost) || 0);\n      html += '<tr data-i="' + i + '">' +\n        '<td><input type="number" class="num mat-qty" step="any" value="' + (Number(m.qty) || 0) + '" /></td>' +\n"""
new_mat = """      var mq = nonNegativeFinancial(m.qty), mc = nonNegativeFinancial(m.unitCost);\n      var ext = (mq === null || mc === null) ? NaN : mq * mc;\n      html += '<tr data-i="' + i + '">' +\n        '<td><input type="number" class="num mat-qty' + (mq === null ? ' invalid-financial' : '') + '" step="any" min="0" value="' + (mq === null ? '' : mq) + '"' + (mq === null ? ' aria-invalid="true" title="Invalid financial value — correct before pricing"' : '') + ' /></td>' +\n"""
if old_mat not in s: raise SystemExit('material render anchor missing')
s = s.replace(old_mat, new_mat, 1)
s = s.replace("'<td><input type=\"number\" class=\"num mat-cost\" step=\"0.01\" value=\"' + (Number(m.unitCost) || 0) + '\" /></td>' +", "'<td><input type=\"number\" class=\"num mat-cost' + (mc === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" value=\"' + (mc === null ? '' : mc) + '\"' + (mc === null ? ' aria-invalid=\"true\" title=\"Invalid financial value — correct before pricing\"' : '') + ' /></td>' +", 1)
s = s.replace("'<td class=\"num-cell\">' + money(ext) + '</td>' +", "'<td class=\"num-cell\">' + safeMoney(ext) + '</td>' +", 1)

old_eq = """    for (var i = 0; i < eqs.length; i++) {\n      html += '<tr data-i="' + i + '">' +\n        '<td><input type="text" class="eq-name" value="' + esc(eqs[i].name) + '" /></td>' +\n        '<td><input type="number" class="num eq-cost" step="0.01" value="' + (Number(eqs[i].cost) || 0) + '" /></td>' +\n"""
new_eq = """    for (var i = 0; i < eqs.length; i++) {\n      var ecv = nonNegativeFinancial(eqs[i].cost);\n      html += '<tr data-i="' + i + '">' +\n        '<td><input type="text" class="eq-name" value="' + esc(eqs[i].name) + '" /></td>' +\n        '<td><input type="number" class="num eq-cost' + (ecv === null ? ' invalid-financial' : '') + '" step="0.01" min="0" value="' + (ecv === null ? '' : ecv) + '"' + (ecv === null ? ' aria-invalid="true" title="Invalid financial value — correct before pricing"' : '') + ' /></td>' +\n"""
if old_eq not in s: raise SystemExit('equip render anchor missing')
s = s.replace(old_eq, new_eq, 1)

old_sub = """    for (var i = 0; i < subs.length; i++) {\n      html += '<tr data-i="' + i + '">' +\n        '<td><input type="text" class="sub-name" value="' + esc(subs[i].name) + '" /></td>' +\n        '<td><input type="text" class="sub-work" value="' + esc(subs[i].work) + '" /></td>' +\n        '<td><input type="number" class="num sub-price" step="0.01" value="' + (Number(subs[i].price) || 0) + '" /></td>' +\n"""
new_sub = """    for (var i = 0; i < subs.length; i++) {\n      var spv = nonNegativeFinancial(subs[i].price);\n      html += '<tr data-i="' + i + '">' +\n        '<td><input type="text" class="sub-name" value="' + esc(subs[i].name) + '" /></td>' +\n        '<td><input type="text" class="sub-work" value="' + esc(subs[i].work) + '" /></td>' +\n        '<td><input type="number" class="num sub-price' + (spv === null ? ' invalid-financial' : '') + '" step="0.01" min="0" value="' + (spv === null ? '' : spv) + '"' + (spv === null ? ' aria-invalid="true" title="Invalid financial value — correct before pricing"' : '') + ' /></td>' +\n"""
if old_sub not in s: raise SystemExit('sub render anchor missing')
s = s.replace(old_sub, new_sub, 1)

# Material in-place extension must stay strict.
s = s.replace("tr.querySelector('.num-cell').textContent = money((m.qty || 0) * (m.unitCost || 0));", "var mqv=nonNegativeFinancial(m.qty), mcv=nonNegativeFinancial(m.unitCost); tr.querySelector('.num-cell').textContent = safeMoney(mqv===null||mcv===null?NaN:mqv*mcv);", 1)

# Burden rendering and edits: preserve invalid rather than turn it into zero.
old_rp = """    var oh = Number(state.summary.ohRate) || 0;\n    var profit = Number(state.summary.profitMargin) || 0;\n"""
new_rp = """    var oh = finiteFinancial(state.summary.ohRate);\n    var profit = finiteFinancial(state.summary.profitMargin);\n"""
if old_rp not in s: raise SystemExit('renderPersonnel rates anchor missing')
s = s.replace(old_rp, new_rp, 1)
s = s.replace("      var st = Number(b.straight) || 0;\n      var bill = withOHP(st, oh, profit);", "      var st = nonNegativeFinancial(b.straight);\n      var bill = (st === null || oh === null || profit === null) ? NaN : withOHP(st, oh, profit);", 1)
s = s.replace("'<td><input type=\"number\" class=\"num bur-st\" step=\"0.01\" value=\"' + (Number(st) || 0) + '\" /></td>' +", "'<td><input type=\"number\" class=\"num bur-st' + (st === null ? ' invalid-financial' : '') + '\" step=\"0.01\" min=\"0\" value=\"' + (st === null ? '' : st) + '\"' + (st === null ? ' aria-invalid=\"true\" title=\"Invalid burden rate — correct before pricing\"' : '') + ' /></td>' +", 1)
s = s.replace("'<td class=\"num-cell\">' + money(st * 1.5) + '</td>' +\n        '<td class=\"num-cell\">' + money(st * 2) + '</td>' +\n        '<td class=\"num-cell\">' + money(st * 3) + '</td>' +", "'<td class=\"num-cell\">' + safeMoney(st === null ? NaN : st * 1.5) + '</td>' +\n        '<td class=\"num-cell\">' + safeMoney(st === null ? NaN : st * 2) + '</td>' +\n        '<td class=\"num-cell\">' + safeMoney(st === null ? NaN : st * 3) + '</td>' +", 1)
s = s.replace("        b.straight = parseFloat(e.target.value) || 0;", "        var bv=parseFloat(e.target.value); b.straight=(isFinite(bv)&&bv>=0)?bv:e.target.value;", 1)

# Labor block header burden display must not crash/coerce invalid.
s = s.replace("h3.textContent = 'burden $' + (bur.straight || 0).toFixed(2) + '/hr · ' + money(det.cost) + ' · ' + det.totalHrs.toFixed(1) + ' h';", "var br=nonNegativeFinancial(bur.straight); h3.textContent = 'burden ' + (br===null?'—':money(br)) + '/hr · ' + safeMoney(det.cost) + ' · ' + (isFinite(det.totalHrs)?det.totalHrs.toFixed(1):'—') + ' h';", 1)
# RenderLaborBlocks header too.
s = s.replace("'<h3>'+esc(b.label)+' <span class=\"sub\">burden $'+(Number(bur.straight)||0).toFixed(2)+'/hr · '+safeMoney(det.cost)+' · '+(Number(det.totalHrs)||0).toFixed(1)+' h</span></h3>", "'<h3>'+esc(b.label)+' <span class=\"sub\">burden '+safeMoney(bur.straight)+'/hr · '+safeMoney(det.cost)+' · '+(isFinite(det.totalHrs)?Number(det.totalHrs).toFixed(1):'—')+' h</span></h3>", 1)

index.write_text(s)

t = tests.read_text()
append = r'''

// Final caller-integrity regression coverage.
{
  const inv = F.INVALID_FINANCIAL;
  for (const bad of [NaN, Infinity, -Infinity, 'Infinity', 'NaN', 'abc', -1]) {
    assert.strictEqual(F.normalizePersistentFinancial(bad, 0), inv);
  }
  assert.strictEqual(F.normalizePersistentFinancial(null, 0), 0);
  assert.strictEqual(F.normalizePersistentFinancial('', 0), 0);
  assert.strictEqual(F.normalizePersistentFinancial('12.5', 0), 12.5);
  const persisted = JSON.parse(JSON.stringify({ actualLabor: F.normalizePersistentFinancial(NaN, 0) }));
  assert.strictEqual(persisted.actualLabor, inv);
  assert.strictEqual(F.normalizePersistentFinancial(persisted.actualLabor, 0), inv);
}

{
  const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(!src.includes('s.pnl.actualLabor = asNum(s.pnl.actualLabor)'));
  assert(!src.includes('s.pnl.actualEquip = asNum(s.pnl.actualEquip)'));
  assert(!src.includes('s.pnl.actualSub = asNum(s.pnl.actualSub)'));
  assert(!src.includes('money(calc.le.smallToolsCost || 0)'));
  assert(!src.includes("b.straight = parseFloat(e.target.value) || 0"));
  assert(!src.includes("value=\"' + (Number(eqs[i].cost) || 0)"));
  assert(!src.includes("value=\"' + (Number(subs[i].price) || 0)"));
  assert(!src.includes("var ext = (Number(m.qty) || 0) * (Number(m.unitCost) || 0)"));
  assert(src.includes('normalizePersistentFinancial(s.pnl.actualLabor, 0)'));
  assert(src.includes('safeMoney(calc.le.smallToolsCost)'));
}
'''
if 'Final caller-integrity regression coverage.' not in t:
    t += append
tests.write_text(t)
