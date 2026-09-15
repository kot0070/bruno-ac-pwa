# BRUNO AC AUDIT PROTOCOL

```yaml
protocol_version: 1
repository: kot0070/bruno-ac-pwa
applies_to: independent_audits
workspace: audits/WORKSPACE.md
audit_branch: audit/pr22-603cbca
```

## STARTUP

```yaml
required_read_order:
  - audits/WORKSPACE.md
  - audits/PROTOCOL.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/ROADMAP_NEXT.md
  - implementation_report_from_TASK_CURRENT_if_present
  - audits/TASK_CURRENT.md
required_before_substantive_audit:
  - resolve_active_PR_from_TASK_CURRENT
  - resolve_exact_target_HEAD_from_TASK_CURRENT
  - verify_live_PR_HEAD_matches_target_HEAD
  - verify_base_SHA_and_branch_identity
```

## MODE GUARD

```yaml
audit_only:
  modify_production_code: forbidden
  modify_production_branch: forbidden
  modify_active_PR: forbidden
  merge: forbidden
  fix_findings_during_audit: forbidden
write_scope:
  allowed_branch: audit/pr22-603cbca
  allowed_paths:
    - audits/**
```

Audit findings must be reported, not repaired inside the audit session. Any production correction requires a separate implementation cycle and a new exact-HEAD audit.

## EVIDENCE AND AUTHORITY

```yaml
priority:
  - current_production_code_and_observable_behavior
  - executable_tests
  - CI_runs_jobs_logs_artifacts
  - static_source_inspection
  - official_regulatory_or_vendor_primary_sources_when_material
  - implementation_reports_PR_text_comments_commit_messages_previous_reports
rules:
  implementation_report_is_context_not_authority: true
  previous_audit_is_not_current_authority: true
  green_CI_is_not_acceptance_by_itself: true
  browser_claim_requires_actual_browser_execution: true
  inference_must_not_be_presented_as_verified_runtime_fact: true
```

## EXACT HEAD / SCOPE

```yaml
requirements:
  - audit_exact_TASK_CURRENT_target_head_only
  - if_live_PR_head_differs_from_target_head_then_BLOCKED_until_task_is_refreshed
  - compare_target_head_to_declared_base
  - independently_verify_changed_file_scope
  - temporary_validation_artifacts_forbidden_if_TASK_CURRENT_says_they_are_not_in_final_diff
  - do_not_accept_unreviewed_post_CI_changes_except_when_TASK_CURRENT_explicitly_scopes_and_auditor_verifies_them
```

## REGULATORY / CODE CLAIMS

When TASK_CURRENT contains regulatory, code, licensing, compliance, safety, or adoption claims:

```yaml
requirements:
  - independently_check_current_primary_sources
  - record_effective_date_and_jurisdiction
  - distinguish_adopted_code_from_model_code_from_OEM_requirement_from_local_AHJ_requirement
  - do_not_strengthen_source_language
  - do_not infer_project_compliance_from_a_registry_entry_alone
  - flag_materially_false_or_broken_primary_source_mapping
  - preserve_local_AHJ_and_OEM_verification_boundaries_when_applicable
```

## COPYRIGHT / SOURCE HANDLING

```yaml
rules:
  - do_not_reproduce_full_copyrighted_code_books_or_substantial_protected_text_in_audit_reports
  - section_identifiers_concise_original_summaries_and_source_links_are_preferred
  - verify_claims_about_local_repository_source_policy_against_actual_diff
```

## MISSING FILE HANDLING

Follow `WORKSPACE.md` missing-file recovery literally.

```yaml
recovery_order:
  - verify_exact_branch_ref_and_path
  - inspect_relevant_directory_or_changed_files
  - check_for_rename_move_or_verified_current_equivalent
  - never_invent_missing_content
required_artifact_missing_after_recovery: BLOCKED
optional_context_missing: CONTINUE_WITH_LIMITATION
TASK_CURRENT_missing: BLOCKED
WORKSPACE_missing: BLOCKED
PROTOCOL_missing_when_protocol_required: BLOCKED
```

## TEST / CI REVIEW

```yaml
requirements:
  - inspect_referenced_CI_run_independently
  - inspect_job_and_step_conclusions
  - correlate_validated_commit_with_target_HEAD
  - verify_any_post_CI_delta
  - classify_static_string_assertions_as_weaker_than_executable_behavior
```

## BROWSER RUNTIME

```yaml
policy:
  preferred_when_TASK_CURRENT_requests_it: true
  if_executed: report_actual_steps_and_observed_result
  if_unavailable: report_exactly_NOT_PERFORMED
  never_infer_browser_success_from_source_or_CI: true
```

## FINDINGS / SEVERITY

```yaml
severity:
  P0: stop_ship
  P1: must_fix_before_A
  P2: non_blocking
verdicts:
  A: ACCEPT
  B: ACCEPT_AFTER_MINOR_FIXES
  C: REJECT_REWORK_REQUIRED
rules:
  - any_P0_implies_C
  - any_unresolved_P1_prevents_A
  - audit_infrastructure_blocker_prevents_substantive_acceptance
  - financial_integrity_or_compliance_bypass_cannot_be_minor
```

## REPORT / WORKSPACE WRITES

```yaml
required_after_audit:
  - write_full_report_to_TASK_CURRENT_report_path
  - update_audits/LATEST_AUDIT.md
  - update_audits/HANDOFF.md
  - enforce_WORKSPACE_history_retention
  - verify_written_report_before_returning_link
chat_output_only:
  - VERDICT
  - AUDITED_HEAD
  - BLOCKERS
  - FULL_REPORT
```

## NON-AUTHORITY CLAUSE

This protocol defines how to audit. It does not define the product requirement for a specific PR. `TASK_CURRENT.md` remains authoritative for the active audit target, exact HEAD, scope, acceptance checks, and report path.
