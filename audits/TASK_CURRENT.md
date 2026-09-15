# AUDIT TASK CHANNEL

```yaml
protocol: bruno-ac-audit-v2
format: ai_native_structured
language: en
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
audit_branch: audit/pr22-603cbca
report_dir: audits/history
retain_reports: 3
current_report_alias: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md

hard_rules:
  production_tree: read_only
  modify_production_code: false
  modify_production_branch: false
  modify_pr_22: false
  merge: false
  fix_findings: false
  report_write_scope: audit_branch_only
  full_report_in_chat: false

retention:
  history_pattern: audits/history/PR22_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
  keep_newest: 3
  delete_older_only_after_new_report_verified: true
  stable_alias: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md
  stable_alias_must_equal_latest_report: true

communication:
  task_language: en
  report_language: en
  style: machine_oriented_technical
  prose_minimize: true
  use_structured_sections: true
  use_exact_sha_path_function: true
  facts_vs_inference: explicit
  no_progress_narrative_unless_blocked: true
  blockers_max: 5
  final_chat_schema:
    - "VERDICT: <A|B|C> — <label>"
    - "AUDITED HEAD: <full_sha>"
    - "BLOCKERS: <none|up_to_5_short_lines>"
    - "FULL REPORT: <github_url>"

verdict_scale:
  A: ACCEPT
  B: ACCEPT_AFTER_MINOR_FIXES
  C: REJECT_REWORK_REQUIRED
status: ACTIVE
```

## CURRENT TASK

