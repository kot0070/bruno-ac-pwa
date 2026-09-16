# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S06
last_completed_stage: S05
next_stage_after_current: S07
main_head: cd32882cc0c20e27f597be8270e7c2dca271f0b1
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

Changed production/test files include:
```text
project-load-engine.js
project-load-ux.js
ac-calculator.html
sw.js
tests/project-load-engine.test.js
tests/project-estimator-integration.test.js
```

Implemented:
- transparent deterministic heating/cooling load engine; calculation method is explicitly `Bruno transparent envelope load v1`, not labeled Manual J or Manual N;
- output fields: cooling sensible/latent/total, heating, design airflow when supply-air delta is provided, zone loads, completeness and source IDs;
- conduction from explicit U/R and exposed areas, outdoor-air sensible/latent load, window solar gain, explicit internal gains;
- blocked state when required inputs are absent; provisional state for unresolved design provenance/zone completeness/floor-boundary data;
- no load from square footage alone and no fallback to legacy `3 ton / 36,000 BTU`;
- deterministic tests verify 2,000 vs 20,000 ft² materially differ, 20,000 ft² does not remain on legacy 3-ton output, dependency direction for ceiling/envelope/window/infiltration/internal gains, blocked missing-input behavior, and hand-checkable conduction math;
- same-surface live load result UI added;
- PWA cache v50.

## S06 ENTRY GATE
S05 load-engine implementation and full regression CI passed. S06 may start. S07 and later remain forbidden until S06 is DONE and this state file is updated.
