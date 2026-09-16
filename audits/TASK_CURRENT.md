# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
execution_state: audits/HVAC_LIVE_CALCULATOR_EXECUTION_STATE.md
implementation_report: audits/implementation/MAIN_HVAC_LIVE_CALCULATOR_M01_AUDIT_FIX_7C89B706.md
previous_b_audit: audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_459c497b60cc77c511e9337a888bdff7508c2fef_20260916-1323.md
protocol_required: true
```

# MODE GUARD — INDEPENDENT RE-AUDIT ONLY

```yaml
task_type: AUDIT
production_write_forbidden: true
production_commit_forbidden: true
production_branch_mutation_forbidden: true
merge_forbidden: true
audit_exact_head_required: true
persist_report_before_chat: REQUIRED
update_latest_audit_before_chat: REQUIRED
update_handoff_before_chat: REQUIRED
```

```yaml
task_id: MAIN_HVAC_LIVE_CALCULATOR_M01_FINAL_REAUDIT_02
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
repository: kot0070/bruno-ac-pwa
production_branch: main
base_audited_head: 459c497b60cc77c511e9337a888bdff7508c2fef
target_head: 7c89b706546e4d2e465405544dc398220e664db9
status: ACTIVE_FINAL_REAUDIT
expected_pwa_cache: bruno-ac-v59
validated_ci_run: 35134969943
validated_ci_commit: 7ed3238ed4409fd7d6137848081f287196adb589
pages_run_exact_final_head: 35135027447
pages_result: SUCCESS
browser_mobile_runtime: NOT_PERFORMED
```

## REQUIRED ORDER

1. Verify exact `main` HEAD equals target HEAD.
2. Re-audit the full M01 chain independently, with special adversarial focus on the four B-audit findings and regression risk.
3. Do not modify `main` during audit.
4. Persist FULL REPORT in `audits/history/`.
5. Update `audits/LATEST_AUDIT.md`.
6. Update `audits/HANDOFF.md`.
7. Verify persistence.
8. Only after successful persistence may M01 be closed if verdict is A.

## RE-AUDIT REQUIRED COVERAGE

Re-check the complete chain:
Project/building/zones/envelope -> load -> equipment -> electrical -> mechanical BOM -> Catalog resolution -> Customer/Your Cost/margin -> compliance -> confirm snapshot -> Apply/Re-Apply -> history/duplicate/import/export -> quote/P&L financial invariants, plus Journal runtime regressions and one-surface/mobile/PWA integration.

Mandatory focus:
- no hard-coded Catalog ID becomes authoritative without exact persisted identity or a unique compatible candidate;
- multiple/no compatible Catalog candidates remain unresolved/provisional;
- impossible opening geometry blocks load calculation;
- residential/commercial source refs are applicability-aware;
- extended snapshot/import validation rejects malformed nested dependency objects atomically;
- Customer Price / Your Cost blank-zero-invalid semantics remain unchanged;
- no stale 3-ton/sqft authoritative sizing path reappeared;
- OEM MCA/MOCP/voltage/phase remain nameplate-dependent;
- route lengths remain field/design-gated;
- compliance and Apply remain fail-closed;
- duplicate history re-enters current pricing without mutating the original;
- temporary CI workflow is absent from final HEAD;
- PWA cache is v59 and current engine assets remain in shell;
- exact final Pages deployment succeeded.

Known limitation, not automatically a defect: automatic multi-system optimization is not implemented; manual override can carry `systemCount > 1`.

## VERDICT

```yaml
A: ACCEPT
B: ACCEPT_AFTER_MINOR_FIXES
C: REJECT_REWORK_REQUIRED
```

A requires zero P0/P1 blockers and no material false claim in the core calculation/compliance chain.

## REPORT PATH

`audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_7c89b706546e4d2e465405544dc398220e664db9_20260916-REAUDIT.md`

Browser/mobile runtime must remain `NOT_PERFORMED` unless actually executed.
