# EXECUTIVE VERDICT

## **C — REJECT / REWORK REQUIRED**

PR #22 **не SAFE TO MERGE** у поточному production tree.

Сам новий dual-pricing block у `ac-calculator-engine.js` реалізований здебільшого правильно: Customer Price та Your Cost розділені, invalid не перетворюється на нуль, `actualCost` Calculator не створює, aggregate/margin правильні, Apply мапить `unitCost ← Customer Price` та `procurementCostSnapshot ← Your Cost`.

Але незалежний end-to-end audit виявив **production-level cross-lifecycle defect поза ізольованим Calculator engine**:

> **Зміна Catalog Customer Price напряму переписує `materialsUsed[].unitCost` у вже існуючому Job Material — без Calculator Apply/Re-Apply.**

Це порушує заданий lifecycle:

`Catalog change ≠ historical Job change until explicit Apply/Refresh`

і означає, що Method A / Quote може змінитися внаслідок редагування Catalog, хоча користувач Calculator **не натискав Add / Update Job Materials**. `calcMaterial()` потім бере саме `materialsUsed[].unitCost`, а Method A використовує цей material cost. fileciteturn28file0L2-L2 fileciteturn32file0L2-L2

Другий дефект: main-app Catalog preprocessing перетворює blank/missing `yourCost` на `unitCost` **до того, як рядок побачить Calculator**, через що Calculator втрачає справжнє `customer-price-fallback` provenance і може сприйняти fallback як explicit `catalog-your-cost`. fileciteturn24file0L2-L2

---

## REPOSITORY STATE

| Field | Independently verified |
|---|---|
| Repository | `kot0070/bruno-ac-pwa` |
| PR | #22 |
| State | **OPEN** |
| Draft | **YES** |
| Merged | **NO** |
| GitHub mergeable | **YES** |
| Base branch | `main` |
| BASE SHA | `f0c8d11e8d1331811f14e4820f3e0ebeff86b7b5` |
| STARTING BLOCK SHA | `a492dfb8006467179774b0771ab07e6d8eb59b64` |
| HEAD branch | `feature/financial-integrity-texas-acr-docs` |
| HEAD SHA | `104c8229f2c0ee4ac377e9081fe807f58683db4e` |
| Merge base | `f0c8d11e8d1331811f14e4820f3e0ebeff86b7b5` |
| Ahead / behind | **51 / 0** |
| Commit count | **51** |
| Changed files | **9** |

The expected HEAD is the actual HEAD; I did **not** audit a different revision. PR metadata independently confirms base/head, open/unmerged/draft state and nine changed files. fileciteturn0file0L4-L16 fileciteturn0file0L28-L35

### CHANGED FILES

Exact final net list:

```text
ac-calculator-engine.js
ac-calculator.css
ac-calculator.html
ac-calculator.js
financial-integrity-core.js
index.html
sw.js
tests/ac-calculator-pricing.test.js
tests/financial-integrity.test.js
```

Confirmed absent from final net diff:

```text
scripts/
.github/workflows/
ac-calculator-ux.js
navigation-v2.js
navigation-v2.css
workspace files
README
unrelated assets
```

From starting block `a492dfb8…` to HEAD, only the six Calculator-block files changed: engine, JS, HTML, CSS, SW and the new Calculator pricing test. No HVAC scope file outside this set changed.

---

# CI RESULT

**SUCCESS — but not sufficient for acceptance.**

Run `34986164726`:

- workflow: `PR22 AC Calculator Dual Pricing`
- event: push
- triggering SHA: `10be1895176571feb54c04d93f8a2b2c5932262a`
- conclusion: `success`
- existing financial-integrity suite: passed
- Calculator dual-pricing suite: passed
- syntax validation: passed
- production invariant checks: passed
- cleanup/final commit step: passed. fileciteturn20file0L2-L2 fileciteturn21file0L2-L2

The workflow itself explicitly ran both Node suites, syntax checks and source invariants, then removed its temporary scripts/workflow and pushed the final implementation commit. fileciteturn22file0L2-L2

Final commit `104c8229…` is the GitHub Actions bot commit whose parent is trigger SHA `10be189…`; this independently closes the CI provenance chain. fileciteturn29file0L2-L2

CI did **not** detect the main Catalog → existing Job Material lifecycle defect because its invariants are mostly engine/source-level and the Calculator suite does not exercise that integrated UI path.

