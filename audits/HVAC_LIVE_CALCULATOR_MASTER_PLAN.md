# BRUNO AC — HVAC LIVE CALCULATOR MASTER EXECUTION PLAN

```yaml
plan_id: HVAC_LIVE_CALCULATOR_MASTER_01
plan_version: 1
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
audit_branch: audit/pr22-603cbca
accepted_starting_main_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
created_from_user_runtime_evidence: true
execution_mode: STRICT_SEQUENTIAL
current_stage: S00
next_stage: S01
final_audit_only_after_all_stages_done: true
browser_mobile_runtime_required_for_final_acceptance: true
```

## 0. EXECUTION CONTRACT — MUST NOT BE BYPASSED

```yaml
rules:
  - read_this_file_before_every_stage
  - execute_only_CURRENT_STAGE
  - do_not_start_next_stage_until_current_stage_status_is_DONE
  - do_not_skip_stages
  - do_not_mark_DONE_from_static_source_only_when_runtime_behavior_is_in_scope
  - every_stage_must_record_exact_main_HEAD_after_implementation
  - every_stage_must_record_changed_files
  - every_stage_must_record_executable_test_or_explicit_test_gap
  - every_stage_must_record_runtime_evidence_or_NOT_PERFORMED
  - after_stage_completion_update_this_file_before_any_next_stage_work
  - preserve_financial_baseline_and_explicit_Apply_ReApply_lifecycle
  - never_invent_code_minimums_equipment_nameplate_values_or_field_measurements
  - code_claims_require_provenance_and_direct_source_reference
  - no_parallel_second_pricing_engine
  - no_parallel_second_calculator_UI
  - no_full_independent_audit_between_stages_unless_stop_ship_defect_requires_it
  - one_large_independent_audit_after_S12_DONE
  - final_auditor_must_persist_report_to_audit_workspace_BEFORE_chat_response
```

A stage can move to `DONE` only when all mandatory acceptance criteria for that stage are satisfied. If blocked, set `status: BLOCKED`, record the blocker, and do not continue to a later stage.

## 1. PRODUCT TARGET

Replace the current split/staged-but-disconnected estimator behavior with one coherent live HVAC calculation pipeline:

```text
Project / Building
-> Location / jurisdiction / design conditions
-> Rooms / zones / envelope / usage
-> Heating & cooling load calculation
-> Required capacity
-> Equipment/system count and selection
-> Electrical requirements
-> Air distribution / refrigerant / condensate / controls
-> Generated BOM
-> Catalog resolution
-> Customer Price / Your Cost / Margin
-> Review / override with provenance
-> Confirm snapshot
-> explicit Apply / Re-Apply to Job
```

The operator must remain on one calculator surface. Detailed sections may expand/collapse in place. The application must not bounce the operator between a staged calculator and a second independent “full calculator” as part of normal calculation flow.

## 2. NON-NEGOTIABLE DATA AUTHORITY

```yaml
project_inputs_authority: live_HVAC_project_model
code_authority: verified_rule_registry_and_source_library
load_authority: validated_load_engine_and_recorded_methodology
OEM_authority: selected_equipment_catalog_nameplate_OEM_data
electrical_authority: selected_equipment_MCA_MOCP_voltage_phase_plus_applicable_code_rules
BOM_authority: dependency_engine_from_project_load_equipment_and_field_inputs
pricing_authority: existing_Catalog_customer_price_and_your_cost_paths
job_snapshot_authority: explicit_Apply_or_ReApply_only
history_authority: accepted_frozen_snapshot_model
```

Forbidden shortcuts:

```text
floor area -> arbitrary tons table -> code-compliant claim
old demo “3 ton” -> inferred equipment selection
missing line-set/drain length -> fabricated footage
missing MCA/MOCP/nameplate -> guessed breaker/conductor
unresolved Catalog row -> invented material price
commercial/hangar project -> residential rule substitution
```

## 3. REQUIRED SOURCE / PROVENANCE MODEL

Every calculated or required output that depends on regulation, standard, OEM data, or field measurement must carry machine-readable provenance:

```yaml
source_type:
  - CODE
  - LOCAL_AHJ
  - LOAD_METHOD
  - OEM
  - NAMEPLATE
  - CATALOG
  - FIELD_MEASUREMENT
  - CONTRACTOR_OVERRIDE
source_id: stable_rule_or_document_id
source_title: human_readable_title
section: section_or_rule_if_applicable
source_url: direct_source_link_when_legal_and_available
verified_on: YYYY-MM-DD
status:
  - VERIFIED
  - PROJECT_SPECIFIC_VERIFY
  - OEM_REQUIRED
  - FIELD_REQUIRED
```

