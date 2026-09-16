# BRUNO AC — PROJECT FULL AUDIT MASTER PLAN

```yaml
plan_id: PROJECT_FULL_AUDIT_MASTER_01
plan_version: 1
repository: kot0070/bruno-ac-pwa
production_branch: main
audit_branch: audit/pr22-603cbca
status: PROPOSED_AWAITING_USER_APPROVAL
execution_authorized: false
execution_mode_after_approval: DIRECT_MAIN + STRICT_SEQUENTIAL + AUTONOMOUS
starting_accepted_head: 7c89b706546e4d2e465405544dc398220e664db9
predecessor_master: HVAC_LIVE_CALCULATOR_MASTER_01
predecessor_verdict: A_ACCEPT
free_work_mode_allowed: false
```

## 0. AUTHORIZATION GATE

This master is CREATED but NOT AUTHORIZED.

Do not execute P00 or any later stage until the user explicitly approves `PROJECT_FULL_AUDIT_MASTER_01`.

After approval:
- work strictly one stage at a time;
- before each stage read this plan + Execution State + HANDOFF + TASK_CURRENT;
- production fixes go directly to `main` only when the active stage authorizes remediation;
- every implementation stage must have executable regression evidence;
- temporary validation workflows must be removed before a stage is final;
- every stage records exact start/final `main` HEAD;
- final independent audit is AUDIT_ONLY and must persist its report before chat.

## 1. MASTER OBJECTIVE

Perform one comprehensive adversarial audit of the entire Bruno AC PWA, not only HVAC. Build a trustworthy map of architecture, calculations, regulatory provenance, hidden/legacy defects, runtime behavior and test quality; repair material defects sequentially; and finish with one independent exact-HEAD verdict.

The audit must distinguish:
- authoritative runtime logic vs dead/legacy/static code;
- calculations vs display-only values;
- CODE/OEM/FIELD/CATALOG/OVERRIDE authorities;
- residential vs commercial applicability;
- current editable data vs frozen Job/history snapshots;
- real executable behavior vs string-assert-only evidence.

## 2. GLOBAL INVARIANTS

Never silently:
- invent code requirements, OEM/nameplate values, field measurements, Catalog matches or prices;
- coerce invalid financial/engineering values to zero;
- substitute residential rules into commercial scope;
- overwrite calculated load with equipment override;
- mutate historical Job/history snapshots from current Catalog changes;
- claim browser/mobile behavior when it was not actually executed.

Financial lifecycle remains:
`Catalog current values -> explicit Apply/Re-Apply -> frozen Job snapshot`; Actual Cost overrides procurement snapshot only in P&L.

## 3. STAGE REGISTER

| Stage | Title | Initial status | Gate |
|---|---|---|---|
| P00 | Freeze accepted baseline + repository/runtime inventory | NOT_AUTHORIZED | Complete code/runtime map + exact baseline |
| P01 | Full codebase / architecture audit | NOT_AUTHORIZED | Architecture defect register persisted |
| P02 | Architecture remediation + regression | NOT_AUTHORIZED | P0/P1 architecture defects fixed/validated |
| P03 | Full mathematics / calculation audit | NOT_AUTHORIZED | Formula register + hand-check fixtures + findings |
| P04 | Mathematics remediation + regression | NOT_AUTHORIZED | Material math defects fixed/validated |
| P05 | Full regulatory / documents / standards audit | NOT_AUTHORIZED | Rule traceability matrix + findings |
| P06 | Regulatory/provenance remediation + regression | NOT_AUTHORIZED | Material source/applicability defects fixed/validated |
| P07 | Ghosts / hidden defects audit | NOT_AUTHORIZED | Hidden-defect register complete |
| P08 | Ghost remediation + runtime/PWA regression | NOT_AUTHORIZED | P0/P1 ghosts fixed/validated |
| P09 | Test quality audit + executable coverage hardening | NOT_AUTHORIZED | Weak evidence upgraded where material |
| P10 | Cross-domain full regression + exact final HEAD | NOT_AUTHORIZED | CI SUCCESS, temp workflow removed, Pages verified |
| P11 | One large independent final audit | NOT_AUTHORIZED | Persisted A or fix/re-audit loop |

No stage skipping. A stage is DONE only after implementation/evidence/state persistence is complete.

---

# P00 — BASELINE / INVENTORY

Freeze exact accepted starting HEAD and produce:
- repository tree and runtime entrypoints;
- HTML/script/style/service-worker load order;
- feature/module ownership map;
- localStorage/schema/version/migration inventory;
- all major global state authorities;
- test-suite inventory by type;
- active vs legacy calculator/Journal/financial/history paths;
- PWA/cache/deploy topology.

No production changes in P00 except a stop-ship correction if required to safely continue.

