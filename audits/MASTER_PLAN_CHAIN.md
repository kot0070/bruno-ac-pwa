# BRUNO AC — MASTER PLAN CHAIN

```yaml
chain_id: BRUNO_AC_MASTER_CHAIN_01
chain_version: 5
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
audit_branch: audit/pr22-603cbca
mode: STRICT_CHAINED_MASTER_PLANS
active_executable_master: NONE
active_master_id: NONE
user_approval_required: true
execution_authorized: false
free_work_mode_allowed: false
```

## GLOBAL CHAIN CONTRACT

- Finish and independently validate each active master before closing it.
- Verdict A closes a master; B/C remains in that master’s fix/re-audit loop.
- Every executable master uses exact `main` HEAD tracking and executable evidence appropriate to its scope.
- Critical browser-visible behavior must use real Browser E2E evidence when reasonably testable; source/unit/JSDOM alone is insufficient for final acceptance of covered flows.
- Final reports must be persisted before chat completion.
- Do not begin a new large master until it is created, persisted and explicitly approved when required.

## CLOSED MASTERS

### M01 — HVAC LIVE CALCULATOR REWORK

```yaml
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
status: CLOSED_A_ACCEPT
plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
closure: audits/HVAC_LIVE_CALCULATOR_MASTER_01_CLOSURE.md
accepted_main_head: 7c89b706546e4d2e465405544dc398220e664db9
final_report: audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_7c89b706546e4d2e465405544dc398220e664db9_20260916-REAUDIT.md
final_verdict: A_ACCEPT
```

### M02 — PROJECT FULL AUDIT

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
status: CLOSED_A_ACCEPT
plan: audits/PROJECT_FULL_AUDIT_MASTER_PLAN.md
execution_state: audits/PROJECT_FULL_AUDIT_EXECUTION_STATE.md
starting_accepted_head: 7c89b706546e4d2e465405544dc398220e664db9
accepted_main_head: d8df33f2e58f48062f299daa276492e0b9b4c6e3
final_report: audits/PROJECT_FULL_AUDIT_P11_FINAL.md
implementation_closure: audits/implementation/PROJECT_FULL_AUDIT_P11_D8DF33F2.md
final_verdict: A_ACCEPT
corrective_regression_run: 35151667486
final_pages_run: 35151736138
pwa_cache: bruno-ac-v64
browser_mobile_runtime: NOT_PERFORMED_AT_M02_CLOSURE
```

### M03 — REAL PLAYWRIGHT BROWSER E2E GATE

```yaml
master_id: PLAYWRIGHT_BROWSER_E2E_MASTER_01
status: CLOSED_A_ACCEPT
plan: audits/PLAYWRIGHT_BROWSER_E2E_MASTER_PLAN.md
starting_accepted_head: d8df33f2e58f48062f299daa276492e0b9b4c6e3
accepted_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
final_report: audits/PLAYWRIGHT_BROWSER_E2E_FINAL.md
final_verdict: A_ACCEPT
browser_runtime: PERFORMED_PLAYWRIGHT_CHROMIUM_DESKTOP_AND_MOBILE_EMULATION
browser_e2e_run: 35163379213
browser_e2e_result: SUCCESS
browser_tests_passed: 10
pages_run: 35163378406
pages_result: SUCCESS
playwright_report_artifact: 10473593437
physical_mobile_runtime: NOT_PERFORMED
safari_runtime: NOT_PERFORMED
```

M03 permanently adds a GitHub Actions Browser E2E gate covering the actual visible Bruno AC workspace in desktop and mobile Chromium configurations, including navigation, blank-Job storage integrity, reload, corruption-lock behavior, full-app export and a visible Summary input autosave/reload round trip.

## CURRENT POINTER

```yaml
LAST_CLOSED_MASTER: PLAYWRIGHT_BROWSER_E2E_MASTER_01
ACTIVE_MASTER: NONE
ACTIVE_MASTER_ID: NONE
CURRENT_STAGE: NONE
EXECUTION_AUTHORIZED: false
NEXT_MASTER_REQUIRES_USER_APPROVAL: true
ACCEPTED_PRODUCTION_BASELINE: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
PERMANENT_BROWSER_GATE: .github/workflows/browser-e2e.yml
```
