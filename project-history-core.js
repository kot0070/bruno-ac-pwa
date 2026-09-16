(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.BrunoProjectHistory=api;})(typeof self!=='undefined'?self:this,function(){
'use strict';
var VERSION=1;
function clone(x){return JSON.parse(JSON.stringify(x));}
function id(){return 'calc-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function num(v){var n=Number(v);return Number.isFinite(n)?n:null;}
function validPlan(p){return !!(p&&typeof p==='object'&&!Array.isArray(p)&&Number(p.schemaVersion)>=2&&(p.projectType==='residential'||p.projectType==='commercial')&&Array.isArray(p.rooms)&&Array.isArray(p.quantities));}
function validateSnapshot(s){
 if(!s||typeof s!=='object'||Array.isArray(s))return {ok:false,error:'snapshot_not_object'};
 if(Number(s.schemaVersion)!==VERSION)return {ok:false,error:'unsupported_snapshot_version'};
 if(!String(s.id||'').trim())return {ok:false,error:'missing_snapshot_id'};
 if(!String(s.createdAt||'').trim())return {ok:false,error:'missing_created_at'};
 if(!validPlan(s.projectPlan))return {ok:false,error:'invalid_project_plan'};
 if(!s.totals||typeof s.totals!=='object')return {ok:false,error:'missing_totals'};
 ['customerMaterials','yourCost','marginDollar','marginPct'].forEach(function(k){if(s.totals[k]!==null&&s.totals[k]!==undefined&&!Number.isFinite(Number(s.totals[k])))throw new Error('invalid_total_'+k);});
 if(!Array.isArray(s.bom))return {ok:false,error:'invalid_bom'};
 return {ok:true};
}
function normalizeStore(raw){
 var out={schemaVersion:1,activeId:null,items:[]};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
 if(Array.isArray(raw.items))raw.items.forEach(function(s){try{if(validateSnapshot(s).ok)out.items.push(clone(s));}catch(e){}});
 if(raw.activeId&&out.items.some(function(x){return x.id===raw.activeId;}))out.activeId=raw.activeId;
 return out;
}
function add(store,snapshot){var st=normalizeStore(store),s=clone(snapshot);if(!s.id)s.id=id();if(!s.createdAt)s.createdAt=new Date().toISOString();s.schemaVersion=VERSION;var v;try{v=validateSnapshot(s);}catch(e){return {ok:false,error:e.message,store:st};}if(!v.ok)return {ok:false,error:v.error,store:st};st.items.unshift(s);if(st.items.length>100)st.items.length=100;st.activeId=s.id;return {ok:true,store:st,snapshot:s};}
function activate(store,snapshotId){var st=normalizeStore(store);if(!st.items.some(function(x){return x.id===snapshotId;}))return {ok:false,error:'snapshot_not_found',store:st};st.activeId=snapshotId;return {ok:true,store:st};}
function remove(store,snapshotId){var st=normalizeStore(store);st.items=st.items.filter(function(x){return x.id!==snapshotId;});if(st.activeId===snapshotId)st.activeId=st.items.length?st.items[0].id:null;return st;}
function duplicatePlan(snapshot){var v;try{v=validateSnapshot(snapshot);}catch(e){return {ok:false,error:e.message};}if(!v.ok)return {ok:false,error:v.error};var p=clone(snapshot.projectPlan);p.extras=(p.extras||[]).map(function(x){var y=clone(x);delete y.customerUnitPrice;delete y.yourUnitCost;return y;});p.duplicatedFromSnapshotId=snapshot.id;p.duplicatedAt=new Date().toISOString();return {ok:true,plan:p};}
function exportOne(snapshot){var v;try{v=validateSnapshot(snapshot);}catch(e){return {ok:false,error:e.message};}if(!v.ok)return {ok:false,error:v.error};return {ok:true,payload:{product:'bruno-ac',type:'project-calculation-snapshot',version:1,snapshot:clone(snapshot)}};}
function exportAll(store){var st=normalizeStore(store);return {product:'bruno-ac',type:'project-calculation-history',version:1,history:st};}
function importPayload(payload,store){
 var st=normalizeStore(store),incoming=[];
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return {ok:false,error:'invalid_payload',store:st};
 if(payload.product!=='bruno-ac'||Number(payload.version)!==1)return {ok:false,error:'unsupported_payload',store:st};
 if(payload.type==='project-calculation-snapshot')incoming=[payload.snapshot];else if(payload.type==='project-calculation-history'&&payload.history&&Array.isArray(payload.history.items))incoming=payload.history.items;else return {ok:false,error:'unsupported_payload_type',store:st};
 var added=0,rejected=0;
 incoming.forEach(function(src){var s=clone(src||{});s.id=id();s.importedAt=new Date().toISOString();s.importedFromId=String(src&&src.id||'');s.schemaVersion=1;var v;try{v=validateSnapshot(s);}catch(e){rejected++;return;}if(!v.ok){rejected++;return;}st.items.unshift(s);added++;});
 if(st.items.length>100)st.items.length=100;if(added&&!st.activeId)st.activeId=st.items[0].id;
 return {ok:added>0,added:added,rejected:rejected,store:st,error:added?null:'no_valid_snapshots'};
}
function total(v){return v==null?null:num(v);}
return {VERSION:VERSION,validateSnapshot:validateSnapshot,normalizeStore:normalizeStore,add:add,activate:activate,remove:remove,duplicatePlan:duplicatePlan,exportOne:exportOne,exportAll:exportAll,importPayload:importPayload,total:total};
});