from pathlib import Path

ROOT = Path('.')

def replace_once(path, old, new):
    p = ROOT / path
    s = p.read_text()
    if old not in s:
        raise SystemExit(f'expected block not found in {path}: {old[:120]!r}')
    s2 = s.replace(old, new, 1)
    p.write_text(s2)

replace_once('ac-calculator-engine.js', "  var ENGINE_VERSION = '2.0.0';\n  var SOURCE_TAG = 'ac-calculator';\n  var SOURCE_VERSION = 2;",
"  var ENGINE_VERSION = '2.1.0';\n  var SOURCE_TAG = 'ac-calculator';\n  var SOURCE_VERSION = 3;\n  var INVALID_FINANCIAL = 'INVALID_FINANCIAL';")

replace_once('ac-calculator-engine.js', "  function bool(v, fallback) {",
"  function isBlankFinancial(v) {\n    return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');\n  }\n  function strictFinancial(v) {\n    if (v === INVALID_FINANCIAL) return INVALID_FINANCIAL;\n    if (isBlankFinancial(v)) return null;\n    var n = Number(v);\n    return Number.isFinite(n) && n >= 0 ? n : INVALID_FINANCIAL;\n  }\n  function validFinancial(v) { return typeof v === 'number' && Number.isFinite(v) && v >= 0; }\n  function catalogPricing(row) {\n    row = row || {};\n    var customer = strictFinancial(row.unitCost);\n    if (customer === null) customer = INVALID_FINANCIAL;\n    var customerSource = customer === INVALID_FINANCIAL ? 'invalid' : 'catalog-customer-price';\n    var yourRaw = row.yourCost;\n    var your, yourSource;\n    if (isBlankFinancial(yourRaw)) {\n      your = validFinancial(customer) ? customer : INVALID_FINANCIAL;\n      yourSource = 'customer-price-fallback';\n    } else {\n      your = strictFinancial(yourRaw);\n      if (your === null) your = INVALID_FINANCIAL;\n      yourSource = your === INVALID_FINANCIAL ? 'invalid' : 'catalog-your-cost';\n    }\n    return { customerUnitPrice:customer, yourUnitCost:your, customerPriceSource:customerSource, yourCostSource:yourSource };\n  }\n  function bool(v, fallback) {")

replace_once('ac-calculator-engine.js',
"    if (!best || bestScore < 60) return null;\n    return {row:best,score:bestScore,qty:bestQty,units:bestUnits,mode:bestMode};",
"    if (!best || bestScore < 60) return null;\n    var pricing = catalogPricing(best);\n    return {\n      row:best,score:bestScore,qty:bestQty,units:bestUnits,mode:bestMode,\n      customerUnitPrice:pricing.customerUnitPrice,yourUnitCost:pricing.yourUnitCost,\n      customerPriceSource:pricing.customerPriceSource,yourCostSource:pricing.yourCostSource\n    };")

old_tail = """  function buildResolvedBom(state, scope) {
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
"""

