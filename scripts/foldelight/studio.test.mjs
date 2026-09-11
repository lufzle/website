import assert from 'node:assert/strict';
import test from 'node:test';
import * as scene from '../../public/foldelight/scene.mjs';
import { project,verifyReferenceCamera,verifyCameraContinuity,verifyFrontRecess } from './studio-contract.mjs';

test('the reference pose keeps the low camera and measured silhouette',()=>verifyReferenceCamera(scene));
test('camera framing changes continuously through 12,006 poses',()=>verifyCameraContinuity(scene));
test('the finger recess cuts the front lip and leaves the palm rest flat',()=>verifyFrontRecess(scene));

test('the floor stays under the machine and points toward the camera',()=>{
  const {vertices}=scene.createLaptop();
  let bottom=Infinity,floor=-Infinity,count=0;
  for(let i=0;i<vertices.length;i+=scene.STRIDE) {
    const v=vertices.subarray(i,i+scene.STRIDE);
    if(v[8]===8) {
      count++;floor=Math.max(floor,v[1]);
      assert.equal(v[9],0);
      assert.deepEqual([...v.subarray(3,6)],[0,1,0]);
    } else if(v[9]===0) bottom=Math.min(bottom,v[1]);
  }
  assert.equal(count,6);
  assert.ok(floor<bottom && bottom-floor<.01,'The contact plane must sit just beneath the feet');
});

test('2,000 random viewport and lid combinations stay centered and inside the frame',()=>{
  let seed=0x199135;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
  for(let i=0;i<2000;i++) {
    const aspect=.40+random()*2.6,angle=scene.angleForProgress(random());
    const camera=scene.cameraForAspect(aspect,angle),lid=scene.lidMatrix(angle);
    for(const x of [-1.6,1.6]) for(const y of [0,scene.LAPTOP.lidHeight]) {
      const p=scene.transformPoint(lid,[x,y,.033]);
      const [px,py,pz]=project(scene,camera,p);
      assert.ok(Math.abs(px)<.87 && Math.abs(py)<.9 && pz>0 && pz<1);
    }
    assert.deepEqual(camera,scene.cameraForAspect(aspect,angle),'Reversing scroll must revisit the same camera pose');
  }
});
