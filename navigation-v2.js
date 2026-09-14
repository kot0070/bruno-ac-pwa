(function(){
'use strict';
var GROUPS=[
  {id:'job',label:'Job',icon:'▣',tabs:[['quote','Quote'],['summary','Summary'],['cos','Change Orders']]},
  {id:'estimate',label:'Estimate',icon:'≡',tabs:[['materials','Materials'],['catalog','Catalog'],['labor','Labor & Equip'],['margins','Margins']]},
  {id:'tools',label:'AC Tools',icon:'⌁',tabs:[['__calculator','AC Calculator'],['reference','Reference']]},
  {id:'billing',label:'Billing',icon:'$',tabs:[['tm','T&M Invoice'],['pnl','Profit & Loss']]},
  {id:'more',label:'More',icon:'•••',tabs:[['dispatch','Dispatch'],['personnel','Workers'],['profiles','Company'],['help','Help']]}
];
var currentGroup='job';
var shell=null,subnav=null,bottom=null,sourceNav=null;
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function findGroupByTab(tab){for(var i=0;i<GROUPS.length;i++){for(var j=0;j<GROUPS[i].tabs.length;j++){if(GROUPS[i].tabs[j][0]===tab)return GROUPS[i]}}return GROUPS[0]}
function activeTab(){var b=sourceNav&&sourceNav.querySelector('.nav-tab.active');return b?b.getAttribute('data-tab'):'quote'}
function openTab(tab){
  if(tab==='__calculator'){window.location.href='./ac-calculator.html';return}
  var b=sourceNav&&sourceNav.querySelector('.nav-tab[data-tab="'+tab+'"]');
  if(b){b.click();setTimeout(syncFromSource,0)}
}
function setGroup(id,preferFirst){
  var g=GROUPS.filter(function(x){return x.id===id})[0]||GROUPS[0];
  currentGroup=g.id;
  renderGroups();renderBottom();renderSubnav(g);
  if(preferFirst){var first=g.tabs[0][0];if(first!=='__calculator')openTab(first)}
}
function renderGroups(){
  var host=shell.querySelector('.phase2-groups');
  host.innerHTML=GROUPS.map(function(g){return '<button type="button" class="phase2-group-btn'+(g.id===currentGroup?' active':'')+'" data-group="'+esc(g.id)+'">'+esc(g.label)+'</button>'}).join('')+'<span class="phase2-context" id="phase2-context"></span>';
}
function renderBottom(){
  bottom.innerHTML=GROUPS.map(function(g){return '<button type="button" class="phase2-bottom-btn'+(g.id===currentGroup?' active':'')+'" data-group="'+esc(g.id)+'"><span class="ico">'+esc(g.icon)+'</span><span>'+esc(g.label)+'</span></button>'}).join('');
}
function renderSubnav(g){
  var tab=activeTab();
  subnav.innerHTML=g.tabs.map(function(t){var id=t[0],label=t[1],isTool=id==='__calculator';return (isTool?'<a href="./ac-calculator.html"':'<button type="button"')+' class="phase2-sub-btn'+(id===tab?' active':'')+(isTool?' tool-link':'')+'" '+(isTool?'':'data-tab="'+esc(id)+'"')+'>'+esc(label)+(isTool?' ↗':'')+(isTool?'</a>':'</button>')}).join('');
  var ctx=document.getElementById('phase2-context');
  if(ctx){var match=g.tabs.filter(function(t){return t[0]===tab})[0];ctx.textContent=g.label+' · '+(match?match[1]:g.tabs[0][1])}
}
function syncFromSource(){
  var tab=activeTab();var g=findGroupByTab(tab);currentGroup=g.id;renderGroups();renderBottom();renderSubnav(g);
}
function bind(){
  shell.addEventListener('click',function(e){
    var gb=e.target.closest('[data-group]');if(gb&&shell.contains(gb)){setGroup(gb.getAttribute('data-group'),false);return}
    var tb=e.target.closest('[data-tab]');if(tb&&shell.contains(tb))openTab(tb.getAttribute('data-tab'));
  });
  bottom.addEventListener('click',function(e){var gb=e.target.closest('[data-group]');if(gb)setGroup(gb.getAttribute('data-group'),false)});
  if(sourceNav){new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){if(muts[i].type==='attributes'&&muts[i].attributeName==='class'){syncFromSource();break}}}).observe(sourceNav,{subtree:true,attributes:true,attributeFilter:['class']})}
}
function init(){
  sourceNav=document.getElementById('nav-tabs');if(!sourceNav)return;
  sourceNav.classList.add('phase2-source-nav');
  shell=document.createElement('nav');shell.className='phase2-nav-shell no-print';shell.setAttribute('aria-label','Bruno AC sections');shell.innerHTML='<div class="phase2-groups" aria-label="Primary sections"></div><div class="phase2-subnav" aria-label="Section tools"></div>';
  sourceNav.parentNode.insertBefore(shell,sourceNav.nextSibling);subnav=shell.querySelector('.phase2-subnav');
  bottom=document.createElement('nav');bottom.className='phase2-bottom-nav no-print';bottom.setAttribute('aria-label','Bruno AC mobile navigation');document.body.appendChild(bottom);
  currentGroup=findGroupByTab(activeTab()).id;
  renderGroups();renderBottom();renderSubnav(findGroupByTab(activeTab()));bind();document.body.classList.add('phase2-nav-ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
