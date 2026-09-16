'use strict';
const assert=require('assert');
const E=require('../project-equipment-engine.js');

const load={input_completeness:'complete',cooling_total_Btuh:42000,heating_Btuh:38000};

const blocked=E.select(null,{});
assert.strictEqual(blocked.status,'blocked');
assert(blocked.blockers.includes('validated_load_required'));

const unresolved=E.select(load,{});
assert.strictEqual(unresolved.calculated.requiredCapacityBtuh,42000);
assert.strictEqual(unresolved.calculated.nominalCapacityRangeBtuh.min,42000);
assert.strictEqual(unresolved.calculated.nominalCapacityRangeBtuh.max,null);
assert(unresolved.blockers.includes('verified_equipment_selection_policy_required_for_upper_bound'));
assert(unresolved.blockers.includes('catalog_or_OEM_equipment_dataset_required'));
assert.strictEqual(unresolved.final,null);

const catalog=[
 {id:'eq-1',equipment:{manufacturer:'Acme',model:'A42',nominalBtuh:42000,ratedCoolingBtuh:43000,ratedHeatingBtuh:40000,voltage:'208/230',phase:'1',mca:24,mocp:35,refrigerant:'R-454B',lineSet:'OEM table',accessories:['kit'],oemSource:'https://example.com/oem/a42'}},
 {id:'eq-2',equipment:{manufacturer:'Acme',model:'A48',nominalBtuh:48000,ratedCoolingBtuh:48000,ratedHeatingBtuh:44000,voltage:'208/230',phase:'1',mca:27,mocp:40,refrigerant:'R-454B',lineSet:'OEM table',accessories:[],oemSource:'https://example.com/oem/a48'}}
];
const resolved=E.select(load,{selectionPolicy:{maxOversizeFraction:.2,sourceId:'VERIFIED_SELECTION_POLICY_TEST'},catalogEquipment:catalog});
assert.strictEqual(resolved.status,'ready');
assert.strictEqual(resolved.calculated.nominalCapacityRangeBtuh.max,50400);
assert.strictEqual(resolved.selected.equipment.model,'A42');
assert.strictEqual(resolved.final.capacityBtuh,43000);
assert.strictEqual(resolved.final.systemCount,1);
assert.strictEqual(resolved.calculated.requiredCapacityBtuh,42000,'selected equipment must not overwrite calculated load');

const missingOem=E.select(load,{selectionPolicy:{maxOversizeFraction:.2,sourceId:'VERIFIED_SELECTION_POLICY_TEST'},catalogEquipment:[{id:'x',equipment:{model:'NoSource',ratedCoolingBtuh:44000,ratedHeatingBtuh:40000}}]});
assert.strictEqual(missingOem.final,null,'candidate without OEM source must remain unresolved');

const override=E.select(load,{override:{capacityBtuh:60000,systemCount:2,reason:'Operator documented two-zone retrofit strategy'}});
assert.strictEqual(override.final.mode,'operator_override');
assert.strictEqual(override.final.capacityBtuh,60000);
assert.strictEqual(override.final.systemCount,2);
assert.strictEqual(override.calculated.requiredCapacityBtuh,42000,'override must not rewrite calculated load');
assert.strictEqual(override.override_reason,'Operator documented two-zone retrofit strategy');

const badOverride=E.select(load,{override:{capacityBtuh:60000,systemCount:2,reason:''}});
assert(badOverride.blockers.includes('override_reason_required'));

console.log('project equipment engine tests passed');
