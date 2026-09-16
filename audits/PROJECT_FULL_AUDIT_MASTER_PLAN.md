# BRUNO AC — PROJECT FULL AUDIT MASTER PLAN

```yaml
plan_id: PROJECT_FULL_AUDIT_MASTER_01
plan_version: 2
repository: kot0070/bruno-ac-pwa
production_branch: main
audit_branch: audit/pr22-603cbca
status: AUTHORIZED_ACTIVE
execution_authorized: true
execution_mode: DIRECT_MAIN + STRICT_SEQUENTIAL + AUTONOMOUS
starting_accepted_head: 7c89b706546e4d2e465405544dc398220e664db9
predecessor_master: HVAC_LIVE_CALCULATOR_MASTER_01
predecessor_verdict: A_ACCEPT
user_approved: true
user_approved_on: 2026-09-16
free_work_mode_allowed: false
```

## 0. EXECUTION CONTRACT

Work strictly one stage at a time. Before each stage read this plan, `audits/PROJECT_FULL_AUDIT_EXECUTION_STATE.md`, `audits/HANDOFF.md`, and `audits/TASK_CURRENT.md`. Production fixes go directly to `main` only when the active stage authorizes remediation. Every implementation/remediation stage must have executable regression evidence, temporary validation workflows must be removed before stage completion, and exact start/final `main` HEADs must be persisted. Final P11 is AUDIT_ONLY and its full report must be persisted before chat response.

A stage is DONE only after implementation/evidence/state persistence is complete. Do not skip stages.

## 1. MASTER OBJECTIVE

Perform one comprehensive adversarial audit of the entire Bruno AC PWA, not only HVAC. Build a trustworthy map of architecture, calculations, regulatory provenance, hidden/legacy defects, runtime behavior and test quality; repair material defects sequentially; and finish with one independent exact-HEAD verdict.

Distinguish authoritative runtime logic from dead/legacy/static code; calculations from display-only values; CODE/OEM/FIELD/CATALOG/OVERRIDE authorities; residential from commercial applicability; current editable data from frozen Job/history snapshots; and real executable behavior from string-assert-only evidence.

## 2. GLOBAL INVARIANTS

Never silently invent code requirements, OEM/nameplate values, field measurements, Catalog matches or prices; coerce invalid financial/engineering values to zero; substitute residential rules into commercial scope; overwrite calculated load with equipment override; mutate historical Job/history snapshots from current Catalog changes; or claim browser/mobile behavior when not actually executed.

Financial lifecycle remains: `Catalog current values -> explicit Apply/Re-Apply -> frozen Job snapshot`; Actual Cost overrides procurement snapshot only in P&L.

## 3. STAGE REGISTER

| Stage | Title | Status | Gate |
|---|---|---|---|
| P00 | Freeze accepted baseline + repository/runtime inventory | ACTIVE | Complete code/runtime map + exact baseline |
| P01 | Full codebase / architecture audit | NOT_STARTED | Architecture defect register persisted |
| P02 | Architecture remediation + regression | NOT_STARTED | P0/P1 architecture defects fixed/validated |
| P03 | Full mathematics / calculation audit | NOT_STARTED | Formula register + hand-check fixtures + findings |
| P04 | Mathematics remediation + regression | NOT_STARTED | Material math defects fixed/validated |
| P05 | Full regulatory / documents / standards audit | NOT_STARTED | Rule traceability matrix + findings |
| P06 | Regulatory/provenance remediation + regression | NOT_STARTED | Material source/applicability defects fixed/validated |
| P07 | Ghosts / hidden defects audit | NOT_STARTED | Hidden-defect register complete |
| P08 | Ghost remediation + runtime/PWA regression | NOT_STARTED | P0/P1 ghosts fixed/validated |
| P09 | Test quality audit + executable coverage hardening | NOT_STARTED | Weak evidence upgraded where material |
| P10 | Cross-domain full regression + exact final HEAD | NOT_STARTED | CI SUCCESS, temp workflow removed, Pages verified |
| P11 | One large independent final audit | NOT_STARTED | Persisted A or fix/re-audit loop |

## P00 — BASELINE / INVENTORY

Freeze exact accepted starting HEAD and produce repository tree/runtime entrypoints; HTML/script/style/service-worker load order; feature/module ownership map; localStorage/schema/version/migration inventory; major global state authorities; test-suite inventory by type; active vs legacy calculator/Journal/financial/history paths; and PWA/cache/deploy topology. No production changes except a stop-ship correction required to safely continue.

## P01 — FULL CODEBASE / ARCHITECTURE AUDIT

Adversarially inspect dead/unreachable code, duplicate logic/state authorities, global-state conflicts, stale localStorage/orphan schema data, migrations, duplicate listeners/MutationObservers/timers, event/rerender loops, races, async/script ordering, orphan scripts/styles/selectors, legacy calculator/UI paths, fail-open/silent fallback, swallowed errors, service-worker/cache lifecycle, offline shell/freshness, backup/restore/import/export atomicity, DOM/mobile ownership, financial and Job/history authority boundaries, coupling/mutation patterns, and security-sensitive DOM/file-import paths. Persist P0/P1/P2 findings with file/function evidence.

## P02 — ARCHITECTURE REMEDIATION

Fix P0/P1 architecture findings sequentially on `main`, add executable regressions, run full regression, remove temporary workflow, persist exact final HEAD. P2 only when low-risk and adjacent; otherwise debt.

