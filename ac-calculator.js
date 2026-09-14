(function(){
'use strict';
var E=window.BrunoACCalculatorEngine;
var STORAGE_KEY='bruno-ac-v1';
var state=null, scope=null, bom=[], selectedByKey={};
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function money(n){return '$'+(Number(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function toast(t){var x=$('toast');x.textContent=t;x.classList.add('show');setTimeout(function(){x.classList.remove('show')},2800)}
function safeStateShape(s){return !!(s&&typeof s==='object'&&!Array.isArray(s)&&s.quote&&typeof s.quote==='object'&&Array.isArray(s.materialsUsed)&&Array.isArray(s.catalog))}
function loadState(){
  var raw=null, parsed=null;
  try{raw=localStorage.getItem(STORAGE_KEY)}catch(e){}
  if(!raw){state={quote:{hvac:{}},materialsUsed:[],catalog:[]};toast('No current Bruno job found — preview only until a job exists');}
  else {
    try{parsed=JSON.parse(raw)}catch(e){alert('Current Bruno AC job data could not be parsed. Calculator will NOT overwrite it. Open Bruno AC and restore/import a valid backup first.');state=null;renderLocked();return false;}
    if(!safeStateShape(parsed)){
      if(parsed&&parsed.quote&&typeof parsed.quote==='object'&&!parsed.scope&&!parsed.bom){
        if(!Array.isArray(parsed.materialsUsed))parsed.materialsUsed=[];
        if(!Array.isArray(parsed.catalog))parsed.catalog=[];
      }
    }
    if(!parsed||parsed.scope||parsed.bom||parsed.type==='ac-calculator-v1'||parsed.type==='ac-calculator-v2'||parsed.type==='ac-calculator-plan'){
      alert('Stored data does not look like a Bruno AC job. Calculator will not overwrite it.');state=null;renderLocked();return false;
    }
    state=parsed;
    if(!state.quote)state.quote={}; if(!state.quote.hvac)state.quote.hvac={};
    if(!Array.isArray(state.materialsUsed))state.materialsUsed=[];
    if(!Array.isArray(state.catalog))state.catalog=[];
  }
  syncFromJob();renderJobInfo();$('apply').disabled=false;return true;
}
function renderLocked(){var jb=$('jobbar');if(jb)jb.innerHTML='<span class="pill danger">Data safety lock — Bruno job not loaded</span>';$('apply').disabled=true;}
function syncFromJob(){
  if(!state)return;
  var h=(state.quote&&state.quote.hvac)||{},saved=(state.acCalculator&&state.acCalculator.inputs)||{};
  var src=Object.assign({},E.defaultInputs(),saved);
  if(h.systemType)src.systemType=h.systemType;if(h.jobKind)src.jobKind=h.jobKind;if(h.refrigerant)src.refrigerant=h.refrigerant;if(h.tonnageBtu)src.tonnage=h.tonnageBtu;if(h.haulAway)src.haulAway=String(h.haulAway).toLowerCase()==='yes';
  if(!state.acCalculator&&src.systemType==='mini-split'){src.thermostat=false;src.includeFilterDrier=false;}
  if(!state.acCalculator&&src.systemType==='package'){src.indoorLocation='other';}
  setInputs(src);applyModeDefaults(false);
}
function setInputs(i){
  ['sqft','systemType','jobKind','tonnage','refrigerant','indoorLocation','outdoorMount','lineSetFt','condensateFt','secondaryDrainFt','pumpSpaceClass','overflowProtection','ductMode','ductFt','supplyRegisters','returnGrilles','a2lRdsStatus','a2lOemPart','notes'].forEach(function(k){var el=$(k);if(el&&i[k]!=null)el.value=i[k]});
  ['condensatePump','overflowDamageRisk','thermostat','includeElectricalAccessories','includeFilterDrier','a2lFieldPartRequired','haulAway','permitAllowance','includeRepairInstallScope'].forEach(function(k){var el=$(k);if(el)el.checked=!!i[k]});
}
function readInputs(){
  var o={};
  ['sqft','systemType','jobKind','tonnage','refrigerant','indoorLocation','outdoorMount','lineSetFt','condensateFt','secondaryDrainFt','pumpSpaceClass','overflowProtection','ductMode','ductFt','supplyRegisters','returnGrilles','a2lRdsStatus','a2lOemPart','notes'].forEach(function(k){var el=$(k);o[k]=el?el.value:''});
  ['condensatePump','overflowDamageRisk','thermostat','includeElectricalAccessories','includeFilterDrier','a2lFieldPartRequired','haulAway','permitAllowance','includeRepairInstallScope'].forEach(function(k){var el=$(k);o[k]=!!(el&&el.checked)});
  return o;
}
function renderJobInfo(){
  if(!state)return renderLocked();var q=state.quote||{},h=q.hvac||{};
  var html='<span class="pill '+(state.catalog.length?'ok':'warn')+'">Catalog: '+state.catalog.length+' items</span><span class="pill">Job materials: '+state.materialsUsed.length+'</span>';
  if(q.customer)html+='<span class="pill">'+esc(q.customer)+'</span>';if(h.systemType)html+='<span class="pill">'+esc(h.systemType)+'</span>';if(h.tonnageBtu)html+='<span class="pill">'+esc(h.tonnageBtu)+'</span>';
  $('jobbar').innerHTML=html;
}
function stashSelections(){bom.forEach(function(b){selectedByKey[b.key]=b.selected!==false})}
function calculate(){
  if(!state)return;
  stashSelections();scope=E.buildScope(readInputs());bom=E.buildResolvedBom(state,scope);
  bom.forEach(function(b){if(Object.prototype.hasOwnProperty.call(selectedByKey,b.key))b.selected=selectedByKey[b.key]});
  renderBom();renderChecks();renderWarnings();updateModeUI();
}
function renderBom(){
  var html='';
  bom.forEach(function(b,idx){
    var flags=[];if(b.manualDuplicate)flags.push('<span class="flag warn">manual duplicate</span>');if(!b.resolved)flags.push('<span class="flag danger">needs review</span>');if(b.matchMode==='packaged-length')flags.push('<span class="flag">packaged length</span>');
    html+='<tr class="'+(!b.resolved?'row-unresolved':'')+'"><td class="sel"><label class="tapcheck"><input type="checkbox" class="bomsel" data-i="'+idx+'" '+(b.selected?'checked':'')+'><span></span></label></td><td><strong>'+esc(b.label)+'</strong>'+flags.join('')+'<div class="muted">'+esc(b.reason)+'</div><div class="mobile-detail">'+esc(b.note||'')+'</div></td><td class="col-level"><span class="status '+esc(b.level)+'">'+esc(b.level)+'</span></td><td class="num">'+esc(b.qty)+'</td><td>'+esc(b.units)+'</td><td class="col-match"><span class="'+(b.resolved?'resolved':'unresolved')+'">'+(b.resolved?'Catalog match':'Unresolved')+'</span><div>'+esc(b.item)+'</div><div class="muted">'+esc(b.part||'')+'</div><div class="muted">'+esc(b.note||'')+'</div></td><td class="num col-money">'+money(b.unitCost)+'</td><td class="num col-money">'+money((Number(b.qty)||0)*(Number(b.unitCost)||0))+'</td><td class="col-ref">'+esc(b.code||'')+'</td></tr>';
  });
  $('bomBody').innerHTML=html||'<tr><td colspan="9">No generated items.</td></tr>';updateTotals();
}
function updateTotals(){
  var selected=bom.filter(function(b){return b.selected!==false});var blocked=E.blockingRows(selected);
  $('statLines').textContent=selected.length;$('statResolved').textContent=selected.filter(function(b){return b.resolved}).length+'/'+selected.length;$('statCost').textContent=money(E.totalBomCost(selected));$('statWarnings').textContent=((scope&&scope.warnings)||[]).length;
  var gate=$('applyGate');if(gate){gate.textContent=blocked.length?(blocked.length+' selected item(s) need review / $0 confirmation before Apply'):'Ready to apply selected BOM';gate.className='gate '+(blocked.length?'warn':'ok')}
}
function renderChecks(){var arr=(scope&&scope.checks)||[];$('codeChecks').innerHTML=arr.map(function(c){return '<div class="codecard"><span class="status '+esc(c.level)+'">'+esc(c.status)+'</span><strong>'+esc(c.title)+'</strong><div>'+esc(c.detail)+'</div><div class="muted">'+esc(c.code)+'</div></div>'}).join('')||'<p class="muted">No checks.</p>'}
function renderWarnings(){var a=(scope&&scope.assumptions)||[],w=(scope&&scope.warnings)||[];$('assumptions').innerHTML=a.map(function(x){return '<li>'+esc(x)+'</li>'}).join('');$('warnings').innerHTML=w.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')||'<li>No current warnings.</li>'}
function applyToJob(){
  if(!state){alert('No valid Bruno AC job loaded.');return}if(!scope)calculate();
  bom.forEach(function(b,i){var cb=document.querySelector('.bomsel[data-i="'+i+'"]');if(cb)b.selected=cb.checked});
  var blocked=E.blockingRows(bom);
  if(blocked.length){var names=blocked.map(function(b){return '• '+b.label+' ('+(b.resolved?'$0':'unresolved')+')'}).join('\n');if(!confirm('These selected rows need manual review and may add $0 to the estimate:\n\n'+names+'\n\nPress OK only if you intentionally want to add them for later pricing.'))return;}
  var res=E.applyBomToJob(state,scope,bom);state=res.state;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));toast('Saved '+res.added.length+' generated lines to Bruno Job Materials');renderJobInfo()}catch(e){alert('Could not save Bruno job: '+e.message)}
}
function exportPlan(){if(!scope)calculate();var blob=new Blob([JSON.stringify({product:'bruno-ac',type:'ac-calculator-plan',version:2,scope:scope,bom:bom},null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='bruno-ac-calculator-plan-v2.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href)},1000)}
function applyModeDefaults(fromUser){
  var kind=$('jobKind').value,sys=$('systemType').value;
  if(kind==='repair'&&fromUser){$('includeRepairInstallScope').checked=false;$('lineSetFt').value=0;$('condensateFt').value=0;$('secondaryDrainFt').value=0;$('thermostat').checked=false;$('includeFilterDrier').checked=false;$('includeElectricalAccessories').checked=false;$('haulAway').checked=false;$('ductMode').value='existing';$('ductFt').value=0;}
  if(sys==='mini-split'&&fromUser){$('thermostat').checked=false;$('includeFilterDrier').checked=false;}
  if(sys==='package'&&fromUser){$('indoorLocation').value='other';}
  updateModeUI();
}
function updateModeUI(){
  var repair=$('jobKind').value==='repair';var pack=$('systemType').value==='package';
  $('repairScopeWrap').classList.toggle('attention',repair&&!$('includeRepairInstallScope').checked);
  $('indoorLocation').disabled=pack;
  $('packageHint').hidden=!pack;
  $('miniHint').hidden=$('systemType').value!=='mini-split';
}
function bind(){
  $('calculate').addEventListener('click',calculate);$('apply').addEventListener('click',applyToJob);$('reload').addEventListener('click',function(){selectedByKey={};if(loadState())calculate();toast('Reloaded current Bruno job')});$('exportPlan').addEventListener('click',exportPlan);
  $('bomBody').addEventListener('change',function(e){if(!e.target.classList.contains('bomsel'))return;var i=Number(e.target.getAttribute('data-i'));if(bom[i]){bom[i].selected=e.target.checked;selectedByKey[bom[i].key]=e.target.checked}updateTotals()});
  document.querySelectorAll('input,select,textarea').forEach(function(el){el.addEventListener('change',function(){if(el.id==='jobKind'||el.id==='systemType')applyModeDefaults(true);calculate()})});
}
if(loadState()){bind();calculate()}else{bind();}
})();
