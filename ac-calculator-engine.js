(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BrunoACCalculatorEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ENGINE_VERSION = '1.0.0';
  var SOURCE_TAG = 'ac-calculator-v1';

  function num(v, fallback) {
    var n = Number(v);
    return isFinite(n) ? n : (fallback == null ? 0 : fallback);
  }
  function bool(v, fallback) {
    if (v === true || v === false) return v;
    return fallback == null ? false : !!fallback;
  }
  function txt(v, fallback) {
    var s = String(v == null ? '' : v).trim();
    return s || (fallback || '');
  }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function defaultInputs() {
    return {
      sqft: 2000,
      systemType: 'split-heat-pump',
      jobKind: 'replace',
      tonnage: '',
      refrigerant: 'R-454B',
      indoorLocation: 'attic',
      outdoorMount: 'ground',
      lineSetFt: 25,
      condensateFt: 25,
      condensatePump: false,
      overflowDamageRisk: true,
      overflowProtection: 'pan-switch',
      thermostat: true,
      includeElectricalAccessories: true,
      includeFilterDrier: true,
      a2lMitigationRequiredByOEM: false,
      haulAway: true,
      permitAllowance: false,
      ductMode: 'existing',
      ductFt: 0,
      supplyRegisters: 0,
      returnGrilles: 0,
      notes: ''
    };
  }

  function normalizeInputs(raw) {
    raw = raw || {};
    var d = defaultInputs();
    return {
      sqft: clamp(num(raw.sqft, d.sqft), 0, 100000),
      systemType: txt(raw.systemType, d.systemType),
      jobKind: txt(raw.jobKind, d.jobKind),
      tonnage: txt(raw.tonnage, d.tonnage),
      refrigerant: txt(raw.refrigerant, d.refrigerant),
      indoorLocation: txt(raw.indoorLocation, d.indoorLocation),
      outdoorMount: txt(raw.outdoorMount, d.outdoorMount),
      lineSetFt: clamp(num(raw.lineSetFt, d.lineSetFt), 0, 1000),
      condensateFt: clamp(num(raw.condensateFt, d.condensateFt), 0, 1000),
      condensatePump: bool(raw.condensatePump, d.condensatePump),
      overflowDamageRisk: bool(raw.overflowDamageRisk, d.overflowDamageRisk),
      overflowProtection: txt(raw.overflowProtection, d.overflowProtection),
      thermostat: bool(raw.thermostat, d.thermostat),
      includeElectricalAccessories: bool(raw.includeElectricalAccessories, d.includeElectricalAccessories),
      includeFilterDrier: bool(raw.includeFilterDrier, d.includeFilterDrier),
      a2lMitigationRequiredByOEM: bool(raw.a2lMitigationRequiredByOEM, d.a2lMitigationRequiredByOEM),
      haulAway: bool(raw.haulAway, d.haulAway),
      permitAllowance: bool(raw.permitAllowance, d.permitAllowance),
      ductMode: txt(raw.ductMode, d.ductMode),
      ductFt: clamp(num(raw.ductFt, d.ductFt), 0, 5000),
      supplyRegisters: clamp(Math.round(num(raw.supplyRegisters, d.supplyRegisters)), 0, 200),
      returnGrilles: clamp(Math.round(num(raw.returnGrilles, d.returnGrilles)), 0, 50),
      notes: txt(raw.notes, '')
    };
  }

  function requirement(key, qty, units, label, level, reason, code, patterns, excludes) {
    return { key:key, qty:qty, units:units||'ea', label:label, level:level||'required', reason:reason||'', code:code||'', patterns:patterns||[], excludes:excludes||[], selected:true };
  }

  function buildScope(raw) {
    var i = normalizeInputs(raw);
    var req = [], checks = [], warnings = [], assumptions = [];
    assumptions.push('Texas ACR baseline: 2024 IRC / IMC / IFGC / UMC effective September 1, 2026; local AHJ amendments still control.');
    assumptions.push('Square footage is context only in V1. It does not auto-select tonnage, equipment model, duct size, line-set diameter, breaker, MCA/MOCP, or refrigerant charge.');
    assumptions.push('Manufacturer listing / label / installation instructions remain controlling for the selected equipment.');
    if (i.sqft > 0 && !i.tonnage) warnings.push('No tonnage selected. V1 intentionally will not infer equipment size from ' + i.sqft + ' ft² alone.');

    if (i.lineSetFt > 0 && /split|heat-pump|air-conditioner/i.test(i.systemType))
      req.push(requirement('line-set', i.lineSetFt, 'ft', 'Refrigerant line-set allowance', 'scope', 'Entered outdoor-to-indoor run. Verify exact liquid/suction diameters and maximum equivalent length from OEM.', 'OEM / IRC M1307.1', ['line set','acr tube','refrigerant tubing'], ['mini-split drain']));
    if (i.includeFilterDrier && /split|heat-pump|air-conditioner/i.test(i.systemType))
      req.push(requirement('filter-drier', 1, 'ea', 'Liquid-line filter-drier', 'recommended', 'Typical split-system installation item; follow OEM location/orientation requirements.', 'OEM / IRC M1307.1', ['filter-drier','filter drier'], []));

    if (i.condensateFt > 0) {
      req.push(requirement('condensate-drain', i.condensateFt, 'ft', 'Primary condensate drain piping', 'required', 'Cooling-coil condensate must be conveyed to an approved disposal point. V1 uses entered developed length.', '2024 IRC M1411.9, M1411.9.2', ['condensate drain pipe','condensate pvc','drain pipe','pvc condensate'], []));
      checks.push({key:'condensate-size-slope',status:'verify',level:'code',title:'Condensate drain size and slope',detail:'Verify not less than 3/4-in nominal drain size and at least 1% (1/8 in per 12 in) horizontal slope to approved disposal.',code:'2024 IRC M1411.9 / M1411.9.2'});
    }
    if (i.overflowDamageRisk) {
      checks.push({key:'overflow-protection',status:'required',level:'code',title:'Auxiliary / secondary condensate protection',detail:'Overflow protection is required where primary condensate overflow or blockage could damage building components. Method selected: ' + i.overflowProtection + '.',code:'2024 IRC M1411.9.1'});
      if (i.overflowProtection === 'pan-drain') {
        req.push(requirement('aux-pan',1,'ea','Auxiliary / emergency drain pan','required','Selected approved overflow method: pan with separate conspicuous drain.','2024 IRC M1411.9.1',['secondary drain pan','emergency drain pan','auxiliary drain pan','drain pan'],[]));
        req.push(requirement('secondary-drain',Math.max(i.condensateFt,10),'ft','Secondary overflow drain allowance','required','Separate overflow path to a conspicuous disposal point; field length is an allowance and must be verified.','2024 IRC M1411.9.1',['condensate drain pipe','drain pipe','pvc condensate'],[]));
      } else if (i.overflowProtection === 'pan-switch') {
        req.push(requirement('aux-pan',1,'ea','Auxiliary / emergency drain pan','required','Selected approved overflow method: auxiliary pan with water-level shutoff device.','2024 IRC M1411.9.1',['secondary drain pan','emergency drain pan','auxiliary drain pan','drain pan'],[]));
        req.push(requirement('float-switch',1,'ea','Water-level / float shutoff switch','required','Selected overflow protection method requires equipment shutdown before pan overflow.','2024 IRC M1411.9.1',['float switch','water level detection','water-level detection'],[]));
      } else if (i.overflowProtection === 'switch-only') {
        req.push(requirement('float-switch',1,'ea','Water-level / float shutoff switch','required','Selected approved overflow method: listed water-level detection device in an allowed location.','2024 IRC M1411.9.1',['float switch','water level detection','water-level detection'],[]));
      } else if (i.overflowProtection === 'overflow-drain') {
        req.push(requirement('secondary-drain',Math.max(i.condensateFt,10),'ft','Separate overflow drain allowance','required','Selected approved overflow method: separate overflow drain from equipment pan to a conspicuous point.','2024 IRC M1411.9.1',['condensate drain pipe','drain pipe','pvc condensate'],[]));
      }
    } else {
      checks.push({key:'overflow-protection',status:'field-verify',level:'code',title:'Overflow damage assessment',detail:'You marked building-damage risk as No. Field-verify this condition before omitting auxiliary / secondary protection.',code:'2024 IRC M1411.9.1'});
    }

    if (i.condensatePump) {
      req.push(requirement('condensate-pump',1,'ea','Condensate pump','scope','Installer selected pump for the drainage path.','2024 IRC M1411.10',['condensate pump'],[]));
      if (i.indoorLocation === 'attic' || i.indoorLocation === 'crawl')
        checks.push({key:'pump-interlock',status:'required',level:'code',title:'Condensate pump failure interlock',detail:'For a pump in an uninhabitable space, verify pump failure prevents operation of the served equipment.',code:'2024 IRC M1411.10'});
    }

    if (i.indoorLocation === 'attic') {
      checks.push({key:'attic-access',status:'verify',level:'code',title:'Attic appliance access / service space',detail:'Verify access opening, passageway, continuous flooring and service space meet the adopted IRC and permit removal/service of the appliance.',code:'2024 IRC M1305.1.2'});
      checks.push({key:'attic-light-receptacle',status:'verify',level:'coordination',title:'Attic light and receptacle at appliance',detail:'Coordinate required luminaire/switch and receptacle outlet at or near the appliance with the electrical scope.',code:'2024 IRC M1305.1.2.1 / Chapter 39'});
    }

    if (i.outdoorMount === 'ground') req.push(requirement('outdoor-pad',1,'ea','Outdoor-unit pad','scope','Ground-mounted outdoor equipment requires a suitable support/base; verify OEM/AHJ elevation and anchorage conditions.','OEM / IRC M1307.1',['condenser pad','composite condenser pad','equipment pad'],[]));
    else if (i.outdoorMount === 'wall') req.push(requirement('outdoor-bracket',1,'ea','Outdoor-unit wall bracket / stand','scope','Selected wall-mounted outdoor unit support.','OEM / IRC M1307.1',['wall bracket','wall mount'],[]));
    else if (i.outdoorMount === 'roof') req.push(requirement('outdoor-roof-support',1,'ea','Roof equipment support / rail','scope','Selected roof-mounted outdoor unit support.','OEM / IRC M1307.1',['roof equipment rail','roof rail','roof stand','equipment rail'],[]));

    if (i.thermostat) req.push(requirement('thermostat',1,'ea','Thermostat / control','scope','Included by user for this installation.','OEM / controls',['thermostat'],['wire']));
    if (i.includeElectricalAccessories && /split|heat-pump|air-conditioner|package/i.test(i.systemType)) {
      req.push(requirement('disconnect',1,'ea','HVAC disconnect','coordination','Typical outdoor-equipment electrical accessory. Final type/rating/fusing must follow nameplate, OEM and applicable electrical code.','Electrical scope / equipment nameplate',['disconnect'],[]));
      req.push(requirement('whip',1,'ea','Liquid-tight whip / equipment connection','coordination','Typical outdoor-equipment connection allowance. Verify conductor/raceway size and length in the electrical scope.','Electrical scope / equipment nameplate',['liquid-tight whip','liquid tight whip','whip'],[]));
    }

    var ref = i.refrigerant.toUpperCase().replace(/\s+/g,'');
    if (ref.indexOf('R-454B') >= 0 || ref.indexOf('R454B') >= 0 || ref.indexOf('R-32') >= 0 || ref.indexOf('R32') >= 0) {
      checks.push({key:'a2l-oem',status:'verify',level:'code',title:'A2L listing / OEM mitigation requirements',detail:'This is an A2L refrigerant selection. Verify listed system requirements, minimum room/duct conditions, leak detection and mitigation from the exact equipment instructions.',code:'2024 IRC / equipment listing / UL 60335-2-40 / OEM'});
      if (i.a2lMitigationRequiredByOEM) req.push(requirement('a2l-sensor',1,'ea','A2L leak-detection / mitigation sensor','conditional','User confirmed the selected equipment/OEM requires this item.','OEM / listed A2L system',['leak-detection sensor','leak detection sensor','a2l sensor','mitigation sensor'],[]));
    }

    if (i.jobKind === 'replace' && i.haulAway) req.push(requirement('haul-away',1,'ea','Recover / haul-away allowance','scope','Replacement job with existing equipment removal selected.','EPA/OEM/shop scope',['haul-away','haul away','recovery and haul','equipment removal'],[]));
    if (i.permitAllowance) req.push(requirement('permit',1,'ea','Permit allowance','scope','Permit allowance selected; final fee and inspection requirements are AHJ-specific.','AHJ',['permit allowance','permit fee','permit'],[]));

    if (i.ductMode !== 'existing') {
      if (i.ductFt > 0) req.push(requirement('duct',i.ductFt,'ft','Duct material allowance','scope','Entered new/replacement duct length. Duct sizing itself is not calculated in V1.','Manual D / OEM / adopted code',['flex duct','duct'],['tape','mastic','board','wrap']));
      if (i.supplyRegisters > 0) req.push(requirement('supply-registers',i.supplyRegisters,'ea','Supply registers / grilles','scope','Entered supply outlet count.','Design scope',['supply register','register'],['return']));
      if (i.returnGrilles > 0) req.push(requirement('return-grilles',i.returnGrilles,'ea','Return grilles','scope','Entered return grille count.','Design scope',['return grille','return grill'],[]));
      req.push(requirement('duct-mastic',1,'ea','Duct mastic / sealant allowance','scope','Duct installation/replacement selected.','Adopted energy/mechanical code / field scope',['mastic'],[]));
      req.push(requirement('foil-tape',1,'ea','HVAC foil tape allowance','scope','Duct installation/replacement selected.','Field scope',['foil tape'],[]));
      warnings.push('V1 does not perform Manual D duct sizing or airflow balancing. Duct quantities are takeoff inputs, not code-derived sizes.');
    }
    return {version:ENGINE_VERSION,inputs:i,requirements:req,checks:checks,warnings:warnings,assumptions:assumptions};
  }

  function hay(row) {
    return [row&&row.item,row&&row.part,row&&row.vendor,row&&row.category].filter(Boolean).join(' ').toLowerCase();
  }
  function resolveCatalogItem(catalog, req) {
    catalog = Array.isArray(catalog) ? catalog : [];
    var best=null,bestScore=0;
    for (var i=0;i<catalog.length;i++) {
      var row=catalog[i]; if(!row) continue;
      var h=hay(row),excluded=false;
      for(var x=0;x<(req.excludes||[]).length;x++) if(h.indexOf(String(req.excludes[x]).toLowerCase())>=0){excluded=true;break;}
      if(excluded) continue;
      var score=0;
      for(var p=0;p<(req.patterns||[]).length;p++){var phrase=String(req.patterns[p]).toLowerCase();if(phrase&&h.indexOf(phrase)>=0)score+=20+phrase.length;}
      if(req.key==='thermostat'&&h.indexOf('thermostat')>=0)score+=10;
      if(req.key==='disconnect'&&h.indexOf('disconnect')>=0)score+=10;
      if(req.key==='whip'&&h.indexOf('whip')>=0)score+=10;
      if(score>bestScore){bestScore=score;best=row;}
    }
    return bestScore>0?{row:best,score:bestScore}:null;
  }

  function buildResolvedBom(state, scope) {
    state=state||{}; scope=scope||buildScope({});
    var catalog=Array.isArray(state.catalog)?state.catalog:[],out=[];
    for(var i=0;i<scope.requirements.length;i++){
      var r=scope.requirements[i],hit=resolveCatalogItem(catalog,r),row=hit&&hit.row;
      out.push({key:r.key,selected:r.selected!==false,qty:r.qty,units:r.units,label:r.label,level:r.level,reason:r.reason,code:r.code,resolved:!!row,score:hit?hit.score:0,catalogId:row&&row.id!=null?String(row.id):'',item:row?(row.item||r.label):r.label,part:row?(row.part||''):'',vendor:row?(row.vendor||''):'',unitCost:row?num(row.unitCost):0,category:row?(row.category||''):'AC Calculator',note:row?'Matched catalog item':'No catalog match — custom $0 line until priced'});
    }
    return out;
  }

  function applyBomToJob(state, scope, bom) {
    if(!state||typeof state!=='object')state={};
    if(!Array.isArray(state.materialsUsed))state.materialsUsed=[];
    bom=Array.isArray(bom)?bom:buildResolvedBom(state,scope);
    var keep=[];
    for(var i=0;i<state.materialsUsed.length;i++){var old=state.materialsUsed[i];if(!old||old.calcSource!==SOURCE_TAG)keep.push(old);}
    var added=[];
    for(var j=0;j<bom.length;j++){
      var b=bom[j]; if(!b||b.selected===false||num(b.qty)<=0)continue;
      var line={id:b.catalogId||('ac-calc-'+b.key),catalogId:b.catalogId||'',qty:num(b.qty),item:b.item||b.label,part:b.part||'',vendor:b.vendor||'',units:b.units||'ea',unitCost:num(b.unitCost),crew:1,prod:0,prodUnit:'Day',category:b.category||'AC Calculator',lastPriceUpdate:todayISO(),calcSource:SOURCE_TAG,calcKey:b.key,calcLevel:b.level,calcCode:b.code||'',calcReason:b.reason||''};
      keep.push(line);added.push(line);
    }
    state.materialsUsed=keep;
    state.acCalculator={version:scope.version||ENGINE_VERSION,source:SOURCE_TAG,inputs:scope.inputs,generatedAt:new Date().toISOString(),selectedKeys:added.map(function(x){return x.calcKey;})};
    return {state:state,added:added};
  }
  function totalBomCost(bom){var sum=0;for(var i=0;i<(bom||[]).length;i++){var b=bom[i];if(b&&b.selected!==false)sum+=num(b.qty)*num(b.unitCost);}return sum;}

  return {ENGINE_VERSION:ENGINE_VERSION,SOURCE_TAG:SOURCE_TAG,defaultInputs:defaultInputs,normalizeInputs:normalizeInputs,buildScope:buildScope,resolveCatalogItem:resolveCatalogItem,buildResolvedBom:buildResolvedBom,applyBomToJob:applyBomToJob,totalBomCost:totalBomCost};
});
