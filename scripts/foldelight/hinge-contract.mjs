import assert from 'node:assert/strict';

export function close(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
}

// Physical observations, independent of the matrix's trigonometric implementation.
// The same contract checks production code and deliberately broken variants.
export function verifyHingeContract(scene) {
  const { LAPTOP, angleForProgress, lidMatrix, transformPoint } = scene;
  assert.equal(angleForProgress(0), 0);
  assert.equal(angleForProgress(1), 100);
  assert.equal(angleForProgress(-1), 0);
  assert.equal(angleForProgress(2), 100);
  let previous = -1;
  for (let i = 0; i <= 100; i++) {
    const angle = angleForProgress(i / 100);
    assert.ok(angle >= previous && angle <= 100);
    previous = angle;
  }
  for (const angle of [0, 17, 50, 80, 90, 100]) {
    const hinge = transformPoint(lidMatrix(angle), [0, 0, 0]);
    close(hinge[0], 0);
    close(hinge[1], LAPTOP.hingeY);
    close(hinge[2], LAPTOP.hingeZ);
  }
  const closed = lidMatrix(0);
  const top = transformPoint(closed, [0, LAPTOP.lidHeight, 0]);
  close(top[1], LAPTOP.hingeY);
  close(top[2], LAPTOP.hingeZ + LAPTOP.lidHeight);
  const screen = transformPoint(closed, [0, 0, 1], 0);
  close(screen[1], -1);
  close(screen[2], 0);
  const upright = transformPoint(lidMatrix(90), [0, LAPTOP.lidHeight, 0]);
  close(upright[1], LAPTOP.hingeY + LAPTOP.lidHeight);
  close(upright[2], LAPTOP.hingeZ);
  const before = transformPoint(lidMatrix(80), [0, LAPTOP.lidHeight, 0]);
  const after = transformPoint(lidMatrix(100), [0, LAPTOP.lidHeight, 0]);
  close(before[1], after[1]);
  assert.ok(before[2] > LAPTOP.hingeZ);
  assert.ok(after[2] < LAPTOP.hingeZ);
}
