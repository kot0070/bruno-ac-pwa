# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_reports:
  - audits/implementation/MAIN_SERVICE_JOURNAL_V2_5d5506da.md
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
task_id: MAIN_SERVICE_JOURNAL_V2_AUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_pr: NONE
production_branch: main
base_before_cycle: 3fe244c01dcb84dcf5af60607ba2cce191e51a73
target_head: 5d5506da031e933773614a11e8e5377a478870f6
status: ACTIVE
```

## OBJECTIVE

Perform an independent adversarial audit of the direct-main Service Call Journal V2 correction at exact HEAD `5d5506da031e933773614a11e8e5377a478870f6`.

This task intentionally has no production PR. Treat `main` exact HEAD as the production audit target. Do not modify production code, `main`, any PR, or merge anything.

## REQUIRED SCOPE

Independently verify the complete user-facing workflow:

```text
fresh app/page load
-> Service Journal is home / first primary workspace
-> calendar at top
-> Day / Week / Month / Quarter archive navigation
-> Add Service Call modal
-> Save
-> compact persisted call row
-> Edit / Delete
-> totals recalculate
-> helper/crew payroll
-> tax settings
-> reload persistence
-> legacy migration
-> PWA/offline/cache
```

Required checks:

- Journal is the first/home screen on fresh load, not Quote/More/legacy Dispatch.
- Mobile bottom navigation presents Journal as a primary destination.
- `Aa` display control is visible and usable again.
- Compact Print / Reset / Other header remains functional.
- Live estimating totals remain contextual and do not cover Journal.
- Calendar/date is at the top of the Journal.
- Day / Week / Month / Quarter range boundaries are correct around month, quarter, year, and Sunday/Monday edges.
- Week strip date selection returns to Day view correctly.
- Add Service Call opens an editor/modal rather than creating a permanently large inline form.
- Save produces a compact row containing date/time/address/hours/price context.
- Multiple calls stay compact and remain independently editable/deletable.
- Gross / hours / tax changes affect selected-range totals after Save.
- Cancelled calls remain archived but do not count as revenue.
- Helper can be hourly or fixed/day.
- Hourly helper cost = entered hours × rate.
- Fixed/day helper cost applies even with zero calls.
- With no calls and a $200/day helper, `Net After Crew = -$200`.
- Helper take-home is shown separately from gross payroll cost.
- Helper tax can be globally enabled/disabled and overridden per helper.
- Service-call revenue tax can be globally enabled/disabled and overridden per call.
- One-time settings persist and are not required on every call.
- Default location/jurisdiction is Dripping Springs, TX / TX.
- Fresh default tax percentage is 7.65%, clearly presented as a simplified FICA estimate rather than total tax liability.
- Federal income-tax withholding is not silently guessed.
- V2 persistence survives reload.
- Legacy `bruno-ac-v1.dispatch.calls` migration occurs only when V2 store is absent and does not delete legacy data.
- Existing quote/financial/calculator/catalog state remains unchanged by Journal operations.
- PWA cache is `bruno-ac-v38` and app-shell assets are coherent offline.

## TAX / SOURCE VERIFICATION

Independently verify current 2026 primary-source facts used by the implementation:

```yaml
claimed_employee_social_security_rate: 6.2%
claimed_employee_medicare_rate: 1.45%
claimed_simple_FICA_total: 7.65%
source_family:
  - IRS Publication 15 (2026)
  - IRS Topic 751
```

Also verify the UI does NOT imply that 7.65% is a complete federal/state/local personal income-tax calculation. Record the distinction between employee FICA, federal income-tax withholding, employer payroll taxes, and any other tax treatment material to the displayed semantics.

## BACKUP / DATA-LIFECYCLE AUDIT

The implementation report explicitly states:

```yaml
journal_storage_key: bruno-ac-service-journal-v2
current_Export_App_integration: not_added
```

Independently determine whether the existing product promise for full-app backup means omission of V2 Journal data from Export App / Import App is a P1 blocker. Do not waive this merely because it is documented as a known limit.

Also verify whether Reset demo / New blank job / app backup semantics unexpectedly delete, orphan, or overwrite V2 Journal data.

## REGRESSION GATES

Re-run / inspect enough evidence to establish no regression in:

- financial-integrity-core / Method A;
- Customer Price / Your Cost lifecycle;
- Calculator review UX;
- Code Library loading;
- Quote / T&M navigation;
- Service Worker install/update path;
- navigation between Journal / Job / Estimate / AC Tools / More;
- mobile and desktop layouts.

## VALIDATION EVIDENCE

Temporary CI validation:

```yaml
run_id: 35037896673
validated_commit: 426d2938031b6bb5fd933c6751f0b78b74caac99
expected_conclusion: SUCCESS
```

Expected post-CI delta to final target HEAD:

```text
DELETE .github/workflows/journal-v2-validation.yml only
```

Independently verify the run, job steps, and exact post-CI delta.

## BROWSER RUNTIME

Actual browser/mobile runtime is strongly preferred because the task is primarily a UX/persistence correction. If unavailable, report exactly:

```text
NOT_PERFORMED
```

Do not infer browser behavior from static source or CI.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_SERVICE_JOURNAL_V2_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

Write the full report in the audit workspace, update `LATEST_AUDIT.md` and `HANDOFF.md` per protocol.

AUDIT ONLY. Do not modify `main`, production code, PRs, or merge anything.