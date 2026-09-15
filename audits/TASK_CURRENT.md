# AUDIT TASK CHANNEL

```yaml
protocol: bruno-ac-audit-v1
repository: kot0070/bruno-ac-pwa
production_pr: 22
production_branch: feature/financial-integrity-texas-acr-docs
audit_branch: audit/pr22-603cbca
report_dir: audits/history
retain_reports: 3
current_report_alias: audits/PR22_FINAL_ACCEPTANCE_AUDIT.md
rules:
  - read_this_file_first
  - audit_only_production_tree
  - do_not_modify_production_code
  - do_not_modify_production_branch
  - do_not_modify_pr_22
  - do_not_merge
  - do_not_fix_findings
  - full_report_goes_to_github_not_chat
  - save_report_as: audits/history/PR22_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
  - update_current_report_alias_with_same_full_report
  - after_successful_save_keep_only_3_newest_history_reports
  - delete_older_history_reports_only_from_audit_branch
  - chat_response_only: verdict,audited_head,blockers,report_link
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
verdict_scale:
  A: ACCEPT
  B: ACCEPT_AFTER_MINOR_FIXES
  C: REJECT_REWORK_REQUIRED
```

Perform a fully independent final acceptance audit of PR #22 at the actual current production HEAD. Do not trust prior audit conclusions, PR description, commit messages, green CI, comments, or tests as authority; production code and observable behavior are authority.

### Mandatory acceptance invariants

1. **Historical Job immutability / lifecycle**
   - Start Catalog Customer=100, Your=70.
   - Explicit Calculator Apply => Job `unitCost=100`, `procurementCostSnapshot=70`.
   - Change Catalog to Customer=110, Your=55.
   - WITHOUT Calculator Apply/Re-Apply, Job MUST remain `100/70`; Method A/Quote must still use 100-side Job pricing; P&L snapshot must still use 70.
   - Only AFTER explicit Calculator Apply/Re-Apply may Job become `110/55`.
   - Perform the same lifecycle check for Catalog Customer Price edited from Margins UI.
   - Any implicit Catalog/Margins -> existing Job `materialsUsed[].unitCost` mutation is P0 and verdict C.

2. **Blank Your Cost provenance**
   - Catalog Customer=50, Your Cost blank/missing.
   - Blank must remain semantically blank upstream/persisted.
   - Calculator may resolve Your=50, but source MUST be `customer-price-fallback`, not `catalog-your-cost`.
   - Change Customer to 60 while Your remains blank; Calculator preview must resolve 60/60 fallback, proving fallback was not materialized stale as 50.

3. **Dual-pricing separation**
   - Customer track: Catalog `unitCost` -> Calculator `customerUnitPrice` -> Job `unitCost` -> Method A -> Quote.
   - Internal track: Catalog `yourCost` -> Calculator `yourUnitCost` -> Job `procurementCostSnapshot` -> P&L.
   - Actual track: `actualCost` overrides snapshot in P&L only.
   - Your Cost must never enter Quote/Method A.
   - Calculator must never create `actualCost`.

4. **Numeric fixtures**
   - qty2 Customer100 Your70 => Customer Ext 200, Your Ext 140, Margin 60, Margin%=30%.
   - Aggregate rows 2x100/70 and 3x50/40 => Customer350, Your260, Margin90, Margin%=25.714285714...%.
   - Adversarial quote fixture Customer100, Your1, qty10 => quote-side material basis 1000, P&L snapshot cost 10.

5. **Strict invalid semantics**
   - Check NaN, +/-Infinity, "Infinity", "NaN", "abc", negatives across Customer Price, Your Cost, actualCost, snapshot paths.
   - Invalid must not silently become plausible zero.
   - Real zero remains valid zero.
   - Explicit invalid higher-priority cost must not fall through to lower-priority source.

6. **Material reconciliation**
   - Precedence: Actual -> Snapshot -> Estimate fallback.
   - Fixture: A qty1 est100 snap80 actual90; B qty2 est100 snap70; C qty3 est50.
   - Expected used=380, estimate=450, variance=-70, source counts actual1/snapshot1/fallback1.

7. **Write inventory**
   - Inventory every production write to `materialsUsed[].unitCost` and every write to `procurementCostSnapshot`.
   - Classify each as explicit lifecycle action vs implicit/background propagation.
   - Unexpected implicit propagation is blocking.

8. **Persistence / reload**
   - Verify Catalog110/55 can coexist with historical Job100/70 across save/reload until explicit Apply/Re-Apply.
   - Verify export/import or normalization does not reconnect them implicitly.

9. **Regression sweep**
   - Recheck Method A, Quote validity/print, Job Profitability, labor, burden, Small Tools, Equipment, Subcontractors, Change Orders, T&M, company/ACR validation, Texas ACR/TECL separation, service worker/cache, manual material preservation, snapshot refresh, Calculate nonmutation.

10. **CI provenance / final tree**
   - Inspect authoritative lifecycle run `34995112030`.
   - Verify production commit `67952a6bc3504aeb2ea580dcc10fccf4318a6aa8` and later commits through current HEAD did not alter intended production behavior.
   - Expected PR net diff remains exactly 9 files: `ac-calculator-engine.js`, `ac-calculator.css`, `ac-calculator.html`, `ac-calculator.js`, `financial-integrity-core.js`, `index.html`, `sw.js`, `tests/ac-calculator-pricing.test.js`, `tests/financial-integrity.test.js`.
   - README, scripts, workflows, unrelated assets must not be in production PR net diff.

11. **Test quality**
   - Classify evidence as EXECUTABLE CORE / EXECUTABLE INTEGRATION / SOURCE ASSERTION / WEAK STRING ASSERTION.
   - Determine whether the lifecycle fixture genuinely proves `100/70 -> Catalog110/55 -> Job unchanged -> explicit re-Apply -> Job110/55`.
   - Do not treat grep/source assertions as runtime proof.

12. **Browser/DOM honesty**
   - If actual browser execution is available, run the lifecycle interactively.
   - If unavailable, report `NOT PERFORMED`; do not fabricate browser results.

### Severity gate

- P0: implicit Catalog/Margins -> historical Job mutation; Your Cost -> Quote contamination; invalid -> zero; false GP; silent underpricing; compliance bypass.
- P1: wrong fallback provenance; persistence loses Catalog-vs-Job distinction; significant lifecycle/integration coverage gap.
- P2: minor non-financial/non-compliance issue.

Any P0 => verdict C.

### Full report requirements

The saved Markdown report must include at minimum: Executive Verdict, Repository State, Audited SHA, Changed Files, CI Provenance, Browser/DOM Result, Findings Table, Catalog/Job Lifecycle, Blank Your Cost/Fallback Provenance, Dual Pricing, Apply Mapping, Persistence, Material Reconciliation, Profitability, Method A/Quote, regression sections, Service Worker, Test Quality, Unsafe Financial Coercion Sweep, Job Material Write Inventory, Merge Blockers, Non-Blocking Follow-Ups, Final Verdict.

## REPORT RETENTION

Keep the 3 newest complete reports in `audits/history/`. After the newest report is successfully written and verified, delete older history reports beyond the newest 3 from the audit branch only.

Also replace `audits/PR22_FINAL_ACCEPTANCE_AUDIT.md` with the same newest complete report so it remains the stable latest-report alias.
