# BRUNO AC AUDIT HANDOFF

```yaml
handoff_version: 1
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
current_task: audits/TASK_CURRENT.md
latest_report: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md
history_dir: audits/history
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
known_current_head: 603cbca03e292ae1d3bf424514fb60da6233bfc6
state: READY_FOR_ACTIVE_TASK
```

## LAST KNOWN STATE

```yaml
previous_audit:
  audited_head: 104c8229f2c0ee4ac377e9081fe807f58683db4e
  verdict: C
  report_status: archived_in_workspace
current_target:
  expected_head: 603cbca03e292ae1d3bf424514fb60da6233bfc6
  task_id: PR22_FINAL_ACCEPTANCE_603CBCA
  status: ACTIVE
notes:
  - previous_C_is_not_current_verdict
  - current_task_requires_independent_reverification
  - production_PR_must_remain_untouched
  - reports_may_be_written_only_on_audit_branch_under_audits
```

## HANDOFF UPDATE CONTRACT

After each completed audit/review task, update only the state fields needed for the next AI session:

```yaml
required_update_fields:
  - last_completed_task_id
  - last_audited_head
  - last_verdict
  - last_report_path
  - current_target_head
  - current_task_status
optional_fields:
  - blockers_summary
  - follow_up_task_id
  - notable_environment_limitations
```

Do not copy the full report into this file. Keep it compact enough to be read on every new AI session.
