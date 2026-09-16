'use strict';
const assert=require('assert');
const G=require('../secondary-drain-guard.js');
function doc(values){return {getElementById(id){if(!(id in values))return null;const v=values[id];if(typeof v==='object')return v;return {value:v}}}}
assert.strictEqual(G.requiresSecondaryDrain('pan-drain'),true);
assert.strictEqual(G.requiresSecondaryDrain('overflow-drain'),true);
assert.strictEqual(G.requiresSecondaryDrain('pan-switch'),false);
assert.strictEqual(G.requiresSecondaryDrain('switch-only'),false);
let d=doc({jobKind:{value:'replace'},overflowDamageRisk:{checked:true},overflowProtection:{value:'pan-drain'},secondaryDrainFt:{value:'0'}});
assert.strictEqual(G.blockedState(d).blocked,true);
d=doc({jobKind:{value:'replace'},overflowDamageRisk:{checked:true},overflowProtection:{value:'overflow-drain'},secondaryDrainFt:{value:''}});
assert.strictEqual(G.blockedState(d).blocked,true);
d=doc({jobKind:{value:'replace'},overflowDamageRisk:{checked:true},overflowProtection:{value:'overflow-drain'},secondaryDrainFt:{value:'25'}});
assert.strictEqual(G.blockedState(d).blocked,false);
d=doc({jobKind:{value:'replace'},overflowDamageRisk:{checked:true},overflowProtection:{value:'pan-switch'},secondaryDrainFt:{value:'0'}});
assert.strictEqual(G.blockedState(d).blocked,false);
d=doc({jobKind:{value:'repair'},includeRepairInstallScope:{checked:false},overflowDamageRisk:{checked:true},overflowProtection:{value:'pan-drain'},secondaryDrainFt:{value:'0'}});
assert.strictEqual(G.blockedState(d).blocked,false);
console.log('secondary-drain-guard tests passed');
