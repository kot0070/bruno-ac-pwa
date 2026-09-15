(function(){
'use strict';
function $(id){return document.getElementById(id)}
function legacyTab(name){var b=document.querySelector('.nav-tab[data-tab="'+name+'"]');if(b)b.click()}
function activePanel(id){var p=$(id);return !!(p&&p.classList.contains('active'))}
function editingTarget(t){if(!t)return false;var tag=(t.tagName||'').toLowerCase();return tag==='input'||tag==='select'||tag==='textarea'||t.isContentEditable}

var matFilter=null,matZero=null,matCount=null,matObserver=null,filterRaf=0;
function materialRowText(tr){
  var selectors=['.mat-item','.mat-part','.mat-units','.mat-cost'];var out=[];
  for(var i=0;i<selectors.length;i++){var e=tr.querySelector(selectors[i]);out.push(e&&e.value!=null?String(e.value):'')}
  return out.join(' ').toLowerCase();
}
function filterMaterials(){
  var body=$('mat-used-body');if(!body)return;
  var q=matFilter?matFilter.value.trim().toLowerCase():'';var zeroOnly=!!(matZero&&matZero.checked);var shown=0,total=0;
  body.querySelectorAll('tr[data-i]').forEach(function(tr){
    total++;var cost=tr.querySelector('.mat-cost');var price=cost?Number(cost.value)||0:0;var zero=price<=0;tr.classList.toggle('phase5-zero-price',zero);
    var ok=(!q||materialRowText(tr).indexOf(q)>=0)&&(!zeroOnly||zero);tr.style.display=ok?'':'none';if(ok)shown++;
  });
  if(matCount)matCount.textContent='Showing '+shown+' / '+total;
}
function scheduleMaterialFilter(){
  if(filterRaf)return;
  filterRaf=requestAnimationFrame(function(){filterRaf=0;filterMaterials()});
}
function setupMaterials(){
  var panel=$('panel-materials'),body=$('mat-used-body'),table=$('mat-used-table');if(!panel||!body||!table||$('phase5-mat-filter'))return;
  panel.classList.add('phase5-work-panel');
  var wrap=table.closest('.table-wrap');if(!wrap)return;
  var bar=document.createElement('div');bar.className='phase5-workbar';bar.id='phase5-mat-filter';
  bar.innerHTML='<div class="phase5-search"><span aria-hidden="true">⌕</span><input type="search" id="phase5-mat-search" placeholder="Filter this job: description, part, units, price…" aria-label="Filter job materials"></div><label class="phase5-toggle"><input type="checkbox" id="phase5-mat-zero"> $0 only</label><span class="phase5-count" id="phase5-mat-count"></span><div class="phase5-spacer"></div><button type="button" class="btn btn-sm" data-phase5-tab="catalog">Catalog</button><button type="button" class="btn btn-sm" data-phase5-tab="summary">Summary</button>';
  wrap.parentNode.insertBefore(bar,wrap);matFilter=$('phase5-mat-search');matZero=$('phase5-mat-zero');matCount=$('phase5-mat-count');
  matFilter.addEventListener('input',scheduleMaterialFilter);matZero.addEventListener('change',scheduleMaterialFilter);
  body.addEventListener('input',scheduleMaterialFilter);
  matObserver=new MutationObserver(scheduleMaterialFilter);matObserver.observe(body,{childList:true,subtree:false});
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

function loadServiceJournalUX(){
  if(window.BrunoServiceJournalUX){window.BrunoServiceJournalUX.init();return}
  if(document.querySelector('script[data-service-journal-ux]'))return;
  var s=document.createElement('script');
  s.src='./service-journal-ux.js';
  s.async=false;
  s.setAttribute('data-service-journal-ux','1');
  document.head.appendChild(s);
}

function loadCodeLibraryUX(){
  function loadUX(){
    if(window.BrunoCodeLibraryUX){window.BrunoCodeLibraryUX.init();return}
    if(document.querySelector('script[data-code-library-ux]'))return;
    var ux=document.createElement('script');ux.src='./code-library-ux.js';ux.async=false;ux.setAttribute('data-code-library-ux','1');document.head.appendChild(ux);
  }
  if(window.BrunoCodeRuleRegistry){loadUX();return}
  if(document.querySelector('script[data-code-rule-registry]'))return;
  var core=document.createElement('script');core.src='./code-rule-registry.js';core.async=false;core.setAttribute('data-code-rule-registry','1');core.addEventListener('load',loadUX);document.head.appendChild(core);
}

function makeActionMenu(label,accent){
  var d=document.createElement('details');d.className='workspace-action-menu';
  d.innerHTML='<summary class="btn btn-sm'+(accent?' btn-accent':'')+'">'+label+'</summary><div class="workspace-action-popover"></div>';
  return d;
}
function setupCompactHeader(){
  var host=document.querySelector('.header-actions');if(!host||host.dataset.workspaceCompact==='1')return;
  var printQuote=$('btn-print-quote'),printInvoice=$('btn-print-tm'),reset=$('btn-reset'),blank=$('btn-blank'),exportJob=$('btn-export'),exportApp=$('btn-export-app');
  var importJob=$('btn-import'),importApp=$('btn-import-app');var importJobLabel=importJob&&importJob.closest('label'),importAppLabel=importApp&&importApp.closest('label');
  if(!printQuote||!printInvoice||!reset)return;
  var printMenu=makeActionMenu('Print',true),otherMenu=makeActionMenu('Other',false);var pp=printMenu.querySelector('.workspace-action-popover'),op=otherMenu.querySelector('.workspace-action-popover');
  printQuote.textContent='Print Quote';printInvoice.textContent='Print Invoice';printQuote.classList.remove('btn-accent');pp.appendChild(printQuote);pp.appendChild(printInvoice);
  [exportJob,importJobLabel,exportApp,importAppLabel,blank].forEach(function(n){if(n)op.appendChild(n)});
  var prefs=document.createElement('div');prefs.className='workspace-other-prefs';prefs.innerHTML='<div class="workspace-other-label">Display</div><button type="button" class="btn btn-sm" data-workspace-pref="theme">Theme</button><button type="button" class="btn btn-sm" data-workspace-pref="zoom-out">Zoom −</button><button type="button" class="btn btn-sm" data-workspace-pref="zoom-in">Zoom +</button>';op.appendChild(prefs);
  reset.textContent='Reset';reset.title='Reset demo';
  var frag=document.createDocumentFragment();frag.appendChild(printMenu);frag.appendChild(reset);frag.appendChild(otherMenu);host.replaceChildren(frag);host.dataset.workspaceCompact='1';
  var floating=$('ui-prefs');if(floating)floating.classList.add('workspace-prefs-hidden');
  host.addEventListener('click',function(e){var pref=e.target.closest('[data-workspace-pref]');if(pref){e.preventDefault();var id=pref.getAttribute('data-workspace-pref'),target=id==='theme'?$('ui-prefs-theme'):id==='zoom-out'?$('ui-prefs-zoom-out'):$('ui-prefs-zoom-in');if(target)target.click();return}var action=e.target.closest('.workspace-action-popover .btn,.workspace-action-popover label.btn');if(action&&!action.querySelector('input[type=file]'))setTimeout(function(){printMenu.open=false;otherMenu.open=false},0)});
  document.addEventListener('pointerdown',function(e){if(!host.contains(e.target)){printMenu.open=false;otherMenu.open=false}},true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){printMenu.open=false;otherMenu.open=false}});
}

var totalsVisibleState=null;
function activeWorkspaceTab(){if(activePanel('panel-calculator'))return '__calculator';var b=document.querySelector('#nav-tabs .nav-tab.active');return b?b.getAttribute('data-tab'):''}
function syncContextualTotals(){
  var live=$('live-totals');if(!live)return;var tab=activeWorkspaceTab();var relevant={quote:1,materials:1,margins:1,labor:1,summary:1,cos:1};var show=!!relevant[tab];
  live.classList.toggle('workspace-totals-visible',show);live.setAttribute('aria-hidden',show?'false':'true');
  if(totalsVisibleState!==show){totalsVisibleState=show;requestAnimationFrame(function(){try{window.dispatchEvent(new Event('resize'))}catch(e){}})}
}
function setupContextualTotals(){
  syncContextualTotals();var nav=$('nav-tabs');if(nav&&window.MutationObserver){new MutationObserver(function(){syncContextualTotals()}).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']})}
  document.addEventListener('click',function(){setTimeout(syncContextualTotals,0)});
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
function init(){setupMaterials();setupCatalog();setupSummary();setupCompactHeader();setupContextualTotals();bindGlobal();loadServiceJournalUX();loadCodeLibraryUX();document.body.classList.add('phase5-workspace-ready')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
