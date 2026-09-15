# BRUNO AC — NEXT PHASE ROADMAP

```yaml
roadmap_version: 2
repository: kot0070/bruno-ac-pwa
status: IMPLEMENTED_IN_PR26_AUDIT_PENDING
accepted_foundation_pr: 25
foundation_main_merge: e84c9e9b6c53693d087db46156975ffec93d238a
current_major_phase: room_based_code_driven_estimator
current_pr: 26
current_target_head: a04915f472679866ff941d0fb7b4b8752519becb
```

## TARGET FLOW

```text
Building profile
  -> room schedule
  -> applicable code / design rules
  -> code minimums where defensible
  -> calculated baseline / takeoff
  -> contractor / customer overrides
  -> final BOM quantities
  -> Catalog resolution
  -> Customer Price + Your Cost
  -> margin / estimate
  -> source traceability
```

PR26 implements the first large production block of this flow and is awaiting independent acceptance audit.

## BUILDING / ROOM INPUTS

Current PR26 inputs include:

```yaml
building:
  - total_square_feet
  - stories
  - ceiling_height
  - location_context
  - foundation_context
  - duct_scope
  - return_grille_design_input
rooms:
  types:
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
    - area
    - conditioned_status
    - supply_outlets
    - branch_run_takeoff
    - exterior_wall_context
    - windows
```

The estimator must never silently convert square footage alone into equipment tonnage. Where Manual J / Manual S / Manual D or field measurements are required, the workflow identifies the missing authoritative input instead of inventing it.

## BASELINE / OVERRIDE / FINAL MODEL

Every editable calculated quantity that can affect BOM or price preserves provenance:

```yaml
quantity_model:
  code_minimum: authoritative_or_rule_derived_minimum_when_applicable
  calculated_baseline: estimator_recommendation_or_takeoff_result
  override: optional_user_value
  override_reason:
    - customer_request
    - contractor_choice
    - field_condition
    - design_upgrade
    - existing_condition
    - other_documented_reason
  final_quantity: override_if_valid_else_calculated_baseline
```

Rules:
- an override ABOVE a known minimum is allowed and reprices through the existing Catalog path;
- an override BELOW a hard code minimum must not silently become the final compliant quantity;
- below-minimum input must produce an explicit compliance blocker or rule-specific warning depending on rule severity;
- the original code minimum and calculated baseline remain independently represented after override;
- override never mutates the underlying rule definition;
- every final quantity used for pricing has a traceable source;
- where no defensible universal numeric code minimum exists, `code_minimum` remains null instead of being fabricated.

## CURRENT PR26 IMPLEMENTATION

```yaml
implemented_metrics:
  - supplyRegisters
  - ductFt
  - returnGrilles
pricing_bridge:
  - final_quantity_to_existing_AC_Calculator
  - existing_Catalog_Customer_Price
  - existing_Catalog_Your_Cost
  - existing_material_margin
  - existing_explicit_Apply_lifecycle
traceability:
  - IRC_M1401.3_equipment_sizing
  - ACCA_Manual_D_design_reference
  - LOCAL_AHJ_verify
persistence:
  - additive_state.acCalculator.roomEstimator
  - persists_only_after_successful_existing_Apply
```

## FINANCIAL INVARIANTS

```text
Catalog Customer Price -> final BOM -> Job unitCost -> Quote
Catalog Your Cost -> final BOM -> procurementCostSnapshot -> P&L
Actual Cost -> P&L override only
```

The internal/discounted purchase cost must never leak into the customer-facing price track.

## TRACEABILITY UI

For each calculated or overridden item, the target UI exposes or preserves:

```yaml
trace:
  - rule_id
  - code_family
  - edition_or_design_reference
  - source_link
  - code_minimum_if_applicable
  - calculated_baseline
  - user_override
  - override_reason
  - final_quantity
  - catalog_match
  - customer_price
  - your_cost
```

## AFTER PR26 AUDIT

If the large independent audit finds omissions, fix them as focused follow-up commits on the same PR and re-audit the new exact HEAD. Do not redesign the architecture unless the audit identifies a structural defect.

If accepted, the next expansion should build on the same quantity/provenance model rather than introducing parallel estimating logic.
