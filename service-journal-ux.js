(function(root,factory){
'use strict';
var api=factory();
if(typeof module==='object'&&module.exports){module.exports=api;return;}
if(root)root.BrunoServiceJournalUX=api;
if(typeof document!=='undefined')api.init();
})(typeof self!=='undefined'?self:this,function(){
'use strict';

var STORAGE_KEY='bruno-ac-service-journal-v2';
var LEGACY_KEY='bruno-ac-v1';
var UI_VERSION='5';

function pad(n){return String(n).padStart(2,'0');}
function todayISO(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function parseISO(s){var p=String(s||'').split('-');return p.length===3?new Date(+p[0],+p[1]-1,+p[2]):new Date();}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function shiftPeriod(s,mode,delta){
  var d=parseISO(s),day=d.getDate();
  if(mode==='day'||mode==='week'){
    d.setDate(d.getDate()+delta*(mode==='week'?7:1));
    return iso(d);
  }
  if(mode==='month'){
    var target=new Date(d.getFullYear(),d.getMonth()+delta,1);
    target.setDate(Math.min(day,daysInMonth(target.getFullYear(),target.getMonth())));
    return iso(target);
  }
  var qStart=Math.floor(d.getMonth()/3)*3;
  var targetQ=new Date(d.getFullYear(),qStart+delta*3,1);
  targetQ.setDate(Math.min(day,daysInMonth(targetQ.getFullYear(),targetQ.getMonth())));
  return iso(targetQ);
}
function money(n){n=Number(n);if(!isFinite(n))n=0;return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function uid(p){return (p||'id')+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function num(v){v=Number(v);return isFinite(v)&&v>=0?v:0;}
function pct(v){v=Number(v);return isFinite(v)?Math.max(0,Math.min(100,v)):0;}

function defaultSettings(){
  return {
    location:'Dripping Springs, TX',jurisdiction:'TX',
    ownerReserveEnabled:false,ownerReservePct:0,
    employeePayrollEnabled:true,employeeSocialSecurityPct:6.2,employeeMedicarePct:1.45,employeeFederalWithholdingPct:0,
    employerPayrollEnabled:true,employerSocialSecurityPct:6.2,employerMedicarePct:1.45,
    twcEnabled:true,twcPct:2.70,futaEnabled:true,futaPct:0.60,
    socialSecurityWageBase:184500,additionalMedicareThreshold:200000,twcWageBase:9000,futaWageBase:7000,
    note:'Payroll defaults are planning estimates. Federal withholding depends on Form W-4 and is not auto-guessed.'
  };
}
function defaultState(){return {schemaVersion:4,selectedDate:todayISO(),viewMode:'day',settings:defaultSettings(),workers:[],calls:[],crew:[]};}
function normalize(s){
  if(!s||typeof s!=='object'||Array.isArray(s))s=defaultState();
  var d=defaultState(),old=Number(s.schemaVersion)||0;
  s.schemaVersion=4;
  s.selectedDate=s.selectedDate||d.selectedDate;
  s.viewMode=/^(day|week|month|quarter)$/.test(s.viewMode)?s.viewMode:'day';
  s.settings=s.settings&&typeof s.settings==='object'?s.settings:{};
  Object.keys(d.settings).forEach(function(k){if(s.settings[k]===undefined)s.settings[k]=d.settings[k];});
  if(old<3){s.settings.ownerReserveEnabled=false;s.settings.ownerReservePct=0;}
  ['ownerReservePct','employeeSocialSecurityPct','employeeMedicarePct','employeeFederalWithholdingPct','employerSocialSecurityPct','employerMedicarePct','twcPct','futaPct'].forEach(function(k){s.settings[k]=pct(s.settings[k]);});
  ['socialSecurityWageBase','additionalMedicareThreshold','twcWageBase','futaWageBase'].forEach(function(k){s.settings[k]=num(s.settings[k]);});
  ['ownerReserveEnabled','employeePayrollEnabled','employerPayrollEnabled','twcEnabled','futaEnabled'].forEach(function(k){s.settings[k]=s.settings[k]!==false;});
  if(!Array.isArray(s.workers))s.workers=[];
  if(!Array.isArray(s.calls))s.calls=[];
  if(!Array.isArray(s.crew))s.crew=[];
  s.workers=s.workers.map(function(w){return {id:String(w&&w.id||uid('worker')),name:String(w&&w.name||'Helper')};});
  var byName={};s.workers.forEach(function(w){if(!byName[w.name.toLowerCase()])byName[w.name.toLowerCase()]=w.id;});
  s.calls=s.calls.map(function(c){c=c||{};return {id:String(c.id||uid('call')),date:String(c.date||s.selectedDate),time:String(c.time||'08:00'),address:String(c.address||''),description:String(c.description||''),hours:num(c.hours),gross:num(c.gross!=null?c.gross:c.grossPay),status:String(c.status||'done')};});
  s.crew=s.crew.map(function(w){
    w=w||{};var name=String(w.name||'Helper'),workerId=String(w.workerId||'');
    if(!workerId){workerId=byName[name.toLowerCase()]||uid('worker');if(!byName[name.toLowerCase()]){s.workers.push({id:workerId,name:name});byName[name.toLowerCase()]=workerId;}}
    var wk=s.workers.find(function(x){return x.id===workerId;});
    return {id:String(w.id||uid('crew')),workerId:workerId,date:String(w.date||s.selectedDate),name:String(wk&&wk.name||name),payType:w.payType==='daily'?'daily':'hourly',rate:num(w.rate),hours:num(w.hours),payrollEnabled:w.payrollEnabled!==false};
  });
  return s;
}
function rangeBounds(date,mode){
  var d=parseISO(date),start=new Date(d),end=new Date(d);
  if(mode==='week'){var dow=d.getDay(),diff=dow===0?-6:1-dow;start.setDate(d.getDate()+diff);end=new Date(start);end.setDate(start.getDate()+6);}
  else if(mode==='month'){start=new Date(d.getFullYear(),d.getMonth(),1);end=new Date(d.getFullYear(),d.getMonth()+1,0);}
  else if(mode==='quarter'){var qm=Math.floor(d.getMonth()/3)*3;start=new Date(d.getFullYear(),qm,1);end=new Date(d.getFullYear(),qm+3,0);}
  return {start:iso(start),end:iso(end)};
}
function inRange(date,b){return String(date)>=b.start&&String(date)<=b.end;}
function crewGross(w){return w.payType==='daily'?num(w.rate):num(w.rate)*num(w.hours);}
function cappedTax(current,prior,base,rate){if(base<=0||rate<=0)return 0;var taxable=Math.max(0,Math.min(current,base-Math.max(0,prior)));return taxable*rate/100;}
function payrollLedger(state){
  state=normalize(state);var set=state.settings,rows=state.crew.slice().sort(function(a,b){return (a.date+'|'+a.id).localeCompare(b.date+'|'+b.id);}),ytd={},out={};
  rows.forEach(function(w){
    var gross=crewGross(w),year=String(w.date).slice(0,4),key=year+'|'+w.workerId,prior=num(ytd[key]);
    var employeeSS=0,employeeMed=0,additionalMed=0,federal=0,employerSS=0,employerMed=0,twc=0,futa=0,on=w.payrollEnabled!==false;
    if(on&&set.employeePayrollEnabled){employeeSS=cappedTax(gross,prior,set.socialSecurityWageBase,set.employeeSocialSecurityPct);employeeMed=gross*set.employeeMedicarePct/100;var th=num(set.additionalMedicareThreshold);if(prior+gross>th)additionalMed=Math.max(0,(prior+gross-th)-Math.max(0,prior-th))*.009;federal=gross*set.employeeFederalWithholdingPct/100;}
    if(on&&set.employerPayrollEnabled){employerSS=cappedTax(gross,prior,set.socialSecurityWageBase,set.employerSocialSecurityPct);employerMed=gross*set.employerMedicarePct/100;if(set.twcEnabled)twc=cappedTax(gross,prior,set.twcWageBase,set.twcPct);if(set.futaEnabled)futa=cappedTax(gross,prior,set.futaWageBase,set.futaPct);}
    var withheld=employeeSS+employeeMed+additionalMed+federal,employerTax=employerSS+employerMed+twc+futa;
    out[w.id]={gross:gross,employeeWithheld:withheld,takeHome:gross-withheld,employerTax:employerTax,employerCost:gross+employerTax,priorWages:prior,workerId:w.workerId,employeeSS:employeeSS,employeeMedicare:employeeMed,additionalMedicare:additionalMed,federalReserve:federal,employerSS:employerSS,employerMedicare:employerMed,twc:twc,futa:futa};
    ytd[key]=prior+gross;
  });
  return out;
}
function summarize(state,bounds){
  state=normalize(state);bounds=bounds||rangeBounds(state.selectedDate,state.viewMode);
  var calls=state.calls.filter(function(c){return inRange(c.date,bounds)&&c.status!=='cancelled';});
  var crew=state.crew.filter(function(w){return inRange(w.date,bounds);}),ledger=payrollLedger(state),gross=0,hours=0;
  calls.forEach(function(c){gross+=num(c.gross);hours+=num(c.hours);});
  var reserve=state.settings.ownerReserveEnabled?gross*state.settings.ownerReservePct/100:0,wages=0,take=0,employerTax=0,employerCost=0;
  crew.forEach(function(w){var p=ledger[w.id];wages+=p.gross;take+=p.takeHome;employerTax+=p.employerTax;employerCost+=p.employerCost;});
  return {calls:calls.length,hours:hours,gross:gross,ownerReserve:reserve,availableAfterReserve:gross-reserve,crewGross:wages,crewTakeHome:take,employerPayrollTax:employerTax,employerCrewCost:employerCost,netAfterCrew:gross-reserve-employerCost};
}
function load(){
  try{var raw=localStorage.getItem(STORAGE_KEY);if(raw)return normalize(JSON.parse(raw));}catch(e){}
  var s=defaultState();
  try{var legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'{}'),calls=legacy.dispatch&&Array.isArray(legacy.dispatch.calls)?legacy.dispatch.calls:[];if(legacy.dispatch&&legacy.dispatch.selectedDate)s.selectedDate=legacy.dispatch.selectedDate;s.calls=calls.map(function(c){return {id:String(c.id||uid('call')),date:String(c.date||s.selectedDate),time:String(c.time||'08:00'),address:String(c.address||''),description:String(c.description||''),hours:num(c.hours),gross:num(c.grossPay),status:String(c.status||'done')};});}catch(e){}
  save(s);return normalize(s);
}
function save(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(normalize(s)));}catch(e){}}
function taxSummary(settings){
  var flags=[];
  if(settings.employeePayrollEnabled)flags.push('employee payroll');
  if(settings.employerPayrollEnabled)flags.push('employer payroll');
  if(settings.twcEnabled)flags.push('TWC');
  if(settings.futaEnabled)flags.push('FUTA');
  return (settings.jurisdiction||'TX')+' · '+(flags.length?flags.join(' · '):'payroll estimates off');
}
function callCardHtml(c){
  return '<article class="sj5-call-card" data-call-id="'+esc(c.id)+'">'+
    '<div class="sj5-call-main"><div class="sj5-call-top"><strong>'+esc(c.time||'—')+'</strong><span>'+esc(c.date)+'</span><span class="sj5-status">'+esc(c.status)+'</span></div>'+
    '<div class="sj5-address">'+esc(c.address||'No address')+'</div>'+
    (c.description?'<div class="sj5-desc">'+esc(c.description)+'</div>':'')+
    '<div class="sj5-meta">'+num(c.hours)+' h</div></div>'+
    '<div class="sj5-call-side"><strong>'+money(c.gross)+'</strong><div class="sj5-actions"><button class="btn btn-sm" data-edit-call="'+esc(c.id)+'">Edit</button><button class="btn btn-sm btn-danger" data-del-call="'+esc(c.id)+'" aria-label="Delete service call">×</button></div></div>'+ 
  '</article>';
}

function init(){
  function $(id){return document.getElementById(id);}
  var panel=$('panel-dispatch');if(!panel)return;
  if(panel.dataset.serviceJournalVersion===UI_VERSION)return;
  panel.dataset.serviceJournalVersion=UI_VERSION;
  panel.removeAttribute('data-sj4');
  var state=load(),editingCall=null,editingCrew=null;

  var oldStyle=document.getElementById('bruno-service-journal-runtime-style');if(oldStyle)oldStyle.remove();
  var style=document.createElement('style');style.id='bruno-service-journal-runtime-style';
  style.textContent='.sj5{padding:.65rem!important}.sj5-card{border:1px solid var(--border);border-radius:11px;background:var(--bg-elev);padding:.65rem;margin:.55rem 0}.sj5-toolbar{display:flex;gap:.35rem;align-items:center;flex-wrap:wrap}.sj5-toolbar input{min-height:38px}.sj5-mode{display:grid;grid-template-columns:repeat(4,1fr);gap:.25rem;margin:.4rem 0}.sj5-week{display:grid;grid-template-columns:repeat(7,1fr);gap:.2rem}.sj5-day{border:1px solid var(--border);border-radius:8px;background:var(--bg-card);color:inherit;padding:.3rem .05rem}.sj5-day.active{border-color:var(--accent)}.sj5-day span{display:block;font-size:.62rem}.sj5-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:.35rem}.sj5-stat{border:1px solid var(--border);border-radius:8px;padding:.45rem;background:#111923}.sj5-stat small{display:block;color:var(--text-muted);font-size:.58rem;text-transform:uppercase}.sj5-row{display:grid;grid-template-columns:1fr auto;gap:.45rem;align-items:center;border:1px solid var(--border);border-radius:8px;padding:.4rem .5rem;margin:.3rem 0;background:#111923}.sj5-row small{display:block;color:var(--text-muted);font-size:.64rem}.sj5-call-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.55rem;align-items:center;border:1px solid var(--border);border-radius:9px;padding:.5rem .55rem;margin:.32rem 0;background:#111923}.sj5-call-main{min-width:0}.sj5-call-top{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;color:var(--text-muted);font-size:.68rem}.sj5-call-top strong{font-size:.8rem;color:var(--text)}.sj5-status{padding:.08rem .32rem;border:1px solid var(--border);border-radius:999px}.sj5-address{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:.12rem}.sj5-desc{font-size:.7rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sj5-meta{font-size:.66rem;color:var(--text-muted)}.sj5-call-side{text-align:right;white-space:nowrap}.sj5-actions{display:flex;gap:.25rem;justify-content:flex-end;margin-top:.22rem}.sj5-modal{position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.6);display:none;align-items:flex-end;justify-content:center;padding:.5rem}.sj5-modal.open{display:flex}.sj5-dialog{width:min(620px,100%);max-height:90vh;overflow:auto;border:1px solid var(--border);border-radius:13px;background:var(--bg-elev);padding:.75rem}.sj5-grid{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}.sj5-grid .field.full{grid-column:1/-1}.sj5-tax{padding:0!important}.sj5-tax summary{cursor:pointer;padding:.58rem .65rem;display:flex;align-items:center;justify-content:space-between;gap:.5rem;list-style:none}.sj5-tax summary::-webkit-details-marker{display:none}.sj5-tax-summary{color:var(--text-muted);font-size:.68rem;text-align:right}.sj5-tax-body{padding:.65rem;border-top:1px solid var(--border)}.sj5-tax:not([open]) .sj5-tax-body{display:none!important}.sj5-tax-close{grid-column:1/-1;justify-self:start}@media(max-width:560px){.sj5-call-card{grid-template-columns:minmax(0,1fr) auto;padding:.42rem .48rem}.sj5-call-side strong{font-size:.78rem}.sj5-actions .btn{padding:.22rem .42rem;font-size:.7rem}.sj5-desc{max-width:60vw}.sj5-tax summary{align-items:flex-start;flex-direction:column}.sj5-tax-summary{text-align:left}.sj5-grid{grid-template-columns:1fr}}@media(min-width:760px){.sj5-stats{grid-template-columns:repeat(4,1fr)}}';
  document.head.appendChild(style);

  panel.className='panel sj5';
  panel.innerHTML='<div class="panel-head"><div><h2>Service Call Journal</h2><div class="muted">Calendar · calls · workers · payroll · archive</div></div></div>'+ 
  '<section class="sj5-card"><h3>Calendar</h3><div class="sj5-toolbar"><button class="btn btn-sm" id="sj5-prev">←</button><input type="date" id="sj5-date"><button class="btn btn-sm" id="sj5-next">→</button><button class="btn btn-sm" id="sj5-today">Today</button></div><div class="sj5-mode"><button class="btn btn-sm" data-mode="day">Day</button><button class="btn btn-sm" data-mode="week">Week</button><button class="btn btn-sm" data-mode="month">Month</button><button class="btn btn-sm" data-mode="quarter">Quarter</button></div><div id="sj5-range" class="muted"></div><div class="sj5-week" id="sj5-week"></div></section>'+ 
  '<section class="sj5-card"><h3>Income</h3><div class="sj5-stats" id="sj5-stats"></div></section>'+ 
  '<section class="sj5-card"><div class="panel-head"><h3>Helpers / Crew</h3><button class="btn btn-sm" id="sj5-add-crew">+ Add helper</button></div><div id="sj5-crew"></div></section>'+ 
  '<section class="sj5-card"><div class="panel-head"><h3>Service Calls</h3><button class="btn btn-primary btn-sm" id="sj5-add-call">+ Add Service Call</button></div><div id="sj5-calls"></div></section>'+ 
  '<details class="sj5-card sj5-tax" id="sj5-tax"><summary><span>⚙ Payroll / Tax Settings</span><span class="sj5-tax-summary" id="sj5-tax-summary"></span></summary><div class="sj5-tax-body sj5-grid"><div class="field"><label>Location</label><input id="sj5-location"></div><div class="field"><label>Jurisdiction</label><input id="sj5-jurisdiction"></div><label><input id="sj5-owner-on" type="checkbox"> Owner tax reserve</label><div class="field"><label>Owner reserve %</label><input id="sj5-owner-pct" type="number" step=".01"></div><label><input id="sj5-emp-on" type="checkbox"> Employee payroll estimates</label><div class="field"><label>Federal withholding reserve %</label><input id="sj5-fed" type="number" step=".01"></div><label><input id="sj5-er-on" type="checkbox"> Employer payroll taxes</label><div class="field"><label>TWC %</label><input id="sj5-twc" type="number" step=".01"></div><label><input id="sj5-twc-on" type="checkbox"> TWC estimate</label><div class="field"><label>FUTA %</label><input id="sj5-futa" type="number" step=".01"></div><label><input id="sj5-futa-on" type="checkbox"> FUTA estimate</label><p class="muted full">FICA, TWC and FUTA are payroll estimates, not a tax on service-call revenue. Federal withholding depends on W-4 and is not guessed automatically.</p><button type="button" class="btn btn-sm sj5-tax-close" id="sj5-tax-close">Collapse settings</button></div></details>'+ 
  '<div class="sj5-modal" id="sj5-call-modal"><form class="sj5-dialog" id="sj5-call-form"><h3>Service Call</h3><div class="sj5-grid"><div class="field"><label>Date</label><input id="sj5-call-date" type="date"></div><div class="field"><label>Time</label><input id="sj5-call-time" type="time"></div><div class="field full"><label>Address</label><input id="sj5-call-address"></div><div class="field full"><label>Description</label><textarea id="sj5-call-desc"></textarea></div><div class="field"><label>Hours</label><input id="sj5-call-hours" type="number" step=".25"></div><div class="field"><label>Price / Gross $</label><input id="sj5-call-gross" type="number" step=".01"></div><div class="field"><label>Status</label><select id="sj5-call-status"><option value="done">Done</option><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option></select></div></div><div class="sj5-actions"><button type="button" class="btn" data-close="call">Cancel</button><button class="btn btn-primary">Save</button></div></form></div>'+ 
  '<div class="sj5-modal" id="sj5-crew-modal"><form class="sj5-dialog" id="sj5-crew-form"><h3>Helper / Crew</h3><div class="sj5-grid"><div class="field"><label>Date</label><input id="sj5-crew-date" type="date"></div><div class="field"><label>Worker</label><select id="sj5-worker-select"></select></div><div class="field full" id="sj5-new-worker-wrap"><label>New worker name</label><input id="sj5-worker-name"></div><div class="field"><label>Pay type</label><select id="sj5-crew-type"><option value="hourly">Hourly</option><option value="daily">Fixed / day</option></select></div><div class="field"><label>Rate $</label><input id="sj5-crew-rate" type="number" step=".01"></div><div class="field"><label>Hours</label><input id="sj5-crew-hours" type="number" step=".25"></div><label><input id="sj5-crew-payroll" type="checkbox" checked> Apply payroll estimates</label></div><div class="sj5-actions"><button type="button" class="btn" data-close="crew">Cancel</button><button class="btn btn-primary">Save</button></div></form></div>';

  function label(b){if(state.viewMode==='day')return b.start;if(state.viewMode==='week')return b.start+' → '+b.end;if(state.viewMode==='month')return parseISO(b.start).toLocaleDateString('en-US',{month:'long',year:'numeric'});var d=parseISO(b.start);return 'Q'+(Math.floor(d.getMonth()/3)+1)+' '+d.getFullYear();}
  function renderWeek(){var start=parseISO(rangeBounds(state.selectedDate,'week').start),h='';for(var i=0;i<7;i++){var d=new Date(start);d.setDate(start.getDate()+i);var ds=iso(d),cnt=state.calls.filter(function(c){return c.date===ds&&c.status!=='cancelled';}).length;h+='<button class="sj5-day '+(ds===state.selectedDate?'active':'')+'" data-date="'+ds+'"><span>'+d.toLocaleDateString('en-US',{weekday:'short'})+'</span><strong>'+d.getDate()+'</strong><span>'+cnt+' call'+(cnt===1?'':'s')+'</span></button>';}$('sj5-week').innerHTML=h;}
  function render(){
    state=normalize(state);save(state);$('sj5-date').value=state.selectedDate;
    panel.querySelectorAll('[data-mode]').forEach(function(x){x.classList.toggle('active',x.getAttribute('data-mode')===state.viewMode);});
    var b=rangeBounds(state.selectedDate,state.viewMode),sum=summarize(state,b),ledger=payrollLedger(state);
    $('sj5-range').textContent=label(b);renderWeek();
    $('sj5-stats').innerHTML='<div class="sj5-stat"><small>Calls</small><strong>'+sum.calls+'</strong></div><div class="sj5-stat"><small>Gross</small><strong>'+money(sum.gross)+'</strong></div><div class="sj5-stat"><small>Crew employer cost</small><strong>'+money(sum.employerCrewCost)+'</strong></div><div class="sj5-stat"><small>Cash after crew</small><strong>'+money(sum.netAfterCrew)+'</strong></div>';
    $('sj5-calls').innerHTML=state.calls.filter(function(c){return inRange(c.date,b);}).sort(function(a,b2){return (b2.date+b2.time).localeCompare(a.date+a.time);}).map(callCardHtml).join('')||'<div class="muted">No calls in this period.</div>';
    $('sj5-crew').innerHTML=state.crew.filter(function(w){return inRange(w.date,b);}).map(function(w){var p=ledger[w.id];return '<div class="sj5-row"><div><strong>'+esc(w.name)+' · '+esc(w.payType)+'</strong><small>'+esc(w.date)+' · gross '+money(p.gross)+' · take-home '+money(p.takeHome)+' · employer tax '+money(p.employerTax)+'</small></div><div><strong>'+money(p.employerCost)+'</strong><div class="sj5-actions"><button class="btn btn-sm" data-edit-crew="'+esc(w.id)+'">Edit</button><button class="btn btn-sm btn-danger" data-del-crew="'+esc(w.id)+'">×</button></div></div></div>';}).join('')||'<div class="muted">No crew entries in this period.</div>';
    var s=state.settings;$('sj5-location').value=s.location;$('sj5-jurisdiction').value=s.jurisdiction;$('sj5-owner-on').checked=s.ownerReserveEnabled;$('sj5-owner-pct').value=s.ownerReservePct;$('sj5-emp-on').checked=s.employeePayrollEnabled;$('sj5-fed').value=s.employeeFederalWithholdingPct;$('sj5-er-on').checked=s.employerPayrollEnabled;$('sj5-twc-on').checked=s.twcEnabled;$('sj5-twc').value=s.twcPct;$('sj5-futa-on').checked=s.futaEnabled;$('sj5-futa').value=s.futaPct;$('sj5-tax-summary').textContent=taxSummary(s);
  }
  function close(which){$(which==='crew'?'sj5-crew-modal':'sj5-call-modal').classList.remove('open');}
  function openCall(id){editingCall=id||null;var c=id?state.calls.find(function(x){return x.id===id;}):null;c=c||{date:state.selectedDate,time:'08:00',address:'',description:'',hours:1,gross:0,status:'done'};$('sj5-call-date').value=c.date;$('sj5-call-time').value=c.time;$('sj5-call-address').value=c.address;$('sj5-call-desc').value=c.description;$('sj5-call-hours').value=c.hours;$('sj5-call-gross').value=c.gross;$('sj5-call-status').value=c.status;$('sj5-call-modal').classList.add('open');}
  function workerOptions(selected){return '<option value="__new__">+ New worker</option>'+state.workers.map(function(w){return '<option value="'+esc(w.id)+'"'+(w.id===selected?' selected':'')+'>'+esc(w.name)+'</option>';}).join('');}
  function syncNewWorker(){var n=$('sj5-worker-select').value==='__new__';$('sj5-new-worker-wrap').style.display=n?'':'none';}
  function openCrew(id){editingCrew=id||null;var w=id?state.crew.find(function(x){return x.id===id;}):null;w=w||{date:state.selectedDate,workerId:'',name:'Helper',payType:'hourly',rate:0,hours:8,payrollEnabled:true};$('sj5-crew-date').value=w.date;$('sj5-worker-select').innerHTML=workerOptions(w.workerId||'__new__');$('sj5-worker-select').value=w.workerId||'__new__';$('sj5-worker-name').value=w.name||'Helper';$('sj5-crew-type').value=w.payType;$('sj5-crew-rate').value=w.rate;$('sj5-crew-hours').value=w.hours;$('sj5-crew-payroll').checked=w.payrollEnabled;syncNewWorker();$('sj5-crew-modal').classList.add('open');}

  $('sj5-prev').onclick=function(){state.selectedDate=shiftPeriod(state.selectedDate,state.viewMode,-1);render();};
  $('sj5-next').onclick=function(){state.selectedDate=shiftPeriod(state.selectedDate,state.viewMode,1);render();};
  $('sj5-today').onclick=function(){state.selectedDate=todayISO();render();};
  $('sj5-date').onchange=function(){state.selectedDate=this.value||todayISO();render();};
  $('sj5-add-call').onclick=function(){openCall();};
  $('sj5-add-crew').onclick=function(){openCrew();};
  $('sj5-worker-select').onchange=syncNewWorker;
  $('sj5-tax-close').onclick=function(){var d=$('sj5-tax');d.open=false;d.scrollIntoView({block:'nearest'});};

  panel.onclick=function(e){
    var m=e.target.closest('[data-mode]');if(m){state.viewMode=m.getAttribute('data-mode');render();return;}
    var d=e.target.closest('[data-date]');if(d){state.selectedDate=d.getAttribute('data-date');state.viewMode='day';render();return;}
    var x=e.target.closest('[data-edit-call]');if(x){openCall(x.getAttribute('data-edit-call'));return;}
    x=e.target.closest('[data-del-call]');if(x){state.calls=state.calls.filter(function(c){return c.id!==x.getAttribute('data-del-call');});render();return;}
    x=e.target.closest('[data-edit-crew]');if(x){openCrew(x.getAttribute('data-edit-crew'));return;}
    x=e.target.closest('[data-del-crew]');if(x){state.crew=state.crew.filter(function(w){return w.id!==x.getAttribute('data-del-crew');});render();return;}
    x=e.target.closest('[data-close]');if(x)close(x.getAttribute('data-close'));
  };

  $('sj5-call-form').onsubmit=function(e){e.preventDefault();var c={id:editingCall||uid('call'),date:$('sj5-call-date').value||state.selectedDate,time:$('sj5-call-time').value||'08:00',address:$('sj5-call-address').value.trim(),description:$('sj5-call-desc').value.trim(),hours:num($('sj5-call-hours').value),gross:num($('sj5-call-gross').value),status:$('sj5-call-status').value};if(editingCall)state.calls=state.calls.map(function(x){return x.id===editingCall?c:x;});else state.calls.push(c);state.selectedDate=c.date;close('call');render();};
  $('sj5-crew-form').onsubmit=function(e){e.preventDefault();var workerId=$('sj5-worker-select').value,name;if(workerId==='__new__'){name=$('sj5-worker-name').value.trim()||'Helper';workerId=uid('worker');state.workers.push({id:workerId,name:name});}else{var wk=state.workers.find(function(w){return w.id===workerId;});name=wk?wk.name:'Helper';}var w={id:editingCrew||uid('crew'),workerId:workerId,date:$('sj5-crew-date').value||state.selectedDate,name:name,payType:$('sj5-crew-type').value==='daily'?'daily':'hourly',rate:num($('sj5-crew-rate').value),hours:num($('sj5-crew-hours').value),payrollEnabled:$('sj5-crew-payroll').checked};if(editingCrew)state.crew=state.crew.map(function(x){return x.id===editingCrew?w:x;});else state.crew.push(w);state.selectedDate=w.date;close('crew');render();};
  ['sj5-location','sj5-jurisdiction','sj5-owner-on','sj5-owner-pct','sj5-emp-on','sj5-fed','sj5-er-on','sj5-twc-on','sj5-twc','sj5-futa-on','sj5-futa'].forEach(function(id){$(id).onchange=function(){var s=state.settings;s.location=$('sj5-location').value.trim()||'Dripping Springs, TX';s.jurisdiction=$('sj5-jurisdiction').value.trim()||'TX';s.ownerReserveEnabled=$('sj5-owner-on').checked;s.ownerReservePct=pct($('sj5-owner-pct').value);s.employeePayrollEnabled=$('sj5-emp-on').checked;s.employeeFederalWithholdingPct=pct($('sj5-fed').value);s.employerPayrollEnabled=$('sj5-er-on').checked;s.twcEnabled=$('sj5-twc-on').checked;s.twcPct=pct($('sj5-twc').value);s.futaEnabled=$('sj5-futa-on').checked;s.futaPct=pct($('sj5-futa').value);render();};});
  render();
}

return {UI_VERSION:UI_VERSION,defaultState:defaultState,normalize:normalize,rangeBounds:rangeBounds,shiftPeriod:shiftPeriod,payrollLedger:payrollLedger,summarize:summarize,crewGross:crewGross,taxSummary:taxSummary,callCardHtml:callCardHtml,init:init};
});
