'use strict';
const assert=require('assert');
const fs=require('fs');
const {JSDOM}=require('jsdom');

const html='<!doctype html><html><head></head><body>'+ 
'<div class="notice">old workflow</div>'+ 
'<div id="jobbar"><span class="pill">split heat pump</span><span class="pill">3 ton / 36,000 BTU</span></div>'+ 
'<main class="wrap"><section id="projectEstimatorWizard" class="pew"><div class="pew-sub">old steps</div>'+ 
'<section id="pew-finish-step"><div class="pew-step-title"><strong>Full technical calculation</strong><small>old</small></div><button id="pew-open-full">Open live technical calculator</button></section></section>'+ 
'<div class="grid" hidden><section class="card"><h2>Full calculation · system / field inputs</h2>'+ 
'<div class="field"><input id="sqft" value="20000"></div><div class="field"><select id="systemType"><option selected>split-heat-pump</option></select></div>'+ 
'<div class="field"><select id="indoorLocation"><option selected>attic</option></select></div><div class="field"><input id="tonnage" value="3 ton / 36,000 BTU"></div>'+ 
'<div class="field"><input id="lineSetFt" value="25"></div></section><section class="card"><h2>Generated BOM</h2></section></div></main>'+ 
'<button id="calculate"></button><button id="apply"></button></body></html>';

const dom=new JSDOM(html,{url:'https://example.test/ac-calculator.html',runScripts:'outside-only'});
const w=dom.window;
w.localStorage.setItem('bruno-ac-project-context-v1',JSON.stringify({type:'residential'}));
let recalcs=0;w.document.getElementById('calculate').addEventListener('click',()=>recalcs++);
w.eval(fs.readFileSync('project-mode-bridge.js','utf8'));
w.BrunoProjectModeBridge.enforceOneSurface(w.document);

const grid=w.document.querySelector('main.wrap .grid');
assert.strictEqual(grid.hidden,false,'technical grid must remain inline and visible');
assert(grid.classList.contains('bruno-single-surface-grid'));
assert(w.document.getElementById('projectEstimatorWizard').classList.contains('pew-one-surface'));
assert.strictEqual(w.document.getElementById('pew-open-full').hidden,true,'legacy open-full control must be hidden from normal flow');
assert.strictEqual(w.document.getElementById('pew-open-full').tabIndex,-1);
for(const id of ['sqft','systemType','indoorLocation','tonnage']){
  assert(w.document.getElementById(id).closest('.field').classList.contains('bruno-single-source-hidden'),id+' duplicate technical field must not be a second visible authority');
}
const tons=w.document.getElementById('tonnage');
assert.strictEqual(tons.value,'','legacy demo capacity must not remain active');
assert.strictEqual(tons.dataset.legacyCapacity,'3 ton / 36,000 BTU','legacy capacity may survive only as metadata');
assert(w.document.querySelector('.notice').textContent.includes('same calculator surface'));
assert(w.document.getElementById('pew-finish-step').textContent.includes('No second calculator is required'));
const oldPill=[...w.document.querySelectorAll('#jobbar .pill')].find(x=>x.textContent.includes('3 ton'));
assert(oldPill.classList.contains('bruno-single-source-hidden'),'legacy tonnage pill must not remain visible');

/* Wizard reset used to set grid.hidden=true. Bridge must immediately restore one-surface architecture. */
grid.hidden=true;
w.BrunoProjectModeBridge.enforceOneSurface(w.document);
assert.strictEqual(grid.hidden,false);

console.log('project single-surface DOM tests passed');
