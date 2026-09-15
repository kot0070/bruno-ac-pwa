(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root){root.BrunoCodeLibraryUX=api;if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',api.init);else api.init();}}
})(typeof self!=='undefined'?self:this,function(){
  'use strict';

  var state={library:null,active:false,loaded:false,loading:false,error:'',observer:null,renderQueued:false};
  function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
  function arr(v){return Array.isArray(v)?v:[]}
  function $(id){return document.getElementById(id)}

  function summarizeLibrary(lib,core){
    var validation=core&&core.validateLibrary?core.validateLibrary(lib):{ok:false,errors:['registry_core_missing']};
    var map=core&&core.validateCalculatorMap?core.validateCalculatorMap(lib):{ok:false,mappedKeys:0,missing:[]};
    return {
      valid:!!validation.ok,
      errors:validation.errors||[],
      codes:arr(lib&&lib.adoptedCodes).length,
      rules:arr(lib&&lib.rules).length,
      mappedKeys:map.mappedKeys||0,
      mapValid:!!map.ok,
      mapMissing:map.missing||[],
      effectiveDate:lib&&lib.jurisdiction&&lib.jurisdiction.effectiveDate||'',
      verifiedOn:lib&&lib.lastVerified||''
    };
  }

  function injectStyles(){
    if($('code-library-style'))return;
    var s=document.createElement('style');s.id='code-library-style';s.textContent=''
      +'.code-lib-panel{border-radius:var(--radius)!important}'
      +'.code-lib-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem;align-items:start;margin-bottom:1rem}'
      +'.code-lib-hero h2{margin:0;font-size:1.4rem}.code-lib-hero p{margin:.25rem 0 0;color:var(--text-muted)}'
      +'.code-lib-badges{display:flex;gap:.4rem;flex-wrap:wrap;justify-content:flex-end}.code-lib-badge{padding:.3rem .55rem;border:1px solid var(--border);border-radius:999px;background:var(--bg-elev);font-size:.76rem;color:var(--text-muted)}'
      +'.code-lib-badge.ok{color:var(--success);border-color:rgba(61,214,140,.45)}.code-lib-badge.warn{color:var(--warning);border-color:rgba(255,204,102,.45)}'
      +'.code-lib-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;margin:1rem 0}.code-lib-stat{background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;padding:.8rem}.code-lib-stat b{display:block;font-size:1.2rem}.code-lib-stat span{font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}'
      +'.code-lib-tools{display:grid;grid-template-columns:minmax(0,1fr) minmax(150px,.35fr);gap:.6rem;margin:1rem 0}.code-lib-tools input,.code-lib-tools select{width:100%;min-height:44px;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:.6rem .75rem}'
      +'.code-lib-section{margin-top:1.15rem}.code-lib-section h3{margin:0 0 .65rem}.code-lib-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}'
      +'.code-lib-card{background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;padding:.85rem}.code-lib-card h4{margin:0 0 .25rem;font-size:.96rem}.code-lib-card .meta{font-size:.75rem;color:var(--text-muted);margin-bottom:.45rem}.code-lib-card p{margin:.35rem 0;color:var(--text-muted);font-size:.86rem;line-height:1.5}.code-lib-card .tags{display:flex;gap:.3rem;flex-wrap:wrap;margin:.5rem 0}.code-lib-card .tag{font-size:.68rem;padding:.15rem .4rem;border-radius:999px;background:#172232;border:1px solid var(--border);color:var(--text-muted)}'
      +'.code-lib-link{display:inline-flex;align-items:center;gap:.3rem;color:#8ab8ff;text-decoration:none;font-size:.82rem;font-weight:600}.code-lib-link:hover{text-decoration:underline}'
      +'.code-lib-integrity{border-left:3px solid var(--accent-2);background:rgba(61,139,253,.08);padding:.7rem .85rem;border-radius:8px;color:var(--text-muted);font-size:.84rem}.code-lib-integrity strong{color:var(--text)}'
      +'.code-lib-empty{padding:1rem;color:var(--text-muted);text-align:center;border:1px dashed var(--border);border-radius:8px}'
      +'@media(max-width:760px){.code-lib-hero{grid-template-columns:1fr}.code-lib-badges{justify-content:flex-start}.code-lib-stats{grid-template-columns:repeat(2,1fr)}.code-lib-tools{grid-template-columns:1fr}.code-lib-grid{grid-template-columns:1fr}.code-lib-panel{padding:1rem!important}}';
    document.head.appendChild(s);
  }

  function ensurePanel(){
    var p=$('panel-code-library');if(p)return p;
    var main=document.querySelector('main');if(!main)return null;
    p=document.createElement('section');p.id='panel-code-library';p.className='panel code-lib-panel';p.setAttribute('role','tabpanel');p.innerHTML=''
      +'<div class="code-lib-hero"><div><h2>Code Library · Verification</h2><p>Texas 2026 baseline · traceable rule registry for calculator checks and future room-based estimating.</p></div><div class="code-lib-badges" id="code-lib-badges"></div></div>'
      +'<div class="code-lib-integrity" id="code-lib-integrity">Loading local rule registry…</div>'
      +'<div class="code-lib-stats" id="code-lib-stats"></div>'
      +'<div class="code-lib-tools"><input type="search" id="code-lib-search" placeholder="Search section, rule, topic, tag…" aria-label="Search code library"><select id="code-lib-family" aria-label="Filter by code family"><option value="">All code families</option></select></div>'
      +'<div class="code-lib-section"><h3>Adopted code set</h3><div class="code-lib-grid" id="code-lib-codes"></div></div>'
      +'<div class="code-lib-section"><h3>Rule registry</h3><div class="code-lib-grid" id="code-lib-rules"></div></div>'
      +'<div class="code-lib-section"><h3>Repository source</h3><div class="code-lib-card"><p>The app stores only our structured summaries, identifiers, provenance, verification dates, and official links. Full copyrighted code books are not copied into the repository.</p><a class="code-lib-link" href="./code-library/texas-hvac-2026.json" target="_blank" rel="noopener">Open local registry JSON ↗</a></div></div>';
    main.appendChild(p);
    var q=$('code-lib-search'),f=$('code-lib-family');if(q)q.addEventListener('input',renderRules);if(f)f.addEventListener('change',renderRules);
    return p;
  }

  function deactivate(){state.active=false;var p=$('panel-code-library');if(p)p.classList.remove('active')}

  function activate(){
    var p=ensurePanel();if(!p)return;
    state.active=true;
    document.querySelectorAll('.panel').forEach(function(x){x.classList.remove('active')});
    p.classList.add('active');
    document.querySelectorAll('.phase2-sub-btn').forEach(function(x){x.classList.remove('active');x.removeAttribute('aria-current')});
    var b=$('code-library-subtab');if(b){b.classList.add('active');b.setAttribute('aria-current','page')}
    var ctx=$('phase2-context');if(ctx)ctx.textContent='AC Tools · Code Library';
    if(!state.loaded&&!state.loading)loadLibrary();
  }

  function ensureSubtab(){
    var shell=document.querySelector('.phase2-nav-shell'),sub=document.querySelector('.phase2-subnav'),ctx=$('phase2-context');if(!shell||!sub||!ctx)return;
    var tools=/^AC Tools\b/.test(ctx.textContent||'');
    var existing=$('code-library-subtab');
    if(!tools){deactivate();if(existing)existing.remove();return}
    if(!existing){
      existing=document.createElement('button');existing.type='button';existing.id='code-library-subtab';existing.className='phase2-sub-btn';existing.textContent='Code Library';existing.addEventListener('click',function(e){e.preventDefault();activate()});sub.appendChild(existing);
    }
    if(state.active){existing.classList.add('active');existing.setAttribute('aria-current','page')}
  }

  function renderSummary(){
    if(!state.library)return;var core=window.BrunoCodeRuleRegistry,summary=summarizeLibrary(state.library,core),b=$('code-lib-badges'),s=$('code-lib-stats'),i=$('code-lib-integrity');
    if(b)b.innerHTML='<span class="code-lib-badge '+(summary.valid?'ok':'warn')+'">Registry '+(summary.valid?'valid':'needs review')+'</span><span class="code-lib-badge '+(summary.mapValid?'ok':'warn')+'">Calculator map '+(summary.mapValid?'resolved':'incomplete')+'</span>';
    if(s)s.innerHTML='<div class="code-lib-stat"><b>'+summary.codes+'</b><span>Adopted codes</span></div><div class="code-lib-stat"><b>'+summary.rules+'</b><span>Rules indexed</span></div><div class="code-lib-stat"><b>'+summary.mappedKeys+'</b><span>Calculator keys mapped</span></div><div class="code-lib-stat"><b>'+esc(summary.verifiedOn)+'</b><span>Last verified</span></div>';
    var policy=state.library.sourcePolicy||{};
    if(i)i.innerHTML='<strong>Integrity check:</strong> '+(summary.valid?'schema valid':'schema errors: '+esc(summary.errors.join(', ')))+' · calculator map '+(summary.mapValid?'resolves to known rule IDs':'has missing IDs')+' · full copyrighted code text stored: <strong>'+(policy.fullCopyrightedCodeTextStored?'YES':'NO')+'</strong> · effective '+esc(summary.effectiveDate)+'. Always verify local AHJ amendments for the actual project.';
  }

  function renderCodes(){
    var host=$('code-lib-codes');if(!host||!state.library)return;
    host.innerHTML=arr(state.library.adoptedCodes).map(function(c){return '<article class="code-lib-card"><h4>'+esc(c.title)+'</h4><div class="meta">'+esc(c.id)+' · '+esc(c.edition)+' · effective '+esc(c.effectiveDate)+'</div><p>'+esc(c.note||c.status||'Adopted reference')+'</p><a class="code-lib-link" href="'+esc(c.sourceUrl)+'" target="_blank" rel="noopener">Official source ↗</a>'+(c.adoptionSourceUrl?'<br><a class="code-lib-link" href="'+esc(c.adoptionSourceUrl)+'" target="_blank" rel="noopener">Texas adoption source ↗</a>':'')+'</article>'}).join('');
  }

  function renderFamilies(){
    var sel=$('code-lib-family');if(!sel||!state.library)return;var cur=sel.value,seen={};arr(state.library.rules).forEach(function(r){seen[r.family]=true});
    sel.innerHTML='<option value="">All code families</option>'+Object.keys(seen).sort().map(function(x){return '<option value="'+esc(x)+'">'+esc(x)+'</option>'}).join('');if(cur&&seen[cur])sel.value=cur;
  }

  function renderRules(){
    var host=$('code-lib-rules');if(!host||!state.library)return;var core=window.BrunoCodeRuleRegistry;if(!core)return;
    var q=$('code-lib-search'),f=$('code-lib-family'),rules=core.searchRules(state.library,q?q.value:'',{family:f?f.value:''});
    if(!rules.length){host.innerHTML='<div class="code-lib-empty">No matching rules.</div>';return}
    host.innerHTML=rules.map(function(r){var tags=arr(r.calculatorTags).map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join('');return '<article class="code-lib-card"><h4>'+esc(r.title)+'</h4><div class="meta">'+esc(r.family)+' · '+esc(r.section)+' · '+esc(r.verificationStatus)+'</div><p>'+esc(r.summary)+'</p><div class="tags">'+tags+'</div><a class="code-lib-link" href="'+esc(r.sourceUrl)+'" target="_blank" rel="noopener">Verify official source ↗</a>'+(r.implementationNote?'<p><strong>Calculator:</strong> '+esc(r.implementationNote)+'</p>':'')+'</article>'}).join('');
  }

  function loadLibrary(){
    state.loading=true;state.error='';
    fetch('./code-library/texas-hvac-2026.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(lib){
      state.library=lib;state.loaded=true;state.loading=false;renderSummary();renderCodes();renderFamilies();renderRules();
    }).catch(function(err){state.loading=false;state.error=err&&err.message?err.message:String(err);var i=$('code-lib-integrity');if(i)i.innerHTML='<strong>Registry load failed:</strong> '+esc(state.error)+' · the calculator remains usable, but code verification links are unavailable.';});
  }

  function bindShell(){
    var shell=document.querySelector('.phase2-nav-shell');if(!shell)return false;
    shell.addEventListener('click',function(e){var b=e.target.closest('.phase2-sub-btn'),g=e.target.closest('[data-group]');if((g||(b&&b.id!=='code-library-subtab'))&&state.active)deactivate()});
    if('MutationObserver' in window){state.observer=new MutationObserver(function(){if(state.renderQueued)return;state.renderQueued=true;requestAnimationFrame(function(){state.renderQueued=false;ensureSubtab()})});state.observer.observe(shell,{subtree:true,childList:true,characterData:true})}
    ensureSubtab();return true;
  }

  function init(){
    if(typeof document==='undefined'||$('code-library-ux-ready'))return;
    injectStyles();ensurePanel();
    var marker=document.createElement('span');marker.id='code-library-ux-ready';marker.hidden=true;document.body.appendChild(marker);
    var tries=0;(function wait(){if(bindShell())return;if(++tries<30)setTimeout(wait,100)})();
  }

  return {init:init,summarizeLibrary:summarizeLibrary};
});
