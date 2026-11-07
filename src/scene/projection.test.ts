import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {projectRegion} from './projection.ts';

test('crop includes every projected corner and rejects invisible or invalid plate geometry',()=>{
 const c=new PerspectiveCamera(40,16/9,.1,100);c.position.z=5;c.lookAt(0,0,0);c.updateMatrixWorld(true);
 const corners=[new Vector3(-1,-.2,0),new Vector3(1,-.2,0),new Vector3(1,.2,0),new Vector3(-1,.2,0)];
 const r=projectRegion(corners,c,1280,720);
 for(const p of r.points)assert.ok(p.x>=r.x&&p.x<=r.x+r.width&&p.y>=r.y&&p.y<=r.y+r.height);
 assert.throws(()=>projectRegion(corners.map(p=>p.clone().setZ(10)),c,1280,720));
 assert.throws(()=>projectRegion(corners.map(p=>p.clone().setX(NaN)),c,1280,720));
 assert.throws(()=>projectRegion(corners,c,0,720));
});
