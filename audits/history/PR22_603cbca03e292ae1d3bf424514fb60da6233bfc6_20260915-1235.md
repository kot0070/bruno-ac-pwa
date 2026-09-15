# PR #22 — FINAL ACCEPTANCE AUDIT

## Executive Verdict

**VERDICT: B — ACCEPT AFTER MINOR FIXES**

Production behavior at audited HEAD `603cbca03e292ae1d3bf424514fb60da6233bfc6` satisfies the financial/lifecycle safety invariants I could independently verify from the final production tree: no implicit Catalog/Margins → existing Job `materialsUsed[].unitCost` propagation was found; Calculator Apply maps Customer Price to Job `unitCost` and Your Cost to `procurementCostSnapshot`; P&L cost precedence is Actual → Snapshot → Estimate; invalid explicit higher-priority values block instead of falling through; Quote/Method A remains on the customer-price track.

No P0 defect was found.

Acceptance is **B, not A**, because the test suite does not provide a genuine executable integration proof of the two production UI lifecycle paths required by the task. The canonical lifecycle test executes shared core functions on a synthetic state, while the real Catalog/Margins UI paths are protected primarily by source/string assertions. This is a **P1 integration-coverage gap** under the task severity rubric. A second, non-blocking UX/semantics issue exists: clearing an explicit Catalog/Margins Your Cost field writes `INVALID_FINANCIAL` rather than restoring the documented blank/fallback state.

---

## Repository State

- Repository: `kot0070/bruno-ac-pwa`
- PR: `#22`
- PR state: **OPEN**
- Draft: **YES**
- Merged: **NO**
- GitHub mergeable: **YES**
- Base branch: `main`
- Expected BASE SHA: `f0c8d11e8d1331811f14e4820f3e0ebeff86b7b5`
- Production branch: `feature/financial-integrity-texas-acr-docs`
- Expected HEAD SHA: `603cbca03e292ae1d3bf424514fb60da6233bfc6`
- Actual audited HEAD SHA: `603cbca03e292ae1d3bf424514fb60da6233bfc6`
- Previous rejected HEAD: `104c8229f2c0ee4ac377e9081fe807f58683db4e`
- Corrective production commit: `67952a6bc3504aeb2ea580dcc10fccf4318a6aa8`

The actual current production HEAD exactly matches the task's expected HEAD. Production branch, PR state, and production files were read-only during this audit.

---

## Audited SHA

`603cbca03e292ae1d3bf424514fb60da6233bfc6`

The HEAD commit itself changes only `README.md`; comparison from corrective commit `67952a6bc3504aeb2ea580dcc10fccf4318a6aa8` to HEAD shows **2 commits and zero net file differences**, so the corrective production tree is unchanged at final HEAD.

---

## Changed Files

The final PR net changed-file inventory is exactly the required 9 files:

1. `ac-calculator-engine.js`
2. `ac-calculator.css`
3. `ac-calculator.html`
4. `ac-calculator.js`
5. `financial-integrity-core.js`
6. `index.html`
7. `sw.js`
8. `tests/ac-calculator-pricing.test.js`
9. `tests/financial-integrity.test.js`

Confirmed absent from the final PR net diff:

- `README.md`
- `scripts/`
- `.github/workflows/`
- unrelated assets

**Result: PASS.**

---

## CI Provenance

Authoritative lifecycle run: `34995112030` — workflow **PR22 Catalog Job Lifecycle Integrity**.

Verified facts:

- run conclusion: **success**;
- triggering checkout SHA: `5c0c98d5c77b4318ea2de33327d33852a7e9d270`;
- `tests/financial-integrity.test.js`: passed;
- `tests/ac-calculator-pricing.test.js`: passed;
- Node syntax checks for financial core, Calculator engine/UI/UX and service worker: passed;
- inline JS syntax check for `index.html`: passed;
- lifecycle source-invariant gate: passed;
- workflow then created production commit `67952a6bc3504aeb2ea580dcc10fccf4318a6aa8` (`Enforce catalog-job pricing lifecycle boundary`) and removed the temporary workflow/script.

