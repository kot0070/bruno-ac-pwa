# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
implementation_report: audits/implementation/PR25_CODE_LIBRARY_RULE_REGISTRY_90ebe4d2.md
read_order:
  - audits/WORKSPACE.md
  - audits/CONTEXT.md
  - audits/HANDOFF.md
  - audits/implementation/PR25_CODE_LIBRARY_RULE_REGISTRY_90ebe4d2.md
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
task_id: PR25_CODE_LIBRARY_ACCEPTANCE_01
mode: independent_code_library_acceptance_audit
repository: kot0070/bruno-ac-pwa
production_pr: 25
production_branch: feature/code-library-rule-registry
base_branch: main
base_sha: 6f48420748da960d977d036bcc1be83a12ec4872
target_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
last_accepted_main: 6f48420748da960d977d036bcc1be83a12ec4872
status: ACTIVE
```

## OBJECTIVE

Independently determine whether PR #25 provides a reliable, traceable Code Library + Rule Registry foundation for Texas HVAC 2026 without misrepresenting regulatory requirements, copying full copyrighted code books, or regressing accepted financial, AC Calculator, job-lifecycle, or Service Call Journal behavior.

Implementation report is context only. Official regulatory sources, production code, executable tests, CI evidence, and observable behavior are authority.

PR25 is foundation infrastructure only. It does NOT yet implement room-by-room calculations and the AC Calculator engine does NOT yet consume the rule map. Do not treat absence of those future capabilities as a defect in this scoped PR.

## REGULATORY BASELINE — INDEPENDENTLY VERIFY

```yaml
Texas_ACR_2026:
  claim:
    effective_date: 2026-09-01
    adopted_reference_editions:
      - 2024_IRC
      - 2024_IMC
      - 2024_IFGC
      - 2024_UMC
  primary_source: https://www.tdlr.texas.gov/news/rulemaking/2026/08/31/commission-adopts-rules-11/

Texas_Electrical_2026:
  claim:
    effective_date: 2026-09-01
    state_electrical_code: 2026_NEC
    texas_modification_present: true
  primary_source: https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/
```

Audit must independently check these claims against the official TDLR material. If an implementation summary is materially stronger than its source, classify the overstatement.

## REQUIRED REGISTRY CHECKS

```yaml
registry_file: code-library/texas-hvac-2026.json
expected:
  schemaVersion: 1
  libraryId: tx-hvac-2026
  jurisdiction_state: TX
  effectiveDate: 2026-09-01
  lastVerified: 2026-09-15
  adopted_code_records: 6
  rule_records: 8
  fullCopyrightedCodeTextStored: false
  summaryOnly: true
  officialLinksPreferred: true
  localAhjAlwaysVerify: true
```

Verify:
- all adopted-code IDs unique;
- all rule IDs unique;
- required identity/title/section/summary fields present;
- all source URLs are HTTPS;
- source authority and edition metadata are coherent;
- local AHJ verification remains explicit;
- summaries are concise implementation descriptions, not copied full code text;
- no full IRC / IMC / IFGC / UMC / NEC book or large copyrighted extracts appear in the production diff.

## RULE MAP / TRACEABILITY

```yaml
core_file: code-rule-registry.js
required_exports:
  - CALCULATOR_RULE_MAP
  - validateLibrary
  - indexLibrary
  - findRule
  - searchRules
  - normalizeRuleIds
  - resolveRuleIds
  - calculatorRuleIds
  - validateCalculatorMap
  - coverage
```

Must verify:
- every rule ID referenced by `CALCULATOR_RULE_MAP` resolves in the registry;
- duplicates are normalized safely;
- unknown future calculator keys do not falsely resolve;
- search/filter behavior is deterministic;
- coverage helper distinguishes mapped vs unmapped entities;
- the implementation does NOT falsely claim that `ac-calculator-engine.js` currently consumes the rule map.

Representative mappings to inspect:

```yaml
sqft-sizing:
  - IRC-M1401.3-EQUIPMENT-SIZING
condensate-drain:
  - IRC-M1411.9-CONDENSATE
overflow-protection:
  - IRC-M1411.9.1-OVERFLOW
  - LOCAL-AHJ-VERIFY
disconnect:
  - NEC-2026-TX-ADOPTION
  - LOCAL-AHJ-VERIFY
```

## CODE LIBRARY UX

```yaml
file: code-library-ux.js
expected_location: AC_Tools_secondary_navigation
entry_label: Code Library
```

Verify:
- panel is reachable under AC Tools;
- leaving AC Tools deactivates the custom Code Library panel and does not leave stale active navigation state;
- returning to other AC Tools tabs still works;
- registry integrity status is understandable;
- adopted-code cards render edition/effective-date/source information;
- search works across ID/family/edition/section/title/summary/tags;
- family filter works;
- external source links use the registry URLs and `noopener`;
- local registry JSON link is present;
- no production job state/localStorage is mutated by viewing/searching the library;
- registry fetch failure is non-destructive and does not disable the estimator/calculator.

## OBSERVER / LOADER SAFETY

```yaml
workspace_loader: workspace-v5.js
load_order:
  - code-rule-registry.js
  - code-library-ux.js
