# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S09
last_completed_stage: S08
next_stage_after_current: S10
main_head: 907fb057c802e011a8354963e8af5f8c5ef65556
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

### S07 — ELECTRICAL DEPENDENCY ENGINE
```yaml
status: DONE
final_main_head: 38c98cf77f60cc975e4c7fedec02426735ea0bd6
validated_commit: e9ab51a87f7bf171f9ef1549ac968967ee869c56
ci_run: 35098930455
ci_result: SUCCESS
pwa_cache: bruno-ac-v52
browser_runtime: NOT_PERFORMED
electrical_fixture_tests: PASS
```

### S08 — MECHANICAL DEPENDENCY + BOM ENGINE
```yaml
status: DONE
final_main_head: 907fb057c802e011a8354963e8af5f8c5ef65556
validated_commit: 3f6a58c072e054fa3e3d6a0b9cd06ea8ea478790
ci_run: 35100406825
ci_result: SUCCESS
pwa_cache: bruno-ac-v53
browser_runtime: NOT_PERFORMED
mechanical_bom_fixture_tests: PASS
```

Implemented:
- final selected OEM/Catalog equipment becomes the root of mechanical BOM generation;
- equipment, supports, controls, refrigerant, condensate/overflow, duct takeoff, electrical rows and explicit commercial-scope allowances are consolidated;
- all BOM rows carry requirement source, calculated/minimum/final quantity, unit, Catalog match state and source references;
- field route lengths remain blockers when required rather than being derived from square footage;
- operator-only equipment override cannot fabricate a material BOM without resolved Catalog/OEM equipment;
- electrical BOM from S07 is included without replacing its provenance;
- same-surface mechanical BOM table added;
- S07 electrical scripts are now explicitly wired in calculator HTML;
- full regression CI passed and temporary validation workflow removed.

## S09 ENTRY GATE
S08 mechanical/BOM implementation and full regression CI passed. S09 may start. S10 and later remain forbidden until S09 is DONE and this state file is updated.
