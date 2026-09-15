# PR26 IMPLEMENTATION REPORT — ROOM-BASED CODE-DRIVEN ESTIMATOR

```yaml
report_type: implementation
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
implementation_head: a04915f472679866ff941d0fb7b4b8752519becb
status: READY_FOR_INDEPENDENT_AUDIT
merged: false
draft: true
browser_runtime: NOT_PERFORMED
```

## USER INTENT

Implement the next major estimator phase as one large coherent block rather than small isolated patches:

```text
Building profile
  -> Room schedule
  -> Code/design traceability
  -> Calculated planning/takeoff baseline
  -> Contractor/customer override with reason
  -> Final quantity
  -> Existing AC Calculator BOM
  -> Existing Catalog Customer Price / Your Cost
  -> Existing material margin / Apply lifecycle
```

The user explicitly requested the ability to see the baseline, increase it for customer/contractor preference, and have final material pricing recalculate from the Catalog.

## PR25 BASELINE

PR25 Code Library / Rule Registry was independently accepted at:

```yaml
accepted_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
verdict: A_ACCEPT
report: audits/history/PR25_90ebe4d2408a7b0af7e6e7671540f632585a8804_20260915-1635.md
```

PR25 was then merged to `main` under explicit user direction:

```yaml
main_merge_commit: e84c9e9b6c53693d087db46156975ffec93d238a
```

PR26 is based exactly on that merged main commit.

## FINAL PRODUCTION DIFF

Exactly ten files differ from `main`:

```yaml
modified:
  - ac-calculator.html
  - code-library/texas-hvac-2026.json
  - code-rule-registry.js
  - sw.js
  - tests/code-rule-registry.test.js
added:
  - room-estimator-engine.js
  - room-estimator-persistence.js
  - room-estimator-preload.js
  - room-estimator-ux.js
  - tests/room-estimator-engine.test.js
```

No temporary `.github/workflows/**` file remains in the final diff.

## ROOM / BUILDING MODEL

`room-estimator-engine.js` version `1.0.1` introduces:

```yaml
building_inputs:
  - sqft
  - stories
  - ceilingHeight
  - location
  - foundation
  - ductScope
  - returnGrillesDesign
  - notes
room_types:
  - kitchen
  - bedroom
  - living_room
  - bathroom
  - garage
  - laundry
  - office
  - other
per_room_inputs:
  - count
  - areaEach
  - conditioned
  - supplyPerRoom
  - branchFtPerRoom
  - exteriorWalls
  - windows
```

Room-area total is reconciled against building square footage. A difference greater than 15% is flagged for verification.

## CAPACITY / LOAD SAFETY BOUNDARY

PR26 intentionally does **not** convert square footage or room counts into equipment tonnage.

The estimator generates an explicit equipment-sizing check tied to:

```yaml
rule_id: IRC-M1401.3-EQUIPMENT-SIZING
behavior:
  - square_footage_does_not_auto_select_tonnage
  - room_count_does_not_auto_select_tonnage
  - approved_load_calculation_path_required
  - Manual_J_or_AHJ_accepted_load_result_must_be_verified
```

The existing AC Calculator disclaimer that it does not perform Manual J / Manual S / Manual D remains present.

## ROOM-BASED QUANTITY MODEL

The first implemented final-quantity metrics are:

```yaml
- supplyRegisters
- ductFt
- returnGrilles
```

### Supply registers

If per-room supply count is blank, the engine applies an explicit **planning default** by room type. These values are never labeled as a code minimum.

The default planning table is implementation convenience for takeoff only:

```yaml
kitchen: 1
bedroom: 1
living_room: 1
bathroom: 1
garage: 0
laundry: 1
office: 1
other: 1
```

Large-room adjustments remain planning assumptions, not compliance conclusions.

### Duct footage

For new/replacement duct scope, calculated baseline is the sum of entered room branch/run lengths. If conditioned rooms lack required takeoff lengths, duct footage stays unresolved and blocks synchronization into the final BOM.

### Return grilles

