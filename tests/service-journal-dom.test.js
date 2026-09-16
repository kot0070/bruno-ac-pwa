'use strict';
const assert=require('assert');
const fs=require('fs');
const {JSDOM}=require('jsdom');

const html='<!doctype html><html><head></head><body><section class="panel active" id="panel-dispatch"></section></body></html>';
const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'outside-only'});
const {window}=dom;
window.localStorage.setItem('bruno-ac-service-journal-v2',JSON.stringify({
  schemaVersion:4,selectedDate:'2026-09-16',viewMode:'day',
  settings:{location:'Dripping Springs, TX',jurisdiction:'TX'},workers:[],crew:[],
  calls:[{id:'call-1',date:'2026-09-16',time:'09:30',address:'123 Test Rd',description:'Service check',hours:1.5,gross:225,status:'done'}]
}));
window.eval(fs.readFileSync('service-journal-ux.js','utf8'));
window.BrunoServiceJournalUX.init();

const panel=window.document.getElementById('panel-dispatch');
assert.strictEqual(panel.dataset.serviceJournalVersion,'5');
const tax=window.document.getElementById('sj5-tax');
assert(tax,'tax details exists');
assert.strictEqual(tax.open,false,'tax details default collapsed');
assert(window.document.getElementById('sj5-tax-summary').textContent.includes('TX'));

const call=window.document.querySelector('.sj5-call-card[data-call-id="call-1"]');
assert(call,'saved call renders as compact static card');
assert.strictEqual(call.querySelector('input'),null,'saved card has no inline input');
assert.strictEqual(call.querySelector('textarea'),null,'saved card has no inline textarea');
assert(call.textContent.includes('123 Test Rd'));
assert(call.textContent.includes('$225.00'));

call.querySelector('[data-edit-call="call-1"]').click();
const modal=window.document.getElementById('sj5-call-modal');
assert(modal.classList.contains('open'),'Edit opens modal');
window.document.getElementById('sj5-call-address').value='456 Updated Ave';
const submit=new window.Event('submit',{bubbles:true,cancelable:true});
window.document.getElementById('sj5-call-form').dispatchEvent(submit);
assert(!modal.classList.contains('open'),'Save closes modal');
const updated=window.document.querySelector('.sj5-call-card[data-call-id="call-1"]');
assert(updated.textContent.includes('456 Updated Ave'),'Save returns updated static card');
assert.strictEqual(updated.querySelector('input'),null);

tax.open=true;
window.document.getElementById('sj5-tax-close').click();
assert.strictEqual(tax.open,false,'explicit collapse action closes tax details');

console.log('service-journal DOM tests passed');
