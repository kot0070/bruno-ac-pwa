'use strict';
const assert=require('assert');
const S=require('../project-building-schema.js');

assert.strictEqual(S.SCHEMA_VERSION,4);

const legacy={schemaVersion:3,projectType:'residential',sqft:2400,systemType:'split-heat-pump',rooms:[{id:'r1',type:'bedroom',count:1,area:180},{id:'r2',type:'living',count:1,area:420}]};
const m=S.migrateLegacyPlan(legacy);
assert.strictEqual(m.ok,true);
assert.strictEqual(m.value.schemaVersion,4);
assert.strictEqual(m.value.project.totalFloorArea,2400);
assert.strictEqual(m.value.project.conditionedFloorArea,null,'conditioned area must not be invented');
assert.strictEqual(m.value.project.systemTypePreference,'split-heat-pump');
assert.strictEqual(m.value.zones.length,2);
assert.strictEqual(m.value.zones[0].area,180);
assert.strictEqual(m.value.zones[0].ceilingHeight,null,'ceiling height must remain unresolved');
assert.strictEqual(m.value.migration.requiresReview,true);

assert.strictEqual(S.migrateLegacyPlan({schemaVersion:99}).ok,false,'unsupported legacy schema must fail clearly');

let d=S.normalize(m.value);
d.project.location='Austin';
d.project.jurisdiction='Austin, TX';
d.project.conditionedFloorArea=2200;
d.project.buildingType='single-family';
d.project.stories=1;
d.project.defaultCeilingHeight=9;
d.envelope.wall.insulationR=13;
d.envelope.roof.insulationR=38;
d.envelope.windows.totalArea=260;
d.envelope.infiltration.category='average';
d.envelope.design.sourceId='AUSTIN_DESIGN_CONDITIONS_PROJECT';
d.zones.forEach(z=>{z.ceilingHeight=9});
const v=S.validate(d);
assert.strictEqual(v.ok,true,v.missing.join(','));

const synced=S.syncLegacyContext(d,{projectType:'commercial',sqft:5000,systemType:'package',rooms:[{id:'r1',type:'office',count:1,area:800}]});
assert.strictEqual(synced.project.projectClass,'commercial');
assert.strictEqual(synced.project.totalFloorArea,5000);
assert.strictEqual(synced.project.systemTypePreference,'package');
assert.strictEqual(synced.zones.length,1);
assert.strictEqual(synced.zones[0].sourceRoomId,'r1');
assert.strictEqual(synced.zones[0].ceilingHeight,9,'advanced zone inputs should survive legacy-context sync by source room id');

console.log('project building schema tests passed');
