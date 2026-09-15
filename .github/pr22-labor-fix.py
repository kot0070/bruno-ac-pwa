from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)

# ---- shared financial core ----
core_path = Path('financial-integrity-core.js')
core = core_path.read_text()

insert_after = """  function laborCost(input) {
    input = input || {};
    var straightRate = nonNegative(input.straightRate);
    var straightHours = nonNegative(input.straightHours);
    var ot15Hours = nonNegative(input.ot15Hours);
    var ot2Hours = nonNegative(input.ot2Hours);
    var holidayHours = nonNegative(input.holidayHours);
    var holidayMultiplier = nonNegative(input.holidayMultiplier == null ? 3 : input.holidayMultiplier);
    if ([straightRate, straightHours, ot15Hours, ot2Hours, holidayHours, holidayMultiplier].some(function (x) { return x === null; })) {
      return { ok: false, cost: null, totalHours: null, error: 'Labor rates, multipliers, and hours must be finite and nonnegative.' };
    }
    var cost = straightHours * straightRate + ot15Hours * straightRate * 1.5 + ot2Hours * straightRate * 2 + holidayHours * straightRate * holidayMultiplier;
    return {
      ok: Number.isFinite(cost),
      cost: Number.isFinite(cost) ? cost : null,
      totalHours: straightHours + ot15Hours + ot2Hours + holidayHours,
      rates: { straight: straightRate, ot15: straightRate * 1.5, ot2: straightRate * 2, holiday: straightRate * holidayMultiplier },
      error: Number.isFinite(cost) ? '' : 'Labor cost is non-finite.'
    };
  }
"""

migration_fn = insert_after + """

  function migrateLegacyLaborBlock(block) {
    block = block || {};
    function legacyNumber(value) {
      if (value === null || value === undefined || value === '') return 0;
      var n = Number(value);
      return Number.isFinite(n) && n >= 0 ? n : null;
    }

    var persons = legacyNumber(block.persons);
    var days = legacyNumber(block.days);
    var hoursPerDay = legacyNumber(block.hoursPerDay);
    var satPersons = legacyNumber(block.satPersons);
    var satDays = legacyNumber(block.satDays);
    var satHours = legacyNumber(block.satHours);
    var sunPersons = legacyNumber(block.sunPersons);
    var sunDays = legacyNumber(block.sunDays);
    var sunHours = legacyNumber(block.sunHours);
    var values = [persons, days, hoursPerDay, satPersons, satDays, satHours, sunPersons, sunDays, sunHours];

    if (values.some(function (v) { return v === null; })) {
      return {
        ok: false,
        straightHours: 'INVALID_LEGACY_LABOR',
        ot15Hours: 'INVALID_LEGACY_LABOR',
        ot2Hours: 'INVALID_LEGACY_LABOR',
        holidayHours: 0,
        holidayMultiplier: 3,
        laborModelVersion: 2,
        error: 'Malformed legacy labor values require correction before pricing.'
      };
    }

    return {
      ok: true,
      straightHours: persons * days * Math.min(hoursPerDay, 8),
      ot15Hours: persons * days * Math.max(hoursPerDay - 8, 0) + satPersons * satDays * satHours,
      ot2Hours: sunPersons * sunDays * sunHours,
      holidayHours: 0,
      holidayMultiplier: 3,
      laborModelVersion: 2,
      error: ''
    };
  }
"""
core = replace_once(core, insert_after, migration_fn, 'insert migrateLegacyLaborBlock')
core = replace_once(core,
"""    laborCost: laborCost,
    recoveryRate: recoveryRate,
""",
"""    laborCost: laborCost,
    migrateLegacyLaborBlock: migrateLegacyLaborBlock,
    recoveryRate: recoveryRate,
""", 'export migrateLegacyLaborBlock')
core_path.write_text(core)

