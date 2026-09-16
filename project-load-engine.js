(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoLoadEngine=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
var METHOD='Bruno transparent envelope load v1';
function n(v){if(v===null||v===undefined||v==='')return null;var x=Number(v);return Number.isFinite(x)?x:null}
function pos(v){var x=n(v);return x!=null&&x>=0?x:null}
function u(uFactor,r){var u=pos(uFactor);if(u!=null&&u>0)return u;var rr=pos(r);return rr!=null&&rr>0?1/rr:null}
function txt(v){return String(v==null?'':v).trim()}
function isAustinJurisdiction(p){var j=txt(p&&p.jurisdiction).toLowerCase().replace(/\s+/g,' ');return j==='austin'||j==='austin, tx'||j==='austin, texas'||j==='city of austin'||j==='city of austin, tx'||j==='city of austin, texas'}
function loadSources(p){var commercial=p&&p.projectClass==='commercial',sources=['BRUNO_TRANSPARENT_LOAD_V1'];if(isAustinJurisdiction(p)){if(commercial)sources.push('COMMERCIAL_LOAD_AUSTIN_IECC_C403_2_1');sources.push('AUSTIN_TECHNICAL_CODES_2026')}else sources.push(commercial?'TX_ENERGY_COMMERCIAL_2015_IECC':'TX_ENERGY_SINGLE_FAMILY_2015_IRC_CH11');return sources}
function blockedResult(missing,notes,sources){return {calculation_method:METHOD,input_completeness:'blocked',missing:missing,sources:sources,cooling_sensible_Btuh:null,cooling_latent_Btuh:null,cooling_total_Btuh:null,heating_Btuh:null,design_supply_airflow_CFM:null,zone_loads:[],notes:notes}}
function load(building,extra){building=building||{};extra=extra||{};var p=building.project||{},e=building.envelope||{},design=e.design||{},wall=e.wall||{},roof=e.roof||{},floor=e.floor||{},win=e.windows||{},doors=e.doors||{},inf=e.infiltration||{},vent=e.ventilation||{},g=e.internalGains||{},zones=Array.isArray(building.zones)?building.zones:[],sources=loadSources(p);
 var missing=[],notes=[];function need(k,v){if(v===null||v===undefined||v==='')missing.push(k);return v}
 var area=need('project.conditionedFloorArea',pos(p.conditionedFloorArea)),ceil=need('project.defaultCeilingHeight',pos(p.defaultCeilingHeight));
 var wallArea=need('load.wallExposedAreaFt2',pos(extra.wallExposedAreaFt2)),roofArea=need('load.roofAreaFt2',pos(extra.roofAreaFt2));
 var wallU=need('envelope.wall.uFactor_or_R',u(wall.uFactor,wall.insulationR)),roofU=need('envelope.roof.uFactor_or_R',u(roof.uFactor,roof.insulationR));
 var winArea=need('envelope.windows.totalArea',pos(win.totalArea)),winU=winArea>0?need('envelope.windows.uFactor',pos(win.uFactor)):0,shgc=winArea>0?need('envelope.windows.shgc',pos(win.shgc)):0;
 var doorArea=pos(doors.totalArea);if(doorArea==null)doorArea=0;var doorU=doorArea>0?need('envelope.doors.uFactor',pos(doors.uFactor)):0;
 var inCool=need('design.indoorCoolingF',n(design.indoorCoolingF)),outCool=need('design.outdoorCoolingF',n(design.outdoorCoolingF)),inHeat=need('design.indoorHeatingF',n(design.indoorHeatingF)),outHeat=need('design.outdoorHeatingF',n(design.outdoorHeatingF));
 var grains=need('load.outdoorIndoorGrainsDifference',pos(extra.outdoorIndoorGrainsDifference)),solar=winArea>0?need('load.solarIrradianceBtuhFt2',pos(extra.solarIrradianceBtuhFt2)):0;
 var infVal=need('envelope.infiltration.value',pos(inf.value)),infUnit=String(inf.unit||'').toLowerCase();if(infUnit!=='ach'&&infUnit!=='cfm')missing.push('envelope.infiltration.unit_ACH_or_CFM');
 var occ=need('internalGains.occupancy',pos(g.occupancy)),lighting=need('internalGains.lightingWatts',pos(g.lightingWatts)),equip=need('internalGains.equipmentWatts',pos(g.equipmentWatts));
 var ventCfm=pos(vent.outdoorAirCfm);if(ventCfm==null)ventCfm=0;
 var floorU=u(floor.uFactor,floor.insulationR),floorCoolDelta=pos(extra.floorCoolingDeltaF),floorHeatDelta=pos(extra.floorHeatingDeltaF);if(floorU!=null&&area>0&&(floorCoolDelta==null||floorHeatDelta==null))notes.push('Floor U/R is present but floor boundary deltas are unresolved; floor conduction omitted and result remains provisional.');
 if(wallArea!=null&&winArea!=null&&doorArea!=null&&winArea+doorArea>wallArea)missing.push('load.opening_area_exceeds_exposed_wall_area');
 if(missing.length)return blockedResult(missing,notes,sources);
 var dCool=Math.max(0,outCool-inCool),dHeat=Math.max(0,inHeat-outHeat),opaqueWall=wallArea-winArea-doorArea;
 var condCool=(wallU*opaqueWall+roofU*roofArea+winU*winArea+doorU*doorArea)*dCool;
 var condHeat=(wallU*opaqueWall+roofU*roofArea+winU*winArea+doorU*doorArea)*dHeat;
 if(floorU!=null&&floorCoolDelta!=null&&floorHeatDelta!=null){condCool+=floorU*area*floorCoolDelta;condHeat+=floorU*area*floorHeatDelta;}
 var volume=area*ceil,infCfm=infUnit==='ach'?infVal*volume/60:infVal,totalOutdoorCfm=infCfm+ventCfm;
 var outdoorSensibleCool=1.08*totalOutdoorCfm*dCool,outdoorSensibleHeat=1.08*totalOutdoorCfm*dHeat,outdoorLatent=0.68*totalOutdoorCfm*grains;
 var solarGain=winArea*shgc*solar,internalSensible=(lighting+equip)*3.412+occ*230,internalLatent=occ*200;
 var sensible=condCool+outdoorSensibleCool+solarGain+internalSensible,latent=outdoorLatent+internalLatent,total=sensible+latent,heating=condHeat+outdoorSensibleHeat;
 var supplyDelta=pos(extra.supplyAirDeltaF),airflow=supplyDelta&&supplyDelta>0?sensible/(1.08*supplyDelta):null;if(airflow==null)notes.push('Design supply airflow requires an explicit supply-air temperature difference; no CFM was invented.');
 var zArea=zones.reduce(function(a,z){return a+(pos(z.area)||0)},0),zoneLoads=[];zones.forEach(function(z,i){var za=pos(z.area)||0,share=zArea>0?za/zArea:(zones.length?1/zones.length:0);zoneLoads.push({id:String(z.id||i),name:String(z.name||z.type||('Zone '+(i+1))),area_ft2:za,allocation_method:'area-weighted from building load; not room-by-room Manual J',cooling_sensible_Btuh:sensible*share,cooling_latent_Btuh:latent*share,cooling_total_Btuh:total*share,heating_Btuh:heating*share})});
 var provisional=[];if(!design.sourceId)provisional.push('design.sourceId');if(!p.jurisdiction)provisional.push('project.jurisdiction');if(!zones.length)provisional.push('zones');if(zones.some(function(z){return !(pos(z.area)>0)}))provisional.push('zone.area');if(Math.abs(zArea-area)>Math.max(100,area*.1))provisional.push('zone_area_sum_vs_conditioned_area');if(floorU!=null&&(floorCoolDelta==null||floorHeatDelta==null))provisional.push('floor_boundary_delta');
 return {calculation_method:METHOD,input_completeness:provisional.length?'provisional':'complete',missing:[],provisional:provisional,sources:sources,cooling_sensible_Btuh:sensible,cooling_latent_Btuh:latent,cooling_total_Btuh:total,heating_Btuh:heating,design_supply_airflow_CFM:airflow,zone_loads:zoneLoads,components:{opaque_wall_area_ft2:opaqueWall,conditioned_volume_ft3:volume,infiltration_cfm:infCfm,ventilation_cfm:ventCfm,total_outdoor_air_cfm:totalOutdoorCfm,conduction_cooling_Btuh:condCool,conduction_heating_Btuh:condHeat,outdoor_air_sensible_cooling_Btuh:outdoorSensibleCool,outdoor_air_sensible_heating_Btuh:outdoorSensibleHeat,outdoor_air_latent_Btuh:outdoorLatent,solar_window_gain_Btuh:solarGain,internal_sensible_Btuh:internalSensible,internal_latent_Btuh:internalLatent},assumptions:{air_sensible_factor:1.08,air_latent_grains_factor:0.68,watts_to_Btuh:3.412,occupant_sensible_Btuh_each:230,occupant_latent_Btuh_each:200,heating_internal_gain_credit:false},notes:notes};
}
return {METHOD:METHOD,isAustinJurisdiction:isAustinJurisdiction,loadSources:loadSources,calculate:load};
});
