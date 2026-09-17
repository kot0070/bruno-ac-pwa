# BRUNO AC — FULL USER-FLOW / DATA-FLOW / CALCULATION INTEGRITY MASTER

```yaml
master_id: FULL_USER_FLOW_INTEGRITY_MASTER_01
repository: kot0070/bruno-ac-pwa
production_branch: main
workspace_branch: audit/pr22-603cbca
master_branch: audit/full-user-flow-integrity-master
status: AUTHORIZED_ACTIVE
user_approved: true
approved_on: 2026-09-16
starting_accepted_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
objective: Prove the application behaves coherently as one connected system from user input through calculations, persistence, dependent modules, reload, export/import and runtime recovery.
```

## Why this Master exists
Prior source/code/unit audits can pass while a real user still encounters a button that does nothing, a module that pulls the wrong state, stale values after navigation/reload, mismatched totals between modules, incorrect cross-module propagation, or calculations that are internally valid but inconsistent with what downstream screens display. This Master treats Bruno AC as an end-to-end product, not as isolated files/functions.

## Core acceptance principle
A feature is not accepted because its code exists or a unit test passes. It is accepted only when the complete observable chain is proven:

`user action/input -> UI state -> persisted state -> calculation/engine -> dependent module(s) -> displayed result -> reload/reopen -> export/import/offline recovery`

Where a workflow crosses modules, the value and semantic meaning must remain consistent at every boundary.

## Audit dimensions
1. User-flow correctness: every visible control performs the intended action and opens/updates the intended surface.
2. Data-flow integrity: data entered in one module reaches every dependent module that is supposed to consume it, and nowhere it should not.
3. Calculation integrity: displayed totals, margins, labor/equipment/material values, quote/invoice/P&L numbers, calculator outputs and derived values reconcile with authoritative formulas and source state.
4. Cross-module reconciliation: the same business fact must agree across Proposal, Invoice, Summary, Materials, Labor & Equipment, Margins, Change Orders, P&L, Calculator, Service Journal and related views where applicable.
5. Persistence integrity: save/autosave/localStorage -> navigation -> reload -> app restart retains the correct current state without stale or ghost values.
6. Import/export/backup integrity: exported data round-trips back into the product without changing meaning, structure, totals or active context.
7. Error/fail-closed behavior: invalid, missing, malformed or incompatible data must produce a safe, explicit state and must not silently overwrite valid data.
8. Runtime integrity: no uncaught page errors, critical console errors, detached event handlers, duplicate hidden controls intercepting interaction, or stale UI mirrors.
9. Responsive/mobile integrity: critical workflows must remain actionable and semantically identical in desktop Chromium and mobile Chromium viewport.
10. PWA/offline integrity: supported workflows continue to use the intended cached/runtime data model and recover correctly when connectivity/state changes.

## Required full-application coverage

### A. Global shell / navigation / actions
- Journal, Calculator, Code Reference, Job, Catalog, More groups.
- All sub-tabs and More drawer destinations.
- Print menus, Reset, New blank job, Job export/import, App export/import, theme/zoom/display preferences.
- Back/forward/reload behavior and active surface restoration where intended.

### B. Job lifecycle
- Create blank job.
- Enter customer/job/HVAC/business values.
- Navigate away and back.
- Reload and verify exact values.
- Modify existing job and ensure no unrelated fields reset.
- Verify structurally valid primary storage at each step.
- Confirm current-job context is the same across all dependent modules.

### C. Proposal / Quote
- Inputs, line items, taxes/fees/markup/discount or applicable pricing controls.
- Calculated subtotal/total and live totals.
- Materials/labor/equipment contributions reconcile with source modules.
- Print/export-facing values equal on-screen accepted values.

### D. Invoice / T&M
- Labor, material and equipment billing inputs.
- T&M totals and any tax/markup logic.
- Cross-check source job/material/labor data.
- Persistence and print output integrity.

### E. Summary
- Overhead and other summary controls.
- Source totals pulled from materials/labor/equipment/quote.
- Derived totals recomputed correctly after upstream changes.
- No stale totals after navigation/reload.

### F. Change Orders
- Create/edit/remove change order.
- Verify effect on totals and any downstream Proposal/Summary/P&L values.
- Reload persistence and export/import round-trip.

### G. Profit & Loss
- Revenue/cost inputs and derived gross profit/net/margin values.
- Reconcile against Quote/Invoice/Materials/Labor/Equipment/Change Orders where applicable.
- No duplicate counting and no stale snapshot use.

### H. Materials Catalog / Job Materials / Margins
- Search/filter/catalog selection.
- Add material to Job Materials.
- Quantity, customer price, your cost and extension calculations.
- Zero/invalid/unresolved pricing behavior.
- Material margin dollars/% reconcile with Summary/P&L/Quote where applicable.
- Remove/edit line and prove all downstream totals update.

### I. Labor & Equipment
- Add/edit/remove labor/equipment rows.
- Hours/rates/extensions and any burden/markup calculations.
- Reconcile with Quote/Summary/P&L/T&M.
- Persistence and reload.

### J. Project Calculator
- Residential/commercial project context.
- Building/envelope/load/equipment/electrical/mechanical/BOM/compliance inputs and outputs.
- Package, mini-split, repair/new/replace mode-specific behavior.
- Required/fail-closed compliance gates.
- Generated BOM -> Apply to Job Materials -> downstream Quote/Summary/P&L reconciliation.
- Project context and calculator plan persistence.

