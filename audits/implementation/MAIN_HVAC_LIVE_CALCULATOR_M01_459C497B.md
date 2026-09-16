# MAIN HVAC LIVE CALCULATOR MASTER 01 — IMPLEMENTATION REPORT

```yaml
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
production_branch: main
starting_accepted_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
final_target_head: 459c497b60cc77c511e9337a888bdff7508c2fef
execution_mode: DIRECT_MAIN_STRICT_SEQUENTIAL
stages_completed: S00-S12
next_stage: S13_INDEPENDENT_AUDIT
pwa_cache: bruno-ac-v58
final_pages_run: 35122795091
final_pages_result: SUCCESS
browser_mobile_runtime: NOT_PERFORMED
```

## Why this master existed

Real Android runtime evidence showed that the prior estimator was not functioning as one live HVAC calculator: Journal tax/payroll controls still occupied excessive mobile space, Service Calls remained visually editable, 20,000 ft² could coexist with a stale legacy `3 ton / 36,000 BTU` value, generated materials frequently failed to resolve to Catalog pricing, and the normal workflow bounced between a project wizard and a separate technical calculator.

M01 converted those defects into one sequential architecture program with a hard rule: no stage could begin until the previous stage was marked DONE with exact HEAD and executable evidence in `audits/HVAC_LIVE_CALCULATOR_EXECUTION_STATE.md`.

## Stage results

### S01 — Journal mobile runtime
- Payroll/Tax rendered as real collapsed controls with compact summary.
- Saved Service Calls render compact/static with explicit modal Edit.
- Journal loading no longer depends on optional workspace enhancement order.
- CI: `35092712396` SUCCESS.

### S02 — One calculator surface
- Standard workflow no longer requires `Open live technical calculator`.
- Project wizard + detailed calculation share one visible state authority and scroll surface.
- Duplicate visible sqft/system/location/tonnage authorities removed from normal project path.
- Legacy 3-ton value survives only as migration metadata, not calculated capacity.
- CI: `35093427826` SUCCESS.

### S03 — Source / regulatory matrix
Added `code-library/hvac-calculation-source-matrix.json` and hardened rule registry/UI with:
- jurisdiction;
- applicability;
- calculation domain/effect;
- verification/source status;
- copyright-storage policy;
- Texas/Austin/electrical/load/design references;
- project-specific OEM/nameplate source slot kept fail-closed until real equipment is selected.

CI: `35096658178` SUCCESS.

### S04 — Building / envelope / zones schema
Added schema v4 and deterministic legacy migration without inventing engineering inputs. Inputs include project class/location/jurisdiction/areas/type/stories/ceiling height, envelope thermal properties, windows/doors/infiltration/ventilation/internal gains/design conditions/duct context, and zone data.

CI: `35097154353` SUCCESS.

### S05 — Heating/cooling load engine
Added `project-load-engine.js` + same-surface load UI.

Method is explicitly named `Bruno transparent envelope load v1`; it is NOT represented as certified Manual J/N. It uses explicit conduction, outdoor-air sensible/latent, window solar and internal gains. Missing engineering inputs block rather than fabricate exact load. Deterministic fixtures verify:
- 2,000 vs 20,000 ft² materially differ;
- 20,000 ft² does not remain at legacy 36,000 BTU/h;
- ceiling/envelope/window/infiltration/internal-gain dependency direction;
- hand-checkable heat-transfer fixture.

CI: `35097713832` SUCCESS.

### S06 — Equipment capacity / selection
Added a distinct calculated-load vs selected-equipment model. Selection requires:
- validated load;
- sourced oversize/selection upper-bound policy;
- Catalog/OEM capacity data;
- OEM provenance for automatic exact candidate selection.

Operator override is separate, requires a reason and never overwrites calculated load.

Known limitation intentionally disclosed: automatic optimization of one large load into multiple smaller systems is not implemented. Automatic selection currently chooses one exact candidate when supported; `systemCount > 1` exists through documented operator override.

CI: `35098245799` SUCCESS.

### S07 — Electrical dependency engine
Electrical path now begins at exact OEM/nameplate equipment, not area/tonnage:
`equipment -> voltage/phase -> MCA/MOCP -> OCPD/conductor verification -> disconnect/whip/checks -> electrical BOM`.

No MCA/MOCP or conductor size is fabricated. OCPD above MOCP is fail-closed. Field routing/conductor verification remains explicit.

CI: `35098930455` SUCCESS.

### S08 — Mechanical dependency / BOM
Added `project-mechanical-bom-engine.js` + UI. BOM skeleton derives from final equipment, electrical result, project conditions and explicit field measurements. Exact line-set/drain/duct route lengths remain measurement gates unless defensible geometry exists. Rows carry quantity/source provenance and source refs.

CI: `35100406825` SUCCESS.

### S09 — Catalog resolution / live pricing
Added BOM-to-Catalog resolution and live pricing:
- exact Catalog IDs / stable bindings where known;
- unresolved/multiple matches remain explicit;
- Customer Price uses `unitCost`;
- internal procurement uses `yourCost`;
- blank Your Cost falls back dynamically to Customer Price with correct provenance;
- explicit zero remains zero;
- invalid financial input fails closed;
- Customer/Your Cost/margin totals are live before confirmation.

CI: `35100991107` SUCCESS.

