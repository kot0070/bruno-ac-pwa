'use strict';
const assert=require('assert');
const Load=require('../project-load-engine.js');
const Equipment=require('../project-equipment-engine.js');
const Electrical=require('../project-electrical-engine.js');
const Mechanical=require('../project-mechanical-bom-engine.js');
const Pricing=require('../project-catalog-pricing-engine.js');
const Compliance=require('../project-compliance-gate.js');
const Building=require('../project-building-schema.js');

function building(area,wallR){return Building.normalize({project:{projectClass:'residential',location:'Austin, TX',zip:'78701',jurisdiction:'Austin, TX',totalFloorArea:area,conditionedFloorArea:area,buildingType:'single-family',stories:1,defaultCeilingHeight:10,constructionScope:'replacement',systemTypePreference:'split-air-conditioner'},envelope:{wall:{insulationR:wallR||13},roof:{insulationR:30},floor:{},windows:{totalArea:area*.12,uFactor:.35,shgc:.25,orientationKnown:true},doors:{totalArea:40,uFactor:.5},infiltration:{method:'blower-door-or-approved',value:.5,unit:'ach',category:'measured'},ventilation:{method:'project-input',outdoorAirCfm:0},internalGains:{occupancy:4,lightingWatts:600,equipmentWatts:1200},design:{indoorCoolingF:75,indoorHeatingF:70,outdoorCoolingF:100,outdoorHeatingF:30,sourceId:'TEST_DESIGN_SOURCE'},ducts:{location:'attic',condition:'existing'}},zones:[{id:'z1',name:'Main',type:'living',area:area,ceilingHeight:10,exteriorExposure:'mixed'}]});}
function loadExtra(area){return {wallExposedAreaFt2:area*.6,roofAreaFt2:area,outdoorIndoorGrainsDifference:35,solarIrradianceBtuhFt2:120,supplyAirDeltaF:20};}

const b2=building(2000,13), b20=building(20000,13);
assert.strictEqual(Building.validate(b2).ok,true);
assert.strictEqual(Building.validate(b20).ok,true);
const l2=Load.calculate(b2,loadExtra(2000));
const l20=Load.calculate(b20,loadExtra(20000));
assert.notStrictEqual(l2.input_completeness,'blocked');
assert.notStrictEqual(l20.input_completeness,'blocked');
assert(l20.cooling_total_Btuh>l2.cooling_total_Btuh*5,'20k building must materially increase calculated load');
assert(l20.cooling_total_Btuh>36000,'20k project must not remain on legacy 3 ton / 36k BTU behavior');
const worse=Load.calculate(building(2000,6),loadExtra(2000));
assert(worse.cooling_total_Btuh>l2.cooling_total_Btuh,'weaker envelope must increase load');
const incomplete=Load.calculate({project:{conditionedFloorArea:2000},envelope:{},zones:[]},{});
assert.strictEqual(incomplete.input_completeness,'blocked');
assert.strictEqual(incomplete.cooling_total_Btuh,null);

// Build a fully-resolved 2,000 ft² chain with exact OEM/nameplate + Catalog data.
const capacity=Math.ceil(l2.cooling_total_Btuh/1000)*1000;
const equipCatalog=[{id:'eq-main',equipment:{manufacturer:'TestCo',model:'A-'+capacity,nominalBtuh:capacity,ratedCoolingBtuh:capacity,ratedHeatingBtuh:Math.max(capacity,l2.heating_Btuh),voltage:'208/230',phase:'1',mca:24,mocp:35,refrigerant:'R-454B',lineSet:'OEM table',accessories:['filter-drier'],oemSource:'TEST_OEM_SOURCE'}}];
const eq=Equipment.select(l2,{selectionPolicy:{maxOversizeFraction:.5,sourceId:'TEST_VERIFIED_SELECTION_POLICY'},catalogEquipment:equipCatalog});
assert.strictEqual(eq.status,'ready');
assert(eq.final&&eq.final.capacityBtuh>=l2.cooling_total_Btuh);
const el=Electrical.evaluate(eq,{breakerRatingA:35,conductorSize:'10 AWG Cu',conductorMaterial:'copper',conductorInsulation:'THHN/THWN-2',conductorSourceId:'TEST_FIELD_NEC_VERIFICATION',disconnectRatingA:60,disconnectType:'non-fused',whipLengthFt:6,whipConduitType:'LFMC',gfciApplicable:false,serviceReceptacleApplicable:false,atticServiceApplicable:false});
assert.strictEqual(el.status,'ready');
const mech=Mechanical.build({equipmentResult:eq,electricalResult:el,project:{systemType:'split-air-conditioner',indoorLocation:'attic'},field:{outdoorMount:'ground',lineSetFt:45,condensateFt:35,secondaryDrainFt:20,overflowProtection:'pan-switch',ductMode:'new',ductFt:120,designedSupplyOutlets:8,designedReturnGrilles:2},flags:{thermostat:true,filterDrier:true,permit:true,haulAway:true}});
assert.strictEqual(mech.status,'ready');
assert(mech.rows.length>5);

// Resolve every generated row through explicit stable bindings to a synthetic Catalog.
const bindings={},catalog=[];
mech.rows.forEach((r,i)=>{const id='cat-'+i;bindings[r.key]=id;catalog.push({id,item:r.label,unitCost:10+i,yourCost:7+i});});
const priced=Pricing.resolve(mech.rows,catalog,bindings,{});
assert.strictEqual(priced.status,'ready');
assert.strictEqual(priced.resolved,priced.total);
assert(priced.totals.customerMaterials>0);
assert(priced.totals.yourCost>0);
const gate=Compliance.evaluate({buildingValidation:Building.validate(b2),loadResult:l2,equipmentResult:eq,electricalResult:el,mechanicalResult:mech,pricingResult:priced,projectClass:'residential',jurisdictionVerified:true,commercialDesignSource:''});
assert.strictEqual(gate.status,'ready');
assert.deepStrictEqual(gate.blockers,[]);

// Commercial incomplete chain remains fail-closed until AHJ/design source and downstream dependencies resolve.
const commercialGate=Compliance.evaluate({buildingValidation:{ok:true},loadResult:l20,equipmentResult:null,electricalResult:null,mechanicalResult:null,pricingResult:null,projectClass:'commercial',jurisdictionVerified:false,commercialDesignSource:''});
assert.strictEqual(commercialGate.status,'blocked');
assert(commercialGate.blockers.includes('commercial_jurisdiction_AHJ_not_verified'));
assert(commercialGate.blockers.includes('commercial_design_source_required'));

console.log('project end-to-end chain tests passed');
