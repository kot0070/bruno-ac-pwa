# MAIN PROJECT ESTIMATOR — IMPLEMENTATION REPORT

```yaml
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
source_pr: 27
merged_to_main: true
main_head: e5da455e38f36a4226ec407894efe2c84b301eda
pages_run: 35043470123
pages_result: SUCCESS
pwa_cache: bruno-ac-v41
previous_audited_pr_head: cf856a30b2f9cdcb9d61373d3472fef31b9e7343
previous_verdict: C_REJECT_REWORK_REQUIRED
```

## WHAT MOVED TO MAIN

The staged Project Estimator is now production main rather than a feature-only preview.

Flow:

```text
Compact Project Setup
-> Residential / Commercial
-> Building area
-> Rooms / Zones
-> Code / Design baseline
-> Minimum / Calculated / Final quantities
-> Catalog additions / current Catalog pricing
-> Full technical live calculator
-> explicit Apply to Job
```

The legacy technical form remains the second-stage full calculator. It is not intended to be the first operator interaction once the estimator wizard initializes.

## PRIOR AUDIT BLOCKERS CORRECTED BEFORE MAIN MERGE

### Journal restore identity validation

`app-backup-bridge.js` now validates schema-v4 worker identity before any restore write:
- each worker must be an object;
- non-empty unique stable worker ID required;
- worker name must have the expected string shape;
- each schema-v4 crew row requires a non-empty `workerId`;
- every crew `workerId` must resolve to an existing worker;
- malformed fixtures fail before writes.

Negative tests cover malformed worker records, empty/duplicate IDs and dangling crew references.

### Commercial -> Residential Apply state

`project-mode-bridge.js` no longer sets `apply.disabled = false` when leaving Commercial mode.
It removes only its Commercial-specific marker/decoration. Authoritative calculator/project gating continues to own Apply eligibility, so unresolved BOM/project blockers cannot be visually overridden by the bridge.

## VALIDATION

Feature validation run `35043250401` completed SUCCESS at `a4204fd145853d2663ed40ef8ec42c30ddd1ac43`.
The only subsequent feature-branch delta before merge was deletion of the temporary validation workflow.

GitHub Pages deployment for exact merged main HEAD `e5da455e38f36a4226ec407894efe2c84b301eda` completed SUCCESS in run `35043470123`.

## AUDIT SCOPE RECOMMENDED

Re-audit exact main HEAD end-to-end, not only prior findings:
- staged wizard actually becomes the first calculator stage at runtime;
- Residential/Commercial transitions;
- rooms/zones and optional area;
- represented code minimum vs design recommendation vs required field input;
- Final override and below-minimum behavior;
- Catalog extras/pricing;
- full technical calculator handoff;
- Apply fail-closed;
- Journal restore validation;
- Journal payroll/calendar regressions;
- app backup;
- PWA/offline;
- financial/customer-vs-procurement price lifecycle.

Browser/mobile runtime is strongly preferred because the operator-visible staging behavior cannot be accepted from static source alone.
