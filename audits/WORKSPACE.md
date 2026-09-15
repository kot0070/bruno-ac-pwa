# BRUNO AC AUDIT AI WORKSPACE

```yaml
workspace_version: 3
workspace_type: persistent_ai_audit_coordination
repository: kot0070/bruno-ac-pwa
audit_branch: audit/pr22-603cbca
primary_task_file: audits/TASK_CURRENT.md
context_file: audits/CONTEXT.md
handoff_file: audits/HANDOFF.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
retain_history_reports: 3
language: en
format: ai_native_structured
```

## EXECUTION CONTRACT

```yaml
startup_sequence:
  - read: audits/WORKSPACE.md
  - read: audits/CONTEXT.md
  - read: audits/HANDOFF.md
  - read: audits/TASK_CURRENT.md
  - resolve_active_PR_and_exact_target_HEAD_from_TASK_CURRENT
  - validate_target_against_GitHub
  - execute_task
  - persist_full_report
  - update_latest_alias
  - update_handoff
  - enforce_retention

production_safety:
  task_mode: AUDIT_ONLY
  modify_production_code: false
  modify_production_branch: false
  modify_active_PR: false
  merge: false
  fix_findings_during_audit: false
  write_scope:
    allowed_branch: audit/pr22-603cbca
    allowed_paths:
      - audits/**

source_of_truth_priority:
  - production_code_and_observable_behavior
  - executable_tests
  - CI_artifacts_and_logs
  - static_source_inspection
  - implementation_reports_PR_text_comments_commit_messages_previous_reports

trust_rules:
  green_ci_is_not_acceptance: true
  implementation_report_is_context_not_authority: true
  previous_report_is_not_authority: true
  target_sha_must_be_verified: true
  browser_execution_claim_requires_actual_browser_execution: true
  verified_fact_must_be_distinguished_from_inference: true
```

## MISSING FILE RECOVERY PROTOCOL

```yaml
missing_file_policy:
  never_invent_missing_content: true
  never_assume_missing_equals_empty: true
  never_classify_missing_optional_file_as_production_defect: true
  recovery_order:
    - verify_exact_branch_ref_and_path
    - inspect_relevant_directory_or_PR_changed_files
    - check_for_rename_move_or_new_canonical_equivalent
    - use_current_equivalent_only_if_identity_and_relevance_are_verified
    - record_substitution_in_report_with_old_path_and_resolved_path
  required_file_missing_after_recovery:
    action: BLOCKED
    requirement: explain_exact_missing_artifact_and_why_task_cannot_be_completed_safely
    do_not_continue_with_guessed_content: true
  optional_or_context_file_missing_after_recovery:
    action: CONTINUE_WITH_LIMITATION
    requirement: report_missing_evidence_and_reduce_claim_strength
  referenced_historical_report_missing:
    action: CONTINUE_IF_current_code_tests_and_task_scope_are_sufficient
    previous_report_required_as_authority: false
  task_file_missing:
    action: BLOCKED
  workspace_file_missing:
    action: BLOCKED
  production_file_expected_by_task_but_absent:
    action: investigate_before_verdict
    classify_only_after_confirming_whether_absence_is_expected_rename_removal_or_defect
```

## REPORT PROTOCOL

```yaml
reporting:
  filename_template: audits/history/PR<PR_NUMBER>_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
  latest_alias: audits/LATEST_AUDIT.md
  chat_full_report: false
  chat_schema:
    - "VERDICT: <A|B|C> — <label>"
    - "AUDITED HEAD: <full_sha>"
    - "BLOCKERS: <none|up_to_5_short_lines>"
    - "FULL REPORT: <github_url>"
  blockers_max: 5
  retain_history_reports: 3
  retention_order: newest_by_report_timestamp
  delete_older_than_retention: true
  deletion_scope: audit_branch_only
  verify_write_before_returning_link: true
```

## EVIDENCE CLASSIFICATION

```yaml
evidence_classes:
  BROWSER_RUNTIME: highest_for_actual_UI_behavior_if_really_executed
  EXECUTABLE_INTEGRATION: high_runtime_value
  EXECUTABLE_CORE: strong_runtime_value
  CI_LOG: supporting_runtime_evidence
  STATIC_SOURCE: code_inspection_only
  SOURCE_ASSERTION: nonruntime_guard
  WEAK_STRING_ASSERTION: lowest_confidence
```

## VERDICT MODEL

```yaml
verdicts:
  A: ACCEPT
  B: ACCEPT_AFTER_MINOR_FIXES
  C: REJECT_REWORK_REQUIRED
severity:
  P0: stop_ship
  P1: must_fix_before_A
  P2: non_blocking
rules:
  - any_P0_implies_C
  - unresolved_financial_integrity_defect_cannot_be_B
  - compliance_bypass_implies_C
  - historical_job_mutation_without_explicit_lifecycle_action_implies_C
  - contradictory_UI_state_that_can_cause_wrong_apply_action_is_at_least_P1
```

## OPERATING STYLE

```yaml
style:
  optimize_for_ai_parsing: true
  prefer_exact_identifiers: true
  prefer_yaml_tables_and_fixtures_over_narrative: true
  use_full_sha_on_final_outputs: true
  use_exact_file_and_function_names_when_available: true
  no_redundant_task_repetition: true
  no_long_progress_narrative: true
  concise_chat_output: true
```

## MAINTENANCE RULE

`WORKSPACE.md` is persistent infrastructure. Task-specific PR/branch/SHA/scope belongs in `TASK_CURRENT.md`, not here.