# BROWSER / DOM RESULT

**NOT PERFORMED.**

No real interactive browser runner is available in this audit environment.

Static mobile CSS/DOM was inspected separately.

# TEXAS AUTHORITY VERIFIED

**YES.**

Current TDLR enforcement material still identifies §75.71(i) violations for failure to place Department information on proposals/invoices/contracts, failure to show the ACR license number, and failure to show company name/address/phone. It also separately lists failure to provide an invoice to the consumer. ([tdlr.texas.gov](https://www.tdlr.texas.gov/enforcement/acrsanctions.htm?utm_source=chatgpt.com))

Current TDLR licensing guidance confirms:

- Class A: any equipment size.
- Class B: ≤25 tons cooling / ≤1.5 million BTU/h heating.
- `E`: Environmental Air Conditioning.
- `R`: Commercial Refrigeration / Process Cooling and Heating.
- `C`: combined E+R. ([tdlr.texas.gov](https://www.tdlr.texas.gov/acr/contractor-apply.htm?utm_source=chatgpt.com))

An electrical/TECL license is therefore not an ACR license. Production validation specifically requires `acrLicense`; it does not allow generic `license`/TECL to satisfy that field. fileciteturn11file0L2-L2

---

# FINDINGS TABLE

| ID | Severity | Area | File | Function / line | Expected | Actual | Reproduction | Risk | Required correction |
|---|---|---|---|---|---|---|---|---|---|
| **F-01** | **P0 STOP SHIP** | Pricing lifecycle / Quote | `index.html` | `applyCatalogUnitPrice()` | Catalog price changes must not mutate historical Job Material until explicit Calculator Apply/Re-Apply | Matching `materialsUsed[].unitCost` is immediately overwritten | Apply Calculator at 100/70 → edit Catalog Customer from 100→110 → **do not Apply** → Job `unitCost` becomes 110 | Method A/Quote silently changes without explicit lifecycle action; lowering price can silently underprice quote | Stop implicit Catalog→existing Job `unitCost` propagation for Calculator historical lines; require explicit intended update pathway |
| **F-02** | **P1** | Your Cost provenance | `index.html` | `applyCatalogCostMap()` | Missing Your Cost remains semantically missing until fallback is resolved with `customer-price-fallback` provenance | Missing `yourCost` gets assigned normalized `unitCost` upstream | Load Catalog row `{unitCost:50, yourCost:missing}` through main-app normalization, then Calculator | Calculator may call the value explicit `catalog-your-cost`; fallback origin is lost and can become stale after later Customer Price edits | Preserve blank state or persist explicit fallback provenance separately |
| **F-03** | **P1** | Test coverage | `tests/ac-calculator-pricing.test.js` | integration coverage | Required lifecycle fixtures must execute production integration | Engine tests pass but do not exercise main Catalog editor → stored Job → Calculator/P&L lifecycle | Existing tests instantiate engine objects directly | Production P0 escaped green CI | Add executable integration regression for Catalog edit without Apply, blank-fallback provenance, Calculate nonmutation, full re-Apply 100/70→110/55 |
| **F-04** | **P2** | Catalog matcher | `ac-calculator-engine.js` | `resolveCatalogItem()` | `compatibleSystems`/`systemType` contract should actually constrain matching if used | Function receives them but no compatibility condition is executed | Inspect matcher | Dormant future mismatch risk; this behavior predates current pricing block | Either implement contract or remove/de-document unused compatibility field |

---

# ARCHITECTURE SEPARATION

### Calculator engine itself: **PASS**

Current engine implements:

```text
Catalog unitCost
→ customerUnitPrice
→ BOM unitCost/customerUnitPrice
→ Job unitCost

Catalog yourCost
→ yourUnitCost
→ Job procurementCostSnapshot
```

`actualCost` is absent from Calculator-created lines.

The engine's Apply object is explicit:

```text
unitCost = customerUnitPrice
procurementCostSnapshot = yourUnitCost
```

and keeps separate price-source metadata. fileciteturn5file0L2-L2

### Full production architecture: **FAIL**

Because Catalog Customer Price has a second production path:

```text
Catalog Customer Price edit
→ directly mutates existing Job unitCost
→ calcMaterial
→ Method A
→ Quote
```

without explicit Calculator re-Apply. fileciteturn28file0L2-L2

That violates the acceptance lifecycle.

---

# CATALOG CUSTOMER PRICE

**Semantics confirmed:** `catalog[].unitCost` is Customer/quote-side price basis.

Catalog UI explicitly calls it `Customer $`, and `calcMaterial()` calculates quote-side material cost strictly from `materialsUsed[].qty × materialsUsed[].unitCost`. fileciteturn27file0L2-L2 fileciteturn32file0L2-L2

No evidence that Calculator uses `yourCost` for quote calculation.

**But:** Catalog customer-price editor automatically updates matching job rows, which is the P0 lifecycle violation.

# CATALOG YOUR COST

`catalog[].yourCost` is internal/direct procurement cost.

It is not read by Method A.

Explicit edits are strictly stored as nonnegative finite number or `INVALID_FINANCIAL`; invalid is not coerced to zero. fileciteturn28file0L2-L2

The missing-value preprocessing defect F-02 remains.

---

# CALCULATOR STRICT NORMALIZATION

**PASS.**

Engine 2.1.0 defines `INVALID_FINANCIAL` and strict normalization.

For financial values:

- `NaN` → INVALID
- `Infinity` → INVALID
- `-Infinity` → INVALID
- `"Infinity"` → INVALID
- `"NaN"` → INVALID
- `"abc"` → INVALID
- `-1` → INVALID
- `0` → valid zero
- blank → semantically blank, not numeric zero. fileciteturn4file0L2-L2

Calculator `money()` renders invalid/unknown as `—`, while real zero renders `$0.00`. fileciteturn8file0L2-L2

---

# CATALOG RESOLUTION

`resolveCatalogItem()` preserves the previous scoring algorithm across the pricing block:

- exclude tokens
- category match
- packaged-length conversion
- include-token score
- preferred ID +200
- exact category +40
- same unit +30
- packaged-length +25
- minimum score 60. fileciteturn6file0L2-L2

Comparison with `a492dfb8…` shows that dual-price additions did not rewrite this scoring logic. fileciteturn19file0L2-L2

`compatibleSystems/systemType` remains unused, but that was already true at starting SHA.

---

# DUAL BOM MODEL

**PASS.**

Resolved BOM contains:

- compatibility `unitCost`
- `customerUnitPrice`
- `yourUnitCost`
- `customerExtension`
- `yourExtension`
- `materialMargin`
- `materialMarginPct`
- `customerPriceSource`
- `yourCostSource`
- `financialInvalid`
- `zeroPriceReview`
- `pricingState`. fileciteturn5file0L2-L2

Compatibility `unitCost` is Customer Price, not Your Cost.

---

# CUSTOMER TOTALS / YOUR COST TOTALS / MATERIAL MARGIN

Engine formulas are correct.

For `qty=2, Customer=100, Your=70`:

```text
Customer Ext = 200
Your Ext     = 140
Margin       = 60
Margin %     = 60 / 200 = 30%
```

For rows `2×100/70` and `3×50/40`:

```text
Customer total = 350
Your total     = 260
Margin         = 90
Margin %       = 90 / 350
               = 0.257142857142...
```

No premature rounding in the aggregate. fileciteturn5file0L2-L2

The executable Calculator test covers these exact values. fileciteturn7file0L2-L2

---

# ZERO / INVALID SEMANTICS

**PASS inside Calculator.**

Selected unresolved/invalid rows make aggregate invalid.

Unselected rows are skipped before validation, so unselected review rows do not poison selected totals.

Real `0/0`:

- financially valid;
- aggregate = 0;
- marked `zero-review`;
- UI requires explicit confirmation before Apply. fileciteturn5file0L2-L2 fileciteturn8file0L2-L2

This cleanly separates financial validity from operational review.

---

# BOM UI

**PASS static inspection.**

Desktop exposes separate columns:

```text
Customer Unit
Customer Ext.
Your Unit
Your Ext.
Margin $
Margin %
```

and separate Customer/Your aggregate cards. fileciteturn9file0L2-L2

No shared `unitCost` column is being reused for both tracks.

# MOBILE UI

**PASS static architecture; interactive test NOT PERFORMED.**

Below 560 px the wide pricing columns are hidden and replaced by per-row mobile detail explicitly containing:

- Customer amount/extension/source
- Your Cost amount/extension/source
- Margin $/%. fileciteturn10file0L2-L2

The table switches from 1280px table interaction to card/grid presentation, and touch controls retain 44px targets.

---

# APPLY TO JOB MATERIALS

**PASS inside Calculator engine.**

100/70 ×2 produces:

```text
qty = 2
unitCost = 100
procurementCostSnapshot = 70
procurementCostSource = catalog-your-cost
```

No `actualCost`. fileciteturn5file0L2-L2

Invalid selected Customer or Your Cost hard-blocks Apply.

---

# PROCUREMENT SNAPSHOT

Correct precedence in reconciliation is:

```text
actualCost
→ procurementCostSnapshot
→ unitCost estimate fallback
```

An explicitly supplied invalid higher-priority value does **not** fall through to a lower-priority value. fileciteturn11file0L2-L2

The core fixture:

```text
used     = 380
estimate = 450
variance = -70
actual/snapshot/fallback = 1/1/1
```

is executable in the shared financial suite. fileciteturn13file0L2-L2

---

# PROVENANCE

**FAIL — F-02.**

Engine provenance is correct when fed genuinely blank data:

```text
blank yourCost
→ Your Cost = Customer Price
→ yourCostSource = customer-price-fallback
```

But main application normalization has:

```text
if yourCost blank
    row.yourCost = normalizePersistentFinancial(row.unitCost, 0)
```

before Calculator receives the row. fileciteturn24file0L2-L2

Consequently Calculator can see a populated `yourCost` and classify it as `catalog-your-cost`.

This makes provenance semantically false.

---

# MANUAL MATERIAL PROTECTION

**PASS.**

Calculator Apply retains rows whose `calcSource` is neither current `ac-calculator` nor legacy `ac-calculator-v1`; only Calculator-generated rows are rebuilt. fileciteturn5file0L2-L2

Executable test also confirms manual object identity survives re-Apply. fileciteturn7file0L2-L2

---

# RE-APPLY

### Engine: PASS

Explicit Calculator re-Apply rebuilds Calculator-generated rows from current BOM and leaves manual rows.

### Production lifecycle: **FAIL**

Required fixture:

```text
Apply 100 / 70
Catalog changes to 110 / 55
DO NOT APPLY
Expected Job: 100 / snapshot 70
```

Actual production behavior after Customer Price edit:

```text
Job unitCost → 110 immediately
snapshot     → remains 70
```

because `applyCatalogUnitPrice()` directly propagates Customer Price to matching `materialsUsed`. fileciteturn28file0L2-L2

This is the principal STOP-SHIP defect.

---

# CALCULATE NON-MUTATION

**PASS by code inspection.**

Calculator `calculate()` performs:

```text
read inputs
buildScope
buildResolvedBom
render
```

and performs no `localStorage.setItem()`.

Storage mutation occurs in `applyToJob()` after explicit Apply. fileciteturn8file0L2-L2

The CI test suite does not provide a true DOM/localStorage integration fixture for this, however.

---

# EXPORT JSON

**PASS.**

Calculator exports complete BOM object, not only compatibility `unitCost`.

BOM includes both price tracks and their source fields.

`INVALID_FINANCIAL` is a string sentinel and therefore survives:

```text
JSON.stringify
→ JSON.parse
```

instead of becoming JSON `null`. fileciteturn7file0L2-L2

---

# MATERIAL RECONCILIATION

**PASS.**

After Calculator 2×100 with snapshot 70:

```text
Estimate = 200
Used     = 140
Variance = -60
Source   = snapshot
```

With Actual 65:

```text
Estimate = 200
Used     = 130
Variance = -70
Source   = actual
```

Clearing Actual deletes the property, therefore hierarchy returns to snapshot rather than zero. Production event handler explicitly does `delete row.actualCost` on blank. fileciteturn17file0L2-L2

Explicit Refresh Snapshot validates Catalog Your Cost and writes it only after the user clicks Refresh. fileciteturn17file0L2-L2

---

# JOB PROFITABILITY

**PASS for cost hierarchy.**

P&L executes shared `reconcileMaterialCosts()` and uses its resolved material cost as Actual Material when linked. Invalid reconciliation propagates into P&L errors instead of creating false GP. fileciteturn31file0L2-L2

For:

```text
Customer = 100
Your = 1
qty = 10
```

after correct Calculator Apply:

```text
quote-side estimate reference = 1000
profitability material cost   = 10
```

until Actual Purchase overrides snapshot.

That separation is correct.

---

# METHOD A

**PASS.**

Formula:

```text
Sales = Cost × (1 + OH) / (1 − Profit)
```

Fixture:

```text
10000 × 1.25 / .85
= 14705.882352941177
```

is executable in `financial-integrity-core.js` tests. fileciteturn11file0L2-L2 fileciteturn12file0L2-L2

Profit:

```text
0     valid
0.99  valid
1     invalid
1.01  invalid
<0    invalid
nonfinite invalid
```

---

# QUOTE VALIDITY

`calcMaterial()` uses only Job `unitCost`. `yourCost`, procurement snapshot and actual purchase cost do not enter Method A. fileciteturn32file0L2-L2

Thus there is **no direct Your Cost → Quote contamination**.

The failure is instead **Catalog → historical Job mutation**.

# QUOTE PRINT

Financially invalid Method A/CO values produce invalid quote state instead of plausible `$0`.

Customer-document validation also requires ACR company data before production quote/invoice use. fileciteturn18file0L2-L2

---

# LABOR

**PASS.**

Required legacy fixture produces:

```text
Straight = 16 h
OT 1.5   = 8 h
OT 2.0   = 3 h
Cost     = $1,700
```

and malformed legacy inputs produce persistent invalid state. fileciteturn12file0L2-L2

# BURDEN

Financial burden rates are normalized through strict persistent financial handling; malformed rate cannot silently become valid job cost.

# SMALL TOOLS

**PASS required fixture.**

```text
purchase 600
residual 100
life 1000
maintenance .10/h

ownership = .50/h
recovery  = .60/h
usage 4
job cost  = 2.40
```

Executable test confirms it. fileciteturn12file0L2-L2

# EQUIPMENT / SUBCONTRACTORS

Current cost calculation explicitly invalidates malformed/nonnegative violations rather than silently producing quote zero. fileciteturn24file0L2-L2

# CHANGE ORDERS

Only approved orders enter quoted revenue. Invalid/negative approved amounts invalidate the calculation rather than becoming a customer credit or zero. fileciteturn11file0L2-L2

Required +500 / draft / rejected / void / +500.49 / negative behavior remains protected by core/test logic.

# T&M

**PASS.**

T&M is calculated separately from Method A, with independent equipment/labor/material/sub totals. Invalid rows invalidate T&M.

Invoice date listener persists `state.tm.date`, and existing regression checks assert print path uses `tm.date`. fileciteturn17file0L2-L2 fileciteturn12file0L2-L2

---

# COMPANY / ACR

**PASS architecture.**

`validateAcrCompany()` requires:

- legal/business name
- complete address
- phone
- `acrLicense`. fileciteturn11file0L2-L2

TECL/generic license is explicitly prevented from auto-promoting into ACR evidence. fileciteturn26file0L2-L2

# TEXAS ACR

**PASS against current TDLR authority.**

Production quote includes an ACR block plus the TDLR regulatory notice. fileciteturn18file0L2-L2

This matches current TDLR enforcement requirements under §75.71(i). ([tdlr.texas.gov](https://www.tdlr.texas.gov/enforcement/acrsanctions.htm?utm_source=chatgpt.com))

Class/endorsement semantics remain consistent with current TDLR guidance. ([tdlr.texas.gov](https://www.tdlr.texas.gov/acr/contractor-apply.htm?utm_source=chatgpt.com))

---

# SERVICE WORKER

**PASS.**

Expected cache is exactly:

```js
const CACHE = 'bruno-ac-v32';
```

and shell includes:

```text
financial-integrity-core.js
ac-calculator.html
ac-calculator.js
ac-calculator-engine.js
ac-calculator-ux.js
ac-calculator.css
```

No stale v31 reference in the inspected SW. fileciteturn23file0L2-L2

---

# TEST QUALITY

`tests/ac-calculator-pricing.test.js` contains substantial **EXECUTABLE ENGINE** tests, not merely grep assertions:

- dual Catalog mapping
- 100/70×2
- blank fallback
- invalid Customer
- invalid Your Cost
- legitimate zero
- 350/260/90 aggregate
- Apply mapping
- provenance
- no `actualCost`
- manual retention
- JSON dual fields
- sentinel round trip. fileciteturn7file0L2-L2

However:

- invalid Your Cost variants are not as exhaustive as Customer variants;
- unselected-invalid aggregate isn't an explicit named fixture;
- re-Apply test changes Your Cost to 55 but does **not** exercise required Customer 100→110 lifecycle;
- no integrated main Catalog editor → existing Calculator row test;
- no DOM/localStorage Calculate-nonmutation test;
- source guard section remains **SOURCE ASSERTION**, not runtime proof.

This explains why green CI missed F-01/F-02.

---

# CI PROVENANCE

**Verified.**

Important distinction:

```text
CI triggering SHA = 10be1895…
Final produced HEAD = 104c8229…
```

The final HEAD is not the run trigger itself. The workflow made/pushed the final commit after testing and cleanup. fileciteturn20file0L2-L2 fileciteturn22file0L2-L2 fileciteturn29file0L2-L2

That provenance is coherent.

---

# SCOPE REGRESSION

From starting block `a492dfb8…` → current `104c8229…`:

```text
5 commits ahead
6 affected files
```

Only Calculator pricing/UI/test + SW cache changed.

Matcher structure, line-set generation, condensate/overflow logic, A2L, repair mode, permit/haul-away and scope-generation body were not rewritten by the dual-pricing block.

No new HVAC-rule regression was identified.

---

# UNSAFE COERCION CLASSIFICATION

| Pattern | Classification | Reason |
|---|---|---|
| Calculator `num()` on scope dimensions, qty metadata, required length | **SAFE NON-FINANCIAL** | Scope/input normalization |
| Calculator Customer/Your price | **SAFE FINANCIAL** | Uses `strictFinancial`, not `num()` |
| BOM extensions | **SAFE FINANCIAL** | Require `validFinancial` |
| Apply unitCost/snapshot | **SAFE FINANCIAL** | Already hard-gated |
| `normalizePersistentFinancial()` | **SAFE FINANCIAL** | persistent invalid sentinel |
| Material reconciliation | **SAFE FINANCIAL** | strict precedence, invalid blocks |
| `asNum()` in employee/UI/tax/productivity areas | Mostly **SAFE NON-FINANCIAL** for inspected use |
| `pct(Number(n) || 0)` | **QUESTIONABLE formatter** | permissive helper, but inspected critical P&L caller gates finite value first |
| `applyCatalogCostMap blank yourCost → unitCost` | **UNSAFE SEMANTIC / P1** | destroys provenance/blank state |
| `applyCatalogUnitPrice → mats[].unitCost` | **UNSAFE LIFECYCLE / P0** | silently mutates persisted quote basis |

---

# MERGE BLOCKERS

### **P0 — F-01**
Catalog Customer Price edits must not silently modify an existing Calculator-generated Job Material and therefore change Method A / Quote before explicit Apply/Re-Apply.

Required invariant must be:

```text
Job after Apply:
Customer 100
Snapshot 70

Catalog later:
Customer 110
Your 55

WITHOUT Apply:
Job still 100 / 70

AFTER Apply:
Job becomes 110 / 55
```

Current production does not satisfy this.

### **P1 — F-02**
Blank Your Cost fallback must remain identifiable as fallback.

Required:

```text
customerUnitPrice = 50
yourUnitCost = 50
yourCostSource = customer-price-fallback
```

It must not be upstream-converted into a fake explicit Catalog Your Cost.

### **P1 — F-03**
CI needs an actual integration regression capable of catching both behaviors above.

---

# NON-BLOCKING FOLLOW-UPS

`resolveCatalogItem()` still carries `compatibleSystems` and receives `systemType`, but does not use them in scoring/filtering. This predates the new dual-pricing block and I did not find evidence that current generated requirements depend on it, so I classify it P2 rather than a new pricing blocker. fileciteturn6file0L2-L2 fileciteturn19file0L2-L2

---

# FINAL VERDICT

## **C — REJECT / REWORK REQUIRED**

The central dual-price calculations themselves are substantially correct:

```text
Customer Price
→ Calculator Customer
→ Job unitCost
→ Method A / Quote

Your Cost
→ Calculator Your Cost
→ procurementCostSnapshot
→ P&L

Actual Purchase
→ actualCost
→ overrides snapshot only in P&L
```

But **the full production tree does not preserve the lifecycle boundary** because editing current Catalog Customer Price silently propagates into an already-existing Job Material and therefore into Method A/Quote without explicit Calculator Apply.

Additionally, missing Your Cost loses fallback provenance before reaching Calculator.

Under your acceptance standard, the first defect is sufficient for:

# **C — REJECT / REWORK REQUIRED**

**DO NOT MERGE.**