Important limitation: the run's lifecycle invariant gate uses source assertions for the main app UI paths. Green CI is corroborating evidence, not acceptance authority.

**Result: PASS with test-quality caveat.**

---

## Browser / DOM Result

**NOT PERFORMED.**

No interactive browser runner was available in this audit environment. DOM/UI behavior was inspected statically from the production source only. No browser execution is claimed.

---

## Findings Table

| ID | Severity | Area | Verified fact | Risk | Required action |
|---|---|---|---|---|---|
| F-01 | **P1** | Test quality / lifecycle integration | Canonical lifecycle test executes shared core functions on synthetic state; production Catalog/Margins UI paths are guarded mainly by source assertions, not executable UI/localStorage integration | Regression in event wiring/persistence could pass tests while violating lifecycle | Add executable integration test covering Catalog UI and Margins UI through persisted state/reload |
| F-02 | P2 | Blank Your Cost UX | Catalog `cat-your` and Margins `mrg-your` blank edit converts to `INVALID_FINANCIAL` instead of restoring semantic blank/fallback | User cannot clear explicit Your Cost back to documented fallback state through these controls | Treat blank input as deletion/blank and remove cost-map entry; preserve invalid only for nonblank malformed input |

No P0 finding was identified.

---

## Catalog / Job Lifecycle

### Catalog Customer Price path

Production `applyCatalogUnitPrice()` calls `BrunoFinancial.setCatalogCustomerPrice(state, cid, ...)`, which writes only the matching Catalog row's `unitCost`. No loop propagating that value into existing `materialsUsed[]` is present.

### Margins Customer Price path

The `mrg-cust` handler updates the Catalog row's `unitCost`, persists the Catalog price map, and then saves. It explicitly treats Catalog/Margins edits as pricing-template updates only. No existing Job Material `unitCost` assignment is performed.

### Explicit Calculator Apply/Re-Apply

`ac-calculator-engine.js::applyBomToJob()` removes only prior Calculator-generated lines and creates replacement generated rows with:

- `unitCost = customerUnitPrice`
- `procurementCostSnapshot = yourUnitCost`
- no `actualCost`

Manual Job Material rows are preserved.

### Required lifecycle fixture

For the production code paths:

1. Catalog 100/70 → explicit Apply produces Job `100/70`.
2. Catalog changes to 110/55 without Apply do not contain any production write path that mutates the existing generated Job line.
3. Method A reads Job `materialsUsed[].unitCost`, therefore historical quote-side material remains based on 100.
4. P&L reconciliation reads the historical snapshot 70 unless an actual cost exists.
5. Explicit re-Apply regenerates Calculator rows from current Catalog values and therefore moves the generated line to 110/55.

The same no-implicit-mutation conclusion applies to Margins Customer Price edits.

**Production result: PASS.**

**Executable integration proof: INCOMPLETE (F-01).**

---

## Blank Your Cost / Fallback Provenance

Production normalization preserves genuinely missing/blank `catalog[].yourCost`: if no persisted cost-map entry exists, normalization leaves it blank instead of materializing Customer Price into Your Cost.

Calculator `catalogPricing()` resolves:

- blank/missing `yourCost` → current valid Customer Price;
- provenance → `customer-price-fallback`.

Therefore a row with Customer 50 and blank Your Cost resolves 50/50 with fallback provenance. If Customer changes to 60 while Your remains genuinely blank, a fresh Calculator build reads the current Customer value and resolves 60/60; no stale 50 is persisted by the fallback mechanism.

Persistence support: `saveCatalogCostMapFromState()` omits truly blank `yourCost`, while `applyCatalogCostMap()` only writes Your Cost when a map entry exists.

**Core/persistence result: PASS.**

### Follow-up semantics issue

Both Catalog `cat-your` and Margins `mrg-your` handlers treat an entered blank as `INVALID_FINANCIAL`, even though the rendered UI describes blank as Customer Price fallback. This does not break pre-existing blank fallback rows, but it prevents a user from clearing an explicit Your Cost back to fallback through the UI.

