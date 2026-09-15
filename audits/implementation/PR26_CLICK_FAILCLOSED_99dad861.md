# PR26 IMPLEMENTATION REPORT — CLICK-DRIVEN FAIL-CLOSED FIX

```yaml
report_type: implementation
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
previous_rejected_head: 116404b13313af0f966695777cf55a807b27fbb5
previous_audit_report: audits/history/PR26_116404b13313af0f966695777cf55a807b27fbb5_20260915-1821.md
implementation_head: 99dad861e5c9024dd7d037f0ebc4fae2572e151b
status: READY_FOR_REAUDIT
merged: false
draft: true
browser_runtime: NOT_PERFORMED
```

## PURPOSE

Close the remaining PR26 audit blocker:

```yaml
F04:
  severity: P1
  prior_issue: click_only_room_plan_mutations_could_enter_blocked_state_without_live_fail_closed_invalidation
```

Also close the remaining F07 import-hardening detail from the same audit cycle.

## F04 FIX

`room-estimator-live.js` now handles click-driven room mutations in addition to `input` and `change`.

The room estimator card registers:

```js
card.addEventListener('click', scheduleAfterClick, false)
```

The click path deliberately defers scheduling with `setTimeout(..., 0)` so the room-estimator UX click handler mutates the DOM/plan first. The normal live signature/debounce path then rebuilds the canonical current plan.

This covers click-only paths including:

```yaml
- add_room
- remove_room
- load_preset
- clear_overrides
- other_button_driven_room_plan_mutations_inside_room_estimator_card
```

If that rebuilt plan is blocked, the existing fail-closed path runs:

```yaml
- existing_Apply_disabled
- phase1_Apply_disabled
- previous_Customer_Your_Margin_totals_cleared
- BOM_marked_stale
- review_state_changed_to_action_required
- stale_prior_BOM_not_treated_as_current/applyable
```

The live layer still does not auto-Apply or write Job data.

## F07 IMPORT HARDENING

`calculation-history-core.js` now rejects pricing snapshots when:

```yaml
- customerTotal_missing_or_non_numeric
- yourTotal_missing_or_non_numeric
- customerTotal_negative
- yourTotal_negative
- provided_marginDollar_non_numeric
- provided_marginPct_non_numeric
```

Negative margin itself remains valid because a loss-making historical estimate is a legitimate state:

```yaml
customerTotal: 100
yourTotal: 120
marginDollar: -20
marginPct: -0.2
validation: accepted
```

## TESTS

`tests/pr26-integration-regressions.test.js` now explicitly asserts:

```yaml
- scheduleAfterClick_defers_until_after_UI_click_handler
- room_estimator_card_clicks_participate_in_live_invalidation
- prior canonical-plan and fail-closed checks remain
```

`tests/calculation-history-core.test.js` now covers:

```yaml
- malformed_marginDollar_rejected
- malformed_marginPct_rejected
- negative_customerTotal_rejected
- negative_yourTotal_rejected
- negative_margin_allowed_when_totals_are_valid
```

## PWA

```yaml
cache: bruno-ac-v41
reason: room-estimator-live.js changed and is an offline shell asset
```

## VALIDATION

Final-code validation before temporary-workflow cleanup:

```yaml
run_id: 35036115087
validated_commit: b8e1a3f337798d06f29edaead2b0a8e4306452e1
result: SUCCESS
steps:
  - room-estimator-engine
  - calculation-history-core
  - pr26-integration-regressions
  - code-rule-registry
  - financial-integrity
  - ac-calculator-pricing
  - pr22-lifecycle-integration
  - ac-calculator-review-ux
  - service-journal-ux
  - JS_syntax_checks
```

After CI, the only production-branch change was deletion of:

```text
.github/workflows/pr26-final-reaudit-validation.yml
```

Final exact production HEAD:

```text
99dad861e5c9024dd7d037f0ebc4fae2572e151b
```

## REAUDIT FOCUS

The re-audit must reproduce the prior F04 scenario from a valid live Calculator state:

```text
valid room plan -> current BOM/pricing ready
-> click-only mutation (remove/add/preset/clear override) makes plan blocked
-> live rebuild occurs
-> stale prior BOM/pricing/Apply becomes fail-closed immediately
```

Also re-check all prior P1 closures and the full PR26 end-to-end regression surface.

```yaml
merge: FORBIDDEN_UNTIL_INDEPENDENT_EXACT_HEAD_ACCEPTANCE
```
