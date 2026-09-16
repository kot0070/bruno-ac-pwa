# PROJECT FULL AUDIT — P07 GHOSTS / HIDDEN DEFECTS AUDIT

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
stage: P07
mode: AUDIT_ONLY
audited_main_HEAD: 1a6681072541f3bbb72afa98c0b0929179241ad5
status: DONE_WITH_FINDINGS
P0: 1
P1: 3
P2: 1
browser_mobile_runtime: NOT_PERFORMED
production_changes: NONE
```

## Scope

Adversarial review of hidden/default state, legacy/demo values, runtime loaders, commercial Apply gating, localStorage safety, service-worker freshness, duplicate/legacy surfaces, and state/provenance interactions after P06.

## P0-GHOST-01 — valid oversized primary Job can be treated as missing and then targeted by normal demo-state autosave

**Evidence:** `index.html::loadFromStorage()` returns `null` when the primary `bruno-ac-v1` JSON exceeds 5 MiB. `init()` interprets any `null` result as no stored Job and initializes from `window.BRUNO_SEED`. The P02 storage guard currently classifies a syntactically valid oversized object as `valid`, so it does not lock writes. The normal runtime can therefore reach `save()` with demo-derived state against the same primary key.

**Risk:** deterministic loss/replacement of a large but syntactically valid primary Job. This is a data-integrity stop-ship class defect even if ordinary Jobs are usually smaller than 5 MiB.

**Required P08 correction:** primary storage safety must use the same runtime size boundary and fail closed before application initialization can write over an oversized Job. Add executable regression proving the original raw value remains unchanged.

## P1-GHOST-02 — first installation starts from the 3-ton demo Job rather than a blank production Job

**Evidence:** `index.html::init()` executes `state = normalizeState(stored ? stored : deepClone(demoSeed))`. The embedded `BRUNO_SEED` contains the sample residential changeout, `3 ton / ~36,000 BTU`, and sample Job material/equipment rows. Help text separately describes `Reset demo`, showing the sample is intended as an explicit demo action, yet it is also the implicit first-run state.

`project-mode-bridge.js` hides legacy tonnage on the calculator surface, but that does not remove the seeded quote/materials from first-run Job state.

**Risk:** a production first run can present or carry sample customer/job/material data as if it were current work; the legacy 3-ton sample remains an implicit state authority outside the explicit Reset demo action.

**Required P08 correction:** bootstrap a blank primary Job on first run while preserving the demo seed only for explicit `Reset demo`; preserve Company/Catalog templates as intended.

## P1-GHOST-03 — commercial Apply remains permanently disabled by the legacy project-mode bridge even after the authoritative compliance gate becomes ready

**Evidence:** `project-mode-bridge.js::guardDocument()` sets `#apply.disabled=true` whenever `project-context-v1` is commercial. The same bridge never re-enables the button while commercial. By contrast, `ac-calculator.js::projectBlockedReason()` and `updateTotals()` already implement the authoritative fail-closed transition: commercial is blocked when the compliance gate is absent/unresolved and may become unblocked when `BrunoCurrentComplianceGate` is ready. `project-compliance-ux.js` emits `bruno:compliance-updated`, which the calculator listens to.

**Risk:** a correctly resolved commercial project can still be impossible to Apply through the UI. Two independent gate authorities conflict, leaving the legacy bridge as a hidden permanent blocker.

**Required P08 correction:** remove permanent commercial button disabling from the bridge; retain its informational banner and let the calculator/compliance gate own Apply readiness. Add DOM/runtime regression for blocked-before-ready and enabled-after-ready.

## P1-GHOST-04 — enhancement loader failures are silently swallowed

**Evidence:** `sw-register.js` returns `false` from failed CSS/script callbacks and then simply returns from the nested navigation/workspace chain. `loadScript` failures for Catalog, backup bridge and project-mode bridge are not surfaced; service-worker registration failure is also swallowed. A user can therefore run a partially enhanced shell without any visible indication that navigation/workspace/project guards failed to load.

**Risk:** production code may be present and tested in repository/CI but not active in a client runtime; missing project-mode/backup/navigation enhancements can look like normal UI behavior and evade diagnosis.

**Required P08 correction:** add a single non-destructive runtime failure banner/diagnostic for required enhancement-chain or service-worker registration failure, plus executable loader tests.

## P2-GHOST-05 — default jurisdiction string remains deliberately ambiguous

`normalizeState()` still defaults Job settings to `Texas / Austin area`. P06 now correctly refuses to treat this phrase as City of Austin, so it no longer injects Austin authority. However, the default remains unsuitable as verified AHJ evidence and should remain clearly provisional until the actual project jurisdiction is entered. Current compliance behavior fails closed for commercial work, so this is debt rather than a material correctness defect.

## Negative findings / protections confirmed

- PWA v62 uses network-first behavior for JS/CSS/JSON and removes old caches on activation; no stale-cache authority found in the audited shell.
- P06 removed unconditional Manual J/S provenance and Austin leakage into non-Austin load/compliance paths.
- Catalog resolution remains fail-closed for unresolved/multiple/invalid financial rows.
- History snapshot validation and duplicate repricing remain separated from current Catalog values in the existing executable tests.
- The legacy 3-ton field is explicitly ignored on the one-surface calculator path, but the first-run seed issue above remains outside that visual guard.

## P08 authorization target

Fix P0-GHOST-01 and P1-GHOST-02/03/04, add runtime-oriented executable regressions, bump PWA cache for changed shell assets, run full regression, remove temporary validation workflow, verify exact final HEAD and Pages. P2-GHOST-05 may remain debt if not adjacent to a safe fix.
