# BRUNO AC — FULL-APP BROWSER E2E MASTER PLAN

```yaml
master_id: FULL_APP_BROWSER_E2E_MASTER_01
repository: kot0070/bruno-ac-pwa
production_branch: main
execution_branch: audit/full-app-browser-e2e-master
status: AUTHORIZED_ACTIVE
user_approved: true
approved_on: 2026-09-16
starting_accepted_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
objective: Expand real Chromium E2E from critical smoke coverage to full user-visible application coverage across desktop and mobile.
```

## Acceptance rule
A module is not considered browser-verified merely because source/unit/JSDOM tests pass. Any critical user-visible workflow that can be exercised in Chromium must have a real Playwright path. Every critical scenario must run in desktop Chromium and mobile Chromium unless a documented platform-specific reason makes one viewport inapplicable.

## Scope
1. Workspace shell, header actions, theme/zoom, navigation and contextual totals.
2. Job/quote lifecycle, customer/job fields, quote preview and print surface.
3. Materials used, catalog search/filter/add/edit/remove, pricing snapshots and persistence.
4. Labor, personnel/burden, equipment, subcontractor and calculation interactions.
5. Summary, OH/profit, margin validation and persistence.
6. Change Orders and their effect on quoted revenue.
7. T&M entry, invoice totals and print surface.
8. P&L / profitability, revenue modes, actual costs and material reconciliation.
9. Service Journal create/edit/delete/search/persistence and storage guard behavior.
10. Project mode: estimator wizard, building data, load engine, equipment selection, electrical, mechanical BOM, catalog pricing, compliance gate and runtime summary.
11. HVAC live calculator and its review/validation UX.
12. Code Library / Texas HVAC references and navigation where user-visible.
13. Job export/import and full-app backup export/import round-trips.
14. Corrupt/invalid import rejection and financial invalid-state behavior.
15. Reset/demo/blank job behavior and primary Job storage integrity.
16. Offline/PWA reload behavior after service worker control is established.
17. Responsive/mobile navigation, overflow, dialogs and action menus.
18. Critical keyboard/user interaction paths where implemented.

## Execution phases
- P00 — UI/capability inventory and test matrix.
- P01 — navigation/shell/actions.
- P02 — job/quote/materials/catalog.
- P03 — labor/equipment/personnel/summary.
- P04 — CO/T&M/P&L.
- P05 — service journal.
- P06 — project-mode estimator/building/load/equipment/electrical/BOM/compliance.
- P07 — HVAC calculator + Code Library.
- P08 — import/export/backup/invalid-input/recovery.
- P09 — offline/PWA/mobile-specific resilience.
- P10 — complete desktop + mobile regression, defect correction loop.
- P11 — exact-main-head Browser E2E + Pages verification and final report.

## Defect policy
If a browser test exposes a real product defect, fix the product rather than weakening the test. If a selector targets a hidden/legacy duplicate rather than the visible user path, correct the test to use the visible user surface. `force: true` is not an acceptable substitute for a user-reachable interaction unless explicitly justified in evidence.

## Completion criteria
- Test matrix maps every critical user-visible module to at least one executable browser scenario.
- All required desktop/mobile Playwright tests pass.
- No known release-blocking browser defect remains.
- Browser workflow remains a persistent GitHub Actions gate.
- Final accepted `main` HEAD has both Browser E2E SUCCESS and GitHub Pages SUCCESS on the exact same SHA.
- Final evidence and remaining non-browser limitations (physical iOS/Android, Safari, etc.) are explicitly documented.
