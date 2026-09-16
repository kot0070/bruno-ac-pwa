# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 26
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_NAV_JOURNAL_V3_REAUDIT_REJECTED
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
audited_head: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
base_rejected_head: 5d5506da031e933773614a11e8e5377a478870f6
audit_task: MAIN_NAV_JOURNAL_V3_REAUDIT_02
verdict: C_REJECT_REWORK_REQUIRED
browser_runtime: NOT_PERFORMED
full_report: audits/history/MAIN_NAV_JOURNAL_V3_84b0da0de9029fb5f6182580dcd6b8185fda9fae_20260915-1935.md
```

## VERIFIED CLOSURE / REMAINING BLOCKERS

```yaml
prior_F01:
  status: CLOSED_CORE_DEFECT
  result: employee_FICA_no_longer_applied_to_service_revenue
prior_F02:
  status: INCOMPLETE
  result: journal_is_exported_and_round_trip_string_restore_is_tested
  blocker: journal_payload_content_schema_version_not_validated_before_restore
new_blockers:
  - F03_commercial_standalone_apply_bypasses_fail_closed_project_mode
  - F04_month_quarter_prev_next_fixed_day_offsets_can_skip_periods
  - F05_payroll_YTD_wage_bases_use_mutable_helper_name_as_employee_identity
```

## CI / FINAL DIFF

```yaml
validated_run: 35040092200
validated_commit: 5ea77335613929d19f84dad41afe1dd8dbb93bc6
ci_result: SUCCESS
final_target: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
post_ci_delta:
  - DELETE .github/workflows/main-nav-journal-v3-validation.yml
other_post_ci_changes: none_observed
pwa_cache: bruno-ac-v39
```

## AUDIT FINDINGS REQUIRING CORRECTION

1. Validate `bruno-ac-service-journal-v2` JSON/schema/version before any full-backup restore writes; fail closed on malformed Journal payloads.
2. Enforce Residential/Commercial project-mode guard in the authoritative calculator Apply path, including standalone `ac-calculator.html`.
3. Replace fixed 31/92-day Journal Month/Quarter navigation with calendar period shifts and add boundary tests.
4. Give helpers a stable employee/worker identity for per-employee SS/TWC/FUTA wage-base accumulation; names must be display-only identity.

## BOUNDARIES

- Browser/mobile runtime for this exact target was `NOT_PERFORMED`; do not infer browser acceptance from CI/static inspection.
- PR #26 remains separate, open/draft/unmerged and was not mutated by this audit.
- No production code, `main`, active PR, or merge was changed during audit.

## NEXT ACTION

Implement the four P1 corrections in a separate production cycle, refresh `TASK_CURRENT.md` to the new exact production HEAD, then run a new independent exact-HEAD audit with browser runtime if available.
