// Run at /foldelight/ in DevTools. This measures CPU submission through the GPU
// queue fence, not display FPS or input-to-photon latency. Keep the tab visible.
await (async()=>{
  const rendering=await import('/foldelight/renderers.mjs');
  const scene=await import('/foldelight/scene.mjs');
  const image=new Image();image.src='/foldelight/assets/lock-screen.png';await image.decode();
  const canvas=document.createElement('canvas');canvas.style.cssText='position:fixed;left:-10000px;width:960px;height:456px';document.body.append(canvas);
  let renderer;
  try{
    const mesh=scene.createLaptop(),failures=[];
    renderer=await rendering.WebGPURenderer.create(canvas,mesh,rendering.makeMipLevels(image),rendering.makeLabelAtlas(mesh.labels),error=>failures.push(String(error)));
    const timings=[];
    for(let i=0;i<100;i++){
      const start=performance.now();renderer.render(.35+i*.0065,0);await renderer.device.queue.onSubmittedWorkDone();
      if(i>=10)timings.push(performance.now()-start);
    }
    if(failures.length)throw new Error(failures.join(' | '));
    timings.sort((a,b)=>a-b);
    return {buffer:[canvas.width,canvas.height],samples:timings.length,submitThroughGPUCompletionMS:{median:timings[Math.floor(timings.length*.5)],p95:timings[Math.floor(timings.length*.95)],maximum:timings.at(-1)}};
  }finally{renderer?.destroy();canvas.remove();}
})();
