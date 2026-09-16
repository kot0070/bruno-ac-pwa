# IMPLEMENTATION REPORT — MAIN PROJECT HISTORY V44

```yaml
task: MAIN_PROJECT_HISTORY_V44
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
base_accepted_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
final_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
pwa_cache: bruno-ac-v44
browser_runtime: NOT_PERFORMED
```

## OBJECTIVE

Add reusable, frozen Project Calculator calculation history without creating a second pricing engine or weakening the accepted fail-closed calculator path.

Target operator workflow:

```text
staged project setup
-> baseline / final overrides
-> full generated BOM with current Catalog pricing
-> Confirm & Save Calculation
-> frozen active snapshot
-> History
-> Activate / Duplicate / Export / Import
```

## PRODUCTION DELTA FROM ACCEPTED V43

Exact compare `436a3696... -> 19846aa7...` contains only:

- `project-estimator-wizard.js` modified
- `project-history-core.js` added
- `sw.js` modified
- `tests/project-estimator-integration.test.js` modified
- `tests/project-history-core.test.js` added

Temporary workflow used for validation was deleted before final HEAD.

## HISTORY STORAGE

New storage key:

```text
bruno-ac-project-history-v1
```

Store schema:

```yaml
schemaVersion: 1
activeId: string|null
items:
  - schemaVersion: 1
    id: stable snapshot id
    createdAt: ISO timestamp
    projectPlan: frozen staged project plan
    calculatorInputs: frozen full calculator field values
    bom: frozen selected BOM rows
    totals:
      customerMaterials: number|null
      yourCost: number|null
      marginDollar: number|null
      marginPct: number|null
    gate: calculator gate text at confirmation
    catalogItemCount: integer
    pricingFrozen: true
```

History is additive; confirmed snapshots do not rewrite the active editable plan or Job.

## CONFIRM / SAVE GATING

`Confirm & Save Calculation` is fail-closed when:

- staged `projectPlan.ready !== true`;
- project class is Commercial while commercial verification remains unavailable;
- authoritative full calculator `Apply` is disabled by project/BOM/financial/code gates.

The history layer reads the already-generated full calculator totals and selected BOM DOM state. It does NOT implement independent Customer Price / Your Cost math.

## ACTIVE SNAPSHOT

The top history block displays the selected active frozen calculation with:

- project class;
- total building area;
- room/zone count;
- confirmation timestamp;
- Customer Materials;
- Your Cost;
- Margin $;
- Margin %.

`Activate` changes only which historical snapshot is displayed as active. It does not mutate the current Job or editable staged plan.

## DUPLICATE AS NEW

`Duplicate` clones the historical `projectPlan` into the editable project-plan storage and reloads the calculator.

Historical price fields on Catalog extras are explicitly removed during duplication:

```text
customerUnitPrice -> removed
yourUnitCost -> removed
```

Catalog identity and quantity are preserved. The duplicated editable calculation therefore returns to the current Catalog pricing path rather than silently reusing historical prices.

Provenance added to duplicate:

```yaml
duplicatedFromSnapshotId: <source snapshot id>
duplicatedAt: <ISO timestamp>
```

## EXPORT / IMPORT

Supported export payloads:

```text
project-calculation-snapshot v1
project-calculation-history v1
```

Import requirements:

- `product === bruno-ac`;
- `version === 1`;
- supported payload type;
- snapshot schema validates;
- project plan schema validates;
- BOM must be an array;
- totals must be numeric/null.

Imported snapshots receive NEW IDs and preserve `importedFromId`; existing local snapshots are not overwritten by source IDs.

## V43 PRESERVATION

The accepted V43 calculator UX remains present:

- `Materials & price preview` remains Step 4;
- `pew-price-strip` still reads existing full calculator totals;
- `Total building area` still recalculates live on input;
- accepted 2,000 -> 20,000 ft² preliminary estimating responsiveness remains;
- area allowance remains explicitly non-code / non-Manual-J/D;
- Commercial, secondary-drain, unresolved BOM and invalid-financial fail-closed gates remain authoritative.

## PWA

Cache bumped:

```text
bruno-ac-v43 -> bruno-ac-v44
```

`project-history-core.js` was added to the offline shell. Existing network-first JS/CSS/JSON strategy with cached fallback is unchanged.

## VALIDATION

Temporary workflow:

```text
.github/workflows/main-v44-history-validation.yml
```

Validated run:

```yaml
run: 35051528777
validated_commit: ca7f2ee9eaa81354ea59d5f5c6e81dace9d08ae8
result: SUCCESS
```

Validated suites:

- Project estimator core
- Project history core
- Project estimator integration
- Service Journal
- Secondary drain guard
- Full app backup
- Financial integrity
- Calculator pricing
- Calculator lifecycle
- Calculator review UX
- Code registry
- JS syntax

Post-validation production delta to final HEAD:

```text
DELETE .github/workflows/main-v44-history-validation.yml
```

Final HEAD:

```text
19846aa72a0370fbb5cd164a37d8abe9c41a750a
```

Pages run for final HEAD:

```text
35051572014
```

At report-write time this run was still completing; auditor must independently verify final conclusion rather than infer deployment success.

## REQUIRED INDEPENDENT AUDIT FOCUS

1. Confirm is genuinely fail-closed and cannot freeze a misleading ready state.
2. Frozen snapshot values do not change when Catalog/current editable plan changes later.
3. Duplicate does not carry frozen historical Catalog prices into a new editable calculation.
4. Import rejects malformed/unsupported payloads before local history mutation.
5. Imported IDs cannot overwrite existing snapshots.
6. Existing V43 live price strip and area responsiveness were not regressed.
7. Customer Price / Your Cost separation and explicit Apply/Re-Apply Job snapshot lifecycle remain unchanged.
8. App backup/restore still captures the new `bruno-ac-project-history-v1` key under the existing full-app `bruno-ac-*` storage policy.
9. PWA v44 includes history core offline and does not regress freshness behavior.