# ---- production normalization ordering ----
index_path = Path('index.html')
html = index_path.read_text()
old = """      row.persons = asNum(row.persons);
      row.days = asNum(row.days);
      row.hoursPerDay = asNum(row.hoursPerDay);
      row.satPersons = asNum(row.satPersons);
      row.satDays = asNum(row.satDays);
      row.satHours = asNum(row.satHours);
      row.sunPersons = asNum(row.sunPersons);
      row.sunDays = asNum(row.sunDays);
      row.sunHours = asNum(row.sunHours);
      if (row.straightHours == null && row.ot15Hours == null && row.ot2Hours == null) {
        function legacyLaborNumber(v) {
          if (v === null || v === undefined || v === '') return 0;
          var n = Number(v);
          return Number.isFinite(n) && n >= 0 ? n : null;
        }
        var lp=legacyLaborNumber(row.persons), ld=legacyLaborNumber(row.days), lh=legacyLaborNumber(row.hoursPerDay);
        var lsp=legacyLaborNumber(row.satPersons), lsd=legacyLaborNumber(row.satDays), lsh=legacyLaborNumber(row.satHours);
        var lnp=legacyLaborNumber(row.sunPersons), lnd=legacyLaborNumber(row.sunDays), lnh=legacyLaborNumber(row.sunHours);
        var legacyVals=[lp,ld,lh,lsp,lsd,lsh,lnp,lnd,lnh];
        if (legacyVals.some(function(v){return v===null;})) {
          row.straightHours = 'INVALID_LEGACY_LABOR';
          row.ot15Hours = 'INVALID_LEGACY_LABOR';
          row.ot2Hours = 'INVALID_LEGACY_LABOR';
          row.holidayHours = 0;
          row.holidayMultiplier = 3;
          row.laborMigrationError = 'Malformed legacy labor values require correction before pricing.';
        } else {
          row.straightHours = lp * ld * Math.min(lh, 8);
          row.ot15Hours = lp * ld * Math.max(lh - 8, 0) + lsp*lsd*lsh;
          row.ot2Hours = lnp*lnd*lnh;
          row.holidayHours = 0;
          row.holidayMultiplier = 3;
          delete row.laborMigrationError;
        }
        row.laborModelVersion = 2;
      }
"""
new = """      if (row.straightHours == null && row.ot15Hours == null && row.ot2Hours == null) {
        var migratedLabor = window.BrunoFinancial.migrateLegacyLaborBlock(row);
        row.straightHours = migratedLabor.straightHours;
        row.ot15Hours = migratedLabor.ot15Hours;
        row.ot2Hours = migratedLabor.ot2Hours;
        row.holidayHours = migratedLabor.holidayHours;
        row.holidayMultiplier = migratedLabor.holidayMultiplier;
        row.laborModelVersion = migratedLabor.laborModelVersion;
        if (migratedLabor.ok) delete row.laborMigrationError;
        else row.laborMigrationError = migratedLabor.error;
      }
      /* Normalize legacy display-only fields only after strict migration has captured raw semantics. */
      row.persons = asNum(row.persons);
      row.days = asNum(row.days);
      row.hoursPerDay = asNum(row.hoursPerDay);
      row.satPersons = asNum(row.satPersons);
      row.satDays = asNum(row.satDays);
      row.satHours = asNum(row.satHours);
      row.sunPersons = asNum(row.sunPersons);
      row.sunDays = asNum(row.sunDays);
      row.sunHours = asNum(row.sunHours);
"""
html = replace_once(html, old, new, 'legacy labor ordering')
index_path.write_text(html)

# ---- executable regression tests ----
test_path = Path('tests/financial-integrity.test.js')
test = test_path.read_text()
old_assert = """assert.ok(source.includes(\"row.straightHours = 'INVALID_LEGACY_LABOR'\"), 'malformed legacy labor must retain invalid sentinel');
"""
new_assert = """// Execute the exact shared migration function used by production normalization.
const validLegacy = F.migrateLegacyLaborBlock({ persons:2, days:1, hoursPerDay:10, satPersons:1, satDays:1, satHours:4, sunPersons:1, sunDays:1, sunHours:3 });
assert.strictEqual(validLegacy.ok, true);
assert.strictEqual(validLegacy.straightHours, 16);
assert.strictEqual(validLegacy.ot15Hours, 8);
assert.strictEqual(validLegacy.ot2Hours, 3);
const migratedCost = F.laborCost({ straightRate:50, straightHours:validLegacy.straightHours, ot15Hours:validLegacy.ot15Hours, ot2Hours:validLegacy.ot2Hours, holidayHours:validLegacy.holidayHours, holidayMultiplier:validLegacy.holidayMultiplier });
assert.strictEqual(migratedCost.ok, true);
close(migratedCost.cost, 1700);

['Infinity','NaN','abc'].forEach((bad) => {
  const x = F.migrateLegacyLaborBlock({ persons:bad, days:1, hoursPerDay:8, satPersons:0, satDays:0, satHours:8, sunPersons:0, sunDays:0, sunHours:8 });
  assert.strictEqual(x.ok, false, `legacy ${bad} must be invalid`);
  assert.strictEqual(x.straightHours, 'INVALID_LEGACY_LABOR');
});
[Infinity, -Infinity, NaN, -1].forEach((bad) => {
  const x = F.migrateLegacyLaborBlock({ persons:1, days:1, hoursPerDay:bad, satPersons:0, satDays:0, satHours:8, sunPersons:0, sunDays:0, sunHours:8 });
  assert.strictEqual(x.ok, false, `legacy numeric ${bad} must be invalid`);
  assert.strictEqual(x.straightHours, 'INVALID_LEGACY_LABOR');
});

// Ordering invariant: production must migrate raw legacy values before any permissive asNum normalization.
const migratePos = source.indexOf('window.BrunoFinancial.migrateLegacyLaborBlock(row)');
const asNumPos = source.indexOf('row.persons = asNum(row.persons)', migratePos);
assert.ok(migratePos >= 0 && asNumPos > migratePos, 'strict legacy migration must run before asNum coercion');
assert.ok(!source.includes('function legacyLaborNumber(v)'), 'duplicate late validator must be removed from production');
"""
test = replace_once(test, old_assert, new_assert, 'replace weak legacy labor test')
test_path.write_text(test)

# ---- exact-head validation ----
# JS syntax for standalone files; inline production source invariants are covered by Node tests.

print('patch applied')
