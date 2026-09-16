# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S04
last_completed_stage: S03
next_stage_after_current: S05
main_head: b774570e60e99be12a3c419b2f4732390c990572
```

## HARD RULE

Read the master plan first, then this file before every stage. Execute only `current_stage`. Do not skip forward. After the stage is complete, update this file before beginning the next stage.

## S00

```yaml
status: DONE
main_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
evidence:
  master_plan_persisted: true
  starting_main_head_verified: true
  user_runtime_defects_recorded: true
```

## S01 — JOURNAL MOBILE RUNTIME CORRECTION

```yaml
status: DONE
final_main_head: a158e7fad54bfa765014f6cdc5f0c09e726f941f
validated_commit: a6f68aeb16904cb63761226e118a65d9db5b7c94
ci_run: 35092712396
ci_result: SUCCESS
pwa_cache: bruno-ac-v46
browser_mobile_runtime: NOT_PERFORMED
executable_dom_runtime: PASS_jsdom
```

Implemented:
- Service Journal loads independently of optional workspace enhancement chain.
- Payroll / Tax Settings are collapsed details with compact summary and explicit collapse action.
- Saved Service Calls render compact/read-only with explicit modal Edit.
- stable worker/payroll/period behavior preserved.

## S02 — ONE-SURFACE CALCULATOR ARCHITECTURE

```yaml
status: DONE
final_main_head: 70e7bfdf38eb260dc93af49ba83582dfad52340e
validated_commit: c18b8d83b99884942c6b6013a3169b0ae6a21925
ci_run: 35093427826
ci_result: SUCCESS
pwa_cache: bruno-ac-v47
browser_mobile_runtime: NOT_PERFORMED
executable_dom_runtime: PASS_jsdom
```

Implemented:
- Wizard and downstream technical/BOM grid are one calculator surface / one scroll context.
- legacy `Open live technical calculator` action removed from normal flow.
- duplicate visible project authorities removed.
- old demo/job tonnage removed from active calculation and retained only as migration metadata.
- commercial Apply fail-closed preserved.

## S03 — REGULATORY / STANDARDS / SOURCE LIBRARY HARDENING

```yaml
status: DONE
final_main_head: b774570e60e99be12a3c419b2f4732390c990572
validated_commit: 7862941429ea0958476cfc63fccbf935f51c2e09
ci_run: 35096658178
ci_result: SUCCESS
pwa_cache: bruno-ac-v48
browser_runtime: NOT_PERFORMED
source_matrix_validation: PASS
```

Changed production/test files include:

```text
code-library/hvac-calculation-source-matrix.json
code-rule-registry.js
code-library-ux.js
sw.js
tests/code-rule-registry.test.js
tests/project-estimator-integration.test.js
```

Implemented:
- calculation-source matrix with explicit domain, jurisdiction, applicability, calculation effect, provenance, verification date, copyright-storage policy and source status;
- Texas ACR 2026 baseline, Texas 2026 NEC coordination baseline, Austin technical-code/AHJ sources;
- separate residential load / equipment / duct methodology sources;
- Austin commercial load, COMcheck/energy, duct and ventilation source rows;
- project-specific OEM/nameplate source slot remains intentionally unresolved until exact equipment is selected;
- registry validates required future source IDs and unresolved source slots;
- Code Library UI exposes source matrix and fail-closed OEM source requirement;
- source matrix included in offline PWA shell.

## S04 ENTRY GATE

S03 source-library implementation and full regression CI passed. S04 may start. S05 and later remain forbidden until S04 is DONE and this state file is updated.