Copyright policy: store public/official links, metadata, implementation summaries, rule IDs, and permitted excerpts only. Do not copy full copyrighted code books/manuals into the repository.

---

# STAGE REGISTER

| Stage | Title | Status | Exact main HEAD | Gate to next |
|---|---|---|---|---|
| S00 | Freeze plan + defect baseline | IN_PROGRESS | 9e05636fb3bbc26c0b60ef4624753539e728bd87 | Master plan persisted and runtime defects captured |
| S01 | Journal mobile runtime correction | NOT_STARTED | — | Tax collapsed + static saved calls verified |
| S02 | One-surface calculator architecture | NOT_STARTED | — | No normal-flow calculator bouncing / duplicate input authority |
| S03 | Regulatory / standards / source library hardening | NOT_STARTED | — | Verified source matrix available to engine/UI |
| S04 | Project + building + zone + envelope schema | NOT_STARTED | — | Inputs sufficient for load method; migration tested |
| S05 | Heating/cooling load engine | NOT_STARTED | — | 2k vs 20k materially changes load; no fake compliance |
| S06 | Equipment capacity + system-count selection | NOT_STARTED | — | Required load drives equipment/system alternatives |
| S07 | Electrical dependency engine | NOT_STARTED | — | Voltage/phase/MCA/MOCP-driven electrical scope |
| S08 | Mechanical dependency + BOM engine | NOT_STARTED | — | Equipment/project creates complete resolvable BOM skeleton |
| S09 | Catalog resolution + live pricing | NOT_STARTED | — | BOM resolves to Catalog Customer/Your Cost with gaps explicit |
| S10 | Overrides, compliance gates, Job Apply lifecycle | NOT_STARTED | — | Provenance + fail-closed + explicit Apply/Re-Apply preserved |
| S11 | History/templates/export/import integration | NOT_STARTED | — | New live model snapshots/duplicates safely |
| S12 | Mobile UX, PWA, runtime + full regression | NOT_STARTED | — | Runtime evidence + CI complete |
| S13 | One large independent audit | NOT_STARTED | — | Persisted A verdict or fix loop |

---

# S00 — FREEZE PLAN + DEFECT BASELINE

```yaml
status: IN_PROGRESS
purpose: freeze_scope_and_convert_user_screenshots_into_explicit_runtime_defects
```

Mandatory defect baseline:

- Journal Tax/Payroll settings are visibly expanded in the user’s mobile runtime and consume excessive vertical space.
- Saved Service Call remains inline-editable in the user’s mobile runtime instead of rendering as a compact static record with explicit Edit.
- Project Calculator area can change from ~2,000 to ~20,000 ft² while legacy technical capacity remains `3 ton / ~36,000 BTU`; this is disconnected state, not a live load result.
- Current area heuristic changes outlet counts only and must not be confused with HVAC equipment sizing.
- Materials preview can show generated lines with `Catalog resolved 0/1` and no Customer/Your Cost totals; calculation does not yet produce a usable priced HVAC BOM.
- Current normal flow can require opening a second “live technical calculator,” producing confusing vertical/navigation transitions and duplicate input authority.

S00 acceptance:

```yaml
master_plan_persisted: required
starting_main_head_verified: required
runtime_defects_recorded: required
next_stage_set_to_S01: required
```

---

# S01 — JOURNAL MOBILE RUNTIME CORRECTION

Scope only Journal runtime defects before HVAC architecture work.

Required implementation:

- make Payroll/Tax Settings a real collapsed `<details>`/equivalent by default on fresh render and after rerender;
- provide a compact closed summary showing only jurisdiction + key payroll state;
- ensure old legacy Tax Settings block is not simultaneously visible behind/new Journal UX;
- saved Service Calls render read-only/static and compact;
- each saved call exposes one explicit `Edit` action opening the editor/modal;
- no inline editable row in normal saved state;
- preserve date/week/month/quarter navigation, stable worker IDs, payroll math and app backup compatibility.

Acceptance fixtures:

```text
mobile open Journal -> Tax/Payroll closed
open settings -> edit -> save -> settings can close again
saved call -> compact static row/card
Edit -> editor opens
Save -> returns to static row/card
reload -> same behavior
```

