# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 19
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR26_LIVE_HISTORY_LEVELS_AUDIT_PENDING
```

## LAST ACCEPTED / MERGED PRODUCTION BASELINE

```yaml
merged_pr: 25
accepted_feature_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
main_merge_commit: e84c9e9b6c53693d087db46156975ffec93d238a
verdict: A_ACCEPT
```

## CURRENT IMPLEMENTATION

```yaml
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
production_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
merged: false
draft: true
implementation_reports:
  - audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
  - audits/implementation/PR26_LIVE_CODE_ESTIMATOR_5b069931.md
  - audits/implementation/PR26_HISTORY_LEVELS_43cbc681.md
obsolete_heads:
  - a04915f472679866ff941d0fb7b4b8752519becb
  - 5b069931eaf98311f31d344c1acd6cc8e5553ade
```

## CURRENT USER FLOW

```text
Building / room inputs
-> L0-L6 live evaluation
-> code/design references
-> calculated baseline
-> override + reason
-> compliance state
-> BOM/components
-> current Catalog pricing
-> explicit Apply to Job
-> Confirm & Save Calculation
-> Active frozen snapshot
-> History
-> Duplicate as new
-> Export / Import
```

## LIVE LEVEL MODEL

```yaml
L0: Raw inputs
L1: Normalized building / room model
L2: Code / design requirements
L3: Calculated baseline
L4: Override / compliance
L5: BOM / components
L6: Catalog / pricing
L7: Confirmed snapshot / history
```

Dependency classification is exposed through `earliestDirtyLevel()`. Override-only changes start at L4; room/building changes are upstream. Existing AC Calculator still performs authoritative BOM/Catalog Calculate; level model must not be described as replacing that engine.

## HISTORY / REUSE

```yaml
storage_path: state.acCalculator.calculationHistory
features:
  - active_confirmed_snapshot_near_top
  - frozen_historical_customer_your_margin_values
  - immutable_by_value_snapshot
  - multiple_history_records
  - activate_old_snapshot
  - duplicate_as_editable_new_plan
  - export_single_snapshot
  - export_history_bundle
  - import_single_or_bundle
  - imported_records_get_new_IDs
  - malformed_import_non_destructive
```

Historical price records are display/history only. New live calculations must continue to use current Catalog pricing.

## SAFETY BOUNDARIES

```yaml
no_sqft_to_tonnage_inference: true
no_claim_of_performing_Manual_J_S_or_D: true
planning_defaults_are_code_minimums: false
unknown_numeric_minimum_fabricated: false
known_hard_minimum_violation_red_and_blocking: true
live_preview_writes_job: false
explicit_Apply_required_for_job_mutation: true
history_snapshot_overwrites_job_financial_state: false
```

## FINANCIAL INVARIANTS

```yaml
customer_track: Catalog.unitCost -> Calculator.customerUnitPrice -> Job.unitCost -> Quote
internal_track: Catalog.yourCost -> Calculator.yourUnitCost -> Job.procurementCostSnapshot -> PnL
actual_track: Job.actualCost -> PnL_override_only
```

## PWA

```yaml
cache: bruno-ac-v39
new_assets:
  - ./room-estimator-live.js
  - ./calculation-history-core.js
  - ./calculation-history-ux.js
```

## VALIDATION

```yaml
latest_ci_run: 35030476333
validated_commit: 4eaaecea6922e73a10e0bf09ecb9b6da9bc63bb4
result: SUCCESS
post_ci_change: delete_temporary_workflow_only
final_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
temporary_workflow_in_final_diff: false
browser_runtime: NOT_PERFORMED
```

## NEXT STATE

```yaml
next_task_id: PR26_LIVE_HISTORY_LEVELS_ACCEPTANCE_03
next_task_mode: independent_large_block_acceptance_audit
merge_before_acceptance: forbidden
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_PROTOCOL_CONTEXT_HANDOFF_ROADMAP_all_PR26_implementation_reports_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - audit_exact_head_43cbc681f579b4009cc55674c4db7507d0910a7c
  - obsolete_heads_must_not_be_used_for_acceptance
  - production_PR_and_code_read_only_during_audit
  - auditor_does_not_merge
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - browser_runtime_must_not_be_claimed_without_execution
  - if_findings_exist_fix_same_PR_then_reaudit_new_exact_HEAD
```
