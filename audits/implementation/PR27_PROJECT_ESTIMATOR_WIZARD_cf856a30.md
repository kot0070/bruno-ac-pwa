# PR27 PROJECT ESTIMATOR WIZARD — IMPLEMENTATION REPORT

```yaml
task: PR27_PROJECT_ESTIMATOR_WIZARD
repository: kot0070/bruno-ac-pwa
production_pr: 27
production_branch: feature/project-estimator-wizard-v1
base_main: 84b0da0de9029fb5f6182580dcd6b8185fda9fae
final_head: cf856a30b2f9cdcb9d61373d3472fef31b9e7343
pr_state: open_draft
merge_performed: false
browser_runtime: NOT_PERFORMED
```

## OBJECTIVE

Replace the old calculator-first UX with a staged project-estimator flow:

```text
Project setup
-> Rooms / zones
-> Code / design baseline
-> Live material quantities and overrides
-> Catalog extras / pricing
-> Full technical calculator
-> explicit Apply to Job
```

The compact stage is now the entry point. The old technical calculator grid remains available only after the user explicitly opens the full calculation.

## IMPLEMENTED PRODUCT FLOW

### 1. Compact project setup

- Residential / Commercial selector.
- Total building area.
- System family.
- Indoor equipment location.
- New project reset.

### 2. Rooms / zones

Residential options include bedroom, bathroom, kitchen, living, dining, laundry, garage, office, closet and other.

Commercial options include office, restroom, lobby, conference, retail, warehouse, hangar, storage, mechanical, kitchen, breakroom and other.

Each row supports quantity and optional per-room/per-zone area.

### 3. Code / design baseline

The estimator intentionally separates three concepts:

- exact/known code or coordination minimum where a numeric minimum is represented;
- calculated/design recommendation where no universal numeric code minimum exists;
- required field input where the quantity cannot be derived honestly from square footage or room count.

Examples:

- supply outlets/registers: design recommendation only, not represented as a universal code minimum;
- return grilles: design recommendation only;
- refrigerant line-set length: field-required actual developed length, OEM-controlled diameters/limits;
- primary condensate length: field-required actual developed run;
- attic auxiliary pan + float-switch scenario: represented as required-component minimums in the selected protection model;
- disconnect allowance: coordination quantity; exact rating/location/OCPD remain NEC/nameplate/OEM-controlled.

Rule identifiers/source labels are exposed for traceability without copying full copyrighted code text.

### 4. Live materials / overrides

Each estimator row has:

```text
Minimum | Calculated | Final
```

Final is editable. Recalculation is live.

Status model:

```text
required-input  -> field/design value still missing
below-minimum   -> Final is below represented hard minimum
ok              -> no project-level blocker for that row
```

Below-minimum rows render as danger/red state; required-input rows render as attention state. The project plan is `ready=false` whenever a required/below-minimum row exists.

The project state is stored in `bruno-ac-project-plan-v1` and the project type in `bruno-ac-project-context-v1`.

### 5. Add from Catalog

The compact estimator can search the current `bruno-ac-v1.catalog` and add explicit extra materials with editable quantities.

These extras are persisted into the project plan and injected into the full calculator scope as preferred Catalog IDs. Existing Calculator pricing remains authoritative:

```text
Catalog unitCost
-> calculator customerUnitPrice
-> Job unitCost
-> Quote

Catalog yourCost
-> calculator yourUnitCost
-> procurementCostSnapshot
-> P&L
```

Blank Your Cost fallback and invalid-financial behavior remain delegated to the accepted calculator engine.

### 6. Full technical calculator

The legacy technical grid is hidden initially. `Open live technical calculator` reveals it only after the project baseline exists.

The compact plan synchronizes relevant full-calculator fields such as:

- building area;
- system;
- indoor location;
- supply registers;
- return grilles;
- line-set length;
- condensate length;
- selected overflow method where represented.

Full calculator Apply remains explicit; the staged estimator does not auto-write Job materials.

