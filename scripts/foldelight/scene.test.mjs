import assert from 'node:assert/strict';
import test from 'node:test';
import * as scene from '../../public/foldelight/scene.mjs';
import { close, verifyHingeContract } from './hinge-contract.mjs';

const { STRIDE, LAPTOP, lidMatrix, transformPoint, cameraForAspect, createLaptop } = scene;
const mesh = createLaptop();
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
let seed = 0x41991;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2**32; }

test('the lid opens from closed to 100 degrees around its fixed hinge', () => verifyHingeContract(scene));

test('scroll endpoints and reversal map to the same physical pose', () => {
  for (const [start, travel] of [[700, 1600], [844, 2363], [0, 1]]) {
    assert.equal(scene.progressForScroll(start - 100, start, travel), 0);
    assert.equal(scene.progressForScroll(start + travel + 100, start, travel), 1);
    const forward = Array.from({ length: 101 }, (_, i) => scene.angleForProgress(scene.progressForScroll(start + travel*i/100, start, travel)));
    const reverse = Array.from({ length: 101 }, (_, i) => scene.angleForProgress(scene.progressForScroll(start + travel*(100-i)/100, start, travel)));
    forward.forEach((angle, i) => close(angle, reverse[100-i]));
  }
  for (const progress of [NaN, Infinity, -Infinity]) assert.equal(scene.angleForProgress(progress), 0);
});

test('2,000 lid poses preserve distance, orientation, and perpendicular normals', () => {
  for (let i = 0; i < 2000; i++) {
    const matrix = lidMatrix(random()*100);
    const right = transformPoint(matrix, [1,0,0], 0);
    const up = transformPoint(matrix, [0,1,0], 0);
    const normal = transformPoint(matrix, [0,0,1], 0);
    for (const vector of [right, up, normal]) close(Math.hypot(...vector), 1);
    close(dot(up, normal), 0);
    cross(right, up).forEach((value, axis) => close(value, normal[axis]));
    const a = [random()*3-1.5, random()*2, random()*.04];
    const b = [random()*3-1.5, random()*2, random()*.04];
    const worldA = transformPoint(matrix, a), worldB = transformPoint(matrix, b);
    close(Math.hypot(...a.map((x,j) => x-b[j])), Math.hypot(...worldA.map((x,j) => x-worldB[j])));
  }
});

test('closed screen is hidden and does not intersect the keyboard', () => {
  let lowestLid = Infinity, highestKey = -Infinity;
  let minKeyZ = Infinity, maxKeyZ = -Infinity;
  for (let i = 0; i < mesh.vertices.length; i += STRIDE) {
    const v = mesh.vertices.subarray(i, i+STRIDE);
    if (v[8] === 4) {
      highestKey = Math.max(highestKey, v[1]);
      minKeyZ = Math.min(minKeyZ, v[2]); maxKeyZ = Math.max(maxKeyZ, v[2]);
    }
  }
  const closed = lidMatrix(0);
  for (let i = 0; i < mesh.vertices.length; i += STRIDE) {
    const v = mesh.vertices.subarray(i, i+STRIDE);
    if (v[9] !== 1) continue;
    const point = transformPoint(closed, v);
    // The camera at the free edge closes over the palm rest, outside the keys.
    if (point[2] >= minKeyZ && point[2] <= maxKeyZ) lowestLid = Math.min(lowestLid, point[1]);
  }
  assert.ok(lowestLid > highestKey, `The lid (${lowestLid}) must clear the keys (${highestKey})`);
  assert.ok(lowestLid-highestKey<.004,'The closed screen must sit close to the recessed keys');
  assert.ok(LAPTOP.hingeY-LAPTOP.lidThickness/2-.05<.015,'The closed metal lid must leave a narrow front seam');
  const eye = cameraForAspect(16/10).eye;
  for (const [angle, visible] of [[0,false], [90,true], [100,true]]) {
    const matrix = lidMatrix(angle);
    const point = transformPoint(matrix, [0,1,.027]);
    const normal = transformPoint(matrix, [0,0,1], 0);
    assert.equal(dot(normal, eye.map((x,i) => x-point[i])) > 0, visible);
  }
});

test('the production mesh has finite vertices, unit normals, and distinct lid and base groups', () => {
  assert.equal(mesh.vertices.length % (STRIDE*3), 0);
  const materials = new Set(), groups = new Set();
  for (let i = 0; i < mesh.vertices.length; i += STRIDE) {
    const v = mesh.vertices.subarray(i, i+STRIDE);
    assert.ok(v.every(Number.isFinite));
    close(Math.hypot(v[3], v[4], v[5]), 1);
    materials.add(v[8]); groups.add(v[9]);
    if (v[8] === 2) assert.equal(v[9], 1, 'Every screen triangle follows the lid');
    if (v[8] === 4) assert.equal(v[9], 0, 'Every key stays on the base');
  }
  assert.deepEqual([...groups].sort(), [0,1]);
  assert.deepEqual([...materials].sort(), [0,1,2,3,4,5,6,7,8]);
  assert.ok(mesh.labels.includes('Q') && mesh.labels.includes('esc'));
});

test('the hinge housing connects the deck to the lid without protruding when closed', () => {
  let minHousing = Infinity, maxHousing = -Infinity;
  for (let i = 0; i < mesh.vertices.length; i += STRIDE) {
    const v = mesh.vertices.subarray(i, i+STRIDE);
    if (v[8] === 3 && v[9] === 0 && v[2] < -.98 && v[1] > 0) {
      minHousing = Math.min(minHousing, v[1]); maxHousing = Math.max(maxHousing, v[1]);
    }
  }
  assert.ok(minHousing < .05, 'The housing must reach the deck');
  assert.ok(maxHousing >= LAPTOP.hingeY, 'The housing must reach the pivot');
  assert.ok(maxHousing < LAPTOP.hingeY + LAPTOP.lidThickness/2, 'The closed lid must cover the housing');
});

test('the whole machine fits the camera at narrow and wide viewport ratios', () => {
  for (const aspect of [390/844, 576/701, 1280/800, 1920/800]) {
    for (const angle of [0, 30, 50, 80, 90, 100]) {
      const matrix = cameraForAspect(aspect,angle).viewProjection;
      const lid = lidMatrix(angle);
      for (let i = 0; i < mesh.vertices.length; i += STRIDE) {
        const v = mesh.vertices.subarray(i, i+STRIDE);
        if(v[8]===8) continue; // The studio floor deliberately extends beyond the frame.
        const p = v[9] ? transformPoint(lid, v) : v.subarray(0,3);
        const clip = transformPoint(matrix, p);
        const w = matrix[3]*p[0]+matrix[7]*p[1]+matrix[11]*p[2]+matrix[15];
        assert.ok(w > 0);
        assert.ok(Math.abs(clip[0]/w) < .985 && Math.abs(clip[1]/w) < .985, `Clipped at ${angle} degrees, aspect ${aspect}`);
        assert.ok(clip[2]/w >= 0 && clip[2]/w <= 1);
      }
    }
  }
});

test('the glass clears at 90 degrees and darkens toward closure', () => {
  assert.equal(scene.foldForAngle(90), 0);
  assert.equal(scene.foldForAngle(100), 0);
  assert.equal(scene.foldForAngle(0), 1);
  let previous = 1;
  for (let angle = 0; angle <= LAPTOP.maximumAngle; angle += .1) {
    const fold = scene.foldForAngle(angle);
    assert.ok(fold <= previous && fold >= 0);
    previous = fold;
  }
});
