'use strict';
const assert=require('assert');
const fs=require('fs');
const {JSDOM}=require('jsdom');

(async()=>{
 const dom=new JSDOM('<!doctype html><html><head></head><body><section id="projectEstimatorWizard"><section id="pew-history"></section><section id="pls-load"><h3>Heating / Cooling Load</h3><div>load body</div></section><section id="pes-equipment"><h3>Equipment Capacity / Selection</h3><div>equipment body</div></section><section id="pcp-pricing"><h3>Catalog Resolution / Live Pricing</h3><div>pricing body</div></section><section id="pcg-gate"><h3>Compliance / Apply Gate</h3><div>gate body</div></section></section></body></html>',{runScripts:'dangerously',url:'https://example.test/ac-calculator.html'});
 const w=dom.window;
 w.BrunoCurrentLoadResult={cooling_total_Btuh:48000};
 w.BrunoCurrentEquipmentResult={final:{capacityBtuh:50000,systemCount:1}};
 w.BrunoCurrentPricedBOM={totals:{customerMaterials:6000,yourCost:4300}};
 w.BrunoCurrentComplianceGate={status:'blocked',blockers:['field_measurement_required']};
 w.eval(fs.readFileSync('project-runtime-summary.js','utf8'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 await new Promise(r=>setTimeout(r,130));
 assert(w.document.getElementById('bruno-runtime-summary'),'runtime result strip must render');
 assert.strictEqual(w.document.getElementById('brs-load').textContent,'48,000 BTU/h');
 assert.strictEqual(w.document.getElementById('brs-capacity').textContent,'50,000 BTU/h');
 assert.strictEqual(w.document.getElementById('brs-systems').textContent,'1');
 assert.strictEqual(w.document.getElementById('brs-customer').textContent,'$6,000.00');
 assert.strictEqual(w.document.getElementById('brs-your').textContent,'$4,300.00');
 assert.strictEqual(w.document.getElementById('brs-count').textContent,'1');
 assert(w.document.getElementById('brs-blockers').textContent.includes('field_measurement_required'));
 assert(w.document.querySelector('#pls-load .brs-section-toggle'),'major live sections must be collapsible');
 w.BrunoCurrentComplianceGate={status:'ready',blockers:[]};
 w.document.dispatchEvent(new w.CustomEvent('bruno:compliance-updated',{detail:{status:'ready',blockers:[]}}));
 assert(w.document.getElementById('brs-blockers').textContent.includes('READY'));
 console.log('project runtime summary DOM tests passed');
})().catch(e=>{console.error(e);process.exit(1)});