Mandatory evidence: executable Journal tests + actual browser/mobile runtime if available. Static CSS selectors alone are insufficient.

---

# S02 — ONE-SURFACE CALCULATOR ARCHITECTURE

Goal: one visible live calculator, one state authority.

Required implementation:

- eliminate “Project Calculator vs Full Technical Calculator” as two competing calculation surfaces;
- normal workflow remains on one page and one scroll context;
- sections expand/collapse in place: Project, Building, Zones, Load, Equipment, Electrical, Mechanical/BOM, Pricing, Review;
- remove legacy demo capacity as an authoritative value;
- `3 ton / 36,000 BTU` can survive only as migrated/manual override metadata when explicitly chosen by operator;
- changing an upstream input marks all dependent results stale and recalculates in place;
- no hidden iframe/standalone path may bypass current project gate;
- keep a developer/advanced diagnostic view only if it reads the same model and does not create a second authority.

Acceptance:

```text
change area -> same screen updates downstream state
change building type -> same screen updates required inputs
no Open live technical calculator required for standard workflow
no duplicate sqft/system/capacity fields with conflicting values
```

---

# S03 — REGULATORY / STANDARDS / SOURCE LIBRARY HARDENING

Goal: establish authoritative calculation references before implementing load/equipment/electrical rules.

Deliverable: expand `code-library/` and rule registry into a calculation-source matrix.

Required source classes:

- Texas TDLR ACR adopted-code baseline;
- applicable Austin / local AHJ mechanical/building amendments and design criteria;
- 2024 IRC / IMC / UMC references used by the calculator;
- Texas-adopted 2026 NEC references used by HVAC electrical coordination;
- energy-code references where sizing/efficiency/duct requirements materially depend on them;
- approved/recognized load-calculation methodology sources;
- OEM installation/nameplate source slots for equipment-specific requirements;
- source metadata and direct links visible from calculator result cards.

Required source-matrix fields:

```yaml
rule_id: stable
calculation_domain: load|equipment|electrical|duct|condensate|refrigerant|ventilation|energy
jurisdiction: TX/Austin/project-specific
applicability: explicit predicate
calculation_effect: hard_minimum|required_input|warning|reference_only|OEM_dependent
source_url: direct
verified_on: date
copyright_storage: metadata_summary_only|public_document_local_copy_allowed
```

Gate: no S05/S07 regulatory calculation may be coded until its needed source row exists here.

---

# S04 — PROJECT / BUILDING / ZONE / ENVELOPE SCHEMA

Goal: collect the inputs a real load calculation actually needs instead of pretending square footage is enough.

Project-level fields include, as applicable:

```text
project class: residential / commercial
location / ZIP / jurisdiction
total floor area
conditioned floor area
building type / usage
stories
ceiling height / volume
construction/new vs replacement
system type preference
number of systems/zones preference or automatic
```

Envelope/load fields include, as applicable:

```text
wall construction / insulation or U-factor
roof/ceiling construction / insulation or U-factor
floor/slab/crawlspace condition
window area/type/U-factor/SHGC
window orientation where method requires it
door area/type
infiltration / tightness input or approved default category
outdoor air / ventilation requirements
occupancy
lighting/internal equipment gains
indoor design temperature
outdoor design conditions from verified source
existing duct location/condition when load method uses duct gains
```

Zone/room schema:

```text
name/type
area
ceiling height
exterior exposure
windows/doors
occupancy/internal gains if applicable
supply/return relationship
zone/system assignment
```

Migration requirement: old project-plan schema must either migrate deterministically or fail with a clear migration requirement; never silently reinterpret fields.

---

# S05 — HEATING / COOLING LOAD ENGINE

Goal: produce an actual load result from the collected building inputs.

Important distinction:

- square footage starts the workflow and is a major input;
- square footage alone is NOT the final sizing algorithm;
- the engine must expose the calculation method and source/provenance;
- do not label the engine “Manual J” or “Manual N” unless the implemented method has been validated to that claim and licensing/copyright constraints are respected.

Outputs:

```yaml
cooling_sensible_Btuh: number
cooling_latent_Btuh: number
cooling_total_Btuh: number
heating_Btuh: number
design_supply_airflow_CFM: number_or_required_followup
zone_loads: array
calculation_method: explicit
input_completeness: complete|provisional|blocked
sources: array
```

Required fixtures:

