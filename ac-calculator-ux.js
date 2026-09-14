(function(){
'use strict';
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function val(id){var e=$(id);return e?e.value:''}
var dirty=false;
var calculatedOnce=false;
var inputCard=null;
var resultCard=null;
var applyBtn=null;
var statusBox=null;

function addStyles(){
  var style=document.createElement('style');
  style.textContent=''
  +'.top #calculate,.top #apply{display:none!important}'
  +'.phase1-intro{margin:0 0 14px;color:var(--muted)}'
  +'.input-groups{display:grid;gap:10px}'
  +'.input-group{border:1px solid var(--line);border-radius:10px;background:#111922;overflow:hidden}'
  +'.input-group>summary{list-style:none;min-height:50px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;cursor:pointer;font-weight:800}'
  +'.input-group>summary::-webkit-details-marker{display:none}'
  +'.input-group>summary:after{content:"+";font-size:20px;color:var(--muted)}'
  +'.input-group[open]>summary:after{content:"−"}'
  +'.input-group .group-note{display:block;font-size:11px;color:var(--muted);font-weight:500;margin-top:2px}'
  +'.input-group-body{padding:0 12px 12px}'
  +'.input-group-body .fields{grid-template-columns:repeat(3,minmax(0,1fr))}'
  +'.input-group-body .checks{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:0}'
  +'.phase1-calcbar{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}'
  +'.phase1-calcbar .btn{width:100%;min-height:56px;font-size:17px}'
  +'.calc-state{margin-top:10px;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-weight:700}'
  +'.calc-state.dirty{border-color:#8b6b20;background:#2a2414;color:#ffe08a}'
  +'.calc-state.ready{border-color:#277b5c;background:#13241d;color:#9ae6bf}'
  +'.calc-state.initial{color:var(--muted);background:#111922}'
  +'.calc-explain{scroll-margin-top:16px;border-color:#385679;background:linear-gradient(180deg,#142235,#17202b)}'
  +'.calc-explain-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}'
  +'.calc-explain-box{border:1px solid var(--line);border-radius:9px;background:#101923;padding:11px}'
  +'.calc-explain-box .title{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:800;margin-bottom:5px}'
  +'.calc-explain-box strong{display:block;font-size:15px}'
  +'.calc-ref-list{margin:8px 0 0;padding-left:18px}'
  +'.calc-ref-list li{margin:5px 0}'
  +'.calc-flow{color:var(--muted);margin:0}'
  +'.calc-flow b{color:var(--text)}'
  +'.phase1-applybar{margin-top:14px;padding-top:14px;border-top:1px solid var(--line);display:grid;gap:8px}'
  +'.phase1-applybar .btn{width:100%;min-height:52px;font-size:16px}'
  +'.phase1-applyhint{color:var(--muted);font-size:12px;text-align:center}'
  +'.phase1-applyhint.warn{color:#ffe08a}'
  +'@media(max-width:900px){.input-group-body .fields{grid-template-columns:repeat(2,minmax(0,1fr))}}'
  +'@media(max-width:560px){.input-group-body .fields,.input-group-body .checks,.calc-explain-grid{grid-template-columns:1fr}.input-group>summary{min-height:54px}.phase1-calcbar .btn{min-height:58px}}';
  document.head.appendChild(style);
}

function fieldWrap(id){var e=$(id);return e?e.closest('.field'):null}
function checkWrap(id){var e=$(id);return e?e.closest('.check'):null}
function moveNodes(container,ids,kind){
  ids.forEach(function(id){var n=kind==='check'?checkWrap(id):fieldWrap(id);if(n)container.appendChild(n)});
}
function makeGroup(parent,title,note,fieldIds,checkIds,open){
  var d=document.createElement('details');d.className='input-group';if(open)d.open=true;
  var s=document.createElement('summary');s.innerHTML='<span>'+esc(title)+'<span class="group-note">'+esc(note||'')+'</span></span>';
  var body=document.createElement('div');body.className='input-group-body';
  var f=document.createElement('div');f.className='fields';body.appendChild(f);
  moveNodes(f,fieldIds||[],'field');
  if(checkIds&&checkIds.length){var c=document.createElement('div');c.className='checks';body.appendChild(c);moveNodes(c,checkIds,'check')}
  d.appendChild(s);d.appendChild(body);parent.appendChild(d);return d;
}

function groupInputs(){
  var fields=inputCard.querySelector('.fields');var checks=inputCard.querySelector('.checks');
  if(!fields||!checks)return;
  var holder=document.createElement('div');holder.className='input-groups';
  fields.parentNode.insertBefore(holder,fields);
  makeGroup(holder,'System','Job type, equipment family, capacity and refrigerant',['sqft','systemType','jobKind','tonnage','refrigerant'],[],true);
  makeGroup(holder,'Installation','Equipment location, support and refrigerant piping',['indoorLocation','outdoorMount','lineSetFt'],['thermostat','includeFilterDrier','includeElectricalAccessories','haulAway','permitAllowance','includeRepairInstallScope'],true);
  makeGroup(holder,'Condensate & drainage','Primary/secondary drainage, pump and overflow protection',['condensateFt','secondaryDrainFt','overflowProtection','pumpSpaceClass'],['overflowDamageRisk','condensatePump'],false);
  makeGroup(holder,'Ductwork','Existing/new duct scope and outlet takeoff',['ductMode','ductFt','supplyRegisters','returnGrilles'],[],false);
  makeGroup(holder,'A2L / OEM & notes','OEM mitigation status and job-specific notes',['a2lRdsStatus','a2lOemPart','notes'],['a2lFieldPartRequired'],false);
  if(fields.children.length===0)fields.remove();
  if(checks.children.length===0)checks.remove();
}

function setState(mode){
  if(!statusBox)return;
  statusBox.className='calc-state '+mode;
  if(mode==='dirty')statusBox.textContent='Inputs changed — press Calculate / Recalculate before adding materials to the job.';
  else if(mode==='ready')statusBox.textContent='Calculation is current. Review the result and BOM before adding materials to the job.';
  else statusBox.textContent='Fill in the project inputs, then press Calculate / Recalculate.';
  if(applyBtn)applyBtn.disabled=(mode!=='ready');
}
function markDirty(){dirty=true;setState('dirty');var explain=$('calcExplain');if(explain)explain.classList.add('stale-result')}

function makeWorkflow(){
  var oldIntro=inputCard.querySelector('.phase1-intro');if(!oldIntro){
    var intro=document.createElement('p');intro.className='phase1-intro';intro.textContent='Complete the relevant sections below. Optional sections can stay collapsed. Calculate only after the job inputs are ready.';
    inputCard.insertBefore(intro,inputCard.children[1]||null);
  }
  var calcbar=document.createElement('div');calcbar.className='phase1-calcbar';
  calcbar.innerHTML='<button type="button" class="btn primary" id="phase1Calculate">Calculate / Recalculate</button><div class="calc-state initial" id="phase1CalcState">Fill in the project inputs, then press Calculate / Recalculate.</div>';
  inputCard.appendChild(calcbar);statusBox=$('phase1CalcState');

  var explain=document.createElement('section');
  explain.id='calcExplain';explain.className='card calc-explain';
  explain.innerHTML='<h2>2 · Calculation result</h2><p class="calc-flow"><b>Inputs</b> → code/OEM checks → catalog-safe BOM matching → review → Job Materials.</p><div class="calc-explain-grid"><div class="calc-explain-box"><div class="title">Current scenario</div><strong id="calcScenario">Not calculated yet</strong><div class="muted" id="calcScenarioDetail"></div></div><div class="calc-explain-box"><div class="title">BOM result</div><strong id="calcBomInfo">—</strong><div class="muted" id="calcBomDetail">Press Calculate to generate the current result.</div></div><div class="calc-explain-box"><div class="title">Code / OEM checks</div><strong id="calcCodeCount">—</strong><div class="muted">Detailed checks remain below.</div></div></div><h3>Why / references used</h3><ul class="calc-ref-list" id="calcRefList"><li>Press Calculate to build the current scope and references.</li></ul>';
  inputCard.parentNode.insertBefore(explain,inputCard.nextSibling);resultCard=explain;

  var bomCard=null;document.querySelectorAll('.grid>.card').forEach(function(c){var h=c.querySelector('h2');if(h&&/Generated BOM/i.test(h.textContent))bomCard=c});
  if(bomCard){
    var ab=document.createElement('div');ab.className='phase1-applybar';
    ab.innerHTML='<button type="button" class="btn accent" id="phase1Apply">Add selected materials to Job</button><div class="phase1-applyhint" id="phase1ApplyHint">Calculate first, then review the BOM.</div>';
    bomCard.appendChild(ab);applyBtn=$('phase1Apply');applyBtn.disabled=true;
    applyBtn.addEventListener('click',function(){if(dirty||!calculatedOnce){alert('Inputs changed or have not been explicitly calculated. Press Calculate / Recalculate first.');return}var b=$('apply');if(b&&!b.disabled)b.click()});
  }

  $('phase1Calculate').addEventListener('click',function(){var b=$('calculate');if(b)b.click();dirty=false;calculatedOnce=true;setState('ready');render();setTimeout(function(){if(resultCard)resultCard.scrollIntoView({behavior:'smooth',block:'start'})},30)});
}

function bindDirtyState(){
  inputCard.addEventListener('input',function(e){if(e.target.matches('input,select,textarea'))markDirty()},true);
  inputCard.addEventListener('change',function(e){if(e.target.matches('input,select,textarea'))markDirty()},true);
  var mainApply=$('apply');
  if(mainApply){var ob=new MutationObserver(function(){if(!applyBtn)return;if(dirty||!calculatedOnce)applyBtn.disabled=true;else applyBtn.disabled=mainApply.disabled});ob.observe(mainApply,{attributes:true,attributeFilter:['disabled']})}
}

function render(){
  if(!$('calcScenario'))return;
  var sys=val('systemType')||'—',kind=val('jobKind')||'—',ref=val('refrigerant')||'—';
  $('calcScenario').textContent=sys+' · '+kind;
  $('calcScenarioDetail').textContent=ref+' · line set '+(val('lineSetFt')||'0')+' ft · condensate '+(val('condensateFt')||'0')+' ft';
  var rows=Array.prototype.slice.call(document.querySelectorAll('#bomBody tr')).filter(function(r){return r.querySelector('.bomsel')});
  var selected=document.querySelectorAll('#bomBody .bomsel:checked').length;var unresolved=document.querySelectorAll('#bomBody .row-unresolved').length;
  $('calcBomInfo').textContent=selected+' selected / '+rows.length+' generated';
  $('calcBomDetail').textContent=unresolved?unresolved+' row(s) need review before pricing':'No visible unresolved catalog rows';
  var cards=document.querySelectorAll('#codeChecks .codecard');$('calcCodeCount').textContent=cards.length+' active check'+(cards.length===1?'':'s');
  var refs=[],seen={};cards.forEach(function(c){var title=c.querySelector('strong');var muted=c.querySelector('.muted');var t=title?title.textContent.trim():'';var r=muted?muted.textContent.trim():'';var key=t+'|'+r;if((t||r)&&!seen[key]){seen[key]=1;refs.push('<li><strong>'+esc(t||'Check')+'</strong>'+(r?' — '+esc(r):'')+'</li>')}});
  if(!refs.length)refs.push('<li>No code/OEM checks are currently shown.</li>');$('calcRefList').innerHTML=refs.slice(0,8).join('');
  var hint=$('phase1ApplyHint');if(hint){if(dirty){hint.textContent='Inputs changed — recalculate before applying.';hint.className='phase1-applyhint warn'}else if(calculatedOnce){hint.textContent='Review selected BOM rows, then add them to the current Bruno job.';hint.className='phase1-applyhint'}else{hint.textContent='Calculate first, then review the BOM.';hint.className='phase1-applyhint'}}
}

function init(){
  inputCard=document.querySelector('.grid .card');if(!inputCard)return;
  addStyles();groupInputs();makeWorkflow();bindDirtyState();
  var oldInline=$('calculate-inline');if(oldInline&&oldInline.parentNode)oldInline.parentNode.remove();
  var code=$('codeChecks'),bom=$('bomBody');if(code)new MutationObserver(function(){if(calculatedOnce)render()}).observe(code,{childList:true,subtree:true});if(bom)new MutationObserver(function(){if(calculatedOnce)render()}).observe(bom,{childList:true,subtree:true});
  setState('initial');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
