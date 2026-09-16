(function(){
'use strict';
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function num(v){var n=Number(v);return Number.isFinite(n)?n:null}
function money(v){var n=num(v);return n==null?'—':'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function btuh(v){var n=num(v);return n==null?'—':Math.round(n).toLocaleString('en-US')+' BTU/h'}
function addStyle(){if($('bruno-runtime-summary-style'))return;var s=document.createElement('style');s.id='bruno-runtime-summary-style';s.textContent=''
+'.brs{position:sticky;top:6px;z-index:40;margin:8px 0 10px;border:1px solid #34506d;border-radius:12px;background:rgba(13,21,30,.97);backdrop-filter:blur(8px);padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.28)}'
+'.brs-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.brs-card{border:1px solid #2d3b4d;border-radius:8px;background:#0f1720;padding:7px;min-width:0}.brs-card small{display:block;color:#8798ad;font-size:9px}.brs-card strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.brs-blockers{margin-top:7px;border-radius:8px;padding:7px;font-size:10px}.brs-blockers.ok{border:1px solid #286c59;color:#9ae6bf;background:#10231f}.brs-blockers.bad{border:1px solid #694242;color:#ffb1b1;background:#261516}.brs-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.brs-actions button{min-height:34px;background:#162334;color:#e7eef7;border:1px solid #38506a;border-radius:7px;padding:0 9px}'
+'#projectEstimatorWizard input,#projectEstimatorWizard select,#projectEstimatorWizard textarea{color-scheme:dark;background:#0f1720;color:#e7eef7;border-color:#33445a}'
+'.brs-collapsed>:not(h3):not(.brs-section-toggle){display:none!important}.brs-section-toggle{float:right;margin-left:8px;background:#162334;color:#dce8f5;border:1px solid #38506a;border-radius:6px;min-height:28px;padding:0 7px;font-size:10px}'
+'@media(max-width:760px){.brs{top:4px}.brs-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.brs-actions button{flex:1 1 30%}}@media(max-width:430px){.brs-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.brs-card strong{font-size:11px}}';document.head.appendChild(s)}
function sectionToggle(el){if(!el||el.dataset.brsReady==='1')return;var h=el.querySelector('h3');if(!h)return;el.dataset.brsReady='1';var b=document.createElement('button');b.type='button';b.className='brs-section-toggle';b.textContent='Collapse';b.addEventListener('click',function(){var c=el.classList.toggle('brs-collapsed');b.textContent=c?'Expand':'Collapse'});h.insertAdjacentElement('afterend',b)}
function prepareSections(){['pbs-building','pls-load','pes-equipment','pel-electrical','pmb-mechanical','pcp-pricing','pcg-gate'].forEach(function(id){sectionToggle($(id))})}
function ensure(){var host=$('projectEstimatorWizard');if(!host||$('bruno-runtime-summary'))return false;addStyle();var s=document.createElement('section');s.id='bruno-runtime-summary';s.className='brs';s.innerHTML='<div class="brs-grid">'
+'<div class="brs-card"><small>Cooling load</small><strong id="brs-load">—</strong></div>'
+'<div class="brs-card"><small>Selected capacity</small><strong id="brs-capacity">—</strong></div>'
+'<div class="brs-card"><small>Systems</small><strong id="brs-systems">—</strong></div>'
+'<div class="brs-card"><small>Customer materials</small><strong id="brs-customer">—</strong></div>'
+'<div class="brs-card"><small>Your cost</small><strong id="brs-your">—</strong></div>'
+'<div class="brs-card"><small>Blockers</small><strong id="brs-count">0</strong></div>'
+'</div><div id="brs-blockers" class="brs-blockers bad">Calculation chain is still initializing.</div><div class="brs-actions"><button type="button" data-brs-go="pbs-building">Building</button><button type="button" data-brs-go="pls-load">Load</button><button type="button" data-brs-go="pes-equipment">Equipment</button><button type="button" data-brs-go="pcp-pricing">Pricing</button><button type="button" data-brs-go="pcg-gate">Review</button></div>';
 var history=$('pew-history');if(history&&history.parentNode)history.parentNode.insertBefore(s,history.nextSibling);else host.insertBefore(s,host.firstChild);
 s.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-brs-go]');if(!b)return;var target=$(b.getAttribute('data-brs-go'));if(target){target.classList.remove('brs-collapsed');var t=target.querySelector('.brs-section-toggle');if(t)t.textContent='Collapse';target.scrollIntoView({behavior:'smooth',block:'start'})}});
 document.addEventListener('bruno:compliance-updated',render);
 document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);
 render();return true}
var timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(render,70)}
function render(){if(!$('bruno-runtime-summary'))return;prepareSections();var load=window.BrunoCurrentLoadResult||{},eq=window.BrunoCurrentEquipmentResult||{},price=window.BrunoCurrentPricedBOM||{},gate=window.BrunoCurrentComplianceGate||{};var finalEq=eq.final||{},tot=price.totals||{};var blockers=Array.isArray(gate.blockers)?gate.blockers.slice():[];
 $('brs-load').textContent=btuh(load.cooling_total_Btuh);$('brs-capacity').textContent=btuh(finalEq.capacityBtuh);$('brs-systems').textContent=finalEq.systemCount==null?'—':String(finalEq.systemCount);$('brs-customer').textContent=money(tot.customerMaterials);$('brs-your').textContent=money(tot.yourCost);$('brs-count').textContent=String(blockers.length);
 var box=$('brs-blockers');if(!blockers.length&&gate.status==='ready'){box.className='brs-blockers ok';box.textContent='READY · load → equipment → electrical → mechanical BOM → Catalog pricing chain is complete.'}else{box.className='brs-blockers bad';box.innerHTML='<strong>Action required:</strong> '+(blockers.length?esc(blockers.join(' · ')):esc(String(gate.status||'waiting for calculation chain')))} }
function init(){var tries=0;(function wait(){if(ensure())return;if(++tries<180)setTimeout(wait,100)})()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
