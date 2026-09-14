(function(){
'use strict';
var GROUPS=[
  {id:'job',label:'Job',icon:'▣',defaultTab:'quote',tabs:[['quote','Quote'],['summary','Summary'],['cos','Change Orders']]},
  {id:'estimate',label:'Estimate',icon:'≡',defaultTab:'materials',tabs:[['materials','Materials'],['catalog','Catalog'],['labor','Labor & Equip'],['margins','Margins']]},
  {id:'tools',label:'AC Tools',icon:'⌁',defaultTab:'__calculator',tabs:[['__calculator','AC Calculator'],['reference','Reference']]},
  {id:'billing',label:'Billing',icon:'$',defaultTab:'tm',tabs:[['tm','T&M Invoice'],['pnl','Profit & Loss']]},
  {id:'more',label:'More',icon:'•••',defaultTab:'dispatch',tabs:[['dispatch','Dispatch'],['personnel','Workers'],['profiles','Company'],['help','Help']]}
];
var currentGroup='job';
var shell=null,subnav=null,bottom=null,sourceNav=null,resizeObserver=null;
var calculatorPanel=null,calculatorFrame=null,calculatorActive=false,frameResizeObserver=null;
var lastByGroup={job:'quote',estimate:'materials',tools:'__calculator',billing:'tm',more:'dispatch'};
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function getGroup(id){return GROUPS.filter(function(x){return x.id===id})[0]||GROUPS[0]}
function findGroupByTab(tab){for(var i=0;i<GROUPS.length;i++){for(var j=0;j<GROUPS[i].tabs.length;j++){if(GROUPS[i].tabs[j][0]===tab)return GROUPS[i]}}return GROUPS[0]}
function sourceActiveTab(){var b=sourceNav&&sourceNav.querySelector('.nav-tab.active');return b?b.getAttribute('data-tab'):'quote'}
function activeTab(){return calculatorActive?'__calculator':sourceActiveTab()}
function ensureCalculatorPanel(){
  if(calculatorPanel)return calculatorPanel;
  var main=document.querySelector('main');if(!main)return null;
  calculatorPanel=document.createElement('section');calculatorPanel.id='panel-calculator';calculatorPanel.className='panel phase3-calculator-panel';calculatorPanel.setAttribute('aria-label','AC Calculator');
  calculatorPanel.innerHTML='<div class="phase3-calculator-head"><div><h2>AC Calculator</h2><p>Code-aware scope and BOM for the current Bruno job.</p></div><button type="button" class="btn btn-sm" id="phase3-open-standalone">Open standalone</button></div><iframe class="phase3-calculator-frame" title="Bruno AC Code and BOM Calculator" src="./ac-calculator.html"></iframe>';
  main.appendChild(calculatorPanel);calculatorFrame=calculatorPanel.querySelector('iframe');
  var standalone=calculatorPanel.querySelector('#phase3-open-standalone');if(standalone)standalone.addEventListener('click',function(){window.location.href='./ac-calculator.html'});
  calculatorFrame.addEventListener('load',function(){calculatorFrame.dataset.loaded='1';prepareEmbeddedCalculator()});
  return calculatorPanel;
}
function prepareEmbeddedCalculator(){
  if(!calculatorFrame)return;
  try{
    var doc=calculatorFrame.contentDocument;if(!doc)return;
    doc.documentElement.classList.add('bruno-embedded-calculator');
    var old=doc.getElementById('bruno-phase3-embed-style');if(old)old.remove();
    var style=doc.createElement('style');style.id='bruno-phase3-embed-style';style.textContent=''
      +'.bruno-embedded-calculator .top,.bruno-embedded-calculator .foot{display:none!important}'
      +'.bruno-embedded-calculator body{background:transparent!important}'
      +'.bruno-embedded-calculator .wrap{max-width:none!important;padding:0 4px 16px!important}'
      +'.bruno-embedded-calculator .notice{margin-top:0}'
      +'.bruno-embedded-calculator .grid{gap:12px}'
      +'.bruno-embedded-calculator .card{box-shadow:none}'
      +'@media(min-width:1180px){'
      +'.bruno-embedded-calculator .grid{grid-template-columns:minmax(400px,.86fr) minmax(520px,1.14fr);align-items:start}'
      +'.bruno-embedded-calculator .grid>.card:nth-child(n+3){grid-column:1/-1}'
      +'.bruno-embedded-calculator .grid>.card{margin-bottom:0}'
      +'.bruno-embedded-calculator .input-groups{gap:8px}'
      +'.bruno-embedded-calculator .input-group>summary{min-height:46px;padding:8px 10px}'
      +'.bruno-embedded-calculator .input-group-body{padding:0 10px 10px}'
      +'}';doc.head.appendChild(style);
    function fit(){try{var h=Math.max(760,doc.body.scrollHeight,doc.documentElement.scrollHeight);calculatorFrame.style.height=h+'px'}catch(e){}}
    fit();setTimeout(fit,100);setTimeout(fit,500);
    if(frameResizeObserver)try{frameResizeObserver.disconnect()}catch(e2){}
    if('ResizeObserver' in window){frameResizeObserver=new ResizeObserver(function(){requestAnimationFrame(fit)});frameResizeObserver.observe(doc.documentElement)}
  }catch(e){}
}
function showCalculatorPanel(){
  var existed=!!calculatorPanel;var p=ensureCalculatorPanel();if(!p)return;
  calculatorActive=true;currentGroup='tools';lastByGroup.tools='__calculator';
  var panels=document.querySelectorAll('.panel');for(var i=0;i<panels.length;i++)panels[i].classList.remove('active');p.classList.add('active');
  renderGroups();renderBottom();renderSubnav(getGroup('tools'));schedulePhase2NavMeasure();
  if(existed&&calculatorFrame&&calculatorFrame.dataset.loaded==='1'){try{calculatorFrame.contentWindow.location.reload()}catch(e){}}
}
function hideCalculatorPanel(){calculatorActive=false;if(calculatorPanel)calculatorPanel.classList.remove('active')}
function openTab(tab){if(tab==='__calculator'){showCalculatorPanel();return}hideCalculatorPanel();var b=sourceNav&&sourceNav.querySelector('.nav-tab[data-tab="'+tab+'"]');if(b){b.click();setTimeout(syncFromSource,0)}}
function setGroup(id,openPreferred){var g=getGroup(id);currentGroup=g.id;renderGroups();renderBottom();renderSubnav(g);if(openPreferred)openTab(lastByGroup[g.id]||g.defaultTab)}
function renderGroups(){var host=shell.querySelector('.phase2-groups');host.innerHTML=GROUPS.map(function(g){var active=g.id===currentGroup;return '<button type="button" class="phase2-group-btn'+(active?' active':'')+'" data-group="'+esc(g.id)+'" aria-pressed="'+(active?'true':'false')+'"'+(active?' aria-current="page"':'')+'>'+esc(g.label)+'</button>'}).join('')+'<span class="phase2-context" id="phase2-context"></span>'}
function renderBottom(){bottom.innerHTML=GROUPS.map(function(g){var active=g.id===currentGroup;return '<button type="button" class="phase2-bottom-btn'+(active?' active':'')+'" data-group="'+esc(g.id)+'" aria-pressed="'+(active?'true':'false')+'"'+(active?' aria-current="page"':'')+'><span class="ico">'+esc(g.icon)+'</span><span>'+esc(g.label)+'</span></button>'}).join('')}
function renderSubnav(g){var tab=activeTab();subnav.innerHTML=g.tabs.map(function(t){var id=t[0],label=t[1],active=id===tab;return '<button type="button" class="phase2-sub-btn'+(active?' active':'')+'" data-tab="'+esc(id)+'"'+(active?' aria-current="page"':'')+'>'+esc(label)+'</button>'}).join('');var ctx=document.getElementById('phase2-context');if(ctx){var match=g.tabs.filter(function(t){return t[0]===tab})[0];ctx.textContent=g.label+' · '+(match?match[1]:(lastByGroup[g.id]||g.defaultTab))}schedulePhase2NavMeasure()}
function syncFromSource(){calculatorActive=false;var tab=sourceActiveTab();var g=findGroupByTab(tab);currentGroup=g.id;lastByGroup[g.id]=tab;renderGroups();renderBottom();renderSubnav(g)}
function syncPhase2NavHeight(){if(!shell)return;var navH=window.innerWidth>=768?Math.round(shell.getBoundingClientRect().height):0;document.documentElement.style.setProperty('--phase2-nav-h',navH+'px')}
function schedulePhase2NavMeasure(){requestAnimationFrame(syncPhase2NavHeight);setTimeout(syncPhase2NavHeight,80);setTimeout(syncPhase2NavHeight,360)}
function bind(){
  shell.addEventListener('click',function(e){var gb=e.target.closest('[data-group]');if(gb&&shell.contains(gb)){setGroup(gb.getAttribute('data-group'),true);return}var tb=e.target.closest('[data-tab]');if(tb&&shell.contains(tb))openTab(tb.getAttribute('data-tab'))});
  bottom.addEventListener('click',function(e){var gb=e.target.closest('[data-group]');if(gb)setGroup(gb.getAttribute('data-group'),true)});
  if(sourceNav)new MutationObserver(function(muts){for(var i=0;i<muts.length;i++){if(muts[i].type==='attributes'&&muts[i].attributeName==='class'){syncFromSource();break}}}).observe(sourceNav,{subtree:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',function(){requestAnimationFrame(syncPhase2NavHeight)});
  window.addEventListener('storage',function(e){if(calculatorActive&&e.key==='bruno-ac-v1'){try{sessionStorage.setItem('bruno-phase3-after-apply','materials')}catch(x){}window.location.reload()}});
  if('ResizeObserver' in window){resizeObserver=new ResizeObserver(function(){requestAnimationFrame(syncPhase2NavHeight)});resizeObserver.observe(shell)}
}
function init(){
  sourceNav=document.getElementById('nav-tabs');if(!sourceNav)return;sourceNav.classList.add('phase2-source-nav');
  shell=document.createElement('nav');shell.className='phase2-nav-shell no-print';shell.setAttribute('aria-label','Bruno AC sections');shell.innerHTML='<div class="phase2-groups" aria-label="Primary sections"></div><div class="phase2-subnav" aria-label="Section tools"></div>';sourceNav.parentNode.insertBefore(shell,sourceNav.nextSibling);subnav=shell.querySelector('.phase2-subnav');
  bottom=document.createElement('nav');bottom.className='phase2-bottom-nav no-print';bottom.setAttribute('aria-label','Bruno AC mobile navigation');document.body.appendChild(bottom);
  var initial=sourceActiveTab(),initialGroup=findGroupByTab(initial);currentGroup=initialGroup.id;lastByGroup[initialGroup.id]=initial;renderGroups();renderBottom();renderSubnav(initialGroup);bind();document.body.classList.add('phase2-nav-ready');document.documentElement.classList.add('phase2-nav-ready');schedulePhase2NavMeasure();
  var after='';try{after=sessionStorage.getItem('bruno-phase3-after-apply')||'';sessionStorage.removeItem('bruno-phase3-after-apply')}catch(e){}if(after)setTimeout(function(){openTab(after)},0);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
