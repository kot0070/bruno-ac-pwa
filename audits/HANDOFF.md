# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 20
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR26_REWORK_REQUIRED_AFTER_AUDIT
```

## LAST ACCEPTED / MERGED PRODUCTION BASELINE

```yaml
merged_pr: 25
accepted_feature_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
main_merge_commit: e84c9e9b6c53693d087db46156975ffec93d238a
verdict: A_ACCEPT
```

## CURRENT PRODUCTION PR

```yaml
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
audited_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
merged: false
draft: true
audit_verdict: C_REJECT_REWORK_REQUIRED
latest_report: audits/history/PR26_43cbc681f579b4009cc55674c4db7507d0910a7c_20260915-1749.md
browser_runtime: NOT_PERFORMED
```

## AUDIT BLOCKERS

```yaml
F01:
  severity: P1
  defect: room-estimator-live consumes BrunoRoomEstimatorUX.getSnapshot wrapper as if it were the raw plan; live L0-L6 evaluates defaults instead of the current room plan
F02:
  severity: P1
  defect: Confirm & Save passes the wrapper as roomPlan; calculation-history-core rejects it as invalid_room_plan
F03:
  severity: P1
  defect: persisted roomEstimator wrapper is restored with E.normalizePlan(saved) instead of saved.plan, losing room rows/overrides on reload
F04:
  severity: P1
  defect: blocked live edits do not invalidate prior Calculator BOM/pricing/review/Apply state, leaving stale materials applyable
F05:
  severity: P1
  defect: confirmed history hard-codes compliance.ready=true when required-input checks may still be unresolved
```

Non-blocking findings:

```yaml
F06:
  severity: P2
  defect: Duplicate sourceCalculationId is computed in core but discarded by UX
F07:
  severity: P2
  defect: imported snapshots can normalize incomplete/invalid historical pricing fields to null rather than rejecting them
```

## VERIFIED POSITIVE EVIDENCE

```yaml
exact_head_matches_task: true
pr_state: open_draft_unmerged
final_diff_files: 14
temporary_workflow_in_final_diff: false
ci_run: 35030476333
ci_validated_commit: 4eaaecea6922e73a10e0bf09ecb9b6da9bc63bb4
ci_result: SUCCESS
post_ci_delta: delete_.github/workflows/pr26-history-levels-validation.yml_only
pwa_cache: bruno-ac-v39
required_history_live_assets_cached: true
texas_acr_2024_code_adoption_effective_2026_09_01_verified: true
acca_manual_d_2016_design_reference_verified: true
```

## REQUIRED NEXT IMPLEMENTATION

```yaml
must_fix_before_reaudit:
  - standardize_room_snapshot_contract_between_UX_live_persistence_history
  - use_actual_plan_for_live_engine_dependency_and_calculator_bridge
  - make_confirm_save_work_with_real_UX_snapshot
  - restore_full_persisted_room_plan_and_overrides_on_reload
  - fail_closed_and_disable_or_invalidate_Apply_when_live_plan_is_blocked_or_stale
  - derive_confirmed_compliance_ready_from_authoritative_required_checks
  - add_executable_integration_tests_covering_real_UX_snapshot_shape
  - rerun_all_PR22_PR26_regressions
```

## NEXT STATE

```yaml
next_task_mode: implementation_fix_on_same_PR26
merge_before_new_exact_head_acceptance: forbidden
reaudit_required: true
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_all_PR26_implementation_reports_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - audited_head_43cbc681f579b4009cc55674c4db7507d0910a7c_is_rejected
  - do_not_reuse_rejected_head_for_acceptance
  - fix_same_PR_then_refresh_TASK_CURRENT_to_new_exact_HEAD
  - production_PR_and_code_read_only_during_audit
  - auditor_does_not_merge
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - browser_runtime_must_not_be_claimed_without_execution
```
