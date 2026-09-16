'use strict';
const assert=require('assert');
const E=require('../project-electrical-engine.js');

const selected={final:{mode:'catalog_oem',capacityBtuh:43000,systemCount:1},selected:{equipment:{catalogId:'eq-1',manufacturer:'Acme',model:'A42',voltage:'208/230',phase:'1',mca:24,mocp:35,oemSource:'https://example.com/oem/a42'}}};

const noEquipment=E.evaluate(null,{});
assert.strictEqual(noEquipment.status,'blocked');
assert(noEquipment.blockers.includes('selected_OEM_equipment_required'));

const missingNameplate=E.evaluate({final:{mode:'catalog_oem'},selected:{equipment:{model:'x',oemSource:'src'}}},{});
assert.strictEqual(missingNameplate.status,'blocked');
assert(missingNameplate.blockers.includes('nameplate_MCA_required'));
assert(missingNameplate.blockers.includes('nameplate_MOCP_required'));
assert(missingNameplate.blockers.includes('nameplate_voltage_required'));
assert(missingNameplate.blockers.includes('nameplate_phase_required'));

const provisional=E.evaluate(selected,{});
assert.strictEqual(provisional.circuit.minimumCircuitAmpacityA,24);
assert.strictEqual(provisional.circuit.maximumOvercurrentProtectionA,35);
assert.strictEqual(provisional.conductor.size,null,'conductor size must never be inferred from tonnage/MCA alone');
assert.strictEqual(provisional.conductor.status,'field_verification_required');
assert.strictEqual(provisional.disconnect.status,'unresolved');
assert.strictEqual(provisional.whip.status,'field_measurement_required');
assert.strictEqual(provisional.status,'provisional');

const invalidOcpd=E.evaluate(selected,{breakerRatingA:40});
assert.strictEqual(invalidOcpd.status,'blocked');
assert(invalidOcpd.blockers.includes('selected_OCPD_exceeds_nameplate_MOCP'));

const conductorWithoutSource=E.evaluate(selected,{conductorSize:'10 AWG Cu'});
assert(conductorWithoutSource.blockers.includes('conductor_source_required'));

const ready=E.evaluate(selected,{breakerRatingA:35,conductorSize:'10 AWG Cu',conductorMaterial:'copper',conductorInsulation:'THHN/THWN-2',conductorSourceId:'FIELD_NEC_VERIFICATION_01',disconnectRatingA:60,disconnectType:'non-fused',whipLengthFt:6,whipConduitType:'LFMC',gfciApplicable:false,serviceReceptacleApplicable:false,atticServiceApplicable:false});
assert.strictEqual(ready.status,'ready');
assert.strictEqual(ready.ocpd.selectedRatingA,35);
assert.strictEqual(ready.conductor.minimumRequiredAmpacityA,24);
assert.strictEqual(ready.conductor.size,'10 AWG Cu');
assert.strictEqual(ready.disconnect.ratingA,60);
assert.strictEqual(ready.whip.lengthFt,6);
assert(ready.bom.some(r=>r.key==='electrical-disconnect'));
assert(ready.bom.some(r=>r.key==='electrical-whip'));
assert(!ready.bom.some(r=>r.key==='electrical-gfci'));

const applicable=E.evaluate(selected,{breakerRatingA:35,conductorSize:'10 AWG Cu',conductorSourceId:'FIELD_NEC_VERIFICATION_01',disconnectRatingA:60,disconnectType:'non-fused',whipLengthFt:6,gfciApplicable:true,serviceReceptacleApplicable:true,atticServiceApplicable:true});
assert(applicable.bom.some(r=>r.key==='electrical-gfci'));
assert(applicable.bom.some(r=>r.key==='electrical-service-receptacle'));
assert(applicable.bom.some(r=>r.key==='electrical-attic-service'));

const overrideOnly={final:{mode:'operator_override',capacityBtuh:60000,systemCount:2}};
const overrideElectrical=E.evaluate(overrideOnly,{});
assert.strictEqual(overrideElectrical.status,'blocked','capacity override without exact OEM/nameplate must not create electrical values');
assert(overrideElectrical.blockers.includes('selected_OEM_equipment_required'));

console.log('project electrical engine tests passed');
