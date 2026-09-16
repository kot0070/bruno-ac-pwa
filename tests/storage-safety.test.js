'use strict';
const assert=require('assert');
const F=require('../financial-integrity-core.js');
const J=require('../service-journal-storage-guard.js');

function FakeStorage(seed){this.o=Object.assign({},seed||{});}
Object.defineProperty(FakeStorage.prototype,'length',{get:function(){return Object.keys(this.o).length}});
FakeStorage.prototype.key=function(i){return Object.keys(this.o)[i]||null};
FakeStorage.prototype.getItem=function(k){return Object.prototype.hasOwnProperty.call(this.o,k)?this.o[k]:null};
FakeStorage.prototype.setItem=function(k,v){this.o[k]=String(v)};
FakeStorage.prototype.removeItem=function(k){delete this.o[k]};
function StructuralStorage(seed){this.o=Object.assign({},seed||{});}
Object.defineProperty(StructuralStorage.prototype,'length',{get:function(){return Object.keys(this.o).length}});
StructuralStorage.prototype.key=FakeStorage.prototype.key;
StructuralStorage.prototype.getItem=FakeStorage.prototype.getItem;
StructuralStorage.prototype.setItem=FakeStorage.prototype.setItem;
StructuralStorage.prototype.removeItem=FakeStorage.prototype.removeItem;

assert.strictEqual(F.classifyPrimaryJobRaw(null).status,'missing');
assert.strictEqual(F.classifyPrimaryJobRaw('{bad').status,'invalid');
assert.strictEqual(F.classifyPrimaryJobRaw('[]').status,'invalid');
assert.strictEqual(F.classifyPrimaryJobRaw('{}').status,'invalid','empty object must be treated as structural Job corruption');
assert.strictEqual(F.classifyPrimaryJobRaw(JSON.stringify({quote:{}})).status,'invalid','partial Job authority must not bypass the storage guard');
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

const structuralRaw='{}';
const structuralStorage=new StructuralStorage({'bruno-ac-v1':structuralRaw});
const structuralGuard=F.installPrimaryStorageGuard({Storage:StructuralStorage,localStorage:structuralStorage,document:null});
assert.strictEqual(structuralGuard.locked,true,'structurally invalid JSON object must be protected as corruption');
assert.strictEqual(structuralStorage.getItem(F.PRIMARY_RESCUE_KEY),structuralRaw);

function HealthyStorage(seed){this.o=Object.assign({},seed||{});}
Object.defineProperty(HealthyStorage.prototype,'length',{get:function(){return Object.keys(this.o).length}});
HealthyStorage.prototype.key=FakeStorage.prototype.key;HealthyStorage.prototype.getItem=FakeStorage.prototype.getItem;HealthyStorage.prototype.setItem=FakeStorage.prototype.setItem;HealthyStorage.prototype.removeItem=FakeStorage.prototype.removeItem;
const healthyStorage=new HealthyStorage({'bruno-ac-v1':JSON.stringify({quote:{},materialsUsed:[],catalog:[]})});
const healthy=F.installPrimaryStorageGuard({Storage:HealthyStorage,localStorage:healthyStorage,document:null});
assert.strictEqual(healthy.locked,false);

const validJournal={schemaVersion:4,settings:{employeeSocialSecurityPct:6.2,twcWageBase:9000},workers:[],calls:[{id:'c',date:'2026-09-16',hours:1.5,gross:250}],crew:[{id:'w',date:'2026-09-16',rate:20,hours:8}]};
assert.strictEqual(J.validateRaw(JSON.stringify(validJournal)).ok,true);
const badRate=JSON.parse(JSON.stringify(validJournal));badRate.crew[0].rate='abc';
assert.strictEqual(J.validateRaw(JSON.stringify(badRate)).ok,false);
const badPct=JSON.parse(JSON.stringify(validJournal));badPct.settings.employeeSocialSecurityPct=120;
assert.strictEqual(J.validateRaw(JSON.stringify(badPct)).ok,false);
const negativeGross=JSON.parse(JSON.stringify(validJournal));negativeGross.calls[0].gross=-1;
assert.strictEqual(J.validateRaw(JSON.stringify(negativeGross)).ok,false);
const jStorage=new FakeStorage({[J.KEY]:JSON.stringify(badRate)});
const jGuard=J.install({Storage:FakeStorage,localStorage:jStorage});
assert.strictEqual(jGuard.invalid,true);
assert.throws(()=>jStorage.getItem(J.KEY),/BRUNO_JOURNAL_STORAGE_LOCKED/,'malformed explicit Journal numerics must be blocked before normalization');
jGuard.restore();
assert.strictEqual(jStorage.getItem(J.KEY),JSON.stringify(badRate),'guard must not mutate the malformed stored payload');

console.log('storage safety tests passed');
