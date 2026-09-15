# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
implementation_report: audits/implementation/PR24_SERVICE_CALL_JOURNAL_d58502c8.md
read_order:
  - audits/WORKSPACE.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/implementation/PR24_SERVICE_CALL_JOURNAL_d58502c8.md
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
task_id: PR24_SERVICE_CALL_JOURNAL_ACCEPTANCE_01
mode: independent_ux_acceptance_audit
repository: kot0070/bruno-ac-pwa
production_pr: 24
production_branch: feature/service-call-journal-ux
base_branch: main
base_sha: 492e0340ac6926d4280f043b6d3305a0ec965fd2
target_head: d58502c884db66e5bd7c65a004db5ef4097a8be7
last_accepted_main: 492e0340ac6926d4280f043b6d3305a0ec965fd2
status: ACTIVE
```

## OBJECTIVE

Independently determine whether PR #24 makes the existing Dispatch/day-journal first sheet substantially more comfortable and mobile-friendly as a `Service Call Journal` while preserving all existing dispatch/tax/persistence semantics.

Implementation report is context only. Production source, observable behavior, executable tests and CI evidence are authority.

## USER PROBLEM TO VERIFY

```yaml
before_PR24:
  top_of_screen_dominated_by: Tax_Settings
  primary_service_call_workflow_visually_secondary: true
  mobile_table_feels_like_desktop_form: true
  user_goal: quickly_view_day_add_call_review_hours_gross_net
```

Expected information hierarchy:

```yaml
order:
  - day_calendar_and_day_totals
  - primary_Add_Service_Call_action
  - service_calls
  - Tax_Settings_collapsed_secondary
```

## REQUIRED UX CHECKS

```yaml
checks:
  - id: service_journal_reframe
    expected:
      panel_title: Service Call Journal
      concise_subtitle: true
      concise_intro: true

  - id: hierarchy
    expected:
      day_card_before_calls_card: true
      calls_card_before_tax_settings: true
      tax_settings_collapsed_by_default: true

  - id: primary_action
    expected:
      visible_label: "+ Add Service Call"
      forwards_to_existing_#disp-add: true
      duplicate_state_write_or_duplicate_call_creation: false

  - id: existing_calendar_preserved
    expected:
      - disp-date_preserved
      - disp-prev_preserved
      - disp-next_preserved
      - disp-today_preserved
      - disp-week_preserved
      - disp-day-totals_preserved

  - id: service_call_data_entry_preserved
    expected:
      - existing_disp_table_is_authoritative
      - disp-time_preserved
      - disp-hours_preserved
      - disp-addr_preserved
      - disp-desc_preserved
      - disp-gross_preserved
      - disp-tax_preserved
      - disp-status_preserved
      - existing_delete_handler_preserved
      - existing_sort_handler_preserved

  - id: mobile_cards
    expected:
      - rows_readable_without_horizontal_desktop_table_workflow
      - plain_labels_for_time_hours_address_description_gross_tax_net_status
      - inputs_remain_editable
      - delete_remains_available

  - id: empty_state
    expected:
      - friendly_message_when_no_data_rows
      - hidden_when_data_rows_exist
      - updates_after_authoritative_tbody_changes

  - id: tax_settings
    expected:
      controls_moved_not_reimplemented: true
      collapsed_by_default: true
      existing_tax_inputs_remain_functional: true
      compact_summary_updates_without_changing_tax_formula: true

  - id: persistence_boundary
    expected:
      state_dispatch_schema_changed: false
      localStorage_compatibility_preserved: true
      index_dispatch_business_logic_changed: false

  - id: observer_safety
    expected:
      tbody_observer_does_not_write_into_tbody: true
      day_totals_observer_does_not_write_into_day_totals: true
      no_self_triggering_mutation_loop: true

  - id: loader
    expected:
      workspace_v5_loads_service_journal_asset_once: true
      same_origin_CSP_compatible: true

  - id: service_worker_delivery
    expected:
      cache_name: bruno-ac-v35
      cached_asset: ./service-journal-ux.js
