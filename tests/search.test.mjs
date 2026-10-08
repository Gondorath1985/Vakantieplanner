import test from 'node:test';import assert from 'node:assert/strict';import {rank} from '../search.mjs';import {samples,countryCodes} from '../data.mjs';
const defaults={visited:[],region:'',budget:100000,people:2,minTemp:-50,maxTemp:60,weights:{natuur:10}};
test('all country codes are unique',()=>{assert.equal(countryCodes.length,249);assert.equal(new Set(countryCodes).size,249)});
test('visited destinations never appear',()=>{assert.ok(!rank(samples,{...defaults,visited:['PT','JP']}).some(d=>['PT','JP'].includes(d.code)))});
test('region, temperature and total cost constrain results',()=>{const results=rank(samples,{...defaults,region:'Europa',budget:3500,minTemp:23});assert.deepEqual(results.map(x=>x.code).sort(),['ES'])});
test('preferences change destination ranking',()=>{assert.ok(rank(samples,defaults)[0].scores.natuur===10);assert.equal(rank(samples,{...defaults,weights:{steden:10}})[0].code,'JP')});
test('zero preferences produce finite zero scores',()=>{assert.ok(rank(samples,{...defaults,weights:{natuur:0}}).every(d=>d.score===0))});
test('unaffordable trips produce empty results',()=>assert.equal(rank(samples,{...defaults,budget:0}).length,0));
