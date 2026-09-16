# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S03
last_completed_stage: S02
next_stage_after_current: S04
main_head: 70e7bfdf38eb260dc93af49ba83582dfad52340e
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

Changed production/test files:

```text
service-journal-ux.js
sw-register.js
sw.js
tests/service-journal-ux.test.js
tests/service-journal-dom.test.js
tests/project-estimator-integration.test.js
```

Implemented:

- Service Journal loads independently of the optional workspace enhancement chain.
- Payroll / Tax Settings are real collapsed details with compact summary and explicit collapse action.
- Saved Service Calls render compact/read-only with explicit modal Edit.
- stable worker/payroll/period behavior preserved.
- PWA cache v46.

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

Changed production/test files:

```text
project-mode-bridge.js
navigation-v2.css
sw.js
tests/project-single-surface-dom.test.js
tests/project-estimator-integration.test.js
```

Implemented:

- Wizard and downstream technical/BOM grid are forced into one calculator surface / one scroll context.
- legacy `Open live technical calculator` action is removed from normal keyboard/visible flow.
- outer shell project selector / standalone action is hidden so project inputs have one visible authority.
- duplicate technical `sqft`, `systemType`, `indoorLocation`, `tonnage` fields are hidden from the downstream technical form.
- old demo/job tonnage is removed from active calculator input and retained only as `data-legacy-capacity` migration metadata.
- legacy tonnage pill in jobbar is hidden from the live calculator surface.
- reset/re-render cannot leave the technical grid hidden; MutationObserver reapplies the one-surface contract.
- commercial Apply fail-closed remains owned by the existing project gate.

Executable DOM fixture verifies:

```text
technical grid visible inline
legacy open-full hidden and untabbable
single visible project input authority
legacy 3-ton capacity removed from active input
legacy capacity retained as metadata only
legacy tonnage jobbar pill hidden
reset hidden state is immediately corrected
```

Known limitation carried to S12/final audit:

```yaml
actual_android_browser_runtime_after_S01_S02: NOT_PERFORMED
user_runtime_recheck_required_before_final_acceptance: true
```

## S03 ENTRY GATE

S02 implementation and full regression CI passed. S03 may start. S04 and later remain forbidden until S03 is DONE and this state file is updated.
