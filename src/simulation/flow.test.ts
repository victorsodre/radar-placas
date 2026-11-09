import test from 'node:test';
import assert from 'node:assert/strict';
import {initialFlow,startPass,advanceFlow,nextStage,changeCondition,conditions,stageIndex} from './flow.ts';
import {crossVerdict} from './crosscheck.ts';

test('a pass captures once at the crossing, stops at the end and reaches review in order',()=>{
 let s=startPass(initialFlow());assert.equal(s.stage,'ready');
 assert.equal(nextStage(s).stage,'ready');
 for(let i=0;i<19;i++)s=advanceFlow(s,.1,true);
 assert.equal(s.stage,'ready');s=advanceFlow(s,.1,true);assert.equal(s.stage,'captured');
 for(let i=0;i<30;i++)s=advanceFlow(s,.1,true);
 assert.equal(s.progress,1);assert.equal(s.running,false);
 for(const stage of ['cropped','recognized','reviewed','crossed']){s=nextStage(s);assert.equal(s.stage,stage)}
 assert.deepEqual(nextStage(s),s);
});
test('pause, visibility and bounded deltas cannot advance or skip the capture',()=>{
 const s=startPass(initialFlow());assert.deepEqual(advanceFlow({...s,running:false},.1,true),{...s,running:false});
 assert.deepEqual(advanceFlow(s,20,false),s);
 for(const dt of [NaN,Infinity,-1])assert.deepEqual(advanceFlow(s,dt,true),s);
 const limited=advanceFlow(s,20,true);assert.ok(limited.progress<=.0251);assert.equal(limited.stage,'ready');
});
test('changing condition keeps the pass and its stage but invalidates the image with a new revision',()=>{
 let s=startPass(initialFlow(),true);s=nextStage(nextStage(nextStage(s)));assert.equal(s.stage,'reviewed');
 for(const condition of conditions.map(c=>c.id)){
  const prior=s;s=changeCondition(s,condition);
  if(prior.condition===condition){assert.equal(s,prior);continue}
  assert.equal(s.condition,condition);assert.equal(s.stage,'reviewed');assert.equal(s.progress,1);assert.equal(s.running,false);assert.equal(s.revision,prior.revision+1);
 }
 const moving=advanceFlow(startPass(initialFlow()),.1,true),changed=changeCondition(moving,'dark');
 assert.equal(changed.running,true);assert.equal(changed.progress,moving.progress);assert.equal(changed.stage,'ready');
 const next=startPass(s);assert.equal(next.revision,s.revision+1);assert.equal(stageIndex(next.stage),0);assert.equal(next.condition,s.condition);
});
test('every condition has a five-character demonstration and only complete readings enter the cross-check',()=>{
 for(const c of conditions)assert.match(c.result,/^[A-Z0-9?]{5}$/);
 const byId=Object.fromEntries(conditions.map(c=>[c.id,c.result]));
 assert.equal(byId.infrared,'LAB3D');assert.ok(byId.dark.includes('?'));
 assert.ok(byId.angle.endsWith('?'),'the far end of the plate (D, at -z) loses detail in the open-angle pose');
 for(const c of conditions)assert.equal(crossVerdict(c.result,30).verdict==='incomplete',c.result.includes('?'));
});
