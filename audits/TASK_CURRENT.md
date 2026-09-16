# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/MAIN_SECONDARY_DRAIN_FAIL_CLOSED_5c7884b3.md
previous_report: audits/history/MAIN_PROJECT_ESTIMATOR_e5da455e38f36a4226ec407894efe2c84b301eda_20260915-2052.md
protocol_required: true
```

# MODE GUARD — AUDIT ONLY

```yaml
task_type: AUDIT
production_write_forbidden: true
production_commit_forbidden: true
active_PR_mutation_forbidden: true
merge_forbidden: true
audit_exact_head_required: true
```

```yaml
task_id: MAIN_SECONDARY_DRAIN_FAIL_CLOSED_REAUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
base_rejected_head: e5da455e38f36a4226ec407894efe2c84b301eda
target_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
status: ACTIVE
```

## OBJECTIVE

Independently re-audit exact `main` HEAD `5c7884b32f9e48adb0d3c81f9b8c70fb18f921db` after the single P1 found in the previous Project Estimator acceptance audit.

Do not limit review to the previous blocker; re-check relevant calculator/Apply/PWA/financial regressions around the fix.

## PRIOR P1 — MUST CLOSE

Previous defect:

```text
Full technical calculator allowed pan-drain / overflow-drain with missing secondaryDrainFt to remain warning-only instead of fail-closed before Apply.
```

Required now:
- when installation scope is active, overflow damage risk is selected, overflow method is `pan-drain` or `overflow-drain`, and `secondaryDrainFt` is blank/0, Apply must be fail-closed;
- blocker must be operator-visible and field marked invalid;
- direct/click Apply must not mutate Job while blocked;
- correcting the measured run must clear only this blocker and must NOT force-enable Apply if project/BOM/financial/Commercial blockers remain;
- switching to `pan-switch` or `switch-only` removes this specific drain-length requirement without bypassing other gates;
- repair mode with installation-material scope disabled should not create a false blocker.

## REGRESSION

Re-check:
- staged Project Setup -> Rooms/Zones -> baseline -> Minimum/Calculated/Final -> full calculator;
- Commercial authoritative Apply fail-closed;
- unresolved/invalid BOM gating;
- Customer Price / Your Cost separation and explicit Apply/Re-Apply snapshots;
- Method A / financial integrity / Actual Cost precedence;
- Journal restore/worker identity, payroll/calendar, full backup;
- Code Library / Rule Registry;
- PWA/offline shell coherence.

## VALIDATION EVIDENCE TO VERIFY

```yaml
validated_run: 35046565626
validated_commit: f53c01a947b278eefa2a3e8b16ed1f55eba131fe
expected_ci_result: SUCCESS
final_target: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
expected_post_ci_delta:
  - DELETE .github/workflows/main-secondary-drain-validation.yml
expected_cache: bruno-ac-v42
pages_run: 35046601027
```

Independently verify the final delta and Pages result. Do not infer browser behavior from CI.

## BROWSER RUNTIME

Strongly preferred. Test at minimum:
- `pan-drain` + 0 ft;
- `overflow-drain` + blank;
- valid measured secondary run;
- switch back to `pan-switch`;
- interaction with another existing blocker;
- Apply remains unable to mutate Job while drain blocker is active.

If browser runtime is unavailable, report exactly `NOT_PERFORMED`.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_SECONDARY_DRAIN_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

AUDIT ONLY. Do not modify main, production code, PRs or merge anything.
