# MAIN SECONDARY DRAIN FAIL-CLOSED — IMPLEMENTATION REPORT

```yaml
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
base_rejected_head: e5da455e38f36a4226ec407894efe2c84b301eda
final_main_head: 5c7884b32f9e48adb0d3c81f9b8c70fb18f921db
previous_audit_report: audits/history/MAIN_PROJECT_ESTIMATOR_e5da455e38f36a4226ec407894efe2c84b301eda_20260915-2052.md
previous_verdict: C_REJECT_REWORK_REQUIRED
blocker_addressed: F01_P1_secondary_overflow_drain_missing_length_warning_only
pwa_cache: bruno-ac-v42
```

## FIX

Added `secondary-drain-guard.js` as an explicit fail-closed UI/application guard for the full technical calculator.

Blocking condition:

```text
installation scope active
AND overflowDamageRisk = true
AND overflowProtection is pan-drain OR overflow-drain
AND secondaryDrainFt <= 0 / blank
```

When blocked:
- `Apply` is disabled;
- `data-secondary-drain-blocked=1` marks ownership of this guard;
- the Apply gate displays a required-field blocker instead of a warning-only state;
- `secondaryDrainFt` receives `aria-invalid=true` and attention styling;
- a capture-phase Apply listener prevents Job mutation even if another UI layer tries to dispatch Apply;
- blocker text references 2024 IRC M1411.9.1 / adopted AHJ verification.

When the field becomes valid, the guard removes only its own marker/title and does NOT force-enable Apply. Existing authoritative calculator/project/BOM/financial gating remains responsible for eligibility.

Repair mode with installation-material scope explicitly disabled is not blocked by this guard because the overflow installation scope is inactive.

## FILES

Production/test changes from rejected head include:
- `secondary-drain-guard.js` — new fail-closed guard;
- `ac-calculator.html` — loads guard;
- `sw.js` — cache v42 and guard precache;
- `tests/secondary-drain-guard.test.js` — executable regression;
- `tests/project-estimator-integration.test.js` — v42/guard integration assertions.

Temporary validation workflow was used only for CI and then removed from final HEAD.

## REGRESSION TESTS

`tests/secondary-drain-guard.test.js` covers:
- `pan-drain` + 0 ft => blocked;
- `overflow-drain` + blank => blocked;
- valid measured run => not blocked;
- `pan-switch` + 0 ft => not blocked by this rule;
- repair mode with install scope disabled => not blocked.

The integration test asserts the guard is loaded and precached and preserves the prior Commercial bridge rule that it must never force-enable Apply.

## CI

Validated run:

```yaml
run_id: 35046565626
validated_commit: f53c01a947b278eefa2a3e8b16ed1f55eba131fe
conclusion: SUCCESS
```

Successful suite included:
- secondary drain fail-closed regression;
- Project Estimator core/integration;
- full app backup;
- Service Journal;
- financial integrity;
- calculator pricing;
- calculator lifecycle;
- calculator review UX;
- Code Registry;
- JS syntax checks.

The only post-CI delta to final main HEAD `5c7884b32f9e48adb0d3c81f9b8c70fb18f921db` is deletion of `.github/workflows/main-secondary-drain-validation.yml`.

## BROWSER RUNTIME

Not performed by implementation agent. Independent audit should test exact final main HEAD in browser/mobile if available.

## ACCEPTANCE FOCUS

Re-audit the previous P1 directly and then re-check that the added guard does not create an Apply-state ownership regression:
- invalid secondary run must remain blocked before Apply;
- correcting the run must not override unrelated project/BOM/financial blockers;
- changing to `pan-switch` / `switch-only` must remove only this drain-length blocker;
- Commercial fail-closed, staged estimator, dual-pricing lifecycle, Journal/backup and PWA regressions remain intact.
