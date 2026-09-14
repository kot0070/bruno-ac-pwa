(function () {
  function loadGroupedNavigation() {
    var path = window.location.pathname || '';
    var isMain = /\/$/.test(path) || /\/index\.html$/i.test(path);
    if (!isMain || document.getElementById('phase2-nav-css')) return;

    var link = document.createElement('link');
    link.id = 'phase2-nav-css';
    link.rel = 'stylesheet';
    link.href = './navigation-v2.css';
    document.head.appendChild(link);

    var script = document.createElement('script');
    script.id = 'phase2-nav-js';
    script.src = './navigation-v2.js';
    script.async = false;
    document.body.appendChild(script);

    var workCss = document.createElement('link');
    workCss.id = 'phase5-workspace-css';
    workCss.rel = 'stylesheet';
    workCss.href = './workspace-v5.css';
    document.head.appendChild(workCss);

    var workJs = document.createElement('script');
    workJs.id = 'phase5-workspace-js';
    workJs.src = './workspace-v5.js';
    workJs.async = false;
    document.body.appendChild(workJs);
  }

  loadGroupedNavigation();

  if (!('serviceWorker' in navigator)) return;
  var reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then(function (reg) {
        try { reg.update(); } catch (e) {}
        if (reg.waiting) {
          try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch (e2) {}
        }
      })
      .catch(function () {});
  });
})();
