# CURRENT AUDIT TASK

```yaml
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
protocol_required: true
read_order:
  - audits/WORKSPACE.md
  - audits/CONTEXT.md
  - audits/TASK_CURRENT.md
  - audits/HANDOFF.md
```

```yaml
task_id: PR22_FINAL_ACCEPTANCE_603CBCA
mode: independent_final_acceptance_audit
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
expected_base_sha: f0c8d11e8d1331811f14e4820f3e0ebeff86b7b5
expected_head_sha: 603cbca03e292ae1d3bf424514fb60da6233bfc6
previous_rejected_head: 104c8229f2c0ee4ac377e9081fe807f58683db4e
corrective_production_commit: 67952a6bc3504aeb2ea580dcc10fccf4318a6aa8
authoritative_ci_run: 34995112030
status: ACTIVE
```

## OBJECTIVE

```yaml
acceptance_question: is_PR22_safe_to_merge_at_actual_current_production_HEAD
independence_required: true
production_code_is_authority: true
previous_reports_are_context_only: true
```

## REQUIRED CHECKS

```yaml
checks:
  - id: lifecycle_historical_job_immutability
    fixture_ref: CONTEXT.canonical_lifecycle_fixture
    fail_gate: P0_C
  - id: margins_customer_price_lifecycle
    requirement: no_existing_job_unitCost_mutation_before_explicit_reapply
    fail_gate: P0_C
  - id: blank_your_cost_provenance
    fixture_ref: CONTEXT.fallback_provenance_fixture
    fail_gate: P1
  - id: dual_pricing_track_separation
    fixture_ref: CONTEXT.financial_architecture
    fail_gate: cross_track_is_P0_C
  - id: strict_invalid_financial_semantics
    fixture_ref: CONTEXT.strict_financial_semantics
  - id: material_reconciliation
    fixture_ref: CONTEXT.reconciliation_model
  - id: write_inventory
    targets:
      - materialsUsed[].unitCost
      - procurementCostSnapshot
    classify: explicit_lifecycle_vs_implicit_background
  - id: persistence_reload
    requirement: Catalog_110_55_can_coexist_with_historical_Job_100_70_until_explicit_reapply
  - id: export_import_normalization
    requirement: must_not_reconnect_catalog_and_historical_job_implicitly
  - id: calculator_calculate_nonmutation
  - id: manual_material_preservation
  - id: snapshot_refresh_explicit_only
  - id: method_A_quote_separation
    fixture_ref: CONTEXT.adversarial_quote
  - id: profitability_actual_snapshot_estimate_precedence
  - id: regression_sweep
    areas:
      - Method_A
      - Quote_validity
      - Quote_print
      - Job_Profitability
      - Labor
      - Burden
      - Small_Tools
      - Equipment
      - Subcontractors
      - Change_Orders
      - T_and_M
      - Company_ACR
      - Texas_ACR_TECL_separation
      - Service_Worker
  - id: ci_provenance
    run: 34995112030
  - id: final_tree_scope
    expected_diff_ref: CONTEXT.expected_pr_net_diff
  - id: test_quality
    classifications:
      - EXECUTABLE_INTEGRATION
      - EXECUTABLE_CORE
      - CI_LOG
      - STATIC_SOURCE
      - SOURCE_ASSERTION
      - WEAK_STRING_ASSERTION
  - id: browser_runtime
    rule: if_unavailable_report_NOT_PERFORMED
```

## REQUIRED OUTPUT

Follow `audits/WORKSPACE.md` report protocol exactly.

```yaml
full_report_sections_minimum:
  - Executive_Verdict
  - Repository_State
  - Audited_SHA
  - Changed_Files
  - CI_Provenance
  - Browser_DOM_Result
  - Findings_Table
  - Catalog_Job_Lifecycle
  - Blank_Your_Cost_Fallback_Provenance
  - Dual_Pricing
  - Apply_Mapping
  - Persistence
  - Material_Reconciliation
  - Profitability
  - Method_A_Quote
  - Regression_Sweep
  - Service_Worker
  - Test_Quality
  - Unsafe_Financial_Coercion_Sweep
  - Job_Material_Write_Inventory
  - Merge_Blockers
  - Non_Blocking_Follow_Ups
  - Final_Verdict
```

Do not modify production code, production branch, or PR #22. Do not merge. Do not fix findings during this task.
