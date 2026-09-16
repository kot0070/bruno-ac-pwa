# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S07
last_completed_stage: S06
next_stage_after_current: S08
main_head: 91ef75514ea511dd69b9ebfee04c2fd0953c525a
```

## HARD RULE
Read the master plan first, then this file before every stage. Execute only `current_stage`. Do not skip forward. After the stage is complete, update this file before beginning the next stage.

## COMPLETED STAGES

### S00
```yaml
status: DONE
main_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
```

### S01 — JOURNAL MOBILE RUNTIME CORRECTION
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

### S02 — ONE-SURFACE CALCULATOR ARCHITECTURE
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

### S03 — REGULATORY / STANDARDS / SOURCE LIBRARY HARDENING
```yaml
status: DONE
final_main_head: b774570e60e99be12a3c419b2f4732390c990572
validated_commit: 7862941429ea0958476cfc63fccbf935f51c2e09
ci_run: 35096658178
ci_result: SUCCESS
pwa_cache: bruno-ac-v48
source_matrix_validation: PASS
```

### S04 — PROJECT / BUILDING / ZONE / ENVELOPE SCHEMA
```yaml
status: DONE
final_main_head: 8371b425fbdb7d0317e2eb2f96ef5a6367d4bff1
validated_commit: 9c1482209368cd35279b7e3e7192f664acca92b5
ci_run: 35097154353
ci_result: SUCCESS
pwa_cache: bruno-ac-v49
schema_tests: PASS
```

Implemented schema v4, deterministic migration from legacy project-plan schema 1-3, building/envelope/zone input UI, explicit unresolved engineering fields, no fabricated load values.

### S05 — HEATING / COOLING LOAD ENGINE
```yaml
status: DONE
final_main_head: cd32882cc0c20e27f597be8270e7c2dca271f0b1
validated_commit: 72e74f9b2ccf7f13a20e776e93586e9072f2893b
ci_run: 35097713832
ci_result: SUCCESS
pwa_cache: bruno-ac-v50
browser_runtime: NOT_PERFORMED
load_fixture_tests: PASS
```

Implemented transparent deterministic heating/cooling load engine with blocked/provisional states, hand-checkable formulas, same-surface UI and no square-footage-only tonnage fallback.

### S06 — EQUIPMENT CAPACITY + SYSTEM-COUNT SELECTION
```yaml
status: DONE
final_main_head: 91ef75514ea511dd69b9ebfee04c2fd0953c525a
validated_commit: eaf061b90d40a5a5fe7bc536e44f76721498fdfd
ci_run: 35098245799
ci_result: SUCCESS
pwa_cache: bruno-ac-v51
browser_runtime: NOT_PERFORMED
equipment_fixture_tests: PASS
```

Changed production/test files include:
```text
project-equipment-engine.js
project-equipment-ux.js
ac-calculator.html
sw.js
tests/project-equipment-engine.test.js
tests/project-estimator-integration.test.js
```

Implemented:
- calculated load remains separate from selected equipment and operator override;
- required capacity derives from validated heating/cooling load, not arbitrary tonnage;
- verified upper selection bound is fail-closed until an explicit sourced oversize/selection policy is supplied;
- Catalog/OEM equipment candidates carry manufacturer/model, nominal/rated capacities, voltage/phase, MCA/MOCP, refrigerant, line-set/accessory metadata and OEM source when present;
- automatic selection only occurs for a candidate that meets load, verified upper bound, heating requirement when known, and has OEM provenance;
- missing equipment dataset or OEM source remains unresolved rather than invented;
- operator override requires explicit reason and never rewrites calculated load;
- same-surface equipment requirement/selection UI added;
- deterministic tests cover blocked load, unresolved policy/catalog, OEM-source gating, resolved candidate selection, and override separation;
- PWA cache v51.

## S07 ENTRY GATE
S06 equipment-selection implementation and full regression CI passed. S07 may start. S08 and later remain forbidden until S07 is DONE and this state file is updated.
