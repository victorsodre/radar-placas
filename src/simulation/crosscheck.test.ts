import test from 'node:test';
import assert from 'node:assert/strict';
import {crossCheck,requiredSpeed,crossVerdict,clampMinutes,clockBefore,isComplete} from './crosscheck.ts';

test('required speed is distance over time and rejects impossible inputs',()=>{
 assert.equal(requiredSpeed(120,60),120);assert.equal(requiredSpeed(120,30),240);
 for(const [d,m] of [[120,0],[120,-5],[NaN,30],[120,NaN],[-1,30]])assert.equal(requiredSpeed(d,m),Infinity);
});
test('the verdict flips at the illustrative limit and needs a complete reading',()=>{
 const limitMinutes=crossCheck.distanceKm/crossCheck.limitKmh*60;
 assert.equal(crossVerdict('LAB3D',limitMinutes).verdict,'possible');
 assert.equal(crossVerdict('LAB3D',limitMinutes-crossCheck.stepMinutes).verdict,'clone');
 assert.equal(crossVerdict('LAB3D',crossCheck.defaultMinutes).verdict,'clone');
 assert.equal(crossVerdict('LAB3D',crossCheck.maxMinutes).verdict,'possible');
 assert.equal(crossVerdict('LA?3D',10).verdict,'incomplete');assert.equal(isComplete(''),false);
});
test('the slider value is clamped to the range and step',()=>{
 assert.equal(clampMinutes(1),crossCheck.minMinutes);assert.equal(clampMinutes(9999),crossCheck.maxMinutes);
 assert.equal(clampMinutes(33),35);assert.equal(clampMinutes(NaN),crossCheck.defaultMinutes);
 assert.equal(crossVerdict('LAB3D',0).speed,requiredSpeed(crossCheck.distanceKm,crossCheck.minMinutes));
});
test('the earlier reading clock stays on a 24-hour dial',()=>{
 assert.equal(clockBefore(30),'13:30');assert.equal(clockBefore(180),'11:00');assert.equal(clockBefore(15,10),'23:55');
});
