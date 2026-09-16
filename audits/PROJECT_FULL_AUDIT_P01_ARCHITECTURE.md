# PROJECT FULL AUDIT — P01 ARCHITECTURE AUDIT

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
stage: P01
status: DONE_WITH_FINDINGS
production_head_audited: 7c89b706546e4d2e465405544dc398220e664db9
production_writes: none
browser_mobile_runtime: NOT_PERFORMED
findings:
  P0: 0
  P1: 3
  P2: 2
```

## Scope reconstructed

Audited the runtime entrypoints, persistence authority, dynamic module loading, backup/restore path, calculator state gates, history/project authorities, Service Journal persistence, PWA update path, and representative integration tests. P00 runtime map is the baseline.

## P1-ARCH-01 — corrupt main Job storage is silently converted into demo/default runtime state

**Evidence:** `index.html` `loadFromStorage()` catches JSON/shape errors and returns `null`. `init()` treats `null` identically to “no stored Job” and immediately normalizes `BRUNO_SEED`. The generic `save()` later writes `state` to the same key and catches persistence errors silently.

This means malformed/corrupt `bruno-ac-v1` is not distinguished from a genuinely absent Job. A user with damaged storage can enter a normal demo/default runtime instead of a data-safety lock, and a later save path can replace the damaged raw record, destroying recoverable evidence.

**Severity:** P1 data-integrity / destructive fallback.

**Required remediation:** distinguish missing vs invalid persisted Job; preserve corrupt raw data or lock writes until an explicit reset/import/recovery action; add executable regression proving invalid JSON cannot be silently overwritten by ordinary runtime save.

## P1-ARCH-02 — corrupt Service Journal storage silently resets and overwrites

**Evidence:** `service-journal-ux.js` `load()` catches parse/normalization failures, falls through to a default/legacy-derived state, then calls `save(s)` on the same `bruno-ac-service-journal-v2` key. `save()` swallows storage errors.

A malformed current Journal therefore becomes a default Journal and is immediately written over the damaged payload. This differs from the safer calculator route, which intentionally locks instead of overwriting a malformed main Job.

**Severity:** P1 user-data loss.

**Required remediation:** fail closed on malformed current Journal payload; preserve raw storage; surface a recovery message; only create/migrate a new Journal when the current key is genuinely absent.

## P1-ARCH-03 — full-app restore is neither exact-replacement nor transactional

**Evidence:** `app-backup-bridge.js` `restoreBackup()` validates the envelope then iterates `storage.setItem()` key-by-key. It does not snapshot/rollback on write failure and does not remove existing `bruno-ac-*` keys absent from the backup. `validateBackup()` deeply validates only the Journal payload; other Bruno keys are accepted as arbitrary strings.

Consequences:
- quota/write failure can leave a partially restored application;
- stale/orphan Bruno keys can survive a “full app restore” and remain hidden authorities;
- malformed non-Journal payloads can be installed and only discovered by downstream modules after the restore.

**Severity:** P1 backup/restore/state-authority integrity.

**Required remediation:** stage and validate known high-risk payloads before mutation; snapshot all current Bruno keys; make restore exact for the Bruno namespace; rollback to the pre-restore snapshot on any mutation failure; executable tests for stale-key removal and rollback.

## P2-ARCH-01 — persistence failures are broadly swallowed

Main `save()`, Journal `save()`, multiple localStorage bridge writes, and dynamic loading helper failures frequently catch exceptions without user-visible state. Quota/private-mode/storage-denied failures can leave UI state appearing saved when it is memory-only.

**Remediation direction:** introduce a common visible persistence-failure signal or at least fail-loudly on primary Job/Journal/backup writes. P02 should fix this adjacent to P1 persistence changes where low-risk.

## P2-ARCH-02 — enhancement-chain load failures are mostly silent

`sw-register.js` `injectCss`/`loadScript` return failure through callbacks but the normal chain simply stops, with no persistent diagnostic UI. The base app remains usable, but navigation/workspace/project enhancements may be partially absent without a clear reason.

**Remediation direction:** record an explicit runtime enhancement-load failure signal/banner for required workspace modules. This is lower priority than state integrity and may remain documented debt if change risk is disproportionate.

## Architecture observations that passed

- `ac-calculator.html` has deterministic dependency order; compliance UX is loaded after all downstream engines and gates `#apply`/`#pew-confirm` against the live current gate.
- Building model remains the project-class authority for compliance; missing building data blocks rather than silently producing READY.
- M01 history core now strictly validates nested extended dependency-chain snapshots and atomic batch imports.
- Project mode bridge’s legacy capacity suppression is a compatibility/UI layer; the live load/equipment engine remains a separate authority.
- Service Journal initialization is version-guarded at the panel level, so the early load plus later workspace `init()` does not duplicate its rendered UI/listeners for the same UI version.
- PWA service worker uses one versioned cache namespace and network-first freshness for scripts/styles/JSON.

## Remediation grouping for P02

Group A — safe persistence:
1. main Job invalid-storage lock + recoverable raw preservation;
2. Service Journal invalid-storage lock;
3. user-visible primary save failure.

Group B — backup transaction:
1. exact Bruno namespace restore;
2. rollback on any remove/set failure;
3. validation of known JSON authority keys before mutation;
4. executable memory-storage failure fixtures.

P02 is authorized. No production changes were made during P01.
