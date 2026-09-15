# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
read_order:
  - audits/WORKSPACE.md
  - audits/PROTOCOL.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/ROADMAP_NEXT.md
  - audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
  - audits/TASK_CURRENT.md
protocol_required: true
```

# MODE GUARD — AUDIT ONLY

```yaml
mode_guard:
  task_type: AUDIT
  implementation_mode: FORBIDDEN
  production_write_forbidden: true
  production_commit_forbidden: true
  active_PR_mutation_forbidden: true
  merge_forbidden: true
  audit_exact_head_required: true
```

```yaml
task_id: PR26_ROOM_BASED_ESTIMATOR_ACCEPTANCE_01
mode: independent_large_block_acceptance_audit
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
target_head: a04915f472679866ff941d0fb7b4b8752519becb
last_accepted_main: e84c9e9b6c53693d087db46156975ffec93d238a
status: ACTIVE
```

## OBJECTIVE

Independently determine whether PR #26 safely delivers the first large room/building-driven estimator block while preserving accepted financial/job behavior and clearly distinguishing:

```text
code/design requirement
vs
planning/takeoff baseline
vs
user override
vs
final BOM quantity
vs
Catalog pricing
```

The implementation report is context only. Production code, observable behavior, executable tests, CI evidence, and authoritative external sources are higher authority.

This audit is intentionally broad. Inspect the whole PR26 user flow and regression surface rather than only the new helper functions.

## USER WORKFLOW TO VERIFY

Expected high-level flow:

```text
Project / system inputs
-> Building & room estimator
-> room schedule
-> code/design checks
-> calculated planning/takeoff quantities
-> optional contractor/customer override + reason
-> final quantities
-> existing AC Calculator BOM
-> existing Catalog Customer Price / Your Cost
-> margin
-> explicit Apply to Job Materials
```

The user expects to be able to enter building square footage and room composition (for example kitchen, bedrooms, bathrooms, garage, etc.), use that to produce useful scope/material planning, manually increase a calculated amount for customer/contractor preference, and have pricing recalculate from the Catalog.

## FINAL DIFF / SCOPE

Expected changed files exactly:

```yaml
- ac-calculator.html
- code-library/texas-hvac-2026.json
- code-rule-registry.js
- room-estimator-engine.js
- room-estimator-persistence.js
- room-estimator-preload.js
- room-estimator-ux.js
- sw.js
- tests/code-rule-registry.test.js
- tests/room-estimator-engine.test.js
```

Forbidden final artifacts:

```yaml
- .github/workflows/pr26-room-estimator-validation.yml
- temporary_scripts
- debug_artifacts
```

Must remain unchanged from base unless independently proven otherwise:

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

## BUILDING / ROOM MODEL

Verify the room estimator can represent and safely normalize:

```yaml
building:
  - sqft
  - stories
  - ceilingHeight
  - location
  - foundation
  - ductScope
  - returnGrillesDesign
rooms:
  - kitchen
  - bedroom
  - living_room
  - bathroom
  - garage
  - laundry
  - office
  - other
per_room:
  - count
  - areaEach
  - conditioned
  - supplyPerRoom
  - branchFtPerRoom
  - exteriorWalls
  - windows
```

Check malformed/blank/zero/negative/extreme inputs and normalization behavior. Values must not silently become unsafe or misleading quantities.

## SQUARE FOOTAGE / CAPACITY SAFETY

This is a critical acceptance gate.

Verify all of the following:

```yaml
- sqft_does_not_directly_select_tonnage
- room_count_does_not_directly_select_tonnage
- calculator_does_not_claim_to_perform_Manual_J
- calculator_does_not_claim_to_perform_Manual_S
- calculator_does_not_claim_to_perform_Manual_D
- equipment_capacity_remains_manual_or_requires_approved_load_result
- code/design language_does_not_imply_sqft_rule_of_thumb_is_compliant_sizing
```

Independently verify the cited sizing/design references to the extent necessary to determine whether production wording overstates them.

## ROOM AREA RECONCILIATION

Verify:

```yaml
- conditioned_room_area_is_sum_of_areaEach_times_count
- garage_or_other_unconditioned_rows_do_not_enter_conditioned_area
- missing_conditioned_room_area_is_visible_as_incomplete
- >15_percent_room_vs_building_area_difference_produces_warning
- warning_does_not_change_tonnage_or_fabricate_missing_area
```

## SUPPLY-REGISTER PLANNING BASELINE

PR26 intentionally contains planning defaults by room type. These are **not claimed code minimums**.

Verify:

```yaml
- default_supply_values_are_clearly_planning_takeoff_values
- UI_code_minimum_for_these_metrics_is_not_fabricated
- calculated_baseline_remains_distinct_from_codeMinimum
- per_room_explicit_supply_input_overrides_the_planning_default_for_baseline_calculation
- room_count_multiplies_quantity_correctly
- unconditioned_room_does_not_generate_conditioned_supply_quantity
```

Any UI or logic that presents the planning default as a legal/code minimum is at least P1.

## DUCT / RETURN DESIGN GATES

Verify new/replacement duct scope does not silently invent required design values.

Expected:

```yaml
new_or_replacement:
  missing_branch_run_takeoff:
    ductFt: unresolved
    blocks_final_sync: true
  missing_return_design_input_or_documented_override:
    returnGrilles: unresolved
    blocks_final_sync: true
