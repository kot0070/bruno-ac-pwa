# PR26 IMPLEMENTATION REPORT — AUDIT BLOCKER FIXES

```yaml
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
previous_rejected_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
final_head: 116404b13313af0f966695777cf55a807b27fbb5
status: READY_FOR_REAUDIT
merged: false
draft: true
browser_runtime: NOT_PERFORMED
```

## Trigger

Independent audit report:

`audits/history/PR26_43cbc681f579b4009cc55674c4db7507d0910a7c_20260915-1749.md`

Verdict was `C_REJECT_REWORK_REQUIRED` with five P1 blockers and two P2 findings.

## Fixes

### F01 — live L0-L6 used snapshot wrapper instead of actual plan

`room-estimator-live.js` now unwraps `BrunoRoomEstimatorUX.getSnapshot()` and passes the actual plan to both:

- `earliestDirtyLevel(lastPlan, plan)`
- `build(plan)`

The live engine no longer normalizes the wrapper into a default empty plan.

### F02 — Confirm & Save failed with invalid_room_plan

`calculation-history-ux.js` now unwraps the room snapshot before history validation and stores canonical `roomPlan` shape.

`saveConfirmed()` also catches validation/write errors and reports them without crashing the flow.

### F03 — persisted room plan did not restore rooms / overrides

`room-estimator-persistence.js` now persists the canonical plan directly under:

`state.acCalculator.roomEstimator`

instead of persisting the `{version, plan, result}` wrapper.

`room-estimator-preload.js` supports both canonical plan and legacy wrapper shape and migrates a legacy wrapper to canonical storage before `room-estimator-ux.js` seeds its plan. This preserves rooms, overrides, and building values on reload.

### F04 — blocked live edit left stale prior BOM/pricing/Apply active

`room-estimator-live.js` now fails closed when the current room result is blocked or invalid:

- disables the authoritative `#apply` button;
- disables `#phase1Apply` when present;
- marks BOM as `data-room-live-stale="1"`;
- replaces financial summary values with em dashes;
- updates Apply gate with a blocked message;
- changes calculator state text to explicit stale/blocked wording.

When the room plan becomes valid again, the live layer releases only the disabled state that it owns and triggers the existing authoritative Calculate path. It does not call Apply and does not write Job state.

### F05 — confirmed snapshot could claim compliance.ready=true with required-input checks

`calculation-history-ux.js` now collects checks with `status === "required-input"` and stores:

```yaml
compliance:
  ready: false_when_required_inputs_exist
  requiredInputs: [...]
```

A snapshot may still be frozen for estimating/history purposes when there are no hard room/BOM blockers, but the active snapshot is visibly labeled `review required` rather than falsely `compliance ready`.

### F06 — duplicate provenance discarded

Duplicate workflow now retains `sourceCalculationId` in pending edit context and carries it into the next confirmed snapshot. History UI also displays duplicate provenance.

### F07 — weak imported pricing validation

`calculation-history-core.js` now rejects a snapshot when `customerTotal` or `yourTotal` is missing/malformed. Invalid bundle items are skipped and reported; they are not persisted as valid history records.

## PWA

Service worker cache bumped:

`bruno-ac-v39 -> bruno-ac-v40`

No required accepted shell assets were removed.

## Tests

Added `tests/pr26-integration-regressions.test.js` to guard the exact integration defects found by audit:

- wrapper unwrapping before live build/dirty evaluation;
- fail-closed stale live state;
- canonical persistence;
- legacy wrapper migration;
- truthful confirmed compliance readiness;
- duplicate source provenance wiring.

Extended `tests/calculation-history-core.test.js` with malformed-pricing rejection.

## Validation

Temporary workflow:

`.github/workflows/pr26-reaudit-validation.yml`

Authoritative run:

```yaml
run_id: 35034425269
validated_commit: ae03ac71f2a73cba34569332ebadbe74d9cd0b4e
result: SUCCESS
```

Successful steps included:

- room estimator engine
- calculation history core
- PR26 integration regression guards
- code rule registry
- financial integrity
- calculator pricing
- PR22 lifecycle integration
- calculator review UX
- service journal UX
- JS syntax checks for modified PR26 layers

After CI, the only production-branch change was deletion of the temporary validation workflow, producing exact final HEAD:

`116404b13313af0f966695777cf55a807b27fbb5`

## Regression boundaries

No merge performed. Accepted financial architecture remains unchanged:

```text
Catalog.unitCost -> customerUnitPrice -> Job.unitCost -> Quote
Catalog.yourCost -> yourUnitCost -> procurementCostSnapshot -> P&L
actualCost -> P&L override only
```

No browser runtime is claimed. Independent re-audit should inspect the exact final HEAD and specifically reproduce all five previous P1 paths plus F06/F07.