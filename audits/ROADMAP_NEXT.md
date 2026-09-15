# BRUNO AC — NEXT PHASE ROADMAP

```yaml
roadmap_version: 1
repository: kot0070/bruno-ac-pwa
status: PLANNED_NOT_IMPLEMENTED
current_foundation_pr: 25
next_major_phase: room_based_code_driven_estimator
```

## TARGET FLOW

```text
Building profile
  -> room schedule
  -> applicable code / design rules
  -> code minimums
  -> calculated baseline
  -> contractor / customer overrides
  -> final BOM quantities
  -> Catalog resolution
  -> Customer Price + Your Cost
  -> margin / estimate
  -> source traceability
```

## BUILDING / ROOM INPUTS

Planned inputs include:

```yaml
building:
  - total_square_feet
  - stories
  - ceiling_height
  - climate_or_location
  - attic_crawl_slab_context
  - insulation_and_envelope_inputs_when_available
  - new_vs_replacement
  - HVAC_system_type
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
    - count_or_instance
    - area
    - exterior_wall_context
    - windows_when_needed
    - supply_outlets
    - return_requirements_when_applicable
```

The estimator must never silently convert square footage alone into equipment tonnage. Where Manual J / Manual S / Manual D or field measurements are required, the workflow must identify the missing authoritative input instead of inventing it.

## BASELINE / OVERRIDE / FINAL MODEL

Every editable calculated quantity that can affect BOM or price should preserve provenance:

```yaml
quantity_model:
  code_minimum: authoritative_or_rule_derived_minimum_when_applicable
  calculated_baseline: estimator_recommendation_or_takeoff_result
  override: optional_user_value
  override_reason:
    allowed_examples:
      - customer_request
      - contractor_choice
      - field_condition
      - design_upgrade
      - existing_condition
      - other_documented_reason
  final_quantity: override_if_valid_else_calculated_baseline
```

Example:

```yaml
supply_registers:
  code_minimum: 6
  calculated_baseline: 7
  override: 8
  override_reason: customer_request
  final_quantity: 8
```

Rules:
- an override ABOVE the minimum is allowed and reprices immediately;
- an override BELOW a hard code minimum must not silently become the final compliant quantity;
- below-minimum input must produce an explicit compliance blocker or rule-specific warning depending on the rule severity;
- the original code minimum and calculated baseline must remain visible after override;
- override must not mutate the underlying rule definition;
- every final quantity used for pricing must have a traceable source.

## REPRICING

Any accepted override that changes the final BOM must automatically recalculate:

```yaml
pricing_outputs:
  - Customer_Materials
  - Your_Material_Cost
  - Material_Margin
  - Material_Margin_Percent
  - final_estimate_inputs
```

Financial invariants remain unchanged:

```text
Catalog Customer Price -> final BOM -> Job unitCost -> Quote
Catalog Your Cost -> final BOM -> procurementCostSnapshot -> P&L
Actual Cost -> P&L override only
```

The user's negotiated/discounted purchase cost must never leak into the customer-facing price track.

## TRACEABILITY UI

For each calculated or overridden item, future UI should expose:

```yaml
trace:
  - rule_id
  - code_family
  - edition
  - section
  - official_source_link
  - code_minimum_if_applicable
  - calculated_baseline
  - user_override
  - override_reason
  - final_quantity
  - catalog_match
  - customer_price
  - your_cost
```

## PHASE BOUNDARY

PR25 only delivers the Code Library + Rule Registry foundation. The room-based estimator, quantity engine, override model, repricing integration, and calculator consumption of the rule registry belong to the next implementation phase after PR25 is independently accepted and merged.