### K. Code Reference / compliance provenance
- Reference surface opens and relevant rules are retrievable.
- Calculator/compliance warnings correspond to project type/jurisdiction/source provenance.
- No residential authority presented as commercial authority.
- Local/AHJ/OEM-required verification remains explicit where the product cannot determine a final answer.

### L. Service Journal
- Create/edit/delete service call.
- Date/view navigation day/week/month/quarter.
- Worker/crew/payroll entries.
- Gross, reserve, payroll, employer cost and net calculations reconcile with stored data.
- Invalid journal storage fail-closed behavior.
- Reload persistence.

### M. Workers / Company profile
- Create/edit/select worker/company profile where supported.
- Active profile data propagates to print/quote/invoice/company-facing surfaces as intended.
- No leakage from inactive profile.

### N. Backup / import / export
- Job export -> import round-trip.
- Full-app export -> import round-trip.
- Preserve current job, catalog, journal, profiles/settings and supported module state.
- Reject malformed/wrong-product backup before mutation.
- Verify totals/state after restore equal pre-export state.

### O. Corruption / recovery / negative cases
- Invalid JSON in primary storage.
- Structurally invalid primary Job.
- Invalid Service Journal storage.
- Wrong-product payload.
- Missing required arrays/objects.
- Confirm safety locks prevent destructive overwrite.

### P. Offline / PWA
- First online load and service-worker control.
- Reload while served from cache/runtime where supported.
- Critical navigation and stored-job access offline.
- Cache/version upgrade does not restore stale business state.

## Cross-module reconciliation matrix
For every authoritative value changed in a source module, record expected dependent destinations and compare actual values after mutation and reload. Minimum matrix includes:
- Material customer total -> Quote / Summary / P&L / T&M where applicable.
- Material your-cost total -> Summary / P&L.
- Labor/equipment total -> Quote / Summary / P&L / T&M where applicable.
- Change-order value -> customer/project totals and P&L where applicable.
- Calculator BOM -> Job Materials -> Summary/Quote/P&L.
- Customer/job/company identity -> Proposal/Invoice/print surfaces.
- Overhead/margin inputs -> every derived total that consumes them.

Any disagreement is a finding even when each individual module's local calculation appears valid.

## Execution phases
P00 — exact-main baseline, complete visible-control and state-key inventory.
P01 — user-flow map and authoritative source-of-truth/data dependency graph.
P02 — global navigation/action/runtime browser sweep.
P03 — Job + Proposal + Summary integrity.
P04 — Catalog + Job Materials + Margins integrity.
P05 — Labor/Equipment + Invoice/T&M integrity.
P06 — Change Orders + P&L cross-reconciliation.
P07 — Project Calculator full workflow + generated BOM apply/reconciliation.
P08 — Code Reference/compliance provenance and fail-closed verification.
P09 — Service Journal + Workers + Company profile workflows.
P10 — Backup/import/export/recovery/corruption negative testing.
P11 — Offline/PWA/mobile runtime and reload/state-upgrade testing.
P12 — full cross-module golden-scenario run from empty job to completed estimate/invoice/P&L.
P13 — independent reconciliation pass and defect closure loop.
P14 — exact-main-head final Browser E2E + regression + Pages evidence and final acceptance report.

## Golden scenario requirement
At least one complete realistic job must be created entirely through the UI and driven through the entire product:
1. Create job.
2. Enter project/customer data.
3. Configure calculator and calculate.
4. Apply generated BOM.
5. Add/edit manual materials.
6. Add labor/equipment.
7. Produce Proposal totals.
8. Create/change order.
9. Verify Summary and P&L.
10. Create T&M/Invoice state if applicable.
11. Add relevant Service Journal record.
12. Reload and re-verify all linked values.
13. Export full app.
14. Reset/clear to a safe test state.
15. Import backup.
16. Re-verify the same linked values and totals.
17. Run mobile flow on critical subset.

## Defect classification
- P0: destructive data corruption, silent overwrite, unsafe wrong-product mutation, or unusable critical product path.
- P1: wrong calculation, wrong cross-module value, broken primary button/workflow, lost persistence, or material compliance/source-of-truth mismatch.
- P2: stale/incorrect secondary UI state, non-critical broken interaction, misleading derived display, responsive defect that blocks a secondary path.
- P3: cosmetic/non-blocking presentation issue.

## Acceptance gate
`A_ACCEPT` is forbidden until all of the following are true:
- full user-flow inventory has coverage status;
- all P0/P1 and release-blocking P2 findings are closed;
- golden scenario passes end-to-end;
- cross-module reconciliation matrix passes;
- persistence/reload and backup round-trip pass;
- corruption/fail-closed negative tests pass;
- critical desktop and mobile browser flows pass;
- exact production `main` HEAD has green Browser E2E/regression evidence and successful Pages deployment;
- final report records any remaining explicitly accepted non-blocking gaps.

## Governance note
The ongoing `FULL_APP_BROWSER_E2E_MASTER_01` remains a supporting execution layer. This Master is broader: Playwright is evidence collection and regression enforcement, while the objective here is semantic correctness of the whole connected application.
