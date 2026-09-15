# PR #23 — AC Calculator UX Acceptance Audit

## Executive_Verdict

```yaml
verdict: B_ACCEPT_AFTER_MINOR_FIXES
merge_ready: false
highest_severity: P1
audited_head: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
production_pr: 23
browser_runtime: NOT_PERFORMED
blockers:
  - F01_self_triggering_review_sync_loop
```

PR #23 materially fixes the original contradictory green/current UX in static source: selected unresolved/invalid rows are reclassified as `action-required`, visible Apply is disabled, blocker count/label/type/help are surfaced, valid $0 rows are separated into `review-required`, deselected blockers do not participate, stale/dirty ownership remains with the existing UX layer, references are collapsed, and the new asset is delivered by service worker v33.

However, the new review layer contains a self-triggering DOM synchronization loop. `sync()` mutates nodes/classes inside both observed targets (`#bomBody` and `#phase1CalcState`), while `MutationObserver`s on those same targets immediately schedule `sync()` again. Once a calculation is in `ready`, `action-required`, or `review-required`, the review layer can continuously schedule zero-delay synchronization passes. This is a P1 runtime/UX defect and a merge blocker until corrected and re-audited.

## Repository_State

```yaml
repository: kot0070/bruno-ac-pwa
base_branch: main
base_sha: e54d642171ed0b342aba0fe2230f3fdeaa82ad06
production_branch: feature/ac-calculator-ux-clarity
production_pr: 23
pr_state: open
pr_draft: true
pr_head_verified: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
target_head_matches_task: true
production_mutated_by_audit: false
merge_performed: false
```

## Exact_Audited_SHA

`2a6a74637a1aecc1b82144508c9733c9b0d4abfa`

The live PR #23 head matched `TASK_CURRENT.md` exactly at audit time.

## Final_Diff

```yaml
changed_files_exactly:
  - ac-calculator-review-ux.js
  - ac-calculator.html
  - sw.js
  - tests/ac-calculator-review-ux.test.js
scope_matches_TASK_CURRENT: true
financial_engine_files_changed: false
```

Verified unchanged blob identities between base and audited head:

```yaml
ac-calculator-engine.js: b8e77a86cc93d146874c7f113ebbaf9475ed6045
ac-calculator.js: 32fec3ffdbc4d555c0ef1ef6b7e111af3838c2a7
financial-integrity-core.js: add848311b3aab8a6a5794d34d112024be8c4ba4
```

## User_Failure_Reproduction

Static code-path reproduction of the original state:

```yaml
fixture: selected_3_with_1_unresolved
review_state:
  mode: action-required
  hard_blockers: 1
  attention: 1
visible_apply_disabled: true
pricing_reason_visible: true
contradictory_green_current_state_removed: true
```

`deriveReviewState()` treats the unresolved selected row as a hard blocker. `sync()` changes the status from green/current to an explicit blocking message, disables `#phase1Apply`, and adds a reason below blocked pricing totals.

## Ready_Action_Review_State_Matrix

| State | Trigger | Banner semantics | Visible Apply | Result |
|---|---|---|---|---|
| ready | selected rows have no unresolved/invalid/zero-review rows | selected BOM ready to apply | follows underlying Apply availability | PASS static |
| action-required | selected unresolved or invalid financial | explicit blocker count before Apply | disabled | PASS static |
| review-required | selected valid $0 row(s), no hard blockers | explicit valid-$0 review | allowed subject to underlying Apply + existing confirmation | PASS static |
| dirty/stale | project inputs changed after explicit calculate | existing UX owns dirty/stale messaging | disabled | PASS static |

## Attention_Panel

```yaml
selected_attention_only: true
row_label_visible: true
issue_type_visible: true
corrective_help_visible: true
jump_to_row_implemented: true
deselect_action_implemented: true
runtime_interaction_verified: false
```

The panel filters `m.selected && (m.unresolved || m.invalid || m.zero)`. Labels come from the BOM requirement row. Issue types are explicit and distinct. Corrective actions explain match/fix/deselect or $0 confirmation semantics.

## Selected_Only_Semantics

PASS static.

`deriveReviewState()` first filters to selected items. DOM state uses the current `.bomsel.checked` value. The unit fixture also includes a deselected invalid row and expects it not to increment `invalid`, `hard`, or `attention`.

## Stale_Dirty_State

PASS static for ownership/gating.

The pre-existing `ac-calculator-ux.js` sets `phase1CalcState` to `dirty`, disables `phase1Apply`, and marks the result/BOM stale when inputs change. The new review layer only treats status classes `ready`, `action-required`, or `review-required` as calculated. When status is `dirty`, `sync()` returns before reclassifying the state, so old attention semantics do not overwrite dirty/stale semantics.

## Zero_Price_Review

PASS static.

A selected row with valid zero pricing and no unresolved/invalid flag becomes `review-required`, not a hard blocker. Visible Apply follows the underlying hidden Apply availability. The existing `applyToJob()` confirmation path remains unchanged and still asks for explicit confirmation before applying legitimate $0 rows.

## Mobile_Usability

PASS static for requested diagnosis semantics.

