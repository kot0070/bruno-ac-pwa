# MAIN JOURNAL + ESTIMATOR UX V43 — INDEPENDENT AUDIT

```yaml
task_id: MAIN_JOURNAL_ESTIMATOR_UX_V43_AUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
audited_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
base_accepted_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
verdict: A_ACCEPT
findings:
  P0: 0
  P1: 0
  P2: 2
browser_runtime: NOT_PERFORMED
offline_runtime: NOT_PERFORMED
production_modified: false
main_modified: false
pr_modified: false
merge_performed: false
```

## EXECUTIVE RESULT

Exact production `main` HEAD `436a3696bd69779ef7d03e618db1c4ad4d8cf42a` is ACCEPTED.

No stop-ship, financial-integrity, lifecycle, compliance-boundary, stale-BOM, Commercial-Apply, required-field, or secondary-drain bypass was found in the changed scope. The 2,000 -> 20,000 ft² staged-estimator change is implemented as a preliminary estimating allowance only and is explicitly disclaimed from code minimums, Manual J, Manual D, airflow engineering, equipment sizing and tonnage selection. Manual Final overrides remain operator-controlled and feed the existing full calculator rather than a second pricing engine.

The staged Materials & price preview reads the existing calculator status outputs (`statLines`, `statResolved`, `statCustomer`, `statYour`, `statMargin`). The existing calculator returns null totals when any selected row is unresolved or has invalid Customer Price / Your Cost, which renders as `—`; Apply is independently blocked by unresolved/invalid rows and by staged-project/Commercial blockers.

Previous accepted financial invariants remain covered and unchanged: Customer Price and Your Cost are separate tracks, blank Your Cost remains `customer-price-fallback`, explicit zero is valid/reviewable, invalid financial values remain fail-closed, Catalog edits do not mutate historical Job snapshots until explicit Apply/Re-Apply, and calculator rows never create `actualCost`.

Two non-blocking P2 limitations remain: browser/offline runtime was unavailable, and the new wizard-to-calculator coupling is covered primarily by deterministic core tests plus source/string integration assertions rather than a mounted DOM integration test.

## EXACT HEAD / SCOPE

Independent GitHub branch resolution:

```yaml
branch: main
head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
parent: f7638584081fb3247963eeefae7f18762f822a73
head_commit: Remove temporary main v43 validation workflow
```

Compare from accepted baseline `5c7884b32f9e48adb0d3c81f9b8c70fb18f921db` to audited target contains exactly:

```yaml
modified:
  - project-estimator-core.js
  - project-estimator-wizard.js
  - project-estimator-wizard.css
  - workspace-v5.css
  - sw.js
  - tests/project-estimator-core.test.js
  - tests/project-estimator-integration.test.js
  - tests/service-journal-ux.test.js
unrelated_production_files: none
```

The final HEAD is one commit after validated commit `f7638584081fb3247963eeefae7f18762f822a73`; that post-CI delta removes only `.github/workflows/main-v43-ux-validation.yml`.

## SERVICE CALL JOURNAL

### Payroll / Tax Settings collapsed

Current Journal source renders:

```html
<details class="sj4-card sj4-tax"><summary>⚙ Payroll / Tax Settings</summary>...
```

There is no `open` attribute, so the native initial state is collapsed. Workspace CSS additionally enforces:

```css
.sj4-tax:not([open]) .sj4-tax-body{display:none!important}
```

The Service Journal regression test asserts both absence of default-open markup and presence of the collapsed structure.

### Saved calls static + compact + Edit

Current Journal source uses static saved-call rows and an explicit `data-edit-call` action; editing is handled through `sj4-call-modal` rather than persistent inline inputs. The changed workspace CSS reduces row padding/button size and applies truncation/min-width behavior for long address/description content.

Payroll calculation, stable worker identity, Day/Week/Month/Quarter range logic and storage schema were not changed in this production diff. The Journal executable test still covers period bounds, stable worker wage bases, payroll calculations and schema migration.

Runtime appearance/edit flow: `NOT_PERFORMED`.

## WHITE LETTERHEAD CONTROL

`workspace-v5.css` now explicitly styles `.letterhead-strip select` with application theme background, text and border tokens and also supplies a dark disabled state. This is CSS-only; no company/letterhead/quote business logic changed in the audited diff.

Runtime visual verification: `NOT_PERFORMED`.

## AREA RESPONSIVENESS — 2,000 vs 20,000 ft²

`project-estimator-core.js` implements:

```text
Residential: max(conditioned room count, ceil(total ft² / 400))
Commercial:  max(conditioned zone count, ceil(total ft² / 600))
```

The deterministic core test verifies the same limited residential room schedule produces:

```yaml
2000_ft2:
  area_allowance: 5
  supply_calculated: 5
20000_ft2:
  area_allowance: 50
  supply_calculated: 50
  return_grilles_calculated: 13
```

