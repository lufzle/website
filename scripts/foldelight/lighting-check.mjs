// Run this expression in DevTools at /foldelight/. No test state survives cleanup.
await (async()=>{
  const scene=await import('/foldelight/scene.mjs');
  const rendering=await import('/foldelight/renderers.mjs');
  const shaders=await import('/foldelight/shaders.mjs');
  const mesh=scene.createLaptop(),labels=rendering.makeLabelAtlas(mesh.labels);
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(host);
  const failures=[],renderers=[],canvases=[];
  const source=document.createElement('canvas');source.width=256;source.height=256;
  const paint=color=>{const c=source.getContext('2d');c.fillStyle=color;c.fillRect(0,0,256,256);return rendering.makeMipLevels(source);};
  const progress=angle=>{let lo=0,hi=1;for(let i=0;i<35;i++){const m=(lo+hi)/2;if(scene.angleForProgress(m)<angle)lo=m;else hi=m;}return (lo+hi)/2;};
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const sample=document.createElement('canvas');const ctx=sample.getContext('2d',{willReadFrequently:true});
  function read(renderer,angle){renderer.render(progress(angle),0);const c=renderer.canvas;sample.width=c.width;sample.height=c.height;ctx.drawImage(c,0,0);return ctx.getImageData(0,0,c.width,c.height).data;}
  function upload(renderer,levels){
    if(renderer.gl){const gl=renderer.gl;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,renderer.textures[0]);levels.forEach((image,i)=>gl.texImage2D(gl.TEXTURE_2D,i,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image));}
    else levels.forEach((source,mipLevel)=>renderer.device.queue.copyExternalImageToTexture({source},{texture:renderer.textures[0],mipLevel},[source.width,source.height]));
  }
  function pointRGB(renderer,pixels,point){
    const m=renderer.camera.viewProjection,clip=scene.transformPoint(m,point),w=m[3]*point[0]+m[7]*point[1]+m[11]*point[2]+m[15];
    const x=Math.round((clip[0]/w*.5+.5)*renderer.canvas.width),y=Math.round((.5-clip[1]/w*.5)*renderer.canvas.height);
    const sums=[0,0,0];let n=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const i=((y+dy)*renderer.canvas.width+x+dx)*4;if(i<0||i+3>=pixels.length)continue;for(let c=0;c<3;c++)sums[c]+=pixels[i+c];n++;}
    return sums.map(v=>v/n);
  }
  const receivers={trackpad:[0,.053,.584],palm:[1.02,.05,.64],keys:[-.06,.055,-.28],floor:[0,-.072,1.26]};
  let probeProgram,probeVAO,probeBuffer;
  const probes=[];
  try{
    for(const Renderer of [rendering.WebGPURenderer,rendering.WebGLRenderer]){
      const canvas=document.createElement('canvas');canvas.style.cssText='width:960px;height:456px';host.append(canvas);canvases.push(canvas);
      renderers.push(await Renderer.create(canvas,mesh,paint('#000'),labels,error=>failures.push(String(error))));
    }
    const measurements=[],backendErrors=[];
    for(const angle of [0,21.99,22,22.01,28,32.8753,35.6,60,90,100]){
      const sets=[];
      for(const renderer of renderers){
        const colors={};
        for(const color of ['#000','#f00','#0f0','#00f']){
          upload(renderer,paint(color));const pixels=read(renderer,angle);
          colors[color]={pixels,points:Object.fromEntries(Object.entries(receivers).map(([name,p])=>[name,pointRGB(renderer,pixels,p)]))};
        }
        for(const [index,color] of ['#f00','#0f0','#00f'].entries()){
          for(const name of ['trackpad','palm','keys']){
            const delta=colors[color].points[name].map((v,c)=>v-colors['#000'].points[name][c]);
            if(angle<=22.01)assert(Math.max(...delta.map(Math.abs))<=1,`Light at black fade: ${angle}/${name}/${color}/${delta}`);
            if(angle>=28){assert(delta[index]>2,`Missing colored light: ${angle}/${name}/${color}/${delta}`);assert(delta[index]>Math.max(...delta.filter((_,c)=>c!==index))+2,`Light does not follow source: ${angle}/${name}/${color}/${delta}`);}
          }
          const floorDelta=colors[color].points.floor.map((v,c)=>v-colors['#000'].points.floor[c]);
          assert(Math.max(...floorDelta.map(Math.abs))<=1,`Light passed through chassis: ${angle}/${floorDelta}`);
        }
        sets.push(colors);
      }
      let maxRegionError=0;
      for(const color of ['#000','#f00','#0f0','#00f']){
        let error=0,n=0;
        for(let i=0;i<sets[0][color].pixels.length;i++){if(i%4===3)continue;error+=Math.abs(sets[0][color].pixels[i]-sets[1][color].pixels[i]);n++;}
        assert(error/n<.5,`Backend image difference at ${angle}: ${error/n}`);
        for(const name of Object.keys(receivers))for(let c=0;c<3;c++)maxRegionError=Math.max(maxRegionError,Math.abs(sets[0][color].points[name][c]-sets[1][color].points[name][c]));
      }
      assert(maxRegionError<2,`Local backend difference at ${angle}: ${maxRegionError}`);
      backendErrors.push({angle,maxRegionError});
      measurements.push({angle,blue:Object.fromEntries(['trackpad','palm','keys'].map(name=>[name,sets[0]['#00f'].points[name].map((v,c)=>+(v-sets[0]['#000'].points[name][c]).toFixed(2))]))});
    }
    // Compare every red-channel mip byte. Adding the mark must not change keys.
    const blankLabels=document.createElement('canvas');blankLabels.width=labels.width;blankLabels.height=labels.height;
    const labelContext=blankLabels.getContext('2d');labelContext.drawImage(labels,0,0);labelContext.fillStyle='#000';labelContext.fillRect(0,320,192,192);
    const markedLevels=rendering.makeMipLevels(labels),plainLevels=rendering.makeMipLevels(blankLabels);
    const redBytes=[];
    for(let level=0;level<markedLevels.length;level++){
      const pair=[];
      for(const image of [markedLevels[level],plainLevels[level]]){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const context=c.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);pair.push(context.getImageData(0,0,c.width,c.height).data);}
      for(let i=0;i<pair[0].length;i+=4)assert(pair[0][i]===pair[1][i],`Logo contaminated key mip ${level}/${i/4}`);
      redBytes.push(pair[0].length/4);
    }
    const glRenderer=renderers[1],labelGL=glRenderer.gl;
    upload(glRenderer,paint('#000'));
    const marked=read(glRenderer,0);
    labelGL.activeTexture(labelGL.TEXTURE1);labelGL.bindTexture(labelGL.TEXTURE_2D,glRenderer.textures[1]);
    plainLevels.forEach((image,level)=>labelGL.texImage2D(labelGL.TEXTURE_2D,level,labelGL.RGBA,labelGL.RGBA,labelGL.UNSIGNED_BYTE,image));
    const unmarked=read(glRenderer,0);
    let logoPixels=0;
    for(let i=0;i<marked.length;i+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(marked[i+c]-unmarked[i+c])))>3)logoPixels++;
    assert(logoPixels>100,`Logo is absent from outer lid: ${logoPixels}`);
    labelGL.activeTexture(labelGL.TEXTURE1);markedLevels.forEach((image,level)=>labelGL.texImage2D(labelGL.TEXTURE_2D,level,labelGL.RGBA,labelGL.RGBA,labelGL.UNSIGNED_BYTE,image));
    // Sample the physical receivers every quarter degree through the fade.
    upload(glRenderer,paint('#fff'));let previous=null,maxMotionStep=0;
    for(let angle=21;angle<=37;angle+=.25){const pixels=read(glRenderer,angle),current=pointRGB(glRenderer,pixels,receivers.trackpad);if(previous)maxMotionStep=Math.max(maxMotionStep,...current.map((v,c)=>Math.abs(v-previous[c])));previous=current;}
    assert(maxMotionStep<8,`Reflection flashed through fade: ${maxMotionStep}`);
    // Compile the actual GLSL helpers into a small numerical GPU probe. The test
    // uses an independent surface-area integral as its oracle, not copied shader math.
    const gl=renderers[1].gl;
    const prefix=shaders.fragmentGLSL.slice(0,shaders.fragmentGLSL.lastIndexOf('void main()'));
    const vertex=`#version 300 es
precision highp float;
layout(location=0) in vec2 p;
out vec3 vWorld;out vec3 vNormal;out vec2 vUV;flat out float vMaterial;flat out float vLid;
void main(){gl_Position=vec4(p,0.,1.);vWorld=vec3(0.);vNormal=vec3(0.,1.,0.);vUV=vec2(0.);vMaterial=0.;vLid=0.;}`;
    const fragment=prefix+`
uniform vec3 uProbeWorld;
uniform vec3 uProbeNormal;
uniform int uProperty;
void main(){
  vec3 p=uProbeWorld,n=uProbeNormal;
  if(uProperty==3){outColor=vec4(linearToSRGB(screenBounce(p,n,normalize(uEye-p),vec3(.014,.015,.018),.90,.02)),1.);return;}
  if(uProperty==1){float x=gl_FragCoord.x; p=vec3(fract(x*.618034)*3.15-1.575,.055,fract(x*.414214)*2.-.95);n=normalize(vec3(sin(x*1.4142),.01+fract(x*.732051),cos(x*1.732)) );}
  float whole=rectangleIrradiance(p,n,vec2(-SCREEN_WIDTH*.5,SCREEN_Y-SCREEN_HEIGHT*.5),vec2(SCREEN_WIDTH*.5,SCREEN_Y+SCREEN_HEIGHT*.5));
  float parts=0.;
  for(int y=0;y<2;y++)for(int x=0;x<2;x++){vec2 lo=vec2((float(x)-1.)*SCREEN_WIDTH*.5,SCREEN_Y-SCREEN_HEIGHT*.5+float(y)*SCREEN_HEIGHT*.5);parts+=rectangleIrradiance(p,n,lo,lo+vec2(SCREEN_WIDTH,SCREEN_HEIGHT)*.5);}
  if(uProperty==1){outColor=vec4(float(!isnan(whole)&&!isinf(whole)&&whole>=0.&&whole<=1.),float(abs(parts-whole)<.0005),0.,1.);}
  else outColor=vec4(whole,parts,0.,1.);
}`;
    function compile(source){
      const handles=[];let program;
      try{for(const [type,text] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,source]]){const shader=gl.createShader(type);handles.push(shader);gl.shaderSource(shader,text);gl.compileShader(shader);assert(gl.getShaderParameter(shader,gl.COMPILE_STATUS),gl.getShaderInfoLog(shader));}
        program=gl.createProgram();handles.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);assert(gl.getProgramParameter(program,gl.LINK_STATUS),gl.getProgramInfoLog(program));return program;
      }catch(e){if(program)gl.deleteProgram(program);throw e;}finally{handles.forEach(s=>gl.deleteShader(s));}
    }
    probeVAO=gl.createVertexArray();gl.bindVertexArray(probeVAO);probeBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,probeBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.disable(gl.DEPTH_TEST);
    function probe(program,angle,point=[0,.055,-.82],normal=[0,1,0],property=0){
      gl.useProgram(program);gl.bindVertexArray(probeVAO);gl.viewport(0,0,512,1);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uLid'),false,scene.lidMatrix(angle));gl.uniform3fv(gl.getUniformLocation(program,'uProbeWorld'),point);gl.uniform3fv(gl.getUniformLocation(program,'uProbeNormal'),normal);gl.uniform1i(gl.getUniformLocation(program,'uProperty'),property);gl.uniform3fv(gl.getUniformLocation(program,'uEye'),scene.cameraForAspect(2178/1032,angle).eye);gl.uniform4fv(gl.getUniformLocation(program,'uParams'),[scene.foldForAngle(angle),0,512,1]);gl.drawArrays(gl.TRIANGLES,0,3);const pixels=new Uint8Array(512*4);gl.readPixels(0,0,512,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;
    }
    function quadrature(angle,point,normal){
      const m=scene.lidMatrix(angle),lightNormal=scene.transformPoint(m,[0,0,1],0);let sum=0;const count=200,area=scene.SCREEN.width*scene.SCREEN.height/(count*count);
      for(let y=0;y<count;y++)for(let x=0;x<count;x++){
        const light=scene.transformPoint(m,[(x+.5)/count*scene.SCREEN.width-scene.SCREEN.width/2,scene.SCREEN.centerY-scene.SCREEN.height/2+(y+.5)/count*scene.SCREEN.height,scene.SCREEN.frontZ]);
        const delta=light.map((v,i)=>v-point[i]),r2=delta.reduce((s,v)=>s+v*v,0),r=Math.sqrt(r2),direction=delta.map(v=>v/r);
        const receiver=Math.max(0,normal.reduce((s,v,i)=>s+v*direction[i],0)),emitter=Math.max(0,-lightNormal.reduce((s,v,i)=>s+v*direction[i],0));
        sum+=receiver*emitter*area/r2/Math.PI;
      }return sum;
    }
    const cases=[[32.8753,[0,.055,-.82],[0,1,0]],[60,[0,.055,-.82],[0,1,0]],[60,[1.45,.05,.50],[.8,.6,0]],[90,[-1.45,.05,.8],[-.8,.6,0]]];
    probeProgram=compile(fragment);
    for(const [angle,point,normal] of cases){const pixels=probe(probeProgram,angle,point,normal),expected=quadrature(angle,point,normal);assert(Math.abs(pixels[0]/255-expected)<.005,`Rectangle integral mismatch: ${angle}: ${pixels[0]/255} vs ${expected}`);probes.push({angle,normal,value:pixels[0]/255,expected});}
    for(let angle=0;angle<=100;angle+=2){const pixels=probe(probeProgram,angle,undefined,undefined,1);for(let i=0;i<pixels.length;i+=4)assert(pixels[i]===255&&pixels[i+1]===255,`Irradiance property at ${angle}, sample ${i/4}: ${pixels[i]},${pixels[i+1]}`);}
    const bevelPoint=[-.7535157204,.0906544626,-.9925954342],bevelNormal=[.3095974028,.7474342585,.5877852440];
    function grazingStep(program){const a=probe(program,99.3084846,bevelPoint,bevelNormal,3),b=probe(program,99.3086846,bevelPoint,bevelNormal,3);return Math.max(...[0,1,2].map(i=>Math.abs(a[i]-b[i])));}
    assert(grazingStep(probeProgram)<=1,'Reflection popped at a valid grazing intersection');
    let previousGrazing=null,maxGrazingStep=0;const grazingChanges=[];
    for(let angle=99.30;angle<99.40;angle+=.0005){const pixel=probe(probeProgram,angle,bevelPoint,bevelNormal,3);if(previousGrazing){const step=Math.max(...[0,1,2].map(i=>Math.abs(pixel[i]-previousGrazing[i])));maxGrazingStep=Math.max(maxGrazingStep,step);if(step>4)grazingChanges.push({angle,step,before:[...previousGrazing.slice(0,3)],after:[...pixel.slice(0,3)]});}previousGrazing=pixel;}
    assert(maxGrazingStep<=4,`Near-parallel reflection flashed: ${maxGrazingStep}: ${JSON.stringify(grazingChanges)}`);
    const mutations=[];
    for(const [name,from,to] of [
      ['abrupt grazing cutoff','if(denominator<-.000001)','if(denominator<-.001)'],
      ['reverse light polygon','vec3 edge=cross(a,b);','vec3 edge=cross(b,a);'],
      ['remove horizon clipping','if(da>0.) { polygon[count]=a;count++; }','if(true) { polygon[count]=a;count++; }'],
      ['detach emission from hinge','(uLid*vec4(low.x,low.y,SCREEN_Z,1.)).xyz-world','vec3(low.x,low.y,SCREEN_Z)-world'],
    ]){
      assert(fragment.includes(from),`Missing mutation target: ${name}`);let altered=fragment.replace(from,to);
      if(name==='remove horizon clipping')altered=altered.replace('if((da>0.)!=(db>0.))','if(false)');
      const program=compile(altered);let killed=false;
      try{if(name==='abrupt grazing cutoff')killed=grazingStep(program)>1;for(const [angle,point,normal] of cases){const actual=probe(program,angle,point,normal)[0]/255;if(Math.abs(actual-quadrature(angle,point,normal))>=.005)killed=true;}
        if(!killed){for(const angle of [32,60,90]){const pixels=probe(program,angle,undefined,undefined,1);for(let i=0;i<pixels.length;i+=4)if(pixels[i]!==255||pixels[i+1]!==255)killed=true;}}
      }finally{gl.deleteProgram(program);}
      assert(killed,`Mutation survived: ${name}`);mutations.push(name);
    }
    gl.enable(gl.DEPTH_TEST);
    assert(gl.getError()===gl.NO_ERROR,'WebGL error during lighting checks');
    await renderers[0].device.queue.onSubmittedWorkDone();assert(failures.length===0,failures.join(' | '));
    return {buffer:[canvases[0].width,canvases[0].height],measurements,backendErrors,probes,propertySamples:51*512,mutations,logoPixels,isolatedLabelMipBytes:redBytes.reduce((s,n)=>s+n,0),maxMotionStep,maxGrazingStep,failures};
  }finally{
    const gl=renderers[1]?.gl;if(gl){if(probeProgram)gl.deleteProgram(probeProgram);if(probeBuffer)gl.deleteBuffer(probeBuffer);if(probeVAO)gl.deleteVertexArray(probeVAO);}
    renderers.forEach(r=>r.destroy());host.remove();
  }
})();
