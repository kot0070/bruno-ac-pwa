'use strict';
const assert = require('assert');
const F = require('../financial-integrity-core.js');

function close(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${expected}, got ${actual}`);
}

// 1. Method A
let r = F.methodASales(10000, 0.25, 0.15);
assert.strictEqual(r.ok, true);
close(r.value, 14705.882352941177, 1e-9);

// 2. Invalid profit states must block rather than price at cost.
[1, 1.01, -0.01, Infinity, -Infinity, NaN].forEach((p) => {
  const x = F.methodASales(10000, 0.25, p);
  assert.strictEqual(x.ok, false, `profit ${p} must be invalid`);
  assert.strictEqual(x.value, null);
});

// 3. Ten explicitly straight hours remain straight hours.
r = F.laborCost({ straightRate: 50, straightHours: 10, ot15Hours: 0, ot2Hours: 0, holidayHours: 0 });
assert.strictEqual(r.ok, true);
close(r.cost, 500);

// 4. Explicit 8 straight + 4 OT1.5.
r = F.laborCost({ straightRate: 50, straightHours: 8, ot15Hours: 4, ot2Hours: 0, holidayHours: 0 });
close(r.cost, 700);

// 5. Holiday hours use configured multiplier.
r = F.laborCost({ straightRate: 50, straightHours: 0, ot15Hours: 0, ot2Hours: 0, holidayHours: 4, holidayMultiplier: 3 });
close(r.cost, 600);

// 6. Approved CO only.
const cos = [
  { status: 'approved', amount: 500 },
  { status: 'draft', amount: 300 },
  { status: 'void', amount: 100 }
];
close(F.quotedContractRevenue(10000, cos), 10500);

// 7. CO cents remain cents after rounded base.
close(F.quotedContractRevenue(10000, [{ status: 'approved', amount: 500.49 }]), 10500.49);

// 8. Profitability contract revenue includes approved CO.
assert.strictEqual(F.quotedContractRevenue(13735, [{ status: 'approved', amount: 250 }]), 13985);

// 9. Partial T&M category rows reconcile exactly with total.
r = F.tmTotal({
  equipmentLines: [{ qty: 1, rate: 100 }],
  laborLines: [{ hours: 2, rate: 150 }],
  materialAmount: 80,
  subAmount: 20
});
close(r.equip + r.labor + r.material + r.sub, r.total);
close(r.total, 500);

// 10. Reusable tool estimating recovery.
r = F.toolJobCost({
  costClass: 'REUSABLE_TOOL',
  purchaseCost: 600,
  residualValue: 100,
  lifeHours: 1000,
  maintenancePerHour: 0.10,
  otherPerHour: 0,
  recoveryUnit: 'hour',
  usage: 4
});
assert.strictEqual(r.ok, true);
close(r.rate, 0.60);
close(r.cost, 2.40);

// 11. Rental remains direct actual cost.
r = F.toolJobCost({ costClass: 'RENTAL', qty: 1, unitCost: 175 });
assert.strictEqual(r.ok, true);
close(r.cost, 175);

// 12. Invoice date regression is enforced in source-level test below by app tests/workflow.
// Core check: invoice metadata is independent data, not quote data.
const q = { date: '2026-09-01' };
const tm = { date: '2026-09-14', invoice: 'INV-100' };
assert.notStrictEqual(q.date, tm.date);
assert.strictEqual(tm.date, '2026-09-14');

// 13. Compliance missing required ACR fields blocks.
r = F.validateAcrCompany({ legalName: 'Bruno AC Services LLC', address1: '', city: 'Austin', state: 'TX', zip: '78701', phone: '', acrLicense: '' });
assert.strictEqual(r.ok, false);
assert.ok(r.missing.includes('company address'));
assert.ok(r.missing.includes('company phone'));
assert.ok(r.missing.includes('ACR contractor license number'));

// Additional safety: no non-finite or negative direct-cost values.
assert.strictEqual(F.toolJobCost({ costClass: 'RENTAL', qty: -1, unitCost: 100 }).ok, false);
assert.strictEqual(F.toolJobCost({ costClass: 'CONSUMABLE', qty: 1, unitCost: Infinity }).ok, false);
assert.strictEqual(F.methodASales(Infinity, 0.25, 0.15).ok, false);

console.log('financial-integrity: all deterministic tests passed');


// Corrective audit regression coverage.
assert.strictEqual(F.toolJobCost({ costClass: 'REUSABLE_TOOL', purchaseCost: 600, residualValue: 100, lifeHours: 1000, maintenancePerHour: 0.10, otherPerHour: 0, recoveryUnit: 'hour', usage: NaN }).ok, false);
assert.strictEqual(F.toolJobCost({ costClass: 'REUSABLE_TOOL', purchaseCost: 600, residualValue: NaN, lifeHours: 1000, maintenancePerHour: 0.10, otherPerHour: 0, recoveryUnit: 'hour', usage: 4 }).ok, false);
assert.strictEqual(F.toolJobCost({ costClass: 'REUSABLE_TOOL', purchaseCost: 600, residualValue: 100, lifeHours: 1000, maintenancePerHour: Infinity, otherPerHour: 0, recoveryUnit: 'hour', usage: 4 }).ok, false);
assert.strictEqual(F.quotedContractRevenue(10000, [{ status: 'approved', amount: -500 }]), null, 'generic negative approved CO must block');
assert.strictEqual(F.validateAcrCompany({ legalName:'Bruno AC', address1:'1 Main', city:'Austin', state:'TX', zip:'78701', phone:'5125550100', tecl:'TECL28137', license:'TECL28137', acrLicense:'' }).ok, false, 'TECL/generic license must not satisfy ACR compliance');
const badTm = F.tmTotal({ equipmentLines:[{qty:NaN,rate:100}], laborLines:[], materialAmount:0, subAmount:0 });
assert.strictEqual(badTm.ok, false); assert.strictEqual(badTm.total, null);

const fs = require('fs');
const source = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
assert.ok(source.includes("makeLetterhead(tm.date, 'Invoice date')"), 'invoice print must use tm.date');
assert.ok(!source.includes('if (!c.license && c.tecl) c.license = c.tecl'), 'TECL promotion must be absent');
assert.ok(!source.includes("if (!c.acrLicense) c.acrLicense = c.license || ''"), 'generic license promotion to ACR must be absent');
// Execute the exact shared migration function used by production normalization.
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
assert.ok(source.includes("if(amt<0){errors.push('Negative Change Orders are not supported."), 'negative CO must be rejected');
assert.ok(source.includes("function customerTotalMoney(n) { return validMoneyValue(n) ? money(n) : '—'; }"), 'customer total formatter must reject null/nonfinite');
assert.ok(source.includes("mr.actualCost !== null") && source.includes("mr.procurementCostSnapshot !== null") && source.includes("source='estimate'"), 'material actual cost must resolve per row');


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
  const src = source;
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