The review layer adds plain-language per-row status and help directly into the requirement cell, including:

```yaml
ready: "Ready"
unresolved: "Unresolved catalog match"
invalid: "Invalid financial data"
zero: "Valid $0 pricing — review required"
```

At mobile width the review counts collapse to two columns and attention actions flex. Basic diagnosis is present in the requirement cell and top attention panel rather than requiring the user to interpret money columns.

## Reference_Collapse

PASS static.

The existing `Why / references used` heading and list are moved, not deleted, into a `<details>` element with no `open` attribute. Therefore reference content is preserved and collapsed by default, while counts/attention content appears before it.

## Service_Worker

PASS.

```yaml
cache_name: bruno-ac-v33
asset_cached: ./ac-calculator-review-ux.js
```

## Test_Quality

```yaml
deriveReviewState_pure: true
helper_exported_for_node_test: true
ready_fixture: present
unresolved_fixture: present
invalid_fixture: present
zero_fixture: present
mixed_fixture: present
deselected_invalid_does_not_block: covered
ci_status_contexts: none
browser_dom_integration_test: absent
```

The pure helper test coverage requested by `TASK_CURRENT.md` is present. The test file is deterministic and does not depend on browser state. No commit status/check context was present for the audited head at audit time, so this audit does not claim CI execution evidence.

The unit test does not exercise the DOM/observer integration, which is exactly where F01 exists.

## Financial_Regression_Gates

PASS by unchanged production financial/lifecycle implementation plus exact-scope verification.

```yaml
ac-calculator-engine.js_unchanged_from_main: true
ac-calculator.js_unchanged_from_main: true
financial-integrity-core.js_unchanged_from_main: true
Customer_Price_to_Job_unitCost_to_Quote: preserved_from_accepted_baseline
Your_Cost_to_procurementCostSnapshot_to_PnL: preserved_from_accepted_baseline
actualCost_overrides_snapshot_in_PnL_only: preserved_from_accepted_baseline
Calculator_never_creates_actualCost: preserved_from_accepted_baseline
invalid_financial_never_silently_becomes_zero: preserved_from_accepted_baseline
legitimate_zero_remains_valid: preserved_from_accepted_baseline
Catalog_or_Margins_edit_does_not_mutate_historical_Job_without_explicit_reapply: preserved_from_accepted_baseline
Calculate_preview_does_not_mutate_Job_Materials: preserved_from_accepted_baseline
manual_material_rows_survive_reapply: preserved_from_accepted_baseline
```

No production file capable of changing those accepted semantics is in PR #23's net diff.

## Browser_Runtime_Result

NOT_PERFORMED

No browser-capable runtime was available in this audit execution. No browser interaction result is inferred or invented.

## Findings

### F01 — P1 — self-triggering MutationObserver synchronization loop

```yaml
severity: P1
merge_blocker: true
file: ac-calculator-review-ux.js
area:
  - sync()
  - decorateRows()
  - status MutationObserver
  - bomBody MutationObserver
mechanism:
  - observer_on_status_schedules_sync
  - sync_sets_status.className_and_status.textContent
  - those_writes_are_observed_and_schedule_sync_again
  - observer_on_bomBody_schedules_sync
  - sync/decorateRows_sets_descendant_className_and_textContent
  - those_writes_are_observed_and_schedule_sync_again
result: continuous_zero_delay_resynchronization_after_calculated_state
```

Evidence from source:

1. `new MutationObserver(queueSync).observe(status,{attributes:true,childList:true,subtree:true,attributeFilter:['class']})` observes the status element.
2. Every calculated `sync()` branch writes `status.className` and `status.textContent`.
3. `new MutationObserver(queueSync).observe(bomBody,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})` observes BOM descendants.
4. `decorateRows()` writes descendant `pill.className`, `pill.textContent`, and `help.textContent` on every synchronization pass.
5. `queueSync()` uses `setTimeout(...,0)` and resets its `queued` guard before calling `sync()`, so mutations produced by `sync()` can queue the next pass indefinitely.

Impact: persistent CPU/event-loop churn and repeated DOM writes while the calculation is current. This undermines mobile usability and runtime stability even though the semantic state shown on each pass is otherwise correct.

Required correction: prevent review-owned DOM writes from retriggering synchronization (for example by disconnecting observers during render, observing only authoritative upstream mutations, or only writing when a value actually changes with an observer design that cannot self-trigger). Add a DOM-level regression test if practical.

## Merge_Blockers

```yaml
blockers:
  - id: F01
    severity: P1
    requirement: eliminate_self_triggering_review_sync_loop_and_reaudit_exact_new_HEAD
```

No P0 financial/integrity blocker was found.

## Final_Verdict

```yaml
verdict: B_ACCEPT_AFTER_MINOR_FIXES
merge: BLOCKED
reason: one_localized_P1_runtime_defect_in_new_review_layer
production_financial_regression: not_found
re_audit_required: true
```

The UX design and state semantics satisfy the task substantially, but PR #23 should not be merged at `2a6a74637a1aecc1b82144508c9733c9b0d4abfa`. Fix F01 on the production branch, produce a new exact HEAD, and run a focused independent re-audit.