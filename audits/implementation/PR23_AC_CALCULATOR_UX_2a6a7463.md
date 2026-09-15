# PR #23 — AC CALCULATOR UX CLARITY IMPLEMENTATION REPORT

```yaml
report_type: implementation
repository: kot0070/bruno-ac-pwa
production_pr: 23
base_branch: main
base_sha: e54d642171ed0b342aba0fe2230f3fdeaa82ad06
feature_branch: feature/ac-calculator-ux-clarity
implementation_head: 2a6a74637a1aecc1b82144508c9733c9b0d4abfa
status: READY_FOR_INDEPENDENT_AUDIT
merge_status: NOT_MERGED
```

## User-visible problem

The AC Calculator could report `Calculation is current` while the selected BOM still contained unresolved or invalid financial rows. Pricing cards then displayed `—`, Apply was effectively blocked, and the user had to scan the page to discover why. Long reference content also appeared before the actionable BOM review area on mobile.

## Implementation strategy

The accepted financial/BOM engine was intentionally left unchanged. A separate review-state UI layer was added so UX interpretation is decoupled from pricing, BOM matching, Apply mapping, Method A, Quote, and P&L semantics.

## Final production diff

```yaml
files:
  - ac-calculator-review-ux.js: added
  - ac-calculator.html: modified_to_load_review_layer
  - sw.js: cache_v32_to_v33_and_cache_new_asset
  - tests/ac-calculator-review-ux.test.js: added
```

Git compare `main...feature/ac-calculator-ux-clarity` at report creation:

```yaml
status: ahead
ahead_by: 4
behind_by: 0
changed_files: 4
additions: 219
deletions: 2
```

## UX behavior implemented

```yaml
review_states:
  ready:
    message: Calculation complete — selected BOM is ready to apply.
  action_required:
    trigger: selected_unresolved_or_invalid_financial
    effect: disable_visible_apply
    message: explicit_blocker_count
  review_required:
    trigger: selected_valid_zero_price
    effect: keep_apply_available_subject_to_existing_zero_confirmation
    message: explicit_zero_review_count
```

Additional UX:

- explicit `Preview only` notice: Calculate does not mutate Job Materials;
- generated / selected / ready / needs-attention counts near result top;
- top `What needs attention` panel for selected unresolved/invalid/$0 rows;
- each attention item exposes `Jump to row` and `Deselect` actions;
- per-row state explanation: Ready / Unresolved catalog match / Invalid financial data / Valid $0 review;
- blocked financial summary cards receive a reason instead of unexplained `—` only;
- `Why / references used` moved into a collapsed disclosure by default;
- selected-only blocker semantics retained;
- stale/dirty calculation state remains owned by existing UX layer and is not reclassified as ready by the review layer;
- service-worker cache version bumped to `bruno-ac-v33`.

## Safety boundary

No changes were made to:

```yaml
untouched:
  - ac-calculator-engine.js
  - ac-calculator.js
  - financial-integrity-core.js
  - BOM_matching_scoring
  - HVAC_scope_generation
  - Customer_Price_track
  - Your_Cost_track
  - procurementCostSnapshot_mapping
  - actualCost_semantics
  - Method_A
  - Quote
  - Job_Profitability
```

## Deterministic test contract

Added `tests/ac-calculator-review-ux.test.js` against exported pure helper `deriveReviewState()`.

Fixtures cover:

```yaml
cases:
  - all_selected_ready => ready
  - selected_unresolved => action-required
  - selected_invalid_financial => action-required
  - selected_valid_zero => review-required
  - mixed_unresolved_invalid_zero_ready => action-required_with_exact_counts
  - deselected_invalid_row_does_not_block
```

## Environment limitation

No claim is made here that a real mobile browser interaction was executed by the implementation chat. Browser/DOM runtime verification is explicitly delegated to the independent audit task. The auditor must not treat this implementation report as acceptance evidence.

## Acceptance target for auditor

Independently verify the exact feature HEAD and PR #23. Production code/observable behavior is authority. In particular verify that the new layer does not merely change copy while leaving contradictory Apply state, and that stale/dirty state, selected-only blockers, $0 confirmation, financial track separation, and service-worker delivery remain correct.
