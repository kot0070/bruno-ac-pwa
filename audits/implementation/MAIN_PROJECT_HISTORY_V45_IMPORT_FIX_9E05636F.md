# IMPLEMENTATION REPORT — MAIN PROJECT HISTORY V45 IMPORT FIX

```yaml
task: MAIN_PROJECT_HISTORY_V45_IMPORT_FIX
repository: kot0070/bruno-ac-pwa
production_mode: DIRECT_MAIN
base_audited_head: 19846aa72a0370fbb5cd164a37d8abe9c41a750a
base_verdict: B_ACCEPT_AFTER_MINOR_FIXES
final_head: 9e05636fb3bbc26c0b60ef4624753539e728bd87
pwa_cache: bruno-ac-v45
browser_runtime: NOT_PERFORMED
```

## OBJECTIVE

Close all findings from the V44 independent audit without changing the accepted Project Calculator/history architecture.

Prior findings:

```text
P1 — full-history import not atomic/fail-closed for mixed valid + malformed payloads
P1 — totals validation allowed missing/coercible values instead of strict number|null
P2 — generated import IDs lacked explicit collision protection
```

## PRODUCTION DELTA FROM AUDITED V44

Exact compare `19846aa7... -> 9e05636f...` contains only:

- `project-history-core.js`
- `sw.js`
- `tests/project-estimator-integration.test.js`
- `tests/project-history-core.test.js`

Temporary validation workflow was deleted before final HEAD.

## F01 — ATOMIC FULL-HISTORY IMPORT

`importPayload()` now performs a complete preflight validation of every incoming snapshot before staging any imported copy.

Behavior:

```text
validate payload envelope
-> validate every source snapshot
-> allocate all new collision-free IDs
-> validate every staged imported snapshot
-> only then build and return the committed next store
```

If any member of a history batch is malformed:

```yaml
ok: false
added: 0
store: unchanged normalized target store
```

No valid subset from a mixed batch is committed.

## F02 — STRICT TOTALS CONTRACT

Required totals keys:

```yaml
- customerMaterials
- yourCost
- marginDollar
- marginPct
```

Each key must exist and its value must be exactly:

```text
finite JavaScript number OR null
```

Rejected examples now include:

```text
missing field
"200"
false
true
NaN
Infinity
```

There is no Number(...) coercion in snapshot totals validation.

## F03 — IMPORT ID COLLISION PROTECTION

Import builds a `used` set from existing local snapshot IDs and reserves each generated ID as soon as it is allocated.

Therefore a generated import ID must be unique against:

- all existing local history IDs;
- all newly generated IDs in the same import batch.

If a unique ID cannot be allocated, import fails before commit.

Source provenance remains separate:

```yaml
id: newly generated local ID
importedFromId: original source snapshot ID
```

## VERSION / PAYLOAD HARDENING

Import payload `version` is now strict numeric `1`; coercible string `"1"` is rejected.

Full-history payload additionally requires:

```yaml
history:
  schemaVersion: 1
  items: array
```

## PRESERVED V44 BEHAVIOR

No changes were made to:

- Confirm & Save gating;
- frozen historical pricing;
- Activate semantics;
- Duplicate -> current Catalog repricing;
- Project Calculator live estimate / price preview;
- 2,000 -> 20,000 ft² responsiveness;
- Commercial fail-closed;
- secondary-drain guard;
- BOM/financial gates;
- Customer Price / Your Cost separation;
- explicit Apply/Re-Apply Job snapshot lifecycle;
- full-app backup policy.

## PWA

Cache bumped:

```text
bruno-ac-v44 -> bruno-ac-v45
```

`project-history-core.js` remains in the offline shell and existing network-first JS/CSS/JSON behavior remains unchanged.

## REGRESSION TESTS ADDED

`tests/project-history-core.test.js` now explicitly covers:

1. mixed valid + malformed full-history import rejects atomically with `added=0` and unchanged target store;
2. missing totals key rejects;
3. string total rejects;
4. boolean total rejects;
5. all-null totals remain valid;
6. imported IDs are unique in resulting store;
7. coercible string payload version rejects.

## VALIDATION

Temporary workflow:

```text
.github/workflows/main-v45-history-import-validation.yml
```

Validated run:

```yaml
run: 35052657047
validated_commit: e30016c81ecf8a96d5ad8ad8c3c8bb798372c1ff
result: SUCCESS
```

Validated suites:

- Project estimator core
- Project history core
- Project estimator integration
- Service Journal
- Secondary drain guard
- Full app backup
- Financial integrity
- Calculator pricing
- Calculator lifecycle
- Calculator review UX
- Code registry
- JS syntax

Post-CI delta to final target:

```text
DELETE .github/workflows/main-v45-history-import-validation.yml
```

Final production HEAD:

```text
9e05636fb3bbc26c0b60ef4624753539e728bd87
```

Pages exact final HEAD:

```yaml
run: 35052702946
result: SUCCESS
```

## REQUIRED RE-AUDIT FOCUS

1. Prove mixed valid+invalid full-history import is atomic and does not return/commit a partially modified store.
2. Prove totals are required and strictly finite number|null only.
3. Prove generated import IDs cannot collide with existing or batch IDs.
4. Re-check single-snapshot and valid full-history import.
5. Re-check all accepted V44 history semantics and prior calculator/financial fail-closed gates.
6. Verify exact final delta and PWA v45 / Pages evidence independently.