---

# P01 — FULL CODEBASE / ARCHITECTURE AUDIT

Adversarially inspect:
- dead code and unreachable branches;
- duplicate logic and duplicate state authorities;
- global-state conflicts and hidden second authorities;
- stale localStorage keys and orphan schema data;
- schema migrations and backward compatibility;
- duplicate listeners / MutationObservers / timers;
- event loops and rerender loops;
- race conditions and async load ordering;
- script dependency/load ordering;
- orphan scripts/styles and stale selectors;
- legacy calculator paths and duplicate UI;
- fail-open paths and silent fallback;
- swallowed errors / broad try-catch behavior;
- service worker lifecycle and cache versioning;
- offline shell/freshness strategy;
- backup/restore, import/export and atomicity;
- DOM runtime and mobile layout ownership;
- financial authority boundaries;
- Job/history snapshot boundaries;
- source ownership/coupling and mutation patterns;
- security-sensitive DOM/file-import paths where applicable;
- maintainability risks that create hidden runtime authority.

Required output: P0/P1/P2 architecture register with file/function evidence and remediation grouping.

# P02 — ARCHITECTURE REMEDIATION

Fix P0/P1 architecture findings sequentially on `main`, add executable regressions, run full regression, remove temporary workflow, persist exact final HEAD. P2 work only when low-risk and directly adjacent to accepted fixes; otherwise record debt.

---

# P03 — FULL MATHEMATICS / CALCULATION AUDIT

Build a formula register and independently hand-check implemented math. Existing tests are evidence but not the source of truth.

## HVAC
- area / volume;
- design delta-T;
- wall/roof/floor/window/door conduction;
- U-factor / R-value conversion;
- window SHGC / solar gain;
- infiltration ACH/CFM;
- ventilation/outdoor air;
- sensible / latent calculations;
- occupant, lighting and equipment gains;
- heating vs cooling gain treatment;
- airflow relationships actually implemented;
- BTU/h and tons conversions actually implemented;
- zone aggregation/allocation;
- system count and equipment capacity bounds;
- oversize/selection policies and provenance;
- residential/commercial separation.

## Electrical
- MCA/MOCP dependency and validation;
- OCPD constraints;
- voltage/phase dependencies;
- conductor verification dependencies;
- multi-system quantity multiplication;
- disconnect/whip/service quantities actually calculated.

## BOM
- per-system multiplication;
- per-foot quantities;
- minimum/calculated/final/override quantities;
- unit conversions and rounding;
- no route-length invention.

## Financial / business math
- Customer Price and Your Cost extensions;
- blank Your Cost fallback;
- explicit zero semantics;
- `INVALID_FINANCIAL` precedence;
- frozen snapshot behavior;
- Actual Cost precedence;
- margin $ / margin %;
- Method A: `Sales = Cost × (1 + OH) / (1 - Profit)`;
- overhead/profit application;
- quote and P&L math;
- payroll and labor calculations;
- recovery rates;
- T&M calculations;
- decimals / rounding / very large projects;
- null/blank/zero/invalid boundary handling.

Mandatory evidence: independently computed, hand-checkable fixtures with explicit units and expected numbers.

# P04 — MATHEMATICS REMEDIATION

Fix material P0/P1 math issues, update formula/fixture documentation, add executable tests that compare against independently calculated expected values, run full regression and persist exact HEAD.

---

# P05 — FULL REGULATORY / DOCUMENT / STANDARDS AUDIT

Use current official/primary sources where available. Verify current applicability and effective dates for rules actually used or claimed by the app, including:
- Texas TDLR ACR adoption/rules;
- Texas adopted mechanical/building codes;
- Austin / project AHJ criteria;
- 2024 IRC;
- 2024 IMC;
- applicable UMC references;
- Texas 2026 NEC;
- applicable energy code;
- ACCA / recognized load methodology references actually claimed;
- OEM/nameplate provenance model;
- residential vs commercial applicability;
- effective/version dates;
- source URLs and status;
- copyright-safe storage policy.

For every authoritative calculator rule build traceability:

`rule -> applicability predicate -> source -> effective version/date -> formula/input -> calculation effect -> BOM/compliance effect -> UI source link`

Classify each rule as CODE, LOCAL_AHJ, OEM/NAMEPLATE, LOAD_METHOD, FIELD, CATALOG or OVERRIDE. Do not let design recommendations masquerade as code minimums.

# P06 — REGULATORY / PROVENANCE REMEDIATION

Correct stale/unsupported rules, applicability predicates, labels, provenance or source links. Add tests for applicability and fail-closed behavior. Run regression and persist exact final HEAD.

---

# P07 — “GHOSTS” / HIDDEN DEFECTS AUDIT