- same building geometry, 2,000 vs 20,000 conditioned ft² -> materially different load;
- 20,000 ft² hangar scenario cannot remain on an unrelated legacy 3-ton result;
- changing ceiling height/envelope/window/infiltration/internal gains changes results in correct dependency direction;
- missing required input -> blocked/provisional, never fabricated exact load;
- deterministic fixtures with independently hand-checkable math.

---

# S06 — EQUIPMENT CAPACITY + SYSTEM-COUNT SELECTION

Goal: convert load to equipment requirements, not arbitrary tons.

Required behavior:

- calculate required nominal capacity range from validated load result;
- distinguish calculated load from selected equipment nominal capacity;
- select one or multiple systems based on project class, zone strategy, catalog equipment availability and allowed oversize/selection rules from verified methodology;
- examples may produce alternatives such as one larger unit vs multiple smaller systems only when supported by load/zone/equipment data;
- expose `calculated`, `selected`, `override`, `override_reason`, `final`;
- operator override never rewrites the calculated load;
- equipment not present in Catalog/OEM dataset remains unresolved rather than invented.

Equipment record should carry:

```text
manufacturer/model or generic unresolved class
nominal tons / Btuh
actual rated capacity where available
heating capacity
voltage
phase
MCA
MOCP
refrigerant
line-set requirements
required accessories
OEM source
Catalog IDs
```

---

# S07 — ELECTRICAL DEPENDENCY ENGINE

Goal: derive electrical scope from selected equipment/nameplate, not floor area.

Dependency chain:

```text
selected equipment
-> voltage / phase
-> MCA / MOCP / OEM data
-> circuit requirement
-> breaker/OCPD coordination
-> conductor requirement / field verification under applicable NEC conditions
-> disconnect
-> whip/conduit/fittings
-> GFCI/service receptacle/other applicable checks
-> BOM rows
```

Rules:

- never invent MCA/MOCP when missing;
- do not infer conductor size from tonnage alone;
- distinguish code requirement from OEM/nameplate requirement;
- local/AHJ and installation-condition dependencies remain explicit;
- each rule card links to source library entry.

---

# S08 — MECHANICAL DEPENDENCY + BOM ENGINE

Goal: produce the material skeleton from final equipment and project conditions.

Domains:

```text
equipment units / matched indoor-outdoor components
pads / curbs / hangers / supports
thermostats / controls / sensors
refrigerant line components
filter-driers / fittings / insulation
condensate primary/secondary protection
pumps/interlocks where applicable
duct trunks/branches/fittings/insulation where enough geometry exists
supply outlets / returns based on actual design path
filters / plenums / transitions
electrical BOM from S07
permit/recovery/haul-away/service allowances as explicit non-code commercial scope rows
```

Field-measurement gates remain for actual line-set/drain/duct route lengths unless project geometry provides a defensible calculated route.

Each BOM row must contain provenance:

```yaml
requirement_source: CODE|LOAD|EQUIPMENT|OEM|FIELD|OVERRIDE
calculated_qty: number|null
minimum_qty: number|null
final_qty: number
unit: string
catalog_match_state: resolved|unresolved|multiple_matches
source_refs: []
```

---

# S09 — CATALOG RESOLUTION + LIVE PRICING

Goal: every generated BOM row should resolve to existing Catalog where possible and show money immediately.

Required behavior:

```text
BOM row
-> preferred exact Catalog ID if configured
-> compatible category/attribute matching
-> unresolved/multiple-match state if no safe exact match
-> operator resolves once
-> stable Catalog identity saved
-> current Customer Price
-> current Your Cost or explicit blank fallback semantics
-> extended Customer Materials
-> extended Your Cost
-> material margin $ / %
```

Financial invariants:

- `unitCost` / Customer Price remains quote-side authority;
- `yourCost` remains internal procurement-side authority;
- blank Your Cost fallback semantics preserved;
- explicit zero remains different from blank;
- invalid financial values remain fail-closed;
- no generated BOM line receives an invented price;
- Catalog edit does not mutate already-applied Job snapshots;
- current editable calculation may reprice until confirmed/applied, according to explicit lifecycle.

Acceptance must include a realistic project whose generated BOM resolves many lines and produces visible Customer Materials / Your Cost / Margin rather than `0/1` + dashes.

---

# S10 — OVERRIDES / COMPLIANCE GATES / JOB APPLY

Required quantity lifecycle:

