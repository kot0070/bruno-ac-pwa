'use strict';
const assert=require('assert');
const UX=require('../service-journal-ux.js');

assert.strictEqual(UX.friendlyTaxSummary('TX','Texas','0.00%'),'TX · Effective 0.00%');
assert.strictEqual(UX.friendlyTaxSummary('','Texas','16.21%'),'Texas · Effective 16.21%');
assert.strictEqual(UX.friendlyTaxSummary('TX','',''),'TX');
assert.strictEqual(UX.friendlyTaxSummary('','',''),'Tap to review rates');

console.log('service-journal-ux tests passed');
