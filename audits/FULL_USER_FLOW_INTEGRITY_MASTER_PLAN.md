# FULL USER FLOW INTEGRITY MASTER PLAN

```yaml
master_id: FULL_USER_FLOW_INTEGRITY_MASTER_01
status: ACTIVE
execution_authorized: true
execution_mode: AUTONOMOUS_FULL_APP_BROWSER_RUNTIME_AUDIT
production_branch: main
audit_branch: audit/pr22-603cbca
implementation_branch: e2e/full-app-browser-e2e-master
starting_accepted_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
accepted_main_head: PENDING
final_verdict: PENDING
```

## Objective

Prove the Bruno AC application as a connected user system, not as isolated source modules. Critical flows must be exercised through real visible UI in Playwright Chromium desktop and mobile emulation, with state propagation and persistence verified where applicable.

## Required evidence model

For critical browser-testable flows, validate the chain:

`visible UI input/action -> application state -> calculation/engine result -> dependent user-visible module -> persistence/reload`

Source review, unit tests, JSDOM, hidden DOM controls, or direct localStorage mutation alone are not sufficient for final acceptance of covered critical browser-visible behavior.

## Scope

1. Application shell and all real user-visible navigation surfaces.
2. Project Calculator and Code/BOM behavior.
3. Calculator -> Job/BOM/material transfer when supported by the real UI.
4. Proposal / quote inputs and totals.
5. Job Materials, Labor & Equipment, Margins, Summary, Change Orders, Profit & Loss.
6. Invoice / T&M behavior and cross-module financial propagation.
7. Service Journal user flows where connected to the Job/application state.
8. Autosave and browser reload persistence.
9. Full-app export / reset / import round trip where safely automatable.
10. Negative and corruption-recovery paths for critical persisted data.
11. Desktop Chromium and mobile Chromium emulation.
12. Runtime page errors and relevant console errors during visible-surface sweeps.

## Explicit limitations

- Physical Android/iPhone runtime is not implied by mobile Chromium emulation.
- Safari/WebKit is not covered unless separately executed and recorded.
- Hidden/internal DOM fields are not accepted as user-facing capability.
- No Playwright `force: true` may be used to bypass real UI reachability problems.
- Tests must not invent Job A/B or other workflows that are not present as real visible controls.

## Execution gates

### Gate A — stable browser harness
- Workspace readiness must include service-worker control before user actions.
- Controller-change reload races must not be misclassified as product defects.

### Gate B — navigation/runtime integrity
- All actual primary visible surfaces open through normal user controls.
- No uncaught page errors on the full visible-surface sweep.

### Gate C — golden user scenario
- Create/edit a realistic job using visible controls.
- Exercise calculation and financial modules.
- Verify dependent totals/data, not merely visibility.

### Gate D — persistence and recovery
- Verify autosave/reload.
- Verify backup/restore round trip where supported by real UI.
- Verify supported corruption guards without destructive production data assumptions.

### Gate E — exact production acceptance
- Corrective changes merged only with documented evidence.
- Browser E2E green on exact final production `main` HEAD.
- GitHub Pages deployment green on the same final production HEAD.
- Canonical audit state updated before `A_ACCEPT`.

## Findings log

### FUF-001 — expanded E2E service-worker stabilization race

Status: CORRECTIVE_LOOP_IN_PROGRESS
Classification: TEST_HARNESS_DEFECT / NOT_YET_PRODUCT_DEFECT
Evidence:
- Browser E2E run `35164811205` failed across navigation/calculator/runtime specs.
- Failure patterns included disappearing top-level navigation locators, calculator iframe locators resolving against `/`, and a page/context closure during click.
- Production `sw-register.js` intentionally reloads the window on `navigator.serviceWorker.controllerchange`.
- The expanded specs waited only for `phase5-workspace-ready`; the previously accepted M03 helper waited for both workspace readiness and `navigator.serviceWorker.controller`, plus a short stabilization delay.
Correction:
- `full-app-navigation.spec.js` commit `45cac8f92339bf4afcbe55fc37d8f5ac0f4fec06`
- `full-app-runtime-diagnostics.spec.js` commit `b43aef62b9255086f8fce955c1f8792aea902e33`
- `full-app-calculator.spec.js` commit `1580e112b2f1925da9cf8495abb45a3e112cf5d3`
- Revalidation run: `35175552052` (pending at time of this update)

## Current state

The Master remains ACTIVE. No final product defect is claimed from FUF-001 until the corrected harness is rerun. No `A_ACCEPT` may be issued until all applicable gates pass on exact final production HEAD.
