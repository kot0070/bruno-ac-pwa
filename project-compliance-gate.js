(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoProjectComplianceGate=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
function txt(v){return String(v==null?'':v).trim()}
function isAustinJurisdiction(v){var j=txt(v).toLowerCase().replace(/\s+/g,' ');return j==='austin'||j==='austin, tx'||j==='austin, texas'||j==='city of austin'||j==='city of austin, tx'||j==='city of austin, texas'}
function evaluate(ctx){ctx=ctx||{};var out={status:'ready',blockers:[],warnings:[],checks:[],sources:[]},b=ctx.buildingValidation,load=ctx.loadResult,eq=ctx.equipmentResult,el=ctx.electricalResult,mech=ctx.mechanicalResult,pricing=ctx.pricingResult,projectClass=txt(ctx.projectClass)||'residential',jurisdiction=txt(ctx.projectJurisdiction),austin=isAustinJurisdiction(jurisdiction);
 function block(code){if(out.blockers.indexOf(code)<0)out.blockers.push(code)}function warn(code){if(out.warnings.indexOf(code)<0)out.warnings.push(code)}function source(id){if(id&&out.sources.indexOf(id)<0)out.sources.push(id)}
 if(!b||b.ok!==true)block('building_load_inputs_incomplete');
 if(!load||load.input_completeness==='blocked'||load.status==='blocked')block('load_calculation_blocked');else if(load.input_completeness!=='complete')warn('load_calculation_provisional');
 if(!eq||eq.status!=='ready'||!eq.final)block('equipment_selection_not_ready');
 if(!el||el.status!=='ready')block('electrical_dependency_not_ready');
 if(!mech||mech.status!=='ready')block('mechanical_BOM_not_ready');
 if(!pricing||pricing.status!=='ready')block('Catalog_pricing_not_ready');
 if(pricing&&pricing.blockers&&pricing.blockers.length)pricing.blockers.forEach(function(x){block('pricing:'+x)});
 if(projectClass==='commercial'){
   if(!ctx.jurisdictionVerified)block('commercial_jurisdiction_AHJ_not_verified');
   if(!txt(ctx.ahjSource))block('commercial_AHJ_source_required');
   if(!ctx.commercialDesignSource)block('commercial_design_source_required');
   source('LOCAL_AHJ_01');
   if(austin){source('COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1');source('AUSTIN_TECHNICAL_CODES_2026')}else source('TX_ENERGY_COMMERCIAL_2015_IECC');
 }
 if(eq&&eq.final&&eq.final.mode==='override'&&!txt(eq.final.overrideReason||eq.override&&eq.override.reason))block('equipment_override_reason_required');
 source('EQUIPMENT_OEM_01');source('ELECTRICAL_2026_NEC_01');
 out.status=out.blockers.length?'blocked':out.warnings.length?'provisional':'ready';return out}
function currentBlockReason(){if(typeof window==='undefined')return '';var g=window.BrunoCurrentComplianceGate;if(!g)return 'Project compliance gate has not resolved yet.';return g.blockers&&g.blockers.length?g.blockers.join('; '):''}
return {isAustinJurisdiction:isAustinJurisdiction,evaluate:evaluate,currentBlockReason:currentBlockReason};
});
