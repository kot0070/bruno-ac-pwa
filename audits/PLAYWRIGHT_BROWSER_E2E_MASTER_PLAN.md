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
objective: Add real Chromium browser E2E coverage and a persistent GitHub Actions gate.
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
Add a real browser test layer that launches Bruno AC in Chromium and validates behavior from the user surface rather than only source/unit/JSDOM evidence.

## Required coverage — COMPLETE
1. Real page boot from a local HTTP server.
2. Critical shell controls are visible and interactive.
3. Navigation changes the active UI surface.
4. `New blank job` writes a structurally valid `bruno-ac-v1` object.
5. Reload preserves a structurally valid primary Job and does not trigger the corruption safety lock.
6. Full-app export produces a valid Bruno AC backup containing the primary Job.
7. The same critical flow runs in desktop Chromium and mobile Chromium emulation.
8. Persistent GitHub Actions workflow executes the suite on `main` and PRs targeting `main`.
9. Failures fail CI and Playwright diagnostics are uploaded when produced.
10. A visible Summary financial input (`#sum-oh`) is changed by the browser, autosaved to primary Job storage, reloaded, and verified back in the UI on desktop and mobile Chromium.

## Execution record
Initial browser execution exposed mismatches between legacy hidden DOM controls and the real workspace surface. Tests were corrected to exercise only visible user controls; force-clicking hidden controls was explicitly avoided. A proposed Project Type persistence path was rejected after browser evidence showed that control is intentionally hidden by the product UI. The persistence scenario was replaced by the visible Summary overhead-rate field.

One later run failed before browser execution because `npm install` received a transient `ECONNRESET` from `registry.npmjs.org`. The persistent workflow was hardened to Node 24 with npm retry/backoff. The exact-head rerun then installed dependencies and Chromium successfully and passed all 10 browser tests.

## Final evidence
- Final production HEAD: `c410f9d12ca5c0e4c0fdf0e2f36569af73657039`.
- Browser E2E run: `35163379213` — SUCCESS — 10/10 passed.
- Browser matrix: desktop Chromium + mobile Chromium emulation.
- Pages run: `35163378406` — SUCCESS on the same exact HEAD.
- Playwright report artifact: `10473593437`.
- Physical iOS/Safari/mobile-device execution: NOT_PERFORMED.

## Permanent release rule
For critical user-facing behavior, source/unit/JSDOM evidence alone is not sufficient for final acceptance. Where the behavior is browser-testable, the corresponding real Browser E2E scenario must be green on the exact production HEAD before an `A_ACCEPT` release/audit verdict.
