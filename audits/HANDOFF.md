# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 22
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR26_REAUDIT_REJECTED_FIX_REQUIRED
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
production_head: 116404b13313af0f966695777cf55a807b27fbb5
merged: false
draft: true
latest_audit_verdict: C_REJECT_REWORK_REQUIRED
latest_audit_report: audits/history/PR26_116404b13313af0f966695777cf55a807b27fbb5_20260915-1821.md
```

## REAUDIT RESULT

```yaml
closed:
  - F01_live_wrapper_shape
  - F02_confirm_save_invalid_room_plan
  - F03_reload_room_plan_restore
  - F05_false_compliance_ready_with_required_input
  - F06_duplicate_provenance
open_blocker:
  id: F04
  severity: P1
  issue: click_only_room_plan_mutations_can_enter_blocked_state_without_invoking_live_fail_closed_invalidator_leaving_stale_Calculator_Apply_enabled
partially_open:
  id: F07
  severity: P2
  issue: import_pricing_validation_accepts_malformed_margin_fields_and_negative_finite_totals
```

## F04 REQUIRED FIX BOUNDARY

```yaml
required:
  - every_room_plan_mutation_path_must_trigger_same_live_validation_and_fail_closed_gate
  - include_click_only_add_remove_preset_clear_overrides_paths
  - stale_Calculator_scope_BOM_must_never_remain_applyable_after_current_plan_blocks
  - add_executable_DOM_integration_regression_for_valid_to_blocked_click_transition
forbidden:
  - merge_before_new_exact_HEAD_audit_acceptance
```

## F07 REQUIRED MINOR HARDENING

```yaml
required:
  - reject_or_skip_semantically_invalid_historical_pricing
  - cover_malformed_marginDollar
  - cover_malformed_marginPct
  - cover_negative_financial_totals_consistently_with_existing_financial_semantics
```

## VERIFIED CI CONTEXT

```yaml
ci_run: 35034425269
validated_commit: ae03ac71f2a73cba34569332ebadbe74d9cd0b4e
result: SUCCESS
post_ci_delta_to_final_head: DELETE_.github/workflows/pr26-reaudit-validation.yml_only
browser_runtime: NOT_PERFORMED
```

## NEXT STATE

```yaml
next_action: focused_PR26_fix_then_new_exact_HEAD_reaudit
merge_before_acceptance: forbidden
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_TASK_and_latest_report_before_action
  - current_rejected_head_116404b13313af0f966695777cf55a807b27fbb5_must_not_be_merged
  - production_PR_and_code_read_only_during_audit
  - implementation_changes_belong_on_production_PR_in_separate_implementation_cycle
  - next_audit_must_target_new_exact_HEAD_after_fix
  - browser_runtime_must_not_be_claimed_without_execution
```
