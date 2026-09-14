(function(){
'use strict';
function $(id){return document.getElementById(id)}
function legacyTab(name){var b=document.querySelector('.nav-tab[data-tab="'+name+'"]');if(b)b.click()}
function activePanel(id){var p=$(id);return !!(p&&p.classList.contains('active'))}
function editingTarget(t){if(!t)return false;var tag=(t.tagName||'').toLowerCase();return tag==='input'||tag==='select'||tag==='textarea'||t.isContentEditable}

var matFilter=null,matZero=null,matCount=null,matObserver=null;
function materialRowText(tr){var out=[];tr.querySelectorAll('input,select,textarea').forEach(function(e){out.push(e.value||'')});out.push(tr.textContent||'');return out.join(' ').toLowerCase()}
function filterMaterials(){
  var body=$('mat-used-body');if(!body)return;
  var q=matFilter?matFilter.value.trim().toLowerCase():'';var zeroOnly=!!(matZero&&matZero.checked);var shown=0,total=0;
  body.querySelectorAll('tr[data-i]').forEach(function(tr){
    total++;var cost=tr.querySelector('.mat-cost');var price=cost?Number(cost.value)||0:0;var zero=price<=0;tr.classList.toggle('phase5-zero-price',zero);
    var ok=(!q||materialRowText(tr).indexOf(q)>=0)&&(!zeroOnly||zero);tr.style.display=ok?'':'none';if(ok)shown++;
  });
  if(matCount)matCount.textContent=(q||zeroOnly)?shown+' / '+total+' lines':total+' lines';
}
function setupMaterials(){
  var panel=$('panel-materials'),body=$('mat-used-body'),table=$('mat-used-table');if(!panel||!body||!table||$('phase5-mat-filter'))return;
  panel.classList.add('phase5-work-panel');
  var wrap=table.closest('.table-wrap');if(!wrap)return;
  var bar=document.createElement('div');bar.className='phase5-workbar';bar.id='phase5-mat-filter';
  bar.innerHTML='<div class="phase5-search"><span aria-hidden="true">⌕</span><input type="search" id="phase5-mat-search" placeholder="Filter this job: description, part, units, price…" aria-label="Filter job materials"></div><label class="phase5-toggle"><input type="checkbox" id="phase5-mat-zero"> $0 only</label><span class="phase5-count" id="phase5-mat-count"></span><div class="phase5-spacer"></div><button type="button" class="btn btn-sm" data-phase5-tab="catalog">Catalog</button><button type="button" class="btn btn-sm" data-phase5-tab="summary">Summary</button>';
  wrap.parentNode.insertBefore(bar,wrap);matFilter=$('phase5-mat-search');matZero=$('phase5-mat-zero');matCount=$('phase5-mat-count');
  matFilter.addEventListener('input',filterMaterials);matZero.addEventListener('change',filterMaterials);
  body.addEventListener('input',function(){requestAnimationFrame(filterMaterials)});
  matObserver=new MutationObserver(function(){requestAnimationFrame(filterMaterials)});matObserver.observe(body,{childList:true,subtree:false});
  filterMaterials();
}

function setupCatalog(){
  var panel=$('panel-catalog'),search=$('cat-search');if(!panel||!search||$('phase5-cat-links'))return;
  panel.classList.add('phase5-work-panel');
  var searchBar=search.closest('.search-bar');if(searchBar)searchBar.classList.add('phase5-catalog-search');
  var links=document.createElement('div');links.id='phase5-cat-links';links.className='phase5-panel-links';
  links.innerHTML='<span class="phase5-keyhint">/ focuses search</span><button type="button" class="btn btn-sm" data-phase5-tab="materials">Job Materials</button><button type="button" class="btn btn-sm" data-phase5-tab="summary">Summary</button>';
  var head=panel.querySelector('.panel-head');if(head)head.appendChild(links);
}

function setupSummary(){
  var panel=$('panel-summary'),oh=$('sum-oh'),final=$('sum-final');if(!panel||!oh||!final||panel.querySelector('.phase5-summary-layout'))return;
  panel.classList.add('phase5-work-panel','phase5-summary-panel');
  var controls=oh.closest('.grid');var table=$('sum-c-equip');table=table&&table.closest('.table-wrap');var stats=final.closest('.stat-row');
  if(controls&&table){var layout=document.createElement('div');layout.className='phase5-summary-layout';controls.parentNode.insertBefore(layout,controls);layout.appendChild(controls);layout.appendChild(table)}
  var finalStat=final.closest('.stat');if(finalStat)finalStat.classList.add('phase5-final-stat');
  var links=document.createElement('div');links.className='phase5-panel-links phase5-summary-links';links.innerHTML='<button type="button" class="btn btn-sm" data-phase5-tab="materials">Review Materials</button><button type="button" class="btn btn-sm" data-phase5-tab="labor">Review Labor & Equip</button><button type="button" class="btn btn-sm" data-phase5-tab="quote">Quote</button>';
  var head=panel.querySelector('.panel-head');if(head)head.appendChild(links);
  if(stats)stats.classList.add('phase5-summary-stats');
}

function bindGlobal(){
  document.addEventListener('click',function(e){var b=e.target.closest('[data-phase5-tab]');if(b){e.preventDefault();legacyTab(b.getAttribute('data-phase5-tab'))}});
  document.addEventListener('keydown',function(e){
    if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!editingTarget(e.target)){
      if(activePanel('panel-materials')&&matFilter){e.preventDefault();matFilter.focus();return}
      if(activePanel('panel-catalog')&&$('cat-search')){e.preventDefault();$('cat-search').focus();return}
    }
    if(e.key==='Escape'){
      if(activePanel('panel-materials')&&matFilter&&document.activeElement===matFilter&&matFilter.value){matFilter.value='';filterMaterials();return}
      var cs=$('cat-search');if(activePanel('panel-catalog')&&cs&&document.activeElement===cs&&cs.value){cs.value='';cs.dispatchEvent(new Event('input',{bubbles:true}))}
    }
  });
}
function init(){setupMaterials();setupCatalog();setupSummary();bindGlobal();document.body.classList.add('phase5-workspace-ready')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
