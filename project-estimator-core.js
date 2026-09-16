(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoProjectEstimator=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
var RESIDENTIAL=['bedroom','bathroom','kitchen','living','dining','laundry','garage','office','closet','other'];
var COMMERCIAL=['office','restroom','lobby','conference','retail','warehouse','hangar','storage','mechanical','kitchen','breakroom','other'];
function num(v){var n=Number(v);return isFinite(n)&&n>=0?n:0}
function clampInt(v){return Math.max(0,Math.round(num(v)))}
function txt(v,d){v=String(v==null?'':v).trim();return v||(d||'')}
function normalizeRoom(r){r=r||{};return {id:String(r.id||''),type:String(r.type||'other').toLowerCase(),count:clampInt(r.count||1),area:num(r.area),note:String(r.note||'')}}
function roomCatalog(type){return type==='commercial'?COMMERCIAL.slice():RESIDENTIAL.slice()}
function isConditionedResidential(t){return ['bedroom','kitchen','living','dining','office','other'].indexOf(t)>=0}
function isConditionedCommercial(t){return ['office','lobby','conference','retail','breakroom','other'].indexOf(t)>=0}
function q(key,label,opts){opts=opts||{};return {key:key,label:label,unit:opts.unit||'ea',codeMinimum:opts.codeMinimum==null?null:num(opts.codeMinimum),calculated:num(opts.calculated),final:num(opts.final==null?opts.calculated:opts.final),minimumKind:opts.minimumKind||'design',ruleId:opts.ruleId||'',sourceLabel:opts.sourceLabel||'',basis:opts.basis||'',status:opts.status||'ok',fieldRequired:!!opts.fieldRequired,category:opts.category||'',catalogId:opts.catalogId||''}}
function deriveStatus(row){if(row.fieldRequired&&!(row.final>0))return 'required-input';if(row.codeMinimum!=null&&row.final<row.codeMinimum)return 'below-minimum';return 'ok'}
function normalizeOverrides(raw){var o={};Object.keys(raw||{}).forEach(function(k){var v=raw[k];if(v!==''&&v!=null&&isFinite(Number(v))&&Number(v)>=0)o[k]=Number(v)});return o}
function buildPlan(raw){
 raw=raw||{};var type=raw.projectType==='commercial'?'commercial':'residential',rooms=(raw.rooms||[]).map(normalizeRoom).filter(function(r){return r.count>0}),overrides=normalizeOverrides(raw.overrides||{});
 var sqft=num(raw.sqft),systemType=txt(raw.systemType,'split-heat-pump'),indoorLocation=txt(raw.indoorLocation,'attic'),conditionedRooms=0,bathrooms=0,kitchens=0,garages=0,hangars=0,warehouses=0,roomArea=0;
 rooms.forEach(function(r){roomArea+=r.area*r.count;var conditioned=type==='commercial'?isConditionedCommercial(r.type):isConditionedResidential(r.type);if(conditioned)conditionedRooms+=r.count;if(r.type==='bathroom'||r.type==='restroom')bathrooms+=r.count;if(r.type==='kitchen')kitchens+=r.count;if(r.type==='garage')garages+=r.count;if(r.type==='hangar')hangars+=r.count;if(r.type==='warehouse')warehouses+=r.count;});
 var supply=Math.max(0,conditionedRooms),returns=conditionedRooms?Math.max(1,Math.ceil(conditionedRooms/4)):0,checks=[],warnings=[];
 if(!sqft)warnings.push('Enter total building area before finalizing the estimate.');
 if(!rooms.length)warnings.push('Add at least one room or zone.');
 if(roomArea>0&&sqft>0&&roomArea>sqft*1.15)warnings.push('Entered room areas exceed total building area by more than 15%; review room schedule.');
 if(type==='residential'){
   if(bathrooms)checks.push({key:'bath-exhaust',level:'code-verify',title:'Bathroom local exhaust',ruleId:'LOCAL_AHJ_01',sourceLabel:'2024 residential/mechanical code + AHJ',detail:bathrooms+' bathroom(s): verify local exhaust/ventilation and discharge arrangement. Room count alone does not determine duct size or airflow.'});
   if(kitchens)checks.push({key:'kitchen-exhaust',level:'code-verify',title:'Kitchen exhaust / make-up air coordination',ruleId:'LOCAL_AHJ_01',sourceLabel:'2024 residential/mechanical code + AHJ',detail:kitchens+' kitchen(s): verify local exhaust, appliance-specific requirements and make-up air triggers where applicable.'});
   if(garages)checks.push({key:'garage-separation',level:'code-verify',title:'Garage HVAC separation',ruleId:'LOCAL_AHJ_01',sourceLabel:'2024 IRC/IMC + AHJ',detail:garages+' garage(s): do not assume normal conditioned-air distribution. Verify separation and air-transfer/equipment-location restrictions.'});
 }else{
   checks.push({key:'commercial-code-path',level:'required',title:'Commercial code path required',ruleId:'TX_ACR_2026_BASELINE',sourceLabel:'Texas commercial mechanical baseline + AHJ',detail:'Use adopted IMC/UMC/IFGC plus applicable energy/fire requirements, local AHJ and OEM/design criteria. IRC-only residential checks are not compliance authority.'});
   if(warehouses||hangars)checks.push({key:'large-volume-space',level:'engineering',title:'Large-volume space load / air distribution',ruleId:'DUCT_DESIGN_01',sourceLabel:'Mechanical design / Manual D-equivalent engineering',detail:(warehouses+hangars)+' warehouse/hangar space(s): airflow, ventilation and equipment sizing require project-specific load/design inputs; room-count heuristics are not code minimums.'});
 }
 var split=/^split-/.test(systemType)||systemType==='mini-split';
 var lineDefault=overrides['line-set-ft']!=null?overrides['line-set-ft']:num(raw.lineSetFt);
 var condensateDefault=overrides['condensate-ft']!=null?overrides['condensate-ft']:num(raw.condensateFt);
 var rows=[
  q('supply-registers','Supply outlets / registers',{calculated:supply,final:overrides['supply-registers']!=null?overrides['supply-registers']:supply,basis:'Estimating recommendation from conditioned room/zone count. Airflow and outlet count remain design quantities, not a universal code minimum.',ruleId:'DUCT_DESIGN_01',sourceLabel:'Duct design / AHJ',category:'Ductwork'}),
  q('return-grilles','Return grilles',{calculated:returns,final:overrides['return-grilles']!=null?overrides['return-grilles']:returns,basis:'Estimating recommendation only. Return-air sizing and location are design inputs.',ruleId:'DUCT_DESIGN_01',sourceLabel:'Duct design / AHJ',category:'Ductwork'}),
  q('line-set-ft','Refrigerant line-set',{unit:'ft',calculated:lineDefault,final:lineDefault,fieldRequired:split,basis:split?'Actual developed field length required. Exact diameters/equivalent-length limits come from selected OEM equipment.':'Not automatically required for this system type.',ruleId:'EQUIPMENT_OEM_01',sourceLabel:'OEM installation instructions',category:'Line sets & fittings'}),
  q('condensate-ft','Primary condensate drain',{unit:'ft',calculated:condensateDefault,final:condensateDefault,fieldRequired:true,basis:'Actual developed run to approved disposal point must be measured; length is not derivable from square footage.',ruleId:'CONDENSATE_PRIMARY_01',sourceLabel:'Condensate rule + AHJ',category:'Condensate & drainage'})
 ];
 if(type==='residential'&&indoorLocation==='attic'){
   rows.push(q('aux-pan','Auxiliary / emergency drain pan',{codeMinimum:1,minimumKind:'required-component',calculated:1,final:overrides['aux-pan']!=null?overrides['aux-pan']:1,basis:'Attic/overflow-damage scenario uses an allowed auxiliary protection method. Final method remains AHJ/OEM dependent.',ruleId:'CONDENSATE_OVERFLOW_01',sourceLabel:'Overflow protection rule',category:'Condensate & drainage'}));
   rows.push(q('float-switch','Water-level / float shutoff switch',{codeMinimum:1,minimumKind:'required-component',calculated:1,final:overrides['float-switch']!=null?overrides['float-switch']:1,basis:'Included as the selected pan + shutoff protection method; listed device/location still requires verification.',ruleId:'CONDENSATE_OVERFLOW_01',sourceLabel:'Overflow protection rule',category:'Condensate & drainage'}));
 }
 if(type==='residential'){
   rows.push(q('disconnect','Outdoor disconnect allowance',{codeMinimum:1,minimumKind:'coordination',calculated:1,final:overrides.disconnect!=null?overrides.disconnect:1,basis:'Electrical disconnect/whip is a coordination allowance; exact rating, location and overcurrent data follow NEC/nameplate/OEM.',ruleId:'ELECTRICAL_2026_NEC_01',sourceLabel:'2026 NEC + equipment nameplate',category:'Electrical'}));
 }
 rows.forEach(function(r){r.status=deriveStatus(r)});
 var blocked=rows.filter(function(r){return r.status==='below-minimum'||r.status==='required-input'});
 var extras=(raw.extras||[]).filter(function(x){return x&&x.catalogId&&num(x.qty)>0}).map(function(x){return {id:String(x.id||''),catalogId:String(x.catalogId),label:String(x.label||'Catalog item'),qty:num(x.qty),unit:String(x.unit||'ea'),customerUnitPrice:x.customerUnitPrice==null?null:Number(x.customerUnitPrice),yourUnitCost:x.yourUnitCost==null?null:Number(x.yourUnitCost)}});
 return {schemaVersion:2,projectType:type,sqft:sqft,systemType:systemType,indoorLocation:indoorLocation,rooms:rooms,roomArea:roomArea,conditionedRooms:conditionedRooms,counts:{bathrooms:bathrooms,kitchens:kitchens,garages:garages,hangars:hangars,warehouses:warehouses},quantities:rows,checks:checks,warnings:warnings,extras:extras,overrides:overrides,blocked:blocked,ready:blocked.length===0&&sqft>0&&rooms.length>0,requiresCommercialVerification:type==='commercial'};
}
function finalQty(row,override){var base=num(row&&row.calculated);if(override===null||override===undefined||override==='')return base;return num(override)}
return {roomCatalog:roomCatalog,normalizeRoom:normalizeRoom,buildPlan:buildPlan,finalQty:finalQty,deriveStatus:deriveStatus};
});
