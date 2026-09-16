'use strict';
const assert=require('assert');
const Load=require('../project-load-engine.js');
const Financial=require('../financial-integrity-core.js');
const Pricing=require('../project-catalog-pricing-engine.js');
const Journal=require('../service-journal-ux.js');

// HVAC conduction hand-check: 400 ft² wall @ U .10 + 1000 ft² roof @ U .05 + 100 ft² windows @ U .30.
const building={project:{projectClass:'residential',jurisdiction:'Austin, TX',conditionedFloorArea:1000,defaultCeilingHeight:10},envelope:{wall:{uFactor:.1},roof:{uFactor:.05},floor:{},windows:{totalArea:100,uFactor:.3,shgc:0},doors:{totalArea:0},infiltration:{value:0,unit:'cfm'},ventilation:{outdoorAirCfm:0},internalGains:{occupancy:0,lightingWatts:0,equipmentWatts:0},design:{indoorCoolingF:75,outdoorCoolingF:95,indoorHeatingF:70,outdoorHeatingF:30,sourceId:'HANDCHECK'}},zones:[{id:'z',name:'z',area:1000,ceilingHeight:10}]};
const lr=Load.calculate(building,{wallExposedAreaFt2:500,roofAreaFt2:1000,outdoorIndoorGrainsDifference:0,solarIrradianceBtuhFt2:0,supplyAirDeltaF:20});
assert.strictEqual(lr.cooling_sensible_Btuh,2400);
assert.strictEqual(lr.cooling_total_Btuh,2400);
assert.strictEqual(lr.heating_Btuh,4800);

// Method A: 10,000 × 1.25 / 0.85.
const methodA=Financial.methodASales(10000,.25,.15);
assert.strictEqual(methodA.ok,true);
assert(Math.abs(methodA.value-14705.882352941177)<1e-9);

// Material margin hand-check: Customer 4,500 / Your Cost 3,380 -> margin 1,120 -> 24.8888889%.
const priced=Pricing.resolve([
 {key:'a',final_qty:40,catalog_id:'a'},
 {key:'b',final_qty:1,catalog_id:'b'},
 {key:'c',final_qty:1,catalog_id:'c'}
],[
 {id:'a',unitCost:10,yourCost:7},
 {id:'b',unitCost:100,yourCost:''},
 {id:'c',unitCost:4000,yourCost:3000}
],{},{});
assert.strictEqual(priced.totals.customerMaterials,4500);
assert.strictEqual(priced.totals.yourCost,3380);
assert.strictEqual(priced.totals.marginDollar,1120);
assert(Math.abs(priced.totals.marginPct-(1120/4500))<1e-12);

// Payroll hand-check: $340 wages at default FICA/TWC/FUTA assumptions.
const s=Journal.defaultState();
s.workers=[{id:'a',name:'A'},{id:'b',name:'B'}];
s.crew=[
 {id:'a1',workerId:'a',name:'A',date:'2026-01-02',payType:'daily',rate:180,hours:0,payrollEnabled:true},
 {id:'b1',workerId:'b',name:'B',date:'2026-01-02',payType:'hourly',rate:20,hours:8,payrollEnabled:true}
];
const ledger=Journal.payrollLedger(s);
const employer=ledger.a1.employerTax+ledger.b1.employerTax;
const take=ledger.a1.takeHome+ledger.b1.takeHome;
assert.strictEqual(Number(take.toFixed(2)),313.99);
assert.strictEqual(Number(employer.toFixed(2)),37.23);
console.log('project math hand-check tests passed');
