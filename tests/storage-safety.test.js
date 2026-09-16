'use strict';
const assert=require('assert');
const F=require('../financial-integrity-core.js');

function FakeStorage(seed){this.o=Object.assign({},seed||{});}
Object.defineProperty(FakeStorage.prototype,'length',{get:function(){return Object.keys(this.o).length}});
FakeStorage.prototype.key=function(i){return Object.keys(this.o)[i]||null};
FakeStorage.prototype.getItem=function(k){return Object.prototype.hasOwnProperty.call(this.o,k)?this.o[k]:null};
FakeStorage.prototype.setItem=function(k,v){this.o[k]=String(v)};
FakeStorage.prototype.removeItem=function(k){delete this.o[k]};

assert.strictEqual(F.classifyPrimaryJobRaw(null).status,'missing');
assert.strictEqual(F.classifyPrimaryJobRaw('{bad').status,'invalid');
assert.strictEqual(F.classifyPrimaryJobRaw('[]').status,'invalid');
assert.strictEqual(F.classifyPrimaryJobRaw(JSON.stringify({quote:{},materialsUsed:[],catalog:[]})).status,'valid');

const raw='{not valid json';
const storage=new FakeStorage({'bruno-ac-v1':raw});
const root={Storage:FakeStorage,localStorage:storage,document:null};
const guard=F.installPrimaryStorageGuard(root);
assert.strictEqual(guard.installed,true);
assert.strictEqual(guard.locked,true);
assert.strictEqual(storage.getItem(F.PRIMARY_RESCUE_KEY),raw,'corrupt raw Job must be preserved in rescue storage');
assert.throws(()=>storage.setItem(F.PRIMARY_JOB_KEY,JSON.stringify({quote:{}})),/BRUNO_PRIMARY_STORAGE_LOCKED_CORRUPT_DATA/,'normal save must not overwrite corrupt primary Job');
assert.strictEqual(storage.getItem(F.PRIMARY_JOB_KEY),raw);
guard.allowRecoveryWrite(10000);
storage.setItem(F.PRIMARY_JOB_KEY,JSON.stringify({quote:{},materialsUsed:[],catalog:[]}));
assert.strictEqual(guard.locked,false,'a valid explicit recovery write may unlock storage');
assert.strictEqual(F.classifyPrimaryJobRaw(storage.getItem(F.PRIMARY_JOB_KEY)).status,'valid');

const healthyStorage=new FakeStorage({'bruno-ac-v1':JSON.stringify({quote:{}})});
const healthy=F.installPrimaryStorageGuard({Storage:FakeStorage,localStorage:healthyStorage,document:null});
assert.strictEqual(healthy.locked,false);
console.log('storage safety tests passed');
