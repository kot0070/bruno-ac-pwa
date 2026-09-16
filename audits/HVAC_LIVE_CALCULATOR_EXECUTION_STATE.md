# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S08
last_completed_stage: S07
next_stage_after_current: S09
main_head: 38c98cf77f60cc975e4c7fedec02426735ea0bd6
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

Implemented calculated-load separation, verified selection policy gate, Catalog/OEM candidate selection, unresolved OEM behavior and explicit override provenance.

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

Implemented:
- electrical dependency chain starts from selected equipment/OEM record, never floor area or tonnage alone;
- voltage/phase/MCA/MOCP remain unresolved when nameplate/OEM data are missing;
- circuit/OCPD/disconnect coordination is explicit and fail-closed for invalid OCPD above MOCP;
- conductor/routing requirement remains field-verification dependent rather than invented;
- generated electrical BOM rows preserve requirement source, source refs and unresolved state;
- same-surface electrical result UI added;
- full regression CI passed and temporary validation workflow removed.

## S08 ENTRY GATE
S07 electrical-dependency implementation and full regression CI passed. S08 may start. S09 and later remain forbidden until S08 is DONE and this state file is updated.