**Classification: P2 follow-up.**

---

## Dual Pricing

Verified production separation:

### Customer / quote track

`Catalog unitCost` → Calculator `customerUnitPrice` → Apply `Job unitCost` → `calcMaterial()` → Method A → Quote.

### Internal direct-cost track

`Catalog yourCost` → Calculator `yourUnitCost` → Apply `procurementCostSnapshot` → P&L reconciliation.

### Actual track

`actualCost` is checked first by `resolveMaterialCost()` and overrides snapshot only for P&L material-cost reconciliation.

No Calculator-generated row includes `actualCost`.

**Result: PASS.**

---

## Apply Mapping

`applyBomToJob()` creates generated rows using:

- quantity validated with strict financial semantics;
- `unitCost: b.customerUnitPrice`;
- `procurementCostSnapshot: b.yourUnitCost`;
- provenance retained;
- `actualCost` absent.

Invalid selected Customer or Your Cost is hard-blocking before Apply. Legitimate zero is valid but separately review-gated by UI confirmation.

**Result: PASS.**

---

## Numeric Fixtures

Production engine formulas independently match required fixtures:

### Row fixture

qty 2, Customer 100, Your 70:

- Customer Ext = `2 × 100 = 200`
- Your Ext = `2 × 70 = 140`
- Margin = `200 − 140 = 60`
- Margin % = `60 / 200 = 30%`

### Aggregate fixture

Rows 2×100/70 and 3×50/40:

- Customer = `200 + 150 = 350`
- Your = `140 + 120 = 260`
- Margin = `90`
- Margin % = `90 / 350 = 25.714285714...%`

These values are also covered by executable core tests.

### Adversarial quote fixture

Customer 100, Your 1, qty 10:

- Job `unitCost` after Apply = 100 → quote-side material basis = `1000`;
- snapshot = 1 → P&L snapshot basis = `10`;
- Your Cost does not enter `calcMaterial()`/Method A.

**Result: PASS.**

---

## Persistence / Reload

Production persistence stores the complete Job state in `bruno-ac-v1`. Main-app normalization treats Catalog and `materialsUsed[]` independently:

- Catalog Customer Price is normalized within Catalog;
- Catalog Your Cost is loaded only from its own cost map when an entry exists;
- existing Job Material `unitCost` is normalized from its own stored value;
- existing Job `procurementCostSnapshot` is normalized from its own stored value.

No normalization step reconnects Job `unitCost` to Catalog `unitCost` or Job snapshot to Catalog Your Cost.

Thus Catalog 110/55 and historical Job 100/70 can coexist through save/reload until explicit lifecycle action.

Export/import normalization inspected in the production tree does not contain an implicit Catalog→existing Job re-link path.

**Static production result: PASS.**

**Browser/localStorage integration execution: NOT PERFORMED.**

---

## Strict Invalid Semantics / Unsafe Financial Coercion Sweep

### Calculator pricing

`strictFinancial()` accepts only finite nonnegative numeric values, preserves `INVALID_FINANCIAL`, and distinguishes blank from numeric zero.

Verified adverse values across Customer/Your paths:

- `NaN`
- `Infinity`
- `-Infinity`
- `"Infinity"`
- `"NaN"`
- `"abc"`
- negatives

These become invalid rather than plausible zero. Real zero remains valid.

### Actual / snapshot reconciliation

`resolveMaterialCost()` determines whether Actual or Snapshot was explicitly supplied before validation. If the higher-priority supplied value is invalid, reconciliation returns an error and does **not** fall through to lower-priority data.

Real zero Actual remains valid zero.

### Main-app persistence

Persistent financial normalization uses a durable `INVALID_FINANCIAL` sentinel for nonblank malformed/negative values rather than JSON-unsafe `NaN`.

No P0 invalid→zero path was identified in the audited financial tracks.

**Result: PASS.**

---

## Material Reconciliation

Production shared core precedence:

`Actual → Procurement Snapshot → Estimate (Job unitCost)`

Required fixture:

- A: qty1, est100, snap80, actual90 → 90
- B: qty2, est100, snap70 → 140
- C: qty3, est50 → 150

