# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 4
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: PR23_UX_ACCEPTANCE_AUDIT_PENDING
```

## LAST ACCEPTED PRODUCTION BASELINE

```yaml
merged_pr: 22
accepted_feature_head: 118166d91df18c025956e63c17727362805e1165
main_merge_commit: e54d642171ed0b342aba0fe2230f3fdeaa82ad06
verdict: A_ACCEPT
report: audits/history/PR22_118166d91df18c025956e63c17727362805e1165_20260915-1505.md
blockers: []
```

## CURRENT IMPLEMENTATION

```yaml
production_pr: 23
production_branch: feature/ac-calculator-ux-clarity
base_branch: main
base_sha: e54d642171ed0b342aba0fe2230f3fdeaa82ad06
implementation_head: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
implementation_report: audits/implementation/PR23_AC_CALCULATOR_UX_2a6a7463.md
implementation_status: READY_FOR_INDEPENDENT_AUDIT
merged: false
draft: true
changed_files:
  - ac-calculator-review-ux.js
  - ac-calculator.html
  - sw.js
  - tests/ac-calculator-review-ux.test.js
```

## CURRENT TASK

```yaml
current_task_id: PR23_AC_CALCULATOR_UX_ACCEPTANCE_01
current_task_status: ACTIVE
current_target_head: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
mode: independent_ux_acceptance_audit
expected_next_state: PR23_acceptance_decision
```

## HANDOFF RULES

```yaml
rules:
  - read_WORKSPACE_CONTEXT_HANDOFF_IMPLEMENTATION_REPORT_TASK_before_action
  - task_file_defines_active_PR_branch_SHA
  - production_PR_must_remain_unmodified_during_audit
  - production_code_must_remain_unmodified_during_audit
  - merge_forbidden_during_audit
  - reports_and_workspace_writes_only_on_audit_branch_under_audits
  - do_not_copy_full_report_into_HANDOFF
```
