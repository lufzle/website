// Run this expression in the DevTools console at /foldelight/.
// Temporary canvases and GPU resources are removed after the check.
await (async()=>{
  const scene=await import('/foldelight/scene.mjs');
  const rendering=await import('/foldelight/renderers.mjs');
  const image=new Image();image.src='/foldelight/assets/lock-screen.png';
  await image.decode();
  const mesh=scene.createLaptop();
  const levels=rendering.makeMipLevels(image),labels=rendering.makeLabelAtlas(mesh.labels);
  const host=document.createElement('div');
  host.style.cssText='position:fixed;left:-10000px;top:0';
  document.body.append(host);
  const canvases=[],renderers=[],failures=[];
  try {
    for(const Renderer of [rendering.WebGPURenderer,rendering.WebGLRenderer]) {
      const canvas=document.createElement('canvas');
      canvas.style.cssText='width:640px;height:304px;display:block';
      host.append(canvas);canvases.push(canvas);
      renderers.push(await Renderer.create(canvas,mesh,levels,labels,error=>failures.push(String(error))));
    }
    const poses=[];
    for(const angle of [0,32.8753,60,100]) {
      let low=0,high=1;
      for(let i=0;i<30;i++) {
        const middle=(low+high)/2;
        if(scene.angleForProgress(middle)<angle) low=middle; else high=middle;
      }
      const pixels=[];
      for(let i=0;i<2;i++) {
        renderers[i].render((low+high)/2,0);
        const canvas=canvases[i],sample=document.createElement('canvas');
        sample.width=canvas.width;sample.height=canvas.height;
        const context=sample.getContext('2d',{willReadFrequently:true});
        context.drawImage(canvas,0,0);
        pixels.push(context.getImageData(0,0,sample.width,sample.height).data);
      }
      let difference=0,lit=0;
      for(let i=0;i<pixels[0].length;i++) {
        if(i%4===3) continue;
        difference+=Math.abs(pixels[0][i]-pixels[1][i]);
        if(pixels[0][i]>3) lit++;
      }
      const channels=pixels[0].length*3/4;
      const error=difference/channels,visibleFraction=lit/channels;
      if(error>.5 || visibleFraction<.15) throw new Error(`Render mismatch at ${angle} degrees: ${error}, ${visibleFraction}`);
      if(renderers[1].gl.getError()!==renderers[1].gl.NO_ERROR) throw new Error('WebGL reported a rendering error');
      poses.push({angle,meanAbsoluteRGBError:error,visibleFraction});
    }
    await renderers[0].device.queue.onSubmittedWorkDone();
    if(failures.length) throw new Error(failures.join('\n'));
    return {size:[canvases[0].width,canvases[0].height],poses,failures};
  } finally {
    renderers.forEach(renderer=>renderer.destroy());
    host.remove();
  }
})();
