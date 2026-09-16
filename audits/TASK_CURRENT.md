# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
handoff: audits/HANDOFF.md
master_chain: audits/MASTER_PLAN_CHAIN.md
last_closed_master: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
last_closure: audits/HVAC_LIVE_CALCULATOR_MASTER_01_CLOSURE.md
last_audit: audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_7c89b706546e4d2e465405544dc398220e664db9_20260916-REAUDIT.md
next_master: audits/PROJECT_FULL_AUDIT_MASTER_PLAN.md
protocol_required: true
```

# USER APPROVAL GATE

```yaml
task_type: APPROVAL_GATE
status: WAITING_FOR_USER_APPROVAL
production_write_forbidden: true
production_commit_forbidden: true
merge_forbidden: true
next_master_id: PROJECT_FULL_AUDIT_MASTER_01
next_master_status: PROPOSED_AWAITING_USER_APPROVAL
execution_authorized: false
accepted_main_head: 7c89b706546e4d2e465405544dc398220e664db9
```

`HVAC_LIVE_CALCULATOR_MASTER_01` is CLOSED with persisted `A_ACCEPT` on exact accepted production HEAD `7c89b706546e4d2e465405544dc398220e664db9`.

The next consolidated full-project audit master has been created but MUST NOT be executed until the user explicitly approves it.

On approval:
1. change `PROJECT_FULL_AUDIT_MASTER_01` status to authorized;
2. create/update its execution state;
3. set P00 current;
4. verify exact `main` HEAD before work;
5. begin strict sequential autonomous execution.

Until approval: do not perform production changes or start P00.
