# BRUNO AC — NEXT PHASE ROADMAP

```yaml
roadmap_version: 3
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
accepted_baseline_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
current_major_phase: reusable_project_calculation_history
current_target_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
current_status: AUDIT_PENDING
```

## CORE ESTIMATOR FLOW

```text
Building / project setup
  -> room / zone schedule
  -> applicable code / design checks
  -> code minimums only where defensible
  -> preliminary calculated baseline
  -> contractor / customer overrides
  -> final quantities
  -> Catalog resolution
  -> Customer Price + Your Cost
  -> margin / estimate
  -> full technical calculator
  -> explicit Apply / Re-Apply to Job
```

Accepted constraints remain authoritative:

- square footage may drive only a clearly labeled preliminary estimating heuristic;
- it must not fabricate Manual J / Manual D / tonnage / OEM / field measurements;
- below known hard minimums remain fail-closed;
- Commercial remains fail-closed until its verified design/code path exists;
- Customer Price and Your Cost remain separate financial tracks.

## V44 — CALCULATION HISTORY / REUSE

Current target adds:

```text
Confirm & Save Calculation
-> frozen snapshot
-> Active calculation
-> History
-> Activate
-> Duplicate as new
-> Export one
-> Export all
-> Import
```

Snapshot stores:

```yaml
project_structure:
  - project class
  - total area
  - rooms / zones
  - calculated quantities
  - Final overrides
  - Catalog extras
technical_context:
  - full calculator inputs
  - selected generated BOM rows
financial_snapshot:
  - Customer Materials
  - Your Cost
  - Margin $
  - Margin %
metadata:
  - createdAt
  - catalog item count
  - calculator gate state
  - source/import/duplicate provenance
```

Historical snapshots remain immutable with frozen prices.

`Duplicate as new` preserves scope/quantities/Catalog identities but drops frozen unit price fields so the new editable calculation returns to the CURRENT Catalog pricing path.

## AFTER V44 AUDIT

If accepted, the next large expansion should build on the same snapshot/provenance model:

1. reusable named templates / project patterns;
2. compare historical snapshot vs current Catalog pricing;
3. optional customer/job metadata linking without coupling history to one active Job;
4. richer room/zone inputs where they materially affect design takeoff;
5. deeper Commercial estimator only after authoritative commercial rule/design inputs are defined;
6. mounted DOM/browser regression coverage for staged-wizard/full-calculator interactions.

Do not create a parallel pricing engine. New reuse/template features must continue to reference the accepted full calculator and Catalog pricing authority.
