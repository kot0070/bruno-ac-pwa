(function(){
'use strict';
var KEY='bruno-ac-project-context-v1';
function type(){try{var x=JSON.parse(localStorage.getItem(KEY)||'{}');return x.type==='commercial'?'commercial':'residential'}catch(e){return 'residential'}}
function fieldWrap(doc,id){var e=doc.getElementById(id);return e&&e.closest?e.closest('.field'):null}
function addSingleSurfaceStyle(doc){
  if(!doc||doc.getElementById('bruno-single-surface-style'))return;
  var s=doc.createElement('style');s.id='bruno-single-surface-style';s.textContent=''
   +'.bruno-single-surface-grid[hidden]{display:grid!important}'
   +'.bruno-single-source-hidden{display:none!important}'
   +'.bruno-single-surface-grid{margin-top:12px}'
   +'.bruno-single-surface-grid>.card:first-child{border-color:#344a62}'
   +'.bruno-single-surface-grid>.card:first-child>h2{font-size:15px;margin-bottom:8px}'
   +'.bruno-single-surface-inline-note{margin:0 0 10px;padding:9px 10px;border:1px solid #344a62;border-radius:9px;background:#101923;color:var(--muted);font-size:12px}'
   +'.pew-one-surface #pew-open-full{display:none!important}'
   +'.pew-one-surface #pew-finish-step .pew-confirm-note{margin-top:8px}'
   +'@media(max-width:700px){.bruno-single-surface-grid{display:block!important}.bruno-single-surface-grid>.card{margin-bottom:10px}}';
  doc.head.appendChild(s);
}
function ignoreLegacyCapacity(doc){
  var tons=doc.getElementById('tonnage'),changed=false;
  if(tons&&tons.value){if(!tons.dataset.legacyCapacity)tons.dataset.legacyCapacity=tons.value;tons.value='';tons.dataset.legacyCapacityIgnored='1';changed=true;}
  doc.querySelectorAll('#jobbar .pill').forEach(function(p){if(/\bton\b|btu/i.test(String(p.textContent||'')))p.classList.add('bruno-single-source-hidden');});
  return changed;
}
function enforceOneSurface(doc){
  if(!doc)return;
  var wizard=doc.getElementById('projectEstimatorWizard'),grid=doc.querySelector('main.wrap .grid');
  if(!wizard||!grid)return;
  addSingleSurfaceStyle(doc);
  wizard.classList.add('pew-one-surface');
  grid.classList.add('bruno-single-surface-grid');
  if(grid.hidden)grid.hidden=false;
  ['sqft','systemType','indoorLocation','tonnage'].forEach(function(id){var w=fieldWrap(doc,id);if(w)w.classList.add('bruno-single-source-hidden');});
  var capacityChanged=ignoreLegacyCapacity(doc);
  var open=doc.getElementById('pew-open-full');if(open){open.hidden=true;open.setAttribute('aria-hidden','true');open.tabIndex=-1;}
  var sub=wizard.querySelector('.pew-sub');if(sub)sub.textContent='Project → Rooms / zones → Code & design → Technical details → BOM / price → Review';
  var notice=doc.querySelector('main.wrap>.notice');if(notice&&!notice.dataset.singleSurface){notice.dataset.singleSurface='1';notice.innerHTML='<strong>Live workflow:</strong> enter the project and building information once. Technical details, code/design checks, generated BOM and pricing update on this same calculator surface. Capacity will come from the load/equipment path; legacy demo tonnage is not used as a calculated result.';}
  var finish=doc.getElementById('pew-finish-step');
  if(finish){
    var strong=finish.querySelector('.pew-step-title strong'),small=finish.querySelector('.pew-step-title small');
    if(strong)strong.textContent='Technical details, BOM & review';
    if(small)small.textContent='Technical inputs and generated BOM stay on this same page. No second calculator is required.';
  }
  var first=grid.querySelector('.card');
  if(first){
    var h=first.querySelector('h2');if(h)h.textContent='Technical installation details';
    if(!first.querySelector('.bruno-single-surface-inline-note')){var n=doc.createElement('p');n.className='bruno-single-surface-inline-note';n.textContent='Project type, building area, system family and equipment location are controlled above. This section contains downstream field/installation details only. Capacity is not inherited from the demo job.';first.insertBefore(n,h?h.nextSibling:first.firstChild);}
  }
  if(capacityChanged&&!doc.documentElement.dataset.capacityRecalcQueued){doc.documentElement.dataset.capacityRecalcQueued='1';setTimeout(function(){var c=doc.getElementById('calculate');if(c)c.click();delete doc.documentElement.dataset.capacityRecalcQueued;},0);}
}
function guardDocument(doc){
  if(!doc)return;
  var commercial=type()==='commercial',notice=doc.querySelector('.notice'),banner=doc.getElementById('bruno-commercial-mode');
  if(commercial){
    if(!banner&&notice){banner=doc.createElement('div');banner.id='bruno-commercial-mode';banner.className='notice';banner.style.borderColor='#8b6b20';banner.style.background='#2a2414';banner.style.color='#ffe08a';banner.innerHTML='<strong>COMMERCIAL PROJECT MODE:</strong> residential IRC-derived checks are not commercial compliance authority. Verify adopted IMC/UMC/IFGC, applicable energy/fire requirements, local AHJ and OEM/design criteria. Apply remains fail-closed until the authoritative compliance gate is ready.';notice.parentNode.insertBefore(banner,notice.nextSibling);}
    doc.documentElement.classList.add('bruno-commercial-project');
  }else{
    if(banner)banner.remove();
    doc.documentElement.classList.remove('bruno-commercial-project');
  }
  enforceOneSurface(doc);
}
function apply(frame){if(frame){try{guardDocument(frame.contentDocument)}catch(e){}return}guardDocument(document)}
function bindFrame(frame){if(!frame||frame.dataset.projectModeBridge==='1')return;frame.dataset.projectModeBridge='1';frame.addEventListener('load',function(){setTimeout(function(){apply(frame)},0);setTimeout(function(){apply(frame)},250)});if(frame.dataset.loaded==='1')apply(frame)}
function scan(){guardDocument(document);document.querySelectorAll('.phase3-calculator-frame').forEach(bindFrame)}
function init(){
  scan();
  if(window.MutationObserver)new MutationObserver(function(){scan()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  window.addEventListener('storage',function(e){if(e.key===KEY)scan()});
  document.addEventListener('change',function(e){if(e.target&&(e.target.id==='phase3-project-type'||e.target.id==='pew-type'))setTimeout(scan,0)});
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#reload'))setTimeout(function(){if(ignoreLegacyCapacity(document)){var c=document.getElementById('calculate');if(c)c.click();}enforceOneSurface(document);},0)},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.BrunoProjectModeBridge={type:type,apply:apply,guardDocument:guardDocument,enforceOneSurface:enforceOneSurface,ignoreLegacyCapacity:ignoreLegacyCapacity};
})();
