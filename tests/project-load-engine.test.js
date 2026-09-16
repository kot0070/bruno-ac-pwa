'use strict';
const assert=require('assert');
const E=require('../project-load-engine.js');
function b(a){return {project:{jurisdiction:'Austin, TX',conditionedFloorArea:a,defaultCeilingHeight:10},envelope:{wall:{insulationR:13},roof:{insulationR:30},floor:{},windows:{totalArea:a*.12,uFactor:.35,shgc:.25},doors:{totalArea:40,uFactor:.5},infiltration:{value:.5,unit:'ach'},ventilation:{outdoorAirCfm:0},internalGains:{occupancy:4,lightingWatts:600,equipmentWatts:1200},design:{indoorCoolingF:75,outdoorCoolingF:100,indoorHeatingF:70,outdoorHeatingF:30,sourceId:'TEST'}},zones:[{id:'z1',name:'Zone 1',area:a,ceilingHeight:10}]}}
function x(a){return {wallExposedAreaFt2:a*.6,roofAreaFt2:a,outdoorIndoorGrainsDifference:35,solarIrradianceBtuhFt2:120,supplyAirDeltaF:20}}
const r2=E.calculate(b(2000),x(2000)),r20=E.calculate(b(20000),x(20000));
assert.notStrictEqual(r2.input_completeness,'blocked');
assert(r20.cooling_total_Btuh>r2.cooling_total_Btuh*5);
assert(r20.cooling_total_Btuh>36000);
let q=b(2000);q.project.defaultCeilingHeight=14;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.wall.insulationR=6;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.windows.totalArea=500;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.infiltration.value=1.2;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.internalGains.equipmentWatts=4000;assert(E.calculate(q,x(2000)).cooling_sensible_Btuh>r2.cooling_sensible_Btuh);
const blocked=E.calculate({project:{conditionedFloorArea:2000},envelope:{},zones:[]},{});assert.strictEqual(blocked.input_completeness,'blocked');assert.strictEqual(blocked.cooling_total_Btuh,null);
const h=E.calculate({project:{jurisdiction:'X',conditionedFloorArea:1000,defaultCeilingHeight:10},envelope:{wall:{uFactor:.1},roof:{uFactor:.05},floor:{},windows:{totalArea:100,uFactor:.3,shgc:0},doors:{totalArea:0},infiltration:{value:0,unit:'cfm'},ventilation:{outdoorAirCfm:0},internalGains:{occupancy:0,lightingWatts:0,equipmentWatts:0},design:{indoorCoolingF:75,outdoorCoolingF:95,indoorHeatingF:70,outdoorHeatingF:30,sourceId:'TEST'}},zones:[{id:'z',name:'z',area:1000,ceilingHeight:10}]},{wallExposedAreaFt2:500,roofAreaFt2:1000,outdoorIndoorGrainsDifference:0,solarIrradianceBtuhFt2:0,supplyAirDeltaF:20});
assert(Math.abs(h.cooling_sensible_Btuh-2400)<1e-9);assert(Math.abs(h.heating_Btuh-4800)<1e-9);
console.log('project load engine tests passed');
