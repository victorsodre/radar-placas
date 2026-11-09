import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {catalog} from '../content/catalog.ts';
import {unit,type Condition} from '../simulation/flow.ts';
import type {Part} from './types.ts';
/** The car crosses the capture mark at mid-pass at constant speed, then brakes and stops 3 m short of the camera base: it never reaches the pole. */
const approach=4,stopAt=2;
export const travelX=(progress:number)=>{const p=unit(progress);if(p<=.5)return approach*(2*p-1);const s=2*p-1;return stopAt*(1-(1-s)**2)};
export function capturePose(condition:Condition){return {position:new T.Vector3(7,2.35,condition==='angle'?5.6:1.8),target:new T.Vector3(2.04,.72,0)}}
const standard=(color:string,metalness=0,roughness=.6)=>new T.MeshStandardMaterial({color,metalness,roughness});
const quad=(points:number[],material:T.Material)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return new T.Mesh(g,material)};
export function createModel(plateTexture?:T.Texture){
 const root=new T.Group(),parts:Part[]=catalog.map(p=>{const group=new T.Group();group.userData.partId=p.id;root.add(group);return {...p,group}});
 const [vehicle,plate,camera,field]=parts.map(p=>p.group),wheels:T.Group[]=[];
 const paint=standard('#b9633f',.25,.32),trim=standard('#17212c',.2,.5),glass=standard('#263d50',.5,.17),chrome=standard('#a3b2bf',.8,.25),rubber=standard('#13191e',0,.9);
 const box=(parent:T.Group,w:number,h:number,d:number,x:number,y:number,z:number,material:T.Material,r=.04)=>{const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,r),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh};
 box(vehicle,3.95,.62,1.8,0,.85,0,paint,.13);box(vehicle,3.7,.16,1.7,0,.51,0,trim);
 const shape=new T.Shape();shape.moveTo(-1.25,1.13);shape.lineTo(-.9,1.78);shape.lineTo(.43,1.78);shape.lineTo(1,1.13);shape.closePath();
 const cabin=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:1.54,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1}),paint);cabin.position.z=-.77;cabin.castShadow=true;vehicle.add(cabin);
 for(const side of [-1,1]){
  const z=.801*side;const window=quad([-1.1,1.2,z,-.83,1.68,z,.37,1.68,z,.81,1.2,z],glass);glass.side=T.DoubleSide;vehicle.add(window);
  box(vehicle,.045,.5,.03,-.2,1.43,z,trim,.008);box(vehicle,.25,.055,.04,-.45,1.04,side*.91,chrome,.01);
  box(vehicle,.28,.13,.2,.65,1.24,side*1.0,paint);
 }
 vehicle.add(quad([.54,1.7,-.7,.54,1.7,.7,.99,1.2,.7,.99,1.2,-.7],glass));
 vehicle.add(quad([-1.26,1.19,-.7,-1.26,1.19,.7,-.99,1.69,.7,-.99,1.69,-.7],glass));
 for(const x of [-1.22,1.22])for(const z of [-.91,.91]){
  const wheel=new T.Group();wheel.position.set(x,.43,z);vehicle.add(wheel);wheels.push(wheel);
  const tire=new T.Mesh(new T.TorusGeometry(.255,.085,10,28),rubber);wheel.add(tire);tire.castShadow=true;
  const hub=new T.Mesh(new T.CylinderGeometry(.2,.2,.14,24),chrome);hub.rotation.x=Math.PI/2;wheel.add(hub);
  for(let i=0;i<5;i++){const spoke=box(wheel,.27,.035,.02,0,0,z>0?.08:-.08,trim,.008);spoke.rotation.z=i*Math.PI/5;}
 }
 box(vehicle,.08,.17,1.6,1.98,.63,0,trim);box(vehicle,.08,.17,1.6,-1.98,.63,0,trim);
 const lamp=new T.MeshStandardMaterial({color:'#f1eee1',emissive:'#fff2bf',emissiveIntensity:.2,roughness:.25});
 for(const z of [-.6,.6]){box(vehicle,.05,.2,.38,1.99,.95,z,lamp);box(vehicle,.05,.17,.35,-1.99,.96,z,standard('#802d2c'))}
 for(let i=0;i<4;i++)box(vehicle,.04,.025,.5,2.02,.83+i*.04,0,trim,.006);
 box(plate,.075,.35,1.05,2.01,.72,0,trim,.035);
 const plateFace=new T.Mesh(new T.PlaneGeometry(.95,.27),new T.MeshStandardMaterial({color:'#f0f1e8',map:plateTexture??null,roughness:.7}));plateFace.rotation.y=Math.PI/2;plateFace.position.set(2.052,.72,0);plate.add(plateFace);
 const road=new T.Group();root.add(road);box(road,17,.16,3.5,0,0,0,standard('#272c35'),.06);
 for(const z of [-1.6,1.6])box(road,16.7,.012,.055,0,.089,z,standard('#c4c0ac'),.005);
 for(let x=-7;x<=7;x+=2)box(road,.9,.015,.055,x,.09,0,standard('#bcbcb1'),.005);
 box(road,.045,.02,3.15,0,.1,0,standard('#ffd21f'),.005);
 const cameraBody=new T.Group();camera.add(cameraBody);
 const pole=new T.Mesh(new T.CylinderGeometry(.055,.075,2.15,16),chrome);pole.position.y=1.08;camera.add(pole);
 box(camera,.45,.12,.45,0,.06,0,trim);
 box(cameraBody,.3,.3,.65,0,0,-.3,standard('#d4d9dc',.3,.4));box(cameraBody,.36,.05,.8,0,.17,-.3,standard('#dde1e0',.3,.4));
 const lens=new T.Mesh(new T.CylinderGeometry(.105,.105,.1,24),trim);lens.rotation.x=Math.PI/2;lens.position.z=.03;cameraBody.add(lens);
 const optic=new T.Mesh(new T.CircleGeometry(.073,24),glass);optic.position.z=.085;cameraBody.add(optic);
 // Infrared illuminator: a ring around the lens and a beam guide, shown only in the "Noite com IR" condition.
 // IR is invisible to the eye; the red colour is a drawing convention, as the scene note says.
 const irRing=new T.Mesh(new T.TorusGeometry(.13,.022,8,32),new T.MeshStandardMaterial({color:'#3a0d14',emissive:'#ff3b4e',emissiveIntensity:2.2,roughness:.4}));irRing.position.z=.06;irRing.visible=false;cameraBody.add(irRing);
 const irBeam=new T.Mesh(new T.ConeGeometry(.55,1,32,1,true),new T.MeshBasicMaterial({color:'#ff3b4e',transparent:true,opacity:.11,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));irBeam.visible=false;irBeam.raycast=()=>{};field.add(irBeam);
 const fg=new T.BufferGeometry(),fm=new T.MeshBasicMaterial({color:'#ffd21f',transparent:true,opacity:.045,side:T.DoubleSide,depthWrite:false});
 const fieldMesh=new T.Mesh(fg,fm);field.add(fieldMesh);fieldMesh.raycast=()=>{};
 const lg=new T.BufferGeometry(),lines=new T.LineSegments(lg,new T.LineBasicMaterial({color:'#d4b65f',transparent:true,opacity:.38}));field.add(lines);lines.raycast=()=>{};
 const model={root,parts,wheels,road,plateFace,cameraBody,pole,fieldMesh,lines,irRing,irBeam,condition:null as Condition|null,dispose(){const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m)}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose())}};
 applyPose(model,0,'clear');return model;
}
export type Model=ReturnType<typeof createModel>;
export function plateCorners(model:Model){return [[-.475,-.135],[.475,-.135],[.475,.135],[-.475,.135]].map(([x,y])=>model.plateFace.localToWorld(new T.Vector3(x,y,0)))}
export function applyPose(model:Model,progress:number,condition:Condition){
 const x=travelX(progress);model.parts[0].group.position.x=x;model.parts[1].group.position.x=x;for(const w of model.wheels)w.rotation.z=-(x-travelX(0))/.34;
 if(model.condition===condition)return;model.condition=condition;
 const pose=capturePose(condition),base=model.parts[2].group;base.position.set(pose.position.x,0,pose.position.z);
 model.cameraBody.position.set(0,pose.position.y,0);model.cameraBody.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),pose.target.clone().sub(pose.position).normalize());
 const cam=new T.PerspectiveCamera(40,16/9,.05,100);cam.position.copy(pose.position);cam.lookAt(pose.target);cam.updateMatrixWorld(true);
 const forward=pose.target.clone().sub(pose.position).normalize(),distance=pose.target.distanceTo(pose.position);
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([cx,cy])=>{const ray=new T.Vector3(cx,cy,.5).unproject(cam).sub(pose.position).normalize();return pose.position.clone().addScaledVector(ray,distance/ray.dot(forward))});
 const vertices:number[]=[],edges:number[]=[];
 for(let i=0;i<4;i++){vertices.push(...pose.position.toArray(),...corners[i].toArray(),...corners[(i+1)%4].toArray());edges.push(...pose.position.toArray(),...corners[i].toArray(),...corners[i].toArray(),...corners[(i+1)%4].toArray())}
 // Beam guide: from the lens to the plate at the capture point (cone apex at the camera).
 const toTarget=pose.target.clone().sub(pose.position),length=toTarget.length();
 model.irBeam.scale.set(1,length,1);model.irBeam.position.copy(pose.position).addScaledVector(toTarget,.5);model.irBeam.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),toTarget.normalize());
 model.fieldMesh.geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));model.fieldMesh.geometry.computeBoundingSphere();model.lines.geometry.setAttribute('position',new T.Float32BufferAttribute(edges,3));model.lines.geometry.computeBoundingSphere();
}
