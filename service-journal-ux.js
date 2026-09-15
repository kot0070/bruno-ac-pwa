(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports){module.exports=api;return;}
  if(root)root.BrunoServiceJournalUX=api;
  if(typeof document!=='undefined')api.init();
})(typeof self!=='undefined'?self:this,function(){
'use strict';

var STORAGE_KEY='bruno-ac-service-journal-v2';
var LEGACY_KEY='bruno-ac-v1';

function pad(n){return String(n).padStart(2,'0')}
function todayISO(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parseISO(s){var p=String(s||'').split('-');return p.length===3?new Date(+p[0],+p[1]-1,+p[2]):new Date()}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function shiftDate(s,n){var d=parseISO(s);d.setDate(d.getDate()+n);return iso(d)}
function money(n){n=Number(n);if(!isFinite(n))n=0;return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function uid(prefix){return (prefix||'id')+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function clampPct(v){v=Number(v);if(!isFinite(v))v=0;return Math.max(0,Math.min(100,v))}
function num(v){v=Number(v);return isFinite(v)&&v>=0?v:0}

function friendlyTaxSummary(code,label,effective){
  var parts=[];code=String(code||'').trim();label=String(label||'').trim();effective=String(effective||'').trim();
  if(code)parts.push(code);else if(label)parts.push(label);if(effective)parts.push('Effective '+effective);
  return parts.length?parts.join(' · '):'Tap to review rates';
}

function defaultState(){return {
  schemaVersion:2,
  selectedDate:todayISO(),
  viewMode:'day',
  settings:{
    location:'Dripping Springs, TX',
    jurisdiction:'TX',
    taxesEnabled:true,
    revenueTaxPct:7.65,
    helperTaxEnabled:true,
    helperTaxPct:7.65,
    note:'2026 default starts with employee FICA estimate (6.2% Social Security + 1.45% Medicare). Federal income-tax withholding is not auto-guessed.'
  },
  calls:[],
  crew:[]
}}

function normalize(s){
  if(!s||typeof s!=='object'||Array.isArray(s))s=defaultState();
  var d=defaultState();s.schemaVersion=2;s.selectedDate=s.selectedDate||d.selectedDate;s.viewMode=/^(day|week|month|quarter)$/.test(s.viewMode)?s.viewMode:'day';
  s.settings=s.settings&&typeof s.settings==='object'?s.settings:{};
  Object.keys(d.settings).forEach(function(k){if(s.settings[k]===undefined)s.settings[k]=d.settings[k]});
  s.settings.taxesEnabled=s.settings.taxesEnabled!==false;s.settings.helperTaxEnabled=s.settings.helperTaxEnabled!==false;
  s.settings.revenueTaxPct=clampPct(s.settings.revenueTaxPct);s.settings.helperTaxPct=clampPct(s.settings.helperTaxPct);
  if(!Array.isArray(s.calls))s.calls=[];if(!Array.isArray(s.crew))s.crew=[];
  s.calls=s.calls.map(function(c){c=c||{};return {id:c.id||uid('call'),date:c.date||s.selectedDate,time:c.time||'08:00',address:String(c.address||''),description:String(c.description||''),hours:num(c.hours),gross:num(c.gross!=null?c.gross:c.grossPay),taxPct:c.taxPct===''?'':(c.taxPct==null?'':clampPct(c.taxPct)),status:c.status||'done'}});
  s.crew=s.crew.map(function(w){w=w||{};return {id:w.id||uid('crew'),date:w.date||s.selectedDate,name:String(w.name||'Helper'),payType:w.payType==='daily'?'daily':'hourly',rate:num(w.rate),hours:num(w.hours),taxEnabled:w.taxEnabled!==false,taxPct:w.taxPct===''?'':(w.taxPct==null?'':clampPct(w.taxPct))}});
  return s;
}

function rangeBounds(date,mode){
  var d=parseISO(date),start=new Date(d),end=new Date(d);mode=mode||'day';
  if(mode==='week'){
    var dow=d.getDay(),diff=dow===0?-6:1-dow;start.setDate(d.getDate()+diff);end=new Date(start);end.setDate(start.getDate()+6);
  }else if(mode==='month'){
    start=new Date(d.getFullYear(),d.getMonth(),1);end=new Date(d.getFullYear(),d.getMonth()+1,0);
  }else if(mode==='quarter'){
    var qm=Math.floor(d.getMonth()/3)*3;start=new Date(d.getFullYear(),qm,1);end=new Date(d.getFullYear(),qm+3,0);
  }
  return {start:iso(start),end:iso(end)};
}
function inRange(date,b){return String(date)>=b.start&&String(date)<=b.end}
function revenueTaxPct(call,settings){if(!settings.taxesEnabled)return 0;return call.taxPct===''||call.taxPct==null?clampPct(settings.revenueTaxPct):clampPct(call.taxPct)}
function callNet(call,settings){var g=num(call.gross);return g*(1-revenueTaxPct(call,settings)/100)}
function crewGross(w){return w.payType==='daily'?num(w.rate):num(w.rate)*num(w.hours)}
function crewTaxPct(w,settings){if(!w.taxEnabled||!settings.helperTaxEnabled)return 0;return w.taxPct===''||w.taxPct==null?clampPct(settings.helperTaxPct):clampPct(w.taxPct)}
function crewTakeHome(w,settings){var g=crewGross(w);return g*(1-crewTaxPct(w,settings)/100)}
function summarize(state,bounds){
  state=normalize(state);bounds=bounds||rangeBounds(state.selectedDate,state.viewMode);
  var calls=state.calls.filter(function(c){return inRange(c.date,bounds)&&c.status!=='cancelled'});var crew=state.crew.filter(function(w){return inRange(w.date,bounds)});
  var gross=0,hours=0,revenueNet=0;calls.forEach(function(c){gross+=num(c.gross);hours+=num(c.hours);revenueNet+=callNet(c,state.settings)});
  var crewGrossTotal=0,crewNet=0;crew.forEach(function(w){crewGrossTotal+=crewGross(w);crewNet+=crewTakeHome(w,state.settings)});
  return {calls:calls.length,hours:hours,gross:gross,tax:gross-revenueNet,revenueNet:revenueNet,crewGross:crewGrossTotal,crewTakeHome:crewNet,netAfterCrew:revenueNet-crewGrossTotal};
}

function migrateLegacy(){
  var s=defaultState();
  try{
    var raw=localStorage.getItem(LEGACY_KEY);if(!raw)return s;var legacy=JSON.parse(raw)||{};var calls=legacy.dispatch&&Array.isArray(legacy.dispatch.calls)?legacy.dispatch.calls:[];
    if(legacy.dispatch&&legacy.dispatch.selectedDate)s.selectedDate=legacy.dispatch.selectedDate;
    s.calls=calls.map(function(c){return {id:c.id||uid('call'),date:c.date||s.selectedDate,time:c.time||'08:00',address:c.address||'',description:c.description||'',hours:num(c.hours),gross:num(c.grossPay),taxPct:c.taxPct==null?'':c.taxPct,status:c.status||'done'}});
  }catch(e){}
  return normalize(s);
}
function load(){try{var raw=localStorage.getItem(STORAGE_KEY);if(raw)return normalize(JSON.parse(raw))}catch(e){}var s=migrateLegacy();save(s);return s}
function save(s){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(normalize(s)))}catch(e){}}

function init(){
  function $(id){return document.getElementById(id)}
  var panel=$('panel-dispatch');if(!panel||panel.dataset.sjV2==='1')return;panel.dataset.sjV2='1';
  var state=load();var editingCallId=null,editingCrewId=null;

  var style=document.createElement('style');style.id='sj-v2-style';style.textContent=''
    +'.sj2{padding-bottom:1.1rem}.sj2 .panel-head{margin-bottom:.55rem}.sj2 .panel-head h2{font-size:1.35rem}.sj2-sub{color:var(--text-muted);font-size:.84rem}'
    +'.sj2-card{border:1px solid var(--border);border-radius:12px;background:var(--bg-elev);padding:.8rem;margin:.7rem 0}.sj2-card h3{margin:0 0 .55rem;color:var(--accent)}'
    +'.sj2-toolbar{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}.sj2-toolbar .field{margin:0}.sj2-date{min-width:160px;flex:1 1 190px}.sj2-date input{min-height:42px}'
    +'.sj2-mode{display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem;margin:.55rem 0}.sj2-mode button{min-height:38px}.sj2-mode button.active{border-color:var(--accent);box-shadow:inset 0 -2px 0 var(--accent);background:rgba(46,196,182,.12)}'
    +'.sj2-week{display:grid;grid-template-columns:repeat(7,1fr);gap:.3rem;margin-top:.5rem}.sj2-day{min-width:0;padding:.4rem .15rem;border:1px solid var(--border);border-radius:9px;background:var(--bg-card);color:inherit}.sj2-day.active{border-color:var(--accent);background:rgba(46,196,182,.13)}.sj2-day span{display:block}.sj2-day .wd{font-size:.62rem;color:var(--text-muted);text-transform:uppercase}.sj2-day .dn{font-size:.92rem;font-weight:800}.sj2-day .dm{font-size:.58rem;color:var(--accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    +'.sj2-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.45rem}.sj2-stat{min-width:0;padding:.55rem .6rem;border:1px solid var(--border);border-radius:9px;background:#111923}.sj2-stat .k{font-size:.6rem;color:var(--text-muted);text-transform:uppercase}.sj2-stat .v{font-size:.96rem;font-weight:800;margin-top:.1rem}.sj2-stat.net .v{color:var(--success)}.sj2-stat.negative .v{color:var(--danger)}'
    +'.sj2-section-head{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.55rem}.sj2-section-head h3{margin:0}.sj2-list{display:grid;gap:.45rem}.sj2-row{display:grid;grid-template-columns:auto 1fr auto;gap:.6rem;align-items:center;padding:.55rem .65rem;border:1px solid var(--border);border-radius:9px;background:#111923}.sj2-dot{width:9px;height:9px;border-radius:999px;background:var(--accent)}.sj2-row-main{min-width:0}.sj2-row-title{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sj2-row-meta{font-size:.72rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sj2-row-money{text-align:right;font-weight:800}.sj2-row-actions{display:flex;gap:.25rem;justify-content:flex-end;margin-top:.25rem}.sj2-empty{padding:.8rem;border:1px dashed var(--border);border-radius:9px;color:var(--text-muted);text-align:center}'
    +'.sj2-primary{width:100%;min-height:46px;font-size:.92rem}.sj2-tax{margin-top:.75rem;border:1px solid var(--border);border-radius:10px;background:#171f2a;overflow:hidden}.sj2-tax summary{cursor:pointer;list-style:none;padding:.65rem .75rem;font-weight:800;display:flex;justify-content:space-between;gap:.5rem}.sj2-tax summary::-webkit-details-marker{display:none}.sj2-tax-body{padding:.7rem;border-top:1px solid var(--border)}.sj2-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem}.sj2-check{display:flex;gap:.45rem;align-items:center;min-height:42px;padding:.45rem .55rem;border:1px solid var(--border);border-radius:8px;background:var(--bg-input)}.sj2-note{font-size:.72rem;color:var(--text-muted);margin:.55rem 0 0}'
    +'.sj2-modal{position:fixed;inset:0;z-index:900;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.58);padding:1rem}.sj2-modal.open{display:flex}.sj2-dialog{width:min(640px,100%);max-height:88vh;overflow:auto;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:.85rem;box-shadow:var(--shadow)}.sj2-dialog h3{margin:.1rem 0 .7rem}.sj2-dialog-actions{display:flex;gap:.45rem;justify-content:flex-end;margin-top:.75rem}.sj2-dialog .field input,.sj2-dialog .field select,.sj2-dialog .field textarea{min-height:42px}.sj2-dialog textarea{min-height:76px!important}'
    +'@media(max-width:720px){.sj2{padding:.85rem .65rem 1rem!important}.sj2 .panel-head h2{font-size:1.2rem}.sj2-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sj2-card{padding:.65rem}.sj2-row{grid-template-columns:auto minmax(0,1fr) auto;gap:.45rem;padding:.5rem}.sj2-row-title{font-size:.86rem}.sj2-row-meta{font-size:.66rem}.sj2-row-money{font-size:.86rem}.sj2-grid{grid-template-columns:1fr}.sj2-modal{padding:.5rem}.sj2-mode button{padding:.3rem .2rem!important;font-size:.7rem!important}.sj2-week{gap:.22rem}.sj2-day{padding:.35rem .08rem}}';document.head.appendChild(style);

  panel.className='panel sj2';
  panel.innerHTML=''
    +'<div class="panel-head"><div><h2>Service Call Journal</h2><div class="sj2-sub">Calendar · service calls · helpers · daily net · archive</div></div></div>'
    +'<section class="sj2-card"><h3>Calendar</h3><div class="sj2-toolbar"><button class="btn btn-sm" id="sj2-prev">←</button><div class="field sj2-date"><label>Date</label><input type="date" id="sj2-date"></div><button class="btn btn-sm" id="sj2-next">→</button><button class="btn btn-sm" id="sj2-today">Today</button></div><div class="sj2-mode"><button class="btn btn-sm" data-mode="day">Day</button><button class="btn btn-sm" data-mode="week">Week</button><button class="btn btn-sm" data-mode="month">Month</button><button class="btn btn-sm" data-mode="quarter">Quarter</button></div><div id="sj2-range-label" class="sj2-sub"></div><div class="sj2-week" id="sj2-week"></div></section>'
    +'<section class="sj2-card"><div class="sj2-section-head"><h3>Income</h3><span class="sj2-sub" id="sj2-income-scope"></span></div><div class="sj2-stats" id="sj2-stats"></div></section>'
    +'<section class="sj2-card"><div class="sj2-section-head"><h3>Helpers / Crew</h3><button class="btn btn-sm" id="sj2-add-crew">+ Add helper</button></div><div class="sj2-list" id="sj2-crew-list"></div></section>'
    +'<section class="sj2-card"><div class="sj2-section-head"><h3>Service Calls</h3><span class="sj2-sub">Saved calls stay compact</span></div><button class="btn btn-primary sj2-primary" id="sj2-add-call">+ Add Service Call</button><div class="sj2-list" id="sj2-call-list" style="margin-top:.55rem"></div></section>'
    +'<details class="sj2-tax" id="sj2-tax"><summary><span>⚙ One-time Tax Settings</span><span class="sj2-sub" id="sj2-tax-summary"></span></summary><div class="sj2-tax-body"><div class="sj2-grid"><div class="field"><label>Location</label><input id="sj2-location" type="text"></div><div class="field"><label>Jurisdiction</label><input id="sj2-jurisdiction" type="text"></div><label class="sj2-check"><input id="sj2-tax-enabled" type="checkbox"> Apply tax estimate to service-call revenue</label><div class="field"><label>Revenue tax estimate %</label><input id="sj2-revenue-tax" type="number" min="0" max="100" step="0.01"></div><label class="sj2-check"><input id="sj2-helper-tax-enabled" type="checkbox"> Calculate helper take-home after tax</label><div class="field"><label>Default helper tax %</label><input id="sj2-helper-tax" type="number" min="0" max="100" step="0.01"></div></div><p class="sj2-note">Texas / Dripping Springs default is 7.65% employee FICA estimate (6.2% Social Security + 1.45% Medicare), with Texas state/local individual income tax set to 0 in this simple journal estimate. Federal income-tax withholding depends on the worker and is not guessed here. You can change the percentage or switch tax calculation off.</p></div></details>'
    +'<div class="sj2-modal" id="sj2-call-modal" role="dialog" aria-modal="true"><form class="sj2-dialog" id="sj2-call-form"><h3 id="sj2-call-title">Add Service Call</h3><div class="sj2-grid"><div class="field"><label>Date</label><input id="sj2-call-date" type="date" required></div><div class="field"><label>Time</label><input id="sj2-call-time" type="time" required></div><div class="field" style="grid-column:1/-1"><label>Address</label><input id="sj2-call-address" type="text" placeholder="Job address"></div><div class="field" style="grid-column:1/-1"><label>Description</label><textarea id="sj2-call-desc" placeholder="What / who"></textarea></div><div class="field"><label>Hours</label><input id="sj2-call-hours" type="number" min="0" step="0.25"></div><div class="field"><label>Price / Gross $</label><input id="sj2-call-gross" type="number" min="0" step="0.01"></div><div class="field"><label>Tax % override</label><input id="sj2-call-tax" type="number" min="0" max="100" step="0.01" placeholder="Default"></div><div class="field"><label>Status</label><select id="sj2-call-status"><option value="done">Done</option><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option></select></div></div><div class="sj2-dialog-actions"><button type="button" class="btn" data-close="call">Cancel</button><button type="submit" class="btn btn-primary">Save Call</button></div></form></div>'
    +'<div class="sj2-modal" id="sj2-crew-modal" role="dialog" aria-modal="true"><form class="sj2-dialog" id="sj2-crew-form"><h3 id="sj2-crew-title">Add Helper</h3><div class="sj2-grid"><div class="field"><label>Date</label><input id="sj2-crew-date" type="date" required></div><div class="field"><label>Name</label><input id="sj2-crew-name" type="text" value="Helper" required></div><div class="field"><label>Pay type</label><select id="sj2-crew-type"><option value="hourly">Hourly</option><option value="daily">Fixed / day</option></select></div><div class="field"><label>Rate $</label><input id="sj2-crew-rate" type="number" min="0" step="0.01"></div><div class="field" id="sj2-crew-hours-wrap"><label>Hours</label><input id="sj2-crew-hours" type="number" min="0" step="0.25" value="8"></div><label class="sj2-check"><input id="sj2-crew-tax-enabled" type="checkbox" checked> Calculate take-home after tax</label><div class="field"><label>Tax % override</label><input id="sj2-crew-tax" type="number" min="0" max="100" step="0.01" placeholder="Default"></div></div><div class="sj2-dialog-actions"><button type="button" class="btn" data-close="crew">Cancel</button><button type="submit" class="btn btn-primary">Save Helper</button></div></form></div>';

  function rangeStep(){return state.viewMode==='day'?1:state.viewMode==='week'?7:state.viewMode==='month'?31:92}
  function callsForRange(b){return state.calls.filter(function(c){return inRange(c.date,b)}).sort(function(a,b){return (b.date+b.time).localeCompare(a.date+a.time)})}
  function crewForRange(b){return state.crew.filter(function(w){return inRange(w.date,b)}).sort(function(a,b){return b.date.localeCompare(a.date)})}
  function dayCallSummary(date){var gross=0,count=0;state.calls.forEach(function(c){if(c.date===date&&c.status!=='cancelled'){gross+=num(c.gross);count++}});return {count:count,gross:gross}}
  function weekStart(date){return rangeBounds(date,'week').start}
  function renderWeek(){var host=$('sj2-week'),start=weekStart(state.selectedDate),html='';for(var i=0;i<7;i++){var d=shiftDate(start,i),dt=parseISO(d),ds=dayCallSummary(d);html+='<button type="button" class="sj2-day'+(d===state.selectedDate?' active':'')+'" data-date="'+d+'"><span class="wd">'+dt.toLocaleDateString('en-US',{weekday:'short'})+'</span><span class="dn">'+dt.getDate()+'</span><span class="dm">'+(ds.count?ds.count+' · '+money(ds.gross):'—')+'</span></button>'}host.innerHTML=html}
  function renderStats(b){var s=summarize(state,b),host=$('sj2-stats');var stats=[['Calls',s.calls],['Hours',Math.round(s.hours*100)/100],['Gross',money(s.gross)],['Tax est.',money(s.tax)],['After tax',money(s.revenueNet)],['Crew gross',money(s.crewGross)],['Crew take-home',money(s.crewTakeHome)],['Net after crew',money(s.netAfterCrew)]];host.innerHTML=stats.map(function(x,i){return '<div class="sj2-stat'+(i===7?' net'+(s.netAfterCrew<0?' negative':''):'')+'"><div class="k">'+esc(x[0])+'</div><div class="v">'+esc(x[1])+'</div></div>'}).join('')}
  function renderCalls(b){var list=callsForRange(b),host=$('sj2-call-list');if(!list.length){host.innerHTML='<div class="sj2-empty">No service calls in this '+state.viewMode+' view.</div>';return}host.innerHTML=list.map(function(c){var net=callNet(c,state.settings);return '<div class="sj2-row" data-call="'+esc(c.id)+'"><span class="sj2-dot"></span><div class="sj2-row-main"><div class="sj2-row-title">'+esc(c.time||'—')+' · '+esc(c.address||'No address')+'</div><div class="sj2-row-meta">'+esc(c.date)+' · '+esc(c.hours)+' h · '+esc(c.description||c.status)+'</div><div class="sj2-row-actions"><button type="button" class="btn btn-sm" data-edit-call="'+esc(c.id)+'">Edit</button><button type="button" class="btn btn-sm btn-danger" data-del-call="'+esc(c.id)+'">×</button></div></div><div class="sj2-row-money">'+money(c.gross)+'<div class="sj2-row-meta">net '+money(net)+'</div></div></div>'}).join('')}
  function renderCrew(b){var list=crewForRange(b),host=$('sj2-crew-list');if(!list.length){host.innerHTML='<div class="sj2-empty">No helpers assigned. Add one and the payroll cost is counted even if there are no calls.</div>';return}host.innerHTML=list.map(function(w){var g=crewGross(w),take=crewTakeHome(w,state.settings);return '<div class="sj2-row"><span class="sj2-dot"></span><div class="sj2-row-main"><div class="sj2-row-title">'+esc(w.name)+' · '+(w.payType==='daily'?'fixed/day':'hourly')+'</div><div class="sj2-row-meta">'+esc(w.date)+' · '+(w.payType==='daily'?money(w.rate):esc(w.hours)+' h × '+money(w.rate))+'</div><div class="sj2-row-actions"><button type="button" class="btn btn-sm" data-edit-crew="'+esc(w.id)+'">Edit</button><button type="button" class="btn btn-sm btn-danger" data-del-crew="'+esc(w.id)+'">×</button></div></div><div class="sj2-row-money">cost '+money(g)+'<div class="sj2-row-meta">take-home '+money(take)+'</div></div></div>'}).join('')}
  function rangeLabel(b){if(state.viewMode==='day')return b.start;if(state.viewMode==='week')return 'Week · '+b.start+' → '+b.end;if(state.viewMode==='month')return parseISO(b.start).toLocaleDateString('en-US',{month:'long',year:'numeric'});var d=parseISO(b.start);return 'Q'+(Math.floor(d.getMonth()/3)+1)+' '+d.getFullYear()}
  function renderSettings(){var s=state.settings;$('sj2-location').value=s.location;$('sj2-jurisdiction').value=s.jurisdiction;$('sj2-tax-enabled').checked=s.taxesEnabled;$('sj2-revenue-tax').value=s.revenueTaxPct;$('sj2-helper-tax-enabled').checked=s.helperTaxEnabled;$('sj2-helper-tax').value=s.helperTaxPct;$('sj2-tax-summary').textContent=s.jurisdiction+' · '+s.revenueTaxPct.toFixed(2)+'%'}
  function render(){state=normalize(state);save(state);$('sj2-date').value=state.selectedDate;panel.querySelectorAll('[data-mode]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-mode')===state.viewMode)});var b=rangeBounds(state.selectedDate,state.viewMode);$('sj2-range-label').textContent=rangeLabel(b);$('sj2-income-scope').textContent=rangeLabel(b);renderWeek();renderStats(b);renderCrew(b);renderCalls(b);renderSettings()}

  function openCall(id){editingCallId=id||null;var c=id?state.calls.find(function(x){return x.id===id}):null;c=c||{date:state.selectedDate,time:'08:00',address:'',description:'',hours:1,gross:0,taxPct:'',status:'done'};$('sj2-call-title').textContent=id?'Edit Service Call':'Add Service Call';$('sj2-call-date').value=c.date;$('sj2-call-time').value=c.time;$('sj2-call-address').value=c.address;$('sj2-call-desc').value=c.description;$('sj2-call-hours').value=c.hours;$('sj2-call-gross').value=c.gross;$('sj2-call-tax').value=c.taxPct;$('sj2-call-status').value=c.status;$('sj2-call-modal').classList.add('open')}
  function openCrew(id){editingCrewId=id||null;var w=id?state.crew.find(function(x){return x.id===id}):null;w=w||{date:state.selectedDate,name:'Helper',payType:'hourly',rate:0,hours:8,taxEnabled:true,taxPct:''};$('sj2-crew-title').textContent=id?'Edit Helper':'Add Helper';$('sj2-crew-date').value=w.date;$('sj2-crew-name').value=w.name;$('sj2-crew-type').value=w.payType;$('sj2-crew-rate').value=w.rate;$('sj2-crew-hours').value=w.hours;$('sj2-crew-tax-enabled').checked=w.taxEnabled;$('sj2-crew-tax').value=w.taxPct;syncCrewHours();$('sj2-crew-modal').classList.add('open')}
  function closeModal(which){$(which==='crew'?'sj2-crew-modal':'sj2-call-modal').classList.remove('open')}
  function syncCrewHours(){$('sj2-crew-hours-wrap').style.display=$('sj2-crew-type').value==='daily'?'none':''}

  $('sj2-prev').addEventListener('click',function(){state.selectedDate=shiftDate(state.selectedDate,-rangeStep());render()});$('sj2-next').addEventListener('click',function(){state.selectedDate=shiftDate(state.selectedDate,rangeStep());render()});$('sj2-today').addEventListener('click',function(){state.selectedDate=todayISO();render()});$('sj2-date').addEventListener('change',function(){state.selectedDate=this.value||todayISO();render()});
  panel.addEventListener('click',function(e){var m=e.target.closest('[data-mode]');if(m){state.viewMode=m.getAttribute('data-mode');render();return}var day=e.target.closest('[data-date]');if(day){state.selectedDate=day.getAttribute('data-date');state.viewMode='day';render();return}var ec=e.target.closest('[data-edit-call]');if(ec){openCall(ec.getAttribute('data-edit-call'));return}var dc=e.target.closest('[data-del-call]');if(dc){if(confirm('Delete this service call?')){state.calls=state.calls.filter(function(c){return c.id!==dc.getAttribute('data-del-call')});render()}return}var ew=e.target.closest('[data-edit-crew]');if(ew){openCrew(ew.getAttribute('data-edit-crew'));return}var dw=e.target.closest('[data-del-crew]');if(dw){if(confirm('Delete this helper entry?')){state.crew=state.crew.filter(function(w){return w.id!==dw.getAttribute('data-del-crew')});render()}return}var cl=e.target.closest('[data-close]');if(cl){closeModal(cl.getAttribute('data-close'))}});
  $('sj2-add-call').addEventListener('click',function(){openCall(null)});$('sj2-add-crew').addEventListener('click',function(){openCrew(null)});$('sj2-crew-type').addEventListener('change',syncCrewHours);
  $('sj2-call-form').addEventListener('submit',function(e){e.preventDefault();var c={id:editingCallId||uid('call'),date:$('sj2-call-date').value||state.selectedDate,time:$('sj2-call-time').value||'08:00',address:$('sj2-call-address').value.trim(),description:$('sj2-call-desc').value.trim(),hours:num($('sj2-call-hours').value),gross:num($('sj2-call-gross').value),taxPct:$('sj2-call-tax').value===''?'':clampPct($('sj2-call-tax').value),status:$('sj2-call-status').value};if(editingCallId)state.calls=state.calls.map(function(x){return x.id===editingCallId?c:x});else state.calls.push(c);state.selectedDate=c.date;closeModal('call');render()});
  $('sj2-crew-form').addEventListener('submit',function(e){e.preventDefault();var w={id:editingCrewId||uid('crew'),date:$('sj2-crew-date').value||state.selectedDate,name:$('sj2-crew-name').value.trim()||'Helper',payType:$('sj2-crew-type').value==='daily'?'daily':'hourly',rate:num($('sj2-crew-rate').value),hours:num($('sj2-crew-hours').value),taxEnabled:$('sj2-crew-tax-enabled').checked,taxPct:$('sj2-crew-tax').value===''?'':clampPct($('sj2-crew-tax').value)};if(editingCrewId)state.crew=state.crew.map(function(x){return x.id===editingCrewId?w:x});else state.crew.push(w);state.selectedDate=w.date;closeModal('crew');render()});
  ['sj2-location','sj2-jurisdiction','sj2-tax-enabled','sj2-revenue-tax','sj2-helper-tax-enabled','sj2-helper-tax'].forEach(function(id){$(id).addEventListener('change',function(){state.settings.location=$('sj2-location').value.trim()||'Dripping Springs, TX';state.settings.jurisdiction=$('sj2-jurisdiction').value.trim()||'TX';state.settings.taxesEnabled=$('sj2-tax-enabled').checked;state.settings.revenueTaxPct=clampPct($('sj2-revenue-tax').value);state.settings.helperTaxEnabled=$('sj2-helper-tax-enabled').checked;state.settings.helperTaxPct=clampPct($('sj2-helper-tax').value);render()})});
  [$('sj2-call-modal'),$('sj2-crew-modal')].forEach(function(modal){modal.addEventListener('click',function(e){if(e.target===modal)modal.classList.remove('open')})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){$('sj2-call-modal').classList.remove('open');$('sj2-crew-modal').classList.remove('open')}});

  render();
}

return {friendlyTaxSummary:friendlyTaxSummary,defaultState:defaultState,normalize:normalize,rangeBounds:rangeBounds,summarize:summarize,callNet:callNet,crewGross:crewGross,crewTakeHome:crewTakeHome,init:init};
});