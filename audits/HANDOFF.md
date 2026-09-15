# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 14
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR25_CODE_LIBRARY_AUDIT_BLOCKED_PROTOCOL_MISSING
```

## LAST ACCEPTED PRODUCTION BASELINE

```yaml
merged_pr: 24
accepted_feature_head: d58502c884db66e5bd7c65a004db5ef4097a8be7
main_merge_commit: 6f48420748da960d977d036bcc1be83a12ec4872
verdict: A_ACCEPT
blockers: []
```

## CURRENT IMPLEMENTATION

```yaml
production_pr: 25
production_branch: feature/code-library-rule-registry
base_branch: main
base_sha: 6f48420748da960d977d036bcc1be83a12ec4872
production_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
implementation_report: audits/implementation/PR25_CODE_LIBRARY_RULE_REGISTRY_90ebe4d2.md
merged: false
draft: true
changed_files:
  - code-library-ux.js
  - code-library/texas-hvac-2026.json
  - code-rule-registry.js
  - sw.js
  - tests/code-rule-registry.test.js
  - workspace-v5.js
```

## IMPLEMENTATION PURPOSE

```yaml
phase: Code_Library_and_Rule_Registry_foundation
future_target:
  - building_and_room_inputs
  - applicable_code_rules
  - scope_and_BOM_rules
  - Catalog_resolution
  - Customer_Price_and_Your_Cost
  - source_traceability
current_PR_does_not_yet_implement_room_based_calculation: true
calculator_engine_consumes_rule_map_in_PR25: false
```

## PLANNED NEXT PHASE

```yaml
roadmap_file: audits/ROADMAP_NEXT.md
next_major_phase: room_based_code_driven_estimator
quantity_provenance_model:
  - code_minimum
  - calculated_baseline
  - contractor_or_customer_override
  - override_reason
  - final_quantity
repricing_after_valid_override:
  - Customer_Materials
  - Your_Material_Cost
  - Material_Margin
  - Material_Margin_Percent
below_hard_code_minimum_must_not_silently_pass: true
PR25_scope_unchanged_by_this_plan: true
```

## IMPLEMENTATION VALIDATION CONTEXT

```yaml
ci_run_claimed_by_implementation: 35024484325
validated_commit_claimed_by_implementation: 5035fe1a58a42635e7b1d5198fac3507526d50da
final_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
independent_ci_audit_completed: false
reason: required audit protocol missing
```

## SOURCE / COPYRIGHT BOUNDARY

```yaml
local_registry: code-library/texas-hvac-2026.json
implementation_claims_full_copyrighted_code_books_stored: false
implementation_claims_summary_only: true
local_AHJ_verification_required: true
independent_acceptance_verified: false
```

## LATEST AUDIT ATTEMPT

```yaml
task_id: PR25_CODE_LIBRARY_ACCEPTANCE_01
audited_target_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
verdict: C_BLOCKED_INCOMPLETE_AUDIT
production_acceptance_decision: NOT_REACHED
blocker:
  expected_artifact: audits/PROTOCOL.md
  protocol_required_by_task: true
  recovery_result: missing_on_audit_branch_and_main_no_verified_equivalent
  workspace_required_action: BLOCKED
browser_runtime: NOT_PERFORMED
full_report: audits/history/PR25_90ebe4d2408a7b0af7e6e7671540f632585a8804_20260915-1621.md
```

## NEXT STATE

```yaml
next_action:
  - restore_or_provide_required_audit_protocol_artifact
  - or_explicitly_revise_TASK_CURRENT_protocol_requirement_to_verified_canonical_protocol
  - rerun_PR25_CODE_LIBRARY_ACCEPTANCE_01_from_exact_current_target_head
merge_before_acceptance: forbidden
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_CONTEXT_HANDOFF_ROADMAP_IMPLEMENTATION_REPORT_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - production_PR_and_code_remain_read_only_during_audit
  - merge_forbidden_during_audit
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - implementation_report_is_context_not_authority
  - browser_runtime_must_not_be_claimed_without_execution
  - exact_target_head_for_current_task_is_90ebe4d2408a7b0af7e6e7671540f632585a8804
  - required_missing_audit_artifact_must_block_instead_of_being_invented
```
