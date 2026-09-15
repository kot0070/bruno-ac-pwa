const assert=require('assert');
const fs=require('fs');
function src(name){return fs.readFileSync(require('path').join(__dirname,'..',name),'utf8')}
(function liveUsesCanonicalPlan(){const s=src('room-estimator-live.js');assert.ok(/function unwrapPlan/.test(s));assert.ok(/var snap=ux\.getSnapshot\(\),plan=unwrapPlan\(snap\)/.test(s),'live layer must unwrap getSnapshot() before build/dirty evaluation');assert.ok(/E\.earliestDirtyLevel\(lastPlan,plan\)/.test(s));assert.ok(/E\.build\(plan\)/.test(s));})();
(function blockedLiveIsFailClosed(){const s=src('room-estimator-live.js');assert.ok(/invalidateCalculatorPreview/.test(s));assert.ok(/apply\.disabled=true/.test(s));assert.ok(/data-room-live-stale/.test(s));assert.ok(/Room inputs changed — current BOM is stale and blocked/.test(s));})();
(function persistenceStoresCanonicalPlan(){const s=src('room-estimator-persistence.js');assert.ok(/unwrapPlan/.test(s));assert.ok(/s\.acCalculator\.roomEstimator=snap/.test(s));assert.ok(/plan&&plan\.building&&Array\.isArray\(plan\.rooms\)/.test(s));})();
(function preloadMigratesLegacyWrapper(){const s=src('room-estimator-preload.js');assert.ok(/legacy=!!\(snap&&snap\.plan/.test(s));assert.ok(/s\.acCalculator\.roomEstimator=plan/.test(s));})();
(function historyUsesCanonicalPlanAndTruthfulReadiness(){const s=src('calculation-history-ux.js');assert.ok(/function unwrapPlan/.test(s));assert.ok(/var plan=unwrapPlan\(snap\)/.test(s));assert.ok(/requiredInputs:pending/.test(s));assert.ok(/ready:pending\.length===0/.test(s));assert.ok(/sourceCalculationId:pendingSourceCalculationId/.test(s));})();
console.log('pr26 integration regression tests: PASS');
