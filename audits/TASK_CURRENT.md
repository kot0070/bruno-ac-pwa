# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_reports:
  - audits/implementation/PR27_PROJECT_ESTIMATOR_WIZARD_cf856a30.md
previous_reject_report: audits/history/MAIN_NAV_JOURNAL_V3_84b0da0de9029fb5f6182580dcd6b8185fda9fae_20260915-1935.md
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
task_id: PR27_PROJECT_ESTIMATOR_WIZARD_AUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: FEATURE_PR
production_pr: 27
production_branch: feature/project-estimator-wizard-v1
base_main: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
target_head: cf856a30b2f9cdcb9d61373d3472fef31b9e7343
status: ACTIVE
```

## OBJECTIVE

Perform an independent adversarial audit of PR #27 exact HEAD `cf856a30b2f9cdcb9d61373d3472fef31b9e7343`.

Do not limit review to the previous four blockers. Re-check the complete staged estimator, Job financial lifecycle, Journal corrections, backup restore boundary, Commercial fail-closed behavior, PWA and regressions.

## REQUIRED PROJECT-ESTIMATOR FLOW

Verify the actual product architecture is:

```text
1 Compact Project Setup
-> 2 Rooms / Zones
-> 3 Code / Design Baseline
-> 4 Live Materials / Final overrides / Catalog extras
-> 5 Full Technical Calculator
-> explicit Apply to Job
```

Required behavior:

- the old long technical form is hidden on initial Calculator entry;
- first screen is compact and supports Residential/Commercial, total square footage, system and minimum project context;
- room/zone rows support type, quantity and optional area;
- Residential and Commercial room catalogs are appropriate and independently switchable;
- initial calculation clearly distinguishes real/represented minimums from design recommendations and required field measurements;
- no universal code minimum is invented for supply-register or return-grille counts;
- line-set and condensate lengths are not inferred from square footage;
- rule/source identifiers are visible for code/design traceability;
- Full Technical Calculator opens only after the project baseline stage exists;
- full calculator is prefilled from project Final quantities where mapped.

## LIVE OVERRIDE / COMPLIANCE

Independently verify:

- material rows expose Minimum / Calculated / Final;
- Final edits recalculate project state live;
- Final below a represented hard minimum becomes danger/red and blocks readiness;
- missing required field input blocks readiness;
- changes propagate into the full calculator inputs/BOM instead of leaving a stale Apply state;
- full calculator Apply cannot proceed while the staged project is blocked;
- no blocked edit leaves an older valid BOM silently applicable.

## CATALOG / PRICING / JOB LIFECYCLE

Verify Add from Catalog end-to-end:

```text
Catalog item
-> project extra + quantity
-> full calculator resolved BOM
-> Customer Price / Your Cost
-> explicit Apply
-> Job snapshot
```

Re-check accepted invariants:

- Catalog `unitCost` -> Calculator `customerUnitPrice` -> Job `unitCost` -> Quote;
- Catalog `yourCost` -> Calculator `yourUnitCost` -> Job `procurementCostSnapshot` -> P&L;
- blank Your Cost fallback remains `customer-price-fallback`;
- malformed financial values fail closed;
- zero remains valid/reviewable;
- Catalog edits do not retroactively change Job snapshots until explicit Apply/Re-Apply;
- Actual Cost precedence remains P&L-only;
- Method A does not regress;
- manually added Job Materials are not unintentionally deleted.

## RESIDENTIAL / COMMERCIAL BOUNDARY

Commercial mode is intentionally NOT a complete commercial rules engine in this cycle.

Verify:

- Commercial mode clearly identifies the commercial mechanical/energy/fire/AHJ/OEM design boundary;
- residential IRC-oriented checks are not presented as complete commercial compliance;
- Commercial Apply is blocked inside the authoritative `ac-calculator.js` Apply path;
- opening `ac-calculator.html` standalone cannot bypass the Commercial block;
- iframe/project-mode bridge does not become the only enforcement layer;
- switching back to Residential restores normal eligible behavior only when the project is otherwise ready.

## PREVIOUS P1 BLOCKERS — MUST RECHECK

### F02 — full-app Journal restore validation

Before any restore writes:

- Journal JSON must parse;
- supported Journal schema/version must be enforced;
- expected settings/calls/crew shape must be validated;
- schema 4 stable-worker shape must be validated;
- malformed/unsupported Journal payload must fail closed;
- valid full backup export -> empty/new storage -> import preserves Journal data and other Bruno stores;
- unrelated localStorage keys remain excluded/not overwritten.

### F03 — Commercial standalone bypass

Verify exact standalone path cannot Apply a residential-derived BOM when current project type is Commercial.

### F04 — Month / Quarter archive navigation

Verify calendar-period movement rather than fixed-day stepping, including:

- Jan 31 -> February without skipping March;
- leap/non-leap February handling;
- Q4 -> next Q1 across year boundary;
- Q1 -> previous Q4;
- Day/Week behavior remains correct.

### F05 — payroll stable employee identity

Verify:

- schema 4 has stable `workers[].id`;
- crew entries reference `workerId`;
- payroll YTD SS/TWC/FUTA ledger is keyed by year + stable workerId, not display name;
- two same-name workers do not share wage bases;
- renaming a worker does not reset wage bases;
- new worker creation remains stable across multiple daily crew entries;
- legacy migration is non-destructive and any unavoidable ambiguity is documented rather than silently treated as exact historical identity.

## JOURNAL FINANCIAL SEMANTICS

Re-check that employee FICA is not a tax on service-call revenue.

Required model:

```text
Gross service revenue
- optional owner reserve (default OFF)
- employer crew cost (gross wages + employer payroll estimates)
= Cash After Crew
```

Employee deductions affect take-home separately.

## PWA / OFFLINE

Expected cache:

```text
bruno-ac-v40
```

Verify estimator JS/CSS/core, project-mode bridge, Journal, backup bridge, Code Library and calculator assets are coherent in the app shell. Actual offline runtime is preferred; if unavailable do not infer success from static source.

## CI / FINAL HEAD EVIDENCE

```yaml
validated_run: 35042103577
validated_commit: ad1cb2ff96bf1eee78e79e84804afe7c0f4a118c
expected_conclusion: SUCCESS
final_target: cf856a30b2f9cdcb9d61373d3472fef31b9e7343
expected_post_ci_delta:
  - DELETE .github/workflows/pr27-project-estimator-validation.yml
```

Independently verify run steps and compare validated commit to final target.

## BROWSER RUNTIME

Actual mobile/browser runtime is strongly preferred because this task is primarily staged UX + live-state integration. Test at least:

- initial compact screen;
- add/remove room;
- switch Residential/Commercial;
- calculate baseline;
- Final edit below minimum and back above minimum;
- required field input;
- Catalog search/add extra;
- open full calculator;
- Commercial standalone Apply guard;
- reload persistence;
- Journal month/quarter navigation and worker selection.

If browser runtime is unavailable, report exactly:

```text
NOT_PERFORMED
```

Do not infer browser success from CI/static inspection.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/PR27_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

Write the full report in the audit workspace and update `LATEST_AUDIT.md` / `HANDOFF.md` per protocol.

AUDIT ONLY. Do not modify production branch, PR #27, `main`, production code, or merge anything.
