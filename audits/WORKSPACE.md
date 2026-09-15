# BRUNO AC AUDIT AI WORKSPACE

```yaml
workspace_version: 1
workspace_type: persistent_ai_audit_coordination
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
audit_branch: audit/pr22-603cbca
primary_task_file: audits/TASK_CURRENT.md
context_file: audits/CONTEXT.md
handoff_file: audits/HANDOFF.md
latest_report_alias: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md
history_dir: audits/history
retain_history_reports: 3
language: en
format: ai_native_structured
```

## EXECUTION CONTRACT

```yaml
startup_sequence:
  - read: audits/WORKSPACE.md
  - read: audits/CONTEXT.md
  - read: audits/TASK_CURRENT.md
  - read: audits/HANDOFF.md
  - resolve_actual_production_head
  - validate_task_target_against_actual_head
  - execute_task
  - persist_report
  - update_handoff
  - enforce_retention

production_safety:
  modify_production_code: false
  modify_production_branch: false
  modify_pr_22: false
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
  - comments_commit_messages_PR_text_previous_reports

trust_rules:
  green_ci_is_not_acceptance: true
  previous_report_is_not_authority: true
  task_expected_sha_must_be_verified: true
  browser_execution_claim_requires_actual_browser_execution: true
  verified_fact_must_be_distinguished_from_inference: true
```

## REPORT PROTOCOL

```yaml
reporting:
  full_report_destination: audits/history/PR22_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
  latest_alias: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md
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
  EXECUTABLE_INTEGRATION: highest_runtime_value
  EXECUTABLE_CORE: strong_runtime_value
  CI_LOG: supporting_runtime_evidence
  STATIC_SOURCE: code_inspection_only
  SOURCE_ASSERTION: non_runtime_guard
  WEAK_STRING_ASSERTION: lowest_confidence
  BROWSER_RUNTIME: interactive_runtime_if_actually_available
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

`WORKSPACE.md` is persistent infrastructure. Do not rewrite it for every audit. Change it only when the coordination protocol itself changes.
