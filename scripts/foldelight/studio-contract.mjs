import assert from 'node:assert/strict';
import { close } from './hinge-contract.mjs';

export function project(scene, camera, point) {
  const m=camera.viewProjection;
  const clip=scene.transformPoint(m,point);
  const w=m[3]*point[0]+m[7]*point[1]+m[11]*point[2]+m[15];
  return [clip[0]/w,clip[1]/w,clip[2]/w];
}

export function verifyReferenceCamera(scene) {
  const camera=scene.cameraForAspect(2178/1032,32.8753);
  const lid=scene.lidMatrix(32.8753);
  close(camera.eye[0],0);
  const elevation=Math.atan2(camera.eye[1]-camera.target[1],camera.eye[2]-camera.target[2])*180/Math.PI;
  assert.ok(elevation>5 && elevation<8,'The studio camera must stay close to deck height');
  // Approximate landmarks measured from the supplied 2178 x 1032 reference.
  // Tolerances allow rounded silhouettes and the smooth camera transition.
  for(const [name,left,right,screenY,width] of [
    ['lid top',scene.transformPoint(lid,[-1.6,2.06,0]),scene.transformPoint(lid,[1.6,2.06,0]),.147,.836],
    ['hinge',[-1.6,scene.LAPTOP.hingeY,-1.02],[1.6,scene.LAPTOP.hingeY,-1.02],.634,.678],
    ['front deck',[-1.6,.05,1.05],[1.6,.05,1.05],.814,.850],
    ['front bottom',[-1.6,-.05,1.05],[1.6,-.05,1.05],.871,.850],
  ]) {
    const a=project(scene,camera,left),b=project(scene,camera,right);
    close(a[0],-b[0]);
    assert.ok(Math.abs((1-a[1])/2-screenY)<.02,`${name} vertical placement changed`);
    assert.ok(Math.abs((b[0]-a[0])/2-width)<.025,`${name} proportions changed`);
  }
}

export function verifyCameraContinuity(scene) {
  for(const aspect of [390/844,576/701,1,1.6,2178/1032,3]) {
    let last,lastStep;
    for(let i=0;i<=2000;i++) {
      const angle=scene.angleForProgress(i/2000);
      const camera=scene.cameraForAspect(aspect,angle);
      assert.ok([...camera.eye,...camera.viewProjection].every(Number.isFinite));
      const step=last===undefined?0:camera.distance-last;
      if(i>1) assert.ok(Math.abs(step-lastStep)<.0005,`Abrupt dolly transition at ${angle} degrees, aspect ${aspect}`);
      last=camera.distance;lastStep=step;
    }
  }
}

export function verifyFrontRecess(scene) {
  const {vertices}=scene.createLaptop();
  let frontCenter=-Infinity,frontOutside=-Infinity,palm=Infinity,palmSamples=0;
  for(let i=0;i<vertices.length;i+=scene.STRIDE) {
    const v=vertices.subarray(i,i+scene.STRIDE);
    if(v[8]!==0 || v[9]!==0) continue;
    if(v[2]>1.015) {
      if(Math.abs(v[0])<.15) frontCenter=Math.max(frontCenter,v[1]);
      if(Math.abs(v[0])>.35) frontOutside=Math.max(frontOutside,v[1]);
    }
    if(Math.abs(v[0])<.35 && v[2]>.70 && v[2]<.90 && v[1]>.01) {
      palm=Math.min(palm,v[1]);palmSamples++;
    }
  }
  assert.ok(Number.isFinite(frontCenter) && Number.isFinite(frontOutside));
  assert.ok(frontCenter<frontOutside-.025,'The opening must cut into the front lip');
  assert.ok(palmSamples>0 && palm>.049,'The recess must not depress the palm rest');
}
