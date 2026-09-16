(function () {
  function injectCss(id, href, done) {
    if (document.getElementById(id)) { if (done) done(true); return; }
    fetch(href, { credentials: 'same-origin' }).then(function (res) { if (!res.ok) throw new Error('CSS fetch failed: ' + res.status); return res.text(); }).then(function (css) { var style=document.createElement('style');style.id=id;style.textContent=css;document.head.appendChild(style);if(done)done(true); }).catch(function(){if(done)done(false)});
  }
  function loadScript(id, src, done) {
    if (document.getElementById(id)) { if (done) done(true); return; }
    var script=document.createElement('script');script.id=id;script.src=src;script.async=false;script.onload=function(){if(done)done(true)};script.onerror=function(){if(done)done(false)};document.body.appendChild(script);
  }
  function loadGroupedNavigation() {
    var path=window.location.pathname||'',isMain=/\/$/.test(path)||/\/index\.html$/i.test(path);if(!isMain||document.getElementById('phase2-nav-js'))return;
    loadScript('catalog-v6-js','./catalog-v6.js');
    loadScript('full-backup-js','./app-backup-bridge.js');
    injectCss('phase2-nav-css','./navigation-v2.css',function(navCssReady){if(!navCssReady)return;injectCss('phase2-tree-css','./navigation-tree.css',function(treeReady){if(!treeReady)return;loadScript('phase2-nav-js','./navigation-v2.js',function(navJsReady){if(!navJsReady)return;injectCss('phase5-workspace-css','./workspace-v5.css',function(workCssReady){if(!workCssReady)return;loadScript('phase5-workspace-js','./workspace-v5.js')})})})});
  }
  loadGroupedNavigation();
  if(!('serviceWorker' in navigator))return;var reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloaded)return;reloaded=true;window.location.reload()});window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(function(reg){try{reg.update()}catch(e){}if(reg.waiting)try{reg.waiting.postMessage({type:'SKIP_WAITING'})}catch(e2){}}).catch(function(){})});
})();