new_tail = """  function buildResolvedBom(state, scope) {
    state=state||{}; scope=scope||buildScope({});
    var catalog=Array.isArray(state.catalog)?state.catalog:[],out=[];
    for (var i=0;i<scope.requirements.length;i++) {
      var r=scope.requirements[i], hit=resolveCatalogItem(catalog,r,scope.inputs.systemType), row=hit&&hit.row;
      var selected = r.selected !== false;
      var dup = manualDuplicate(state, row && row.id != null ? String(row.id) : '', row ? row.item : r.label);
      if (dup) selected = false;
      var qty = hit ? hit.qty : r.qty;
      var customer = hit ? hit.customerUnitPrice : null;
      var your = hit ? hit.yourUnitCost : null;
      var customerExt = validFinancial(customer) ? qty * customer : null;
      var yourExt = validFinancial(your) ? qty * your : null;
      var margin = customerExt !== null && yourExt !== null ? customerExt - yourExt : null;
      var marginPct = margin !== null ? (customerExt > 0 ? margin / customerExt : 0) : null;
      var financialInvalid = !!row && (!validFinancial(customer) || !validFinancial(your));
      var zeroReview = !!row && !financialInvalid && (customer === 0 || your === 0);
      out.push({
        key:r.key,selected:selected,qty:qty,units:hit?hit.units:r.units,label:r.label,level:r.level,
        reason:r.reason,code:r.code,resolved:!!row,score:hit?hit.score:0,matchMode:hit?hit.mode:'',
        catalogId:row&&row.id!=null?String(row.id):'',item:row?(row.item||r.label):r.label,part:row?(row.part||r.customPart||''):(r.customPart||''),
        vendor:row?(row.vendor||''):'',unitCost:customer,customerUnitPrice:customer,yourUnitCost:your,
        customerExtension:customerExt,yourExtension:yourExt,materialMargin:margin,materialMarginPct:marginPct,
        customerPriceSource:hit?hit.customerPriceSource:'unresolved',yourCostSource:hit?hit.yourCostSource:'unresolved',
        financialInvalid:financialInvalid,zeroPriceReview:zeroReview,
        pricingState:!row?'unresolved':(financialInvalid?'invalid':(zeroReview?'zero-review':'valid')),
        category:row?(row.category||r.category):(r.category||'AC Calculator'),requiredLengthFt:r.requiredLengthFt||0,manualDuplicate:dup,
        note:dup?'Matching manual Job Material already exists — generated row is unchecked by default':(!row?'Unresolved — requires review before Apply':(financialInvalid?'Catalog financial value is invalid — correct it before Apply':(zeroReview?'Valid $0 price — review before Apply':'Matched catalog item')))
      });
    }
    return out;
  }

  function calculateBomPricing(bom) {
    bom=Array.isArray(bom)?bom:[];
    var customerTotal=0,yourTotal=0,errors=[];
    for(var i=0;i<bom.length;i++) {
      var b=bom[i]; if(!b||b.selected===false)continue;
      if(!b.resolved){errors.push('Row '+(i+1)+' is unresolved.');continue;}
      var qty=strictFinancial(b.qty);
      if(!validFinancial(qty)){errors.push('Row '+(i+1)+' quantity is invalid.');continue;}
      if(!validFinancial(b.customerUnitPrice)){errors.push('Row '+(i+1)+' Customer Price is invalid.');continue;}
      if(!validFinancial(b.yourUnitCost)){errors.push('Row '+(i+1)+' Your Cost is invalid.');continue;}
      customerTotal += qty * b.customerUnitPrice;
      yourTotal += qty * b.yourUnitCost;
    }
    var ok=errors.length===0;
    var margin=ok?customerTotal-yourTotal:null;
    return {ok:ok,customerTotal:ok?customerTotal:null,yourTotal:ok?yourTotal:null,marginDollar:margin,marginPct:ok?(customerTotal>0?margin/customerTotal:0):null,errors:errors};
  }

  function hardBlockingRows(bom){
    return (bom||[]).filter(function(b){return b&&b.selected!==false&&(!b.resolved||b.financialInvalid||!validFinancial(b.customerUnitPrice)||!validFinancial(b.yourUnitCost));});
  }
  function blockingRows(bom){
    return (bom||[]).filter(function(b){return b&&b.selected!==false&&(!b.resolved||b.financialInvalid||b.zeroPriceReview||!validFinancial(b.customerUnitPrice)||!validFinancial(b.yourUnitCost));});
  }

  function applyBomToJob(state, scope, bom) {
    if(!state||typeof state!=='object')state={};
    if(!Array.isArray(state.materialsUsed))state.materialsUsed=[];
    bom=Array.isArray(bom)?bom:buildResolvedBom(state,scope);
    var hard=hardBlockingRows(bom);
    if(hard.length)return {ok:false,state:state,added:[],errors:hard.map(function(b){return (b.label||b.key||'Material')+' requires valid Customer Price and Your Cost before Apply.';})};
    var keep=[];
    for(var i=0;i<state.materialsUsed.length;i++) {
      var old=state.materialsUsed[i];
      if(!old || (old.calcSource!==SOURCE_TAG && old.calcSource!=='ac-calculator-v1')) keep.push(old);
    }
    var added=[];
    for(var j=0;j<bom.length;j++) {
      var b=bom[j]; if(!b||b.selected===false)continue;
      var qty=strictFinancial(b.qty); if(!validFinancial(qty)||qty<=0)continue;
      var line={
        id:uid('acm'),catalogId:b.catalogId||'',qty:qty,item:b.item||b.label,part:b.part||'',vendor:b.vendor||'',units:b.units||'ea',
        unitCost:b.customerUnitPrice,procurementCostSnapshot:b.yourUnitCost,
        procurementCostSource:b.yourCostSource==='customer-price-fallback'?'customer-price-fallback':'catalog-your-cost',
        crew:1,prod:0,prodUnit:'Day',category:b.category||'AC Calculator',lastPriceUpdate:todayISO(),
        calcSource:SOURCE_TAG,calcVersion:SOURCE_VERSION,calcKey:b.key,calcLevel:b.level,calcCode:b.code||'',calcReason:b.reason||'',
        calcPriceSource:'catalog-customer-price',calcCustomerPriceSource:b.customerPriceSource,calcYourCostSource:b.yourCostSource,requiredLengthFt:num(b.requiredLengthFt,0)
      };
      keep.push(line); added.push(line);
    }
    state.materialsUsed=keep;
    state.acCalculator={version:scope.version||ENGINE_VERSION,source:SOURCE_TAG,inputs:scope.inputs,generatedAt:new Date().toISOString(),selectedKeys:added.map(function(x){return x.calcKey;})};
    return {ok:true,state:state,added:added,errors:[]};
  }
  function totalBomCustomerCost(bom){var r=calculateBomPricing(bom);return r.ok?r.customerTotal:null;}
  function totalBomYourCost(bom){var r=calculateBomPricing(bom);return r.ok?r.yourTotal:null;}
  function totalBomMargin(bom){var r=calculateBomPricing(bom);return r.ok?r.marginDollar:null;}
  function totalBomCost(bom){return totalBomCustomerCost(bom);}

  return {
    ENGINE_VERSION:ENGINE_VERSION,SOURCE_TAG:SOURCE_TAG,SOURCE_VERSION:SOURCE_VERSION,INVALID_FINANCIAL:INVALID_FINANCIAL,
    defaultInputs:defaultInputs,normalizeInputs:normalizeInputs,buildScope:buildScope,
    resolveCatalogItem:resolveCatalogItem,buildResolvedBom:buildResolvedBom,applyBomToJob:applyBomToJob,
    calculateBomPricing:calculateBomPricing,totalBomCustomerCost:totalBomCustomerCost,totalBomYourCost:totalBomYourCost,totalBomMargin:totalBomMargin,
    totalBomCost:totalBomCost,blockingRows:blockingRows,hardBlockingRows:hardBlockingRows,normUnit:normUnit
  };
"""
replace_once('ac-calculator-engine.js', old_tail, new_tail)