Totals:

- Used = `90 + 140 + 150 = 380`
- Estimate = `100 + 200 + 150 = 450`
- Variance = `380 − 450 = -70`
- source counts = actual 1 / snapshot 1 / estimate fallback 1

Executable core tests assert these exact values and assert invalid explicit Actual/Snapshot does not fall through.

**Result: PASS.**

---

## Profitability

Job Profitability uses `BrunoFinancial.reconcileMaterialCosts(state.materialsUsed || [])` when linked to material reconciliation. The reconciliation path is independent from quote-side `calcMaterial()` and uses Actual/Snapshot/Estimate precedence.

Gross profit is rendered only when both revenue and actual total are finite; invalid material reconciliation feeds validation errors instead of a fabricated plausible value.

**Result: PASS.**

---

## Method A / Quote

`calcMaterial()` reads each stored Job Material's `qty` and `unitCost`. It does not read Catalog `yourCost`, Calculator `yourUnitCost`, `procurementCostSnapshot`, or `actualCost`.

Invalid Job material quantity or `unitCost` makes the material bucket invalid. Method A pricing delegates to `BrunoFinancial.methodASales()`, which rejects nonfinite/negative cost/overhead and invalid profit margins.

Quote validity depends on valid Method A summary plus valid Change Orders. Invalid quote totals render as dash / invalid rather than zero.

**Result: PASS.**

---

## Regression Sweep

### Labor

Strict explicit-labor sentinel persistence and legacy migration-before-permissive-normalization remain covered by executable core tests plus source integration assertions.

**PASS.**

### Burden / Small Tools / Equipment / Subcontractors

Financial paths use finite/nonnegative validation; reusable-tool recovery has executable core coverage; known invalid-to-zero patterns are explicitly guarded in source-level assertions.

**PASS by core + source inspection.**

### Change Orders

Only approved COs enter quoted contract revenue. Negative approved amounts are rejected rather than silently reducing contract revenue.

**PASS.**

### T&M

T&M totals require finite nonnegative equipment, labor, material, and subcontractor inputs. Invalid row data yields invalid total.

**PASS.**

### Company / ACR validation

`validateAcrCompany()` requires `acrLicense` explicitly. Production normalization does not promote TECL/generic license into ACR.

**PASS.**

### Manual material preservation

Calculator re-Apply removes only prior Calculator-generated rows; manual Job Material rows survive.

**PASS.**

### Snapshot refresh

P&L snapshot refresh is an explicit user action. It validates current Catalog Your Cost and writes only the selected Job row's `procurementCostSnapshot`; invalid Catalog Your Cost blocks refresh.

**PASS.**

### Calculate nonmutation

Calculator `calculate()` builds scope/BOM preview only. State mutation/persistence occurs in `applyToJob()` after explicit user action.

**PASS.**

---

## Service Worker

`sw.js` uses cache `bruno-ac-v32` and includes the Calculator HTML/JS/engine/UX/CSS plus financial core in the application shell. Install/activate logic removes older cache names; fetch handling remains same-origin and cache/network based.

No stale calculator asset omission was found.

**Result: PASS.**

---

## Test Quality

Evidence classification:

### EXECUTABLE CORE

Strong coverage:

- Method A finite-domain validation;
- labor calculations and migration;
- T&M;
- tool/equipment recovery;
- Change Orders;
- ACR company validation;
- material reconciliation precedence and numeric fixture;
- invalid higher-priority Actual/Snapshot blocking;
- Calculator dual-price resolution;
- Calculator row/aggregate numeric fixtures;
- Apply mapping;
- manual-row preservation;
- invalid/zero Calculator semantics;
- synthetic Catalog→Job lifecycle helper behavior.

### EXECUTABLE INTEGRATION

**Insufficient for the mandatory lifecycle boundary.**

The test does not execute the real `index.html` Catalog input handler, Margins input handler, `save()`/reload path, or a browser/localStorage flow. It does not directly perform both UI routes as a persisted end-to-end lifecycle.

