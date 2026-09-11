import { STRIDE, angleForProgress, foldForAngle, lidMatrix, cameraForAspect } from './scene.mjs';
import { vertexGLSL, fragmentGLSL, shaderWGSL } from './shaders.mjs';

export function makeLabelAtlas(labels) {
  const atlas=document.createElement('canvas');
  atlas.width=1024;atlas.height=512;
  const ctx=atlas.getContext('2d');
  ctx.fillStyle='#000';ctx.fillRect(0,0,1024,512);
  ctx.fillStyle='#dedfe1';ctx.textAlign='center';ctx.textBaseline='middle';
  labels.forEach((label,i)=>{
    ctx.font=`${label.length>2?11:19}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText(label,(i%16)*64+32,Math.floor(i/16)*64+31,56);
  });
  return atlas;
}

export function makeMipLevels(image) {
  const levels=[image];
  let width=image.width,height=image.height,previous=image;
  while(width>1||height>1){
    width=Math.max(1,Math.floor(width/2));height=Math.max(1,Math.floor(height/2));
    const level=document.createElement('canvas');level.width=width;level.height=height;
    const ctx=level.getContext('2d');
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(previous,0,0,width,height);
    levels.push(level);previous=level;
  }
  return levels;
}

function updateSize(canvas) {
  const ratio=Math.min(devicePixelRatio||1,2);
  const width=Math.max(1,Math.round(canvas.clientWidth*ratio));
  const height=Math.max(1,Math.round(canvas.clientHeight*ratio));
  if(canvas.width===width&&canvas.height===height)return false;
  canvas.width=width;canvas.height=height;return true;
}

class SceneRenderer {
  constructor(canvas,count){this.canvas=canvas;this.count=count;this.values=new Float32Array(40);this.camera=null;}
  update(open,time){
    const resized=updateSize(this.canvas);
    if(resized||!this.camera){
      this.camera=cameraForAspect(this.canvas.width/this.canvas.height);
      this.values.set(this.camera.viewProjection,0);
      this.values.set(this.camera.eye,32);
    }
    const angle=angleForProgress(open);
    this.values.set(lidMatrix(angle),16);
    this.values.set([foldForAngle(angle),time,this.canvas.width,this.canvas.height],36);
    this.canvas.dataset.lidAngle=angle.toFixed(3);
    return resized;
  }
}

export class WebGLRenderer extends SceneRenderer {
  static async create(target,scene,levels,labels,onFailure){
    const gl=target.getContext('webgl2',{alpha:false,antialias:true,depth:true,powerPreference:'high-performance'});
    if(!gl)throw new Error('WebGL 2 is unavailable');
    const shaders=[];
    let program;
    try{
      for(const [type,source] of [[gl.VERTEX_SHADER,vertexGLSL],[gl.FRAGMENT_SHADER,fragmentGLSL]]){
        const shader=gl.createShader(type);shaders.push(shader);
        gl.shaderSource(shader,source);gl.compileShader(shader);
        if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      }
      program=gl.createProgram();shaders.forEach(shader=>gl.attachShader(program,shader));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    }catch(error){if(program)gl.deleteProgram(program);throw error;}
    finally{shaders.forEach(shader=>gl.deleteShader(shader));}

    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,scene.vertices,gl.STATIC_DRAW);
    const sizes=[3,3,2,1,1],offsets=[0,12,24,32,36];
    sizes.forEach((size,i)=>{gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,size,gl.FLOAT,false,STRIDE*4,offsets[i]);});
    const textures=[];
    for(const [unit,images] of [[0,levels],[1,[labels]]]){
      const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,images.length>1?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      images.forEach((image,level)=>gl.texImage2D(gl.TEXTURE_2D,level,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image));
    }
    gl.useProgram(program);gl.uniform1i(gl.getUniformLocation(program,'uScreen'),0);gl.uniform1i(gl.getUniformLocation(program,'uLabels'),1);
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.depthFunc(gl.LEQUAL);
    gl.clearColor(3/255,4/255,5/255,1);
    const renderer=new WebGLRenderer(target,scene.vertices.length/STRIDE);
    Object.assign(renderer,{gl,program,vao,buffer,textures});
    renderer.locations=Object.fromEntries(['uViewProjection','uLid','uEye','uParams'].map(name=>[name,gl.getUniformLocation(program,name)]));
    renderer.lost=(event)=>{event.preventDefault();onFailure(new Error('WebGL context lost'));};
    target.addEventListener('webglcontextlost',renderer.lost);
    return renderer;
  }

  render(open,time){
    this.update(open,time);
    const {gl,locations:l,values:v}=this;
    gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);gl.bindVertexArray(this.vao);
    gl.uniformMatrix4fv(l.uViewProjection,false,v.subarray(0,16));gl.uniformMatrix4fv(l.uLid,false,v.subarray(16,32));
    gl.uniform3fv(l.uEye,v.subarray(32,35));gl.uniform4fv(l.uParams,v.subarray(36,40));
    gl.drawArrays(gl.TRIANGLES,0,this.count);
  }

  destroy(){
    this.canvas.removeEventListener('webglcontextlost',this.lost);
    this.textures.forEach(texture=>this.gl.deleteTexture(texture));
    this.gl.deleteBuffer(this.buffer);this.gl.deleteVertexArray(this.vao);this.gl.deleteProgram(this.program);
  }
}

export class WebGPURenderer extends SceneRenderer {
  static async create(target,scene,levels,labels,onFailure){
    if(!navigator.gpu)throw new Error('WebGPU is unavailable');
    const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
    if(!adapter)throw new Error('No WebGPU adapter');
    const device=await adapter.requestDevice();
    try{
      const module=device.createShaderModule({label:'foldelight 3D',code:shaderWGSL});
      const compilation=await module.getCompilationInfo();
      const errors=compilation.messages.filter(message=>message.type==='error');
      if(errors.length)throw new Error(errors.map(error=>error.message).join('\n'));
      const format=navigator.gpu.getPreferredCanvasFormat();
      const pipeline=await device.createRenderPipelineAsync({
        label:'foldelight solid geometry',layout:'auto',
        vertex:{module,entryPoint:'vertexMain',buffers:[{arrayStride:STRIDE*4,attributes:[
          {shaderLocation:0,offset:0,format:'float32x3'},{shaderLocation:1,offset:12,format:'float32x3'},
          {shaderLocation:2,offset:24,format:'float32x2'},{shaderLocation:3,offset:32,format:'float32'},
          {shaderLocation:4,offset:36,format:'float32'},
        ]}]},
        fragment:{module,entryPoint:'fragmentMain',targets:[{format}]},
        primitive:{topology:'triangle-list',cullMode:'back'},
        depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less-equal'},
        multisample:{count:4},
      });
      const vertexBuffer=device.createBuffer({size:scene.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});
      device.queue.writeBuffer(vertexBuffer,0,scene.vertices);
      const textures=[];
      for(const images of [levels,[labels]]){
        const texture=device.createTexture({
          size:[images[0].width,images[0].height],mipLevelCount:images.length,format:'rgba8unorm',
          usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT,
        });
        images.forEach((source,mipLevel)=>device.queue.copyExternalImageToTexture({source},{texture,mipLevel},[source.width,source.height]));
        textures.push(texture);
      }
      const sampler=device.createSampler({minFilter:'linear',magFilter:'linear',mipmapFilter:'linear'});
      const uniformBuffer=device.createBuffer({size:160,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
      const bindGroup=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[
        {binding:0,resource:{buffer:uniformBuffer}},{binding:1,resource:textures[0].createView()},
        {binding:2,resource:textures[1].createView()},{binding:3,resource:sampler},
      ]});
      // Bind the canvas only after shader/pipeline validation. A failed backend is replaced before fallback.
      const context=target.getContext('webgpu');
      if(!context)throw new Error('WebGPU canvas is unavailable');
      context.configure({device,format,alphaMode:'opaque'});
      const renderer=new WebGPURenderer(target,scene.vertices.length/STRIDE);
      Object.assign(renderer,{device,context,format,pipeline,vertexBuffer,uniformBuffer,bindGroup,textures});
      device.lost.then(info=>{if(!renderer.destroyed)onFailure(new Error(info.message||'WebGPU device lost'));});
      device.addEventListener('uncapturederror',event=>{if(!renderer.destroyed)onFailure(event.error);});
      return renderer;
    }catch(error){device.destroy();throw error;}
  }

  render(open,time){
    const resized=this.update(open,time);
    if(resized||!this.depth){
      this.depth?.destroy();this.multisample?.destroy();
      const size=[this.canvas.width,this.canvas.height];
      this.depth=this.device.createTexture({size,sampleCount:4,format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT});
      this.multisample=this.device.createTexture({size,sampleCount:4,format:this.format,usage:GPUTextureUsage.RENDER_ATTACHMENT});
    }
    this.device.queue.writeBuffer(this.uniformBuffer,0,this.values);
    const encoder=this.device.createCommandEncoder();
    const pass=encoder.beginRenderPass({
      colorAttachments:[{view:this.multisample.createView(),resolveTarget:this.context.getCurrentTexture().createView(),clearValue:{r:3/255,g:4/255,b:5/255,a:1},loadOp:'clear',storeOp:'discard'}],
      depthStencilAttachment:{view:this.depth.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'discard'},
    });
    pass.setPipeline(this.pipeline);pass.setBindGroup(0,this.bindGroup);pass.setVertexBuffer(0,this.vertexBuffer);pass.draw(this.count);pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy(){
    this.destroyed=true;this.context.unconfigure();this.depth?.destroy();this.multisample?.destroy();
    this.vertexBuffer.destroy();this.uniformBuffer.destroy();this.textures.forEach(texture=>texture.destroy());this.device.destroy();
  }
}
