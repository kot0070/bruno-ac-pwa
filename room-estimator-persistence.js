(function(){
'use strict';
var STORAGE_KEY='bruno-ac-v1';
function validJob(s){return !!(s&&typeof s==='object'&&!Array.isArray(s)&&s.quote&&typeof s.quote==='object'&&Array.isArray(s.materialsUsed)&&Array.isArray(s.catalog))}
function readJob(){try{var raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;var s=JSON.parse(raw);return validJob(s)?s:null}catch(e){return null}}
function unwrapPlan(v){return v&&v.plan&&v.plan.building&&Array.isArray(v.plan.rooms)?v.plan:v}
function snapshot(){var ux=window.BrunoRoomEstimatorUX,snap=ux&&typeof ux.getSnapshot==='function'?ux.getSnapshot():null;var plan=unwrapPlan(snap);return plan&&plan.building&&Array.isArray(plan.rooms)&&plan.overrides?plan:null}
function persist(){
  var snap=snapshot();if(!snap)return false;
  try{
    var s=readJob();if(!s)return false;
    if(!s.acCalculator||typeof s.acCalculator!=='object')s.acCalculator={};
    s.acCalculator.roomEstimator=snap;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(s));return true;
  }catch(e){return false}
}
function generatedAt(){var s=readJob();return s&&s.acCalculator?String(s.acCalculator.generatedAt||''):''}
function persistAfterSuccessfulApply(beforeGeneratedAt){setTimeout(function(){var after=generatedAt();if(after&&after!==beforeGeneratedAt)persist()},0)}
function init(){
  var heading=document.querySelector('#room-estimator-card h2');if(heading&&heading.firstChild)heading.firstChild.nodeValue='Building & room estimator ';
  var apply=document.getElementById('apply');if(apply)apply.addEventListener('click',function(){persistAfterSuccessfulApply(generatedAt())});
  var exportBtn=document.getElementById('exportPlan');if(exportBtn){
    var extra=document.createElement('button');extra.type='button';extra.className='btn';extra.id='exportRoomPlan';extra.textContent='Export room plan JSON';exportBtn.parentNode.appendChild(extra);
    extra.addEventListener('click',function(){var snap=snapshot();if(!snap)return;var blob=new Blob([JSON.stringify({product:'bruno-ac',type:'room-estimator-plan',version:1,roomEstimator:snap},null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bruno-ac-room-estimator-plan.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BrunoRoomEstimatorPersistence={persist:persist,generatedAt:generatedAt,unwrapPlan:unwrapPlan};
})();