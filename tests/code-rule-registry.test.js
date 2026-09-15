const fs=require('fs');
const path=require('path');
const assert=require('assert');
const core=require('../code-rule-registry.js');
const ux=require('../code-library-ux.js');

const lib=JSON.parse(fs.readFileSync(path.join(__dirname,'..','code-library','texas-hvac-2026.json'),'utf8'));

const validation=core.validateLibrary(lib);
assert.strictEqual(validation.ok,true,validation.errors.join(', '));
assert.strictEqual(lib.sourcePolicy.fullCopyrightedCodeTextStored,false);
assert.strictEqual(lib.jurisdiction.state,'TX');
assert.strictEqual(lib.jurisdiction.effectiveDate,'2026-09-01');

const map=core.validateCalculatorMap(lib);
assert.strictEqual(map.ok,true,JSON.stringify(map.missing));
assert.ok(map.mappedKeys>=20);

assert.strictEqual(core.findRule(lib,'IRC-M1401.3-EQUIPMENT-SIZING').section,'M1401.3');
assert.strictEqual(core.findRule(lib,'IRC-M1411.9.1-OVERFLOW').family,'IRC-2024');
assert.strictEqual(core.findRule(lib,'NEC-2026-TX-ADOPTION').edition,'2026');
assert.strictEqual(core.findRule(lib,'ACCA-MANUAL-D-2016').family,'ACCA-DESIGN');
assert.deepStrictEqual(core.calculatorRuleIds('condensate-drain'),['IRC-M1411.9-CONDENSATE']);
assert.ok(core.calculatorRuleIds('disconnect').includes('NEC-2026-TX-ADOPTION'));
assert.ok(core.calculatorRuleIds('disconnect').includes('LOCAL-AHJ-VERIFY'));
assert.ok(core.calculatorRuleIds('duct-design').includes('ACCA-MANUAL-D-2016'));

const condensate=core.searchRules(lib,'condensate',{});
assert.ok(condensate.length>=3);
const nec=core.searchRules(lib,'',{family:'NEC-2026'});
assert.strictEqual(nec.length,1);
const manualD=core.searchRules(lib,'manual d',{});
assert.strictEqual(manualD.length,1);

const coverage=core.coverage(lib,[
  {key:'condensate-drain'},
  {key:'overflow-protection'},
  {key:'disconnect'},
  {key:'duct-design'},
  {key:'unknown-future-key'}
]);
assert.strictEqual(coverage.total,5);
assert.strictEqual(coverage.linked,4);
assert.strictEqual(coverage.unlinked,1);
assert.deepStrictEqual(coverage.missing,[]);

const summary=ux.summarizeLibrary(lib,core);
assert.strictEqual(summary.valid,true);
assert.strictEqual(summary.mapValid,true);
assert.strictEqual(summary.codes,6);
assert.strictEqual(summary.rules,9);
assert.strictEqual(summary.effectiveDate,'2026-09-01');

console.log('code-rule-registry tests passed');