Dedicated adversarial search for defects that ordinary code review misses:
- old demo/default 3-ton values;
- hidden duplicate UI/calculator surfaces;
- dead feature flags and unreachable paths;
- stale cached old assets / missing cache bump;
- orphan localStorage data;
- duplicate schema versions and stale migrations;
- imported-state mismatch;
- hidden residential fallback inside commercial flow;
- fake `resolved`/`ready` states;
- tests that pass without executing runtime behavior;
- code that appears fixed but is not loaded at runtime;
- CSS rules overridden by later selectors;
- selectors matching no live DOM;
- scripts never loaded;
- race where a dependency loads after its consumer;
- exceptions swallowed by catch blocks;
- stale cache/state restoring superseded authority;
- code paths bypassing compliance/Apply gates;
- hidden direct Job mutations outside explicit Apply/Re-Apply;
- current Catalog values leaking into historical snapshots.

Use code search, runtime load-order evidence, state-key mapping and executable probes. Persist a separate ghost register.

# P08 — GHOST REMEDIATION / PWA RUNTIME

Repair P0/P1 hidden defects and add runtime-oriented tests. Verify PWA cache bump/freshness when production assets change. If actual browser/mobile tooling is unavailable, explicitly record `browser_mobile_runtime: NOT_PERFORMED`; never substitute static inspection for real runtime proof.

---

# P09 — TEST QUALITY AUDIT + HARDENING

Classify every material test as:
- real logic test;
- DOM/runtime test;
- integration/E2E test;
- static string/source assertion.

Static `file.includes(...)` assertions are not sufficient proof of runtime behavior. Identify high-risk areas where source-string tests are the only evidence and add executable tests using the real exported logic/DOM integration/state transitions.

Audit:
- tests that duplicate implementation math instead of independently computing expectations;
- missing negative/boundary cases;
- weak assertions;
- tests that never execute target code;
- stale fixtures;
- missing import/export atomicity cases;
- missing event-order/race cases;
- missing offline/cache-version evidence;
- missing financial lifecycle regressions.

P09 may add testability seams only when necessary and narrowly scoped.

---

# P10 — CROSS-DOMAIN FINAL REGRESSION

Required before final audit:
- full executable suite SUCCESS;
- all new independent math fixtures pass;
- architecture/regulatory/ghost remediation regressions pass;
- financial lifecycle regression passes;
- history/import/export regression passes;
- Journal/mobile DOM regressions pass;
- HVAC chain E2E passes;
- service-worker syntax/shell/version checks pass;
- temporary validation workflow removed;
- exact final `main` HEAD captured;
- GitHub Pages exact-final-HEAD deployment verified where available;
- browser/mobile runtime recorded accurately.

Persist an implementation completion report and authorize only P11 afterward.

---

# P11 — ONE LARGE INDEPENDENT FINAL AUDIT

Mode: `AUDIT_ONLY`.
Production writes: FORBIDDEN during the audit.
Exact final HEAD: REQUIRED.

Independently re-audit:
- architecture and state authority;
- calculations/formulas;
- regulatory applicability/provenance;
- HVAC/electrical/BOM/Catalog/financial chains;
- Job/history lifecycle;
- backup/import/export;
- Journal/mobile/single-surface runtime evidence;
- PWA freshness/offline architecture;
- migrations/legacy paths/ghosts;
- test quality and whether tests execute real behavior.

Final audit persistence order is mandatory:
1. audit exact HEAD;
2. save FULL REPORT under REPORT_PATH from TASK_CURRENT;
3. update `LATEST_AUDIT.md`;
4. update `HANDOFF.md`;
5. verify persistence;
6. only then return verdict/report to chat.

Verdicts:
```yaml
A: ACCEPT
B: ACCEPT_AFTER_MINOR_FIXES
C: REJECT_REWORK_REQUIRED
```

If B/C:
`finding -> targeted fix on main -> implementation report -> full regression -> temp workflow removal -> exact HEAD -> independent re-audit`.
Repeat until A or an external blocker is documented.

A closes `PROJECT_FULL_AUDIT_MASTER_01`.

## 4. REQUIRED STAGE RECORD

Every completed implementation/remediation stage records:
- stage/status;
- started_from_main_HEAD;
- completed_main_HEAD;
- changed_files;
- implementation_summary;
- executable tests/CI;
- browser/mobile runtime status;
- known limitations;
- regressions checked;
- next_stage_authorized.

## 5. STOP CONDITION NOW

```yaml
current_status: PROPOSED_AWAITING_USER_APPROVAL
execution_authorized: false
next_action: USER_APPROVAL_REQUIRED
production_changes_authorized_by_this_plan: false
```

Do not begin P00 until explicit user approval is received.
