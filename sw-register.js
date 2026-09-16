(function () {
  'use strict';
  var PRIMARY_JOB_KEY='bruno-ac-v1',MAX_PRIMARY_BYTES=5*1024*1024;

  function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
  function todayISO(){var d=new Date(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return d.getFullYear()+'-'+m+'-'+day}
  function runtimeFailure(code,detail){
    var id='bruno-runtime-loader-alert';
    function show(){
      if(!document||document.getElementById(id))return;
      var host=document.body||document.documentElement;if(!host)return;
      var b=document.createElement('div');b.id=id;b.setAttribute('role','alert');
      b.style.cssText='position:sticky;top:0;z-index:10001;background:#7f1d1d;color:#fff;padding:10px 14px;font:14px/1.4 system-ui;border-bottom:1px solid #fca5a5';
      b.textContent='Bruno AC runtime component failed to load ('+code+'). Reload while online before relying on this screen.'+(detail?' '+detail:'');
      host.insertBefore(b,host.firstChild||null);
    }
    if(document&&document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
  }

  function blankFirstRunJob(seed){
    seed=seed&&typeof seed==='object'?seed:{};
    return {
      company:clone(seed.company)||{},
      quote:{date:todayISO(),proposal:'',jobNumber:'',po:'',workOrder:'',contact:'',customer:'',jobAddress1:'',jobAddress2:'',reference:'',quotedBy:'',description:[],terms:[],hvac:{}},
      summary:clone(seed.summary)||{ohRate:.25,profitMargin:.15},
      materialsUsed:[],
      catalog:clone(seed.catalog)||[],
      personnel:clone(seed.personnel)||{employees:[],burden:[]},
      laborEquip:{subcontractors:[],equipment:[],blocks:[],smallTools:0,smallToolsLines:[]},
      tm:{equipmentLines:[],laborLines:[],materialAmount:0,subAmount:0},
      pnl:{},
      changeOrders:[],
      taxSettings:{jurisdiction:'TX',jurisdictionLabel:'Texas',federalPct:0,statePct:0,localPct:0,notes:''},
      dispatch:{selectedDate:todayISO(),calls:[]},
      jobSettings:{jurisdiction:'Texas / Austin area',codeNote:'TDLR ACR: 2024 IRC/IMC/IFGC/UMC (eff. 2026-09-01). Energy: SECO statewide 2015 IECC / 2015 IRC Ch.11 unless local amendment.'},
      meta:{source:'first-run-blank',product:'bruno-ac',globalPriceUpdate:todayISO()}
    };
  }

  function installOversizePrimaryGuard(raw){
    if(!raw||raw.length<=MAX_PRIMARY_BYTES||typeof Storage==='undefined'||!window.localStorage)return false;
    if(window.BrunoPrimaryStorageGuard&&window.BrunoPrimaryStorageGuard.locked)return true;
    var proto=Storage.prototype;if(!proto||typeof proto.setItem!=='function')return false;
    if(proto.__brunoOversizePrimaryGuardInstalled)return true;
    var originalSet=proto.setItem,locked=true,allowUntil=0,storage=window.localStorage;
    function unlock(){locked=false;var b=document&&document.getElementById('bruno-primary-size-lock');if(b)b.remove()}
    proto.setItem=function(key,value){
      if(this===storage&&String(key)===PRIMARY_JOB_KEY&&locked){
        if(allowUntil&&Date.now()<=allowUntil){unlock();allowUntil=0;return originalSet.call(this,key,value)}
        throw new Error('BRUNO_PRIMARY_STORAGE_LOCKED_OVERSIZE_DATA');
      }
      return originalSet.call(this,key,value);
    };
    proto.__brunoOversizePrimaryGuardInstalled=true;
    window.BrunoOversizePrimaryStorageGuard={locked:function(){return locked},unlock:unlock,allowRecoveryWrite:function(ms){allowUntil=Date.now()+Math.max(250,Number(ms)||5000)}};
    if(document&&typeof document.addEventListener==='function'){
      document.addEventListener('click',function(e){var t=e.target&&e.target.closest&&e.target.closest('#btn-reset,#btn-blank');if(t)unlock()},true);
      document.addEventListener('change',function(e){var t=e.target&&e.target.closest&&e.target.closest('#btn-import,#btn-import-app');if(t)allowUntil=Date.now()+5000},true);
      var show=function(){if(!locked||document.getElementById('bruno-primary-size-lock'))return;var host=document.body||document.documentElement;if(!host)return;var b=document.createElement('div');b.id='bruno-primary-size-lock';b.setAttribute('role','alert');b.style.cssText='position:sticky;top:0;z-index:10002;background:#7f1d1d;color:#fff;padding:10px 14px;font:14px/1.4 system-ui;border-bottom:1px solid #fca5a5';b.textContent='Data safety lock: the saved Bruno AC Job exceeds the supported 5 MiB runtime limit. The original Job has not been overwritten. Export/recover the data, import a valid backup, or explicitly choose New blank job / Reset demo.';host.insertBefore(b,host.firstChild||null)};
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
    }
    return true;
  }

  function bootstrapPrimaryState(){
    if(!window.localStorage)return;
    var raw=null;try{raw=localStorage.getItem(PRIMARY_JOB_KEY)}catch(e){runtimeFailure('primary-storage-read',e&&e.message);return}
    if(raw){installOversizePrimaryGuard(raw);return}
    if(!window.BRUNO_SEED)return;
    try{localStorage.setItem(PRIMARY_JOB_KEY,JSON.stringify(blankFirstRunJob(window.BRUNO_SEED)))}catch(e){runtimeFailure('first-run-bootstrap',e&&e.message)}
  }

  function injectCss(id, href, done) {
    if (document.getElementById(id)) { if (done) done(true); return; }
    fetch(href, { credentials: 'same-origin' }).then(function (res) { if (!res.ok) throw new Error('CSS fetch failed: ' + res.status); return res.text(); }).then(function (css) { var style=document.createElement('style');style.id=id;style.textContent=css;document.head.appendChild(style);if(done)done(true); }).catch(function(err){runtimeFailure(id,err&&err.message);if(done)done(false)});
  }
  function loadScript(id, src, done) {
    if (document.getElementById(id)) { if (done) done(true); return; }
    var script=document.createElement('script');script.id=id;script.src=src;script.async=false;script.onload=function(){if(done)done(true)};script.onerror=function(){runtimeFailure(id,'Failed: '+src);if(done)done(false)};document.body.appendChild(script);
  }
  function loadGroupedNavigation() {
    var path=window.location.pathname||'',isMain=/\/$/.test(path)||/\/index\.html$/i.test(path);if(!isMain)return;
    loadScript('service-journal-storage-guard-js','./service-journal-storage-guard.js',function(guardReady){
      if(!guardReady)return;
      loadScript('service-journal-ux-js','./service-journal-ux.js',function(journalReady){
        if(!journalReady)return;
        if(window.BrunoServiceJournalStorageGuard&&typeof window.BrunoServiceJournalStorageGuard.restore==='function')window.BrunoServiceJournalStorageGuard.restore();
      });
    });
    if(document.getElementById('phase2-nav-js'))return;
    loadScript('catalog-v6-js','./catalog-v6.js');
    loadScript('full-backup-js','./app-backup-bridge.js');
    loadScript('project-mode-bridge-js','./project-mode-bridge.js');
    injectCss('phase2-nav-css','./navigation-v2.css',function(navCssReady){if(!navCssReady)return;injectCss('phase2-tree-css','./navigation-tree.css',function(treeReady){if(!treeReady)return;loadScript('phase2-nav-js','./navigation-v2.js',function(navJsReady){if(!navJsReady)return;injectCss('phase5-workspace-css','./workspace-v5.css',function(workCssReady){if(!workCssReady)return;loadScript('phase5-workspace-js','./workspace-v5.js')})})})});
  }

  bootstrapPrimaryState();
  loadGroupedNavigation();
  if(!('serviceWorker' in navigator))return;var reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloaded)return;reloaded=true;window.location.reload()});window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(function(reg){try{reg.update()}catch(e){runtimeFailure('service-worker-update',e&&e.message)}if(reg.waiting)try{reg.waiting.postMessage({type:'SKIP_WAITING'})}catch(e2){runtimeFailure('service-worker-activate',e2&&e2.message)}}).catch(function(err){runtimeFailure('service-worker-register',err&&err.message)})});
})();