The wizard binds `pew-sqft` with `oninput` after a baseline exists, so square-footage edits immediately call `recalc()` rather than waiting for blur/change.

### Code / Manual J / Manual D boundary

The source labels this path:

- `Preliminary area-based outlet allowance`;
- `Estimating heuristic only · not code minimum / not Manual D`;
- `This is not a code minimum and does not replace Manual J / Manual D airflow and duct design`;
- supply basis: `not a code minimum; airflow/outlet design still requires Manual J / Manual D or equivalent engineering`.

No audited change infers tonnage, equipment capacity, line-set diameter/length, condensate length, breaker, MCA/MOCP or refrigerant charge from square footage. The existing full calculator also states square footage is context only and intentionally does not auto-select tonnage/equipment/duct size/line-set diameter/electrical or charge values.

Result: PASS.

## FINAL OVERRIDES / LIVE DOWNSTREAM STATE

Staged Final fields write only staged quantity overrides, rebuild the persisted project plan, synchronize Final quantities into the existing calculator inputs, and invoke the existing calculator `calculate` action. The wizard then reads back existing calculator totals.

Area changes preserve explicit manual Final overrides because `buildPlan()` prefers a present override over the recalculated allowance. Non-overridden quantities follow the new area-derived preliminary allowance.

Changing area or Final values does not directly mutate persisted Job materials. Job mutation remains exclusively behind the existing explicit Apply path. Thus a recalculation does not itself refresh historical Job snapshots.

Result: PASS by source path + existing lifecycle tests; mounted browser interaction `NOT_PERFORMED`.

## MATERIALS / CUSTOMER PRICE / YOUR COST / MARGIN

Step 4 displays:

- Generated lines;
- Catalog resolved;
- Customer materials;
- Your material cost;
- Material margin;
- Minimum / Calculated / Final quantity columns;
- per-row status (`Below minimum`, `Required`, `OK`);
- Catalog extras.

`renderPriceStrip()` reads `statLines`, `statResolved`, `statCustomer`, `statYour`, and `statMargin` from the existing full calculator after `syncLegacy()` triggers the authoritative calculation. It does not perform generated-BOM pricing independently.

The existing calculator `updateTotals()` calls `E.calculateBomPricing(selected)`. That function returns null totals whenever a selected row is unresolved, has invalid Customer Price, invalid Your Cost, or invalid quantity. The staged `textMoney()` therefore receives the existing calculator display (`—`) rather than fabricating a partial authoritative total.

Catalog-extra badges in the staged finish summary are informational calculations for explicitly added extras; those same extras are also appended to the existing calculator scope via `appendProjectExtras(scope)` for authoritative BOM pricing/Apply.

Result: PASS.

## FINANCIAL AUTHORITY / LIFECYCLE REGRESSION

The accepted tracks remain:

```text
Catalog unitCost -> Calculator customerUnitPrice -> Job unitCost -> Quote
Catalog yourCost -> Calculator yourUnitCost -> Job procurementCostSnapshot -> P&L
Actual Cost -> P&L override only
```

Independent regression evidence at the audited HEAD verifies:

- blank Your Cost -> Customer Price fallback with provenance `customer-price-fallback`;
- invalid Customer Price blocks aggregate pricing and Apply;
- invalid Your Cost blocks aggregate pricing and Apply while remaining separate from Customer Price;
- numeric zero is valid and flagged for review;
- explicit Apply writes `unitCost` and `procurementCostSnapshot` but never `actualCost`;
- Catalog Customer Price / Your Cost edits do not mutate historical Job rows;
- explicit Re-Apply updates current generated rows to current Catalog values;
- manual Job material rows survive Re-Apply;
- blanking Your Cost removes the explicit override rather than materializing a value;
- `INVALID_FINANCIAL` survives persistence and does not coerce to zero;
- Method A and broader financial-integrity tests pass in CI.

Result: PASS.

## FAIL-CLOSED REGRESSION

### Required staged measurements

`project-estimator-core.js` marks split/mini-split line-set length and primary condensate length as required field inputs when applicable. Missing/non-positive required Final values set row status `required-input`; `plan.ready` remains false.

`projectBlockedReason()` in the full calculator reads the current persisted staged plan and blocks Apply whenever `ready===false`.

### Below hard minimum

Rows with a non-null `codeMinimum` and Final below minimum become `below-minimum`; the plan is not ready and Apply remains blocked.

### Commercial

The full calculator independently returns `Commercial project is fail-closed until the commercial code/design path is verified.` for Commercial project context/plan. The wizard also leaves Apply disabled for Commercial, but the authoritative protection is rechecked inside `applyToJob()`.

### Unresolved BOM / invalid financial

`updateTotals()` disables Apply when `E.hardBlockingRows(selected)` is non-empty. `applyToJob()` recomputes and rechecks the hard blockers before mutation.

### Secondary drain

