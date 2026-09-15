'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const UX=require('../ac-calculator-review-ux.js');

function s(items){return UX.deriveReviewState(items)}

assert.deepStrictEqual(s([
  {selected:true},{selected:true}
]),{mode:'ready',selected:2,ready:2,attention:0,hard:0,unresolved:0,invalid:0,zero:0});

assert.deepStrictEqual(s([
  {selected:true},{selected:true,unresolved:true},{selected:false,invalid:true}
]),{mode:'action-required',selected:2,ready:1,attention:1,hard:1,unresolved:1,invalid:0,zero:0});

assert.deepStrictEqual(s([
  {selected:true,invalid:true},{selected:true}
]),{mode:'action-required',selected:2,ready:1,attention:1,hard:1,unresolved:0,invalid:1,zero:0});

assert.deepStrictEqual(s([
  {selected:true,zero:true},{selected:true}
]),{mode:'review-required',selected:2,ready:1,attention:1,hard:0,unresolved:0,invalid:0,zero:1});

assert.deepStrictEqual(s([
  {selected:true,unresolved:true},{selected:true,invalid:true},{selected:true,zero:true},{selected:true}
]),{mode:'action-required',selected:4,ready:1,attention:3,hard:2,unresolved:1,invalid:1,zero:1});

// Regression guard for PR23 audit F01: review-owned DOM writes must execute with
// the review MutationObservers disconnected, then observers are restored in finally.
const source=fs.readFileSync(path.join(__dirname,'..','ac-calculator-review-ux.js'),'utf8');
assert(source.includes('function disconnect(){'),'review UX must define observer disconnect');
assert(source.includes('function observe(){'),'review UX must define observer observe');
assert(source.includes('function sync(){\n    disconnect();\n    try{'),'sync must disconnect observers before review-owned DOM writes');
assert(source.includes('}finally{observe()}'),'sync must restore observers in finally');
assert(source.includes('function setText(node,value)'),'idempotent text writer required');
assert(source.includes('function setClass(node,value)'),'idempotent class writer required');
assert(!source.includes('new MutationObserver(queueSync).observe(status'), 'legacy self-triggering status observer wiring must not return');
assert(!source.includes('new MutationObserver(queueSync).observe(bomBody'), 'legacy self-triggering BOM observer wiring must not return');

console.log('ac-calculator-review-ux tests passed');