```

## BROWSER / MOBILE RUNTIME

```yaml
preferred: true
if_available:
  viewport: mobile_phone_width
  verify:
    - open_More_or_Dispatch_and_view_Service_Call_Journal
    - Tax_Settings_not_dominating_first_screen
    - Add_Service_Call_creates_exactly_one_existing_dispatch_row
    - edit_time_hours_address_description_gross_tax_status
    - day_totals_refresh
    - prev_next_today_and_week_strip_still_work
    - tax_details_expand_and_controls_work
    - empty_state_appears_on_empty_day
    - no_console_error_or_observer_loop
if_unavailable:
  report_exactly: NOT_PERFORMED
  do_not_invent_browser_results: true
```

## EXECUTABLE EVIDENCE

Implementation report references temporary GitHub Actions run `35021139574` on commit `8166737ca61836103d0463a47c6c90e1d56cf249`.

Independently inspect run/jobs. Expected successful steps:

```yaml
- financial-integrity
- calculator-pricing
- pr22-lifecycle-integration
- calculator-review-ux
- service-journal-ux
- JS_syntax_checks
```

Then compare validated commit to target HEAD. The only intended post-CI change is deletion of `.github/workflows/pr24-service-journal-validation.yml`.

## FINAL DIFF / SCOPE

```yaml
expected_changed_files_exactly:
  - service-journal-ux.js
  - workspace-v5.js
  - sw.js
  - tests/service-journal-ux.test.js
forbidden_final_artifacts:
  - .github/workflows/pr24-service-journal-validation.yml
  - temporary_scripts
must_remain_unchanged_from_base:
  - index.html
  - financial-integrity-core.js
  - ac-calculator-engine.js
  - ac-calculator.js
  - ac-calculator-review-ux.js
```

## REGRESSION GATES

```yaml
must_remain_true:
  - existing_dispatch_add_edit_delete_sort_semantics
  - existing_tax_formula_and_effective_rate_semantics
  - existing_dispatch_net_calculation
  - cancelled_call_semantics
  - week_strip_semantics
  - dispatch_and_tax_settings_persist_across_existing_storage_flow
  - Quote_Method_A_unchanged
  - Customer_Price_and_Your_Cost_financial_architecture_unchanged
  - AC_Calculator_accepted_PR23_behavior_unchanged
```

## SEVERITY

```yaml
P0:
  - dispatch_data_loss_or_schema_break
  - tax_or_net_calculation_regression
  - financial_integrity_or_quote_regression
P1:
  - Add_Service_Call_creates_duplicate_or_fails
  - primary_day_or_call_controls_broken
  - Tax_Settings_controls_lost_or_nonfunctional
  - mobile_layout_makes_existing_call_editing_unusable
  - self_triggering_observer_loop_or_runtime_churn
  - service_journal_asset_not_delivered_by_PWA
P2:
  - minor_copy_spacing_or_visual_issue_without_workflow_loss
```

## REQUIRED REPORT

```yaml
report_path_template: audits/history/PR24_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
minimum_sections:
  - Executive_Verdict
  - Repository_State
  - Exact_Audited_SHA
  - Final_Diff
  - User_Workflow_Hierarchy
  - Primary_Add_Call_Action
  - Calendar_And_Day_Totals
  - Service_Call_Editing
  - Mobile_Card_Layout
  - Empty_State
  - Tax_Settings
  - Persistence_And_Data_Boundary
  - Observer_Safety
  - Loader_And_Service_Worker
  - Test_CI_Evidence
  - Regression_Gates
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After successful report write: update `audits/LATEST_AUDIT.md`, update `audits/HANDOFF.md`, enforce history retention, and return only VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT.

Do not modify PR #24 or production code. Do not merge.
