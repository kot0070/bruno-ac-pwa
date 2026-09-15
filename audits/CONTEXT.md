# BRUNO AC PR22 AUDIT CONTEXT

```yaml
context_version: 1
repository: kot0070/bruno-ac-pwa
production_pr: 22
base_branch: main
base_sha: f0c8d11e8d1331811f14e4820f3e0ebeff86b7b5
production_branch: feature/financial-integrity-texas-acr-docs
known_current_head: 603cbca03e292ae1d3bf424514fb60da6233bfc6
previous_rejected_head: 104c8229f2c0ee4ac377e9081fe807f58683db4e
corrective_production_commit: 67952a6bc3504aeb2ea580dcc10fccf4318a6aa8
authoritative_corrective_ci_run: 34995112030
```

## FINANCIAL ARCHITECTURE

```yaml
tracks:
  customer:
    path: Catalog.unitCost -> Calculator.customerUnitPrice -> Job.materialsUsed[].unitCost -> calcMaterial -> Method_A -> Quote
  internal:
    path: Catalog.yourCost -> Calculator.yourUnitCost -> Job.materialsUsed[].procurementCostSnapshot -> PnL
  actual:
    path: Job.materialsUsed[].actualCost -> PnL_override_only
invariants:
  - yourCost_must_not_enter_quote
  - calculator_must_not_create_actualCost
  - historical_job_values_are_immutable_until_explicit_apply_or_refresh
```

## CANONICAL LIFECYCLE FIXTURE

```yaml
fixture:
  initial_catalog:
    customer: 100
    your: 70
  explicit_apply_expected_job:
    unitCost: 100
    procurementCostSnapshot: 70
  catalog_after_edit:
    customer: 110
    your: 55
  before_reapply_expected_job:
    unitCost: 100
    procurementCostSnapshot: 70
  after_explicit_reapply_expected_job:
    unitCost: 110
    procurementCostSnapshot: 55
blocking_condition:
  - any_Catalog_or_Margins_edit_that_mutates_existing_job_before_explicit_reapply
```

## FALLBACK PROVENANCE FIXTURE

```yaml
fixture:
  catalog:
    customer: 50
    your: blank
  calculator_expected:
    customerUnitPrice: 50
    yourUnitCost: 50
    yourCostSource: customer-price-fallback
  after_customer_change:
    customer: 60
    your: blank
  calculator_expected_after_change:
    customerUnitPrice: 60
    yourUnitCost: 60
    yourCostSource: customer-price-fallback
invariant:
  - blank_yourCost_must_remain_semantically_blank_upstream
```

## RECONCILIATION MODEL

```yaml
precedence:
  - actualCost
  - procurementCostSnapshot
  - unitCost_estimate_fallback
fixture:
  rows:
    - {qty: 1, estimate: 100, snapshot: 80, actual: 90}
    - {qty: 2, estimate: 100, snapshot: 70}
    - {qty: 3, estimate: 50}
  expected:
    used: 380
    estimate: 450
    variance: -70
    sources: {actual: 1, snapshot: 1, fallback: 1}
invalid_rule:
  explicit_invalid_higher_priority_value_blocks_fallthrough: true
```

## DUAL PRICING FIXTURES

```yaml
single:
  input: {qty: 2, customer: 100, your: 70}
  expected: {customer_ext: 200, your_ext: 140, margin: 60, margin_pct: 0.30}
aggregate:
  rows:
    - {qty: 2, customer: 100, your: 70}
    - {qty: 3, customer: 50, your: 40}
  expected:
    customer_total: 350
    your_total: 260
    margin: 90
    margin_pct: 0.2571428571428571
adversarial_quote:
  input: {qty: 10, customer: 100, your: 1}
  expected:
    quote_material_basis: 1000
    pnl_snapshot_cost: 10
```

## STRICT FINANCIAL SEMANTICS

```yaml
invalid_inputs:
  - NaN
  - Infinity
  - -Infinity
  - "Infinity"
  - "NaN"
  - "abc"
  - negative_financial_values
rules:
  invalid_must_not_become_zero: true
  numeric_zero_is_valid: true
sentinel: INVALID_FINANCIAL
```

## EXPECTED PR NET DIFF

```yaml
files:
  - ac-calculator-engine.js
  - ac-calculator.css
  - ac-calculator.html
  - ac-calculator.js
  - financial-integrity-core.js
  - index.html
  - sw.js
  - tests/ac-calculator-pricing.test.js
  - tests/financial-integrity.test.js
must_not_be_in_production_diff:
  - README
  - scripts/**
  - .github/workflows/**
  - unrelated_assets
```

## KNOWN HISTORICAL DEFECTS

```yaml
previous_head_104c8229:
  verdict: C
  findings:
    F01:
      severity: P0
      defect: Catalog_Customer_Price_edit_mutated_existing_Job_unitCost_without_explicit_Apply
    F02:
      severity: P1
      defect: blank_yourCost_materialized_from_unitCost_destroying_fallback_provenance
    F03:
      severity: P1
      defect: insufficient_production_lifecycle_integration_coverage
    F04:
      severity: P2
      defect: resolveCatalogItem_compatibleSystems_systemType_inputs_unused
```

## TEXAS ACR CONTEXT

```yaml
requirements_to_reverify_when_material:
  - business_name
  - address
  - phone
  - ACR_license_number
  - TDLR_notice
license_semantics:
  TECL_is_not_ACR: true
  A: any_equipment_size
  B: cooling_le_25_tons_and_heating_le_1_5M_BTUh
  E: Environmental_Air_Conditioning
  R: Commercial_Refrigeration_Process_Cooling_Heating
  C: E_plus_R
```

## CONTEXT MAINTENANCE

This file stores stable technical context and canonical fixtures. Do not treat historical conclusions as current truth. Every audit must independently resolve the actual production HEAD and re-verify behavior.
