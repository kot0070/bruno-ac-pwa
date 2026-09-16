# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_reports:
  - audits/implementation/MAIN_SERVICE_JOURNAL_V2_5d5506da.md
  - audits/implementation/MAIN_NAV_JOURNAL_V3_84b0da0d.md
previous_reject_report: audits/history/MAIN_SERVICE_JOURNAL_V2_5d5506da031e933773614a11e8e5377a478870f6_20260915-1908.md
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
task_id: MAIN_NAV_JOURNAL_V3_REAUDIT_02
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
base_rejected_head: 5d5506da031e933773614a11e8e5377a478870f6
target_head: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
status: ACTIVE
```

## OBJECTIVE

Perform an independent adversarial audit of exact `main` HEAD `84b0da0de9029fb5f6182580dcd6b8185fda9fae`.

Do not limit review to previous blockers. Re-check the full Service Journal, navigation, backup, project-mode boundary, PWA and accepted financial/calculator regressions.

## PRIOR P1 BLOCKERS — MUST CLOSE

### F01 — revenue/FICA semantic defect

Previously employee FICA 7.65% was subtracted directly from service-call revenue.

Required now:
- service-call Gross is not reduced by employee FICA;
- optional owner tax reserve is separately named, default OFF, and not represented as payroll tax;
- employee payroll deductions affect helper take-home;
- employer payroll taxes add to employer crew cost;
- Cash After Crew uses gross revenue minus optional owner reserve minus employer crew cost;
- no-call day with paid helper remains negative.

Independently verify current 2026 primary sources and implementation semantics for:
- employee/employer Social Security 6.2%;
- employee/employer Medicare 1.45%;
- 2026 SS wage base $184,500;
- 0.9% Additional Medicare employee withholding threshold behavior;
- FUTA first $7,000 and 0.6% effective estimate only when full state credit applies;
- Texas UI first $9,000 and new-employer 2.70% estimate; actual assigned rate may differ.

Primary source families to verify independently: IRS Topic 751 / Pub 15 (2026), Texas Workforce Commission.

### F02 — full app backup omitted Journal

Required now:
- Export App actually includes `bruno-ac-service-journal-v2`;
- full backup captures all `bruno-ac-*` local stores without unrelated keys;
- Import App validates and restores Journal data;
- executable export -> clear/new storage -> import/restore round trip preserves Journal payload;
- legacy Export App / Import App handlers cannot bypass the new full-backup bridge in normal UI use.

## NAVIGATION / PRODUCT FLOW

Verify mobile and desktop information architecture:

```text
Journal
Calculator
Job
Catalog
More
```

Required behavior:
- Journal opens as fresh-load home;
- Calculator opens project workspace;
- Job exposes distinct Proposal and Invoice destinations plus Summary / Change Orders / P&L;
- Proposal uses Quote path and Invoice uses T&M Invoice path; they remain separate customer-document flows;
- Catalog exposes Materials Catalog / Job Materials / Labor & Equip / Margins;
- More opens a hierarchical drawer/tree rather than navigating immediately;
- More tree includes Workers / Company / Code Reference / Help;
- `Aa`, compact header Print / Reset / Other, and contextual totals do not regress.

## RESIDENTIAL / COMMERCIAL PROJECT MODE

Verify:
- persistent selector exists in Project Calculator header;
- Residential retains existing calculator behavior;
- Commercial selection persists;
- Commercial mode clearly states current residential IRC-oriented references are not commercial compliance authority;
- Commercial mode blocks applying the residential-derived BOM to Job;
- no UI text claims a complete commercial code engine exists;
- local AHJ / adopted commercial mechanical / energy / fire / OEM verification boundary remains explicit.

Commercial-mode fail-closed behavior is acceptance scope; a complete commercial rules engine is NOT required in this cycle.

## SERVICE JOURNAL V3

Re-check end-to-end:
- calendar top layout;
- Day / Week / Month / Quarter archive;
- Add/Edit/Delete calls;
- compact saved call rows retain time/date/address/hours/status/description/price information;
- cancelled calls do not count as revenue;
- helpers hourly and fixed/day;
- payroll settings persist;
- employee take-home vs employer cost is distinct;
- TWC/FUTA/employee/employer FICA rates can be changed/disabled;
- V2 -> V3 migration does not carry old revenue FICA semantics forward;
- reload persistence and legacy migration are non-destructive.

## FINANCIAL / CALCULATOR REGRESSION GATES

Independently verify no regression to:
- Method A;
- Customer Price -> Job unitCost -> Quote;
- Your Cost -> procurementCostSnapshot -> P&L;
- actualCost override only;
- blank Your Cost fallback provenance;
- malformed financial values fail closed;
- zero remains valid/reviewable;
- calculator review UX;
- Code Rule Registry / Code Library;
- explicit Apply/Re-Apply snapshot semantics.

PR #26 remains separate/unmerged and must not be mutated as part of this audit.

## PWA / FINAL DIFF

```yaml
expected_cache: bruno-ac-v39
validated_run: 35040092200
validated_commit: 5ea77335613929d19f84dad41afe1dd8dbb93bc6
expected_ci_conclusion: SUCCESS
expected_post_ci_delta_to_target:
  - DELETE .github/workflows/main-nav-journal-v3-validation.yml
```

Independently verify exact final diff from rejected head `5d5506da...` and confirm temporary workflow is absent from final HEAD.

## BROWSER RUNTIME

Actual mobile/browser runtime is strongly preferred for navigation, More tree, backup event interception, project selector/commercial block, compact rows and persistence. If unavailable, report exactly `NOT_PERFORMED` and do not infer browser success from CI/static source.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_NAV_JOURNAL_V3_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

Write full report in audit workspace, update `LATEST_AUDIT.md` and `HANDOFF.md` per protocol.

AUDIT ONLY. Do not modify `main`, production code, PRs, or merge anything.
