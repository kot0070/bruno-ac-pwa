# BRUNO AC — PLAYWRIGHT BROWSER E2E FINAL REPORT

```yaml
master_id: PLAYWRIGHT_BROWSER_E2E_MASTER_01
status: CLOSED_A_ACCEPT
starting_accepted_main_head: d8df33f2e58f48062f299daa276492e0b9b4c6e3
final_main_head: c410f9d12ca5c0e4c0fdf0e2f36569af73657039
verdict: A_ACCEPT
browser_runtime: PERFORMED_PLAYWRIGHT_CHROMIUM_DESKTOP_AND_MOBILE_EMULATION
browser_e2e_run: 35163379213
browser_e2e_result: SUCCESS
browser_tests_passed: 10
browser_tests_failed: 0
pages_run: 35163378406
pages_result: SUCCESS
playwright_report_artifact: 10473593437
physical_mobile_runtime: NOT_PERFORMED
safari_runtime: NOT_PERFORMED
```

## Final result
The repository now has a persistent Playwright Browser E2E workflow that launches the actual Bruno AC application under Chromium rather than only evaluating source/unit/JSDOM behavior.

The final exact-production-head execution passed all 10 browser tests across two browser projects: desktop Chromium and mobile Chromium emulation.

## User-path evidence
The green suite verifies:
1. The real workspace shell boots and visible critical controls are available.
2. Visible workspace navigation changes the active application surface.
3. `New blank job` creates a structurally valid primary Job in `bruno-ac-v1`.
4. Reload preserves the primary Job without falsely activating the corruption safety lock.
5. Full-app export downloads a parseable Bruno AC backup containing a structurally valid primary Job.
6. A visible Summary overhead-rate input is edited by Playwright, autosaved to primary localStorage, survives reload, and reappears with the same value in the rendered UI.
7. All five logical scenarios execute in both desktop and mobile Chromium configurations, producing 10/10 successful tests.

## Corrective loop evidence
The first browser executions exposed assumptions hidden by prior non-browser tests: legacy/header controls existed in DOM but were not the actual visible workspace controls. The suite was corrected to use the visible workspace surface and no force-click bypasses were introduced.

A later persistence experiment targeted a Project Type control that exists in DOM but is intentionally hidden by current product CSS. That path was rejected rather than weakening browser semantics. The final persistence scenario uses a genuinely visible Summary financial input.

One exact-head attempt failed before browser execution because npm registry connectivity reset (`ECONNRESET`). The Browser E2E workflow was hardened to Node 24 with npm fetch retry/backoff. The following exact-head run installed dependencies/Chromium successfully and completed 10/10 tests.

## Exact-head release evidence
- Production `main`: `c410f9d12ca5c0e4c0fdf0e2f36569af73657039`.
- Browser E2E: run `35163379213`, conclusion `SUCCESS`.
- GitHub Pages: run `35163378406`, conclusion `SUCCESS`, same HEAD.
- Playwright report artifact: `10473593437`.

## Acceptance rule added to project process
Critical browser-visible behavior must not be declared fully accepted using only source checks, unit tests, or JSDOM when a realistic Playwright scenario can exercise it. Future final audits/releases should require exact-production-HEAD Browser E2E evidence for covered critical flows.

## Limitations
Mobile evidence is Chromium device/viewport emulation in GitHub Actions. It is not physical Android/iPhone execution. Safari/WebKit and physical-device runtime were not performed and are not claimed.
