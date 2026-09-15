# PR25 IMPLEMENTATION REPORT — CODE LIBRARY / RULE REGISTRY

```yaml
report_type: implementation
repository: kot0070/bruno-ac-pwa
production_pr: 25
production_branch: feature/code-library-rule-registry
base_branch: main
base_sha: 6f48420748da960d977d036bcc1be83a12ec4872
implementation_head: 90ebe4d2408a7b0af7e6e7671540f632585a8804
status: READY_FOR_INDEPENDENT_AUDIT
merged: false
draft: true
browser_runtime: NOT_PERFORMED
```

## USER INTENT

Build a persistent code-verification foundation so Bruno AC can later calculate room/building-driven HVAC scope and BOM while allowing the user to independently re-check the program against current code sources.

Target architecture:

```text
Building / room inputs
  -> rule registry
  -> applicable code / OEM / AHJ requirements
  -> scope / BOM rules
  -> Catalog
  -> Customer Price + Your Cost
  -> traceable source verification
```

This PR implements the registry/library foundation only. It does **not** yet implement the future room-by-room load/material engine and does **not** change AC Calculator sizing or BOM business logic.

## FINAL PRODUCTION DIFF

Exactly six files differ from `main`:

```yaml
added:
  - code-library/texas-hvac-2026.json
  - code-rule-registry.js
  - code-library-ux.js
  - tests/code-rule-registry.test.js
modified:
  - workspace-v5.js
  - sw.js
```

No final `.github/workflows/**` artifact remains.

## TEXAS 2026 BASELINE REPRESENTED

The local registry records:

```yaml
Texas_ACR:
  effective: 2026-09-01
  adopted_reference_editions:
    - 2024 IRC
    - 2024 IMC
    - 2024 IFGC
    - 2024 UMC
  official_adoption_source: https://www.tdlr.texas.gov/news/rulemaking/2026/08/31/commission-adopts-rules-11/
Texas_Electrical:
  effective: 2026-09-01
  state_code: 2026 NEC
  note: Texas adoption includes a limited state modification described by TDLR
  official_adoption_source: https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/
```

Official/public code-viewer links are stored for ICC and IAPMO resources. Local-AHJ verification remains explicit and project-specific.

## COPYRIGHT / SOURCE POLICY

`code-library/texas-hvac-2026.json` intentionally stores only:

- code family / edition / section identifiers;
- concise original implementation summaries;
- source authority;
- official/public source URLs;
- verification status/date;
- calculator tags / provenance metadata.

It explicitly sets:

```yaml
fullCopyrightedCodeTextStored: false
summaryOnly: true
officialLinksPreferred: true
localAhjAlwaysVerify: true
```

No complete IRC / IMC / IFGC / UMC / NEC text was copied into the repository.

## RULE REGISTRY CORE

`code-rule-registry.js` is UMD/CommonJS compatible and provides:

```yaml
functions:
  - validateLibrary
  - indexLibrary
  - findRule
  - searchRules
  - normalizeRuleIds
  - resolveRuleIds
  - calculatorRuleIds
  - validateCalculatorMap
  - coverage
```

The core contains `CALCULATOR_RULE_MAP`, a foundation mapping existing/future calculator keys to stable rule IDs. Examples:

```yaml
sqft-sizing:
  - IRC-M1401.3-EQUIPMENT-SIZING
condensate-drain:
  - IRC-M1411.9-CONDENSATE
overflow-protection:
  - IRC-M1411.9.1-OVERFLOW
  - LOCAL-AHJ-VERIFY
disconnect:
  - NEC-2026-TX-ADOPTION
  - LOCAL-AHJ-VERIFY
```

Important boundary: this map is infrastructure for traceability. PR25 does **not** modify `ac-calculator-engine.js` to consume the map yet.

## CODE LIBRARY UI

`code-library-ux.js` adds a presentation-only Code Library / Verification panel.

Behavior:

```yaml
location: AC Tools secondary navigation
entry_label: Code Library
sections:
  - registry integrity status
  - adopted code set
  - searchable/filterable rule registry
  - official source links
  - local repository JSON source
summary_metrics:
  - adopted code count
  - rule count
  - calculator keys mapped
  - last verified date
```

Navigation design:
- the tab is injected only while the user is in `AC Tools`;
- leaving AC Tools deactivates the custom panel and clears custom active state;
- no production job state is written by the Code Library UI;
- registry load failure is non-destructive: calculator and estimating workflows remain available.

## LOADER / PWA

`workspace-v5.js` now loads:

```text
code-rule-registry.js
  -> code-library-ux.js
```

The loader is same-origin and compatible with current CSP.

`sw.js`:

```yaml
cache: bruno-ac-v36
new_cached_assets:
  - ./code-rule-registry.js
  - ./code-library-ux.js
  - ./code-library/texas-hvac-2026.json
```

The registry can therefore be available offline after the PWA shell updates.

## BUSINESS-LOGIC SAFETY BOUNDARY

Unchanged from accepted `main`:

```yaml
- index.html
- navigation-v2.js
- financial-integrity-core.js
- ac-calculator-engine.js
- ac-calculator.js
- ac-calculator-review-ux.js
- service-journal-ux.js
```

PR25 does not change:
- Quote / Method A;
- Customer Price / Your Cost financial tracks;
- P&L precedence;
- Catalog matching;
- AC Calculator BOM generation;
- Job Apply behavior;
- persisted job schema;
- Service Call Journal business logic.

## DETERMINISTIC TESTS

`tests/code-rule-registry.test.js` verifies:

```yaml
- registry schema validation
- Texas jurisdiction/effective date
- full copyrighted code text flag is false
- all calculator-map rule IDs resolve
- core rule lookup
- NEC / IRC identifiers
- search and family filtering
- mapped/unmapped coverage accounting
- UI summary helper integrity
```

## CI VALIDATION

Authoritative final-code validation run before workflow cleanup:

```yaml
run_id: 35024484325
validated_commit: 5035fe1a58a42635e7b1d5198fac3507526d50da
result: SUCCESS
steps:
  - Code rule registry: PASS
  - Financial integrity: PASS
  - Calculator pricing: PASS
  - Lifecycle integration: PASS
  - Calculator review UX: PASS
  - Service journal UX: PASS
  - Syntax checks: PASS
```

After this successful run, the only production-branch change was deletion of the temporary validation workflow, producing final target HEAD:

`90ebe4d2408a7b0af7e6e7671540f632585a8804`

The final diff contains no workflow file.

## RUNTIME LIMITATION

No claim is made that this implementation session executed a real mobile browser interaction against PR25.

Independent audit should perform browser/mobile runtime checks if available. If unavailable, it must report `BROWSER_RUNTIME: NOT_PERFORMED` rather than infer runtime behavior from this report.

## AUDIT FOCUS

Independent audit should specifically verify:

1. factual Texas adoption metadata and dates against official TDLR sources;
2. rule-registry schema and all stable rule IDs;
3. no full copyrighted code books were copied into production;
4. every `CALCULATOR_RULE_MAP` target resolves;
5. Code Library is reachable under AC Tools and navigation state does not stick after leaving the group;
6. search/filter and external source links are rendered safely;
7. registry-load failure cannot break core estimating/calculator workflows;
8. service worker cache `bruno-ac-v36` contains all new assets;
9. exact six-file production scope;
10. accepted financial/calculator/service-journal behavior remains unchanged.

```yaml
merge: FORBIDDEN_UNTIL_INDEPENDENT_AUDIT_ACCEPTS
next_state: PR25_INDEPENDENT_ACCEPTANCE_AUDIT
```
