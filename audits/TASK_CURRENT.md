# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
handoff: audits/HANDOFF.md
master_chain: audits/MASTER_PLAN_CHAIN.md
master_plan: audits/FULL_USER_FLOW_INTEGRITY_MASTER_PLAN.md
last_closed_master: PLAYWRIGHT_BROWSER_E2E_MASTER_01
last_audit: audits/PLAYWRIGHT_BROWSER_E2E_FINAL.md
protocol_required: true
```

# ACTIVE TASK

```yaml
task_type: FULL_USER_FLOW_INTEGRITY_MASTER
status: ACTIVE
master_id: FULL_USER_FLOW_INTEGRITY_MASTER_01
execution_authorized: true
execution_mode: AUTONOMOUS_FULL_APP_BROWSER_RUNTIME_AUDIT
current_stage: HARNESS_CORRECTIVE_REVALIDATION
production_branch: main
audit_branch: audit/pr22-603cbca
implementation_branch: e2e/full-app-browser-e2e-master
starting_accepted_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
accepted_main_head: PENDING
production_write_authorized_for_current_stage: true
report_path: audits/FULL_USER_FLOW_INTEGRITY_MASTER_PLAN.md
browser_runtime: IN_PROGRESS_PLAYWRIGHT_CHROMIUM_DESKTOP_AND_MOBILE_EMULATION
physical_mobile_runtime: NOT_PERFORMED
safari_runtime: NOT_PERFORMED
latest_failed_browser_e2e_run: 35164811205
latest_corrective_head: 1580e112b2f1925da9cf8495abb45a3e112cf5d3
corrective_revalidation_run: 35175552052
corrective_revalidation_result: IN_PROGRESS
final_verdict: PENDING
```

`FULL_USER_FLOW_INTEGRITY_MASTER_01` is active and authorized. Critical user-visible behavior must be proven by real browser interaction and connected data/calculation/persistence evidence. Exact-production-HEAD Browser E2E plus Pages success are required before final `A_ACCEPT`.
