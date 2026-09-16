# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_report: audits/implementation/MAIN_JOURNAL_ESTIMATOR_UX_V43_436A3696.md
previous_accepted_report: audits/history/MAIN_SECONDARY_DRAIN_5c7884b32f9e48adb0d3c81f9b8c70fb18f921db_20260915-2113.md
protocol_required: true
```

# MODE GUARD — AUDIT ONLY

```yaml
task_type: AUDIT
production_write_forbidden: true
production_commit_forbidden: true
active_PR_mutation_forbidden: true
merge_forbidden: true
audit_exact_head_required: true
```

```yaml
task_id: MAIN_JOURNAL_ESTIMATOR_UX_V43_AUDIT_01
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
production_branch: main
base_accepted_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
target_head: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
status: ACTIVE
```

## OBJECTIVE

Perform an independent adversarial audit of exact `main` HEAD `436a3696bd69779ef7d03e618db1c4ad4d8cf42a` after the Journal/mobile UX and staged Project Calculator visibility/responsiveness cycle.

Do not treat this as cosmetic-only. Verify runtime state, pricing authority, fail-closed behavior, PWA freshness/offline semantics, and previous accepted financial/calculator invariants.

## USER-VISIBLE ACCEPTANCE TARGETS

### Service Call Journal

Verify on mobile/browser if available:

- Payroll / Tax Settings are collapsed by default and expand only on operator action;
- saved Service Calls display as compact static archive rows, not persistent inline edit controls;
- explicit Edit opens the edit UI/modal and Save returns the row to static form;
- compact rows remain usable with long address/description/price content;
- Helpers/Crew/payroll math, stable worker identity, Day/Week/Month/Quarter archive behavior and storage remain unchanged.

### Bright/white mobile control

Verify the Job letterhead select no longer renders as a white/light strip in dark theme and that styling does not alter letterhead/company/quote behavior.

## PROJECT CALCULATOR — AREA RESPONSIVENESS

Required behavior after baseline exists:

- changing `Total building area` recalculates live on input;
- 2,000 ft² vs 20,000 ft² with the same limited room schedule must no longer look identical;
- implementation currently uses a preliminary estimating allowance:

```text
Residential: max(conditioned room count, ceil(total ft² / 400))
Commercial:  max(conditioned zone count, ceil(total ft² / 600))
```

This formula is ACCEPTABLE ONLY as a clearly labeled preliminary estimating heuristic. Auditor must reject if UI/source presents or implies it is:

- a code minimum;
- Manual J;
- Manual D;
- equipment sizing;
- airflow engineering;
- tonnage selection.

Verify line-set length, condensate length, tonnage, equipment capacity, breaker/MCA/MOCP, refrigerant charge and other field/OEM/design values are still not fabricated from square footage.

Manual Final overrides must remain operator-controlled and downstream live state must update correctly.

## MATERIAL / PRICE VISIBILITY

Step 4 should now visibly show:

- generated/selected line count;
- Catalog resolved count;
- Customer Materials;
- Your Material Cost;
- Material Margin;
- Minimum / Calculated / Final material rows;
- blockers / required field measurements;
- Catalog extras where used.

Independently verify the staged price strip reads the existing full-calculator outputs and does NOT implement a second divergent pricing engine.

Re-check accepted pricing authority:

```text
Catalog unitCost -> Calculator customerUnitPrice -> Job unitCost -> Quote
Catalog yourCost -> Calculator yourUnitCost -> Job procurementCostSnapshot -> P&L
```

Also re-check:

- blank Your Cost fallback remains `customer-price-fallback`;
- INVALID_FINANCIAL remains fail-closed;
- zero remains valid/reviewable;
- Catalog changes do not retroactively alter Job snapshots without explicit Apply/Re-Apply;
- Actual Cost precedence remains P&L-only;
- Method A remains unchanged.

## FAIL-CLOSED / CODE-DESIGN BOUNDARY

Re-check previously accepted gates around the modified staged flow:

- missing required line-set/condensate field measurements remain blocking;
- below represented hard minimum remains blocking;
- secondary-drain `pan-drain` / `overflow-drain` missing run remains fail-closed;
- Commercial Apply remains authoritative fail-closed;
- unresolved BOM / invalid financial states cannot be bypassed by staged UI;
- changing area or overrides must not revive a stale previously-applicable BOM.

## PWA V43 / STALE-ASSET HARDENING

Expected cache:

```text
bruno-ac-v43
```

For JS/CSS/JSON shell assets the service worker now prefers network with cached fallback. Verify:

- current deployed Journal/calculator assets refresh instead of indefinitely presenting older cached UI;
- offline fallback still works when network is unavailable;
- navigation shell remains coherent;
- no reload loop or excessive forced-refresh behavior is introduced.

If actual offline/browser runtime cannot be executed, report exactly `NOT_PERFORMED` for those checks and do not infer runtime success from static source.

## VALIDATION EVIDENCE TO VERIFY

```yaml
validated_run: 35049028474
validated_commit: f7638584081fb3247963eeefae7f18762f822a73
expected_ci_result: SUCCESS
final_target: 436a3696bd69779ef7d03e618db1c4ad4d8cf42a
expected_post_ci_delta:
  - DELETE .github/workflows/main-v43-ux-validation.yml
pages_run: 35049069724
pages_result: SUCCESS
expected_cache: bruno-ac-v43
```

Exact compare from prior accepted HEAD to target should contain only:

- `project-estimator-core.js`
- `project-estimator-wizard.js`
- `project-estimator-wizard.css`
- `workspace-v5.css`
- `sw.js`
- `tests/project-estimator-core.test.js`
- `tests/project-estimator-integration.test.js`
- `tests/service-journal-ux.test.js`

## BROWSER RUNTIME

Strongly preferred. Test at minimum:

1. fresh load after v43 activation;
2. Journal Tax Settings initial collapsed state;
3. Add/Save/Edit a service call and confirm compact static archived row;
4. Job/letterhead dark control appearance;
5. Project Calculator baseline at 2,000 ft²;
6. change to 20,000 ft² and verify preliminary material recommendation changes live;
7. verify wording says estimating/design allowance, not code minimum;
8. resolve required field lengths and observe price strip;
9. adjust Final quantity and confirm price/BOM state responds;
10. verify Commercial / secondary-drain / financial blockers remain fail-closed.

If unavailable, report exactly `NOT_PERFORMED`.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/MAIN_JOURNAL_ESTIMATOR_UX_V43_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

AUDIT ONLY. Do not modify main, production code, PRs or merge anything.
