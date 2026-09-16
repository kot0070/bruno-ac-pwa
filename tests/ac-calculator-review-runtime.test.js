'use strict';
const assert=require('assert');
const fs=require('fs');
const {JSDOM}=require('jsdom');
const src=fs.readFileSync('ac-calculator-review-ux.js','utf8');
const html='<!doctype html><html><head></head><body>'+
'<div id="phase1CalcState" class="calc-state ready">ready</div>'+
'<section id="calcExplain"><div class="calc-flow"></div><div class="calc-explain-grid"></div><h3>Why / references used</h3><ul id="calcRefList"></ul><span id="calcBomInfo"></span><span id="calcBomDetail"></span></section>'+
'<table><tbody id="bomBody"><tr class="row-unresolved"><td><input class="bomsel" type="checkbox" checked></td><td><strong>Disconnect</strong></td></tr></tbody></table>'+
'<button id="phase1Apply"></button><span id="phase1ApplyHint"></span><button id="apply"></button>'+
'<div><span id="statCustomer"></span></div><div><span id="statYour"></span></div><div><span id="statMargin"></span></div><div><span id="statMarginPct"></span></div>'+
'</body></html>';
const dom=new JSDOM(html,{url:'https://example.test/ac-calculator.html',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.eval(src);
function tick(ms=10){return new Promise(r=>w.setTimeout(r,ms));}
(async()=>{
  await tick();
  const status=w.document.getElementById('phase1CalcState');
  const apply=w.document.getElementById('phase1Apply');
  assert(status.classList.contains('action-required'),'unresolved selected row must execute review runtime and block Apply');
  assert.strictEqual(apply.disabled,true);
  assert.strictEqual(w.document.getElementById('reviewAttention').textContent,'1');
  const row=w.document.querySelector('#bomBody tr');
  row.classList.remove('row-unresolved');
  await tick();
  assert(status.classList.contains('ready'),'observer must resync to ready after row correction');
  assert.strictEqual(apply.disabled,false);
  assert.strictEqual(w.document.getElementById('reviewAttention').textContent,'0');
  const stable=status.textContent;
  await tick(30);
  assert.strictEqual(status.textContent,stable,'review-owned DOM writes must settle without a self-triggering observer loop');
  console.log('ac-calculator review runtime tests passed');
  w.close();
})().catch(e=>{console.error(e);process.exit(1)});