existing_duct:
  generated_ductFt: 0
  returnGrilles_not_invented: true
```

Check that Manual D reference is used as a design reference rather than a fake numeric code minimum.

## BASELINE / OVERRIDE / FINAL PROVENANCE

Each metric should preserve independent fields:

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

Verify:

```yaml
- valid_override_changes_finalQuantity_not_underlying_baseline
- valid_override_preserves_calculatedBaseline
- valid_override_source_is_traceable
- blank_override_uses_baseline
- override_without_reason_is_visibly_warned
- override_reason_survives_snapshot/export/persistence
- future hardMinimum guard rejects below-minimum override when hardMinimum true and codeMinimum known
- current metrics_with_no_defensible_numeric_minimum_keep_codeMinimum_null
```

Do not treat absence of a fabricated numeric code minimum as a defect.

## CATALOG / REPRICING INTEGRATION

This is a core user requirement.

Verify final room-estimator quantities flow into the existing AC Calculator inputs and then through the accepted existing pricing path.

Representative scenario:

```yaml
baseline_supply_registers: 8
override_supply_registers: 10
override_reason: customer_request
expected_final_quantity: 10
expected_AC_scope_supply_register_qty: 10
expected_BOM_qty: 10
expected_customer_extension: 10 * Catalog.unitCost
expected_your_extension: 10 * effective_Catalog.yourCost_or_customer_price_fallback
```

Verify repricing updates:

```yaml
- Customer_Materials
- Your_Material_Cost
- Material_Margin
- Material_Margin_Percent
```

The room estimator must not introduce a parallel pricing formula that bypasses `ac-calculator-engine.js` / accepted financial architecture.

## FINANCIAL REGRESSION GATES

Must remain true:

```yaml
customer_track:
  Catalog.unitCost -> Calculator.customerUnitPrice -> Job.unitCost -> Quote
internal_track:
  Catalog.yourCost -> Calculator.yourUnitCost -> Job.procurementCostSnapshot -> PnL
actual_track:
  Job.actualCost -> PnL_override_only
invariants:
  - yourCost_never_enters_customer_quote_basis
  - calculator_does_not_create_actualCost
  - blank_yourCost_preserves_customer_price_fallback_provenance
  - malformed_financial_value_never_silently_becomes_zero
  - numeric_zero_remains_valid_and_reviewable
  - catalog_edits_do_not_mutate_existing_job_before_explicit_reapply
```

Re-run/inspect accepted financial fixtures, including adversarial customer=100 / your=1 behavior.

## APPLY / PERSISTENCE LIFECYCLE

`room-estimator-persistence.js` is additive, but must obey existing Apply semantics.

Verify:

```yaml
storage_path: state.acCalculator.roomEstimator
expected:
  - room_snapshot_persists_after_successful_existing_Apply
  - blocked_Apply_does_not_persist_room_snapshot
  - cancelled_zero_price_confirmation_does_not_persist_room_snapshot
  - invalid_financial_block_does_not_persist_room_snapshot
  - existing_generatedAt_success_marker_is_not_falsely_changed_by_room_layer
  - room_persistence_does_not_rewrite_material_prices_or_actualCost
  - room_snapshot_does_not_break_existing_storage_import_reload