Return count is deliberately not guessed from square footage or number of rooms. For new/replacement duct scope, an explicit design input or documented override is required. Existing-duct mode does not invent a return quantity.

## BASELINE / OVERRIDE / FINAL PROVENANCE

Each estimator metric carries:

```yaml
- codeMinimum
- hardMinimum
- calculatedBaseline
- baselineType
- ruleIds
- override.value
- override.reason
- override.note
- finalQuantity
- finalSource
```

Supported override reasons:

```yaml
- customer_request
- contractor_choice
- field_condition
- design_upgrade
- existing_condition
- other_documented_reason
```

Generic enforcement exists so a future metric with `hardMinimum: true` cannot silently accept an override below its known `codeMinimum`.

For the current supply/duct/return metrics, `codeMinimum` remains `null` where no defensible universal numeric minimum is represented. The estimator therefore does not fabricate a code value merely to fill the UI.

An override without a documented reason produces a warning.

## EXISTING AC CALCULATOR / CATALOG INTEGRATION

When the room estimator is enabled and its required design/takeoff inputs are resolved, final quantities synchronize to the existing calculator inputs:

```yaml
room_estimator_final:
  supplyRegisters -> AC_Calculator.supplyRegisters
  ductFt -> AC_Calculator.ductFt
  returnGrilles -> AC_Calculator.returnGrilles
  sqft -> AC_Calculator.sqft
```

The existing AC Calculator then remains authoritative for:

```text
final quantity
  -> generated requirement/BOM
  -> Catalog matching
  -> Customer Unit Price
  -> Customer Extension
  -> Your Unit Cost
  -> Your Extension
  -> Material Margin
  -> explicit Apply to Job Materials
```

PR26 does not reimplement quote pricing or the Customer Price / Your Cost financial architecture.

## PERSISTENCE LIFECYCLE

`room-estimator-persistence.js` stores the room estimator snapshot additively at:

```text
state.acCalculator.roomEstimator
```

Persistence is gated to successful existing Calculator Apply behavior:

1. capture the existing `state.acCalculator.generatedAt` value before Apply;
2. allow the existing authoritative Apply handler to run;
3. after the click, re-read storage;
4. persist room estimator provenance only if `generatedAt` changed to a new non-empty value.

Therefore a blocked/cancelled Apply does not independently mutate room-estimator persistence.

`room-estimator-preload.js` restores saved room estimator `sqft` and `ductScope` before room UI initialization so the saved room-plan building context is not overwritten by generic defaults.

A separate room-plan JSON export is provided.

## CODE LIBRARY / TRACEABILITY

PR26 extends the accepted PR25 registry with:

```yaml
rule_id: ACCA-MANUAL-D-2016
family: ACCA-DESIGN
source_authority: Air Conditioning Contractors of America
source: https://www.acca.org/standards/technical-manuals/manual-d
```

The implementation summary explicitly distinguishes room takeoff/planning quantities from Manual D design outputs and does not copy protected Manual D text.

New rule mappings include:

```yaml
equipment-sizing:
  - IRC-M1401.3-EQUIPMENT-SIZING
duct-design:
  - ACCA-MANUAL-D-2016
  - LOCAL-AHJ-VERIFY
duct:
  - ACCA-MANUAL-D-2016
  - LOCAL-AHJ-VERIFY
supply-registers:
  - ACCA-MANUAL-D-2016
  - LOCAL-AHJ-VERIFY
return-grilles:
  - ACCA-MANUAL-D-2016
  - LOCAL-AHJ-VERIFY
```

PR26 also resolves PR25 audit finding F01 by changing the `IRC-M1401.3-EQUIPMENT-SIZING` source link from the Chapter 44 referenced-standards page to the Chapter 14 heating/cooling equipment page.

## UI / MOBILE WORKFLOW

The calculator flow is intended to read:

```text
Project / system inputs
-> Building & room estimator
-> Calculation result
-> Generated BOM
-> Code / coordination checks
-> Assumptions & warnings
```

Room UI includes:

