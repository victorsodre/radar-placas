import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createModel,applyPose,capturePose,plateCorners,travelX} from './model.ts';
import {conditions} from '../simulation/flow.ts';
import {projectRegion} from './projection.ts';
import {fit} from './camera.ts';

test('vehicle and invented plate travel together and return exactly to their origin',()=>{
 const m=createModel();assert.deepEqual(m.parts.map(p=>p.id),['vehicle','plate','camera','field']);
 const origins=m.parts.map(p=>p.group.position.clone());
 for(const t of [0,.2,.5,1,.35,0]){
  applyPose(m,t,'clear');assert.equal(m.parts[0].group.position.x,travelX(t));
  assert.equal(m.parts[1].group.position.x,travelX(t));
  assert.equal(m.wheels[0].rotation.z,-(travelX(t)-travelX(0))/.34);
 }
 m.parts.forEach((p,i)=>assert.ok(p.group.position.distanceTo(origins[i])<1e-12));
 m.root.traverse(o=>{if(o instanceof T.Mesh)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v))});m.dispose();
});
test('capture camera sees the complete plate at the exact crossing in every condition',()=>{
 const m=createModel();
 for(const c of conditions){
  applyPose(m,.5,c.id);m.root.updateMatrixWorld(true);const pose=capturePose(c.id),cam=new T.PerspectiveCamera(40,16/9,.05,100);
  cam.position.copy(pose.position);cam.lookAt(pose.target);cam.updateMatrixWorld(true);
  const region=projectRegion(plateCorners(m),cam,1280,720);
  assert.ok(region.x>=0&&region.y>=0&&region.x+region.width<=1280&&region.y+region.height<=720);
  assert.ok(region.width>60&&region.height>20);
  assert.equal(region.points.length,4);
 }
 m.dispose();
});
test('framing keeps all parts in view across travel, conditions and screen proportions',()=>{
 const m=createModel();
 for(const c of conditions)for(const p of [0,.5,1]){
  applyPose(m,p,c.id);m.root.updateMatrixWorld(true);const b=new T.Box3();m.parts.forEach(part=>b.expandByObject(part.group));
  for(const aspect of [.5,1,1.7,2.2]){
   const cam=new T.PerspectiveCamera(38,aspect,.1,200);fit(cam,b,new T.Vector3(10,8,13));cam.updateMatrixWorld(true);
   for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
    const v=new T.Vector3(x,y,z).project(cam);assert.ok(Math.abs(v.x)<=1&&Math.abs(v.y)<=1&&v.z>=-1&&v.z<=1);
   }
  }
 }m.dispose();
});
test('in the open-angle pose the end of the plate after LAB3 (D) is the one farther from the camera',()=>{
 const m=createModel();applyPose(m,.5,'angle');m.root.updateMatrixWorld(true);
 const camera=capturePose('angle').position,[first,last]=plateCorners(m);
 assert.ok(last.distanceTo(camera)>first.distanceTo(camera));m.dispose();
});
test('the car crosses the capture mark at mid-pass without a jump in speed',()=>{
 assert.equal(travelX(.5),0);const h=1e-4;
 assert.ok(Math.abs((travelX(.5)-travelX(.5-h))-(travelX(.5+h)-travelX(.5)))<1e-6);
 assert.ok(travelX(1)>travelX(.9));
});
test('the car stops short of the camera pole in every condition and never overlaps it',()=>{
 const m=createModel();
 for(const c of conditions)for(const t of [0,.5,.9,1]){
  applyPose(m,t,c.id);m.root.updateMatrixWorld(true);
  const car=new T.Box3().setFromObject(m.parts[0].group).union(new T.Box3().setFromObject(m.parts[1].group));
  const pole=new T.Box3().setFromObject(m.pole);pole.expandByScalar(.15);
  assert.ok(!car.intersectsBox(pole),`${c.id} at ${t}`);
  assert.ok(pole.min.x-car.max.x>1,`gap at ${c.id} ${t}`);
 }
 m.dispose();
});
test('the infrared beam guide runs from the camera lens to the plate at the capture point',()=>{
 const m=createModel();applyPose(m,.5,'infrared');m.root.updateMatrixWorld(true);
 const pose=capturePose('infrared'),tip=new T.Vector3(0,.5,0).applyMatrix4(m.irBeam.matrixWorld),base=new T.Vector3(0,-.5,0).applyMatrix4(m.irBeam.matrixWorld);
 assert.ok(tip.distanceTo(pose.position)<1e-6&&base.distanceTo(pose.target)<1e-6);m.dispose();
});
