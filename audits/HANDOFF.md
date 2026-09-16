# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 38
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
current_task: audits/TASK_CURRENT.md
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
execution_state: audits/HVAC_LIVE_CALCULATOR_EXECUTION_STATE.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: M01_FINAL_INDEPENDENT_AUDIT_READY
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
base_accepted_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
target_head: 459c497b60cc77c511e9337a888bdff7508c2fef
latest_independently_audited_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
latest_independent_verdict: A_ACCEPT
implementation_report: audits/implementation/MAIN_HVAC_LIVE_CALCULATOR_M01_459C497B.md
current_audit_task: audits/TASK_CURRENT.md
```

## MASTER STATUS

```yaml
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
S00: DONE
S01: DONE
S02: DONE
S03: DONE
S04: DONE
S05: DONE
S06: DONE
S07: DONE
S08: DONE
S09: DONE
S10: DONE
S11: DONE
S12: DONE
S13: AUDIT_READY
master_closed: false
```

M01 cannot be marked CLOSED until the independent S13 audit is persisted with an A verdict. B/C returns to targeted fixes and re-audit without discarding stage history.

## FINAL IMPLEMENTER VALIDATION

```yaml
S12_validated_commit: 43dbd14524ce192659738e3a1d611aab46112094
S12_ci_run: 35122703196
S12_ci_result: SUCCESS
final_main_head: 459c497b60cc77c511e9337a888bdff7508c2fef
final_pages_run: 35122795091
final_pages_result: SUCCESS
pwa_cache: bruno-ac-v58
browser_mobile_runtime: NOT_PERFORMED
executable_dom_runtime: PASS_jsdom
end_to_end_dependency_chain: PASS
```

## AUDITOR ORDER — MANDATORY

The independent auditor must:
1. read WORKSPACE/PROTOCOL/TASK_CURRENT/master/execution state/implementation report;
2. audit exact `459c497b60cc77c511e9337a888bdff7508c2fef` only;
3. not modify main/production/PRs;
4. persist the full report under the TASK_CURRENT report path;
5. update `audits/LATEST_AUDIT.md`;
6. update this `audits/HANDOFF.md` with verdict/report/runtime state;
7. verify the audit-workspace writes succeeded;
8. only then return chat `VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT`.

Do not report completion to chat before persistence.

## IMPORTANT KNOWN LIMITATION

Automatic multi-system optimization/splitting is not implemented. Automatic equipment selection currently chooses one exact OEM/Catalog candidate when it satisfies the verified range. Operator override can specify multiple systems. The auditor must flag any UI/product claim that implies automatic multi-system design if found.

## NEXT ACTION

Run the final independent M01 audit defined in `audits/TASK_CURRENT.md`. On A, mark M01 closed. Only after M01 closes should the next strict master plan be activated/proposed.