### S10 — Overrides / compliance / explicit Apply
Added final-quantity override lifecycle and unified project compliance gate.
- quantity override requires a reason;
- below defensible hard minimum blocks;
- Commercial path requires explicit AHJ/jurisdiction verification and commercial design/load source;
- Confirm and Apply share the live fail-closed gate;
- Job remains unchanged until explicit Apply/Re-Apply;
- accepted Customer Price / procurement snapshot / Actual Cost hierarchy retained.

CI: `35102124833` SUCCESS.

### S11 — History / export / import integration
Confirmed snapshots now freeze the live chain:
- building/envelope;
- load result + sources;
- equipment selection;
- electrical;
- mechanical BOM;
- priced BOM;
- compliance gate;
- Catalog bindings;
- quantity overrides;
- compliance metadata;
- direct source refs.

Duplicate-as-new restores project/building inputs but clears frozen binding/override/compliance state so the editable copy re-enters current Catalog pricing. Strict atomic import, strict totals validation and collision-safe IDs remain.

CI: `35121613789` SUCCESS.

### S12 — Mobile UX / PWA / E2E
Added:
- sticky live result strip: Cooling Load / Selected Capacity / Systems / Customer Materials / Your Cost / blockers;
- grouped actionable blocker panel;
- expandable/collapsible Building, Load, Equipment, Electrical, Mechanical BOM, Pricing and Review sections;
- dark native-control hardening;
- safe-area/mobile spacing;
- executable JSDOM runtime result-strip regression;
- end-to-end dependency test covering 2k vs 20k load, envelope sensitivity, missing-input fail-closed, and a complete load -> OEM equipment -> electrical -> mechanical BOM -> Catalog pricing -> compliance READY chain.

Validation:
```yaml
validated_commit: 43dbd14524ce192659738e3a1d611aab46112094
ci_run: 35122703196
ci_result: SUCCESS
final_main_head_after_temp_workflow_removal: 459c497b60cc77c511e9337a888bdff7508c2fef
pages_run_exact_final_head: 35122795091
pages_result: SUCCESS
pwa_cache: bruno-ac-v58
```

## Main compare scope

Exact compare `9e05636... -> 459c497...` is 106 commits and includes the Journal runtime correction plus the new live HVAC dependency architecture. Principal production files include:

```text
ac-calculator.html
ac-calculator.js
service-journal-ux.js
sw-register.js
sw.js
navigation-v2.css
code-rule-registry.js
code-library-ux.js
code-library/hvac-calculation-source-matrix.json
project-mode-bridge.js
project-building-schema.js
project-building-ux.js
project-load-engine.js
project-load-ux.js
project-equipment-engine.js
project-equipment-ux.js
project-electrical-engine.js
project-electrical-ux.js
project-mechanical-bom-engine.js
project-mechanical-bom-ux.js
project-catalog-pricing-engine.js
project-catalog-pricing-ux.js
project-compliance-gate.js
project-compliance-ux.js
project-history-core.js
project-history-v2-bridge.js
project-runtime-summary.js
project-mobile-runtime.css
```

Test coverage added/hardened includes building schema, load, equipment, electrical, mechanical BOM, Catalog pricing, compliance gate, history, one-surface DOM, Journal DOM, runtime summary DOM and full E2E chain.

## Critical invariants for S13

The independent auditor must attempt to falsify, not merely confirm, these claims:

1. Area is only an input; no code claim equates sqft directly to tonnage.
2. Missing load inputs do not produce fake exact capacity.
3. Legacy `3 ton / 36,000 BTU` cannot become current calculated capacity accidentally.
4. Selected equipment never rewrites calculated load.
5. Automatic equipment selection requires verified selection policy + OEM provenance.
6. Multi-system automatic optimization is NOT implemented and UI must not imply otherwise.
7. Electrical values originate from exact nameplate/OEM data; no MCA/MOCP/conductor invention.
8. Mechanical route lengths remain field-measured when geometry is insufficient.
9. Generated BOM unresolved/multiple Catalog matches remain explicit.
10. Customer Price and Your Cost remain separate; blank fallback / explicit zero / invalid semantics remain intact.
11. Job snapshots stay immutable until explicit Apply/Re-Apply.
12. Commercial compliance cannot silently reuse residential state.
13. History import remains atomic/strict/collision-safe and snapshots freeze the live calculation chain.
14. Journal mobile corrections did not regress.
15. PWA v58 shell includes all current calculation/runtime assets and exact final Pages deployment is healthy.

## Runtime evidence limitation

No actual browser/mobile automation was available to the implementer. JSDOM executable DOM tests exist, and the user's earlier Android screenshots are the real runtime evidence that initiated M01. The S13 auditor must report browser/mobile runtime as `NOT_PERFORMED` unless it genuinely performs it; browser runtime is strongly preferred because this master was initiated by Android runtime discrepancies.

## Final audit target

```yaml
audit_exact_main_head: 459c497b60cc77c511e9337a888bdff7508c2fef
base_accepted_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
master_plan: audits/HVAC_LIVE_CALCULATOR_MASTER_PLAN.md
execution_state: audits/HVAC_LIVE_CALCULATOR_EXECUTION_STATE.md
report_path_template: audits/history/MAIN_HVAC_LIVE_CALCULATOR_M01_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
mode: AUDIT_ONLY
```
