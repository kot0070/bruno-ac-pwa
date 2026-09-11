(function () {
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
