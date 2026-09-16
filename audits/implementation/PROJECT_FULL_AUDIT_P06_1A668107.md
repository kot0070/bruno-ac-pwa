# PROJECT FULL AUDIT — P06 REGULATORY / PROVENANCE REMEDIATION

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
stage: P06
status: DONE
started_from_main_HEAD: 0e03928e38a06fbbd59f61cd119d48c81d373680
validated_commit: 1edb09bccc7c68d80a9b5f0664c9afaf90cee6a2
completed_main_HEAD: 1a6681072541f3bbb72afa98c0b0929179241ad5
ci_run: 35141489808
ci_result: SUCCESS
pages_run: 35141552548
pages_result: SUCCESS
pwa_cache: bruno-ac-v62
temporary_validation_workflow: REMOVED
browser_mobile_runtime: NOT_PERFORMED
```

## Remediation completed

- Load provenance is now jurisdiction-aware. Austin-only source IDs are emitted only for explicit City of Austin jurisdiction values; non-Austin Texas paths use statewide SECO energy baselines.
- Added internal `BRUNO_TRANSPARENT_LOAD_V1` method identity. The custom load algorithm no longer presents Manual J as an active calculation source.
- Equipment selection no longer cites Manual S unconditionally. The result carries the actual verified selection-policy source ID plus OEM dependency; Manual S appears only when explicitly selected as the policy source.
- Added source-matrix rows for statewide Texas residential `2015 IRC Chapter 11` and commercial `2015 IECC` minimum energy-code baselines.
- `LOCAL_AHJ_01` is now a true project-specific unresolved source slot instead of linking non-Austin work to Austin. Commercial Apply readiness requires an attached AHJ source plus jurisdiction verification and design/load source.
- Compliance UX now captures project-specific AHJ source URL/document ID.
- Source-matrix validation accepts unresolved project-specific/OEM/FIELD source slots only when explicitly marked `source_url_required_before_calculation`.
- PWA shell cache bumped from v61 to v62.

## Executable evidence

Run `35141489808` passed the complete P06 regression set: regulatory matrix, load/equipment/compliance provenance, independent math fixtures, storage safety, HVAC E2E, history, Catalog, mechanical/electrical/building, one-surface DOM, Journal logic/DOM, backup, financial lifecycle, calculator pricing/lifecycle/review, secondary drain, and syntax.

Exact-head GitHub Pages run `35141552548` succeeded for `1a6681072541f3bbb72afa98c0b0929179241ad5` after the temporary validation workflow was removed.

## Regressions / limitations

No material regression observed in the executable suite. Actual physical browser/mobile runtime was not executed and remains `NOT_PERFORMED`. Project-specific AHJ evidence remains intentionally operator-provided rather than inferred.
