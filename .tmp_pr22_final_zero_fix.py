from pathlib import Path

def replace_once(text, old, new, label):
    c = text.count(old)
    if c != 1:
        raise SystemExit(f'{label}: expected 1 match, got {c}')
    return text.replace(old, new, 1)

# Shared core: persistent explicit-labor invalid sentinel.
core_p = Path('financial-integrity-core.js')
core = core_p.read_text()
core = replace_once(core,
"""  function laborCost(input) {
""",
"""  var INVALID_EXPLICIT_LABOR = 'INVALID_EXPLICIT_LABOR';

  function normalizeExplicitLaborValue(value, defaultValue) {
    if (value === 'INVALID_LEGACY_LABOR' || value === INVALID_EXPLICIT_LABOR) return value;
    if (value === null || value === undefined || value === '') return defaultValue === undefined ? 0 : defaultValue;
    var n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : INVALID_EXPLICIT_LABOR;
  }

  function laborCost(input) {
""", 'insert explicit labor normalizer')
core = replace_once(core,
"""    laborCost: laborCost,
""",
"""    laborCost: laborCost,
    normalizeExplicitLaborValue: normalizeExplicitLaborValue,
    INVALID_EXPLICIT_LABOR: INVALID_EXPLICIT_LABOR,
""", 'export explicit labor normalizer')
core_p.write_text(core)

# Production integration.
p = Path('index.html')
html = p.read_text()
html = replace_once(html,
"""  function money(n) {
    n = Number(n) || 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(n) {
    n = Math.round(Number(n) || 0);
    return '$' + n.toLocaleString('en-US');
  }
""",
"""  function money(n) {
    var value = finiteFinancial(n);
    if (value === null) return '—';
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(n) {
    var value = finiteFinancial(n);
    if (value === null) return '—';
    value = Math.round(value);
    return '$' + value.toLocaleString('en-US');
  }
""", 'strict money formatters')
html = replace_once(html,
"""      row.straightHours = normalizeFinancialValue(row.straightHours); row.ot15Hours = normalizeFinancialValue(row.ot15Hours); row.ot2Hours = normalizeFinancialValue(row.ot2Hours); row.holidayHours = normalizeFinancialValue(row.holidayHours); row.holidayMultiplier = row.holidayMultiplier == null ? 3 : normalizeFinancialValue(row.holidayMultiplier);
""",
"""      row.straightHours = window.BrunoFinancial.normalizeExplicitLaborValue(row.straightHours, 0);
      row.ot15Hours = window.BrunoFinancial.normalizeExplicitLaborValue(row.ot15Hours, 0);
      row.ot2Hours = window.BrunoFinancial.normalizeExplicitLaborValue(row.ot2Hours, 0);
      row.holidayHours = window.BrunoFinancial.normalizeExplicitLaborValue(row.holidayHours, 0);
      row.holidayMultiplier = window.BrunoFinancial.normalizeExplicitLaborValue(row.holidayMultiplier, 3);
      if ([row.straightHours,row.ot15Hours,row.ot2Hours,row.holidayHours,row.holidayMultiplier].some(function(v){ return v === window.BrunoFinancial.INVALID_EXPLICIT_LABOR || v === 'INVALID_LEGACY_LABOR'; })) {
        row.laborMigrationError = row.laborMigrationError || 'Invalid explicit labor values require correction before pricing.';
      }
""", 'persistent explicit labor normalization')
html = replace_once(html,
"""  function fieldNum(label, cls, val) {
    return '<div class="field"><label>' + label + '</label><input type="number" class="' + cls + '" step="any" min="0" value="' + (Number(val) || 0) + '" /></div>';
  }
""",
"""  function fieldNum(label, cls, val) {
    var n = nonNegativeFinancial(val);
    var supplied = !(val === null || val === undefined || val === '');
    var invalid = supplied && n === null;
    return '<div class="field"><label>' + label + '</label><input type="number" class="' + cls + (invalid ? ' invalid-financial' : '') + '" step="any" min="0" value="' + (n === null ? '' : n) + '"' + (invalid ? ' aria-invalid="true" title="Invalid financial value — correct before pricing"' : '') + ' />' + (invalid ? '<span class="hint" style="color:var(--danger)">INVALID — correct before pricing</span>' : '') + '</div>';
  }
""", 'strict labor field render')
html = replace_once(html,
"""      '<div class="total-line">Base quote: ' + money0(calc.quoteBase) +
""",
"""      '<div class="total-line">Base quote: ' + (calc.quoteValid ? money0(calc.quoteBase) : '—') +
""", 'quote preview invalid base')
p.write_text(html)

# Tests: executable persistence cycle + source invariants for formatters/UI.
tp = Path('tests/financial-integrity.test.js')
t = tp.read_text()
append = r'''

// Final invalid-zero regression coverage.
// Explicit v2 labor must survive JSON persistence as an invalid string sentinel, never NaN -> null -> 0.
function normalizeExplicitBlock(block) {
  const out = Object.assign({}, block);
  out.straightHours = F.normalizeExplicitLaborValue(out.straightHours, 0);
  out.ot15Hours = F.normalizeExplicitLaborValue(out.ot15Hours, 0);
  out.ot2Hours = F.normalizeExplicitLaborValue(out.ot2Hours, 0);
  out.holidayHours = F.normalizeExplicitLaborValue(out.holidayHours, 0);
  out.holidayMultiplier = F.normalizeExplicitLaborValue(out.holidayMultiplier, 3);
  return out;
}

[NaN, Infinity, -Infinity, 'abc', -1].forEach((bad) => {
  let b = normalizeExplicitBlock({ straightHours: bad, ot15Hours: 0, ot2Hours: 0, holidayHours: 0, holidayMultiplier: 3 });
  assert.strictEqual(b.straightHours, F.INVALID_EXPLICIT_LABOR, `explicit ${String(bad)} must become persistent invalid sentinel`);
  b = JSON.parse(JSON.stringify(b));
  assert.strictEqual(b.straightHours, F.INVALID_EXPLICIT_LABOR, 'invalid sentinel must survive JSON persistence');
  b = normalizeExplicitBlock(b);
  assert.strictEqual(b.straightHours, F.INVALID_EXPLICIT_LABOR, 'invalid sentinel must survive second normalization');
  const lc = F.laborCost({ straightRate: 50, straightHours: b.straightHours, ot15Hours: b.ot15Hours, ot2Hours: b.ot2Hours, holidayHours: b.holidayHours, holidayMultiplier: b.holidayMultiplier });
  assert.strictEqual(lc.ok, false, 'persisted invalid explicit labor must block labor cost');
});

assert.ok(!source.includes("n = Number(n) || 0;\n    return '$' + n.toLocaleString"), 'money() must not coerce invalid values to zero');
assert.ok(!source.includes('n = Math.round(Number(n) || 0);'), 'money0() must not coerce invalid values to zero');
assert.ok(source.includes("if (value === null) return '—';"), 'money formatters must expose invalid state');
assert.ok(!source.includes("value=\"' + (Number(val) || 0) + '\""), 'labor field renderer must not display invalid sentinel as 0');
assert.ok(source.includes('INVALID — correct before pricing'), 'labor field renderer must visibly mark invalid values');
assert.ok(source.includes("Base quote: ' + (calc.quoteValid ? money0(calc.quoteBase) : '—')"), 'invalid quote preview base must render dash');
'''
if 'Final invalid-zero regression coverage.' in t:
    raise SystemExit('tests already contain final invalid-zero block')
tp.write_text(t + append)

print('targeted final invalid-zero patch applied')
