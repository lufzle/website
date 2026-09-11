import assert from 'node:assert/strict';
import { readFileSync,mkdtempSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { verifyHingeContract } from './hinge-contract.mjs';
import { verifyReferenceCamera,verifyCameraContinuity,verifyFrontRecess } from './studio-contract.mjs';

const original = readFileSync(new URL('../../public/foldelight/scene.mjs', import.meta.url), 'utf8');
async function checkMutant(source,contract) {
  // File modules work in both Bun and Node; Bun does not import data URLs here.
  const directory=mkdtempSync(join(tmpdir(),'foldelight-mutation-'));
  try {
    const file=join(directory,'scene.mjs');
    writeFileSync(file,source);
    const module=await import(pathToFileURL(file).href);
    assert.throws(()=>contract(module),{code:'ERR_ASSERTION'});
  } finally {
    rmSync(directory,{recursive:true,force:true});
  }
}
const mutations = [
  ['reverse scroll direction', 'maximumAngle * smooth(progress)', 'maximumAngle * (1 - smooth(progress))'],
  ['stop at 90 degrees', 'maximumAngle: 100', 'maximumAngle: 90'],
  ['start at 180 degrees', 'const radians = Math.max', 'const radians = Math.PI + Math.max'],
  ['open toward the back at zero', '0, s, c, 0,', '0, s, -c, 0,'],
  ['expose the screen while closed', '0, -c, s, 0,', '0, c, s, 0,'],
  ['move the hinge vertically', '0, LAPTOP.hingeY, LAPTOP.hingeZ, 1,', '0, LAPTOP.hingeY + s, LAPTOP.hingeZ, 1,'],
  ['lose the depth change after 90 degrees', '0, s, c, 0,', '0, s, Math.abs(c), 0,'],
];

for (const [name, from, to] of mutations) {
  test(`hinge regression tests kill: ${name}`, async () => {
    assert.equal(original.split(from).length, 2, 'Mutation must target exactly one production expression');
    const mutated = original.replace(from, to);
    await checkMutant(mutated,verifyHingeContract);
  });
}

for(const [name,from,to,contract] of [
  ['raise the camera above the reference','normalize([0, .1087032, .99407425])','normalize([0, .40, .9165])',verifyReferenceCamera],
  ['remove the smooth framing transition','transition*transition/1.6','0',verifyCameraContinuity],
  ['remove the sculpted front opening','deck:true,frontScoop:true','deck:true,frontScoop:false',verifyFrontRecess],
  ['slope the whole palm rest','if(frontScoop && sign>0)','if(false)',verifyFrontRecess],
]) {
  test(`studio regression tests kill: ${name}`,async()=>{
    assert.equal(original.split(from).length,2,'Mutation must target one production expression');
    const mutated=original.replace(from,to);
    await checkMutant(mutated,contract);
  });
}
