(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports){module.exports=api;return}if(root)root.BrunoAppBackup=api;if(typeof document!=='undefined')api.init()})(typeof self!=='undefined'?self:this,function(){
'use strict';
var PREFIX='bruno-ac-',JOURNAL_KEY='bruno-ac-service-journal-v2',PRIMARY_JOB_KEY='bruno-ac-v1';
var KNOWN_JSON_KEYS={
  'bruno-ac-v1':1,
  'bruno-ac-service-journal-v2':1,
  'bruno-ac-project-context-v1':1,
  'bruno-ac-project-plan-v1':1,
  'bruno-ac-building-envelope-v1':1,
  'bruno-ac-bom-catalog-bindings-v1':1,
  'bruno-ac-bom-overrides-v1':1,
  'bruno-ac-compliance-v1':1,
  'bruno-ac-project-history-v1':1
};
function collectBrunoStorage(storage){var out={};if(!storage)return out;for(var i=0;i<storage.length;i++){var k=storage.key(i);if(k&&k.indexOf(PREFIX)===0){var v=storage.getItem(k);if(typeof v==='string')out[k]=v}}return out}
function buildBackup(storage){return {product:'bruno-ac',type:'bruno-ac-full-app-backup',version:2,exportedAt:new Date().toISOString(),storage:collectBrunoStorage(storage)}}
function nonEmptyString(v){return typeof v==='string'&&v.trim().length>0}
function validJsonObjectRaw(raw){if(typeof raw!=='string')return false;var x;try{x=JSON.parse(raw)}catch(e){return false}return !!(x&&typeof x==='object'&&!Array.isArray(x))}
function validPrimaryJobRaw(raw){if(typeof raw!=='string')return false;var j;try{j=JSON.parse(raw)}catch(e){return false}return !!(j&&typeof j==='object'&&!Array.isArray(j)&&j.quote&&typeof j.quote==='object'&&!Array.isArray(j.quote)&&Array.isArray(j.materialsUsed)&&Array.isArray(j.catalog))}
function validateJournalRaw(raw){
  if(typeof raw!=='string')return false;var j;try{j=JSON.parse(raw)}catch(e){return false}
  if(!j||typeof j!=='object'||Array.isArray(j)||[3,4].indexOf(Number(j.schemaVersion))<0)return false;
  if(!j.settings||typeof j.settings!=='object'||Array.isArray(j.settings)||!Array.isArray(j.calls)||!Array.isArray(j.crew))return false;
  if(!j.calls.every(function(c){return c&&typeof c==='object'&&!Array.isArray(c)&&nonEmptyString(c.id)&&nonEmptyString(c.date)}))return false;
  if(Number(j.schemaVersion)<4)return j.crew.every(function(w){return w&&typeof w==='object'&&!Array.isArray(w)&&nonEmptyString(w.id)&&nonEmptyString(w.date)});
  if(!Array.isArray(j.workers))return false;
  var ids={},ok=true;
  j.workers.forEach(function(w){if(!ok)return;if(!w||typeof w!=='object'||Array.isArray(w)||!nonEmptyString(w.id)||typeof w.name!=='string'){ok=false;return}var id=w.id.trim();if(ids[id]){ok=false;return}ids[id]=true;});
  if(!ok)return false;
  return j.crew.every(function(w){return w&&typeof w==='object'&&!Array.isArray(w)&&nonEmptyString(w.id)&&nonEmptyString(w.date)&&nonEmptyString(w.workerId)&&!!ids[w.workerId.trim()]});
}
function validateKnownRaw(key,raw){if(key===PRIMARY_JOB_KEY)return validPrimaryJobRaw(raw);if(key===JOURNAL_KEY)return validateJournalRaw(raw);if(KNOWN_JSON_KEYS[key])return validJsonObjectRaw(raw);return true}
function validateBackup(b){if(!b||typeof b!=='object'||Array.isArray(b)||b.product!=='bruno-ac'||b.type!=='bruno-ac-full-app-backup'||Number(b.version)!==2||!b.storage||typeof b.storage!=='object'||Array.isArray(b.storage))return false;var keys=Object.keys(b.storage);if(!keys.every(function(k){return k.indexOf(PREFIX)===0&&typeof b.storage[k]==='string'&&validateKnownRaw(k,b.storage[k])}))return false;return true}
function brunoKeys(storage){var out=[];if(!storage)return out;for(var i=0;i<storage.length;i++){var k=storage.key(i);if(k&&k.indexOf(PREFIX)===0)out.push(k)}return out}
function clearBrunoStorage(storage){brunoKeys(storage).forEach(function(k){storage.removeItem(k)})}
function restoreBackup(b,storage){
  if(!validateBackup(b))throw new Error('Invalid Bruno AC full app backup');
  if(!storage||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')throw new Error('Storage is unavailable');
  var before=collectBrunoStorage(storage),incoming=b.storage,keys=Object.keys(incoming),written=[];
  try{
    clearBrunoStorage(storage);
    keys.forEach(function(k){storage.setItem(k,incoming[k]);written.push(k)});
  }catch(e){
    try{clearBrunoStorage(storage);Object.keys(before).forEach(function(k){storage.setItem(k,before[k])})}
    catch(rollbackError){throw new Error('Restore failed and rollback also failed: '+rollbackError.message)}
    throw new Error('Restore failed; previous Bruno data was restored: '+e.message);
  }
  return written;
}
function downloadJson(obj){var blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),a=document.createElement('a'),d=new Date(),stamp=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');a.href=URL.createObjectURL(blob);a.download='bruno-ac-full-backup-'+stamp+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
function exportNow(){downloadJson(buildBackup(localStorage))}
function importFile(file){if(!file)return;var r=new FileReader();r.onload=function(){try{var b=JSON.parse(String(r.result||''));if(!validateBackup(b))throw new Error('Invalid Bruno AC full app backup');if(typeof window!=='undefined'&&window.BrunoPrimaryStorageGuard&&window.BrunoPrimaryStorageGuard.locked&&typeof window.BrunoPrimaryStorageGuard.allowRecoveryWrite==='function')window.BrunoPrimaryStorageGuard.allowRecoveryWrite(10000);var written=restoreBackup(b,localStorage);alert('Full Bruno AC backup restored: '+written.length+' storage sections. The app will reload.');window.location.reload()}catch(e){alert('Could not restore full Bruno AC backup: '+e.message)}};r.readAsText(file)}
function bindExport(el){if(!el||el.dataset.fullBackup==='1')return;el.dataset.fullBackup='1';el.title='Full app backup: all Bruno AC local data including Service Journal';el.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();exportNow()},true)}
function bindImport(input){if(!input||input.dataset.fullBackup==='1')return;input.dataset.fullBackup='1';input.addEventListener('change',function(e){e.preventDefault();e.stopImmediatePropagation();var f=input.files&&input.files[0];importFile(f);input.value=''},true)}
function init(){function bind(){bindExport(document.getElementById('btn-export-app'));bindExport(document.getElementById('help-export-app'));bindImport(document.getElementById('btn-import-app'))}bind();setTimeout(bind,0);setTimeout(bind,500)}
return {PREFIX:PREFIX,PRIMARY_JOB_KEY:PRIMARY_JOB_KEY,KNOWN_JSON_KEYS:KNOWN_JSON_KEYS,collectBrunoStorage:collectBrunoStorage,buildBackup:buildBackup,validJsonObjectRaw:validJsonObjectRaw,validPrimaryJobRaw:validPrimaryJobRaw,validateKnownRaw:validateKnownRaw,validateJournalRaw:validateJournalRaw,validateBackup:validateBackup,brunoKeys:brunoKeys,restoreBackup:restoreBackup,init:init};
});
