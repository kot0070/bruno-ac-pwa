'use strict';
const assert=require('assert');
const E=require('../project-load-engine.js');
function b(a){return {project:{projectClass:'residential',jurisdiction:'Austin, TX',conditionedFloorArea:a,defaultCeilingHeight:10},envelope:{wall:{insulationR:13},roof:{insulationR:30},floor:{},windows:{totalArea:a*.12,uFactor:.35,shgc:.25},doors:{totalArea:40,uFactor:.5},infiltration:{value:.5,unit:'ach'},ventilation:{outdoorAirCfm:0},internalGains:{occupancy:4,lightingWatts:600,equipmentWatts:1200},design:{indoorCoolingF:75,outdoorCoolingF:100,indoorHeatingF:70,outdoorHeatingF:30,sourceId:'TEST'}},zones:[{id:'z1',name:'Zone 1',area:a,ceilingHeight:10}]}}
function x(a){return {wallExposedAreaFt2:a*.6,roofAreaFt2:a,outdoorIndoorGrainsDifference:35,solarIrradianceBtuhFt2:120,supplyAirDeltaF:20}}
const r2=E.calculate(b(2000),x(2000)),r20=E.calculate(b(20000),x(20000));
assert.notStrictEqual(r2.input_completeness,'blocked');
assert(r20.cooling_total_Btuh>r2.cooling_total_Btuh*5);
assert(r20.cooling_total_Btuh>36000);
assert(r2.sources.includes('RESIDENTIAL_LOAD_MANUAL_J_01'));
assert(!r2.sources.includes('COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1'));
let commercial=b(2000);commercial.project.projectClass='commercial';const rc=E.calculate(commercial,x(2000));
assert(rc.sources.includes('COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1'));
assert(!rc.sources.includes('RESIDENTIAL_LOAD_MANUAL_J_01'));
let q=b(2000);q.project.defaultCeilingHeight=14;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.wall.insulationR=6;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.windows.totalArea=500;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.infiltration.value=1.2;assert(E.calculate(q,x(2000)).cooling_total_Btuh>r2.cooling_total_Btuh);
q=b(2000);q.envelope.internalGains.equipmentWatts=4000;assert(E.calculate(q,x(2000)).cooling_sensible_Btuh>r2.cooling_sensible_Btuh);
const blocked=E.calculate({project:{conditionedFloorArea:2000},envelope:{},zones:[]},{});assert.strictEqual(blocked.input_completeness,'blocked');assert.strictEqual(blocked.cooling_total_Btuh,null);
const badGeometry=b(2000);badGeometry.envelope.windows.totalArea=700;badGeometry.envelope.doors.totalArea=100;const badGeometryResult=E.calculate(badGeometry,{wallExposedAreaFt2:600,roofAreaFt2:2000,outdoorIndoorGrainsDifference:35,solarIrradianceBtuhFt2:120,supplyAirDeltaF:20});
assert.strictEqual(badGeometryResult.input_completeness,'blocked');
assert(badGeometryResult.missing.includes('load.opening_area_exceeds_exposed_wall_area'));
assert.strictEqual(badGeometryResult.cooling_total_Btuh,null);
const h=E.calculate({project:{projectClass:'residential',jurisdiction:'X',conditionedFloorArea:1000,defaultCeilingHeight:10},envelope:{wall:{uFactor:.1},roof:{uFactor:.05},floor:{},windows:{totalArea:100,uFactor:.3,shgc:0},doors:{totalArea:0},infiltration:{value:0,unit:'cfm'},ventilation:{outdoorAirCfm:0},internalGains:{occupancy:0,lightingWatts:0,equipmentWatts:0},design:{indoorCoolingF:75,outdoorCoolingF:95,indoorHeatingF:70,outdoorHeatingF:30,sourceId:'TEST'}},zones:[{id:'z',name:'z',area:1000,ceilingHeight:10}]},{wallExposedAreaFt2:500,roofAreaFt2:1000,outdoorIndoorGrainsDifference:0,solarIrradianceBtuhFt2:0,supplyAirDeltaF:20});
assert(Math.abs(h.cooling_sensible_Btuh-2400)<1e-9);assert(Math.abs(h.heating_Btuh-4800)<1e-9);
console.log('project load engine tests passed');
