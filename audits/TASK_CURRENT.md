# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/PR26_LIVE_CODE_ESTIMATOR_5b069931.md
read_order:
  - audits/WORKSPACE.md
  - audits/PROTOCOL.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/ROADMAP_NEXT.md
  - audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
  - audits/implementation/PR26_LIVE_CODE_ESTIMATOR_5b069931.md
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
task_id: PR26_LIVE_CODE_ESTIMATOR_ACCEPTANCE_02
mode: independent_large_block_acceptance_audit
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
target_head: 5b069931eaf98311f31d344c1acd6cc8e5553ade
obsolete_target_head: a04915f472679866ff941d0fb7b4b8752519becb
status: ACTIVE
```

## OBJECTIVE

Audit the entire PR26 as a live code/design-driven room estimator, not only helper functions.

Expected user flow:

```text
Building/system inputs
-> total square footage
-> room schedule (type/count/area/conditioned/etc.)
-> applicable code/design references
-> defensible code minimum when one exists
-> calculated/design baseline
-> optional contractor/customer override + reason
-> live compliance status
-> final quantity
-> generated components/materials
-> existing Catalog matching
-> Customer Price / Your Cost / Margin
-> explicit Apply to Job only
```

The estimator must be reactive in preview. Editing a room, quantity, area, or override should refresh the preview BOM/pricing/compliance without automatically mutating Job data.

## CRITICAL TRUTHFULNESS / SAFETY

Verify:

```yaml
- sqft_does_not_directly_select_tonnage
- room_count_does_not_directly_select_tonnage
- no_false_claim_of_performing_Manual_J_S_or_D
- planning_defaults_are_not_presented_as_code_minimums
- unknown_numeric_code_minimum_is_not_fabricated
- known_hard_minimum_violation_is_red_and_blocking
- unresolved_design_or_field_input_is_not_presented_as_compliant
- code/design source links correspond to actual ruleIds
- local_AHJ/OEM verification remains explicit where applicable
```

If a metric has `hardMinimum: true` and a known `codeMinimum`, an override below it must not silently become compliant/final. The UI should show a red failure/block state and preserve the rule/source traceability.

For current metrics where no defensible universal numeric minimum exists, `codeMinimum: null` is valid and MUST NOT be treated as a defect.

## LIVE CALCULATOR BEHAVIOR

Audit `room-estimator-live.js` closely.

Verify:

```yaml
- listens_to_room_input_and_change_events
- debounce_is_bounded
- rebuilds_current_room_plan
- no_recursive_input_click_or_calculate_loop
- blockers_prevent_invalid_room_result_from_syncing_into_final_BOM
- resolved_final_quantities_sync_into_existing_AC_Calculator_preview
- existing_Calculate_path_remains_authoritative_for_BOM_and_pricing
- Customer_Materials_Your_Cost_Margin_refresh_after_live_changes
- live_layer_never_clicks_or_calls_Apply
- live_layer_does_not_write_localStorage_or_Job_state
- explicit_Apply_remains_required_for_Job_mutation
- stale_green_ready_state_is_not_left_after_room_changes
```

Representative scenario:

```yaml
baseline_supply: 8
override_supply: 10
override_reason: customer_request
expected:
  final_quantity: 10
  BOM_quantity: 10
  Customer_extension: 10 * Catalog.unitCost
  Your_extension: 10 * effective Catalog.yourCost or accepted fallback
  Job_materials_before_Apply: unchanged
```

## BUILDING / ROOM MODEL

Verify existing PR26 model remains correct for:

- total sqft;
- stories;
- ceiling height;
- location/climate context;
- foundation/equipment context;
- kitchen, bedroom, living room, bathroom, garage, laundry, office, other;
- room count;
- area per room;
- conditioned flag;
- supply per room;
- branch/run ft per room;
- exterior walls/windows.

Check blank/zero/negative/extreme/malformed normalization.

Room-area reconciliation >15% must remain visible without changing tonnage.

## DUCT / RETURN DESIGN GATES

For new/replacement duct scope:

```yaml
missing_branch_takeoff:
  ductFt: unresolved
  invalid_live_sync: blocked
missing_return_design_or_valid_override:
  returnGrilles: unresolved
  invalid_live_sync: blocked
