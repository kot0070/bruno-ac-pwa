# HVAC LIVE CALCULATOR M01 — AUDIT CORRECTION IMPLEMENTATION REPORT

```yaml
master_id: HVAC_LIVE_CALCULATOR_MASTER_01
stage: S13_FIX_LOOP
started_from_main_HEAD: 459c497b60cc77c511e9337a888bdff7508c2fef
completed_main_HEAD: 7c89b706546e4d2e465405544dc398220e664db9
validated_commit: 7ed3238ed4409fd7d6137848081f287196adb589
validation_run: 35134969943
validation_result: SUCCESS
final_pages_run: 35135027447
browser_mobile_runtime: NOT_PERFORMED
pwa_cache: bruno-ac-v59
```

## Corrections

- P1-01: removed authoritative hard-coded Catalog fallback IDs; resolver now uses exact row ID, persisted binding, or a unique compatible `bomKeys`/attributes candidate. Multiple/no-compatible matches remain unresolved.
- P1-02: impossible envelope geometry (`windows + doors > exposed wall area`) now fails closed with `load.opening_area_exceeds_exposed_wall_area`; no zero-wall clamp produces a usable load.
- P1-03: extended snapshot/import validation now checks nested building/load/equipment/electrical/mechanical/pricing/compliance structure before import staging can commit.
- P2-01: load source references are applicability-aware for residential versus commercial project class.
- PWA cache bumped from `bruno-ac-v58` to `bruno-ac-v59` so corrected production assets receive a fresh shell version.

## Changed production files

- `project-catalog-pricing-engine.js`
- `project-load-engine.js`
- `project-history-core.js`
- `tests/project-catalog-pricing-engine.test.js`
- `tests/project-load-engine.test.js`
- `tests/project-history-core.test.js`
- `tests/project-estimator-integration.test.js`
- `sw.js`
- temporary `.github/workflows/master-m01-audit-fix-validation.yml` was created for validation and then removed before final HEAD.

## Regression evidence

Full regression workflow run `35134969943` passed all executable suites and syntax checks on validated commit `7ed3238ed4409fd7d6137848081f287196adb589`, including runtime summary DOM, complete dependency-chain E2E, history, compliance, Catalog pricing, mechanical BOM, electrical, equipment, load, building schema, source registry, one-surface DOM, estimator integration, Journal core/DOM, estimator core, backup, financial integrity, calculator pricing/lifecycle/review, secondary-drain, and syntax checks.

Temporary validation workflow was removed afterward. Exact final production HEAD is `7c89b706546e4d2e465405544dc398220e664db9`.

Actual browser/mobile runtime remains `NOT_PERFORMED`; no claim is made otherwise.
