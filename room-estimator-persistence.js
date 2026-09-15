(function(){
'use strict';
var STORAGE_KEY='bruno-ac-v1';
function validJob(s){return !!(s&&typeof s==='object'&&!Array.isArray(s)&&s.quote&&typeof s.quote==='object'&&Array.isArray(s.materialsUsed)&&Array.isArray(s.catalog))}
function snapshot(){var ux=window.BrunoRoomEstimatorUX;return ux&&typeof ux.getSnapshot==='function'?ux.getSnapshot():null}
function persist(){
  var snap=snapshot();if(!snap)return false;
  try{
    var raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;
    var s=JSON.parse(raw);if(!validJob(s))return false;
    if(!s.acCalculator||typeof s.acCalculator!=='object')s.acCalculator={};
    s.acCalculator.roomEstimator=snap;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(s));return true;
  }catch(e){return false}
}
function init(){
  var apply=document.getElementById('apply');if(apply)apply.addEventListener('click',function(){setTimeout(persist,0)});
  var exportBtn=document.getElementById('exportPlan');if(exportBtn){
    var extra=document.createElement('button');extra.type='button';extra.className='btn';extra.id='exportRoomPlan';extra.textContent='Export room plan JSON';exportBtn.parentNode.appendChild(extra);
    extra.addEventListener('click',function(){var snap=snapshot();if(!snap)return;var blob=new Blob([JSON.stringify({product:'bruno-ac',type:'room-estimator-plan',version:1,roomEstimator:snap},null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bruno-ac-room-estimator-plan.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BrunoRoomEstimatorPersistence={persist:persist};
})();
