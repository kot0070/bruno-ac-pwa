# BRUNO AC — NEXT PHASE ROADMAP

```yaml
roadmap_version: 4
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
accepted_baseline_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
current_major_phase: HVAC_live_calculator_rework
master_execution_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
execution_mode: STRICT_SEQUENTIAL
current_stage: S00
next_stage: S01
final_independent_audit_after: S12
```

## MASTER AUTHORITY FOR THIS PHASE

For the HVAC calculator rework, `audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md` is the controlling execution file.

Before every implementation stage:

```text
read master plan
-> inspect CURRENT_STAGE
-> execute only that stage
-> test / record evidence
-> update exact main HEAD and stage completion record in master plan
-> only then advance CURRENT_STAGE
```

Do not skip stages and do not start a later stage while the current stage is not `DONE`.

## TARGET PRODUCT FLOW

```text
Project / Building
-> Location / jurisdiction / design conditions
-> Rooms / zones / envelope / usage
-> Heating & cooling load
-> Required capacity
-> Equipment / system count
-> Electrical dependencies
-> Mechanical / duct / refrigerant / condensate dependencies
-> Generated BOM
-> Catalog resolution
-> Customer Price / Your Cost / Margin
-> Review / overrides with provenance
-> frozen confirmation snapshot
-> explicit Apply / Re-Apply to Job
```

The normal operator flow must use one live calculator surface. No second competing full-calculator authority and no normal-flow page bouncing.

## FINANCIAL AND LIFECYCLE BASELINE

Preserve the accepted architecture:

- Catalog `unitCost` = Customer Price authority.
- Catalog `yourCost` = internal procurement authority.
- blank Your Cost fallback and explicit zero remain distinct.
- invalid explicit financial values remain fail-closed.
- current editable calculations may use current Catalog pricing.
- confirmed history snapshots remain frozen.
- Job values change only on explicit Apply / Re-Apply.
- later Catalog edits do not mutate historical Job snapshots.

## SOURCE POLICY

Regulatory / standards / OEM calculations must be source-driven. Store direct links, metadata, rule IDs, implementation summaries and permitted excerpts; do not reproduce entire copyrighted code books/manuals.

Square footage is an initial building input, not a standalone code-compliant tonnage rule. Load/capacity claims must identify their calculation method and source provenance.

## AUDIT POLICY FOR THIS PHASE

Do not run a full independent audit after every stage. Each stage receives implementation tests/evidence and is recorded in the master plan. After S01–S12 are complete, create one full `TASK_CURRENT.md` audit target covering the entire final exact main HEAD.

The final auditor must persist the complete report in the audit workspace, update `LATEST_AUDIT.md` and `HANDOFF.md`, and only then return the short verdict in chat.
