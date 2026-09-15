# PR26 IMPLEMENTATION REPORT — LIVE CODE-DRIVEN ROOM ESTIMATOR

```yaml
report_type: implementation
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
base_sha: e84c9e9b6c53693d087db46156975ffec93d238a
implementation_head: 5b069931eaf98311f31d344c1acd6cc8e5553ade
status: READY_FOR_INDEPENDENT_AUDIT
merged: false
draft: true
browser_runtime: NOT_PERFORMED
```

## PURPOSE

PR26 was extended after the initial audit task was prepared. The user clarified that the estimator must behave as a live calculator: changing building/room/override inputs should immediately refresh compliance state, generated material quantities, Catalog pricing, and margin in preview, while Job mutation remains explicit Apply-only.

Target interaction:

```text
Building + room inputs
  -> applicable code/design rules
  -> code minimum when a defensible numeric minimum exists
  -> calculated/design baseline
  -> optional override
  -> live compliance state
  -> final quantity
  -> existing AC Calculator BOM
  -> existing Catalog Customer Price / Your Cost
  -> live margin preview
  -> explicit Apply to Job only
```

## DELTA FROM INITIAL PR26 HEAD

Initial PR26 audit target was:

```text
a04915f472679866ff941d0fb7b4b8752519becb
```

That target is obsolete and MUST NOT be audited for acceptance.

The live extension adds:

```yaml
added:
  - room-estimator-live.js
modified:
  - ac-calculator.html
  - sw.js
```

Final exact production HEAD:

```text
5b069931eaf98311f31d344c1acd6cc8e5553ade
```

## LIVE PREVIEW BEHAVIOR

`room-estimator-live.js` is a presentation/integration layer only. It does not write Job data.

Expected behavior:

- listens to room-estimator input/change events plus core square-footage / duct-scope changes;
- debounces live recalculation;
- rebuilds `BrunoRoomEstimatorEngine` result from the current room-plan snapshot;
- if no room-estimator blockers exist, synchronizes final room-estimator quantities into existing AC Calculator preview inputs;
- triggers the existing Calculator `Calculate` path so BOM matching/pricing remains authoritative there;
- mirrors existing Customer Materials / Your Cost / Margin outputs back into the room-estimator preview;
- never invokes the existing Apply action automatically;
- does not persist room-estimator state by itself.

## LIVE COMPLIANCE UI

Each quantity card receives a live status.

```yaml
states:
  fail:
    meaning:
      - below modeled hard minimum
      - other quantity blocker
    visual: red
  warn:
    meaning:
      - unresolved design/field input
    visual: warning
  ok:
    meaning:
      - final quantity resolved
      - not necessarily a code minimum
```

Critical truthfulness rule:

- a red `NOT COMPLIANT / BLOCKED` state is used for known modeled hard-minimum violations or explicit blockers;
- planning/design quantities with no defensible universal numeric code minimum are NOT mislabeled as code minimums;
- unknown design values remain `DESIGN INPUT REQUIRED` rather than being fabricated.

## SOURCE LINKS

The live layer loads the local accepted Code Library JSON and uses `BrunoCodeRuleRegistry.findRule` to resolve each metric `ruleIds` entry.

For resolved rules, the live card exposes source buttons using the registry `sourceUrl`, opening in a new tab with `rel="noopener"`.

This is intended to let the user verify both the program and the underlying source.

## LIVE BOM / PRICING

The room layer does not calculate money independently.

```text
room final quantity
  -> existing AC Calculator inputs
  -> existing ac-calculator-engine.js BOM matching
  -> Catalog Customer Price
  -> Catalog Your Cost / accepted fallback
  -> existing Customer Materials / Your Cost / Margin
```

Therefore a live room/override change must refresh preview pricing while retaining all accepted financial invariants.

## JOB MUTATION BOUNDARY

Live preview must NOT:

- call Apply;
- write `materialsUsed`;
- write quote prices;
- write `actualCost`;
- persist room snapshot simply because the user edited a field.

Existing explicit Apply + existing persistence success-gate remain authoritative.

## SCRIPT / PWA CHANGES

`ac-calculator.html` now loads:

```text
... room-estimator-persistence.js
-> code-rule-registry.js
-> room-estimator-live.js
-> ac-calculator-review-ux.js
```

Service worker cache is now:

```yaml
cache: bruno-ac-v38
new_asset:
  - ./room-estimator-live.js
```

All previously accepted shell/calculator/room-estimator assets remain cached.

## VALIDATION

Temporary GitHub Actions validation:

```yaml
run_id: 35029436317
validated_commit: cb8a14f043bc8cc6bb609beb4408dd46df39e602
result: SUCCESS
steps:
  Room_estimator: PASS
  Code_rule_registry: PASS
  Financial_integrity: PASS
  Calculator_pricing: PASS
  Lifecycle_integration: PASS
  Calculator_review_UX: PASS
  Service_journal_UX: PASS
  Syntax_checks_including_room-estimator-live.js: PASS
```

After that successful validation, the only branch change was deletion of:

```text
.github/workflows/pr26-live-validation.yml
```

producing final target HEAD:

```text
5b069931eaf98311f31d344c1acd6cc8e5553ade
```

No temporary workflow remains in the final diff.

## AUDIT FOCUS

Independent audit must verify the entire PR26 flow, especially:

```yaml
- live changes actually update room result without recursive event loops
- live changes actually refresh existing BOM quantities
- Catalog repricing follows accepted Customer/Your tracks
- live layer never writes Job data or calls Apply
- hard-minimum violation is red and blocking when such a minimum exists
- unresolved design input is warning/blocker, not fake code failure/pass
- source links correspond to each ruleId and are safe external links
- code/design/planning language is not misleading
- stale Calculator review state is not left green after live changes
- no infinite click/change cycle between live layer and calculator UX
- mobile layout remains usable
- PWA/offline cache v38 contains the live asset
- all PR22/23/24/25 regression gates remain intact
```

```yaml
merge: FORBIDDEN_UNTIL_INDEPENDENT_AUDIT_ACCEPTS_FINAL_HEAD
```
