# CURRENT WORKSPACE TASK

```yaml
workspace: audits/WORKSPACE.md
protocol: audits/PROTOCOL.md
context: audits/CONTEXT.md
handoff: audits/HANDOFF.md
roadmap: audits/ROADMAP_NEXT.md
implementation_reports:
  - audits/implementation/PR26_ROOM_BASED_ESTIMATOR_a04915f4.md
  - audits/implementation/PR26_LIVE_CODE_ESTIMATOR_5b069931.md
  - audits/implementation/PR26_HISTORY_LEVELS_43cbc681.md
  - audits/implementation/PR26_BLOCKER_FIXES_116404b1.md
previous_reject_report: audits/history/PR26_43cbc681f579b4009cc55674c4db7507d0910a7c_20260915-1749.md
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
task_id: PR26_BLOCKER_FIX_REAUDIT_04
repository: kot0070/bruno-ac-pwa
production_pr: 26
production_branch: feature/room-based-code-estimator
base_branch: main
target_head: 116404b13313af0f966695777cf55a807b27fbb5
previous_rejected_head: 43cbc681f579b4009cc55674c4db7507d0910a7c
status: ACTIVE
```

## OBJECTIVE

Perform a full independent re-audit of PR #26 at exact HEAD `116404b13313af0f966695777cf55a807b27fbb5`.

Do not limit the audit to the prior blockers. Re-check the full end-to-end live room estimator and all accepted regression gates, with special adversarial reproduction of every prior P1 and both P2 findings.

## PRIOR BLOCKERS — MUST REPRODUCE / CLOSE

1. Live L0-L6 previously passed `{version, plan, result}` wrapper instead of actual plan and evaluated defaults.
2. Confirm & Save previously failed with `invalid_room_plan`.
3. Persisted room plan previously lost rooms/overrides after reload.
4. Blocked live edit previously left prior BOM/pricing/Apply active and stale.
5. Confirmed snapshot previously wrote `compliance.ready=true` while `required-input` checks remained unresolved.

Also re-check:

6. Duplicate provenance (`sourceCalculationId`) survives Duplicate -> edit -> Confirm & Save.
7. Import rejects malformed/missing historical pricing instead of admitting misleading records.

## FULL END-TO-END SCOPE

Verify:

```text
L0 raw inputs
-> L1 normalized building/rooms
-> L2 code/design requirements
-> L3 calculated baseline
-> L4 override/compliance
-> L5 BOM/components
-> L6 current Catalog pricing
-> explicit Apply to Job
-> L7 Confirm & Save
-> Active frozen snapshot
-> History
-> Duplicate as new
-> Export / Import
```

Required checks include:

- square footage / room count never directly selects tonnage;
- planning defaults are not represented as code minimums;
- known hard minimum violations block and render red;
- unresolved design input does not become compliant final data;
- rule/source links are traceable and correct;
- live room changes update actual BOM/current Catalog pricing;
- blocked live state is fail-closed and old BOM cannot remain Apply-able;
- resolving blockers recalculates through existing authoritative Calculator path;
- live layer never auto-Applies or writes Job data;
- canonical room plan persists and fully restores rooms, overrides, building values;
- legacy wrapper persistence migrates safely if encountered;
- Confirm & Save works without shape mismatch;
- snapshot compliance readiness is truthful when `required-input` checks remain;
- historical pricing remains frozen and does not drive new live Catalog pricing;
- Duplicate preserves source provenance;
- import/export is non-destructive and malformed pricing is rejected/skipped;
- PWA cache/assets are coherent (`bruno-ac-v40`);
- mobile/browser runtime if available; otherwise report `NOT_PERFORMED` exactly.

## FINANCIAL / PRODUCT REGRESSION GATES

Re-run and independently verify no regressions in:

- PR22 financial integrity and lifecycle;
- PR23 AC Calculator review UX;
- PR24 Service Call Journal;
- PR25 Code Library and source registry;
- Quote Method A;
- Customer Price -> Job unitCost -> Quote;
- Your Cost -> procurementCostSnapshot -> P&L;
- actualCost override only;
- blank Your Cost fallback provenance;
- malformed financial values never silently become zero;
- legitimate zero remains reviewable;
- existing job snapshots change only after explicit Apply/Re-Apply.

## CI EVIDENCE

Latest blocker-fix validation:

```yaml
run_id: 35034425269
validated_commit: ae03ac71f2a73cba34569332ebadbe74d9cd0b4e
expected_result: SUCCESS
```

Expected post-CI delta to target HEAD:

```text
DELETE .github/workflows/pr26-reaudit-validation.yml
```

Independently verify this.

## REQUIRED REPORT

```yaml
report_path_template: audits/history/PR26_<AUDITED_HEAD>_<YYYYMMDD-HHMM>.md
latest_alias: audits/LATEST_AUDIT.md
required_return:
  - VERDICT
  - AUDITED HEAD
  - BLOCKERS
  - FULL REPORT
```

Write the full report in the audit workspace, update `LATEST_AUDIT.md` and `HANDOFF.md` per protocol.

AUDIT ONLY. Do not modify PR #26, production code, or merge.