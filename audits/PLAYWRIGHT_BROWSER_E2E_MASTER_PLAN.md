# BRUNO AC — PLAYWRIGHT BROWSER E2E MASTER PLAN

```yaml
master_id: PLAYWRIGHT_BROWSER_E2E_MASTER_01
repository: kot0070/bruno-ac-pwa
production_branch: main
workspace_branch: audit/pr22-603cbca
status: CLOSED_A_ACCEPT
user_approved: true
approved_on: 2026-09-16
starting_accepted_main_head: d8df33f2e58f48062f299daa276492e0b9b4c6e3
accepted_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
final_verdict: A_ACCEPT
browser_runtime: PERFORMED_PLAYWRIGHT_CHROMIUM_DESKTOP_AND_MOBILE_EMULATION
browser_e2e_run: 35163379213
browser_e2e_result: SUCCESS
browser_e2e_tests: 10
pages_run: 35163378406
pages_result: SUCCESS
playwright_report_artifact: 10473593437
```

## Objective
Add a persistent real-browser release gate that launches Bruno AC in Chromium and validates behavior from the visible user surface rather than relying only on source/unit/JSDOM evidence.

## Final required coverage
- Real page boot from local HTTP server.
- Visible workspace shell controls.
- Real visible navigation.
- `New blank job` -> structurally valid `bruno-ac-v1`.
- Reload -> primary Job remains valid and no false corruption lock.
- Full-app export -> parseable Bruno AC backup with valid primary Job.
- Visible Summary overhead input -> autosave/localStorage -> reload -> restored UI value.
- Desktop Chromium and mobile Chromium emulation.
- Persistent GitHub Actions gate on `main` and PRs to `main`.
- Failure diagnostics uploaded via Playwright artifact.

## Permanent acceptance rule
For critical user-facing browser behavior, source/unit/JSDOM evidence alone is insufficient for final `A_ACCEPT` when the behavior is reasonably browser-testable. Exact-production-HEAD Browser E2E evidence must be green.

Physical iOS/Safari/mobile-device execution remains `NOT_PERFORMED` and must not be inferred from mobile Chromium emulation.
