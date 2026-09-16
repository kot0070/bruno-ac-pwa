# PROJECT FULL AUDIT — P05 REGULATORY / DOCUMENT / STANDARDS AUDIT

```yaml
master_id: PROJECT_FULL_AUDIT_MASTER_01
stage: P05
status: DONE_WITH_FINDINGS
production_head_audited: 0e03928e38a06fbbd59f61cd119d48c81d373680
production_writes: none
browser_mobile_runtime: NOT_PERFORMED
source_verification_date: 2026-09-16
findings:
  P0: 0
  P1: 3
  P2: 1
```

## Official-source verification

### Texas ACR baseline
Texas TDLR's August 31, 2026 adoption notice confirms that 16 TAC Chapter 75 moved the ACR referenced codes from the 2021 editions to the **2024 IRC, IMC, IFGC and UMC**, effective **September 1, 2026**. The source matrix's `TX_ACR_2026_BASELINE` is materially correct.

Official source: `https://www.tdlr.texas.gov/news/rulemaking/2026/08/31/commission-adopts-rules-11/`

### Texas electrical baseline
Texas TDLR's September 1, 2026 notice confirms adoption of the **2026 NEC** as the state electrical code effective September 1, 2026, with a limited Texas modification concerning GFCI requirements for certain outdoor outlets. The source matrix's `ELECTRICAL_2026_NEC_01` is materially correct as a baseline; equipment/nameplate and project/AHJ dependencies must remain separate.

Official source: `https://www.tdlr.texas.gov/news/rulemaking/2026/09/01/commission-adopts-rules-12/`

### Texas statewide energy-code baseline
SECO currently identifies **2015 IRC Chapter 11** as the statewide minimum energy code for one- and two-family residential construction three stories or fewer above grade, and **2015 IECC** for commercial, industrial and other covered construction. Local jurisdictions may adopt qualifying amendments/more stringent codes. These are distinct from the 2026 TDLR ACR mechanical-code references and must not be silently collapsed into one statewide code baseline.

Official sources:
- `https://comptroller.texas.gov/programs/seco/code/single-family.php`
- `https://comptroller.texas.gov/programs/seco/code/commercial.php`
- `https://comptroller.texas.gov/programs/seco/code/ordinances.php`

### Austin local baseline
Austin's current Building Technical Codes page lists 2024 IBC/IECC/IRC/UMC and the 2026 NEC effective September 1, 2026. Austin therefore has a local energy/mechanical baseline different from the statewide SECO minimum, and it applies only when the project is actually within Austin jurisdiction.

Official source: `https://www.austintexas.gov/development-services/building-technical-codes`

### Austin commercial mechanical checklist
The current July 14, 2025 City of Austin Mechanical Plan Review Commercial Checklist references 2024 UMC/IECC/IBC. It requires HVAC load calculations for projects installing new HVAC equipment; item 13 cites 2024 IECC C403.2.1 and calls for design loads in accordance with ANSI/ASHRAE/ACCA Standard 183 or an approved equivalent computational procedure. Item 11 calls for Mechanical COMcheck under the currently adopted IECC/ASHRAE path for new HVAC units. The checklist also contains outside-air and duct-layout requirements cited in the repository matrix.

The PDF was opened and its parsed page content inspected. Screenshot retrieval was attempted as required by the audit workflow, but the Austin PDF endpoint returned 404 to the screenshot fetcher even though the document text was available through the web source. No claim is based on an unseen screenshot.

Official source: `https://www.austintexas.gov/sites/default/files/files/Development_Services/COM_MechanicalPlanReviewCommercialChecklist.pdf`

### ACCA standards
ACCA's official technical-manual pages identify Manual J as residential load calculation, Manual S as residential equipment selection, Manual D as residential duct design, and Manual N as commercial load calculation. ACCA also explicitly distinguishes approved software from educational Speed-Sheets. The application is correct not to label `Bruno transparent envelope load v1` as Manual J/Manual N software.

Official source: `https://www.acca.org/standards/technical-manuals`

## Traceability audit

The repository has a useful source matrix with jurisdiction, applicability, calculation effect, URL, authority, section, verification date and copyright-storage metadata. The matrix correctly marks OEM data as project-specific and unavailable until exact equipment/nameplate evidence exists. However, runtime source selection currently violates the matrix's own applicability boundaries in several places.

