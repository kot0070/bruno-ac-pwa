(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoCatalogPricing=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
var INVALID='INVALID_FINANCIAL';
var SAFE_DEFAULTS={
 'line-set-ft':'ac-ls-17',
 'indoor-support':'ac-pd-06',
 'filter-drier':'ac-ls-16',
 'supply-outlets':'ac-du-14',
 'return-grilles':'ac-du-16',
 'duct-route':'ac-du-13',
 'equipment-support':'ac-pd-05'
};
function text(v){return String(v==null?'':v).trim()}
function nonneg(v){if(v===null||v===undefined||v==='')return null;var n=Number(v);return Number.isFinite(n)&&n>=0?n:INVALID}
function index(catalog){var byId={};(Array.isArray(catalog)?catalog:[]).forEach(function(r){if(r&&r.id!=null)byId[String(r.id)]=r});return byId}
function resolveCatalogId(row,idx,bindings){var exact=text(row&&row.catalog_id);if(exact&&idx[exact])return {id:exact,source:'row'};var bound=text(bindings&&bindings[row.key]);if(bound&&idx[bound])return {id:bound,source:'binding'};var mapped=SAFE_DEFAULTS[row.key];if(mapped&&idx[mapped])return {id:mapped,source:'safe-default'};var tagged=[];Object.keys(idx).forEach(function(id){var r=idx[id],keys=Array.isArray(r.bomKeys)?r.bomKeys:[];if(keys.indexOf(row.key)>=0)tagged.push(id)});if(tagged.length===1)return {id:tagged[0],source:'catalog-tag'};if(tagged.length>1)return {id:null,source:'multiple',candidates:tagged};return {id:null,source:'unresolved',candidates:[]}}
function priceRow(row,catalogRow){var qty=nonneg(row&&row.final_qty);if(qty===INVALID)return {ok:false,error:'invalid_quantity'};var customer=nonneg(catalogRow&&catalogRow.unitCost);if(customer===INVALID||customer===null)return {ok:false,error:'invalid_or_missing_customer_price'};var rawYour=catalogRow?catalogRow.yourCost:null,blankYour=rawYour===null||rawYour===undefined||rawYour==='';var your=blankYour?customer:nonneg(rawYour);if(your===INVALID)return {ok:false,error:'invalid_your_cost'};var ce=qty*customer,ye=qty*your;return {ok:true,qty:qty,customerUnitPrice:customer,yourUnitCost:your,yourCostSource:blankYour?'customer-price-fallback':'catalog-your-cost',customerExtended:ce,yourExtended:ye,marginDollar:ce-ye,marginPct:ce>0?(ce-ye)/ce:null}}
function resolve(rows,catalog,bindings){var idx=index(catalog),out={status:'ready',rows:[],totals:{customerMaterials:0,yourCost:0,marginDollar:0,marginPct:null},resolved:0,total:0,blockers:[],unresolved:[],multiple:[]};(Array.isArray(rows)?rows:[]).forEach(function(src){var row=Object.assign({},src),m=resolveCatalogId(row,idx,bindings||{});out.total++;row.catalog_resolution_source=m.source;if(m.id){row.catalog_id=m.id;row.catalog_match_state='resolved';row.catalog=idx[m.id];var p=priceRow(row,row.catalog);row.pricing=p;if(!p.ok){row.catalog_match_state='invalid-financial';out.blockers.push(row.key+':'+p.error)}else{out.resolved++;out.totals.customerMaterials+=p.customerExtended;out.totals.yourCost+=p.yourExtended}}else if(m.source==='multiple'){row.catalog_match_state='multiple_matches';row.catalog_candidates=m.candidates.slice();out.multiple.push(row.key)}else{row.catalog_match_state='unresolved';out.unresolved.push(row.key)}out.rows.push(row)});out.totals.marginDollar=out.totals.customerMaterials-out.totals.yourCost;out.totals.marginPct=out.totals.customerMaterials>0?out.totals.marginDollar/out.totals.customerMaterials:null;if(out.blockers.length)out.status='blocked';else if(out.unresolved.length||out.multiple.length)out.status='provisional';return out}
return {INVALID_FINANCIAL:INVALID,SAFE_DEFAULTS:SAFE_DEFAULTS,resolveCatalogId:resolveCatalogId,priceRow:priceRow,resolve:resolve};
});