## P03 — FULL MATHEMATICS / CALCULATION AUDIT

Build a formula register and independently hand-check implemented math. Cover HVAC area/volume/ΔT/conduction/U-R/SHGC/infiltration/ventilation/sensible/latent/internal gains/airflow/BTU-tons/zones/system count/capacity/oversize; electrical MCA/MOCP/OCPD/voltage/phase/conductor dependencies/multi-system quantities; BOM multiplication/per-foot/minimum/final/override/rounding; financial Customer Price/Your Cost/blank fallback/zero/INVALID_FINANCIAL/snapshots/Actual/margin/Method A/overhead/profit/quote/P&L/payroll/labor/recovery/T&M/rounding/boundaries. Mandatory independently computed hand-checkable fixtures with explicit units/expected numbers.

## P04 — MATHEMATICS REMEDIATION

Fix material P0/P1 math issues, update formula/fixture documentation, add executable tests against independently calculated expected values, run full regression and persist exact HEAD.

## P05 — FULL REGULATORY / DOCUMENT / STANDARDS AUDIT

Use current official/primary sources where available. Verify Texas TDLR ACR adoption/rules; Texas mechanical/building adoption; Austin/project AHJ criteria; 2024 IRC/IMC/UMC references actually used; Texas 2026 NEC; applicable energy code; ACCA/recognized load methodology claims; OEM/nameplate provenance; residential/commercial applicability; effective/version dates; URLs/status; copyright-safe storage. Build traceability `rule -> applicability -> source -> version/date -> formula/input -> calculation effect -> BOM/compliance effect -> UI source link`. Classify CODE/LOCAL_AHJ/OEM/NAMEPLATE/LOAD_METHOD/FIELD/CATALOG/OVERRIDE.

## P06 — REGULATORY / PROVENANCE REMEDIATION

Correct stale/unsupported rules, applicability predicates, labels, provenance or source links. Add applicability/fail-closed tests, run regression and persist exact final HEAD.

## P07 — GHOSTS / HIDDEN DEFECTS AUDIT

Search for old demo/default 3-ton values, hidden duplicate UI/calculator surfaces, dead flags/unreachable paths, stale cached assets/missing cache bumps, orphan localStorage, duplicate schema versions/stale migrations, imported-state mismatch, residential fallback inside commercial, fake resolved/ready states, tests not executing runtime behavior, fixed code not loaded, overridden CSS, selectors with no live DOM, unloaded scripts, dependency races, swallowed exceptions, stale cache/state authority, compliance/Apply bypasses, direct Job mutation outside explicit Apply/Re-Apply, and current Catalog values leaking into historical snapshots. Persist separate ghost register.

## P08 — GHOST REMEDIATION / PWA RUNTIME

Repair P0/P1 hidden defects and add runtime-oriented tests. Verify cache bump/freshness when assets change. If actual browser/mobile tooling is unavailable, record `browser_mobile_runtime: NOT_PERFORMED`.

## P09 — TEST QUALITY AUDIT + HARDENING

Classify material tests as real logic, DOM/runtime, integration/E2E, or static string/source assertion. Static `file.includes(...)` is insufficient runtime proof. Upgrade high-risk source-only evidence with executable tests. Audit duplicated implementation math, missing negative/boundary cases, weak assertions, non-executed target code, stale fixtures, import/export atomicity, event-order/race, offline/cache, and financial lifecycle coverage.

## P10 — CROSS-DOMAIN FINAL REGRESSION

Require full executable suite SUCCESS; independent math fixtures; architecture/regulatory/ghost regressions; financial lifecycle; history/import/export; Journal/mobile DOM; HVAC E2E; service-worker syntax/shell/version; temporary workflow removal; exact final `main` HEAD; GitHub Pages exact-final-HEAD deployment where available; accurate browser/mobile runtime status. Persist implementation completion report and authorize P11 only afterward.

## P11 — ONE LARGE INDEPENDENT FINAL AUDIT

Mode `AUDIT_ONLY`; production writes forbidden. Independently re-audit architecture/state authority, calculations, regulatory applicability/provenance, HVAC/electrical/BOM/Catalog/financial chains, Job/history lifecycle, backup/import/export, Journal/mobile/single-surface runtime evidence, PWA freshness/offline architecture, migrations/legacy ghosts, and test quality.

Persistence order: audit exact HEAD -> save FULL REPORT under TASK_CURRENT REPORT_PATH -> update `LATEST_AUDIT.md` -> update `HANDOFF.md` -> verify persistence -> only then return verdict/report to chat.

Verdicts: `A_ACCEPT`, `B_ACCEPT_AFTER_MINOR_FIXES`, `C_REJECT_REWORK_REQUIRED`. B/C enters targeted fix -> full regression -> temp workflow removal -> exact HEAD -> independent re-audit loop until A or an external blocker.

## 4. REQUIRED STAGE RECORD

Every completed stage records stage/status; started_from_main_HEAD; completed_main_HEAD; changed_files; implementation_summary; executable tests/CI; browser/mobile runtime; known limitations; regressions checked; next_stage_authorized.

## 5. CURRENT EXECUTION POINTER

```yaml
current_status: AUTHORIZED_ACTIVE
execution_authorized: true
current_stage: P00
next_stage: P01
production_changes_authorized_now: false
```