```yaml
task_id: PR22_FINAL_ACCEPTANCE_603CBCA
mode: independent_final_acceptance_audit
expected_base_sha: f0c8d11e8d1331811f14e4820f3e0ebeff86b7b5
expected_head_sha: 603cbca03e292ae1d3bf424514fb60da6233bfc6
previous_rejected_head: 104c8229f2c0ee4ac377e9081fe807f58683db4e
corrective_production_commit: 67952a6bc3504aeb2ea580dcc10fccf4318a6aa8
authoritative_ci_run: 34995112030

authority_order:
  - actual_current_production_code
  - observable_behavior
  - executable_tests
  - source_assertions
  - comments_docs_commit_messages

acceptance_invariants:
  lifecycle:
    setup: {catalog_customer: 100, catalog_your: 70}
    after_apply: {job_unitCost: 100, job_snapshot: 70}
    mutate_catalog: {catalog_customer: 110, catalog_your: 55}
    before_reapply_required: {job_unitCost: 100, job_snapshot: 70}
    after_reapply_required: {job_unitCost: 110, job_snapshot: 55}
    margins_customer_edit_must_obey_same_rule: true
    implicit_catalog_or_margins_to_historical_job_write: P0_C

  blank_your_cost:
    setup: {customer: 50, your: blank}
    persisted_your_must_remain_blank: true
    calculator_resolved_your: 50
    source: customer-price-fallback
    after_customer_change_to_60: {resolved_customer: 60, resolved_your: 60, source: customer-price-fallback}
    stale_materialized_fallback: P1

  pricing_tracks:
    customer: "catalog.unitCost -> calculator.customerUnitPrice -> job.unitCost -> MethodA -> Quote"
    internal: "catalog.yourCost -> calculator.yourUnitCost -> job.procurementCostSnapshot -> P&L"
    actual: "actualCost -> P&L override only"
    your_cost_enters_quote: P0_C
    calculator_creates_actualCost: P0_C

  fixtures:
    row_1: {qty: 2, customer: 100, your: 70, customer_ext: 200, your_ext: 140, margin: 60, margin_pct: 0.30}
    aggregate: {rows: ["2x100/70", "3x50/40"], customer: 350, your: 260, margin: 90, margin_pct: 0.2571428571428571}
    quote_separation: {qty: 10, customer: 100, your: 1, quote_material_basis: 1000, pnl_snapshot_cost: 10}

  invalid_semantics:
    invalid_inputs: [NaN, Infinity, -Infinity, "Infinity", "NaN", "abc", negative]
    invalid_must_not_become_zero: true
    zero_is_valid: true
    invalid_higher_priority_must_not_fall_through: true

  reconciliation:
    precedence: [actualCost, procurementCostSnapshot, unitCost_estimate]
    fixture:
      A: {qty: 1, estimate: 100, snapshot: 80, actual: 90}
      B: {qty: 2, estimate: 100, snapshot: 70}
      C: {qty: 3, estimate: 50}
    expected: {used: 380, estimate: 450, variance: -70, actual_count: 1, snapshot_count: 1, fallback_count: 1}

mandatory_checks:
  - inventory_all_writes_to_materialsUsed_unitCost
  - inventory_all_writes_to_procurementCostSnapshot
  - classify_each_write_explicit_vs_implicit
  - verify_catalog110_55_and_job100_70_survive_save_reload
  - verify_export_import_normalization_does_not_reconnect_catalog_and_job
  - verify_manual_material_preservation
  - verify_snapshot_refresh_is_explicit
  - verify_calculate_nonmutation
  - verify_Method_A
  - verify_Quote_validity_and_print
  - verify_Job_Profitability
  - verify_labor
  - verify_burden
  - verify_Small_Tools
  - verify_Equipment
  - verify_Subcontractors
  - verify_Change_Orders
  - verify_T_and_M
  - verify_company_ACR_validation
  - verify_Texas_ACR_vs_TECL_separation
  - verify_service_worker_cache
  - inspect_CI_run_34995112030
  - verify_post_67952a6_commits_are_production_net_noop_or_intended

expected_pr_net_diff:
  count: 9
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
  forbidden_net_diff:
    - README
    - scripts/
    - .github/workflows/
    - unrelated_assets

evidence_classification:
  allowed_labels:
    - EXECUTABLE_CORE
    - EXECUTABLE_INTEGRATION
    - SOURCE_ASSERTION
    - WEAK_STRING_ASSERTION
  green_ci_is_not_sufficient_for_acceptance: true
  source_grep_is_not_runtime_proof: true
  browser_claim_requires_actual_execution: true
  if_browser_unavailable_report: NOT_PERFORMED

severity:
  P0:
    - implicit_catalog_or_margins_to_historical_job_mutation
    - your_cost_to_quote_contamination
    - invalid_to_zero
    - false_gp
    - silent_underpricing
    - compliance_bypass
  P1:
    - wrong_fallback_provenance
    - persistence_loses_catalog_job_separation
    - significant_lifecycle_or_integration_coverage_gap
  P2:
    - minor_nonfinancial_noncompliance_issue
  any_P0_forces_verdict: C

report_sections_required:
  - Executive_Verdict
  - Repository_State
  - Audited_SHA
  - Changed_Files
  - CI_Provenance
  - Browser_DOM_Result
  - Findings_Table
  - Catalog_Job_Lifecycle
  - Blank_Your_Cost_and_Fallback_Provenance
  - Dual_Pricing
  - Apply_Mapping
  - Persistence
  - Material_Reconciliation
  - Profitability
  - Method_A_and_Quote
  - Regression_Sweep
  - Service_Worker
  - Test_Quality
  - Unsafe_Financial_Coercion_Sweep
  - Job_Material_Write_Inventory
  - Merge_Blockers
  - Non_Blocking_Follow_Ups
  - Final_Verdict
```

## EXECUTION CONTRACT

1. Resolve and verify actual PR HEAD before auditing.
2. If actual HEAD != `expected_head_sha`, do not silently audit another revision; report mismatch as blocker unless task context explicitly permits it.
3. Audit independently. Prior reports are historical evidence only, never authority.
4. Write the complete report to a new history file using the retention pattern.
5. Verify the new report write succeeded.
6. Replace `audits/PR22_FINAL_ACCEPTANCE_AUDIT.md` with the exact same complete report.
7. Verify alias write succeeded.
8. Keep only the 3 newest complete history reports; delete older history reports from audit branch only.
9. Return only the configured final chat schema.
