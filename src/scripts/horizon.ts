// WebGL2 event-horizon overlay: hyperspace streaks, chromatic diffraction, gravitational ripples.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uDir; out vec4 o;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float streaks(vec2 uv,float t,float off){
 float r=length(uv),a=atan(uv.y,uv.x);
 float speed=mix(0.6,3.5,t);
 float n=noise(vec2(a*14.0,pow(r,0.35)*6.0-t*speed*4.0+off));
 n=pow(n,7.0)*smoothstep(0.02,0.35,r);
 return n*2.2;}
void main(){
 vec2 uv=(gl_FragCoord.xy-0.5*uRes)/min(uRes.x,uRes.y);
 float t = uDir < 0.0 ? (1.0 - uT) : uT;
 float env=sin(3.14159*t); env=pow(env,0.8);
 float r=length(uv);
 // gravitational ripples: radial waves warp the field
 float wave=sin(r*38.0-t*28.0)*exp(-r*2.2)*0.04*env;
 vec2 w=uv*(1.0+wave);
 // lensing pull toward the center as the horizon opens
 float pull=mix(0.0,0.35,smoothstep(0.1,0.7,t))*exp(-r*1.5);
 w*=1.0-pull;
 // chromatic split (CMY diffraction): offset per channel
 float s=0.012*env;
 float c=streaks(w*(1.0+s),t,0.0);
 float m=streaks(w,t,0.37);
 float y=streaks(w*(1.0-s),t,0.71);
 vec3 col=vec3(0.0);
 col+=c*vec3(0.33,1.0,1.0); col+=m*vec3(1.0,0.33,1.0); col+=y*vec3(1.0,1.0,0.33);
 // Einstein ring
 float R=mix(0.05,0.62,t);
 float ring=exp(-pow((r-R)*22.0,2.0))*1.6;
 col+=ring*vec3(0.8,0.95,1.0)*env;
 // secondary ripple rings
 float rip=max(0.0,sin(r*60.0-t*40.0))*exp(-abs(r-R)*6.0)*0.35;
 col+=rip*vec3(1.0,0.5,1.0)*env;
 // the hole: swallow the center
 float hole=mix(0.0,0.5,smoothstep(0.35,0.95,t));
 float dark=smoothstep(hole,hole-0.08,r)*step(0.35,t);
 float alpha=clamp(length(col)*0.9+dark,0.0,1.0)*env;
 col=mix(col,vec3(0.0),dark);
 o=vec4(col*alpha,alpha);
}`;

const VERT = `#version 300 es
in vec2 p; void main(){gl_Position=vec4(p,0.,1.);}`;

let currentAnimId: number | null = null;
let cachedGl: WebGL2RenderingContext | null = null;
let cachedProg: WebGLProgram | null = null;
let cachedLocations: {
  loc: number;
  uRes: WebGLUniformLocation | null;
  uT: WebGLUniformLocation | null;
  uDir: WebGLUniformLocation | null;
} | null = null;

export function runHorizon(
  canvas: HTMLCanvasElement,
  duration = 1100,
  dir = 1
): Promise<boolean> {
  if (currentAnimId !== null) {
    cancelAnimationFrame(currentAnimId);
    currentAnimId = null;
  }

  let gl = cachedGl;
  if (!gl || gl.isContextLost()) {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return Promise.resolve(false);
    cachedGl = gl;

    const sh = (t: number, s: string) => {
      const h = gl!.createShader(t)!;
      gl!.shaderSource(h, s);
      gl!.compileShader(h);
      return h;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    cachedProg = prog;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    cachedLocations = {
      loc,
      uRes: gl.getUniformLocation(prog, 'uRes'),
      uT: gl.getUniformLocation(prog, 'uT'),
      uDir: gl.getUniformLocation(prog, 'uDir'),
    };
  }

  const prog = cachedProg!;
  const locs = cachedLocations!;
  gl.useProgram(prog);

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(locs.uRes, canvas.width, canvas.height);
  gl.uniform1f(locs.uDir, dir);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  canvas.style.display = 'block';
  const start = performance.now();

  return new Promise((res) => {
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform1f(locs.uT, t);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (t < 1) {
        currentAnimId = requestAnimationFrame(frame);
      } else {
        canvas.style.display = 'none';
        currentAnimId = null;
        res(true);
      }
    };
    currentAnimId = requestAnimationFrame(frame);
  });
}
