const fs=require('fs');
const path=require('path');
const assert=require('assert');
const core=require('../code-rule-registry.js');
const ux=require('../code-library-ux.js');

const lib=JSON.parse(fs.readFileSync(path.join(__dirname,'..','code-library','texas-hvac-2026.json'),'utf8'));
const matrix=JSON.parse(fs.readFileSync(path.join(__dirname,'..','code-library','hvac-calculation-source-matrix.json'),'utf8'));

const validation=core.validateLibrary(lib);
assert.strictEqual(validation.ok,true,validation.errors.join(', '));
assert.strictEqual(lib.sourcePolicy.fullCopyrightedCodeTextStored,false);
assert.strictEqual(lib.jurisdiction.state,'TX');
assert.strictEqual(lib.jurisdiction.effectiveDate,'2026-09-01');

const matrixValidation=core.validateSourceMatrix(matrix);
assert.strictEqual(matrixValidation.ok,true,matrixValidation.errors.join(', '));
assert(matrixValidation.count>=16);
assert.strictEqual(matrix.copyrightPolicy.includes('Copyrighted standards/manuals are not reproduced'),true);

const requiredFutureSources=[
  'TX_ACR_2026_BASELINE',
  'ELECTRICAL_2026_NEC_01',
  'TX_ENERGY_SINGLE_FAMILY_2015_IRC_CH11',
  'TX_ENERGY_COMMERCIAL_2015_IECC',
  'AUSTIN_TECHNICAL_CODES_2026',
  'LOCAL_AHJ_01',
  'BRUNO_TRANSPARENT_LOAD_V1',
  'RESIDENTIAL_LOAD_MANUAL_J_01',
  'COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1',
  'EQUIPMENT_SELECTION_MANUAL_S_01',
  'DUCT_DESIGN_01',
  'EQUIPMENT_OEM_01'
];
const sourceGate=core.validateRequiredSourceIds(matrix,requiredFutureSources);
assert.strictEqual(sourceGate.ok,true,JSON.stringify(sourceGate.missing));
assert.strictEqual(core.sourceById(matrix,'ELECTRICAL_2026_NEC_01').calculation_domain,'electrical');
assert.strictEqual(core.sourceById(matrix,'COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1').calculation_effect,'hard_minimum');
assert.strictEqual(core.sourceById(matrix,'BRUNO_TRANSPARENT_LOAD_V1').calculation_domain,'load');
assert.strictEqual(core.sourceById(matrix,'TX_ENERGY_COMMERCIAL_2015_IECC').jurisdiction,'TX statewide minimum');
assert.strictEqual(core.sourceById(matrix,'EQUIPMENT_OEM_01').source_url,null);
assert.strictEqual(core.sourceById(matrix,'EQUIPMENT_OEM_01').source_url_required_before_calculation,true);
assert.strictEqual(core.sourceById(matrix,'LOCAL_AHJ_01').source_url,null,'generic project AHJ source must not point to Austin');
assert.strictEqual(core.sourceById(matrix,'LOCAL_AHJ_01').source_url_required_before_calculation,true);
assert.strictEqual(core.unresolvedSourceSlots(matrix).length,2,'only project-specific AHJ and OEM source slots should remain unresolved by design');
assert(core.sourcesForDomain(matrix,'load').length>=3,'internal, residential methodology, and Austin commercial load sources must exist');
assert(core.sourcesForDomain(matrix,'energy').some(x=>x.rule_id==='TX_ENERGY_SINGLE_FAMILY_2015_IRC_CH11'));
assert(core.sourcesForDomain(matrix,'energy').some(x=>x.rule_id==='TX_ENERGY_COMMERCIAL_2015_IECC'));
assert(core.sourcesForDomain(matrix,'electrical').some(x=>x.rule_id==='ELECTRICAL_2026_NEC_01'));
assert(core.sourcesForDomain(matrix,'ventilation').some(x=>x.rule_id==='COMMERCIAL_OUTSIDE_AIR_AUSTIN_UMC_402'));

for(const src of matrix.sources){
  assert(src.applicability && src.applicability.length>10,src.rule_id+' requires explicit applicability');
  assert(src.section,src.rule_id+' requires section/provenance');
  assert(src.source_authority,src.rule_id+' requires source authority');
  if(src.source_url)assert(/^https:\/\//.test(src.source_url),src.rule_id+' source must be direct https URL');
}

const map=core.validateCalculatorMap(lib);
assert.strictEqual(map.ok,true,JSON.stringify(map.missing));
assert.ok(map.mappedKeys>=15);
assert.strictEqual(core.findRule(lib,'IRC-M1401.3-EQUIPMENT-SIZING').section,'M1401.3');
assert.strictEqual(core.findRule(lib,'IRC-M1411.9.1-OVERFLOW').family,'IRC-2024');
assert.strictEqual(core.findRule(lib,'NEC-2026-TX-ADOPTION').edition,'2026');
assert.deepStrictEqual(core.calculatorRuleIds('condensate-drain'),['IRC-M1411.9-CONDENSATE']);
assert.ok(core.calculatorRuleIds('disconnect').includes('NEC-2026-TX-ADOPTION'));
assert.ok(core.calculatorRuleIds('disconnect').includes('LOCAL-AHJ-VERIFY'));

const condensate=core.searchRules(lib,'condensate',{});
assert.ok(condensate.length>=3);
const nec=core.searchRules(lib,'',{family:'NEC-2026'});
assert.strictEqual(nec.length,1);
const coverage=core.coverage(lib,[{key:'condensate-drain'},{key:'overflow-protection'},{key:'disconnect'},{key:'unknown-future-key'}]);
assert.strictEqual(coverage.total,4);
assert.strictEqual(coverage.linked,3);
assert.strictEqual(coverage.unlinked,1);
assert.deepStrictEqual(coverage.missing,[]);

const summary=ux.summarizeLibrary(lib,core);
assert.strictEqual(summary.valid,true);
assert.strictEqual(summary.mapValid,true);
assert.strictEqual(summary.codes,6);
assert.strictEqual(summary.rules,8);
assert.strictEqual(summary.effectiveDate,'2026-09-01');
const mxSummary=ux.summarizeMatrix(matrix,core);
assert.strictEqual(mxSummary.valid,true,mxSummary.errors.join(', '));
assert.strictEqual(mxSummary.sources,matrix.sources.length);
assert.strictEqual(mxSummary.unresolvedSlots,2);

console.log('code-rule-registry tests passed');
