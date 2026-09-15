(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BrunoACCalculatorEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ENGINE_VERSION = '2.0.0';
  var SOURCE_TAG = 'ac-calculator';
  var SOURCE_VERSION = 2;

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
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
  function normUnit(u) {
    u = norm(u).replace(/\./g, '');
    if (u === 'ft' || u === 'feet' || u === 'foot' || u === "'") return 'ft';
    if (u === 'ea' || u === 'each' || u === 'pc' || u === 'pcs' || u === 'piece') return 'ea';
    if (u === 'lb' || u === 'lbs' || u === 'pound' || u === 'pounds') return 'lb';
    return u;
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function uid(prefix) {
    return (prefix || 'acm') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
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
      secondaryDrainFt: 0,
      condensatePump: false,
      pumpSpaceClass: 'verify',
      overflowDamageRisk: true,
      overflowProtection: 'pan-switch',
      thermostat: true,
      includeElectricalAccessories: true,
      includeFilterDrier: true,
      a2lRdsStatus: 'verify',
      a2lFieldPartRequired: false,
      a2lOemPart: '',
      haulAway: true,
      permitAllowance: false,
      ductMode: 'existing',
      ductFt: 0,
      supplyRegisters: 0,
      returnGrilles: 0,
      includeRepairInstallScope: false,
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
      secondaryDrainFt: clamp(num(raw.secondaryDrainFt, d.secondaryDrainFt), 0, 1000),
      condensatePump: bool(raw.condensatePump, d.condensatePump),
      pumpSpaceClass: txt(raw.pumpSpaceClass, d.pumpSpaceClass),
      overflowDamageRisk: bool(raw.overflowDamageRisk, d.overflowDamageRisk),
      overflowProtection: txt(raw.overflowProtection, d.overflowProtection),
      thermostat: bool(raw.thermostat, d.thermostat),
      includeElectricalAccessories: bool(raw.includeElectricalAccessories, d.includeElectricalAccessories),
      includeFilterDrier: bool(raw.includeFilterDrier, d.includeFilterDrier),
      a2lRdsStatus: txt(raw.a2lRdsStatus, d.a2lRdsStatus),
      a2lFieldPartRequired: bool(raw.a2lFieldPartRequired, d.a2lFieldPartRequired),
      a2lOemPart: txt(raw.a2lOemPart, ''),
      haulAway: bool(raw.haulAway, d.haulAway),
      permitAllowance: bool(raw.permitAllowance, d.permitAllowance),
      ductMode: txt(raw.ductMode, d.ductMode),
      ductFt: clamp(num(raw.ductFt, d.ductFt), 0, 5000),
      supplyRegisters: clamp(Math.round(num(raw.supplyRegisters, d.supplyRegisters)), 0, 200),
      returnGrilles: clamp(Math.round(num(raw.returnGrilles, d.returnGrilles)), 0, 50),
      includeRepairInstallScope: bool(raw.includeRepairInstallScope, d.includeRepairInstallScope),
      notes: txt(raw.notes, '')
    };
  }

  function requirement(opts) {
    opts = opts || {};
    return {
      key: opts.key || '', qty: num(opts.qty, 1), units: opts.units || 'ea',
      label: opts.label || '', level: opts.level || 'scope', reason: opts.reason || '',
      code: opts.code || '', category: opts.category || '', includeTokens: opts.includeTokens || [],
      excludeTokens: opts.excludeTokens || [], preferredIds: opts.preferredIds || [],
      allowPackagedLength: !!opts.allowPackagedLength, compatibleSystems: opts.compatibleSystems || [],
      selected: opts.selected !== false, forceUnresolved: !!opts.forceUnresolved,
      requiredLengthFt: num(opts.requiredLengthFt, 0), customPart: opts.customPart || ''
    };
  }

  function isA2L(ref) {
    ref = String(ref || '').toUpperCase().replace(/\s+/g,'');
    return ref.indexOf('R-454B') >= 0 || ref.indexOf('R454B') >= 0 || ref.indexOf('R-32') >= 0 || ref.indexOf('R32') >= 0;
  }
  function isSplitSystem(t) { return t === 'split-heat-pump' || t === 'split-air-conditioner' || t === 'split-ac-furnace'; }
  function isMiniSplit(t) { return t === 'mini-split'; }
  function isPackage(t) { return t === 'package'; }

  function buildScope(raw) {
    var i = normalizeInputs(raw);
    var req = [], checks = [], warnings = [], assumptions = [];
    var installScope = i.jobKind !== 'repair' || i.includeRepairInstallScope;

    assumptions.push('Texas ACR baseline: 2024 IRC / IMC / IFGC / UMC effective September 1, 2026; local AHJ amendments still control.');
    assumptions.push('Square footage is context only. V2 does not auto-select tonnage, equipment model, duct size, line-set diameter, breaker, MCA/MOCP or refrigerant charge.');
    assumptions.push('Manufacturer listing, equipment label and installation instructions control equipment-specific requirements.');

    if (i.sqft > 0 && !i.tonnage) warnings.push('No tonnage selected. V2 intentionally will not infer equipment size from ' + i.sqft + ' ft² alone.');
    if (i.jobKind === 'repair' && !i.includeRepairInstallScope) warnings.push('Repair / modification mode: installation-only BOM generation is disabled until “Include installation materials” is explicitly enabled.');

    if (installScope && (isSplitSystem(i.systemType) || isMiniSplit(i.systemType)) && i.lineSetFt > 0) {
      req.push(requirement({
        key:'line-set', qty:i.lineSetFt, units:'ft', label:'Refrigerant line-set allowance', level:'scope',
        reason:'Entered outdoor-to-indoor run. Exact liquid/suction diameters and maximum equivalent length must come from the selected OEM equipment.',
        code:'OEM / 2024 IRC M1307.1', category:'Line sets & fittings', includeTokens:['line set','acr tube','refrigerant tubing'],
        excludeTokens:['mini-split drain','drain hose'], preferredIds:['ac-ls-17'], allowPackagedLength:true, requiredLengthFt:i.lineSetFt
      }));
    }

    if (installScope && i.includeFilterDrier && isSplitSystem(i.systemType)) {
      req.push(requirement({key:'filter-drier',qty:1,units:'ea',label:'Liquid-line filter-drier',level:'recommended',
        reason:'Typical split-system installation item; exact requirement/location follows OEM instructions.',code:'OEM / 2024 IRC M1307.1',
        category:'Line sets & fittings',includeTokens:['filter-drier','filter drier']}));
    } else if (installScope && i.includeFilterDrier && isMiniSplit(i.systemType)) {
      warnings.push('Mini-split filter-drier is not auto-generated. Use only if the exact OEM system requires a field-installed part.');
    }

    if (installScope && i.condensateFt > 0) {
      req.push(requirement({key:'condensate-drain',qty:i.condensateFt,units:'ft',label:'Primary condensate drain piping',level:'required',
        reason:'Cooling-coil condensate must be conveyed to an approved disposal point. Quantity is the entered developed run length.',
        code:'2024 IRC M1411.9 / M1411.9.2',category:'Condensate & drainage',includeTokens:['condensate drain','condensate pvc','drain pipe','pvc']}));
      checks.push({key:'condensate-size-slope',status:'verify',level:'code',title:'Condensate drain size, slope and serviceability',
        detail:'Verify adopted-code minimum drain size, required slope, approved disposal point, and a serviceable arrangement that allows blockage removal without cutting the drain line.',
        code:'2024 IRC M1411.9 / M1411.9.2 / M1411.9.3'});
    }

    if (installScope && i.overflowDamageRisk) {
      checks.push({key:'overflow-protection',status:'required',level:'code',title:'Auxiliary / secondary condensate protection',
        detail:'Where overflow or primary-drain stoppage can damage building components, provide an allowed protection method. Selected model-code method: ' + i.overflowProtection + '. Verify local AHJ amendments/approval.',
        code:'2024 IRC M1411.9.1'});
      if (i.overflowProtection === 'pan-drain') {
        req.push(requirement({key:'aux-pan',qty:1,units:'ea',label:'Auxiliary / emergency drain pan',level:'required',reason:'Selected model-code overflow method; verify local AHJ approval.',code:'2024 IRC M1411.9.1',category:'Condensate & drainage',includeTokens:['secondary drain pan','emergency drain pan','auxiliary drain pan']}));
        if (i.secondaryDrainFt > 0) req.push(requirement({key:'secondary-drain',qty:i.secondaryDrainFt,units:'ft',label:'Secondary overflow drain',level:'required',reason:'Entered separate overflow-drain run to a conspicuous point.',code:'2024 IRC M1411.9.1',category:'Condensate & drainage',includeTokens:['condensate drain','drain pipe','pvc']}));
        else warnings.push('Secondary overflow-drain method selected but secondary drain length is 0 ft. Enter the actual field run before pricing.');
      } else if (i.overflowProtection === 'pan-switch') {
        req.push(requirement({key:'aux-pan',qty:1,units:'ea',label:'Auxiliary / emergency drain pan',level:'required',reason:'Selected model-code overflow method; verify local AHJ approval.',code:'2024 IRC M1411.9.1',category:'Condensate & drainage',includeTokens:['secondary drain pan','emergency drain pan','auxiliary drain pan']}));
        req.push(requirement({key:'float-switch',qty:1,units:'ea',label:'Water-level / float shutoff switch',level:'required',reason:'Selected overflow-protection method uses equipment shutdown before pan overflow; verify listed device and local AHJ acceptance.',code:'2024 IRC M1411.9.1',category:'Condensate & drainage',includeTokens:['float switch','water level','water-level']}));
      } else if (i.overflowProtection === 'switch-only') {
        req.push(requirement({key:'float-switch',qty:1,units:'ea',label:'Water-level / float shutoff switch',level:'required',reason:'Selected model-code method; verify listed-device location and local AHJ approval.',code:'2024 IRC M1411.9.1',category:'Condensate & drainage',includeTokens:['float switch','water level','water-level']}));
      } else if (i.overflowProtection === 'overflow-drain') {
        if (i.secondaryDrainFt > 0) req.push(requirement({key:'secondary-drain',qty:i.secondaryDrainFt,units:'ft',label:'Separate overflow drain',level:'required',reason:'Entered separate overflow-drain run to a conspicuous point.',code:'2024 IRC M1411.9.1',category:'Condensate & drainage',includeTokens:['condensate drain','drain pipe','pvc']}));
        else warnings.push('Separate overflow-drain method selected but secondary drain length is 0 ft. Enter the actual field run before pricing.');
      }
    } else if (installScope) {
      checks.push({key:'overflow-protection',status:'field-verify',level:'code',title:'Overflow damage assessment',detail:'Building-damage risk is marked No. Field-verify before omitting auxiliary / secondary protection.',code:'2024 IRC M1411.9.1'});
    }

    if (installScope && i.condensatePump) {
      req.push(requirement({key:'condensate-pump',qty:1,units:'ea',label:'Condensate pump',level:'scope',reason:'Installer selected pump for the drainage path.',code:'2024 IRC M1411.10',category:'Condensate & drainage',includeTokens:['condensate pump']}));
      if (i.pumpSpaceClass === 'uninhabitable') checks.push({key:'pump-interlock',status:'required',level:'code',title:'Condensate pump failure interlock',detail:'For a condensate pump in an uninhabitable space, verify pump failure prevents operation of the served equipment.',code:'2024 IRC M1411.10'});
      else if (i.pumpSpaceClass === 'verify') checks.push({key:'pump-interlock',status:'verify',level:'code',title:'Condensate pump space classification',detail:'Confirm whether the pump is in an uninhabitable space; if yes, verify failure interlock of the served equipment.',code:'2024 IRC M1411.10'});
    }

    if (installScope && !isPackage(i.systemType) && i.indoorLocation === 'attic') {
      checks.push({key:'attic-access',status:'verify',level:'code',title:'Attic appliance access / service space',detail:'Verify access opening, passageway, continuous flooring and service space for the appliance and removal path.',code:'2024 IRC M1305.1.2'});
      checks.push({key:'attic-light-receptacle',status:'verify',level:'coordination',title:'Attic light and receptacle at appliance',detail:'Coordinate required lighting/switching and receptacle outlet with the electrical scope.',code:'2024 IRC M1305.1.2.1 / electrical provisions'});
    }

    if (installScope && i.outdoorMount !== 'existing') {
      if (isPackage(i.systemType)) {
        req.push(requirement({key:'package-support',qty:1,units:'ea',label:'Package-unit support / curb / slab',level:'scope',reason:'Package-unit support must be selected for the exact equipment and mounting condition; generic condenser pads/rails are not auto-selected.',code:'OEM / 2024 IRC M1307.1',category:'Package units',forceUnresolved:true}));
      } else if (i.outdoorMount === 'ground') {
        req.push(requirement({key:'outdoor-pad',qty:1,units:'ea',label:'Outdoor-unit pad',level:'scope',reason:'Ground-mounted outdoor equipment support; verify OEM/AHJ elevation and anchorage.',code:'OEM / 2024 IRC M1307.1',category:'Pads, stands & mounts',includeTokens:['condenser pad','composite condenser pad','equipment pad']}));
      } else if (i.outdoorMount === 'wall') {
        req.push(requirement({key:'outdoor-bracket',qty:1,units:'ea',label:'Outdoor-unit wall bracket / stand',level:'scope',reason:'Selected wall-mounted support; verify exact equipment compatibility.',code:'OEM / 2024 IRC M1307.1',category:'Pads, stands & mounts',includeTokens:['wall bracket','wall mount']}));
      } else if (i.outdoorMount === 'roof') {
        req.push(requirement({key:'outdoor-roof-support',qty:1,units:'ea',label:'Roof equipment support / rail',level:'scope',reason:'Selected roof-mounted support; verify exact equipment compatibility and roof/load details.',code:'OEM / 2024 IRC M1307.1',category:'Pads, stands & mounts',includeTokens:['roof equipment rail','roof rail','roof stand','equipment rail']}));
      }
    }

    if (installScope && i.thermostat) {
      if (isMiniSplit(i.systemType)) warnings.push('Mini-split control is OEM-specific. Generic thermostat is not auto-resolved.');
      req.push(requirement({key:'thermostat',qty:1,units:'ea',label:isMiniSplit(i.systemType)?'OEM control / thermostat':'Thermostat / control',level:'scope',reason:'Control compatibility depends on exact equipment, stages and communicating/noncommunicating design. Manual SKU selection is required.',code:'OEM / controls',category:'Controls & thermostats',forceUnresolved:true}));
    }

    if (installScope && i.includeElectricalAccessories && (isSplitSystem(i.systemType) || isPackage(i.systemType))) {
      req.push(requirement({key:'disconnect',qty:1,units:'ea',label:'HVAC disconnect',level:'coordination',reason:'Electrical accessory allowance. Final type/rating/fusing follows nameplate, OEM and electrical code.',code:'Electrical scope / equipment nameplate',category:'Electrical accessories (HVAC)',includeTokens:['disconnect']}));
      req.push(requirement({key:'whip',qty:1,units:'ea',label:'Liquid-tight whip / equipment connection',level:'coordination',reason:'Electrical connection allowance. Verify conductor/raceway size and length in electrical scope.',code:'Electrical scope / equipment nameplate',category:'Electrical accessories (HVAC)',includeTokens:['liquid-tight whip','liquid tight whip','whip']}));
    }

    if (isA2L(i.refrigerant)) {
      checks.push({key:'a2l-oem',status:'verify',level:'code',title:'A2L listing / OEM RDS and mitigation requirements',detail:'A2L does not mean a field sensor is always required. Verify the exact listed system/OEM instructions, minimum room/duct conditions and any refrigerant detection / mitigation requirements.',code:'2024 IRC / UL 60335-2-40 / OEM listing'});
      checks.push({key:'a2l-piping-test',status:'verify',level:'code',title:'A2L refrigerant piping testing / installation',detail:'Verify the adopted 2024 IRC A2L piping-testing provisions and the exact OEM installation procedure for the selected refrigerant system.',code:'2024 IRC M1411.7 / OEM'});
      if (i.a2lRdsStatus === 'yes' && i.a2lFieldPartRequired) {
        req.push(requirement({key:'a2l-oem-part',qty:1,units:'ea',label:i.a2lOemPart ? ('OEM A2L mitigation part: ' + i.a2lOemPart) : 'OEM A2L mitigation / RDS field part',level:'conditional',reason:'User confirmed the equipment listing requires a field-installed OEM-specific mitigation/RDS part. Generic sensor substitution is not allowed.',code:'OEM listed system / UL 60335-2-40',category:'A2L install extras',forceUnresolved:true,customPart:i.a2lOemPart}));
      }
    }

    if (installScope && i.jobKind === 'replace' && i.haulAway) req.push(requirement({key:'haul-away',qty:1,units:'ea',label:'Recover / haul-away allowance',level:'scope',reason:'Replacement job with existing equipment removal selected.',code:'EPA/OEM/shop scope',category:'Consumables / misc & freight',includeTokens:['haul-away','haul away','equipment removal','recovery']}));
    if (installScope && i.permitAllowance) req.push(requirement({key:'permit',qty:1,units:'allow',label:'Permit allowance',level:'scope',reason:'Permit allowance selected; final fee/inspection requirements are AHJ-specific.',code:'AHJ',category:'Consumables / misc & freight',includeTokens:['permit allowance','permit fee','permit']}));

    if (installScope && i.ductMode !== 'existing') {
      if (i.ductFt > 0) req.push(requirement({key:'duct',qty:i.ductFt,units:'ft',label:'Duct material allowance',level:'scope',reason:'Entered new/replacement duct takeoff length. V2 does not perform Manual D sizing.',code:'Manual D / OEM / adopted code',category:'Ductwork & distribution',includeTokens:['flex duct','duct'],excludeTokens:['transition','package','tape','mastic','board','wrap']}));
      if (i.supplyRegisters > 0) req.push(requirement({key:'supply-registers',qty:i.supplyRegisters,units:'ea',label:'Supply registers / grilles',level:'scope',reason:'Entered supply outlet count.',code:'Design scope',category:'Ductwork & distribution',includeTokens:['supply register','supply grille','register'],excludeTokens:['return']}));
      if (i.returnGrilles > 0) req.push(requirement({key:'return-grilles',qty:i.returnGrilles,units:'ea',label:'Return grilles',level:'scope',reason:'Entered return grille count.',code:'Design scope',category:'Ductwork & distribution',includeTokens:['return','grille']}));
      req.push(requirement({key:'duct-mastic',qty:1,units:'gal',label:'Duct mastic / sealant allowance',level:'scope',reason:'Allowance only; not an exact consumption calculation.',code:'Adopted energy/mechanical code / field scope',category:'Ductwork & distribution',includeTokens:['mastic']}));
      req.push(requirement({key:'foil-tape',qty:1,units:'roll',label:'HVAC foil tape allowance',level:'scope',reason:'Allowance only; not an exact consumption calculation.',code:'Field scope',category:'Ductwork & distribution',includeTokens:['foil tape']}));
      warnings.push('V2 does not perform Manual D duct sizing or airflow balancing. Duct quantities are takeoff inputs; mastic/tape remain allowances.');
    }

    if (i.systemType === 'split-ac-furnace') warnings.push('AC + furnace result covers the cooling-side scope only. Furnace fuel, venting/flue, combustion air, furnace condensate and furnace-specific electrical/control scope are NOT generated in V2.');
    if (i.jobKind === 'new' && norm(i.refrigerant).replace(/\s+/g,'').indexOf('r-410a') >= 0) warnings.push('R-410A regulatory verification required: it is above the current 700 GWP limit for new residential/light-commercial systems. New-system use generally requires a qualifying Technology Transitions exception (for example eligible pre-2025 inventory). Service of existing R-410A systems is a separate path.');

    return {version:ENGINE_VERSION,inputs:i,requirements:req,checks:checks,warnings:warnings,assumptions:assumptions};
  }

  function categoryMatch(row, req) {
    if (!req.category) return true;
    var rc = norm(row && row.category);
    var q = norm(req.category);
    return rc === q || rc.indexOf(q) >= 0 || q.indexOf(rc) >= 0;
  }
  function hay(row) { return [row&&row.item,row&&row.part,row&&row.vendor,row&&row.category].filter(Boolean).join(' ').toLowerCase(); }
  function extractFt(text) {
    var m = String(text || '').match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')\b/i);
    return m ? Number(m[1]) : 0;
  }
  function manualDuplicate(state, catalogId, item) {
    var rows = (state && state.materialsUsed) || [];
    var ni = norm(item);
    for (var i=0;i<rows.length;i++) {
      var r=rows[i]; if(!r) continue;
      if (r.calcSource === SOURCE_TAG || r.calcSource === 'ac-calculator-v1') continue;
      if (catalogId && String(r.catalogId || r.id || '') === String(catalogId)) return true;
      if (ni && norm(r.item) === ni) return true;
    }
    return false;
  }

  function resolveCatalogItem(catalog, req, systemType) {
    if (req.forceUnresolved) return null;
    catalog = Array.isArray(catalog) ? catalog : [];
    var best=null,bestScore=-1,bestQty=req.qty,bestUnits=req.units,bestMode='direct';
    for (var i=0;i<catalog.length;i++) {
      var row=catalog[i]; if(!row) continue;
      var rowUnit=normUnit(row.units || row.unit || '');
      var reqUnit=normUnit(req.units);
      var h=hay(row);
      var excluded=false;
      for (var x=0;x<req.excludeTokens.length;x++) if (h.indexOf(norm(req.excludeTokens[x])) >= 0) { excluded=true; break; }
      if (excluded) continue;
      if (!categoryMatch(row, req)) continue;

      var qty=req.qty, units=req.units, mode='direct';
      if (rowUnit && reqUnit && rowUnit !== reqUnit) {
        if (req.allowPackagedLength && reqUnit === 'ft' && rowUnit === 'ea') {
          var packFt = extractFt((row.item||'') + ' ' + (row.part||''));
          if (!packFt || packFt < req.requiredLengthFt) continue;
          qty = 1; units = 'ea'; mode = 'packaged-length';
        } else continue;
      }

      var score = 0;
      var tokenHits = 0;
      for (var p=0;p<req.includeTokens.length;p++) {
        var phrase = norm(req.includeTokens[p]);
        if (phrase && h.indexOf(phrase) >= 0) { tokenHits++; score += 30 + phrase.length; }
      }
      if (req.preferredIds.indexOf(String(row.id)) >= 0) score += 200;
      if (norm(row.category) === norm(req.category)) score += 40;
      if (rowUnit === reqUnit) score += 30;
      if (mode === 'packaged-length') score += 25;
      if (!tokenHits && req.includeTokens.length) continue;
      if (score > bestScore) { bestScore=score; best=row; bestQty=qty; bestUnits=units; bestMode=mode; }
    }
    if (!best || bestScore < 60) return null;
    return {row:best,score:bestScore,qty:bestQty,units:bestUnits,mode:bestMode};
  }

  function buildResolvedBom(state, scope) {
    state=state||{}; scope=scope||buildScope({});
    var catalog=Array.isArray(state.catalog)?state.catalog:[],out=[];
    for (var i=0;i<scope.requirements.length;i++) {
      var r=scope.requirements[i], hit=resolveCatalogItem(catalog,r,scope.inputs.systemType), row=hit&&hit.row;
      var selected = r.selected !== false;
      var dup = manualDuplicate(state, row && row.id != null ? String(row.id) : '', row ? row.item : r.label);
      if (dup) selected = false;
      out.push({
        key:r.key,selected:selected,qty:hit?hit.qty:r.qty,units:hit?hit.units:r.units,label:r.label,level:r.level,
        reason:r.reason,code:r.code,resolved:!!row,score:hit?hit.score:0,matchMode:hit?hit.mode:'',
        catalogId:row&&row.id!=null?String(row.id):'',item:row?(row.item||r.label):r.label,part:row?(row.part||r.customPart||''):(r.customPart||''),
        vendor:row?(row.vendor||''):'',unitCost:row?num(row.unitCost):0,category:row?(row.category||r.category):(r.category||'AC Calculator'),
        requiredLengthFt:r.requiredLengthFt||0,manualDuplicate:dup,
        note:dup?'Matching manual Job Material already exists — generated row is unchecked by default':(row?'Matched catalog item':'Unresolved — requires review/price before Apply')
      });
    }
    return out;
  }

  function applyBomToJob(state, scope, bom) {
    if(!state||typeof state!=='object')state={};
    if(!Array.isArray(state.materialsUsed))state.materialsUsed=[];
    bom=Array.isArray(bom)?bom:buildResolvedBom(state,scope);
    var keep=[];
    for(var i=0;i<state.materialsUsed.length;i++) {
      var old=state.materialsUsed[i];
      if(!old || (old.calcSource!==SOURCE_TAG && old.calcSource!=='ac-calculator-v1')) keep.push(old);
    }
    var added=[];
    for(var j=0;j<bom.length;j++) {
      var b=bom[j]; if(!b||b.selected===false||num(b.qty)<=0)continue;
      var line={
        id:uid('acm'), catalogId:b.catalogId||'', qty:num(b.qty), item:b.item||b.label, part:b.part||'', vendor:b.vendor||'', units:b.units||'ea',
        unitCost:num(b.unitCost), crew:1, prod:0, prodUnit:'Day', category:b.category||'AC Calculator', lastPriceUpdate:todayISO(),
        calcSource:SOURCE_TAG, calcVersion:SOURCE_VERSION, calcKey:b.key, calcLevel:b.level, calcCode:b.code||'', calcReason:b.reason||'',
        calcPriceSource:b.catalogId?'catalog':'manual-review', requiredLengthFt:num(b.requiredLengthFt,0)
      };
      keep.push(line); added.push(line);
    }
    state.materialsUsed=keep;
    state.acCalculator={version:scope.version||ENGINE_VERSION,source:SOURCE_TAG,inputs:scope.inputs,generatedAt:new Date().toISOString(),selectedKeys:added.map(function(x){return x.calcKey;})};
    return {state:state,added:added};
  }
  function totalBomCost(bom){var sum=0;for(var i=0;i<(bom||[]).length;i++){var b=bom[i];if(b&&b.selected!==false)sum+=num(b.qty)*num(b.unitCost);}return sum;}
  function blockingRows(bom){return (bom||[]).filter(function(b){return b&&b.selected!==false&&(!b.resolved||num(b.unitCost)<=0);});}

  return {
    ENGINE_VERSION:ENGINE_VERSION,SOURCE_TAG:SOURCE_TAG,SOURCE_VERSION:SOURCE_VERSION,
    defaultInputs:defaultInputs,normalizeInputs:normalizeInputs,buildScope:buildScope,
    resolveCatalogItem:resolveCatalogItem,buildResolvedBom:buildResolvedBom,applyBomToJob:applyBomToJob,
    totalBomCost:totalBomCost,blockingRows:blockingRows,normUnit:normUnit
  };
});
