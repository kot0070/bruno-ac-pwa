'use strict';
const assert=require('assert');
const core=require('../project-catalog-pricing-engine.js');
const rows=[
 {key:'line-set-ft',label:'Line set',final_qty:40,unit:'ft',catalog_id:null},
 {key:'indoor-support',label:'Support',final_qty:1,unit:'kit',catalog_id:null},
 {key:'equipment-primary',label:'Equipment',final_qty:1,unit:'ea',catalog_id:'eq-1'}
];
const catalog=[
 {id:'ac-ls-17',item:'Line set',unitCost:10,yourCost:7},
 {id:'ac-pd-06',item:'Support',unitCost:100,yourCost:''},
 {id:'eq-1',item:'Equipment',unitCost:4000,yourCost:3000}
];
const r=core.resolve(rows,catalog,{});
assert.strictEqual(r.status,'ready');
assert.strictEqual(r.resolved,3);
assert.strictEqual(r.total,3);
assert.strictEqual(r.totals.customerMaterials,4500);
assert.strictEqual(r.totals.yourCost,3380);
assert.strictEqual(r.totals.marginDollar,1120);
const support=r.rows.find(x=>x.key==='indoor-support');
assert.strictEqual(support.pricing.yourCostSource,'customer-price-fallback');
assert.strictEqual(support.pricing.yourUnitCost,100);
const zero=core.resolve([{key:'x',label:'x',final_qty:2,unit:'ea',catalog_id:'z'}],[{id:'z',unitCost:10,yourCost:0}],{});
assert.strictEqual(zero.rows[0].pricing.yourUnitCost,0);
assert.strictEqual(zero.rows[0].pricing.yourCostSource,'catalog-your-cost');
const invalid=core.resolve([{key:'x',label:'x',final_qty:1,unit:'ea',catalog_id:'bad'}],[{id:'bad',unitCost:'abc',yourCost:1}],{});
assert.strictEqual(invalid.status,'blocked');
assert(invalid.blockers[0].includes('invalid_or_missing_customer_price'));
const invalidYour=core.resolve([{key:'x',label:'x',final_qty:1,unit:'ea',catalog_id:'bad2'}],[{id:'bad2',unitCost:10,yourCost:'abc'}],{});
assert.strictEqual(invalidYour.status,'blocked');
assert(invalidYour.blockers[0].includes('invalid_your_cost'));
const unresolved=core.resolve([{key:'unknown',label:'u',final_qty:1,unit:'ea'}],catalog,{});
assert.strictEqual(unresolved.status,'provisional');
assert.deepStrictEqual(unresolved.unresolved,['unknown']);
const bound=core.resolve([{key:'unknown',label:'u',final_qty:2,unit:'ea'}],catalog,{unknown:'ac-pd-06'});
assert.strictEqual(bound.status,'ready');
assert.strictEqual(bound.rows[0].catalog_resolution_source,'binding');
console.log('project catalog pricing tests passed');
