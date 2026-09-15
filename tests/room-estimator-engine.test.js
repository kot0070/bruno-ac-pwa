const assert=require('assert');
const fs=require('fs');
const path=require('path');
const R=require('../room-estimator-engine.js');
const Registry=require('../code-rule-registry.js');
const AC=require('../ac-calculator-engine.js');
const library=JSON.parse(fs.readFileSync(path.join(__dirname,'../code-library/texas-hvac-2026.json'),'utf8'));

(function presetPlanningBaseline(){
  const p=R.preset('typical-3-2');
  p.building.sqft=2000;
  const r=R.build(p);
  assert.strictEqual(r.metrics.supplyRegisters.calculatedBaseline,8,'3/2 preset planning supply baseline');
  assert.strictEqual(r.metrics.supplyRegisters.codeMinimum,null,'planning supply count must not masquerade as code minimum');
  assert.ok(r.checks.some(x=>x.key==='equipment-sizing'),'equipment sizing gate exists');
  assert.ok(r.checks.some(x=>/not converted into tonnage/i.test(x.detail)),'sqft must not infer tonnage');
})();

(function roomTakeoffAndOverrides(){
  const p=R.preset('typical-3-2');
  p.building.ductScope='replace';
  p.building.returnGrillesDesign=2;
  p.rooms.forEach((x,i)=>{if(x.conditioned){x.branchFtPerRoom=10+i;x.areaEach=150+i*20;}});
  p.overrides.supplyRegisters={value:10,reason:'customer_request'};
  const r=R.build(p);
  assert.strictEqual(r.ready,true,'complete takeoff should be ready');
  assert.strictEqual(r.metrics.supplyRegisters.calculatedBaseline,8);
  assert.strictEqual(r.metrics.supplyRegisters.finalQuantity,10);
  assert.strictEqual(r.metrics.supplyRegisters.finalSource,'override');
  assert.strictEqual(r.metrics.returnGrilles.finalQuantity,2);
  assert.ok(r.metrics.ductFt.finalQuantity>0);
  const inputs=R.calculatorInputs(r);
  assert.strictEqual(inputs.supplyRegisters,10);
  assert.strictEqual(inputs.returnGrilles,2);
  assert.strictEqual(inputs.ductFt,r.metrics.ductFt.finalQuantity);
})();

(function unresolvedDesignBlocks(){
  const p=R.preset('typical-3-2');
  p.building.ductScope='new';
  const r=R.build(p);
  assert.strictEqual(r.ready,false);
  assert.ok(r.blockers.some(x=>x.key==='ductFt'));
  assert.ok(r.blockers.some(x=>x.key==='returnGrilles'));
})();

(function existingDuctDoesNotInventReturn(){
  const p=R.preset('typical-3-2');
  p.building.ductScope='existing';
  const r=R.build(p);
  assert.strictEqual(r.ready,true);
  assert.strictEqual(r.metrics.ductFt.finalQuantity,0);
  assert.strictEqual(r.metrics.returnGrilles.finalQuantity,null);
  assert.ok(r.warnings.some(x=>/not changed in existing-duct mode/i.test(x)));
})();

(function overrideProvenanceWarning(){
  const p=R.preset('typical-3-2');
  p.overrides.supplyRegisters={value:12,reason:''};
  const r=R.build(p);
  assert.ok(r.warnings.some(x=>/override has no documented reason/i.test(x)));
})();

(function areaReconciliation(){
  const p=R.preset('typical-3-2');
  p.building.sqft=2000;
  p.rooms.forEach(x=>{if(x.conditioned)x.areaEach=50;});
  const r=R.build(p);
  assert.ok(r.warnings.some(x=>/differs from building area by more than 15%/i.test(x)));
})();

(function ruleTraceability(){
  assert.strictEqual(Registry.validateLibrary(library).ok,true);
  assert.strictEqual(Registry.validateCalculatorMap(library).ok,true,'all calculator map IDs must resolve');
  const p=R.preset('typical-3-2');
  const r=R.build(p);
  const entities=[];
  Object.values(r.metrics).forEach(x=>entities.push({key:x.key,ruleIds:x.ruleIds}));
  r.checks.forEach(x=>entities.push({key:x.key,ruleIds:x.ruleIds}));
  const coverage=Registry.coverage(library,entities);
  assert.deepStrictEqual(coverage.missing,[],'room estimator references must resolve');
})();

(function existingCalculatorReceivesRoomQuantities(){
  const p=R.preset('typical-3-2');
  p.building.ductScope='replace';
  p.building.returnGrillesDesign=2;
  p.rooms.forEach(x=>{if(x.conditioned)x.branchFtPerRoom=12;});
  p.overrides.supplyRegisters={value:9,reason:'contractor_choice'};
  const rr=R.build(p);assert.strictEqual(rr.ready,true);
  const generated=R.calculatorInputs(rr);
  const inputs=Object.assign({},AC.defaultInputs(),generated,{ductMode:'replace'});
  const scope=AC.buildScope(inputs);
  const supply=scope.requirements.find(x=>x.key==='supply-registers');
  const returns=scope.requirements.find(x=>x.key==='return-grilles');
  const duct=scope.requirements.find(x=>x.key==='duct');
  assert.strictEqual(supply.qty,9);
  assert.strictEqual(returns.qty,2);
  assert.strictEqual(duct.qty,generated.ductFt);
})();

console.log('room-estimator-engine tests: PASS');
