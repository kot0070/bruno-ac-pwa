# PR24 SERVICE CALL JOURNAL — IMPLEMENTATION PLAN

```yaml
status: IN_PROGRESS
repository: kot0070/bruno-ac-pwa
base_branch: main
base_head: 492e0340ac6926d4280f043b6d3305a0ec965fd2
planned_branch: feature/service-call-journal-ux
objective: make Dispatch first sheet a mobile-first Service Call Journal without changing existing dispatch/tax data semantics
workspace_protocol_change: false
TASK_CURRENT_change_before_implementation: false
```

## Scope

- Rename/reframe Dispatch first sheet as `Service Call Journal`.
- Reorder information hierarchy: day/date + summary + service calls first; tax settings last.
- Make Add Service Call the dominant action.
- Convert existing service-call table into a mobile card-style layout through a presentation-only UX layer.
- Collapse Tax settings by default while preserving all existing controls and calculations.
- Preserve existing `state.dispatch`, localStorage compatibility, tax/net logic, week strip, add/edit/delete/sort handlers, and Quote Method A isolation.
- Do not alter accepted financial-integrity or AC Calculator code.

## Delivery model

A separate presentation layer will enhance the existing DOM rather than rewriting dispatch persistence/business logic. Existing authoritative inputs/table rows remain the source of truth.

After implementation and validation:
1. create draft PR;
2. replace this plan with/append final implementation evidence;
3. update `audits/HANDOFF.md`;
4. replace `audits/TASK_CURRENT.md` with an audit-only exact-HEAD task;
5. return only a mini audit prompt to the user.
