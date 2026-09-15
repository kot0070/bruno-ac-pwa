# AUDIT TASK CHANNEL

```yaml
protocol: bruno-ac-audit-v1
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
audit_branch: audit/pr22-603cbca
report_dir: audits/history
retain_reports: 3
current_report_alias: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md
rules:
  - read_this_file_first
  - do_not_modify_production_code
  - do_not_modify_pr_22
  - do_not_merge
  - full_report_goes_to_github_not_chat
  - save_report_as: audits/history/PR22_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
  - update_current_report_alias_with_same_full_report
  - after_successful_save_keep_only_3_newest_history_reports
  - delete_older_history_reports_only_from_audit_branch
  - chat_response_only: verdict,audited_head,blockers,report_link
status: READY
```

## CURRENT TASK

No active task yet.

When a new task is assigned, replace only this section with the exact audit/review instruction. The auditor should treat the YAML contract above as persistent delivery rules.

## REPORT RETENTION

Keep the 3 newest complete reports in `audits/history/` for audit history. Older reports may be deleted from the audit branch after the newest report has been successfully written and verified.

`audits/PR22_FINAL_ACCEPTANCE_AUDIT.md` is the stable pointer/alias containing the newest full report for easy retrieval by another ChatGPT.
