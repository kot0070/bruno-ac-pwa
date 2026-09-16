(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoProjectHistory=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
var VERSION=1,MAX_ITEMS=100,TOTAL_KEYS=['customerMaterials','yourCost','marginDollar','marginPct'];
function clone(x){return JSON.parse(JSON.stringify(x));}
function id(){return 'calc-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function num(v){var n=Number(v);return Number.isFinite(n)?n:null;}
function validPlan(p){return !!(p&&typeof p==='object'&&!Array.isArray(p)&&Number(p.schemaVersion)>=2&&(p.projectType==='residential'||p.projectType==='commercial')&&Array.isArray(p.rooms)&&Array.isArray(p.quantities));}
function validTotals(t){
 if(!t||typeof t!=='object'||Array.isArray(t))return {ok:false,error:'missing_totals'};
 for(var i=0;i<TOTAL_KEYS.length;i++){
  var k=TOTAL_KEYS[i];
  if(!Object.prototype.hasOwnProperty.call(t,k))return {ok:false,error:'missing_total_'+k};
  if(t[k]!==null&&(typeof t[k]!=='number'||!Number.isFinite(t[k])))return {ok:false,error:'invalid_total_'+k};
 }
 return {ok:true};
}
function validateSnapshot(s){
 if(!s||typeof s!=='object'||Array.isArray(s))return {ok:false,error:'snapshot_not_object'};
 if(Number(s.schemaVersion)!==VERSION)return {ok:false,error:'unsupported_snapshot_version'};
 if(!String(s.id||'').trim())return {ok:false,error:'missing_snapshot_id'};
 if(!String(s.createdAt||'').trim())return {ok:false,error:'missing_created_at'};
 if(!validPlan(s.projectPlan))return {ok:false,error:'invalid_project_plan'};
 var tv=validTotals(s.totals);if(!tv.ok)return tv;
 if(!Array.isArray(s.bom))return {ok:false,error:'invalid_bom'};
 return {ok:true};
}
function normalizeStore(raw){
 var out={schemaVersion:1,activeId:null,items:[]};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 if(Array.isArray(raw.items))raw.items.forEach(function(s){var v=validateSnapshot(s);if(v.ok)out.items.push(clone(s));});
 if(raw.activeId&&out.items.some(function(x){return x.id===raw.activeId;}))out.activeId=raw.activeId;
 return out;
}
function add(store,snapshot){var st=normalizeStore(store),s=clone(snapshot);if(!s.id)s.id=id();if(!s.createdAt)s.createdAt=new Date().toISOString();s.schemaVersion=VERSION;var v=validateSnapshot(s);if(!v.ok)return {ok:false,error:v.error,store:st};if(st.items.some(function(x){return x.id===s.id;}))return {ok:false,error:'snapshot_id_collision',store:st};st.items.unshift(s);if(st.items.length>MAX_ITEMS)st.items.length=MAX_ITEMS;st.activeId=s.id;return {ok:true,store:st,snapshot:s};}
function activate(store,snapshotId){var st=normalizeStore(store);if(!st.items.some(function(x){return x.id===snapshotId;}))return {ok:false,error:'snapshot_not_found',store:st};st.activeId=snapshotId;return {ok:true,store:st};}
function remove(store,snapshotId){var st=normalizeStore(store);st.items=st.items.filter(function(x){return x.id!==snapshotId;});if(st.activeId===snapshotId)st.activeId=st.items.length?st.items[0].id:null;return st;}
function duplicatePlan(snapshot){var v=validateSnapshot(snapshot);if(!v.ok)return {ok:false,error:v.error};var p=clone(snapshot.projectPlan);p.extras=(p.extras||[]).map(function(x){var y=clone(x);delete y.customerUnitPrice;delete y.yourUnitCost;return y;});p.duplicatedFromSnapshotId=snapshot.id;p.duplicatedAt=new Date().toISOString();return {ok:true,plan:p};}
function exportOne(snapshot){var v=validateSnapshot(snapshot);if(!v.ok)return {ok:false,error:v.error};return {ok:true,payload:{product:'bruno-ac',type:'project-calculation-snapshot',version:1,snapshot:clone(snapshot)}};}
function exportAll(store){var st=normalizeStore(store);return {product:'bruno-ac',type:'project-calculation-history',version:1,history:st};}
function uniqueImportId(used){var next='',tries=0;do{next=id();tries++;if(tries>1000)return null;}while(used[next]);used[next]=true;return next;}
function importPayload(payload,store){
 var st=normalizeStore(store),incoming=[];
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return {ok:false,error:'invalid_payload',store:st};
 if(payload.product!=='bruno-ac'||payload.version!==1)return {ok:false,error:'unsupported_payload',store:st};
 if(payload.type==='project-calculation-snapshot')incoming=[payload.snapshot];
 else if(payload.type==='project-calculation-history'&&payload.history&&typeof payload.history==='object'&&!Array.isArray(payload.history)&&payload.history.schemaVersion===1&&Array.isArray(payload.history.items))incoming=payload.history.items;
 else return {ok:false,error:'unsupported_payload_type',store:st};
 if(!incoming.length)return {ok:false,error:'no_snapshots',store:st};
 // Atomic preflight: every source snapshot must validate before any imported copy is staged.
 for(var i=0;i<incoming.length;i++){
  var src=incoming[i],v=validateSnapshot(src);
  if(!v.ok)return {ok:false,error:'invalid_snapshot_'+i+':'+v.error,added:0,rejected:1,store:st};
 }
 var used={};st.items.forEach(function(x){used[String(x.id)]=true;});
 var staged=[];
 for(var j=0;j<incoming.length;j++){
  var original=incoming[j],s=clone(original),newId=uniqueImportId(used);
  if(!newId)return {ok:false,error:'could_not_allocate_unique_id',added:0,rejected:incoming.length,store:st};
  s.id=newId;s.importedAt=new Date().toISOString();s.importedFromId=String(original.id||'');s.schemaVersion=VERSION;
  var sv=validateSnapshot(s);if(!sv.ok)return {ok:false,error:'staged_snapshot_'+j+':'+sv.error,added:0,rejected:incoming.length,store:st};
  staged.push(s);
 }
 // Commit only after the entire batch has validated and received collision-free IDs.
 var next=normalizeStore(st);for(var k=staged.length-1;k>=0;k--)next.items.unshift(staged[k]);if(next.items.length>MAX_ITEMS)next.items.length=MAX_ITEMS;if(staged.length&&!next.activeId)next.activeId=staged[0].id;
 return {ok:true,added:staged.length,rejected:0,store:next,snapshots:staged};
}
function total(v){return v==null?null:num(v);}
return {VERSION:VERSION,validateSnapshot:validateSnapshot,normalizeStore:normalizeStore,add:add,activate:activate,remove:remove,duplicatePlan:duplicatePlan,exportOne:exportOne,exportAll:exportAll,importPayload:importPayload,total:total};
});