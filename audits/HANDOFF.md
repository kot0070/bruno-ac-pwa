# BRUNO AC WORKSPACE HANDOFF

```yaml
handoff_version: 32
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
roadmap: audits/ROADMAP_NEXT.md
current_task: audits/TASK_CURRENT.md
latest_report_alias: audits/LATEST_AUDIT.md
history_dir: audits/history
implementation_report_dir: audits/implementation
state: MAIN_JOURNAL_ESTIMATOR_UX_V43_AUDIT_READY
```

## CURRENT PRODUCTION TARGET

```yaml
production_mode: DIRECT_MAIN
production_branch: main
base_accepted_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
target_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
implementation_report: audits/implementation/MAIN_JOURNAL_ESTIMATOR_UX_V43_436A3696.md
audit_task: MAIN_JOURNAL_ESTIMATOR_UX_V43_AUDIT_01
browser_runtime_by_implementer: NOT_PERFORMED
```

## PREVIOUS ACCEPTED BASELINE

```yaml
accepted_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
verdict: A_ACCEPT
report: audits/history/MAIN_SECONDARY_DRAIN_5c7884b32f9e48adb0d3c81f9b8c70fb18f921db_20260915-2113.md
```

The secondary-drain fail-closed gate remains part of the required regression scope and must not regress.

## CURRENT CHANGE SET

Production cycle addresses mobile operator feedback:

- Journal Tax/Payroll Settings should remain collapsed until requested;
- saved Service Calls use compact static archive rows with explicit Edit/modal workflow;
- Job letterhead selector must follow the dark theme instead of rendering as a white strip;
- Project Calculator must expose generated material/pricing summary clearly;
- building area must visibly affect the preliminary estimating allowance after baseline creation;
- area responsiveness is explicitly a non-code, non-Manual-J/D estimating heuristic;
- PWA cache upgraded to v43 and shell JS/CSS/JSON assets use network-first with cache fallback to reduce stale deployed UI.

## VALIDATION

```yaml
ci_run: 35049028474
ci_validated_commit: f7638584081fb3247963eeefae7f18762f822a73
ci_result: SUCCESS
final_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
post_ci_delta:
  - DELETE .github/workflows/main-v43-ux-validation.yml
pages_run: 35049069724
pages_result: SUCCESS
pwa_cache: bruno-ac-v43
```

## RISK / AUDIT FOCUS

The main new semantic change is the area-responsive **estimating allowance** used to make the staged estimator react to total building area. It must never be represented as a code minimum or substitute for Manual J/Manual D/engineering. Auditor should verify wording, runtime behavior, override preservation and downstream BOM/pricing behavior.

The Journal source already contained collapsed settings/static saved rows before this cycle; the user screenshot showed an older runtime appearance. Therefore PWA freshness behavior is part of acceptance, not merely styling.

## AUDIT SAFETY

```yaml
audit_only_required: true
main_write_by_auditor_forbidden: true
production_code_write_by_auditor_forbidden: true
pr_mutation_by_auditor_forbidden: true
merge_by_auditor_forbidden: true
```