```

Verify:
- same-origin CSP-compatible asset loading;
- asset loading is idempotent / not duplicated;
- UI initialization is idempotent;
- MutationObserver does not produce a self-triggering mutation loop;
- Code Library state cannot keep unrelated panels hidden after normal navigation.

## PWA / OFFLINE DELIVERY

```yaml
service_worker:
  expected_cache: bruno-ac-v36
  expected_new_assets:
    - ./code-rule-registry.js
    - ./code-library-ux.js
    - ./code-library/texas-hvac-2026.json
```

Verify new files are cached and no previously accepted critical shell assets were removed.

## FINAL DIFF / SCOPE

```yaml
expected_changed_files_exactly:
  - code-library-ux.js
  - code-library/texas-hvac-2026.json
  - code-rule-registry.js
  - sw.js
  - tests/code-rule-registry.test.js
  - workspace-v5.js
forbidden_final_artifacts:
  - .github/workflows/pr25-code-library-validation.yml
  - temporary_scripts
must_remain_unchanged_from_base:
  - index.html
  - navigation-v2.js
  - financial-integrity-core.js
  - ac-calculator-engine.js
  - ac-calculator.js
  - ac-calculator-review-ux.js
  - service-journal-ux.js
```

## EXECUTABLE / CI EVIDENCE

Implementation report references final validation run `35024484325` at commit `5035fe1a58a42635e7b1d5198fac3507526d50da`.

Independently inspect run/job evidence. Expected successful steps:

```yaml
- code-rule-registry
- financial-integrity
- calculator-pricing
- pr22-lifecycle-integration
- calculator-review-ux
- service-journal-ux
- JS_syntax_checks
```

Then compare validated commit to target HEAD. The only intended post-CI production-branch change is deletion of `.github/workflows/pr25-code-library-validation.yml`.

## REGRESSION GATES

```yaml
must_remain_true:
  - Quote_Method_A_unchanged
  - Customer_Price_to_Job_unitCost_to_Quote
  - Your_Cost_to_procurementCostSnapshot_to_PnL
  - actualCost_overrides_snapshot_in_PnL_only
  - invalid_financial_never_silently_becomes_zero
  - historical_job_values_change_only_after_explicit_lifecycle_action
  - AC_Calculator_PR23_behavior_unchanged
  - Service_Call_Journal_PR24_behavior_unchanged
  - persisted_job_schema_unchanged
```

## BROWSER / MOBILE RUNTIME

```yaml
preferred: true
if_available:
  verify:
    - open_AC_Tools
    - Code_Library_tab_appears
    - open_Code_Library
    - registry_loads
    - adopted_code_cards_render
    - search_and_family_filter_work
    - official_links_have_correct_targets
    - leave_AC_Tools_and_confirm_panel_state_clears
    - return_to_AC_Calculator_and_Reference
    - no_console_error_or_mutation_loop
    - core_job_and_calculator_workflows_remain_available
if_unavailable:
  report_exactly: NOT_PERFORMED
  do_not_invent_browser_results: true
```

## SEVERITY

```yaml
P0:
  - financial_or_job_data_regression
  - code_library_breaks_core_app_initialization
  - materially_false_adopted_code_baseline_that_can_drive_unsafe_compliance_conclusion
  - full_copyrighted_code_book_or_substantial_protected_text_improperly_committed
P1:
  - Code_Library_unreachable
  - calculator_rule_map_contains_missing_or_wrong_rule_IDs
  - materially_wrong_or_broken_primary_official_source_link
  - navigation_state_can_hide_or_break_other_app_panels
  - self_triggering_observer_loop
  - PWA_does_not_deliver_required_Code_Library_assets
  - implementation_claims_rule_engine_integration_that_does_not_exist
P2:
  - minor_copy_metadata_spacing_or_noncritical_source-link issue without compliance or workflow impact
```

## REQUIRED REPORT

```yaml
report_path_template: audits/history/PR25_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
minimum_sections:
  - Executive_Verdict
  - Repository_State
  - Exact_Audited_SHA
  - Final_Diff
  - Texas_2026_Regulatory_Baseline
  - Copyright_And_Source_Policy
  - Registry_Schema
  - Rule_ID_Integrity
  - Calculator_Rule_Map
  - Code_Library_UX
  - Navigation_And_Observer_Safety
  - Loader_And_Service_Worker
  - Test_CI_Evidence
  - Financial_And_Product_Regression_Gates
  - Browser_Runtime_Result
  - Findings
  - Merge_Blockers
  - Final_Verdict
```

After successful report write: update `audits/LATEST_AUDIT.md`, update `audits/HANDOFF.md`, enforce history retention, and return only VERDICT / AUDITED HEAD / BLOCKERS / FULL REPORT.

Do not modify PR #25 or production code. Do not merge.
