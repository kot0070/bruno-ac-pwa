(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports){module.exports=api;return}if(root){root.BrunoServiceJournalStorageGuard=api;api.install(root)}})(typeof self!=='undefined'?self:this,function(){
'use strict';
var KEY='bruno-ac-service-journal-v2';
function present(v){return v!==null&&v!==undefined&&v!==''}
function finiteRange(v,min,max){if(!present(v))return true;var n=Number(v);return Number.isFinite(n)&&n>=min&&(max==null||n<=max)}
function validateParsed(j){
  if(!j||typeof j!=='object'||Array.isArray(j))return {ok:false,error:'journal_not_object'};
  var s=j.settings&&typeof j.settings==='object'&&!Array.isArray(j.settings)?j.settings:{};
  var pctFields=['ownerReservePct','employeeSocialSecurityPct','employeeMedicarePct','employeeFederalWithholdingPct','employerSocialSecurityPct','employerMedicarePct','twcPct','futaPct'];
  for(var i=0;i<pctFields.length;i++)if(!finiteRange(s[pctFields[i]],0,100))return {ok:false,error:'invalid_percentage:'+pctFields[i]};
  var baseFields=['socialSecurityWageBase','additionalMedicareThreshold','twcWageBase','futaWageBase'];
  for(i=0;i<baseFields.length;i++)if(!finiteRange(s[baseFields[i]],0,null))return {ok:false,error:'invalid_wage_base:'+baseFields[i]};
  var calls=Array.isArray(j.calls)?j.calls:[];
  for(i=0;i<calls.length;i++){var c=calls[i]||{};if(!finiteRange(c.hours,0,null))return {ok:false,error:'invalid_call_hours:'+i};var gross=present(c.gross)?c.gross:c.grossPay;if(!finiteRange(gross,0,null))return {ok:false,error:'invalid_call_gross:'+i};}
  var crew=Array.isArray(j.crew)?j.crew:[];
  for(i=0;i<crew.length;i++){var w=crew[i]||{};if(!finiteRange(w.rate,0,null))return {ok:false,error:'invalid_crew_rate:'+i};if(!finiteRange(w.hours,0,null))return {ok:false,error:'invalid_crew_hours:'+i};}
  return {ok:true,error:''};
}
function validateRaw(raw){if(raw===null||raw===undefined||raw==='')return {ok:true,missing:true,error:''};var j;try{j=JSON.parse(String(raw))}catch(e){return {ok:false,missing:false,error:'invalid_json'}};var v=validateParsed(j);v.missing=false;return v}
function install(root){var out={installed:false,invalid:false,error:'',restore:function(){}};if(!root||!root.localStorage||!root.Storage||!root.Storage.prototype)return out;var storage=root.localStorage,proto=root.Storage.prototype,raw;try{raw=storage.getItem(KEY)}catch(e){return out}var v=validateRaw(raw);if(v.ok)return out;var original=proto.getItem;if(typeof original!=='function')return out;out.installed=true;out.invalid=true;out.error=v.error;var wrapped=function(k){if(this===storage&&String(k)===KEY)throw new Error('BRUNO_JOURNAL_STORAGE_LOCKED:'+v.error);return original.call(this,k)};proto.getItem=wrapped;out.restore=function(){if(proto.getItem===wrapped)proto.getItem=original};return out}
return {KEY:KEY,finiteRange:finiteRange,validateParsed:validateParsed,validateRaw:validateRaw,install:install};
});
