# BRUNO AC — MASTER PLAN CHAIN

```yaml
chain_id: BRUNO_AC_MASTER_CHAIN_01
chain_version: 1
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
audit_branch: audit/pr22-603cbca
mode: STRICT_CHAINED_MASTER_PLANS
active_master: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
active_master_id: HVAC_LIVE_CALCULATOR_MASTER_01
free_work_mode_allowed: false
next_master_must_be_created_before_new_major_work: true
```

## GLOBAL CHAIN CONTRACT

These rules apply after completion of every large master plan:

```yaml
rules:
  - finish_active_master_first
  - active_master_is_not_complete_until_its_final_stage_and_required_audit_are_complete
  - after_active_master_completion_create_next_master_plan_immediately
  - do_not_begin_new_major_scope_before_next_master_plan_is_persisted
  - next_master_must_define_scope_stages_gates_evidence_and_final_audit
  - update_this_chain_file_with_new_active_master_before_execution
  - update_audits/ROADMAP_NEXT.md_to_point_to_new_active_master
  - each_master_uses_STRICT_SEQUENTIAL_execution
  - no_stage_skipping
  - no_parallel_major_master_plans
  - every_stage_records_exact_main_HEAD
  - every_stage_records_tests_runtime_evidence_and_known_limitations
  - final_independent_audit_required_for_each_master
  - final_auditor_must_persist_report_UPDATE_LATEST_AUDIT_and_HANDOFF_before_chat_response
  - verdict_A_closes_master
  - verdict_B_or_C_enters_fix_reaudit_loop_inside_same_master_until_closed
```

There is no “free development” gap between master plans. The chain is continuous:

```text
ACTIVE MASTER
-> all stages DONE
-> final independent audit persisted
-> A ACCEPT
-> create NEXT MASTER
-> update MASTER_PLAN_CHAIN + ROADMAP_NEXT
-> begin stage 00 of NEXT MASTER
```

## MASTER QUEUE

### M01 — HVAC LIVE CALCULATOR REWORK

```yaml
status: ACTIVE
file: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
purpose: rebuild HVAC calculator into one source-driven live calculation pipeline ending in Catalog-priced BOM and explicit Job Apply/Re-Apply
```

Completion gate:

- all implementation stages complete;
- one-surface mobile runtime verified;
- load/equipment/electrical/BOM/Catalog pipeline verified;
- final independent audit persisted;
- verdict A.

### M02 — FULL CODEBASE AUDIT / ARCHITECTURE HARDENING

```yaml
status: QUEUED
planned_file: audits/CODEBASE_FULL_AUDIT_MASTER_PLAN.md
start_condition: M01_closed_with_A
```

Mandatory scope:

```text
repository inventory and runtime entrypoints
state ownership / localStorage schemas / migrations
event listeners / MutationObservers / render loops
legacy and duplicate code paths
dead code / unreachable UI / stale compatibility bridges
security/CSP/import/export validation
PWA/service-worker cache/update lifecycle
mobile DOM/runtime behavior
financial authority boundaries
Job snapshot lifecycle
history/snapshot lifecycle
error handling / fail-closed behavior
performance / excessive rerendering
cross-file coupling / hidden globals
schema versioning
backup/restore integrity
test architecture / missing executable coverage
```

Expected output:

- complete code map;
- defect/debt register P0/P1/P2;
- staged remediation plan;
- executable regression coverage for repaired paths;
- final independent full-code audit.

### M03 — FULL CALCULATION / MATHEMATICS AUDIT

```yaml
status: QUEUED
planned_file: audits/CALCULATION_MATH_FULL_AUDIT_MASTER_PLAN.md
start_condition: M02_closed_with_A
```

Mandatory scope:

```text
HVAC load mathematics
unit conversions
BTU/h / tons / CFM relationships actually used
zone aggregation
equipment sizing/selection math
oversize/undersize limits when methodology defines them
electrical calculations implemented by app
material quantity derivations
duct/airflow calculations implemented by app
condensate/refrigerant calculations implemented by app
Customer Price / Your Cost extensions
margin $ / margin %
Method A
labor/equipment calculations
payroll/service-call calculations
P&L and Actual/Snapshot/Estimate precedence
rounding policy
null/blank/zero/invalid semantics
boundary values / large projects / decimals
historical snapshot math immutability
```

Required evidence model:

- every formula documented;
- dimensions/units explicit;
- hand-checkable fixtures;
- independent expected-value calculations;
- edge/boundary fixtures;
- no formula accepted solely because existing tests agree with implementation;
- final independent mathematics audit.

### M04 — FULL REGULATORY / CODE / STANDARDS AUDIT

```yaml
status: QUEUED
planned_file: audits/REGULATORY_STANDARDS_FULL_AUDIT_MASTER_PLAN.md
start_condition: M03_closed_with_A
```

Mandatory scope:

```text
Texas TDLR ACR rules and adoption state
applicable Texas electrical adoption
Austin / selected local AHJ amendments and design criteria
2024 IRC / IMC / IFGC / UMC references actually used
energy-code references actually used
NEC references actually used
load/sizing standards/methodologies actually claimed by app
OEM/manual/nameplate dependency model
code applicability predicates
Residential vs Commercial separation
hard minimum vs warning vs design recommendation classification
source version/effective date/provenance
broken/stale source links
copyright-safe local storage policy
UI wording: code-required vs method recommendation vs OEM vs field measurement
rule-to-calculation traceability
rule-to-BOM traceability
```

Required evidence:

- official/primary source preferred;
- source URL and effective/version date;
- exact rule/section when available;
- applicability conditions;
- calculator effect;
- conflict/local amendment handling;
- outdated rule detection;
- final independent regulatory audit.

## FUTURE MASTER CREATION RULE

M02–M04 are queue definitions, not implementation plans. When each becomes active, create its dedicated strict master file with detailed stages BEFORE any work begins.

After M04 closes with A, create the next master from the remaining highest-risk product area rather than returning to ad-hoc work. Candidate future themes include:

```text
full mobile UX/accessibility audit
full Catalog/equipment/OEM dataset quality audit
full backup/migration/disaster-recovery audit
full test-suite and browser automation hardening
performance/offline reliability audit
security/privacy/data-integrity audit
```

## CURRENT POINTER

```yaml
ACTIVE_MASTER: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
ACTIVE_MASTER_ID: HVAC_LIVE_CALCULATOR_MASTER_01
NEXT_MASTER_AFTER_ACCEPT: audits/CODEBASE_FULL_AUDIT_MASTER_PLAN.md
QUEUED_AFTER_THAT:
  - audits/CALCULATION_MATH_FULL_AUDIT_MASTER_PLAN.md
  - audits/REGULATORY_STANDARDS_FULL_AUDIT_MASTER_PLAN.md
DO_NOT_START_QUEUED_MASTERS_YET: true
```
