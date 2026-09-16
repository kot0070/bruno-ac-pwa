'use strict';
const assert=require('assert');
const core=require('../project-mechanical-bom-engine.js');

function eq(){return {final:{mode:'catalog_oem',systemCount:2,capacityBtuh:120000},selected:{equipment:{catalogId:'EQ-5T',manufacturer:'TestCo',model:'RTU5',oemSource:'OEM-PDF',nominalTons:5,ratedCoolingBtuh:60000,refrigerant:'R-454B'}}}}
function elec(){return {status:'ready',bom:[{key:'electrical-disconnect',label:'HVAC disconnect',requirement_source:'CODE/OEM',calculated_qty:2,minimum_qty:2,final_qty:2,unit:'ea',catalog_match_state:'unresolved',source_refs:['ELECTRICAL_2026_NEC_01','EQUIPMENT_OEM_01']}]}}
const base={equipmentResult:eq(),electricalResult:elec(),project:{systemType:'split-air-conditioner',indoorLocation:'attic'},field:{outdoorMount:'ground',lineSetFt:80,condensateFt:60,secondaryDrainFt:40,overflowProtection:'pan-switch',ductMode:'new',ductFt:220,designedSupplyOutlets:18,designedReturnGrilles:4},flags:{thermostat:true,filterDrier:true,permit:true,haulAway:true}};
const r=core.build(base);
assert.strictEqual(r.status,'ready');
assert(r.rows.length>=10);
assert(r.rows.some(x=>x.key==='equipment-primary'&&x.catalog_match_state==='resolved'&&x.catalog_id==='EQ-5T'));
assert(r.rows.some(x=>x.key==='line-set-ft'&&x.requirement_source==='FIELD'&&x.final_qty===80));
assert(r.rows.some(x=>x.key==='condensate-primary'&&x.final_qty===60));
assert(r.rows.some(x=>x.key==='electrical-disconnect'));
assert(r.rows.every(x=>['CODE','LOAD','EQUIPMENT','OEM','FIELD','OVERRIDE','CODE/OEM'].includes(x.requirement_source)));
assert(r.rows.every(x=>Array.isArray(x.source_refs)));

const missing=core.build({equipmentResult:eq(),electricalResult:elec(),project:{systemType:'split-air-conditioner'},field:{condensateFt:0,lineSetFt:0,ductMode:'new',ductFt:0},flags:{}});
assert.strictEqual(missing.status,'blocked');
assert(missing.blockers.includes('line_set_field_length_required'));
assert(missing.blockers.includes('primary_condensate_field_length_required'));
assert(missing.blockers.includes('duct_route_or_takeoff_required'));

const override=core.build({equipmentResult:{final:{mode:'override',capacityBtuh:120000,systemCount:2}},electricalResult:{},project:{},field:{},flags:{}});
assert.strictEqual(override.status,'blocked');
assert(override.blockers.includes('catalog_or_OEM_equipment_required_for_material_BOM'));
console.log('project mechanical BOM tests passed');