```

Existing duct mode must not invent return design values.

## OVERRIDE / PROVENANCE

Each metric must preserve:

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

Verify baseline survives override and reason survives snapshot/export/persistence.

## SOURCE / CODE TRACEABILITY

Verify Code Library and rule map remain valid, including:

- `IRC-M1401.3-EQUIPMENT-SIZING` source correction;
- `ACCA-MANUAL-D-2016` as a design reference, not a fabricated numeric code minimum;
- `LOCAL-AHJ-VERIFY` remains explicit;
- source buttons in live cards resolve `ruleIds` through the registry;
- external links use HTTPS and `rel="noopener"`;
- no full copyrighted code/manual text is stored.

## FINANCIAL / CATALOG REGRESSION

Must remain true:

```yaml
customer_track: Catalog.unitCost -> Calculator.customerUnitPrice -> Job.unitCost -> Quote
internal_track: Catalog.yourCost -> Calculator.yourUnitCost -> Job.procurementCostSnapshot -> PnL
actual_track: Job.actualCost -> PnL override only
```

Verify:

- Your Cost never leaks into customer quote basis;
- blank Your Cost fallback provenance remains correct;
- malformed financial values never silently become zero;
- legitimate zero remains reviewable;
- live preview does not create `actualCost`;
- Catalog edits do not mutate historical Job values before explicit Apply/Re-Apply.

Re-run accepted financial/lifecycle fixtures.

## APPLY / PERSISTENCE

Verify `room-estimator-persistence.js` still persists only after successful existing Calculator Apply.

Blocked/cancelled Apply must not persist the room snapshot.

Live preview events must not alter this lifecycle.

## SCRIPT ORDER / EVENT SAFETY

Current relevant load order includes:

```text
ac-calculator-engine.js
ac-calculator.js
ac-calculator-ux.js
room-estimator-preload.js
room-estimator-engine.js
room-estimator-ux.js
room-estimator-persistence.js
code-rule-registry.js
room-estimator-live.js
ac-calculator-review-ux.js
```

Audit DOMContentLoaded timing, event-listener order, initialization idempotency, stale/dirty state, and any click/change feedback loops.

## PWA / OFFLINE

Expected:

```yaml
cache: bruno-ac-v38
required_room_assets:
  - ./room-estimator-preload.js
  - ./room-estimator-engine.js
  - ./room-estimator-ux.js
  - ./room-estimator-persistence.js
  - ./room-estimator-live.js
```

All previously accepted critical assets must remain available.

## FINAL DIFF / SCOPE

Expected production diff relative to main includes the original PR26 files plus `room-estimator-live.js`. No temporary workflow may remain.

Must independently inspect final diff rather than trusting this description.

## CI EVIDENCE

Latest live validation:

```yaml
run_id: 35029436317
validated_commit: cb8a14f043bc8cc6bb609beb4408dd46df39e602
expected_result: SUCCESS
expected_steps:
  - Room estimator
  - Code rule registry
  - Financial integrity
  - Calculator pricing
  - Lifecycle integration
  - Calculator review UX
  - Service journal UX
  - Syntax checks including room-estimator-live.js
```

Then compare `cb8a14f043bc8cc6bb609beb4408dd46df39e602` to exact target HEAD `5b069931eaf98311f31d344c1acd6cc8e5553ade`.

Expected only post-CI change:

```text
DELETE .github/workflows/pr26-live-validation.yml
```

Also retain prior PR26 CI evidence from implementation report for original room-estimator block.

## BROWSER / MOBILE RUNTIME

Preferred. If available, actually test:

- edit total sqft;
- add/remove rooms;
- change room count/area/supply/branch ft;
- apply override and reason;
- watch live status/BOM/prices update;
- verify red failure for any modeled hard-minimum test path if one can be constructed without altering production;
- verify unresolved design state is visible;
- verify source links;
- verify Job materials remain unchanged before Apply;
- verify explicit Apply still works when all gates pass;
- verify mobile layout and no console errors/loops.

If browser runtime is unavailable, report exactly `NOT_PERFORMED`.

## ACCEPTED REGRESSION SURFACE

Audit no regression in:

- PR22 financial integrity / lifecycle;
- PR23 calculator review UX;
- PR24 Service Call Journal;
- PR25 Code Library;
- Quote Method A;
- P&L precedence;
- persistence/import compatibility;
- navigation/PWA shell.

## SEVERITY

```yaml
P0:
  - financial_track_corruption
  - job_data_loss
  - silent_below_known_hard_minimum_treated_as_compliant
  - sqft_or_room_count_drives_fake_compliant_tonnage
P1:
  - live_change_does_not_update_BOM_or_Catalog_pricing
  - live_layer_mutates_Job_before_explicit_Apply
  - planning_default_presented_as_code_minimum
  - unresolved_design_value_silently_becomes_final_zero
  - code_source_link_materially_wrong_for_displayed_rule
  - recursive_event_or_calculate_loop
  - stale_green_ready_state_after_live change
  - required_live_asset_missing_offline
  - regression_in_accepted_financial_or_product_behavior
P2:
  - minor_copy_or_mobile_layout_issue_without workflow/compliance/financial impact
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
  - Live_Calculator_Reactivity
  - Code_And_Design_Compliance_State
  - Baseline_Override_Final_Provenance
  - Catalog_And_Repricing
  - Financial_Regression_Gates
  - Apply_And_Persistence_Lifecycle
  - Source_Traceability
  - Initialization_And_Event_Safety
  - PWA_Offline_Delivery
  - Test_CI_Evidence
  - Accepted_Product_Regression_Gates
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After report write update `audits/LATEST_AUDIT.md` and `audits/HANDOFF.md` per protocol.

Return only VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT.

Do not modify PR #26 or production code. Do not merge.
