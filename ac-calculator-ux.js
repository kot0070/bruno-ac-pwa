(function(){
'use strict';
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function val(id){var e=$(id);return e?e.value:''}
function init(){
  var inputCard=document.querySelector('.grid .card');
  if(!inputCard)return;
  var style=document.createElement('style');
  style.textContent='.calc-actionbar{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}.calc-actionbar .btn{font-size:16px;min-height:50px}.calc-explain{border-color:#385679;background:linear-gradient(180deg,#142235,#17202b)}.calc-explain-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.calc-explain-box{border:1px solid var(--line);border-radius:9px;background:#101923;padding:11px}.calc-explain-box .title{font-size:11px;color:var(--muted);text-transform:uppercase;font-weight:800;margin-bottom:5px}.calc-explain-box strong{display:block;font-size:15px}.calc-ref-list{margin:8px 0 0;padding-left:18px}.calc-ref-list li{margin:5px 0}.calc-flow{color:var(--muted);margin:0}.calc-flow b{color:var(--text)}@media(max-width:700px){.calc-explain-grid{grid-template-columns:1fr}.calc-actionbar{grid-template-columns:1fr}.calc-actionbar .btn{width:100%}}';
  document.head.appendChild(style);
  var bar=document.createElement('div');
  bar.className='calc-actionbar';
  bar.innerHTML='<button type="button" class="btn primary" id="calculate-inline">Calculate / Recalculate</button><button type="button" class="btn accent" id="apply-inline">Add / Update Job Materials</button>';
  inputCard.appendChild(bar);

  var explain=document.createElement('section');
  explain.className='card calc-explain';
  explain.innerHTML='<h2>2 · Calculation / Code basis</h2><p class="calc-flow"><b>Inputs</b> → rule checks → catalog-safe BOM matching → review → Job Materials. This block shows why the current result was generated.</p><div class="calc-explain-grid"><div class="calc-explain-box"><div class="title">Current scenario</div><strong id="calcScenario">—</strong><div class="muted" id="calcScenarioDetail"></div></div><div class="calc-explain-box"><div class="title">BOM result</div><strong id="calcBomInfo">—</strong><div class="muted" id="calcBomDetail"></div></div><div class="calc-explain-box"><div class="title">Code / OEM checks triggered</div><strong id="calcCodeCount">—</strong><div class="muted">Detailed checks remain below; this is the quick summary.</div></div></div><h3>Why / references used for this calculation</h3><ul class="calc-ref-list" id="calcRefList"><li>Press Calculate to build the current scope and references.</li></ul>';
  inputCard.parentNode.insertBefore(explain,inputCard.nextSibling);

  var calcBtn=$('calculate-inline'),applyBtn=$('apply-inline');
  if(calcBtn)calcBtn.addEventListener('click',function(){var b=$('calculate');if(b)b.click();setTimeout(render,0)});
  if(applyBtn)applyBtn.addEventListener('click',function(){var b=$('apply');if(b)b.click()});
  var mainApply=$('apply');if(mainApply){var ob=new MutationObserver(function(){if(applyBtn)applyBtn.disabled=mainApply.disabled});ob.observe(mainApply,{attributes:true,attributeFilter:['disabled']});applyBtn.disabled=mainApply.disabled;}
  var code=$('codeChecks'),bom=$('bomBody');
  if(code)new MutationObserver(render).observe(code,{childList:true,subtree:true});
  if(bom)new MutationObserver(render).observe(bom,{childList:true,subtree:true});
  document.addEventListener('change',function(){setTimeout(render,0)});
  render();
}
function render(){
  if(!$('calcScenario'))return;
  var sys=val('systemType')||'—',kind=val('jobKind')||'—',ref=val('refrigerant')||'—';
  $('calcScenario').textContent=sys+' · '+kind;
  $('calcScenarioDetail').textContent=ref+' · line set '+(val('lineSetFt')||'0')+' ft · condensate '+(val('condensateFt')||'0')+' ft';
  var rows=document.querySelectorAll('#bomBody tr');var selected=document.querySelectorAll('#bomBody .bomsel:checked').length;var unresolved=document.querySelectorAll('#bomBody .row-unresolved').length;
  $('calcBomInfo').textContent=selected+' selected / '+rows.length+' generated';
  $('calcBomDetail').textContent=unresolved?unresolved+' row(s) need review before pricing':'Catalog matching has no visible unresolved rows';
  var cards=document.querySelectorAll('#codeChecks .codecard');$('calcCodeCount').textContent=cards.length+' active check'+(cards.length===1?'':'s');
  var refs=[],seen={};
  cards.forEach(function(c){var title=c.querySelector('strong');var muted=c.querySelector('.muted');var t=(title?title.textContent.trim():'');var r=(muted?muted.textContent.trim():'');var key=t+'|'+r;if((t||r)&&!seen[key]){seen[key]=1;refs.push('<li><strong>'+esc(t||'Check')+'</strong>'+(r?' — '+esc(r):'')+'</li>')}});
  if(!refs.length)refs.push('<li>No code/OEM checks are currently shown. Press Calculate or review the selected scenario.</li>');
  $('calcRefList').innerHTML=refs.slice(0,8).join('');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