The previously accepted secondary-drain guard remains unchanged. Dedicated tests cover `pan-drain` and `overflow-drain` with blank/zero run as blocked, positive run as clear, and repair-without-install-scope as not applicable. The referenced v43 CI explicitly reran the secondary-drain guard suite successfully.

Result: PASS.

## PWA V43 FRESHNESS / OFFLINE

`sw.js` uses cache name:

```text
bruno-ac-v43
```

For same-origin JS/CSS/JSON assets, fetch policy is network-first with cached fallback. Navigation is network-first with cached request/index shell fallback. Successful current shell responses are written back into v43 cache. Activation removes old cache names and claims clients.

This statically addresses the stale-current-Journal/calculator asset failure mode without introducing a forced page reload loop in `sw.js`.

Fresh-load runtime: `NOT_PERFORMED`.

Offline runtime: `NOT_PERFORMED`.

### P2 observation — broad shell-write detection

Because `SHELL` includes `'./'` and the `isShell` test also checks `url.pathname.endsWith(p.replace('./',''))`, that element reduces to an empty string and therefore makes `isShell` true for every same-origin pathname. Fetch policy still remains network-first for JS/CSS/JSON and cache-first for other assets, so no acceptance blocker was demonstrated, but cache write scope is broader than the apparent intent. This is non-blocking maintenance debt.

## CI / DEPLOYMENT

Referenced validation run independently resolves as:

```yaml
run_id: 35049028474
workflow: Main v43 UX validation
head_sha: f7638584081fb3247963eeefae7f18762f822a73
status: completed
conclusion: success
```

Successful named steps include:

- Project estimator core;
- Project estimator integration;
- Service Journal;
- Secondary drain guard;
- Full app backup;
- Financial integrity;
- Calculator pricing;
- Calculator lifecycle;
- Calculator review UX;
- Code registry;
- Syntax.

GitHub Pages run `35049069724` completed successfully for exact final HEAD `436a3696bd69779ef7d03e618db1c4ad4d8cf42a`.

Green CI is supporting evidence and is not treated as browser proof.

## FINDINGS

### F01 — P2 — Browser/offline acceptance path not executed

The requested fresh-load Journal, static-row Edit/Save, dark letterhead appearance, live 2,000 -> 20,000 visual change, Final override interaction and offline fallback were not executable in the available audit environment.

Status: `NOT_PERFORMED`.

Impact: no source/CI defect identified; runtime-only visual/service-worker behavior remains unobserved by this audit.

### F02 — P2 — New wizard/full-calculator coupling lacks mounted DOM integration coverage

The new integration test asserts source strings such as `$('pew-sqft').oninput`, `textMoney('statCustomer')`, PWA cache name and relevant CSS selectors. Core numerical behavior is executable-tested, and the authoritative calculator/pricing/lifecycle suites are executable-tested, but there is no mounted DOM test that drives the staged wizard, calculator button, price-strip readback and Apply gate together.

Impact: no product bypass identified; future regression detection for event ordering/DOM integration is weaker than the underlying core/lifecycle coverage.

Recommended maintenance: add a small jsdom/browser integration fixture that changes 2,000 -> 20,000 ft², edits Final, asserts calculator stats/Apply blocker transitions, and verifies no Job mutation until explicit Apply.

## ACCEPTANCE MATRIX

```yaml
journal_tax_settings_collapsed: PASS_STATIC_AND_TEST
saved_calls_static_compact_edit: PASS_STATIC_AND_TEST
white_letterhead_control_fix: PASS_STATIC
2000_to_20000_changes_estimate: PASS_EXECUTABLE_CORE
area_formula_not_code_manual_j_d: PASS_STATIC_AND_CORE_TEST
materials_customer_your_margin: PASS_STATIC_PLUS_EXISTING_EXECUTABLE_PRICING
final_overrides: PASS_STATIC_PLUS_CORE_MODEL
commercial_fail_closed: PASS_STATIC_PLUS_CI
required_field_fail_closed: PASS_EXECUTABLE_CORE_PLUS_STATIC_APPLY_RECHECK
secondary_drain_fail_closed: PASS_EXECUTABLE_TEST_PLUS_CI
invalid_financial_fail_closed: PASS_EXECUTABLE_TEST_PLUS_CI
blank_your_cost_fallback: PASS_EXECUTABLE_TEST
zero_valid_reviewable: PASS_EXECUTABLE_TEST
historical_snapshot_immutability: PASS_EXECUTABLE_LIFECYCLE
actual_cost_precedence_pnl_only: PASS_EXISTING_EXECUTABLE_FINANCIAL_SUITE
method_a_unchanged: PASS_EXISTING_EXECUTABLE_FINANCIAL_SUITE
pwa_cache_v43: PASS_STATIC
pwa_network_first_js_css_json: PASS_STATIC
browser_runtime: NOT_PERFORMED
offline_runtime: NOT_PERFORMED
```

## VERDICT

```yaml
VERDICT: A — ACCEPT
AUDITED_HEAD: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
BLOCKERS: none
```
