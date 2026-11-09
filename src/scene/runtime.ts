import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createModel,applyPose,capturePose,plateCorners} from './model.ts';
import {projectRegion} from './projection.ts';
import {fit} from './camera.ts';
import {saveSceneImage} from './capture.ts';
import type {SceneHandle,ViewState} from './types.ts';

function plateTexture(){
 const canvas=document.createElement('canvas');canvas.width=760;canvas.height=216;const ctx=canvas.getContext('2d')!;
 ctx.fillStyle='#eeeee8';ctx.fillRect(0,0,760,216);ctx.fillStyle='#2c4766';ctx.fillRect(0,0,760,34);
 ctx.textAlign='center';ctx.fillStyle='#f4f4ef';ctx.font='18px Archivo';ctx.fillText('LABORATÓRIO',380,25);
 ctx.fillStyle='#111820';ctx.font='500 132px "JetBrains Mono", monospace';ctx.fillText('LAB3D',380,164);
 ctx.font='16px Archivo';ctx.fillText('CENOGRÁFICA',380,202);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}
const day={hemi:1.1,key:3,rim:1.8,env:.45},night={hemi:.1,key:.22,rim:.5,env:.05},darkCaptureExposure=.025,infraredCaptureExposure=.08,retroreflection=7;
/** Infrared frames carry no colour: keep only the luminance. */
function toGrayscale(ctx:CanvasRenderingContext2D,width:number,height:number){
 const image=ctx.getImageData(0,0,width,height),data=image.data;
 for(let i=0;i<data.length;i+=4){const y=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722;data[i]=data[i+1]=data[i+2]=y}
 ctx.putImageData(image,0,0);
}
export function createScene(host:HTMLElement,onPick:(id:string)=>void,onError:(text:string)=>void):SceneHandle{
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Carro, placa inventada e câmera virtual. Arraste para girar; a lista oferece seleção por teclado.');host.append(renderer.domElement);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,200),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.minDistance=1;controls.maxDistance=80;
 // Vertical swipes scroll the page; horizontal drags and pinches stay with the scene.
 renderer.domElement.style.touchAction='pan-y';
 const room=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer),env=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();scene.environment=env.texture;scene.environmentIntensity=.45;
 const hemi=new T.HemisphereLight('#dce9ff','#3c3030',1.1);scene.add(hemi);
 const key=new T.DirectionalLight('#ffecd4',3);key.position.set(1,10,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-12,right:12,top:10,bottom:-10,far:35});key.shadow.bias=-.0005;scene.add(key);
 const rim=new T.DirectionalLight('#a4c5fa',1.8);rim.position.set(-6,5,-7);scene.add(rim);
 const texture=plateTexture(),model=createModel(texture);scene.add(model.root);
 const face=model.plateFace.material as T.MeshStandardMaterial,plateGlow={color:face.emissive.clone(),map:face.emissiveMap,intensity:face.emissiveIntensity};
 /** The scene itself shows the condition: night darkens it; with IR the illuminator, its beam guide and the retroreflective plate light up. */
 const light=(condition:ViewState['condition'])=>{
  const dark=condition==='dark'||condition==='infrared',level=dark?night:day,ir=condition==='infrared';
  hemi.intensity=level.hemi;key.intensity=level.key;rim.intensity=level.rim;scene.environmentIntensity=level.env;key.color.set(dark?'#9fb4e0':'#ffecd4');
  model.irRing.visible=ir;model.irBeam.visible=ir;
  if(ir){face.emissive.set('#ffffff');face.emissiveMap=face.map;face.emissiveIntensity=.9}else{face.emissive.copy(plateGlow.color);face.emissiveMap=plateGlow.map;face.emissiveIntensity=plateGlow.intensity}
  face.needsUpdate=true;
 };
 const highlight=new T.BoxHelper(new T.Object3D(),'#ffd21f');highlight.visible=false;scene.add(highlight);
 let state:ViewState={progress:0,condition:'clear',selected:null,isolated:false,wireframe:false};
 let disposed=false,active=false,lostContext=false,last=-Infinity,previousPose:{position:T.Vector3;target:T.Vector3}|null=null;
 const direction=new T.Vector3(10,8,13),whole=new T.Box3(new T.Vector3(-8.6,-.1,-2),new T.Vector3(8.6,3,6));
 const selected=()=>model.parts.find(p=>p.id===state.selected);
 const bounds=()=>{if(state.isolated&&selected())return new T.Box3().setFromObject(selected()!.group);const b=whole.clone();b.max.z=state.condition==='angle'?6:3.3;return b};
 const invalidate=()=>{if(disposed||active||document.hidden||lostContext)return;active=true;renderer.setAnimationLoop(frame)};
 function frame(time:number){
  if(time-last<1000/30)return;last=time;renderer.render(scene,camera);
  Object.assign(renderer.domElement.dataset,{renderCount:String(Number(renderer.domElement.dataset.renderCount??0)+1),drawCalls:String(renderer.info.render.calls),triangles:String(renderer.info.render.triangles),cameraPose:JSON.stringify([...camera.position.toArray(),...controls.target.toArray()])});
  renderer.setAnimationLoop(null);active=false;
 }
 const frameBox=(box:T.Box3,toward:T.Vector3)=>{controls.target.copy(fit(camera,box,toward));controls.update();invalidate()};
 /** Keeps the visitor's orbit direction and only adjusts distance to the new box or aspect. */
 const orbitDirection=()=>{const d=camera.position.clone().sub(controls.target);return d.lengthSq()>1e-8?d:direction.clone()};
 const home=()=>frameBox(bounds(),direction);
 const reframe=()=>frameBox(bounds(),orbitDirection());
 const resize=()=>{const {width,height}=host.getBoundingClientRect();if(width<1||height<1)return;const changed=Math.abs(camera.aspect-width/height)>.0001;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();if(changed)reframe();invalidate()};
 const observer=new ResizeObserver(resize);observer.observe(host);controls.addEventListener('change',invalidate);
 // A pick is a short, still, single-pointer tap on a part. Drags, pinches and taps on empty space change nothing.
 const down=new T.Vector2(),pointers=new Set<number>();let downAt=0,multi=false;
 const pointerDown=(e:PointerEvent)=>{pointers.add(e.pointerId);multi=pointers.size>1;if(!multi){down.set(e.clientX,e.clientY);downAt=e.timeStamp}};
 const pointerEnd=(e:PointerEvent)=>{pointers.delete(e.pointerId)};
 const pointerUp=(e:PointerEvent)=>{
  const wasMulti=multi;pointerEnd(e);if(!pointers.size)multi=false;
  if(wasMulti||e.button>0||e.timeStamp-downAt>500||down.distanceTo(new T.Vector2(e.clientX,e.clientY))>6)return;
  const rect=renderer.domElement.getBoundingClientRect(),ray=new T.Raycaster(),meshes:T.Mesh[]=[];
  ray.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
  model.parts.forEach(p=>p.group.traverseVisible(o=>{if(o instanceof T.Mesh)meshes.push(o)}));
  let hit:T.Object3D|undefined=ray.intersectObjects(meshes,false)[0]?.object;while(hit&&!hit.userData.partId)hit=hit.parent??undefined;if(hit)onPick(hit.userData.partId);
 };
 // The wheel scrolls the page; Ctrl/⌘ + wheel (and the trackpad pinch, which sends ctrlKey) zooms the scene.
 const wheel=(e:WheelEvent)=>{if(!e.ctrlKey&&!e.metaKey)e.stopPropagation()};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',pointerEnd);host.addEventListener('wheel',wheel,{capture:true});
 const visibility=()=>{if(document.hidden){renderer.setAnimationLoop(null);active=false}else{last=-Infinity;invalidate()}};document.addEventListener('visibilitychange',visibility);
 const lost=(e:Event)=>{e.preventDefault();lostContext=true;renderer.setAnimationLoop(null);active=false;onError('A cena 3D foi interrompida. Recarregue para restaurá-la. As explicações e fontes continuam disponíveis.')};renderer.domElement.addEventListener('webglcontextlost',lost);
 const wire=(value:boolean)=>model.root.traverse(o=>{if(o instanceof T.Mesh){for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial)m.wireframe=value}});
 resize();home();
 return {parts:model.parts,
  update(next){const oldIsolated=state.isolated,oldCondition=state.condition;state=next;applyPose(model,state.progress,state.condition);model.root.updateMatrixWorld(true);model.parts.forEach(p=>p.group.visible=!state.isolated||p.id===state.selected);model.road.visible=!state.isolated;wire(state.wireframe);if(oldCondition!==state.condition)light(state.condition);
   highlight.visible=Boolean(selected())&&!state.isolated;if(selected())highlight.setFromObject(selected()!.group);
   if(!oldIsolated&&state.isolated){previousPose={position:camera.position.clone(),target:controls.target.clone()};reframe()}
   if(oldIsolated&&!state.isolated&&previousPose){camera.position.copy(previousPose.position);controls.target.copy(previousPose.target);controls.update();previousPose=null}
   if(oldCondition!==state.condition&&!state.isolated)reframe();
   Object.assign(renderer.domElement.dataset,{progress:state.progress.toFixed(4),condition:state.condition,isolated:String(state.isolated),selected:state.selected??''});invalidate();
  },home,
  focus(id){const part=model.parts.find(p=>p.id===id);if(part)frameBox(new T.Box3().setFromObject(part.group),orbitDirection())},
  zoom(factor){camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();invalidate()},
  capture(portrait=false,card){saveSceneImage(renderer,scene,camera,bounds(),portrait,card);invalidate()},
  readPlate(condition,revision){
   if(lostContext)throw Error('A captura não está disponível.');
   const size=renderer.getSize(new T.Vector2()),ratio=renderer.getPixelRatio(),exposure=renderer.toneMappingExposure;
   const visible=model.parts.map(p=>p.group.visible),road=model.road.visible,marked=highlight.visible;
   try{
    // The capture keeps its own calibrated exposure per condition, so it always starts from the day lighting.
    light('clear');applyPose(model,.5,condition);model.parts.forEach(p=>p.group.visible=p.id==='vehicle'||p.id==='plate');model.road.visible=true;highlight.visible=false;wire(false);model.root.updateMatrixWorld(true);
    const pose=capturePose(condition),sensor=new T.PerspectiveCamera(40,16/9,.05,100);sensor.position.copy(pose.position);sensor.lookAt(pose.target);sensor.updateMatrixWorld(true);
    const region=projectRegion(plateCorners(model),sensor,1280,720);renderer.setPixelRatio(1);renderer.setSize(1280,720,false);renderer.toneMappingExposure=condition==='dark'?darkCaptureExposure:condition==='infrared'?infraredCaptureExposure:1;
    // Infrared: the retroreflective plate sends the illuminator's light straight back to the lens.
    if(condition==='infrared'){face.emissive.set('#ffffff');face.emissiveMap=face.map;face.emissiveIntensity=retroreflection;face.needsUpdate=true}
    renderer.render(scene,sensor);
    const image=document.createElement('canvas');image.width=1280;image.height=720;const ctx=image.getContext('2d')!;ctx.fillStyle='#0b1019';ctx.fillRect(0,0,1280,720);ctx.drawImage(renderer.domElement,0,0);if(condition==='infrared')toGrayscale(ctx,1280,720);
    const crop=document.createElement('canvas');crop.width=region.width;crop.height=region.height;crop.getContext('2d')!.drawImage(image,region.x,region.y,region.width,region.height,0,0,region.width,region.height);
    return {frame:image.toDataURL('image/jpeg',.9),crop:crop.toDataURL('image/png'),cropImage:crop,region,condition,revision};
   }finally{
    applyPose(model,state.progress,state.condition);model.parts.forEach((p,i)=>p.group.visible=visible[i]);model.road.visible=road;highlight.visible=marked;light(state.condition);wire(state.wireframe);renderer.toneMappingExposure=exposure;renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);renderer.render(scene,camera);invalidate();
   }
  },
  dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('change',invalidate);controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointercancel',pointerEnd);host.removeEventListener('wheel',wheel,{capture:true});renderer.domElement.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',visibility);model.dispose();texture.dispose();env.dispose();highlight.geometry.dispose();(highlight.material as T.Material).dispose();renderer.dispose();renderer.domElement.remove()},
 };
}
