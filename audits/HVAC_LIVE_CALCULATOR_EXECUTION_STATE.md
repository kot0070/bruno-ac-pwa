# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S05
last_completed_stage: S04
next_stage_after_current: S06
main_head: 8371b425fbdb7d0317e2eb2f96ef5a6367d4bff1
```

## HARD RULE

Read the master plan first, then this file before every stage. Execute only `current_stage`. Do not skip forward. After the stage is complete, update this file before beginning the next stage.

## S00

```yaml
status: DONE
main_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
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

Implemented:
- calculation-source matrix with regulatory/design/OEM provenance;
- required future-source validation and unresolved OEM slots;
- Code Library matrix UI and offline availability.

## S04 — PROJECT / BUILDING / ZONE / ENVELOPE SCHEMA

```yaml
status: DONE
final_main_head: 8371b425fbdb7d0317e2eb2f96ef5a6367d4bff1
validated_commit: 9c1482209368cd35279b7e3e7192f664acca92b5
ci_run: 35097154353
ci_result: SUCCESS
pwa_cache: bruno-ac-v49
browser_runtime: NOT_PERFORMED
schema_tests: PASS
```

Changed production/test files include:

```text
project-building-schema.js
project-building-ux.js
ac-calculator.html
sw.js
tests/project-building-schema.test.js
tests/project-estimator-integration.test.js
```

Implemented:
- dedicated schema version 4 for project/building/envelope/zone inputs;
- project fields: location/ZIP/jurisdiction, total and conditioned area, building type/usage, stories, ceiling height, construction scope, system/zone preferences;
- envelope fields: wall/roof/floor thermal inputs, windows/doors, infiltration, ventilation, occupancy/internal gains, design conditions + source ID, duct location/condition;
- zone fields: area, ceiling height, exterior exposure, windows/doors, occupancy/gains, supply-return relationship and system assignment;
- deterministic migration from legacy project-plan schema 1-3;
- migration copies only explicit legacy values and leaves conditioned area/envelope/design data unresolved instead of inventing them;
- unsupported legacy schema fails with a clear migration block;
- same-surface Building / Envelope / Load Inputs UI persists schema independently and synchronizes explicit legacy project/room context;
- validation exposes unresolved load inputs but does not fabricate load results.

## S05 ENTRY GATE

S04 building/envelope schema implementation and full regression CI passed. S05 may start. S06 and later remain forbidden until S05 is DONE and this state file is updated.
