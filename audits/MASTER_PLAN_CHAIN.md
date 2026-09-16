# BRUNO AC — MASTER PLAN CHAIN

```yaml
chain_id: BRUNO_AC_MASTER_CHAIN_01
chain_version: 2
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
audit_branch: audit/pr22-603cbca
mode: STRICT_CHAINED_MASTER_PLANS
active_executable_master: NONE
proposed_next_master: audits/PROJECT_FULL_AUDIT_MASTER_PLAN.md
proposed_next_master_id: PROJECT_FULL_AUDIT_MASTER_01
user_approval_required: true
execution_authorized: false
free_work_mode_allowed: false
```

## GLOBAL CHAIN CONTRACT

- Finish and independently audit each active master before closing it.
- Verdict A closes a master; B/C remains in that master’s fix/re-audit loop.
- Create and persist the next large master before new major work.
- A newly created large master is not executable until any required user-approval gate is satisfied.
- Every executable master uses strict sequential stages, exact `main` HEAD tracking, executable regressions and one final independent audit.
- Final audit reports must be persisted before chat response.

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

M01 delivered and audited the live HVAC dependency chain through load, equipment, electrical, mechanical BOM, Catalog pricing, compliance, history, one-surface mobile UX and PWA integration. Actual physical browser/mobile runtime remains recorded as `NOT_PERFORMED` rather than inferred.

## PROPOSED NEXT MASTER — USER APPROVAL REQUIRED

### M02 — PROJECT FULL AUDIT

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
status: PROPOSED_AWAITING_USER_APPROVAL
file: audits/PROJECT_FULL_AUDIT_MASTER_PLAN.md
starting_accepted_head: 7c89b706546e4d2e465405544dc398220e664db9
execution_authorized: false
supersedes_previous_queue:
  - CODEBASE_FULL_AUDIT_MASTER_PLAN
  - CALCULATION_MATH_FULL_AUDIT_MASTER_PLAN
  - REGULATORY_STANDARDS_FULL_AUDIT_MASTER_PLAN
```

This consolidated master contains the previously queued architecture, mathematics and regulatory audits plus dedicated hidden-defect/ghost and test-quality stages, remediation gates, cross-domain regression and one final independent audit.

High-level sequence:

```text
P00 baseline/inventory
-> P01 architecture audit
-> P02 architecture remediation
-> P03 mathematics audit
-> P04 mathematics remediation
-> P05 regulatory/standards audit
-> P06 regulatory remediation
-> P07 ghosts/hidden defects audit
-> P08 ghost/PWA/runtime remediation
-> P09 test-quality audit/hardening
-> P10 final cross-domain regression
-> P11 independent final audit
```

## CURRENT POINTER

```yaml
LAST_CLOSED_MASTER: HVAC_LIVE_CALCULATOR_MASTER_01
LAST_ACCEPTED_MAIN_HEAD: 7c89b706546e4d2e465405544dc398220e664db9
NEXT_MASTER: audits/PROJECT_FULL_AUDIT_MASTER_PLAN.md
NEXT_MASTER_ID: PROJECT_FULL_AUDIT_MASTER_01
NEXT_MASTER_STATUS: PROPOSED_AWAITING_USER_APPROVAL
DO_NOT_EXECUTE_NEXT_MASTER_YET: true
```
