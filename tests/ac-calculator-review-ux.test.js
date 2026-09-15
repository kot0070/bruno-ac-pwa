'use strict';
const assert=require('assert');
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

console.log('ac-calculator-review-ux tests passed');
