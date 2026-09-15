# IMPLEMENTATION REPORT — MAIN SERVICE JOURNAL V2

```yaml
task_id: MAIN_SERVICE_JOURNAL_V2
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
base_before_this_cycle: 3fe244c01dcb84dcf5af60607ba2cce191e51a73
final_main_head: 5d5506da031e933773614a11e8e5377a478870f6
implementation_date: 2026-09-15
browser_runtime: NOT_PERFORMED
```

## USER-OBSERVED PROBLEM

Android screenshots showed the previous Service Call Journal rendering an editable call card but the aggregate day totals did not update when Gross/Tax changed. The previous page also consumed too much vertical space, persisted the old Dispatch-first workflow under More, and the floating `Aa` display control had been hidden by the compact-header change.

## IMPLEMENTED PRODUCT CHANGES

### 1. Service Journal is now the operational home

`navigation-v2.js` now defines the primary mobile/desktop navigation as:

```text
Journal -> Job -> Estimate -> AC Tools -> More
```

Journal contains:
- Service Journal
- Workers

More contains:
- T&M Invoice
- Profit & Loss
- Company
- Help

On a fresh page/app load, `dispatch` / Service Journal is opened explicitly as the home screen.

### 2. Journal rebuilt as V2 workflow

`service-journal-ux.js` now owns a dedicated persistent journal store:

```text
localStorage key: bruno-ac-service-journal-v2
schemaVersion: 2
```

If V2 data does not exist, the module imports legacy `bruno-ac-v1.dispatch.calls` once as migration input without deleting the legacy data.

The rebuilt page provides:

- calendar/date at the top;
- previous / next / Today controls;
- Day / Week / Month / Quarter archive views;
- Mon-Sun compact week strip with call count and gross amount;
- compact income cards;
- helper/crew payroll entries;
- modal Add/Edit Service Call flow;
- saved calls rendered as compact rows instead of permanent large edit forms;
- call Edit/Delete;
- helper Edit/Delete;
- one-time tax settings;
- persistent call and crew archive by date.

### 3. Income calculation semantics

For the selected Day/Week/Month/Quarter range:

```text
Gross Revenue = sum(non-cancelled call gross)
Revenue Tax Estimate = Gross - Revenue After Tax
Revenue After Tax = sum(call gross * (1 - applicable tax %))
Crew Gross Cost = daily rate OR hourly rate * entered hours
Helper Take-home = helper gross * (1 - applicable helper tax %)
Net After Crew = Revenue After Tax - Crew Gross Cost
```

Important semantic boundary:
- helper payroll is subtracted from owner/business daily net at GROSS payroll cost;
- helper take-home is shown separately after the helper tax estimate;
- therefore a helper assigned for $200/day with no calls produces `Net After Crew = -$200`, as requested;
- cancelled calls are excluded from revenue totals but remain archived.

### 4. Texas / Dripping Springs tax default

Fresh V2 state defaults to:

```yaml
location: Dripping Springs, TX
jurisdiction: TX
taxesEnabled: true
revenueTaxPct: 7.65
helperTaxEnabled: true
helperTaxPct: 7.65
```

The UI explicitly labels this as a SIMPLE ESTIMATE based on employee FICA only:
- Social Security employee share: 6.2%
- Medicare employee share: 1.45%
- total: 7.65%

Federal income-tax withholding is deliberately not guessed because it depends on worker withholding facts. The user can change the percentage or disable tax calculation. Texas state/local individual income tax is represented as zero in this simplified default.

Primary implementation reference used:
- IRS Publication 15 (2026): https://www.irs.gov/publications/p15
- IRS Topic 751: https://www.irs.gov/taxtopics/tc751

Auditor must independently verify current primary-source accuracy and ensure the UI does not present 7.65% as a complete personal tax liability.

### 5. `Aa` restored

`workspace-v5.js` no longer applies `workspace-prefs-hidden` to `#ui-prefs`. The compact floating `Aa` control is available again. Theme/Zoom actions remain duplicated under the compact `Other` menu for convenience.

### 6. PWA cache

`sw.js` cache revision:

```text
bruno-ac-v37 -> bruno-ac-v38
```

The rebuilt `service-journal-ux.js`, navigation, workspace shell, and existing app shell remain precached.

## PRODUCTION FILES CHANGED IN THIS CYCLE

```yaml
changed:
  - service-journal-ux.js
  - navigation-v2.js
  - workspace-v5.js
  - tests/service-journal-ux.test.js
  - sw.js
final_diff_excludes:
  - .github/workflows/journal-v2-validation.yml
```

No changes were made in this cycle to:
- financial-integrity-core.js
- Method A formulas
- Catalog Customer Price / Your Cost semantics
- AC Calculator engine
- Code Library registry
- Quote document calculations

## EXECUTABLE VALIDATION

Temporary validation workflow:

```yaml
run_id: 35037896673
validated_commit: 426d2938031b6bb5fd933c6751f0b78b74caac99
conclusion: SUCCESS
steps:
  - node tests/service-journal-ux.test.js
  - node tests/financial-integrity.test.js
  - node tests/ac-calculator-review-ux.test.js
  - node --check service-journal-ux.js
  - node --check navigation-v2.js
  - node --check workspace-v5.js
```

After successful validation the temporary workflow was deleted. Expected delta:

```text
426d2938031b6bb5fd933c6751f0b78b74caac99
-> 5d5506da031e933773614a11e8e5377a478870f6
DELETE .github/workflows/journal-v2-validation.yml only
```

Auditor must independently verify this comparison.

## TEST COVERAGE ADDED

`tests/service-journal-ux.test.js` now covers:
- Day/Week/Month/Quarter range boundaries;
- 7.65% revenue-tax calculation;
- daily + hourly helper payroll;
- helper take-home tax calculation;
- negative daily net when a helper is paid with zero service-call revenue.

Fixture:

```text
Calls: $200 + $300 = $500 gross
Revenue tax 7.65% = $38.25
Revenue after tax = $461.75
Crew gross = $180/day + 8h*$20 = $340
Crew take-home = $313.99
Net after crew = $121.75
```

No-call fixture:

```text
Revenue after tax = $0
Helper fixed/day = $200
Net after crew = -$200
```

## KNOWN LIMITS / AUDIT FOCUS

```yaml
browser_runtime: NOT_PERFORMED
legacy_migration:
  behavior: import legacy dispatch calls only when V2 key is absent
  destructive: false
journal_storage:
  storage_key: bruno-ac-service-journal-v2
  separate_from_legacy_job_state: true
full_app_export_integration: NOT_ADDED_IN_THIS_CYCLE
payroll_model:
  tax_model: simplified_estimate
  federal_income_withholding_auto_calculation: intentionally_not_implemented
  employer_payroll_tax_burden: not_modeled
```

The separate V2 storage means current Export App / Import App does not yet include this V2 journal key. Auditor should classify whether this is a blocker based on existing backup/product expectations, not silently assume coverage.

## REQUIRED INDEPENDENT AUDIT EMPHASIS

Audit exact final main HEAD `5d5506da031e933773614a11e8e5377a478870f6` and independently verify:

1. Journal is the first/home page on fresh app load.
2. `Aa` is visible and usable on mobile while compact header remains intact.
3. Add Service Call -> modal -> Save -> compact archived row.
4. Edited call values immediately change range totals after Save.
5. Multiple calls remain compact and independently editable/deletable.
6. Helper hourly and fixed/day semantics.
7. Helper cost makes owner net negative with zero revenue.
8. Helper take-home tax toggle / override / global default.
9. Revenue tax toggle / override / global default.
10. Calendar Day/Week/Month/Quarter archive correctness.
11. Persistence across reload.
12. Legacy call migration is non-destructive.
13. No regression to financial integrity / Calculator / Quote / Catalog lifecycle.
14. PWA cache update and offline asset coherence.
15. Independent verification of IRS 2026 6.2% + 1.45% source claim and UI limitation language.
16. Whether missing Export App integration for `bruno-ac-service-journal-v2` is material to acceptance.

If browser execution is unavailable, report `NOT_PERFORMED` exactly; do not infer mobile success from source or CI.