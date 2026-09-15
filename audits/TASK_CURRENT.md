# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_reports:
  - audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
  - audits/implementation/PR26_LIVE_CODE_ESTIMATOR_5b069931.md
  - audits/implementation/PR26_HISTORY_LEVELS_43cbc681.md
protocol_required: true
```

# MODE GUARD — AUDIT ONLY

```yaml
task_type: AUDIT
production_write_forbidden: true
active_PR_mutation_forbidden: true
merge_forbidden: true
audit_exact_head_required: true
```

```yaml
task_id: PR26_LIVE_HISTORY_LEVELS_ACCEPTANCE_03
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
target_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
obsolete_heads:
  - a04915f472679866ff941d0fb7b4b8752519becb
  - 5b069931eaf98311f31d344c1acd6cc8e5553ade
status: ACTIVE
```

## OBJECTIVE

Audit PR26 as one complete end-to-end feature:

```text
Building / room inputs
-> layered live evaluation L0-L6
-> code/design traceability
-> calculated baseline
-> override + reason
-> compliance state
-> final quantity
-> BOM/components
-> current Catalog pricing
-> explicit Apply to Job
-> Confirm & Save Calculation
-> active frozen snapshot
-> history
-> duplicate/import/export
```

Do not scope the audit only to helper functions. Independently inspect the whole user flow and all prior regression surfaces.

## LIVE LEVEL MODEL

Expected levels:

```yaml
L0: Raw inputs
L1: Normalized building / room model
L2: Code / design requirements
L3: Calculated baseline
L4: Override / compliance
L5: BOM / components
L6: Catalog / pricing
L7: Confirmed snapshot / history
```

Verify:
- room/building changes classify as upstream dirty changes;
- override-only changes classify at L4;
- no-change returns no dirty level;
- UI level rail is truthful;
- implementation does NOT falsely claim partial execution if existing calculator still performs full Calculate for BOM/pricing;
- no event/click recursion or stale ready state.

## LIVE CALCULATOR / COMPLIANCE

Verify all prior PR26 requirements remain true:
- sqft / room count never infer compliant tonnage;
- no claim of performing Manual J/S/D;
- planning defaults are not presented as code minimums;
- unknown numeric minimum is not fabricated;
- known hard minimum violation is red/blocking with rule/source traceability;
- unresolved design input cannot silently become compliant/final zero;
- valid final quantities update existing BOM and current Catalog pricing live;
- live preview never calls Apply or mutates Job materials.

## HISTORY / ACTIVE SNAPSHOT

New files:

```yaml
- calculation-history-core.js
- calculation-history-ux.js
- tests/calculation-history-core.test.js
```

Verify Confirm & Save requires a valid current calculation and creates an immutable-by-value historical snapshot containing:
- room plan / overrides;
- compliance/check state;
- selected BOM rows;
- Customer Materials;
- Your Cost;
- Margin / Margin %;
- catalog captured timestamp;
- code library identity.

The active snapshot should be visible near the top and clearly distinguish frozen historical pricing from the current live preview.

## DUPLICATE / REUSE

Verify `Duplicate as new`:
- does not mutate original snapshot;
- restores room/building inputs and override provenance into an editable calculation;
- does not automatically overwrite Job data;
- live calculator then uses current Catalog prices rather than silently reusing old historical prices;
- source calculation identity can be traced where implemented.

## IMPORT / EXPORT

Verify:
- export one calculation produces supported JSON snapshot format;
- export history produces supported bundle format;
- import supports single snapshot and bundle;
- imported records receive new IDs and do not overwrite existing snapshots;
- malformed/unsupported import fails non-destructively;
- partial bundle errors do not corrupt valid existing history;
- imported historical prices remain frozen records;
- importing does not automatically Apply to Job.

## STORAGE / PERSISTENCE

Expected additive path:

```text
state.acCalculator.calculationHistory
```

Audit compatibility with existing:

```text
state.acCalculator.roomEstimator
state.acCalculator.inputs
generatedAt
materialsUsed
catalog
```

Verify history writes cannot corrupt financial/job schema and that existing successful-Apply gating for room-estimator persistence remains intact.

## FINANCIAL / CATALOG REGRESSION

Must remain true:

```yaml
customer_track: Catalog.unitCost -> Calculator.customerUnitPrice -> Job.unitCost -> Quote
internal_track: Catalog.yourCost -> Calculator.yourUnitCost -> Job.procurementCostSnapshot -> PnL
actual_track: Job.actualCost -> PnL override only
```

Historical snapshot price display must not become an alternate pricing authority for a new live calculation. Re-run accepted financial/lifecycle tests including malformed values, zero price review, blank Your Cost fallback, and catalog-edit/reapply lifecycle.

## CODE / SOURCE TRACEABILITY

Retest:
- Texas 2026 registry validity;
- IRC M1401.3 source correction;
- ACCA Manual D is design reference, not numeric code minimum;
- LOCAL-AHJ verification remains explicit;
- live source buttons resolve current ruleIds and use HTTPS / noopener;
- no full copyrighted code/manual text added.

## PWA / OFFLINE

Expected cache:

```yaml
cache: bruno-ac-v39
new_required_assets:
  - ./room-estimator-live.js
  - ./calculation-history-core.js
  - ./calculation-history-ux.js