### SOURCE ASSERTION

Used for critical integration guards such as absence of exact historical propagation statements and presence of `setCatalogCustomerPrice(...)`.

Useful, but not runtime proof.

### WEAK STRING ASSERTION

The CI lifecycle gate and portions of the Node suites check literal source substrings. These can miss semantically equivalent regressions introduced under different syntax or helper names.

### Canonical lifecycle proof assessment

The current test genuinely proves this limited core-level sequence:

`synthetic Job100/70 → shared helper Catalog Customer110 leaves synthetic Job unchanged → engine rebuild with current Catalog110/55 → explicit engine Apply gives Job110/55`.

It does **not** genuinely prove the full required production sequence through Catalog UI, Margins UI, persistence/reload, and application integration.

**Finding: F-01 P1.**

---

## Job Material Write Inventory

### Writes to `materialsUsed[].unitCost`

| Path | Classification | Audit result |
|---|---|---|
| `normalizeState()` normalizes each stored Job row's own `unitCost` | persistence normalization, not Catalog propagation | allowed |
| Job Materials `.mat-cost` input handler | explicit user edit | allowed |
| `mat-add-blank` | explicit user creation (`unitCost:0`) | allowed |
| Catalog `cat-add` creates a new Job Material with current Catalog Customer Price | explicit Add action | allowed |
| Calculator `applyBomToJob()` creates/replaces Calculator-generated Job rows with `customerUnitPrice` | explicit Apply/Re-Apply | allowed |

No implicit Catalog/Margins background propagation write to existing Job Material `unitCost` was found.

### Writes to `procurementCostSnapshot`

| Path | Classification | Audit result |
|---|---|---|
| `normalizeState()` normalizes an existing stored snapshot | persistence normalization | allowed |
| Catalog `cat-add` snapshots explicit Catalog Your Cost into newly added Job row | explicit Add action | allowed |
| Calculator `applyBomToJob()` snapshots Calculator Your Cost | explicit Apply/Re-Apply | allowed |
| P&L snapshot refresh handler | explicit refresh action | allowed |

No implicit background Catalog→existing Job snapshot propagation was found.

**Result: PASS.**

---

## Merge Blockers

### MB-01 — P1 executable integration coverage gap

Before upgrading this audit to **A — ACCEPT**, add an executable integration regression that drives the actual production lifecycle, including both UI write paths:

1. persisted Catalog 100/70;
2. Calculator Apply → Job 100/70;
3. Catalog UI Customer 110 / Your 55 → save/reload → Job remains 100/70;
4. Margins UI Customer edit → save/reload → Job still unchanged;
5. Method A remains on historical Job Customer value;
6. P&L remains on historical snapshot;
7. explicit Calculator re-Apply → Job 110/55.

This should test behavior, not grep for source strings.

No production P0 merge blocker was found.

---

## Non-Blocking Follow-Ups

1. **Your Cost clear semantics:** blanking `cat-your`/`mrg-your` should restore genuine blank/fallback instead of writing `INVALID_FINANCIAL`; malformed nonblank input should remain invalid.
2. Add explicit executable fixture for blank fallback 50 → Customer 60 with Your blank, including persistence/reload.
3. Add the adversarial Customer100 / Your1 / qty10 integration fixture to ensure Quote=1000-side and P&L snapshot=10-side across application plumbing.
4. Replace brittle exact-string lifecycle guards with behavioral integration tests where practical.

---

## Final Verdict

**B — ACCEPT AFTER MINOR FIXES**

Audited production HEAD:

`603cbca03e292ae1d3bf424514fb60da6233bfc6`

No P0 defect was found in the final production tree. The previous implicit Catalog/Margins → historical Job Customer Price propagation defect is not present at this HEAD, and blank fallback provenance is preserved for genuinely blank persisted Catalog rows.

The remaining acceptance blocker is **P1 test/integration coverage**: the mandatory lifecycle is not yet proven through the actual Catalog UI, Margins UI, persistence/reload, and explicit Calculator Apply path by an executable integration test. Browser execution was not available and is therefore not claimed.
