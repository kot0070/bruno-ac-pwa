'use strict';
const assert=require('assert');
const gate=require('../project-compliance-gate.js');
const pricing=require('../project-catalog-pricing-engine.js');

function readyCtx(cls,jurisdiction){return {buildingValidation:{ok:true},loadResult:{status:'ready',input_completeness:'complete'},equipmentResult:{status:'ready',final:{mode:'catalog_oem'}},electricalResult:{status:'ready'},mechanicalResult:{status:'ready'},pricingResult:{status:'ready',blockers:[]},projectClass:cls||'residential',projectJurisdiction:jurisdiction||'Hays County, TX',jurisdictionVerified:true,ahjSource:'https://example.gov/project-ahj',commercialDesignSource:'APPROVED-SOURCE'};}
let r=gate.evaluate(readyCtx());
assert.strictEqual(r.status,'ready');
assert.deepStrictEqual(r.blockers,[]);
let c=readyCtx('commercial','Hays County, TX');c.jurisdictionVerified=false;c.ahjSource='';c.commercialDesignSource='';r=gate.evaluate(c);
assert.strictEqual(r.status,'blocked');
assert(r.blockers.includes('commercial_jurisdiction_AHJ_not_verified'));
assert(r.blockers.includes('commercial_AHJ_source_required'));
assert(r.blockers.includes('commercial_design_source_required'));
assert(r.sources.includes('LOCAL_AHJ_01'));
assert(r.sources.includes('TX_ENERGY_COMMERCIAL_2015_IECC'));
assert(!r.sources.includes('COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1'));
const austin=gate.evaluate(readyCtx('commercial','City of Austin'));
assert(austin.sources.includes('LOCAL_AHJ_01'));
assert(austin.sources.includes('COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1'));
assert(austin.sources.includes('AUSTIN_TECHNICAL_CODES_2026'));
assert(!austin.sources.includes('TX_ENERGY_COMMERCIAL_2015_IECC'));
assert.strictEqual(gate.isAustinJurisdiction('Austin area'),false);
assert.strictEqual(gate.isAustinJurisdiction('Austin, TX'),true);
let missing=readyCtx();missing.electricalResult={status:'provisional'};r=gate.evaluate(missing);assert(r.blockers.includes('electrical_dependency_not_ready'));

const row={key:'disconnect',final_qty:1,calculated_qty:1,minimum_qty:1,unit:'ea'};
assert.strictEqual(pricing.applyOverride(row,{finalQty:0,reason:'remove'}).error,'override_below_hard_minimum');
assert.strictEqual(pricing.applyOverride(row,{finalQty:2,reason:''}).error,'override_reason_required');
const ok=pricing.applyOverride(row,{finalQty:2,reason:'two systems'});assert.strictEqual(ok.ok,true);assert.strictEqual(ok.row.final_qty,2);assert.strictEqual(ok.row.requirement_source,'OVERRIDE');assert.strictEqual(ok.row.override.from,1);
console.log('project compliance gate tests passed');