- add/remove room rows;
- 3-bedroom / 2-bath example starter;
- per-room mobile cards at narrow widths;
- building/room area reconciliation;
- quantity cards showing Code minimum / Calculated baseline / Final / Source;
- override input and reason;
- blockers/warnings/design checks;
- mirrored Customer Materials / Your Cost / Margin values from the existing Calculator result;
- explicit `Recalculate BOM from room plan` action.

No real browser/mobile interaction was executed in this implementation session. This is a required independent-audit focus, not a claimed pass.

## SERVICE WORKER

```yaml
cache: bruno-ac-v37
new_assets:
  - ./room-estimator-preload.js
  - ./room-estimator-engine.js
  - ./room-estimator-ux.js
  - ./room-estimator-persistence.js
```

Previously accepted critical shell assets remain present.

## DETERMINISTIC TESTS

`tests/room-estimator-engine.test.js` verifies:

```yaml
- 3-bed/2-bath planning supply baseline
- planning supply count is not labeled code minimum
- no square-footage-to-tonnage behavior
- room takeoff + documented override -> final quantities
- unresolved duct / return design gates
- existing-duct behavior does not invent return count
- missing override reason warning
- room-area reconciliation warning
- every room-estimator rule ID resolves
- room final quantities reach existing AC Calculator requirements
```

`tests/code-rule-registry.test.js` was extended to verify Manual D rule and new mapping integrity.

## CI VALIDATION

Final-code validation before temporary-workflow cleanup:

```yaml
run_id: 35028250513
validated_commit: b7c32f36aba4de652f5046f9986c294513424020
result: SUCCESS
steps:
  Room_estimator: PASS
  Code_rule_registry: PASS
  Financial_integrity: PASS
  Calculator_pricing: PASS
  Lifecycle_integration: PASS
  Calculator_review_UX: PASS
  Service_journal_UX: PASS
  Syntax_checks: PASS
```

After the successful run, the only branch change was deletion of:

```text
.github/workflows/pr26-room-estimator-validation.yml
```

producing final target HEAD:

```text
a04915f472679866ff941d0fb7b4b8752519becb
```

## UNCHANGED ACCEPTED BUSINESS LOGIC

From merged PR25 main baseline, PR26 leaves these business-logic files unchanged:

```yaml
- index.html
- financial-integrity-core.js
- ac-calculator-engine.js
- ac-calculator.js
- ac-calculator-review-ux.js
- service-journal-ux.js
- navigation-v2.js
- workspace-v5.js
```

The only calculator HTML change is loading the room estimator assets into the existing calculator page.

## REGRESSION GATES TO AUDIT

```yaml
must_remain_true:
  - Quote_Method_A_unchanged
  - Customer_Price_to_Job_unitCost_to_Quote
  - Your_Cost_to_procurementCostSnapshot_to_PnL
  - actualCost_overrides_snapshot_in_PnL_only
  - invalid_financial_never_silently_becomes_zero
  - existing_job_snapshot_changes_only_after_explicit_apply
  - room_estimator_does_not_infer_tonnage_from_sqft
  - room_planning_defaults_are_not_presented_as_code_minimum
  - unresolved_design_inputs_do_not_silently_become_zero_for_new_or_replacement_scope
  - override_provenance_is_preserved
  - blocked_or_cancelled_Apply_does_not_persist_room_snapshot
  - PR23_Calculator_review_behavior_remains_intact
  - PR24_Service_Call_Journal_remains_intact
  - PR25_Code_Library_remains_reachable_and_valid
```

## RUNTIME LIMITATION

```yaml
browser_runtime: NOT_PERFORMED
```

Do not infer a browser pass from deterministic tests or CI. Independent audit should execute mobile/browser workflow if available and explicitly report `NOT_PERFORMED` if unavailable.

```yaml
merge: FORBIDDEN_UNTIL_INDEPENDENT_AUDIT_ACCEPTS
next_state: PR26_INDEPENDENT_LARGE_BLOCK_AUDIT
```