## COMMERCIAL FAIL-CLOSED

Commercial mode is not presented as a complete commercial rules engine.

Commercial plan adds an explicit commercial code/design boundary and large-volume-space engineering check where relevant.

Apply is blocked in three places:

1. project plan / context makes `ac-calculator.js` return a project blocker;
2. `updateTotals()` disables Apply;
3. `applyToJob()` performs the authoritative guard before any Job mutation.

`project-mode-bridge.js` also disables and capture-blocks Apply in both iframe and standalone documents.

This closes the prior standalone bypass path at the authoritative Apply boundary.

## PRIOR AUDIT P1 CORRECTIONS

### F02 — Journal payload validation before full-app restore

`app-backup-bridge.js` now parses and validates Journal JSON before any restore writes.

Supported Journal schemas: 3 and 4.

Required minimum shape:

- settings object;
- calls array;
- crew array;
- schema 4 additionally requires workers array and crew workerId.

Malformed JSON and unsupported schema are rejected fail-closed.

### F03 — Commercial standalone bypass

Closed as described above. `ac-calculator.js` itself reads project plan/context and blocks Apply even when opened standalone.

### F04 — Month / Quarter navigation

`service-journal-ux.js` now uses calendar-aware `shiftPeriod()` instead of fixed 31/92-day offsets.

Covered boundaries include:

- Jan 31 -> Feb 28 for next month;
- Dec 31 Q4 -> Jan 31 in next Q1;
- Jan 31 Q1 -> Oct 31 in previous Q4.

### F05 — stable worker identity

Journal schema is now version 4 and includes:

```text
workers: [{ id, name }]
crew entry: { workerId, ... }
```

Payroll YTD key is:

```text
year + workerId
```

not worker name.

Same-name workers retain independent SS/TWC/FUTA wage bases, and renaming a worker does not reset accumulated wage-base identity.

Legacy name-only rows are migrated to generated worker IDs. Ambiguous historical same-name rows cannot be reconstructed perfectly from legacy data; new entries are stable-ID based.

## JOURNAL FINANCIAL SEMANTICS PRESERVED

Service-call gross is not reduced by employee FICA.

Model remains:

```text
Gross revenue
- optional owner reserve (default OFF)
- employer crew cost (gross wages + employer payroll estimates)
= Cash after crew
```

Employee deductions affect take-home separately.

## PWA

Cache bumped to:

```text
bruno-ac-v40
```

New estimator core, wizard JS/CSS, project-mode bridge, backup bridge and Journal remain in the app shell.

## TESTS / CI

Temporary validation workflow was used only for execution and was deleted from the final production diff.

Successful validation:

```yaml
run_id: 35042103577
validated_commit: ad1cb2ff96bf1eee78e79e84804afe7c0f4a118c
conclusion: SUCCESS
```

Passing steps:

- Project estimator core
- Project estimator integration
- Service Journal payroll
- Full app backup
- Financial integrity
- Calculator pricing
- PR22 lifecycle integration
- Calculator review UX
- Code rule registry
- syntax checks

Final production HEAD:

```text
cf856a30b2f9cdcb9d61373d3472fef31b9e7343
```

Verified post-CI delta from `ad1cb2ff...` to `cf856a30...`:

```text
DELETE .github/workflows/pr27-project-estimator-validation.yml only
```

## KNOWN LIMITS / AUDIT TARGETS

- Browser/mobile runtime on PR27 was NOT_PERFORMED.
- A complete commercial code engine is not implemented; Commercial remains fail-closed for Apply.
- Supply/return counts are explicitly design recommendations, not claimed as universal code minimums.
- Line-set/condensate quantities require measured field inputs.
- Code-source buttons expose rule identifiers and return toward the app/Code Library flow; actual mobile focus/navigation behavior was not browser-tested.
- Legacy same-name worker history has inherent identity ambiguity; new Journal entries use stable worker IDs.

## DO NOT MERGE YET

PR #27 remains open/draft. Independent exact-HEAD audit is required before any merge decision.
