# IMPLEMENTATION REPORT — MAIN NAV / JOURNAL V3 / BACKUP HARDENING

```yaml
task: MAIN_NAV_JOURNAL_V3
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
base_rejected_head: 5d5506da031e933773614a11e8e5377a478870f6
final_head: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
previous_audit: C_REJECT_REWORK_REQUIRED
previous_report: audits/history/MAIN_SERVICE_JOURNAL_V2_5d5506da031e933773614a11e8e5377a478870f6_20260915-1908.md
browser_runtime: NOT_PERFORMED
```

## OBJECTIVE

Close both prior P1 blockers while applying the requested mobile information architecture and Journal UX correction directly to `main`.

## PRIOR P1 CLOSURE

### F01 — FICA was incorrectly charged against service-call revenue

Corrected model:

```text
service call Gross
- optional Owner Tax Reserve (default OFF; planning reserve only)
- Helper gross wage
- Employer payroll taxes
= Cash After Crew
```

Employee-side payroll deductions affect `Crew Take-home`, not service-call revenue.

Default 2026 payroll estimate settings:

```yaml
employee_social_security: 6.20%
employee_medicare: 1.45%
employee_federal_income_tax_reserve: 0.00%
employer_social_security: 6.20%
employer_medicare: 1.45%
texas_unemployment_new_employer_estimate: 2.70%
futa_effective_estimate: 0.60%
social_security_wage_base: 184500
twc_wage_base: 9000
futa_wage_base: 7000
additional_medicare_employee_threshold: 200000
```

All rates are user-editable / disableable. TWC 2.70% is explicitly an estimate for a typical new employer; assigned rates can differ. FUTA 0.60% explicitly assumes the full state credit. Federal income-tax withholding is not guessed.

Primary sources used during implementation:
- IRS Topic 751: Social Security 6.2% employee + 6.2% employer; Medicare 1.45% employee + 1.45% employer; 2026 SS wage base $184,500; Additional Medicare withholding 0.9% after $200,000 employer threshold.
  https://www.irs.gov/taxtopics/tc751
- IRS Publication 15 (2026): FUTA 6.0% on first $7,000; maximum 5.4% credit may result in 0.6% effective rate.
  https://www.irs.gov/publications/p15
- Texas Workforce Commission employer estimator: first six calendar quarters generally new-employer rate 2.70%; Texas UI taxable wage base first $9,000 per employee.
  https://efte.twc.texas.gov/estimate_cbs_and_tax_rates.html

### F02 — Full app backup omitted Journal V2/V3 store

Added `app-backup-bridge.js`.

`Export App` now captures every localStorage key with prefix `bruno-ac-`, including:
- canonical job;
- company/profiles;
- UI preferences;
- catalog state;
- `bruno-ac-service-journal-v2` (schema now V3 inside same persistence key);
- room/calculator/history stores and future Bruno AC namespaced stores.

`Import App` validates the versioned backup and restores only `bruno-ac-*` keys. It never writes unrelated application storage keys.

Executable round-trip coverage is in `tests/app-backup-bridge.test.js`.

## JOURNAL V3

Changed `service-journal-ux.js` persistence schema to `schemaVersion: 3`, retaining the existing localStorage key for continuity.

Migration from V2 intentionally ignores the old `revenueTaxPct=7.65` as a revenue tax. Owner reserve defaults OFF / 0%.

Payroll ledger tracks cumulative same-name worker wages by calendar year for SS/TWC/FUTA wage-base estimation. Journal summary exposes:

```text
Calls
Hours
Gross
Owner Reserve
Crew Wages
Employer Payroll
Crew Take-home
Cash After Crew
```

Service-call rows and helper rows are materially more compact. Edit/Delete actions are inline icon controls; rows retain time/date/address/hours/status/description/price context.

## NAVIGATION / INFORMATION ARCHITECTURE

Primary mobile order is now:

```text
Journal | Calculator | Job | Catalog | More
```

Details:
- Journal remains fresh-load home.
- Calculator = project calculation workspace + Code Reference.
- Job = Proposal, Invoice, Summary, Change Orders, Profit & Loss.
- Proposal and Invoice remain distinct existing document/print paths (`quote` and `tm`).
- Catalog = Materials Catalog, Job Materials, Labor & Equip, Margins.
- More opens a hierarchical drawer/tree instead of immediately opening an unrelated page:
  - People & Company -> Workers / Company
  - Reference & Support -> Code Reference / Help

## RESIDENTIAL / COMMERCIAL PROJECT MODE

Project Calculator header now has persistent `Residential / Commercial` selector stored under `bruno-ac-project-context-v1`.

Safety boundary:
- Residential preserves the existing calculator behavior.
- Commercial mode is deliberately fail-closed against applying the current residential-derived BOM.
- Commercial mode displays an explicit warning that residential IRC-oriented references are planning references only and commercial work requires verification of adopted IMC/UMC/IFGC, applicable energy/fire requirements, local AHJ, and OEM requirements.

This cycle does NOT claim a complete commercial rules engine. The selector establishes project classification without reusing residential compliance claims as if they were commercial authority.

## PWA

```yaml
cache: bruno-ac-v39
new_precache_assets:
  - navigation-tree.css
  - app-backup-bridge.js
  - project-mode-bridge.js
```

## FINAL PRODUCTION DIFF FROM REJECTED HEAD

```text
ADD app-backup-bridge.js
ADD navigation-tree.css
MOD navigation-v2.js
ADD project-mode-bridge.js
MOD service-journal-ux.js
MOD sw-register.js
MOD sw.js
ADD tests/app-backup-bridge.test.js
MOD tests/service-journal-ux.test.js
```

Temporary CI workflow is NOT in final diff.

## VALIDATION

```yaml
run_id: 35040092200
validated_commit: 5ea77335613929d19f84dad41afe1dd8dbb93bc6
conclusion: SUCCESS
final_head: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
post_ci_delta:
  - DELETE .github/workflows/main-nav-journal-v3-validation.yml
```

CI passed:
- Service Journal payroll tests;
- full app backup round-trip tests;
- financial-integrity regression;
- calculator review UX regression;
- Code Rule Registry regression;
- syntax checks for all modified/new JS integration files.

## KNOWN LIMITS / AUDIT EMPHASIS

- Browser/mobile runtime after this exact final HEAD was NOT_PERFORMED by implementation agent.
- Commercial mode is classification + fail-closed safety boundary, not full commercial code automation.
- Payroll values are estimating aids; actual employer-specific TWC rate and employee federal withholding can differ.
- Independent audit must verify event interception for legacy Export App / Import App handlers and actual restore round trip.
- Independent audit must verify More drawer/mobile navigation and Commercial Apply block in browser if browser execution is available.
