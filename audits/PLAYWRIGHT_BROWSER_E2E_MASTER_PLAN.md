# BRUNO AC — PLAYWRIGHT BROWSER E2E MASTER PLAN

```yaml
master_id: PLAYWRIGHT_BROWSER_E2E_MASTER_01
repository: kot0070/bruno-ac-pwa
production_branch: main
workspace_branch: audit/pr22-603cbca
status: AUTHORIZED_ACTIVE
user_approved: true
approved_on: 2026-09-16
starting_accepted_main_head: d8df33f2e58f48062f299daa276492e0b9b4c6e3
objective: Add real Chromium browser E2E coverage and a persistent GitHub Actions gate.
```

## Objective
Add a real browser test layer that launches Bruno AC in Chromium and validates behavior from the user surface rather than only source/unit/JSDOM evidence.

## Required coverage
1. Real page boot from a local HTTP server.
2. Critical shell controls are visible and interactive.
3. Navigation changes the active UI surface.
4. `New blank job` writes a structurally valid `bruno-ac-v1` object.
5. Reload preserves a structurally valid primary Job and does not trigger the corruption safety lock.
6. Full-app export produces a valid Bruno AC backup containing the primary Job.
7. Run the same critical flow in desktop Chromium and a mobile Chromium viewport.
8. Persistent GitHub Actions workflow must install Chromium and execute the suite on `main`.
9. Browser failures must fail CI and publish Playwright diagnostics/artifacts where available.

## Execution contract
Implement on an isolated production branch, run GitHub Actions, correct failures, and only fast-forward `main` after green browser E2E. After merge/fast-forward, verify an exact-main-head browser E2E run and Pages deployment. Record actual browser runtime as PERFORMED only when Playwright has truly executed.
