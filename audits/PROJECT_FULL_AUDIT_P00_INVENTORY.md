# PROJECT FULL AUDIT — P00 BASELINE / INVENTORY

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
stage: P00
status: DONE
production_changes: none
started_from_main_HEAD: 7c89b706546e4d2e465405544dc398220e664db9
completed_main_HEAD: 7c89b706546e4d2e465405544dc398220e664db9
browser_mobile_runtime: NOT_PERFORMED
```

## Baseline

Accepted production baseline is exact `main` HEAD `7c89b706546e4d2e465405544dc398220e664db9`, inherited from the closed HVAC master A audit. P00 made no production changes.

## Runtime entrypoints

### Main estimating application

`index.html` is the primary PWA/application document. It contains the large legacy/main application controller inline, including quote, materials, labor/equipment, summary, T&M, P&L, change orders, workers/company/dispatch data normalization and rendering. It directly loads `financial-integrity-core.js`, then its inline application, then `sw-register.js`.

`sw-register.js` dynamically loads the enhancement chain on the main page in this order/relationship:
- `service-journal-ux.js` independently first;
- `catalog-v6.js`;
- `app-backup-bridge.js`;
- `project-mode-bridge.js`;
- `navigation-v2.css` -> `navigation-tree.css` -> `navigation-v2.js`;
- `workspace-v5.css` -> `workspace-v5.js`.

`workspace-v5.js` can initialize the already-loaded Service Journal and lazily loads `code-rule-registry.js` -> `code-library-ux.js` when that workspace feature is needed.

### Project/HVAC calculator

`ac-calculator.html` is a separate direct route but is used as the Project Estimator technical surface. Its deterministic script load order is:
1. `ac-calculator-engine.js`
2. `project-compliance-gate.js`
3. `ac-calculator.js`
4. `project-mode-bridge.js`
5. `project-estimator-core.js`
6. `project-building-schema.js`
7. `project-load-engine.js`
8. `project-equipment-engine.js`
9. `project-electrical-engine.js`
10. `project-mechanical-bom-engine.js`
11. `project-catalog-pricing-engine.js`
12. `project-estimator-wizard.js`
13. `project-history-v2-bridge.js`
14. building/load/equipment/electrical/mechanical/pricing UX modules
15. `project-compliance-ux.js`
16. `project-runtime-summary.js`
17. `ac-calculator-ux.js`
18. `ac-calculator-review-ux.js`
19. `secondary-drain-guard.js`.

The page CSS stack is `ac-calculator.css`, `project-estimator-wizard.css`, and `project-mobile-runtime.css`.

## Major authority map

| Domain | Primary authority / owner |
|---|---|
| Main current Job | `bruno-ac-v1`, inline `index.html` runtime state |
| Core financial semantics | `financial-integrity-core.js` |
| Catalog enhancement | `catalog-v6.js` plus Job-embedded catalog data |
| Full-app backup | `app-backup-bridge.js` |
| Service Journal | `service-journal-ux.js` / `bruno-ac-service-journal-v2` |
| Project context | `project-mode-bridge.js` / `bruno-ac-project-context-v1` |
| Project plan | `project-estimator-core.js` / `bruno-ac-project-plan-v1` |
| Building/envelope | `project-building-schema.js` / building-envelope storage |
| HVAC load | `project-load-engine.js` |
| Equipment | `project-equipment-engine.js` |
| Electrical | `project-electrical-engine.js` |
| Mechanical BOM | `project-mechanical-bom-engine.js` |
| Catalog matching/pricing | `project-catalog-pricing-engine.js` |
| Compliance/Apply gate | `project-compliance-gate.js` + `project-compliance-ux.js` |
| Calculation history | `project-history-core.js` + `project-history-v2-bridge.js` |
| Rule/source registry | `code-rule-registry.js` + `code-library/*.json` |
| PWA cache | `sw.js`, currently `bruno-ac-v59` |
| PWA registration/update | `sw-register.js` |

## Persistent-state inventory

Known active/project keys include:
- `bruno-ac-v1` — main Job/app state;
- `bruno-ac-service-journal-v2` — Service Journal state, currently schema v4;
- `bruno-ac-project-context-v1` — residential/commercial project context;
- `bruno-ac-project-plan-v1` — Project Estimator plan;
- `bruno-ac-building-envelope-v1` — building/envelope model;
- `bruno-ac-bom-catalog-bindings-v1` — explicit BOM -> Catalog identity bindings;
- `bruno-ac-bom-overrides-v1` — quantity overrides/provenance;
- `bruno-ac-compliance-v1` — persisted compliance metadata;
- `bruno-ac-project-history-v1` — calculation-history snapshots.

The main application also owns Company/profile and UI preference storage and legacy/current Job state. Full-app backup deliberately collects every localStorage key with prefix `bruno-ac-`, which means P01 must audit stale/orphan key restoration behavior rather than assuming a fixed schema list.

## Schema / migration inventory

- Main Job state is normalized/migrated by the inline application and `financial-integrity-core.js`; legacy labor fields are explicitly migrated before display normalization.
- Building schema is current schema version 4 and supports deterministic migration from legacy project-plan schemas 1–3, with unresolved engineering fields left for review.
- Service Journal storage key remains v2 for compatibility while normalized object schema is v4; schema 3/4 backups are recognized.
- Calculation history uses snapshot/store version 1 with strict extended-chain validation added by the M01 final correction.
- The calculator still carries legacy/manual tonnage fields only as compatibility/manual data; the live load/equipment path is the authoritative calculated result.

## PWA / deploy topology

`sw.js` currently uses `bruno-ac-v59`. The shell includes the main page, PWA manifest/icons, dynamic runtime bridge files, all live Project Estimator engines/UX modules, source matrix, catalog, and calculator route assets. Scripts/styles/JSON use network-first with cached fallback; navigation attempts network first then cached/index fallback. `sw-register.js` registers with `updateViaCache:'none'`, calls `reg.update()`, sends `SKIP_WAITING` to waiting workers, and reloads once on `controllerchange`.

GitHub Pages is the production deploy surface. The accepted baseline was deployed successfully before this master began.

## Test-suite inventory

Existing executable coverage includes, at minimum:
- financial integrity and PR22 Apply/Re-Apply lifecycle;
- calculator pricing and review UX;
- building/load/equipment/electrical/mechanical/Catalog/compliance engines;
- Project Estimator E2E chain and one-surface DOM/runtime-summary DOM;
- history/import/export;
- Service Journal logic and DOM;
- backup bridge;
- code-rule registry/source matrix;
- secondary-drain guard;
- syntax/integration source checks.

Test quality is mixed: several tests execute real exported logic/JSDOM behavior, while `project-estimator-integration.test.js` and some other integration checks rely materially on static `file.includes(...)` source assertions. P09 is explicitly reserved to classify and harden this evidence.

## Active vs compatibility/legacy paths

- Main business/financial app remains a large inline monolith in `index.html`; enhancement modules wrap or augment it rather than replacing all legacy internals.
- The Project Estimator route contains older `ac-calculator-engine.js`/`ac-calculator.js` compatibility functionality plus the newer live building/load/equipment/electrical/BOM/pricing chain. `project-mode-bridge.js` hides duplicate upstream authority and clears legacy capacity on the normal one-surface workflow.
- Demo seed still contains descriptive 3-ton content for the sample Job. It is not accepted as the live calculated load/equipment authority; P07 must search for any route where it can leak back into authoritative state.
- Service Journal v5 UI replaces the legacy Dispatch panel DOM in-place while preserving its own dedicated storage model.

## P00 conclusion

The repository/runtime map is sufficiently frozen to begin adversarial architecture audit. Highest-risk architecture surfaces entering P01 are: the 6k+ line inline main-state authority, cross-module localStorage coordination, dynamic enhancement load ordering, full-backup replacement/rollback semantics, compatibility calculator paths, global `window.Bruno*` authorities, and mixed executable/static test evidence.