## P1-REG-01 — Austin source IDs are injected regardless of actual jurisdiction

`project-load-engine.js` `loadSources()` returns `AUSTIN_TECHNICAL_CODES_2026` for **every** residential project and returns both `COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1` and `AUSTIN_TECHNICAL_CODES_2026` for **every** commercial project solely from `projectClass`. `project-compliance-gate.js` likewise appends `COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1` for every commercial project.

The source matrix itself says these Austin sources apply only to Austin projects. A Dripping Springs, Johnson City, unincorporated county, or other jurisdiction project can therefore display Austin-specific regulatory provenance even when Austin is not the AHJ.

**Severity:** P1 false applicability/provenance.

**P06 requirement:** jurisdiction-aware source selection. Austin-specific IDs may be emitted only when project jurisdiction/location resolves to Austin. Non-Austin projects must retain project-specific AHJ/design-source requirements without claiming Austin rules.

## P1-REG-02 — custom/transitional algorithms cite ACCA Manual J/S as if they were active calculation sources

The transparent load engine emits `RESIDENTIAL_LOAD_MANUAL_J_01` for residential output even though the engine explicitly says its zone allocation is not room-by-room Manual J and the project documentation correctly says the method is not certified Manual J software. The equipment engine initializes `sources` with `EQUIPMENT_SELECTION_MANUAL_S_01` even when its oversize policy is a separate arbitrary verified `selectionPolicy.sourceId` and the implementation is not a complete Manual S workflow.

This creates contradictory provenance: UI/source cards can imply Manual J/Manual S caused the result while the implementation intentionally does not claim those standards.

**Severity:** P1 source-traceability integrity.

**P06 requirement:** add an explicit internal/transitional method identity (`BRUNO_TRANSPARENT_LOAD_V1`) and emit methodology standards only when they genuinely govern the selected calculation/policy. Equipment result should carry its actual `selectionPolicy.sourceId` plus OEM source dependency, not unconditional Manual S.

## P1-REG-03 — statewide Texas energy-code hierarchy is absent from the calculation source matrix

The matrix includes Texas ACR, Texas NEC and Austin 2024 technical codes but omits the current SECO statewide energy-code minimums. This makes the traceability model incomplete and invites the mistaken inference that the TDLR 2024 ACR reference-code adoption also changed the statewide Texas energy code to 2024 IECC/IRC. Official SECO material still distinguishes the statewide 2015 IRC Ch.11 / 2015 IECC minimums from locally adopted codes such as Austin's 2024 IECC.

**Severity:** P1 because energy-code applicability is a core compliance dimension and the current matrix cannot represent statewide-vs-local precedence correctly.

**P06 requirement:** add separate `TX_ENERGY_SINGLE_FAMILY_2015_IRC_CH11` and `TX_ENERGY_COMMERCIAL_2015_IECC` source rows with applicability and local-amendment precedence, while keeping Austin 2024 IECC explicitly local.

## P2-REG-01 — generic LOCAL_AHJ source record uses an Austin URL

`LOCAL_AHJ_01` is correctly labeled project-specific, but its only direct URL is Austin's code-interpretation library. For non-Austin projects this is an example, not the actual AHJ source. The text says so, limiting severity, but a source-link UI can still route operators to Austin for a non-Austin job.

**P06/P08 direction:** allow a project-specific AHJ source URL/ID and treat the Austin link as an example only when Austin is selected.

## Findings that passed

- Texas ACR 2024 reference-code adoption metadata is current as of 2026-09-16.
- Texas 2026 NEC adoption metadata is current as of 2026-09-16.
- Austin 2024 technical-code baseline and 2026 NEC effective date are current.
- Austin commercial checklist citations for load calculations, COMcheck, outside air and duct layout are materially supported by the current checklist.
- OEM/nameplate values remain project-specific; the audited engines do not infer MCA/MOCP from tonnage.
- Copyright policy stores identifiers, summaries and links rather than reproducing copyrighted code books/manuals.
- `Bruno transparent envelope load v1` is not textually labeled Manual J or Manual N.

P06 remediation is authorized for P1-REG-01/02/03 and adjacent P2-REG-01 if it can be corrected without inventing a project AHJ URL.
