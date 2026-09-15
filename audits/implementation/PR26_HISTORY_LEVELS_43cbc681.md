# PR26 IMPLEMENTATION REPORT — LIVE LEVELS + CALCULATION HISTORY

```yaml
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
implementation_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
status: READY_FOR_INDEPENDENT_AUDIT
merged: false
draft: true
browser_runtime: NOT_PERFORMED
```

## Added in this extension

- layered evaluation model L0-L7 in `room-estimator-engine.js`;
- `earliestDirtyLevel()` / dependency fingerprints so override-only changes are distinguishable from building/room changes;
- live UI level rail in `room-estimator-live.js` showing which downstream levels are recalculated;
- immutable confirmed calculation snapshots;
- active calculation summary directly below job bar with Customer Materials / Your Cost / Margin / Margin %;
- calculation history stored additively under `state.acCalculator.calculationHistory`;
- duplicate saved calculation as editable new room plan;
- export one calculation or full history to JSON;
- import single snapshot or history bundle; imported records get new IDs and do not overwrite originals;
- saved historical pricing remains frozen in snapshot data;
- PWA cache bumped to `bruno-ac-v39` and includes history assets.

## Evaluation levels

```text
L0 Raw inputs
L1 Normalized building / room model
L2 Code / design requirements
L3 Calculated baseline
L4 Override / compliance
L5 BOM / components
L6 Catalog / pricing
L7 Confirmed snapshot / history
```

`earliestDirtyLevel` currently provides dependency classification and live UI provenance. Existing AC Calculator remains authoritative for actual BOM/Catalog repricing. No alternate financial formula is introduced.

## History safety model

Confirmed snapshot requires:
- room estimator result has no blockers;
- selected BOM has no unresolved/invalid-financial rows;
- current Customer and Your Cost totals are numeric.

Snapshot stores by value:
- room plan / overrides;
- compliance/check state;
- selected BOM rows;
- Customer / Your Cost / Margin values;
- catalog captured timestamp;
- code library identity.

Duplicate/import does not mutate an existing historical snapshot. Import assigns a new ID and marks `sourceType: imported`.

## Validation

Authoritative validation run:

```yaml
run_id: 35030476333
validated_commit: 4eaaecea6922e73a10e0bf09ecb9b6da9bc63bb4
result: SUCCESS
steps:
  - room-estimator-engine tests
  - calculation-history-core tests
  - code-rule-registry tests
  - financial-integrity tests
  - calculator-pricing tests
  - PR22 lifecycle integration tests
  - calculator review UX tests
  - Service Call Journal tests
  - syntax checks for room estimator live/history/sw
```

Only post-CI production-branch change: deletion of `.github/workflows/pr26-history-levels-validation.yml`, yielding final exact HEAD `43cbc681f579b4009cc55674c4db7507d0910a7c`.

## Audit focus

Independently verify:
- history does not silently overwrite historical records;
- duplicate/import restores editable room inputs coherently;
- active snapshot price display is frozen and distinct from current live preview;
- current live preview continues to use current Catalog pricing;
- import rejects malformed/unsupported files non-destructively;
- L-level dependency classification is correct and does not claim true partial execution where full existing calculator calculation still occurs;
- no Job mutation before explicit existing Apply;
- all accepted PR22-PR25 regression gates remain intact;
- browser/mobile history/duplicate/import workflow if runtime is available.

```yaml
merge: FORBIDDEN_UNTIL_INDEPENDENT_AUDIT_ACCEPTS
```
