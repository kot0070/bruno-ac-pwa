# PROJECT FULL AUDIT — P03 MATHEMATICS / CALCULATION AUDIT

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
stage: P03
status: DONE_WITH_FINDINGS
production_head_audited: 867eeed47d8e2ea106922b2455a432da9ee8a217
production_writes: none
browser_mobile_runtime: NOT_PERFORMED
findings:
  P0: 0
  P1: 3
  P2: 1
```

## Independent formula register / hand checks

### HVAC load

Implemented transparent method is internally dimensional for the audited terms:

- envelope conduction: `U × area × ΔT` -> BTU/h;
- R-value conversion: `U = 1/R` when explicit U is absent;
- ACH infiltration: `CFM = ACH × volume / 60`;
- outdoor sensible: `1.08 × CFM × ΔT`;
- outdoor latent: `0.68 × CFM × Δgrains`;
- electric/internal gain: `watts × 3.412`;
- cooling total: `sensible + latent`;
- design supply airflow: `sensible / (1.08 × supply ΔT)` when an explicit supply-air ΔT exists.

Hand-check fixture already represented by executable load tests:

```text
conditioned area = 1,000 ft²
wall exposed = 500 ft²
window = 100 ft²
opaque wall = 400 ft²
wall U = 0.10
roof = 1,000 ft² @ U 0.05
window U = 0.30
cooling ΔT = 20°F
heating ΔT = 40°F
no infiltration/ventilation/solar/internal gains

cooling = 400×0.10×20 + 1000×0.05×20 + 100×0.30×20
        = 800 + 1000 + 600
        = 2,400 BTU/h
heating = 400×0.10×40 + 1000×0.05×40 + 100×0.30×40
        = 1,600 + 2,000 + 1,200
        = 4,800 BTU/h
```

The current executable test expects exactly 2,400 / 4,800 BTU/h and matches the independent arithmetic.

### Financial Method A

```text
Cost = 10,000
OH = 25% = 0.25
Profit margin = 15% = 0.15
Sales = Cost × (1 + OH) / (1 - Profit)
      = 10,000 × 1.25 / 0.85
      = 14,705.882352941177
```

This matches `financial-integrity-core.js`.

### Catalog material extension / margin

Existing pricing fixture:

```text
Customer total = 4,500
Your Cost = 3,380
Margin $ = 1,120
Margin % = 1,120 / 4,500 = 0.2488888889 = 24.8889%
```

Current engine agrees for resolved, finite rows.

### Service Journal payroll fixture

For gross wages `$340`, defaults produce:

```text
employee SS 6.2% = 21.08
employee Medicare 1.45% = 4.93
employee deductions = 26.01
employee take-home = 313.99

employer SS = 21.08
employer Medicare = 4.93
TWC 2.70% = 9.18
FUTA 0.60% = 2.04
employer payroll tax = 37.23
employer crew cost = 377.23
```

Existing executable Journal fixture matches those values and stable worker-ID wage-base behavior.

## P1-MATH-01 — equipment cooling oversize bound uses max(cooling, heating)

`project-equipment-engine.js` calculates `requiredCapacityBtuh = max(coolingLoad, heatingLoad)` and uses that same value for `nominalCapacityRangeBtuh.min/max`, while automatic candidate filtering compares `coolingCapacityBtuh` to that upper bound and separately checks rated heating.

For a heat-dominant fixture such as cooling `30,000`, heating `60,000`, oversize fraction `25%`, the current cooling upper bound becomes `75,000 BTU/h`. A candidate with `60,000` cooling / `60,000` heating can pass despite cooling capacity being 100% above the cooling load. If the stated oversize policy is a cooling equipment-selection bound, the correct cooling upper bound is `37,500 BTU/h`; heating performance should be checked independently.

**Severity:** P1 because selection math can authorize materially oversized cooling in heating-dominant conditions while presenting a verified policy bound.

**Required P04 fix:** maintain distinct cooling selection range and heating requirement; apply `maxOversizeFraction` to cooling load/cooling capacity; keep the generic max thermal load as informational only; add heat-dominant fixture.

## P1-MATH-02 — missing BOM final quantity prices as zero

`project-catalog-pricing-engine.js` `priceRow()` converts a missing/blank `final_qty` to `null`, but rejects only `INVALID_FINANCIAL`. JavaScript multiplication then evaluates `null × price` as zero, so a resolved Catalog line with a missing quantity can be accepted with `$0` extensions instead of failing closed.

**Severity:** P1 financial-integrity defect.

**Required P04 fix:** treat `qty === null` as `missing_quantity`/blocked; add blank/null quantity fixtures and preserve explicit numeric zero as a valid distinct quantity.

## P1-MATH-03 — malformed persisted Journal numerics normalize to zero/clamped values

`service-journal-ux.js` uses permissive `num()`/`pct()` normalization. Present-but-malformed values such as `rate:'abc'`, `gross:'abc'` or payroll percentages become `0`; percentages above 100 are silently clamped. On a persisted current Journal this can understate wages, payroll taxes or gross service income without marking the record invalid.

The architecture fix now protects syntactically corrupt Journal JSON, but semantically malformed explicit numerics still pass parse/normalize.

**Severity:** P1 because explicit malformed financial/payroll values become authoritative zeros.

**Required P04 fix:** validate present numeric fields before normalization for current persisted Journal data; reject non-finite/negative rates/hours/gross/wage bases and out-of-range percentages; missing legacy fields may still receive documented migration defaults.

## P2-MATH-01 — equipment override capacity semantics are ambiguous with systemCount > 1

Operator override stores one `capacityBtuh` and a `systemCount`, but does not explicitly encode whether capacity is per-system or aggregate. Downstream OEM electrical/mechanical paths intentionally block generic override, limiting current damage, but the record/UI semantics should eventually be explicit (`capacityPerSystemBtuh` vs `aggregateCapacityBtuh`).

This is not a P1 while generic overrides cannot masquerade as OEM-resolved downstream equipment.

## Other audited math outcomes

- OCPD above OEM MOCP is blocked; conductor size is not numerically invented from tonnage/MCA.
- Mechanical route-length quantities remain direct field/design measurements, not sqft-derived estimates.
- Catalog Customer Price / Your Cost / margin arithmetic is correct for valid quantities.
- Blank Your Cost fallback and explicit zero remain distinct.
- Actual Cost precedence over procurement snapshot is delegated to the accepted financial core and existing executable lifecycle tests.
- History snapshot totals are validated as number/null and extended-chain import is strict/atomic after P02 baseline.
- HVAC opening geometry now blocks when windows+doors exceed exposed wall area; no negative opaque-wall conduction is silently clamped.

P04 remediation is authorized for the three P1 findings plus independent executable hand-check fixtures.
