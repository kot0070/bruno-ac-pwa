# HVAC LIVE CALCULATOR — EXECUTION STATE

```yaml
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
execution_mode: STRICT_SEQUENTIAL
current_stage: S13
last_completed_stage: S12
next_stage_after_current: NONE
main_head: 7c89b706546e4d2e465405544dc398220e664db9
s13_state: REAUDIT_READY
```

## HARD RULE
Read the master plan first, then this file before every stage. Execute only `current_stage`. Do not skip forward. M01 is not CLOSED until S13 receives an independent persisted A verdict.

## COMPLETED STAGES SUMMARY

| Stage | Status | Validated commit | CI run | Final main HEAD | PWA |
|---|---|---|---|---|---|
| S00 | DONE | 9e05636f | — | 9e05636fb3bbc26c0b60ef4624753539e728bd87 | v45 |
| S01 Journal runtime | DONE | a6f68aeb | 35092712396 SUCCESS | a158e7fad54bfa765014f6cdc5f0c09e726f941f | v46 |
| S02 One surface | DONE | c18b8d83 | 35093427826 SUCCESS | 70e7bfdf38eb260dc93af49ba83582dfad52340e | v47 |
| S03 Source library | DONE | 78629414 | 35096658178 SUCCESS | b774570e60e99be12a3c419b2f4732390c990572 | v48 |
| S04 Building schema | DONE | 9c148220 | 35097154353 SUCCESS | 8371b425fbdb7d0317e2eb2f96ef5a6367d4bff1 | v49 |
| S05 Load engine | DONE | 72e74f9b | 35097713832 SUCCESS | cd32882cc0c20e27f597be8270e7c2dca271f0b1 | v50 |
| S06 Equipment | DONE | eaf061b9 | 35098245799 SUCCESS | 91ef75514ea511dd69b9ebfee04c2fd0953c525a | v51 |
| S07 Electrical | DONE | e9ab51a8 | 35098930455 SUCCESS | 38c98cf77f60cc975e4c7fedec02426735ea0bd6 | v52 |
| S08 Mechanical BOM | DONE | 3f6a58c0 | 35100406825 SUCCESS | 907fb057c802e011a8354963e8af5f8c5ef65556 | v53 |
| S09 Catalog/pricing | DONE | 716e08a8 | 35100991107 SUCCESS | b9f52ffa3aea8a3a2fc1000f5064968c19e8b8e0 | v54 |
| S10 Overrides/compliance/Apply | DONE | 3c399955 | 35102124833 SUCCESS | 5b01400890854569758f01831317713864713f86 | v55 |
| S11 History/templates/export/import | DONE | 256471e0 | 35121613789 SUCCESS | 87daa47afa23d276b6c69484bb3d38f055c7dcb3 | v56 |
| S12 Mobile UX/PWA/E2E | DONE | 43dbd145 | 35122703196 SUCCESS | 459c497b60cc77c511e9337a888bdff7508c2fef | v58 |

## S13 AUDIT LOOP

Initial independent audit against `459c497b60cc77c511e9337a888bdff7508c2fef` produced `B_ACCEPT_AFTER_MINOR_FIXES` with three P1 findings and one P2 finding. Full report:
`audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_459c497b60cc77c511e9337a888bdff7508c2fef_20260916-1323.md`.

Correction cycle completed on `main`:

```yaml
started_from_main_HEAD: 459c497b60cc77c511e9337a888bdff7508c2fef
validated_commit: 7ed3238ed4409fd7d6137848081f287196adb589
validation_run: 35134969943
validation_result: SUCCESS
temporary_validation_workflow_removed: true
completed_main_HEAD: 7c89b706546e4d2e465405544dc398220e664db9
pages_run_exact_final_head: 35135027447
pages_result: SUCCESS
pwa_cache: bruno-ac-v59
browser_mobile_runtime: NOT_PERFORMED
implementation_report: audits/implementation/MAIN_HVAC_LIVE_CALCULATOR_M01_AUDIT_FIX_7C89B706.md
```

Corrected findings:
- P1-01 Catalog hard-coded fallback removed; exact/binding/unique-compatible resolution only.
- P1-02 impossible envelope opening geometry now blocks instead of clamping.
- P1-03 extended history/import validation now validates nested chain structure.
- P2-01 load provenance now separates residential/commercial source applicability.

## KNOWN LIMITATION TO AUDIT EXPLICITLY
Automatic equipment candidate selection currently selects one exact OEM/Catalog candidate when it satisfies the verified range. Operator override supports `systemCount > 1`, but automatic optimization/splitting into multiple smaller systems is not claimed as implemented. Auditor must treat any product/UI implication otherwise as a finding.

## S13 RE-AUDIT ENTRY GATE
S01-S12 remain DONE. Targeted B-audit findings were corrected and full regression CI succeeded. Temporary validation workflow is removed. Exact final `main` HEAD is `7c89b706546e4d2e465405544dc398220e664db9`; exact Pages deployment run `35135027447` is SUCCESS.

S13 independent re-audit is authorized against exact `main` HEAD `7c89b706546e4d2e465405544dc398220e664db9`.

Requirements:
- AUDIT ONLY during re-audit; production writes forbidden;
- verify corrected findings and regressions on exact target HEAD;
- browser/mobile runtime: if unavailable, record exactly `NOT_PERFORMED`;
- persist full report to `audits/history/` before final chat;
- update `LATEST_AUDIT.md` and `HANDOFF.md` before final chat;
- M01 closes only if persisted verdict is A.
