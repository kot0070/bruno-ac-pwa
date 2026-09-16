'use strict';
const assert=require('assert');
const gate=require('../project-compliance-gate.js');
const pricing=require('../project-catalog-pricing-engine.js');

function readyCtx(cls){return {buildingValidation:{ok:true},loadResult:{status:'ready',input_completeness:'complete'},equipmentResult:{status:'ready',final:{mode:'catalog_oem'}},electricalResult:{status:'ready'},mechanicalResult:{status:'ready'},pricingResult:{status:'ready',blockers:[]},projectClass:cls||'residential',jurisdictionVerified:true,commercialDesignSource:'APPROVED-SOURCE'};}
let r=gate.evaluate(readyCtx());
assert.strictEqual(r.status,'ready');
assert.deepStrictEqual(r.blockers,[]);
let c=readyCtx('commercial');c.jurisdictionVerified=false;c.commercialDesignSource='';r=gate.evaluate(c);
assert.strictEqual(r.status,'blocked');
assert(r.blockers.includes('commercial_jurisdiction_AHJ_not_verified'));
assert(r.blockers.includes('commercial_design_source_required'));
let missing=readyCtx();missing.electricalResult={status:'provisional'};r=gate.evaluate(missing);assert(r.blockers.includes('electrical_dependency_not_ready'));

const row={key:'disconnect',final_qty:1,calculated_qty:1,minimum_qty:1,unit:'ea'};
assert.strictEqual(pricing.applyOverride(row,{finalQty:0,reason:'remove'}).error,'override_below_hard_minimum');
assert.strictEqual(pricing.applyOverride(row,{finalQty:2,reason:''}).error,'override_reason_required');
const ok=pricing.applyOverride(row,{finalQty:2,reason:'two systems'});assert.strictEqual(ok.ok,true);assert.strictEqual(ok.row.final_qty,2);assert.strictEqual(ok.row.requirement_source,'OVERRIDE');assert.strictEqual(ok.row.override.from,1);
console.log('project compliance gate tests passed');
