'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const src=fs.readFileSync('sw-register.js','utf8');

function FakeStorage(seed){this.o=Object.assign({},seed||{});}
Object.defineProperty(FakeStorage.prototype,'length',{get:function(){return Object.keys(this.o).length}});
FakeStorage.prototype.key=function(i){return Object.keys(this.o)[i]||null};
FakeStorage.prototype.getItem=function(k){return Object.prototype.hasOwnProperty.call(this.o,k)?this.o[k]:null};
FakeStorage.prototype.setItem=function(k,v){this.o[k]=String(v)};
FakeStorage.prototype.removeItem=function(k){delete this.o[k]};

function docStub(ready){
  const byId={},listeners={};
  const body={firstChild:null,appendChild(el){if(el.id)byId[el.id]=el;if(el.tagName==='SCRIPT'&&typeof el.onload==='function')el.onload();return el},insertBefore(el){if(el.id)byId[el.id]=el;body.firstChild=el;return el}};
  const head={appendChild(el){if(el.id)byId[el.id]=el;return el}};
  const document={readyState:ready||'complete',body,head,documentElement:body,getElementById(id){return byId[id]||null},createElement(tag){return {tagName:String(tag).toUpperCase(),id:'',style:{},setAttribute(){},remove(){if(this.id)delete byId[this.id]}}},addEventListener(type,fn){(listeners[type]||(listeners[type]=[])).push(fn)}};
  document.fire=function(type,event){(listeners[type]||[]).slice().forEach(fn=>fn(event||{}))};
  document.byId=byId;
  return document;
}
function run(ctx){ctx.console=console;ctx.JSON=JSON;ctx.Date=Date;ctx.Math=Math;ctx.Number=Number;ctx.String=String;ctx.Error=Error;ctx.setTimeout=setTimeout;ctx.clearTimeout=clearTimeout;ctx.Storage=FakeStorage;vm.runInNewContext(src,ctx,{filename:'sw-register.js'});return ctx;}

// First install: preserve templates but never start from the sample 3-ton Job.
{
  const storage=new FakeStorage();
  const document=docStub('loading');
  const seed={company:{legalName:'Bruno AC Services LLC'},quote:{customer:'Sample Residence',hvac:{tonnageBtu:'3 ton / ~36,000 BTU'}},summary:{ohRate:.25,profitMargin:.15},materialsUsed:[{id:'demo-3t'}],catalog:[{id:'cat-1',item:'Catalog template'}],personnel:{employees:[{id:'e1'}],burden:[]}};
  const window={localStorage:storage,BRUNO_SEED:seed,location:{pathname:'/not-main'},addEventListener(){}};
  run({window,localStorage:storage,document,navigator:{},location:window.location});
  const saved=JSON.parse(storage.getItem('bruno-ac-v1'));
  assert.strictEqual(saved.meta.source,'first-run-blank');
  assert.strictEqual(saved.quote.customer,'');
  assert.deepStrictEqual(saved.materialsUsed,[]);
  assert.strictEqual(saved.quote.hvac.tonnageBtu,undefined);
  assert.strictEqual(saved.catalog.length,1,'Catalog template should survive first-run blank bootstrap');
  assert.strictEqual(saved.personnel.employees.length,1,'worker template should survive first-run blank bootstrap');
  assert.strictEqual(seed.quote.customer,'Sample Residence','explicit Reset demo seed must remain unchanged');
  assert.strictEqual(seed.materialsUsed.length,1,'demo seed must remain available only for explicit reset');
}

// Oversized but valid primary Job: lock normal writes instead of treating it as missing/demo and overwriting it.
{
  const huge=JSON.stringify({quote:{},materialsUsed:[],catalog:[],padding:'x'.repeat(5*1024*1024+100)});
  const storage=new FakeStorage({'bruno-ac-v1':huge});
  const document=docStub('loading');
  const window={localStorage:storage,location:{pathname:'/not-main'},addEventListener(){}};
  run({window,localStorage:storage,document,navigator:{},location:window.location});
  assert(window.BrunoOversizePrimaryStorageGuard,'oversized Job must install a write lock');
  assert.strictEqual(window.BrunoOversizePrimaryStorageGuard.locked(),true);
  assert.throws(()=>storage.setItem('bruno-ac-v1',JSON.stringify({quote:{customer:'replacement'}})),/BRUNO_PRIMARY_STORAGE_LOCKED_OVERSIZE_DATA/);
  assert.strictEqual(storage.getItem('bruno-ac-v1'),huge,'oversized original Job must remain byte-for-byte intact');
  document.fire('DOMContentLoaded');
  assert(document.getElementById('bruno-primary-size-lock'),'user-visible data safety lock must be rendered');
}

// Required enhancement failure: do not silently degrade the runtime.
(async function(){
  const storage=new FakeStorage({'bruno-ac-v1':JSON.stringify({quote:{},materialsUsed:[],catalog:[]})});
  const document=docStub('complete');
  document.body.appendChild=function(el){if(el.id)document.byId[el.id]=el;if(el.tagName==='SCRIPT'&&typeof el.onerror==='function')el.onerror(new Error('network'));return el};
  const window={localStorage:storage,location:{pathname:'/'},addEventListener(){}};
  const context={window,localStorage:storage,document,navigator:{},location:window.location,fetch:()=>Promise.reject(new Error('offline'))};
  run(context);
  await new Promise(r=>setTimeout(r,0));
  const banner=document.getElementById('bruno-runtime-loader-alert');
  assert(banner,'failed required runtime enhancement must create a visible alert');
  assert(/failed to load/i.test(banner.textContent));
  console.log('sw-register runtime tests passed');
})().catch(err=>{console.error(err);process.exitCode=1});
