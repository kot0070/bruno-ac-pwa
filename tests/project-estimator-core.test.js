'use strict';
const assert=require('assert');
const E=require('../project-estimator-core.js');

const residential=E.buildPlan({projectType:'residential',sqft:2000,systemType:'split-heat-pump',indoorLocation:'attic',rooms:[
 {id:'b',type:'bedroom',count:3,area:150},
 {id:'ba',type:'bathroom',count:2,area:60},
 {id:'k',type:'kitchen',count:1,area:180},
 {id:'l',type:'living',count:1,area:350},
 {id:'g',type:'garage',count:1,area:400}
],overrides:{'line-set-ft':35,'condensate-ft':30}});
assert.strictEqual(residential.projectType,'residential');
assert.strictEqual(residential.conditionedRooms,5);
assert.strictEqual(residential.quantities.find(x=>x.key==='supply-registers').calculated,5);
assert.strictEqual(residential.quantities.find(x=>x.key==='line-set-ft').final,35);
assert.strictEqual(residential.quantities.find(x=>x.key==='aux-pan').codeMinimum,1);
assert.strictEqual(residential.ready,true);
assert.strictEqual(residential.areaOutletAllowance,5);

const large=E.buildPlan({projectType:'residential',sqft:20000,systemType:'split-heat-pump',indoorLocation:'attic',rooms:[
 {id:'b',type:'bedroom',count:3,area:150},
 {id:'k',type:'kitchen',count:1,area:180},
 {id:'l',type:'living',count:1,area:350}
],overrides:{'line-set-ft':35,'condensate-ft':30}});
assert.strictEqual(large.areaOutletAllowance,50);
assert.strictEqual(large.quantities.find(x=>x.key==='supply-registers').calculated,50,'20,000 ft² must visibly change preliminary estimating allowance');
assert.strictEqual(large.quantities.find(x=>x.key==='return-grilles').calculated,13);
assert(large.checks.some(x=>x.key==='preliminary-area-allowance'));
assert(large.quantities.find(x=>x.key==='supply-registers').basis.includes('not a code minimum'));

const below=E.buildPlan({projectType:'residential',sqft:2000,systemType:'split-heat-pump',indoorLocation:'attic',rooms:[{id:'b',type:'bedroom',count:1,area:100}],overrides:{'line-set-ft':25,'condensate-ft':25,'aux-pan':0,'float-switch':1}});
assert.strictEqual(below.quantities.find(x=>x.key==='aux-pan').status,'below-minimum');
assert.strictEqual(below.ready,false);

const required=E.buildPlan({projectType:'residential',sqft:2000,systemType:'split-heat-pump',indoorLocation:'closet',rooms:[{id:'b',type:'bedroom',count:1,area:100}]});
assert.strictEqual(required.quantities.find(x=>x.key==='line-set-ft').status,'required-input');
assert.strictEqual(required.quantities.find(x=>x.key==='condensate-ft').status,'required-input');
assert.strictEqual(required.ready,false);

const commercial=E.buildPlan({projectType:'commercial',sqft:12000,systemType:'package',indoorLocation:'other',rooms:[{id:'h',type:'hangar',count:1,area:10000},{id:'o',type:'office',count:2,area:500}],overrides:{'condensate-ft':50}});
assert.strictEqual(commercial.requiresCommercialVerification,true);
assert(commercial.checks.some(x=>x.key==='commercial-code-path'));
assert(commercial.checks.some(x=>x.key==='large-volume-space'));

console.log('project-estimator-core tests passed');