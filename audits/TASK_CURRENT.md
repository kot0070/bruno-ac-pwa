# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
execution_state: audits/HVAC_LIVE_CALCULATOR_EXECUTION_STATE.md
implementation_report: audits/implementation/MAIN_HVAC_LIVE_CALCULATOR_M01_459C497B.md
previous_accepted_report: audits/history/MAIN_PROJECT_HISTORY_V45_9e05636fb3bbc26c0b60ef4624753539e728bd87_20260915-2244.md
protocol_required: true
```

# MODE GUARD — INDEPENDENT AUDIT ONLY

```yaml
task_type: AUDIT
production_write_forbidden: true
production_commit_forbidden: true
production_branch_mutation_forbidden: true
merge_forbidden: true
audit_exact_head_required: true
persist_report_before_chat: REQUIRED
update_latest_audit_before_chat: REQUIRED
update_handoff_before_chat: REQUIRED
```

```yaml
task_id: MAIN_HVAC_LIVE_CALCULATOR_M01_FINAL_AUDIT_01
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
base_accepted_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
target_head: 459c497b60cc77c511e9337a888bdff7508c2fef
status: ACTIVE_FINAL_AUDIT
expected_pwa_cache: bruno-ac-v58
validated_ci_run: 35122703196
validated_ci_commit: 43dbd14524ce192659738e3a1d611aab46112094
pages_run_exact_final_head: 35122795091
pages_result: SUCCESS
```

## REQUIRED ORDER OF OPERATIONS

This order is mandatory. Do NOT return a verdict to chat first.

1. Read `audits/WORKSPACE.md`, `audits/PROTOCOL.md`, this task, the M01 master plan, execution state and implementation report.
2. Verify `main` exact HEAD is `459c497b60cc77c511e9337a888bdff7508c2fef`. If it is not exact, STOP and report BLOCKED without auditing a substitute HEAD.
3. Perform the full independent adversarial audit below. Do not modify production/main/PRs.
4. Create the full audit report at the required `REPORT_PATH` in `audits/history/`.
5. Update `audits/LATEST_AUDIT.md` to point to / contain the new final audit result according to workspace protocol.
6. Update `audits/HANDOFF.md` with exact audited HEAD, verdict, blockers, report path and runtime status.
7. Verify all three audit-workspace writes succeeded.
8. ONLY AFTER successful persistence return to chat exactly:
   - `VERDICT`
   - `AUDITED HEAD`
   - `BLOCKERS`
   - `FULL REPORT`

If report/LATEST_AUDIT/HANDOFF persistence fails, do NOT present the audit as complete in chat. Return a persistence blocker instead.

## OBJECTIVE

Adversarially audit the entire M01 transformation from accepted V45 baseline into the live HVAC calculator. Do not assume stage CI or the implementation report is correct. Reconstruct critical flows from source and executable evidence.

The audit must cover the complete dependency chain:

```text
Project / Building / Zones / Envelope
-> Heating & Cooling Load
-> Equipment Capacity / Selection
-> Electrical Dependencies
-> Mechanical Dependencies / BOM
-> Catalog Resolution
-> Customer Price / Your Cost / Margin
-> Overrides / Compliance Gate
-> Confirmed Snapshot
-> Explicit Apply / Re-Apply to Job
-> History / Duplicate / Export / Import
-> Quote / P&L financial invariants
```

Also re-audit the Journal mobile fixes and PWA/mobile integration because those were original user runtime defects.

## A — SOURCE / REGULATORY PROVENANCE

Verify:
- calculation source matrix exists and production code actually references the declared sources;
- source records distinguish Texas/Austin/local AHJ/OEM/project-specific applicability;
- no unsupported statement converts square footage directly into code-required tonnage;
- `Bruno transparent envelope load v1` is not falsely labeled Manual J, Manual N or certified ACCA software;
- OEM/nameplate requirements remain unresolved until exact equipment data exist;
- commercial and residential applicability cannot silently cross-contaminate;
- source URLs/status/version/effective-date metadata are internally coherent;
- copyrighted standards/manuals are not falsely represented as locally stored full text where only metadata/links are permitted.

Flag any rule that is described as CODE/HARD MINIMUM without sufficient source evidence.

## B — BUILDING / LOAD MATHEMATICS

Independently inspect formulas and deterministic tests, including units and sign conventions.

Verify:
- required load inputs fail closed when absent;
- conditioned area, ceiling height, exposed areas, U/R conversion, design ΔT, infiltration/ventilation CFM, latent grains factor, solar, internal gains and floor-boundary logic are mathematically coherent;
- 2,000 and 20,000 ft² fixtures materially differ for real reasons, not a hidden tonnage-per-area shortcut;
- legacy `3 ton / 36,000 BTU` cannot leak into calculated load;
- sensible + latent = total cooling;
- heating path does not incorrectly credit internal gains if implementation says it does not;
- zone allocation is clearly labeled approximate/area-weighted and not room-by-room Manual J;
- provisional vs blocked vs complete states are correct;
- calculations do not silently coerce malformed explicit values into usable engineering numbers.

Try edge cases: zero area, zero infiltration, negative/invalid values, window area > wall exposed area, extreme design temperatures, missing sourceId, zone-area mismatch, zero/blank thermal properties.

## C — EQUIPMENT / TONNAGE / SYSTEM COUNT

Verify:
- calculated load remains immutable when selection/override changes;
- required capacity and verified selection range are derived from load and sourced policy inputs;
- automatic candidate selection requires real Catalog/OEM capacity + OEM provenance;
- heating/cooling candidate checks are coherent;
- manual override requires reason;
- override cannot create fake OEM/nameplate electrical data;
- no stale 3-ton value becomes selected capacity.

IMPORTANT KNOWN LIMITATION:
Automatic multi-system optimization/splitting is NOT claimed as implemented. Current automatic path selects one exact supported candidate; operator override can carry `systemCount > 1`. Audit UI/source for any implication that the app automatically designs `2×5 ton`, etc. If it implies this without implementation, raise a finding rather than assuming it works.

## D — ELECTRICAL DEPENDENCY ENGINE

Verify:
- electrical chain originates from exact selected OEM/nameplate data;
- voltage, phase, MCA and MOCP are never inferred from tonnage or area;
- missing nameplate fields fail closed;
- selected OCPD > MOCP blocks;
- conductor size remains explicitly field/code verified and is not inferred from MCA alone;
- conductor source requirement cannot be bypassed;
- disconnect / whip / GFCI / service receptacle / attic-service applicability remains explicit and source-linked;
- generated electrical BOM provenance is preserved.

Audit the distinction between nameplate requirements and NEC/AHJ requirements; flag any false code conclusion.

## E — MECHANICAL DEPENDENCY / BOM

Verify generated BOM behavior and provenance:
- exact equipment requirement;
- supports/pads/curbs where applicable;
- thermostat/control/filter-drier/accessories;
- refrigerant line-set components;
- condensate primary/secondary protection;
- duct/distribution rows;
- electrical rows from S07;
- non-code commercial scope such as permit/recovery/haul-away remains labeled as scope rather than code.

Line-set, condensate and duct route lengths must remain explicit field measurement gates unless defensible geometry exists. Ensure no sqft-based material length invention.

Each material row should preserve:
`requirement_source / calculated_qty / minimum_qty / final_qty / unit / catalog match state / source refs`.

## F — CATALOG + FINANCIAL INTEGRITY

Verify:
- generated rows resolve only through exact/preferred safe Catalog identity or explicit operator binding;
- unresolved and multiple matches are visible and cannot be silently priced with arbitrary items;
- `unitCost` remains Customer Price authority;
- `yourCost` remains internal procurement authority;
- blank Your Cost dynamically falls back to Customer Price with provenance `customer-price-fallback`;
- explicit Your Cost zero remains zero;
- malformed explicit financial values are fail-closed;
- no generated BOM line receives invented money;
- extended totals/math are correct.

Mandatory accepted lifecycle regression:
1. Catalog Customer100 / Your70.
2. Apply => Job customer100 / procurement snapshot70.
3. Catalog changes to Customer110 / Your55.
4. Without Apply/Re-Apply Job and quote/P&L snapshots remain 100/70.
5. Explicit Re-Apply updates to 110/55.
6. Actual Cost overrides procurement snapshot only in P&L.

Re-check Method A and financial-integrity regression suite for collateral damage.

## G — OVERRIDES / COMPLIANCE / APPLY

Verify:
- override reason required when final qty differs;
- below a defensible hard minimum blocks;
- above minimum remains traceable override;
- load remains separate from equipment override;
- incomplete building/load/equipment/electrical/mechanical/pricing dependencies block where intended;
- Commercial requires explicit jurisdiction/AHJ verification and commercial design source;
- Confirm and Apply are gated by the same current compliance result;
- no stale/race state can enable Apply before downstream recompute;
- Job mutation occurs only on explicit Apply/Re-Apply.

## H — HISTORY / SNAPSHOT / IMPORT / EXPORT

Verify:
- confirmed snapshot freezes building/envelope, load, equipment, electrical, mechanical BOM, priced BOM, compliance, Catalog bindings, overrides, compliance metadata and source refs;
- frozen snapshot does not change after current Catalog edits;
- Duplicate as new preserves project/building scope but drops frozen pricing/binding state and re-enters CURRENT Catalog pricing;
- original remains immutable;
- full/single export preserve extended snapshot;
- import is strict, atomic and collision-safe;
- malformed extended chain fails validation;
- historical V45 import invariants remain intact.

## I — JOURNAL ORIGINAL RUNTIME DEFECTS

Verify source + executable DOM evidence for:
- Tax/Payroll settings collapsed by default and can be collapsed after edit/save;
- saved Service Call compact/read-only normal state;
- explicit Edit opens editor/modal and save returns to static state;
- no duplicate legacy Journal editor/settings remains visible;
- payroll/date period/stable-worker behavior did not regress.

## J — MOBILE / SINGLE-SURFACE / PWA

Verify:
- one calculator surface remains normal workflow;
- no required bounce into separate full calculator;
- top live result strip displays load, capacity, system count, Customer Materials, Your Cost and blocker count;
- unresolved blockers are actionable/grouped;
- major technical sections collapse/expand in place;
- dark native controls and safe-area spacing are present;
- no duplicate visible sqft/system/capacity authority returns;
- PWA cache expected `bruno-ac-v58`;
- current assets are in SHELL including history bridge, runtime summary, mobile CSS, source matrix and all dependency engines;
- JS/CSS/JSON freshness strategy remains network-first with cached fallback;
- exact final Pages run `35122795091` is SUCCESS on target HEAD.

Browser/mobile runtime is strongly preferred. If not actually performed, state exactly `NOT_PERFORMED`; do not infer visual success from source/JSDOM alone.

## REQUIRED EXECUTABLE / EVIDENCE CHECKS

At minimum verify the evidence represented by:

```yaml
S01_ci: 35092712396
S02_ci: 35093427826
S03_ci: 35096658178
S04_ci: 35097154353
S05_ci: 35097713832
S06_ci: 35098245799
S07_ci: 35098930455
S08_ci: 35100406825
S09_ci: 35100991107
S10_ci: 35102124833
S11_ci: 35121613789
S12_ci: 35122703196
final_pages: 35122795091
```

Do not treat CI success alone as proof of calculation correctness. Independently inspect the implementation and fixtures.

## SEVERITY / VERDICT

```yaml
A: ACCEPT
B: ACCEPT_AFTER_MINOR_FIXES
C: REJECT_REWORK_REQUIRED
```

A requires no P0/P1 blockers and no material false claim in the core calculation/compliance chain.

## REQUIRED REPORT PERSISTENCE

```yaml
report_path_template: audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_459c497b60cc77c511e9337a888bdff7508c2fef_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
handoff: audits/HANDOFF.md
```

The full report should include:
- exact audited HEAD;
- verdict;
- browser/mobile runtime status;
- findings grouped P0/P1/P2 with file/function evidence;
- math/source/regulatory findings separately identified;
- verified CI/Pages evidence;
- known limitations vs actual defects;
- explicit statement whether M01 can be CLOSED.

## CHAT RETURN — ONLY AFTER PERSISTENCE

Return only:

```text
VERDICT: ...
AUDITED HEAD: ...
BLOCKERS: ...
FULL REPORT: <GitHub link to persisted report>
```

AUDIT ONLY. Do not modify `main`, production code, active PRs or merge anything.
