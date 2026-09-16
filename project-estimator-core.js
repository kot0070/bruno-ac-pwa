(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoProjectEstimator=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
var RESIDENTIAL=['bedroom','bathroom','kitchen','living','dining','laundry','garage','office','closet','other'];
var COMMERCIAL=['office','restroom','lobby','conference','retail','warehouse','hangar','storage','mechanical','kitchen','breakroom','other'];
function num(v){var n=Number(v);return isFinite(n)&&n>=0?n:0}
function clampInt(v){return Math.max(0,Math.round(num(v)))}
function normalizeRoom(r){r=r||{};return {id:String(r.id||''),type:String(r.type||'other').toLowerCase(),count:clampInt(r.count||1),area:num(r.area),note:String(r.note||'')}}
function roomCatalog(type){return type==='commercial'?COMMERCIAL.slice():RESIDENTIAL.slice()}
function isConditionedResidential(t){return ['bedroom','kitchen','living','dining','office','other'].indexOf(t)>=0}
function isConditionedCommercial(t){return ['office','lobby','conference','retail','breakroom','other'].indexOf(t)>=0}
function buildPlan(raw){
 raw=raw||{};var type=raw.projectType==='commercial'?'commercial':'residential',rooms=(raw.rooms||[]).map(normalizeRoom).filter(function(r){return r.count>0});
 var sqft=num(raw.sqft),conditionedRooms=0,bathrooms=0,kitchens=0,garages=0,hangars=0,warehouses=0,roomArea=0;
 rooms.forEach(function(r){roomArea+=r.area*r.count;var conditioned=type==='commercial'?isConditionedCommercial(r.type):isConditionedResidential(r.type);if(conditioned)conditionedRooms+=r.count;if(r.type==='bathroom'||r.type==='restroom')bathrooms+=r.count;if(r.type==='kitchen')kitchens+=r.count;if(r.type==='garage')garages+=r.count;if(r.type==='hangar')hangars+=r.count;if(r.type==='warehouse')warehouses+=r.count;});
 var supply=Math.max(0,conditionedRooms);var returns=conditionedRooms?Math.max(1,Math.ceil(conditionedRooms/4)):0;
 var checks=[];var warnings=[];
 if(!sqft)warnings.push('Enter total building area before finalizing the estimate.');
 if(roomArea>0&&sqft>0&&roomArea>sqft*1.15)warnings.push('Entered room areas exceed total building area by more than 15%; review room schedule.');
 if(type==='residential'){
   if(bathrooms)checks.push({key:'bath-exhaust',level:'code-verify',title:'Bathroom local exhaust',detail:bathrooms+' bathroom(s): verify required local exhaust/ventilation and discharge arrangement under the adopted residential/mechanical code and local AHJ.'});
   if(kitchens)checks.push({key:'kitchen-exhaust',level:'code-verify',title:'Kitchen exhaust / make-up air coordination',detail:kitchens+' kitchen(s): verify local exhaust, appliance-specific requirements and make-up air triggers where applicable.'});
   if(garages)checks.push({key:'garage-separation',level:'code-verify',title:'Garage HVAC separation',detail:garages+' garage(s): do not assume normal conditioned-air distribution. Verify separation, combustion/air-transfer restrictions and equipment location requirements.'});
 }else{
   checks.push({key:'commercial-code-path',level:'required',title:'Commercial code path required',detail:'Use adopted IMC/UMC/IFGC, energy/fire requirements, local AHJ and OEM criteria. Residential IRC-only checks are not compliance authority.'});
   if(warehouses||hangars)checks.push({key:'large-volume-space',level:'engineering',title:'Large-volume space load/air distribution',detail:(warehouses+hangars)+' warehouse/hangar space(s): airflow, ventilation and equipment sizing require project-specific engineering/load inputs; room-count heuristics are not used as code minimums.'});
 }
 var qty=[
  {key:'supply-registers',label:'Supply outlets / registers',codeMinimum:null,calculated:supply,unit:'ea',basis:'Estimating recommendation from conditioned room count; NOT a code minimum.'},
  {key:'return-grilles',label:'Return grilles',codeMinimum:null,calculated:returns,unit:'ea',basis:'Estimating recommendation only; Manual D / design conditions control.'}
 ];
 return {projectType:type,sqft:sqft,rooms:rooms,roomArea:roomArea,conditionedRooms:conditionedRooms,counts:{bathrooms:bathrooms,kitchens:kitchens,garages:garages,hangars:hangars,warehouses:warehouses},quantities:qty,checks:checks,warnings:warnings,requiresCommercialVerification:type==='commercial'};
}
function finalQty(row,override){var base=num(row&&row.calculated);if(override===null||override===undefined||override==='')return base;return num(override)}
return {roomCatalog:roomCatalog,normalizeRoom:normalizeRoom,buildPlan:buildPlan,finalQty:finalQty};
});
