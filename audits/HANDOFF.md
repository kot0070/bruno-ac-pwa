# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 21
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR26_BLOCKER_FIX_REAUDIT_READY
```

## LAST ACCEPTED / MERGED PRODUCTION BASELINE

```yaml
merged_pr: 25
accepted_feature_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
main_merge_commit: e84c9e9b6c53693d087db46156975ffec93d238a
verdict: A_ACCEPT
```

## CURRENT PR26

```yaml
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
previous_rejected_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
previous_verdict: C_REJECT_REWORK_REQUIRED
previous_report: audits/history/PR26_43cbc681f579b4009cc55674c4db7507d0910a7c_20260915-1749.md
production_head: 116404b13313af0f966695777cf55a807b27fbb5
merged: false
draft: true
```

## BLOCKER FIX IMPLEMENTATION

```yaml
implementation_report: audits/implementation/PR26_BLOCKER_FIXES_116404b1.md
fixed_findings:
  - F01_live_wrapper_shape
  - F02_confirm_save_invalid_room_plan
  - F03_reload_room_plan_restore
  - F04_stale_BOM_pricing_apply_after_blocked_edit
  - F05_false_compliance_ready_with_required_input
  - F06_duplicate_provenance
  - F07_import_pricing_validation
```

## CURRENT USER FLOW

```text
Building / room inputs
-> L0-L6 live evaluation
-> code/design references
-> baseline
-> override + reason
-> compliance
-> BOM/current Catalog pricing
-> explicit Apply to Job
-> Confirm & Save
-> Active frozen snapshot
-> History
-> Duplicate as new
-> Export / Import
```

## FIXED DATA SHAPE CONTRACT

```yaml
UX_getSnapshot_shape: wrapper_{version_plan_result}
canonical_room_plan: wrapper.plan
live_engine_consumes: canonical_room_plan
history_consumes: canonical_room_plan
persistence_stores: canonical_room_plan
preload_supports:
  - canonical_room_plan
  - legacy_wrapper_then_migrates_to_canonical
```

## FAIL-CLOSED LIVE STATE

```yaml
blocked_live_edit:
  apply_disabled: true
  phase_apply_disabled_if_present: true
  stale_BOM_marked: true
  pricing_cleared: true
  calculator_state_marked_stale_blocked: true
valid_again:
  releases_only_live_owned_disable: true
  uses_existing_Calculate_path: true
  auto_Apply: false
```

## HISTORY / COMPLIANCE

```yaml
confirm_save_shape_fixed: true
required_input_checks:
  allowed_to_freeze_snapshot: true
  compliance_ready: false
  active_summary_label: review_required
duplicate_sourceCalculationId_preserved: true
malformed_import_pricing_rejected: true
historical_pricing_drives_live_catalog: false
```

## PWA

```yaml
cache: bruno-ac-v40
```

## VALIDATION

```yaml
ci_run: 35034425269
validated_commit: ae03ac71f2a73cba34569332ebadbe74d9cd0b4e
result: SUCCESS
post_ci_change: delete_temporary_workflow_only
final_head: 116404b13313af0f966695777cf55a807b27fbb5
browser_runtime: NOT_PERFORMED
```

## NEXT STATE

```yaml
next_task_id: PR26_BLOCKER_FIX_REAUDIT_04
next_task_mode: independent_full_reaudit
merge_before_acceptance: forbidden
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_all_PR26_reports_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - audit_exact_head_116404b13313af0f966695777cf55a807b27fbb5
  - previous_rejected_head_43cbc681f579b4009cc55674c4db7507d0910a7c_is_obsolete
  - production_PR_and_code_read_only_during_audit
  - auditor_does_not_merge
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - browser_runtime_must_not_be_claimed_without_execution
  - if_findings_exist_fix_same_PR_then_reaudit_new_exact_HEAD
```
