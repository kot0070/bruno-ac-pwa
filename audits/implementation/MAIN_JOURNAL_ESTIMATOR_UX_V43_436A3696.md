# MAIN JOURNAL + ESTIMATOR UX V43 — IMPLEMENTATION REPORT

```yaml
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
base_accepted_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
final_main_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
pwa_cache: bruno-ac-v43
validation_run: 35049028474
validation_commit: f7638584081fb3247963eeefae7f18762f822a73
validation_result: SUCCESS
pages_run: 35049069724
pages_result: SUCCESS
post_ci_delta:
  - DELETE .github/workflows/main-v43-ux-validation.yml
browser_runtime_by_implementer: NOT_PERFORMED
```

## USER-REPORTED PROBLEMS

The mobile screenshots showed four operator-facing problems:

1. Journal payroll/tax settings occupied too much space and appeared persistently expanded.
2. Saved Service Call rows appeared as large editable controls instead of compact archive rows.
3. A bright/white letterhead select control broke the dark mobile UI.
4. The staged Project Calculator did not communicate material pricing and total-area changes appeared inert (2,000 vs 20,000 ft² did not visibly alter the estimator result).

## PRODUCTION CHANGES

Exact compare from accepted `5c7884b3...` to final `436a3696...` contains only these eight production/test files:

- `project-estimator-core.js`
- `project-estimator-wizard.js`
- `project-estimator-wizard.css`
- `workspace-v5.css`
- `sw.js`
- `tests/project-estimator-core.test.js`
- `tests/project-estimator-integration.test.js`
- `tests/service-journal-ux.test.js`

Temporary validation workflow was deleted from final main.

## 1. JOURNAL SETTINGS + STATIC ARCHIVE ROWS

The current Service Journal implementation already uses a collapsed `<details class="sj4-card sj4-tax">` settings panel and renders saved calls as static `.sj4-row` records with explicit `Edit`/delete actions; edit controls live in `sj4-call-modal` rather than remaining inline.

The user screenshot was inconsistent with the current source, indicating stale PWA assets were materially affecting runtime perception.

Hardening added:

- workspace CSS explicitly keeps `.sj4-tax` body hidden while the details element is not open;
- compact mobile row typography/truncation/padding;
- action buttons reduced in size;
- tests now assert collapsed tax markup, static saved-call row source, explicit Edit action, and modal edit path.

No payroll math, stable worker identity, wage-base logic, calendar math, or Journal storage schema was changed in this cycle.

## 2. WHITE MOBILE CONTROL

The bright/white control in the Job/letterhead area was the letterhead `<select>` not inheriting the normal `.field select` dark styling.

`workspace-v5.css` now explicitly styles `.letterhead-strip select` and disabled state with application theme background/text/border values.

No quote/company/letterhead business behavior changed.

## 3. STAGED CALCULATOR — AREA RESPONSIVENESS

Previous staged estimator supply recommendation was based only on conditioned room/zone count. Therefore a 2,000 ft² and 20,000 ft² project with the same room schedule could show identical preliminary material counts.

The estimator now calculates an **explicit preliminary estimating allowance**:

```text
Residential: max(conditioned room count, ceil(total ft² / 400))
Commercial:  max(conditioned zone count, ceil(total ft² / 600))
```

Return-grille preliminary allowance follows the starting supply allowance (`ceil(supply / 4)`, minimum 1 when supply > 0).

This must NOT be audited or presented as a code minimum, Manual J, Manual D, airflow sizing, or engineering design. The UI/source explicitly labels the formula as:

- preliminary estimating heuristic/allowance only;
- not a code minimum;
- not Manual D;
- final quantity remains editable;
- field/design/OEM/AHJ requirements continue to control.

Regression fixture verifies:

- 2,000 ft² default residential example -> area allowance 5;
- 20,000 ft² same limited room schedule -> area allowance 50 and return allowance 13;
- a `preliminary-area-allowance` engineering/design check is emitted;
- supply basis includes `not a code minimum` wording.

No tonnage, equipment capacity, line-set diameter, line-set length, condensate length, breaker/MCA/MOCP, refrigerant charge, or Manual J/S/D result is inferred from square footage.

## 4. MATERIAL + PRICE VISIBILITY

Step 4 is renamed operator-side to **Materials & price preview**.

After every staged calculation/update, the wizard synchronizes the plan into the existing full calculator, triggers the existing calculator calculation, and then reads the authoritative existing calculator summary outputs:

- selected/generated lines;
- Catalog resolved count;
- Customer Materials;
- Your Material Cost;
- Material Margin.

These values are rendered in a compact price strip directly above the staged Minimum / Calculated / Final material rows.

The finish summary also surfaces:

- project square footage;
- room/zone entries;
- area outlet allowance;
- blocker count;
- Customer Materials total;
- Your Cost total;
- Catalog extras pricing when present.

This does not create a second pricing engine. The displayed generated-BOM prices are read from the existing calculator/Catalog pricing path. Unresolved required field measurements or Catalog resolution can therefore keep totals incomplete rather than inventing prices.

Dual-pricing invariants remain intended authority:

```text
Catalog unitCost -> Calculator customerUnitPrice -> Job unitCost -> Quote
Catalog yourCost -> Calculator yourUnitCost -> Job procurementCostSnapshot -> P&L
```

## 5. LIVE AREA UPDATE

`pew-sqft` now recalculates the already-created baseline on input rather than waiting only for a change/blur event. System/location remain change-driven.

Changing 2,000 -> 20,000 ft² should visibly change the preliminary area allowance/material recommendation immediately after a baseline exists.

## 6. PWA STALE-ASSET HARDENING

Cache bumped:

```text
bruno-ac-v42 -> bruno-ac-v43
```

For same-origin JS/CSS/JSON app-shell assets, service worker behavior is now network-first with cached fallback. Navigation remains network-first with cached shell fallback; other non-app assets retain cache-first behavior.

Purpose: prevent a successfully deployed current Journal/calculator implementation from continuing to look like an older cached UI for the operator.

Offline fallback must still be independently audited; implementer did not perform browser/offline runtime.

## VALIDATION

Temporary main workflow validated commit `f7638584081fb3247963eeefae7f18762f822a73` in run `35049028474` with SUCCESS.

Executed gates:

- Project estimator core
- Project estimator integration
- Service Journal
- Secondary drain guard
- Full app backup
- Financial integrity
- Calculator pricing
- Calculator lifecycle
- Calculator review UX
- Code Registry
- syntax checks for estimator, Journal, calculator, drain guard, service worker

Final production HEAD `436a3696bd69779ef7d03e618db1c4ad4d8cf42a` differs from validated commit only by deletion of `.github/workflows/main-v43-ux-validation.yml`.

GitHub Pages exact final HEAD deployment run `35049069724` completed SUCCESS.

## IMPORTANT AUDIT QUESTIONS

Independent audit should focus particularly on:

1. whether the current Journal actually appears collapsed/static after fresh v43 asset loading;
2. whether stale PWA behavior is materially corrected without breaking offline fallback;
3. whether the 400/600 ft² allowance is always presented as an estimating heuristic and never as code/Manual J/D;
4. whether changing square footage updates staged quantities live and correctly preserves manual Final overrides;
5. whether price strip values really follow existing generated BOM/Catalog pricing and do not create divergent totals;
6. whether unresolved required inputs remain fail-closed and prices are not fabricated;
7. whether Customer Price / Your Cost / Job snapshot invariants remain intact;
8. whether letterhead styling fix changes appearance only, not company/quote behavior.