```

Audit the timing/order of event listeners carefully. A click alone must not be mistaken for successful Apply.

## PRELOAD / RELOAD

Verify saved room plan restoration is coherent:

```yaml
- saved_sqft_restored_before_room_UI_seed
- saved_ductScope_restored_before_room_UI_seed
- reload_does_not_overwrite_saved_room_plan_with_generic_defaults
- malformed_or_absent_room_snapshot_fails_non_destructively
```

## CODE LIBRARY / RULE TRACEABILITY

Verify the registry remains valid and PR26 additions are coherent.

Expected new rule:

```yaml
id: ACCA-MANUAL-D-2016
family: ACCA-DESIGN
role: design_reference_not_numeric_code_minimum
```

Expected mappings:

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

Verify every mapped rule ID resolves.

Also verify PR25 non-blocking F01 is actually corrected:

```yaml
rule: IRC-M1401.3-EQUIPMENT-SIZING
old_problem: source pointed to Chapter 44 referenced standards
expected_PR26: source points to Chapter 14 heating/cooling equipment page containing M1401.3 context
```

No full copyrighted code/manual text should be introduced.

## UI / MOBILE WORKFLOW

Preferred actual mobile/browser runtime if available.

Verify expected information order:

```text
Project / system inputs
Building & room estimator
Calculation result
Generated BOM
Code / coordination checks
Assumptions & warnings
```

Verify on mobile width:

```yaml
- room_rows_are_usable_without_desktop_horizontal_table_dependency
- add_room_works
- remove_room_works
- 3bed_2bath_example_loads_once_without_duplicate_rows
- count_area_conditioned_supply_branch_fields_are_editable
- quantity_metric_cards_are_readable
- code_minimum_calculated_final_source_are_distinguishable
- override_and_reason_work
- blockers_are_visible
- Recalculate_BOM_action_updates_existing_BOM_once
- no_recursive_change_or_click_loop
- no_observer_loop
- existing_Calculator_review_state_remains_coherent
- no_stale_green_ready_state_after_room_input_changes
- no_console_errors
```

If actual browser runtime is unavailable, report exactly `NOT_PERFORMED` and do not infer a runtime pass from static source or tests.

## SCRIPT ORDER / INITIALIZATION

Verify `ac-calculator.html` loading order does not create lifecycle races between:

```yaml
- ac-calculator-engine.js
- ac-calculator.js
- ac-calculator-ux.js
- room-estimator-preload.js
- room-estimator-engine.js
- room-estimator-ux.js
- room-estimator-persistence.js
- ac-calculator-review-ux.js
```

Specifically inspect DOMContentLoaded registration order, auto-calculation behavior, room UI insertion, dirty/stale calculation state, and persistence hook timing.

## PWA / OFFLINE DELIVERY

Expected service worker:

```yaml
cache: bruno-ac-v37
new_assets:
  - ./room-estimator-preload.js
  - ./room-estimator-engine.js
  - ./room-estimator-ux.js
  - ./room-estimator-persistence.js
```

Verify all previously accepted critical assets remain cached and the service worker syntax/behavior was not broken by formatting changes.

## EXECUTABLE / CI EVIDENCE

Implementation report references authoritative final-code validation before workflow cleanup:

```yaml
run_id: 35028250513
validated_commit: b7c32f36aba4de652f5046f9986c294513424020
expected_result: SUCCESS
expected_steps:
  - Room estimator
  - Code rule registry
  - Financial integrity
  - Calculator pricing
  - Lifecycle integration
  - Calculator review UX
  - Service journal UX
  - Syntax checks
```

Independently inspect run/jobs.

Then compare validated commit to exact target HEAD `a04915f472679866ff941d0fb7b4b8752519becb`.

Expected only post-CI change:

```text
DELETE .github/workflows/pr26-room-estimator-validation.yml
```

Anything else in the post-CI delta must be independently assessed.

## ACCEPTED PRODUCT REGRESSION GATES

Verify no regression in:

```yaml
- PR22_financial_integrity
- PR23_AC_Calculator_review_UX
- PR24_Service_Call_Journal
- PR25_Code_Library_navigation_and_registry
- Quote_Method_A
- PnL_precedence
- Catalog_snapshot_lifecycle
- localStorage_job_compatibility
```

## SEVERITY

```yaml
P0:
  - customer_or_internal_financial_track_corruption
  - job_data_loss_or_schema_break
  - silent_below_known_hard_code_minimum_treated_as_compliant
  - sqft_or_room_count_silently_drives_fake_compliant_tonnage
P1:
  - room_estimator_final_quantity_does_not_reprice_through_existing_Catalog_path
  - planning_default_presented_as_code_minimum
  - unresolved_new_or_replacement_design_input_silently_becomes_final_zero
  - blocked_or_cancelled_Apply_persists_or_mutates_job_inappropriately
  - override_loses_baseline_or_provenance
  - room_UI_breaks_existing_Calculator_apply_or_review_state
  - critical_registry_rule_or_source_mapping_invalid
  - self_triggering_event_or_observer_loop
  - required_room_assets_not_available_offline
P2:
  - minor_copy_spacing_or_mobile_layout_issue_without workflow/compliance/financial impact
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
  - Building_And_Room_Model
  - Square_Footage_And_Capacity_Safety
  - Room_Area_Reconciliation
  - Supply_Planning_Baseline
  - Duct_And_Return_Design_Gates
  - Baseline_Override_Final_Provenance
  - Catalog_And_Repricing
  - Financial_Regression_Gates
  - Apply_And_Persistence_Lifecycle
  - Preload_And_Reload
  - Code_Library_And_Rule_Traceability
  - PR25_F01_Source_Link_Fix
  - UI_And_Mobile_Workflow
  - Initialization_And_Event_Safety
  - Service_Worker_Offline_Delivery
  - Test_CI_Evidence
  - Accepted_Product_Regression_Gates
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After successful report write: update `audits/LATEST_AUDIT.md`, update `audits/HANDOFF.md`, enforce history retention, and return only VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT.

Do not modify PR #26 or production code. Do not merge.
