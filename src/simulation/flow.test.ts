import test from 'node:test';
import assert from 'node:assert/strict';
import {initialFlow,startPass,advanceFlow,nextStage,changeCondition,conditions,stageIndex} from './flow.ts';

test('a pass captures once at the crossing, stops at the end and reaches review in order',()=>{
 let s=startPass(initialFlow());assert.equal(s.stage,'ready');
 assert.equal(nextStage(s).stage,'ready');
 for(let i=0;i<19;i++)s=advanceFlow(s,.1,true);
 assert.equal(s.stage,'ready');s=advanceFlow(s,.1,true);assert.equal(s.stage,'captured');
 for(let i=0;i<30;i++)s=advanceFlow(s,.1,true);
 assert.equal(s.progress,1);assert.equal(s.running,false);
 for(const stage of ['cropped','recognized','reviewed']){s=nextStage(s);assert.equal(s.stage,stage)}
 assert.deepEqual(nextStage(s),s);
});
test('pause, visibility and bounded deltas cannot advance or skip the capture',()=>{
 const s=startPass(initialFlow());assert.deepEqual(advanceFlow({...s,running:false},.1,true),{...s,running:false});
 assert.deepEqual(advanceFlow(s,20,false),s);
 for(const dt of [NaN,Infinity,-1])assert.deepEqual(advanceFlow(s,dt,true),s);
 const limited=advanceFlow(s,20,true);assert.ok(limited.progress<=.0251);assert.equal(limited.stage,'ready');
});
test('changing conditions or replaying invalidates all prior results with a new revision',()=>{
 let s=startPass(initialFlow(),true);s=nextStage(nextStage(nextStage(s)));assert.equal(s.stage,'reviewed');
 for(const condition of conditions.map(c=>c.id)){
  const prior=s; s=changeCondition(s,condition);
  if(prior.condition!==condition){assert.equal(s.stage,'ready');assert.equal(s.progress,0);assert.equal(s.revision,prior.revision+1)}
  s=startPass(s,true);assert.equal(s.stage,'captured');assert.equal(s.running,false);assert.equal(s.progress,1);
 }
 const next=startPass(s);assert.equal(next.revision,s.revision+1);assert.equal(stageIndex(next.stage),0);
});
