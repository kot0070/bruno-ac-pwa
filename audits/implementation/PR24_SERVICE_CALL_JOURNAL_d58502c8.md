# PR24 — SERVICE CALL JOURNAL UX IMPLEMENTATION REPORT

```yaml
status: DONE
repository: kot0070/bruno-ac-pwa
production_pr: 24
production_branch: feature/service-call-journal-ux
base_branch: main
base_sha: 492e0340ac6926d4280f043b6d3305a0ec965fd2
implementation_head: d58502c884db66e5bd7c65a004db5ef4097a8be7
merged: false
draft: true
```

## Objective

Convert the existing Dispatch/day-journal first sheet into a mobile-first `Service Call Journal` without rewriting dispatch persistence/business logic.

The user-visible problem was information hierarchy: `Tax settings` appeared before the actual day journal and dominated the mobile screen, while the primary field workflow (choose day -> add call -> review totals/calls) was visually secondary.

## Architecture

```yaml
approach: presentation_layer_over_existing_authoritative_DOM
business_logic_rewrite: false
persisted_schema_change: false
index_dispatch_logic_change: false
financial_core_change: false
```

`service-journal-ux.js` enhances the existing `#panel-dispatch` after DOM load. Existing inputs, table rows, event handlers, `state.dispatch`, tax settings, save/load logic, week strip and net calculations remain authoritative.

## Final production diff

```yaml
files:
  - service-journal-ux.js
  - workspace-v5.js
  - sw.js
  - tests/service-journal-ux.test.js
forbidden_temp_workflow_present: false
index_html_changed: false
financial_integrity_core_changed: false
ac_calculator_engine_changed: false
ac_calculator_js_changed: false
```

## UX changes

```yaml
service_call_journal:
  panel_title: Service Call Journal
  subtitle: Daily calls · hours · gross · estimated net
  concise_intro: true
  information_order:
    - day_calendar
    - service_calls
    - tax_settings_collapsed

primary_action:
  label: + Add Service Call
  behavior: forwards_click_to_existing_#disp-add
  duplicate_business_handler: false

calendar:
  existing_date_control_preserved: true
  existing_prev_next_today_preserved: true
  existing_week_strip_preserved: true
  existing_day_totals_preserved: true
  mobile_weekday_input_hidden_as_redundant: true

service_calls:
  existing_#disp-table_preserved_as_source_of_truth: true
  existing_row_inputs_preserved: true
  existing_edit_delete_sort_handlers_preserved: true
  mobile_layout: card_style_via_CSS
  empty_state_added: true

tax_settings:
  controls_preserved: true
  calculations_preserved: true
  wrapped_in_details: true
  collapsed_by_default: true
  compact_summary: jurisdiction_and_effective_rate_when_resolvable
```

## Data / financial safety

```yaml
state_dispatch_schema: unchanged
localStorage_compatibility: preserved
existing_tax_formula: unchanged
existing_net_calculation: unchanged
existing_cancelled_call_semantics: unchanged
existing_week_strip_semantics: unchanged
Quote_Method_A: untouched
financial_integrity_core: untouched
AC_calculator_financial_tracks: untouched
```

## Loader / PWA delivery

`workspace-v5.js` now loads `./service-journal-ux.js` once after the normal workspace setup. It uses a same-origin script under the existing CSP (`script-src 'self'`).

```yaml
service_worker_cache: bruno-ac-v35
precached_asset: ./service-journal-ux.js
existing_workspace_asset_precached: ./workspace-v5.js
```

## Observer behavior

The new UX layer uses only narrow observers:

```yaml
tbody_observer:
  observes: childList_only
  callback: update_empty_state_outside_tbody
  self_trigger_loop: not_expected

day_totals_observer:
  observes: childList_and_subtree
  callback: update_tax_meta_outside_day_totals
  self_trigger_loop: not_expected
```

No observer callback writes into the node it observes.

## Tests / CI

Temporary validation workflow commit:
`8166737ca61836103d0463a47c6c90e1d56cf249`

GitHub Actions run:
`35021139574`

Result: SUCCESS.

Successful steps:

```yaml
- financial-integrity
- calculator-pricing
- pr22-lifecycle-integration
- calculator-review-ux
- service-journal-ux
- JS_syntax_checks
```

After CI passed, `.github/workflows/pr24-service-journal-validation.yml` was deleted. Final production HEAD:
`d58502c884db66e5bd7c65a004db5ef4097a8be7`

The post-CI commit only removes the temporary workflow; production files remain the validated implementation.

## Test file

`tests/service-journal-ux.test.js` verifies compact tax-summary helper behavior including TX/effective rate, label fallback, and no-settings fallback.

This helper test does not claim browser DOM integration coverage. Browser behavior must be independently audited if browser runtime is available.

## Required independent audit focus

```yaml
- exact_PR24_HEAD_matches_d58502c884db66e5bd7c65a004db5ef4097a8be7
- calendar_and_service_calls_render_before_tax_settings
- tax_settings_are_collapsed_by_default_and_existing_controls_remain_inside
- primary_Add_Service_Call_forwards_to_existing_disp_add_without_duplicate_data_write
- existing_dispatch_table_remains_authoritative
- mobile_table_rows_present_as_readable_cards
- empty_state_updates_after_add_delete_day_change
- existing_date_prev_next_today_week_strip_and_totals_still_operate
- existing_tax_and_net_calculation_semantics_unchanged
- workspace_loader_loads_asset_once_under_CSP
- service_worker_v35_precaches_new_asset
- no_observer_self_trigger_loop
- final_diff_has_no_temporary_workflow
- financial_and_AC_calculator_regression_gates_remain_intact
```

## Merge state

```yaml
merge_ready_by_implementation_author: pending_independent_audit
merge_performed: false
```
