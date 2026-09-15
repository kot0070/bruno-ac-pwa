(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.BrunoCodeRuleRegistry=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';

  var CALCULATOR_RULE_MAP={
    'sqft-sizing':['IRC-M1401.3-EQUIPMENT-SIZING'],
    'line-set':['IRC-M1307.1-OEM-INSTALLATION'],
    'filter-drier':['IRC-M1307.1-OEM-INSTALLATION'],
    'package-support':['IRC-M1307.1-OEM-INSTALLATION','LOCAL-AHJ-VERIFY'],
    'outdoor-pad':['IRC-M1307.1-OEM-INSTALLATION','LOCAL-AHJ-VERIFY'],
    'outdoor-bracket':['IRC-M1307.1-OEM-INSTALLATION','LOCAL-AHJ-VERIFY'],
    'outdoor-roof-support':['IRC-M1307.1-OEM-INSTALLATION','LOCAL-AHJ-VERIFY'],
    'thermostat':['IRC-M1307.1-OEM-INSTALLATION'],
    'condensate-drain':['IRC-M1411.9-CONDENSATE'],
    'condensate-size-slope':['IRC-M1411.9-CONDENSATE','LOCAL-AHJ-VERIFY'],
    'overflow-protection':['IRC-M1411.9.1-OVERFLOW','LOCAL-AHJ-VERIFY'],
    'aux-pan':['IRC-M1411.9.1-OVERFLOW','LOCAL-AHJ-VERIFY'],
    'secondary-drain':['IRC-M1411.9.1-OVERFLOW','LOCAL-AHJ-VERIFY'],
    'float-switch':['IRC-M1411.9.1-OVERFLOW','LOCAL-AHJ-VERIFY'],
    'condensate-pump':['IRC-M1411.10-CONDENSATE-PUMP'],
    'pump-interlock':['IRC-M1411.10-CONDENSATE-PUMP'],
    'disconnect':['NEC-2026-TX-ADOPTION','LOCAL-AHJ-VERIFY'],
    'whip':['NEC-2026-TX-ADOPTION','LOCAL-AHJ-VERIFY'],
    'attic-light-receptacle':['NEC-2026-TX-ADOPTION','LOCAL-AHJ-VERIFY'],
    'permit':['LOCAL-AHJ-VERIFY']
  };

  function text(v){return String(v==null?'':v).trim()}
  function lower(v){return text(v).toLowerCase()}
  function arr(v){return Array.isArray(v)?v:[]}

  function validateLibrary(lib){
    var errors=[];
    if(!lib||typeof lib!=='object'||Array.isArray(lib))return {ok:false,errors:['library_not_object']};
    if(lib.schemaVersion!==1)errors.push('unsupported_schema_version');
    if(!text(lib.libraryId))errors.push('missing_library_id');
    if(!lib.jurisdiction||!text(lib.jurisdiction.state))errors.push('missing_jurisdiction_state');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(text(lib.lastVerified)))errors.push('invalid_last_verified');
    if(!Array.isArray(lib.adoptedCodes)||!lib.adoptedCodes.length)errors.push('missing_adopted_codes');
    if(!Array.isArray(lib.rules)||!lib.rules.length)errors.push('missing_rules');

    var codeIds={};
    arr(lib.adoptedCodes).forEach(function(c,i){
      var id=text(c&&c.id);
      if(!id)errors.push('adopted_code_'+i+'_missing_id');
      else if(codeIds[id])errors.push('duplicate_adopted_code_'+id);
      else codeIds[id]=true;
      if(!text(c&&c.title))errors.push('adopted_code_'+i+'_missing_title');
      if(!/^https:\/\//.test(text(c&&c.sourceUrl)))errors.push('adopted_code_'+i+'_invalid_source_url');
    });

    var ruleIds={};
    arr(lib.rules).forEach(function(r,i){
      var id=text(r&&r.id);
      if(!id)errors.push('rule_'+i+'_missing_id');
      else if(ruleIds[id])errors.push('duplicate_rule_'+id);
      else ruleIds[id]=true;
      if(!text(r&&r.family))errors.push('rule_'+i+'_missing_family');
      if(!text(r&&r.section))errors.push('rule_'+i+'_missing_section');
      if(!text(r&&r.title))errors.push('rule_'+i+'_missing_title');
      if(!text(r&&r.summary))errors.push('rule_'+i+'_missing_summary');
      if(!/^https:\/\//.test(text(r&&r.sourceUrl)))errors.push('rule_'+i+'_invalid_source_url');
      if(!Array.isArray(r&&r.calculatorTags))errors.push('rule_'+i+'_missing_calculator_tags');
    });
    return {ok:errors.length===0,errors:errors};
  }

  function indexLibrary(lib){
    var rulesById={},codesById={},rulesByFamily={};
    arr(lib&&lib.adoptedCodes).forEach(function(c){if(c&&c.id)codesById[c.id]=c});
    arr(lib&&lib.rules).forEach(function(r){
      if(!r||!r.id)return;
      rulesById[r.id]=r;
      var fam=text(r.family);
      if(!rulesByFamily[fam])rulesByFamily[fam]=[];
      rulesByFamily[fam].push(r);
    });
    return {rulesById:rulesById,codesById:codesById,rulesByFamily:rulesByFamily};
  }

  function findRule(lib,id){return indexLibrary(lib).rulesById[text(id)]||null}

  function searchRules(lib,query,filters){
    filters=filters||{};
    var q=lower(query),family=text(filters.family),status=text(filters.verificationStatus);
    return arr(lib&&lib.rules).filter(function(r){
      if(family&&text(r.family)!==family)return false;
      if(status&&text(r.verificationStatus)!==status)return false;
      if(!q)return true;
      var hay=[r.id,r.family,r.edition,r.section,r.title,r.summary,r.sourceAuthority].concat(arr(r.calculatorTags)).join(' ').toLowerCase();
      return hay.indexOf(q)>=0;
    });
  }

  function normalizeRuleIds(ids){
    var seen={},out=[];
    arr(ids).forEach(function(id){id=text(id);if(id&&!seen[id]){seen[id]=true;out.push(id)}});
    return out;
  }

  function resolveRuleIds(lib,ids){
    var idx=indexLibrary(lib),resolved=[],missing=[];
    normalizeRuleIds(ids).forEach(function(id){
      if(idx.rulesById[id])resolved.push(idx.rulesById[id]);else missing.push(id);
    });
    return {resolved:resolved,missing:missing};
  }

  function calculatorRuleIds(key){return normalizeRuleIds(CALCULATOR_RULE_MAP[text(key)]||[])}

  function validateCalculatorMap(lib){
    var missing=[];
    Object.keys(CALCULATOR_RULE_MAP).forEach(function(key){
      var result=resolveRuleIds(lib,CALCULATOR_RULE_MAP[key]);
      if(result.missing.length)missing.push({key:key,ids:result.missing});
    });
    return {ok:missing.length===0,mappedKeys:Object.keys(CALCULATOR_RULE_MAP).length,missing:missing};
  }

  function coverage(lib,entities){
    var total=0,linked=0,missing=[];
    arr(entities).forEach(function(e){
      total++;
      var ids=normalizeRuleIds((e&&e.ruleIds)||calculatorRuleIds(e&&e.key));
      if(ids.length)linked++;
      var res=resolveRuleIds(lib,ids);
      if(res.missing.length)missing.push({key:text(e&&e.key),ids:res.missing});
    });
    return {total:total,linked:linked,unlinked:total-linked,missing:missing};
  }

  return {
    CALCULATOR_RULE_MAP:CALCULATOR_RULE_MAP,
    validateLibrary:validateLibrary,
    indexLibrary:indexLibrary,
    findRule:findRule,
    searchRules:searchRules,
    normalizeRuleIds:normalizeRuleIds,
    resolveRuleIds:resolveRuleIds,
    calculatorRuleIds:calculatorRuleIds,
    validateCalculatorMap:validateCalculatorMap,
    coverage:coverage
  };
});