```text
hard requirement / code minimum where defensible
-> calculated recommendation
-> contractor/customer override
-> override reason
-> final quantity
-> Catalog price
-> Confirm snapshot
-> explicit Apply/Re-Apply to Job
```

Rules:

- below hard code minimum -> fail-closed;
- missing field/OEM/nameplate dependency -> fail-closed where it affects safe/valid BOM;
- above minimum -> allowed override with provenance;
- manual equipment override does not falsify calculated load;
- Commercial path cannot reuse Residential compliance state;
- Job remains immutable until explicit Apply/Re-Apply;
- accepted quote/P&L/Actual Cost hierarchy remains unchanged.

---

# S11 — HISTORY / TEMPLATES / EXPORT / IMPORT INTEGRATION

Build on accepted history v45 behavior.

Snapshot must freeze:

```text
building/load inputs
load result + method/version
zone results
equipment selection and override provenance
electrical requirements
BOM + Catalog IDs
Customer/Your Cost snapshot
direct source references used
```

Duplicate-as-new:

- preserves project geometry/scope;
- drops frozen Catalog prices;
- re-enters current Catalog pricing path;
- does not change original calculation or Job.

Import remains strict, atomic and collision-safe.

---

# S12 — MOBILE UX / PWA / END-TO-END REGRESSION

Required mobile product behavior:

- one calculator surface;
- concise top result strip: Load / selected capacity / systems / Customer Materials / Your Cost / blockers;
- upstream changes update downstream sections without page bouncing;
- details collapsible;
- unresolved requirements grouped into one actionable panel;
- source links accessible from result/rule cards;
- Journal fixes from S01 still present;
- no white/light native control artifacts in dark theme;
- sticky bottom navigation does not cover actionable controls;
- PWA fresh deploy and offline shell verified.

Required end-to-end scenarios:

```text
A: 2,000 ft² residential replacement
B: same base building with meaningful envelope/input changes
C: 20,000 ft² hangar/commercial project
D: incomplete field/OEM data -> explicit blockers
E: Catalog price/yourCost updates before Apply vs Job snapshot after Apply
F: duplicate historical project -> current Catalog repricing
```

CI must cover core calculation fixtures, dependency chain, pricing lifecycle, backup/history, Journal, PWA asset references and syntax.

Browser/mobile runtime is mandatory evidence for final product-flow claims. If tooling cannot perform it, final audit must explicitly mark `NOT_PERFORMED` and user runtime becomes required acceptance evidence.

---

# S13 — ONE LARGE INDEPENDENT AUDIT

Only start when S01–S12 are all `DONE` in this file.

Audit scope includes the entire chain:

```text
source provenance
load math
capacity/system selection
electrical dependencies
mechanical BOM
Catalog resolution
Customer Price / Your Cost
fail-closed gates
Job snapshot lifecycle
history/import/export
Journal mobile corrections
single-surface mobile UX
PWA freshness/offline
```

Auditor requirements:

```yaml
mode: AUDIT_ONLY
production_writes: forbidden
exact_final_main_HEAD: required
browser_runtime: strongly_required
persist_full_report_before_chat: REQUIRED
update_LATEST_AUDIT: REQUIRED
update_HANDOFF: REQUIRED
chat_only_after_successful_persist:
  - VERDICT
  - AUDITED_HEAD
  - BLOCKERS
  - FULL_REPORT
```

If verdict is B/C, fixes occur against the exact findings, followed by re-audit. Do not discard the stage history.

---

# STAGE COMPLETION RECORD TEMPLATE

Append/update this block for EACH stage before advancing:

```yaml
stage: SXX
status: DONE|BLOCKED
started_from_main_HEAD: <sha>
completed_main_HEAD: <sha>
changed_files: []
implementation_summary: []
tests:
  commands_or_CI: []
  result: PASS|FAIL|PARTIAL
browser_mobile_runtime:
  status: PERFORMED|NOT_PERFORMED
  evidence: []
known_limitations: []
regressions_checked: []
next_stage_authorized: SYY|NONE
```

## CURRENT EXECUTION POINTER

```yaml
CURRENT_STAGE: S00
CURRENT_STAGE_STATUS: IN_PROGRESS
NEXT_STAGE_IF_AND_ONLY_IF_DONE: S01
DO_NOT_EXECUTE: S02,S03,S04,S05,S06,S07,S08,S09,S10,S11,S12,S13
```
