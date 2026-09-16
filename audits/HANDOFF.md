# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 34
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_PROJECT_HISTORY_V44_AUDIT_READY
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
base_accepted_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
target_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
implementation_report: audits/implementation/MAIN_PROJECT_HISTORY_V44_19846AA7.md
audit_task: MAIN_PROJECT_HISTORY_V44_AUDIT_01
browser_runtime: NOT_PERFORMED
```

## IMPLEMENTED CYCLE

Added reusable calculation history on top of the accepted V43 staged Project Calculator:

```text
Confirm & Save Calculation
-> frozen snapshot
-> Active calculation
-> History
-> Activate
-> Duplicate as new
-> Export one / Export all
-> Import snapshot/history
```

Frozen snapshot stores project plan, calculator inputs, selected BOM rows and displayed Customer Materials / Your Cost / Margin values.

Duplicate preserves project/catalog identity and quantity but removes historical Catalog price fields so the new editable calculation returns to CURRENT Catalog pricing.

Import validates product/type/version/snapshot shape and assigns new local IDs to imported snapshots.

## PRESERVED ACCEPTED BASELINE

```yaml
v43_material_price_preview: PRESERVED
v43_area_live_input: PRESERVED
area_heuristic_non_code_boundary: PRESERVED
commercial_apply_fail_closed: PRESERVED
secondary_drain_fail_closed: PRESERVED
unresolved_bom_fail_closed: PRESERVED
invalid_financial_fail_closed: PRESERVED
customer_vs_your_cost_tracks: PRESERVED
explicit_apply_reapply_job_snapshots: PRESERVED
journal_v4: UNCHANGED
```

## VALIDATION

```yaml
ci_run: 35051528777
ci_validated_commit: ca7f2ee9eaa81354ea59d5f5c6e81dace9d08ae8
ci_result: SUCCESS
final_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
post_ci_delta:
  - DELETE .github/workflows/main-v44-history-validation.yml
pages_run: 35051572014
pwa_cache: bruno-ac-v44
```

Pages final conclusion must be independently checked by auditor; implementation report was written while the final deployment run was still completing.

## NEXT ACTION

Run independent AUDIT ONLY against exact `main` HEAD `19846aa72a0370fbb5cd164a37d8abe9c41a750a` using `audits/TASK_CURRENT.md`.

Do not modify production/main during audit.