```

Verify all previously accepted critical assets remain in shell and syntax/fetch behavior is intact.

## FINAL DIFF

Independently compare `main` to target HEAD. Expected PR26 production diff currently has 14 files and no temporary workflow. No `.github/workflows/pr26-*-validation.yml` may remain.

## CI EVIDENCE

Latest authoritative validation:

```yaml
run_id: 35030476333
validated_commit: 4eaaecea6922e73a10e0bf09ecb9b6da9bc63bb4
expected_result: SUCCESS
```

Expected successful tests include:
- room estimator / level dependencies;
- calculation history core;
- code registry;
- financial integrity;
- calculator pricing;
- PR22 lifecycle;
- calculator review UX;
- Service Call Journal;
- syntax checks for live/history/SW.

Compare validated commit to exact target HEAD `43cbc681f579b4009cc55674c4db7507d0910a7c`. Expected only post-CI change is deletion of `.github/workflows/pr26-history-levels-validation.yml`.

## BROWSER / MOBILE RUNTIME

If available, actually test on mobile-width runtime:
- create/edit room plan;
- observe live L-level/status/BOM/pricing updates;
- confirm a valid calculation;
- verify active summary at top;
- create at least two history records;
- activate older snapshot;
- duplicate older snapshot and change one input;
- verify old snapshot price remains frozen while new live preview uses current state;
- export single/history JSON;
- import exported JSON;
- verify new IDs/no overwrite;
- attempt malformed import;
- verify Job materials unchanged before explicit Apply;
- no console/event loops.

If runtime unavailable, report exactly `NOT_PERFORMED`.

## ACCEPTED REGRESSION SURFACE

No regression allowed in PR22 financial integrity, PR23 calculator review UX, PR24 Service Call Journal, PR25 Code Library, Quote Method A, P&L precedence, Catalog snapshot lifecycle, localStorage compatibility, navigation, or PWA shell.

## SEVERITY

```yaml
P0:
  - financial corruption or job data loss
  - history/import overwrites existing Job financial data
  - silent hard-minimum violation treated compliant
  - sqft/rooms drive fake compliant tonnage
P1:
  - live final quantity does not reprice through existing Catalog path
  - historical price reused as current pricing authority on duplicate
  - confirm saves invalid/unresolved calculation as valid
  - duplicate/import mutates original snapshot
  - malformed import corrupts storage
  - active/history UI materially misrepresents current vs frozen state
  - recursive event loop / stale ready state
  - required history/live assets missing offline
  - accepted financial/product regression
P2:
  - minor copy/layout/history metadata issue without financial/compliance/workflow impact
```

## REQUIRED REPORT

```yaml
report_path_template: audits/history/PR26_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
minimum_sections:
  - Executive_Verdict
  - Repository_State
  - Exact_Audited_SHA
  - Final_Diff
  - Live_Level_Model
  - Building_And_Room_Model
  - Compliance_And_Source_Traceability
  - Baseline_Override_Final
  - BOM_And_Current_Catalog_Pricing
  - Confirmed_Snapshot_And_Active_Summary
  - History_Duplicate_Import_Export
  - Storage_And_Persistence
  - Financial_Regression_Gates
  - PWA_Offline_Delivery
  - Test_CI_Evidence
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After report write update `audits/LATEST_AUDIT.md` and `audits/HANDOFF.md` per protocol.

Return only VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT.

Do not modify PR26 production code. Do not merge.
