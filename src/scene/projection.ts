import {PerspectiveCamera,Vector3} from 'three';
export type Region={x:number;y:number;width:number;height:number;points:{x:number;y:number}[]};
export function projectRegion(corners:Vector3[],camera:PerspectiveCamera,width:number,height:number):Region{
 if(corners.length!==4||width<=0||height<=0)throw Error('Enquadramento inválido.');
 const points=corners.map(v=>{
  const p=v.clone().project(camera);
  if(![p.x,p.y,p.z].every(Number.isFinite)||Math.abs(p.x)>1||Math.abs(p.y)>1||Math.abs(p.z)>1)throw Error('A placa saiu do enquadramento.');
  return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};
 });
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y),pad=8;
 const x=Math.max(0,Math.floor(Math.min(...xs)-pad)),y=Math.max(0,Math.floor(Math.min(...ys)-pad));
 return {x,y,width:Math.min(width,Math.ceil(Math.max(...xs)+pad))-x,height:Math.min(height,Math.ceil(Math.max(...ys)+pad))-y,points};
}
