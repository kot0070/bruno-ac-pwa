# NEW CHAT HANDOFF — BRUNO AC

Use this file as the canonical prompt for a fresh ChatGPT development chat.

## REPOSITORY
- Repo: https://github.com/kot0070/bruno-ac-pwa
- PRODUCTION branch: `main`
- WORKSPACE / AUDIT / PROJECT MEMORY branch: `audit/pr22-603cbca`

## NON-NEGOTIABLE WORKING MODEL
There are TWO different zones and they must never be mixed:

1. `main` = real production code. All production fixes go directly to `main`.
2. `audit/pr22-603cbca` = project memory/control center only: Master Plans, Execution State, TASK_CURRENT, audits, implementation reports, HANDOFF, LATEST_AUDIT, roadmap, completion evidence.

Execution mode: `DIRECT_MAIN + STRICT_SEQUENTIAL + AUTONOMOUS`.
Do not ask for approval between already-authorized stages. Continue autonomously unless there is a real blocker or a brand-new Master Plan requires approval.

## AUTHORITATIVE WORKSPACE FILES — READ FIRST
On branch `audit/pr22-603cbca`, read in this order:
1. `audits/PROJECT_FULL_AUDIT_MASTER_PLAN.md`
2. `audits/PROJECT_FULL_AUDIT_EXECUTION_STATE.md`
3. `audits/TASK_CURRENT.md`
4. `audits/HANDOFF.md`
5. `audits/MASTER_PLAN_CHAIN.md`
6. `audits/PROJECT_FULL_AUDIT_P11_FINAL.md` if present
7. newest files under `audits/implementation/`

These files override stale chat memory. Always verify current `main` HEAD and current Actions/Pages state before writing.

## ACTIVE MASTER
Master: `PROJECT_FULL_AUDIT_MASTER_01`
Starting accepted production HEAD: `7c89b706546e4d2e465405544dc398220e664db9`
Stages P00–P10 have been executed. P11 is the independent final audit with mandatory fix/re-audit loop until the result is `A_ACCEPT`.

Key completed stage evidence:
- P02 architecture remediation: final `867eeed47d8e2ea106922b2455a432da9ee8a217`; CI `35137010234` SUCCESS; Pages `35137121048` SUCCESS; PWA v60.
- P04 math remediation: final `0e03928e38a06fbbd59f61cd119d48c81d373680`; CI `35137868129` SUCCESS; Pages `35137928758` SUCCESS; PWA v61.
- P06 regulatory/provenance remediation: final `1a6681072541f3bbb72afa98c0b0929179241ad5`; CI `35141489808` SUCCESS; Pages `35141552548` SUCCESS; PWA v62.
- P08 ghost/runtime remediation: final `8352e2760b9717bb33d271d764ca683c855820e5`; CI `35142558380` SUCCESS; Pages `35142638650` SUCCESS; PWA v63.
- P09 executable test hardening: completed main `10b52a103d9608e626b1837bf3470f76993840d0`; CI `35150783175` SUCCESS; temp workflow removed.
- P10 cross-domain regression: validated commit `7b269cc1667aa574fa84acc5cc80caa767882741`; CI `35150968195` SUCCESS; temp workflow removed; final P10 production HEAD before P11 fixes `d9bcf159d4b600bf147ce14421b3d3cc5255ee05`; Pages `35151064984` SUCCESS.

## CURRENT P11 FIX/RE-AUDIT LOOP
The independent P11 audit found a real fail-closed gap in primary Job integrity and backup restore. Corrective work has been applied on `main`:

1. `financial-integrity-core.js`
   - `classifyPrimaryJobRaw()` now treats syntactically valid but structurally invalid primary Job objects as corruption.
   - required primary Job structure: `quote` object, `materialsUsed` array, `catalog` array.

2. `app-backup-bridge.js`
   - full-app backup restore now validates `bruno-ac-v1` structurally, not just as a generic JSON object.
   - invalid primary Job backup payload must fail BEFORE any restore mutation.

3. `project-compliance-gate.js`
   - residential/non-commercial compliance provenance now also includes `LOCAL_AHJ_01` plus the correct Texas/Austin source identity.

4. Tests strengthened:
   - `tests/app-backup-bridge.test.js`
   - `tests/storage-safety.test.js`
   - `tests/project-compliance-gate.test.js`

5. PWA cache bumped to `bruno-ac-v64`; integration test updated.

Important CI history during this corrective loop:
- First corrective full run `35151584490` FAILED only because the new structural guard test reused the same fake `Storage.prototype`, and the already-installed previous guard intercepted the second fake root. This was a TEST ISOLATION issue, not a production failure.
- Test was corrected to use an isolated `FakeStorage2` prototype.
- Corrective full regression run `35151667486` then passed ALL tests and syntax checks successfully.
- Temporary corrective workflow was removed.
- At handoff time, latest known production commit after removing that temp workflow is `d8df33f2e58f48062f299daa276492e0b9b4c6e3`.
- Exact-head Pages run for that commit is `35151736138`; it was still progressing when this handoff was written. VERIFY its final result before continuing.

## WHAT THE NEW CHAT MUST DO NEXT
1. Verify exact current `main` HEAD. Do not assume it is still `d8df33f...`.
2. Verify Pages run for the exact final production HEAD. It must be SUCCESS.
3. Verify no temporary validation workflow remains in `main`.
4. Re-run/complete the independent P11 exact-head audit against the final production HEAD after the corrective fixes.
5. Check architecture, state integrity, math, regulatory provenance, runtime loading/PWA, compliance/apply gating, history snapshots, backup/restore, storage corruption guards, and executable-test evidence.
6. If any P0/P1 or release-blocking P2 remains: fix on `main`, run full regression, remove temp workflow, verify exact-head Pages, then audit again.
7. Repeat until final grade is exactly `A_ACCEPT`.
8. Before telling the user the Master is complete, persist the final audit report and closure records in workspace branch:
   - `audits/PROJECT_FULL_AUDIT_P11_FINAL.md`
   - `audits/LATEST_AUDIT.md`
   - `audits/PROJECT_FULL_AUDIT_EXECUTION_STATE.md`
   - `audits/TASK_CURRENT.md`
   - `audits/HANDOFF.md`
   - `audits/MASTER_PLAN_CHAIN.md`
   - any needed implementation/fix-loop report.
9. Only after `A_ACCEPT`, report completion to the user. A new Master Plan requires user approval.

## HARD RULES
- Never put production code in `audit/pr22-603cbca`.
- Never put project-memory/audit docs in `main` unless they are intentionally runtime files (normally they are not).
- Never claim browser/mobile runtime if it was not actually executed. Write exactly `NOT_PERFORMED`.
- Every stage/fix-loop closure must record exact starting/final `main` HEAD and CI/Pages evidence.
- Temporary validation workflows must be removed before declaring completion.
- Prefer executable/JSDOM/runtime tests over static `source.includes(...)` assertions for high-risk runtime behavior.
- Do not silently weaken fail-closed data-integrity behavior.
- Do not invent AHJ/regulatory applicability; Austin-specific sources only for actual Austin jurisdiction.
- Keep working autonomously from repository evidence; do not make the user repeat context already stored here.

## USER COMMUNICATION
User prefers Ukrainian and concise, direct technical updates. Do not drown them in routine progress. Interrupt only for a true blocker, final Master completion, or approval of a new major Master Plan.
