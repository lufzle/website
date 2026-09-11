import { SCREEN, LAPTOP } from './scene.mjs';
import { LID_MARK } from './materials.mjs';

export const vertexGLSL = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUV;
layout(location=3) in float aMaterial;
layout(location=4) in float aLid;
uniform mat4 uViewProjection;
uniform mat4 uLid;
out vec3 vWorld;
out vec3 vNormal;
out vec2 vUV;
flat out float vMaterial;
flat out float vLid;
void main() {
  vec4 world = mix(vec4(aPosition, 1.), uLid * vec4(aPosition, 1.), aLid);
  vWorld = world.xyz;
  vNormal = mix(aNormal, mat3(uLid) * aNormal, aLid);
  vUV = aUV;
  vMaterial = aMaterial;
  vLid = aLid;
  gl_Position = uViewProjection * world;
  gl_Position.z = 2. * gl_Position.z - gl_Position.w;
}`;

export const fragmentGLSL = `#version 300 es
precision highp float;
uniform mat4 uLid;
uniform sampler2D uScreen;
uniform sampler2D uLabels;
uniform vec3 uEye;
uniform vec4 uParams;
in vec3 vWorld;
in vec3 vNormal;
in vec2 vUV;
flat in float vMaterial;
flat in float vLid;
out vec4 outColor;

float roundedDistance(vec2 uv, float radius) {
  vec2 q = abs((uv - .5) * vec2(1.6, 1.)) - vec2(.8, .5) + radius;
  return min(max(q.x,q.y),0.) + length(max(q,0.)) - radius;
}

vec3 diffuseGlass(vec2 uv, float radius) {
  float level = log2(max(1., radius * .72));
  vec2 spread = radius * .46 / vec2(textureSize(uScreen,0));
  vec3 color = textureLod(uScreen, uv, level).rgb * .28;
  color += textureLod(uScreen, uv + vec2(spread.x,0.), level).rgb * .12;
  color += textureLod(uScreen, uv - vec2(spread.x,0.), level).rgb * .12;
  color += textureLod(uScreen, uv + vec2(0.,spread.y), level).rgb * .12;
  color += textureLod(uScreen, uv - vec2(0.,spread.y), level).rgb * .12;
  color += textureLod(uScreen, uv + spread, level).rgb * .06;
  color += textureLod(uScreen, uv - spread, level).rgb * .06;
  color += textureLod(uScreen, uv + vec2(spread.x,-spread.y), level).rgb * .06;
  color += textureLod(uScreen, uv + vec2(-spread.x,spread.y), level).rgb * .06;
  return color;
}

vec3 displayColor(vec2 uv, vec3 normal, vec3 view) {
  float fold = uParams.x;
  float theta = fold * 1.1868238914;
  float height = 1. - uv.y;
  float lift = sin(theta);
  float rayScale = 2. / (2. - height * lift);
  vec2 source = vec2(.5 + (uv.x-.5)*rayScale,
    1. - (.7 + (height*cos(theta)-.7)*rayScale));
  float boundary = -roundedDistance(source,.040);
  float perimeter = 1. - smoothstep(0.,.08,max(boundary,0.));
  float radius = 43.2*lift*pow(height,1.8)*(1.+.85*perimeter);
  float softness = .0008 + radius / float(textureSize(uScreen,0).y) * 1.5;
  float coverage = smoothstep(-softness,softness,boundary);
  vec3 glass = diffuseGlass(clamp(source,0.,1.),radius);
  float lateral = 1.-smoothstep(0.,.32,min(uv.x,1.-uv.x));
  float vignette = .30*sqrt(fold)*lateral;
  float liftedEdge = smoothstep(.55,1.,height);
  glass *= (1.-vignette)*(1.-.475*lift*liftedEdge*liftedEdge);
  float opacity = 1.-smoothstep(.80,1.,fold);
  glass = mix(vec3(.0015,.002,.003),glass,coverage)*opacity;
  float fresnel = pow(1.-max(dot(normal,view),0.),5.);
  // A restrained moving softbox reflection, visible only on the glass.
  float reflection = exp(-pow((uv.x+.20*uv.y-.26)*6.,2.));
  glass += vec3(.20,.25,.29)*reflection*(.007+.035*fresnel)*opacity;
  return glass;
}

const float SCREEN_WIDTH=${SCREEN.width.toFixed(3)};
const float SCREEN_HEIGHT=${SCREEN.height.toFixed(3)};
const float SCREEN_Y=${SCREEN.centerY.toFixed(3)};
const float SCREEN_Z=${SCREEN.frontZ.toFixed(3)};
vec3 srgbToLinear(vec3 color) {
  return mix(color/12.92,pow((max(color,0.)+.055)/1.055,vec3(2.4)),step(vec3(.04045),color));
}
vec3 linearToSRGB(vec3 color) {
  return mix(color*12.92,1.055*pow(max(color,0.),vec3(1./2.4))-.055,step(vec3(.0031308),color));
}

// Low-frequency emission follows the existing glass warp and fade. It excludes
// studio reflections: those are reflected light, not light emitted by the panel.
vec3 screenEmission(vec2 uv, float minimumLevel) {
  if(any(lessThan(uv,vec2(0.))) || any(greaterThan(uv,vec2(1.)))) return vec3(0.);
  float opacity=1.-smoothstep(.80,1.,uParams.x);
  float height=1.-uv.y;
  float theta=uParams.x*1.1868238914;
  float lift=sin(theta);
  float rayScale=2./(2.-height*lift);
  vec2 source=vec2(.5+(uv.x-.5)*rayScale,1.-(.7+(height*cos(theta)-.7)*rayScale));
  float boundary=-roundedDistance(source,.040);
  float perimeter=1.-smoothstep(0.,.08,max(boundary,0.));
  float radius=43.2*lift*pow(max(height,0.),1.8)*(1.+.85*perimeter);
  float maskBlur=max(.001,exp2(minimumLevel)/float(textureSize(uScreen,0).y)*.5);
  float softness=max(maskBlur,.0008+radius/float(textureSize(uScreen,0).y)*1.5);
  float coverage=smoothstep(-softness,softness,boundary);
  float lateral=1.-smoothstep(0.,.32,min(uv.x,1.-uv.x));
  float liftedEdge=smoothstep(.55,1.,height);
  float attenuation=(1.-.30*sqrt(uParams.x)*lateral)*(1.-.475*lift*liftedEdge*liftedEdge);
  float physical=smoothstep(-maskBlur,maskBlur,-roundedDistance(uv,.033));
  // Filter the notch with the reflection footprint as well as the image.
  // A sharp post-sample mask would pop through a heavily blurred reflection.
  vec2 maskFilter=max(vec2(.001),vec2(exp2(minimumLevel))/vec2(textureSize(uScreen,0)));
  float notchHalf=.1825/SCREEN_WIDTH;
  float notchX=smoothstep(.5-notchHalf-maskFilter.x,.5-notchHalf+maskFilter.x,uv.x)-smoothstep(.5+notchHalf-maskFilter.x,.5+notchHalf+maskFilter.x,uv.x);
  float notchY=smoothstep(-maskFilter.y,maskFilter.y,uv.y)-smoothstep(.037-maskFilter.y,.037+maskFilter.y,uv.y);
  float notch=notchX*notchY;
  float level=max(minimumLevel,log2(max(1.,radius*.72)));
  vec3 color=textureLod(uScreen,clamp(source,0.,1.),level).rgb*coverage*attenuation*opacity;
  return srgbToLinear(color)*physical*(1.-notch);
}

vec3 blurredScreenEmission(vec2 uv,float level) {
  float feather=max(.003,exp2(level)/float(textureSize(uScreen,0).y));
  float coverage=smoothstep(-feather,feather,-roundedDistance(uv,.033));
  return screenEmission(clamp(uv,.015,.985),level)*coverage;
}

// Projected solid angle of a rectangle. Clip at the receiver's horizon before
// integration, including bevels. Unlike point lights, this stays bounded near keys.
float rectangleIrradiance(vec3 world, vec3 normal, vec2 low, vec2 high) {
  vec3 corners[4]=vec3[4](
    (uLid*vec4(low.x,low.y,SCREEN_Z,1.)).xyz-world,
    (uLid*vec4(low.x,high.y,SCREEN_Z,1.)).xyz-world,
    (uLid*vec4(high.x,high.y,SCREEN_Z,1.)).xyz-world,
    (uLid*vec4(high.x,low.y,SCREEN_Z,1.)).xyz-world);
  vec3 polygon[5];
  int count=0;
  for(int i=0;i<4;i++) {
    vec3 a=corners[i]; vec3 b=corners[(i+1)%4];
    float da=dot(normal,a); float db=dot(normal,b);
    if(da>0.) { polygon[count]=a;count++; }
    if((da>0.)!=(db>0.)) { polygon[count]=mix(a,b,da/(da-db));count++; }
  }
  if(count<3) return 0.;
  vec3 integral=vec3(0.);
  for(int i=0;i<5;i++) {
    if(i>=count) break;
    vec3 a=normalize(polygon[i]); vec3 b=normalize(polygon[(i+1)%count]);
    vec3 edge=cross(a,b);
    float sine=length(edge);
    integral+=edge*(atan(sine,clamp(dot(a,b),-1.,1.))/max(sine,.000001));
  }
  return clamp(dot(normal,integral)*.1591549431,0.,1.);
}

vec3 screenBounce(vec3 world,vec3 normal,vec3 view,vec3 base,float roughness,float metallic) {
  // The chassis blocks the floor and underside. Only the base's upper surfaces
  // receive the screen light; the lid never lights its own back or bezel.
  if(world.y<.04 || normal.y<=.05 || uParams.x>=1.) return vec3(0.);
  vec3 center=(uLid*vec4(0.,SCREEN_Y,SCREEN_Z,1.)).xyz;
  vec3 lightNormal=uLid[2].xyz;
  if(dot(lightNormal,world-center)<=.00001) return vec3(0.);
  vec3 irradiance=vec3(0.);
  float diffuseLevel=log2(max(1.,float(textureSize(uScreen,0).x)*.30));
  // Four broad colored patches preserve the screen's blue/beige variation.
  // Each patch's geometry is integrated, not approximated by a point sample.
  for(int y=0;y<2;y++) { for(int x=0;x<2;x++) {
    vec2 low=vec2((float(x)-1.)*SCREEN_WIDTH*.5,SCREEN_Y-SCREEN_HEIGHT*.5+float(y)*SCREEN_HEIGHT*.5);
    vec2 high=low+vec2(SCREEN_WIDTH,SCREEN_HEIGHT)*.5;
    vec2 uv=vec2((float(x)+.5)*.5,1.-(float(y)+.5)*.5);
    irradiance+=screenEmission(uv,diffuseLevel)*rectangleIrradiance(world,normal,low,high);
  }
  }
  vec3 bounce=irradiance*srgbToLinear(base)*mix(3.2,1.5,metallic);
  vec3 ray=reflect(-view,normal);
  float denominator=dot(lightNormal,ray);
  if(denominator<-.000001) {
    float distance=dot(lightNormal,center-world)/denominator;
    if(distance>0.) {
      vec3 hit=world+ray*distance-center;
      vec2 uv=vec2(.5+dot(hit,uLid[0].xyz)/SCREEN_WIDTH,.5-dot(hit,uLid[1].xyz)/SCREEN_HEIGHT);
      float worldBlur=distance*(.022+.11*roughness*roughness);
      vec2 spread=vec2(worldBlur/SCREEN_WIDTH,worldBlur/(SCREEN_HEIGHT*max(.18,-denominator)));
      vec2 pixels=spread*vec2(textureSize(uScreen,0));
      float level=log2(max(1.,max(pixels.x,pixels.y)*.70));
      // Zero outside the emitter. Do not renormalize the kernel at its boundary,
      // or the reflection will smear a colored rectangle beyond the screen.
      vec3 reflection=blurredScreenEmission(uv,level)*.40;
      reflection+=blurredScreenEmission(uv+vec2(spread.x,0.),level)*.15;
      reflection+=blurredScreenEmission(uv-vec2(spread.x,0.),level)*.15;
      reflection+=blurredScreenEmission(uv+vec2(0.,spread.y),level)*.15;
      reflection+=blurredScreenEmission(uv-vec2(0.,spread.y),level)*.15;
      float fresnel=mix(.04,.30,metallic)+(1.-mix(.04,.30,metallic))*pow(1.-max(dot(normal,view),0.),5.);
      // A very large rough footprint contains mostly black outside the panel.
      // Preserve that lost energy as the reflected ray approaches parallel.
      float footprintArea=6.2831853*spread.x*spread.y;
      float energy=inversesqrt(1.+footprintArea*footprintArea);
      bounce+=reflection*fresnel*mix(.42,.72,metallic)*energy;
    }
  }
  return bounce;
}

vec3 studioFloor(vec3 world) {
  vec2 q=abs(world.xz)-vec2(1.49,.94);
  float distance=min(max(q.x,q.y),0.)+length(max(q,0.))-.11;
  vec2 poolUV=vec2(world.x/2.35,(world.z-.15)/2.25);
  float pool=exp(-dot(poolUV,poolUV));
  float contact=smoothstep(-.025,.25,distance);
  float front=(world.z-1.21)/.16, side=world.x/1.68;
  float side2=side*side;
  float reflection=exp(-front*front-side2*side2*side2);
  return vec3(.085,.086,.096)*pool*contact+vec3(.011,.012,.014)*reflection*contact;
}

vec3 metalLight(vec3 normal, vec3 view, vec3 base, float roughness, float metallic, vec2 footprint) {
  vec3 light=normalize(vec3(-.35,1.8,2.));
  float diffuse=max(dot(normal,light),0.);
  vec3 color=base*(.22+.50*max(normal.y,0.)+.24*diffuse);
  vec3 reflected=reflect(-view,normal);
  // Broad studio cards reveal the finish without a bright plastic rim.
  float ceiling=exp((dot(reflected,normalize(vec3(.12,.75,-.8)))-1.)/(.09+.20*roughness));
  vec2 cardUV=vec2((abs(reflected.x)-.86)/(.12+.07*roughness),(reflected.y-.28)/.57);
  float sideCards=exp(-dot(cardUV,cardUV));
  vec2 overheadUV=vec2((reflected.y-.55)/.4,reflected.x/1.3);
  float overhead=exp(-dot(overheadUV,overheadUV));
  float fresnel=pow(1.-max(dot(normal,view),0.),4.);
  vec3 reflectedLight=vec3(.075,.078,.087)*ceiling+vec3(.20,.205,.215)*sideCards
    +vec3(.023,.024,.028)*overhead;
  color+=reflectedLight*mix(.10,1.,metallic)*(.65+.35*fresnel);
  float specular=pow(max(dot(normal,normalize(view+light)),0.),mix(160.,24.,roughness));
  color+=vec3(.027,.028,.031)*specular;
  // UVs move with each rigid part. Filter the fine anodized grain when it is subpixel.
  float grain=fract(sin(dot(vUV*1800.,vec2(12.9898,78.233)))*43758.5453)-.5;
  float grainVisibility=1.-smoothstep(.5,1.5,max(footprint.x,footprint.y)*1800.);
  return color+grain*.003*metallic*grainVisibility;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(uEye-vWorld);
  vec2 footprint=fwidth(vUV);
  vec3 color;
  if(vMaterial>7.5) {
    color=studioFloor(vWorld);
  } else if(vMaterial>1.5 && vMaterial<2.5) {
    color = displayColor(vUV,normal,view);
  } else {
    vec3 base = vec3(.155,.158,.170);
    float roughness=.62, metallic=.88;
    if(vMaterial>.5 && vMaterial<1.5) { base=vec3(.006,.007,.009);roughness=.55;metallic=.08; }
    if(vMaterial>2.5 && vMaterial<3.5) { base=vec3(.014,.015,.018);roughness=.90;metallic=.02; }
    if(vMaterial>3.5 && vMaterial<4.5) {
      vec2 labelPixels=footprint*vec2(textureSize(uLabels,0));
      float labelLevel=log2(max(1.,max(labelPixels.x,labelPixels.y)));
      float label = textureLod(uLabels,vUV,labelLevel).r;
      base=mix(vec3(.028,.029,.034),vec3(.28,.29,.31),label);
      roughness=.78;metallic=.03;
    }
    if(vMaterial>4.5 && vMaterial<5.5) { base=vec3(.142,.145,.158);roughness=.84;metallic=.60; }
    if(vMaterial>5.5 && vMaterial<6.5) {
      vec2 cell = fract(vUV*vec2(16.,120.))-.5;
      float filterWidth=max(footprint.x*16.,footprint.y*120.);
      float hole=1.-smoothstep(.20,.29+min(.2,filterWidth),length(cell));
      hole=mix(hole,.22,smoothstep(.45,1.,filterWidth));
      base=mix(base,vec3(.018,.019,.024),hole*.80);
    }
    if(vMaterial>6.5) { base=vec3(.006,.012,.022);roughness=.18;metallic=.30; }
    if(vLid>.5 && vMaterial<.5 && dot(normal,-uLid[2].xyz)>.999) {
      vec2 markUV=vec2(.5-(vUV.x-.5)*${(LAPTOP.width/LID_MARK.width).toFixed(4)},.5+(vUV.y-.5)*${(LAPTOP.lidHeight/LID_MARK.height).toFixed(4)});
      vec2 atlasUV=(vec2(${LID_MARK.atlasX.toFixed(1)},${LID_MARK.atlasY.toFixed(1)})+clamp(markUV,0.,1.)*${LID_MARK.atlasSize.toFixed(1)})/vec2(1024.,512.);
      vec2 markPixels=footprint*vec2(${(LAPTOP.width/LID_MARK.width).toFixed(4)},${(LAPTOP.lidHeight/LID_MARK.height).toFixed(4)})*${LID_MARK.atlasSize.toFixed(1)};
      float level=log2(max(1.,max(markPixels.x,markPixels.y)));
      float mask=textureLod(uLabels,atlasUV,min(level,4.)).g;
      if(any(lessThan(markUV,vec2(0.))) || any(greaterThan(markUV,vec2(1.)))) mask=0.;
      base=mix(base,vec3(.006,.007,.009),mask);
      roughness=mix(roughness,.24,mask);metallic=mix(metallic,.96,mask);
    }
    color=metalLight(normal,view,base,roughness,metallic,footprint);
    // Hinge occlusion is local to the keyboard, not painted on the whole scene.
    if(vWorld.y<.08 && normal.y>.5)color*=.77+.23*smoothstep(-.96,-.40,vWorld.z);
    if(vLid<.5)color=linearToSRGB(srgbToLinear(color)+screenBounce(vWorld,normal,view,base,roughness,metallic));
  }
  outColor=vec4(max(color,0.),1.);
}`;

export const shaderWGSL = `
struct Uniforms {
  viewProjection: mat4x4<f32>,
  lid: mat4x4<f32>,
  eye: vec4<f32>,
  params: vec4<f32>,
};
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
  @location(3) material: f32,
  @location(4) lid: f32,
};
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) world: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
  @location(3) @interpolate(flat) material: f32,
  @location(4) @interpolate(flat) lid: f32,
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var screenTexture: texture_2d<f32>;
@group(0) @binding(2) var labelTexture: texture_2d<f32>;
@group(0) @binding(3) var textureSampler: sampler;

@vertex fn vertexMain(input: VertexInput) -> VertexOutput {
  var out: VertexOutput;
  let world=mix(vec4(input.position,1.),uniforms.lid*vec4(input.position,1.),input.lid);
  out.position=uniforms.viewProjection*world;
  out.world=world.xyz;
  out.normal=mix(input.normal,(uniforms.lid*vec4(input.normal,0.)).xyz,input.lid);
  out.uv=input.uv;
  out.material=input.material;
  out.lid=input.lid;
  return out;
}

fn roundedDistance(uv: vec2<f32>, radius: f32) -> f32 {
  let q=abs((uv-.5)*vec2(1.6,1.))-vec2(.8,.5)+radius;
  return min(max(q.x,q.y),0.)+length(max(q,vec2(0.)))-radius;
}

fn diffuseGlass(uv: vec2<f32>, radius: f32) -> vec3<f32> {
  let level=log2(max(1.,radius*.72));
  let spread=vec2(radius*.46)/vec2<f32>(textureDimensions(screenTexture,0));
  var color=textureSampleLevel(screenTexture,textureSampler,uv,level).rgb*.28;
  color+=textureSampleLevel(screenTexture,textureSampler,uv+vec2(spread.x,0.),level).rgb*.12;
  color+=textureSampleLevel(screenTexture,textureSampler,uv-vec2(spread.x,0.),level).rgb*.12;
  color+=textureSampleLevel(screenTexture,textureSampler,uv+vec2(0.,spread.y),level).rgb*.12;
  color+=textureSampleLevel(screenTexture,textureSampler,uv-vec2(0.,spread.y),level).rgb*.12;
  color+=textureSampleLevel(screenTexture,textureSampler,uv+spread,level).rgb*.06;
  color+=textureSampleLevel(screenTexture,textureSampler,uv-spread,level).rgb*.06;
  color+=textureSampleLevel(screenTexture,textureSampler,uv+vec2(spread.x,-spread.y),level).rgb*.06;
  color+=textureSampleLevel(screenTexture,textureSampler,uv+vec2(-spread.x,spread.y),level).rgb*.06;
  return color;
}

fn displayColor(uv: vec2<f32>, normal: vec3<f32>, view: vec3<f32>) -> vec3<f32> {
  let fold=uniforms.params.x;
  let theta=fold*1.1868238914;
  let height=1.-uv.y;
  let lift=sin(theta);
  let rayScale=2./(2.-height*lift);
  let source=vec2(.5+(uv.x-.5)*rayScale,1.-(.7+(height*cos(theta)-.7)*rayScale));
  let boundary=-roundedDistance(source,.040);
  let perimeter=1.-smoothstep(0.,.08,max(boundary,0.));
  let radius=43.2*lift*pow(height,1.8)*(1.+.85*perimeter);
  let softness=.0008+radius/f32(textureDimensions(screenTexture,0).y)*1.5;
  let coverage=smoothstep(-softness,softness,boundary);
  var glass=diffuseGlass(clamp(source,vec2(0.),vec2(1.)),radius);
  let lateral=1.-smoothstep(0.,.32,min(uv.x,1.-uv.x));
  let vignette=.30*sqrt(fold)*lateral;
  let liftedEdge=smoothstep(.55,1.,height);
  glass*=(1.-vignette)*(1.-.475*lift*liftedEdge*liftedEdge);
  let opacity=1.-smoothstep(.80,1.,fold);
  glass=mix(vec3(.0015,.002,.003),glass,coverage)*opacity;
  let fresnel=pow(1.-max(dot(normal,view),0.),5.);
  let reflection=exp(-pow((uv.x+.20*uv.y-.26)*6.,2.));
  glass+=vec3(.20,.25,.29)*reflection*(.007+.035*fresnel)*opacity;
  return glass;
}

const SCREEN_WIDTH: f32=${SCREEN.width.toFixed(3)};
const SCREEN_HEIGHT: f32=${SCREEN.height.toFixed(3)};
const SCREEN_Y: f32=${SCREEN.centerY.toFixed(3)};
const SCREEN_Z: f32=${SCREEN.frontZ.toFixed(3)};
fn srgbToLinear(color: vec3<f32>) -> vec3<f32> {
  return mix(color/12.92,pow((max(color,vec3(0.))+.055)/1.055,vec3(2.4)),step(vec3(.04045),color));
}
fn linearToSRGB(color: vec3<f32>) -> vec3<f32> {
  return mix(color*12.92,1.055*pow(max(color,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),color));
}

// Low-frequency emission follows the existing glass warp and fade. It excludes
// studio reflections: those are reflected light, not light emitted by the panel.
fn screenEmission(uv: vec2<f32>, minimumLevel: f32) -> vec3<f32> {
  if(any(uv<vec2(0.)) || any(uv>vec2(1.))) { return vec3(0.); }
  var opacity=1.-smoothstep(.80,1.,uniforms.params.x);
  var height=1.-uv.y;
  var theta=uniforms.params.x*1.1868238914;
  var lift=sin(theta);
  var rayScale=2./(2.-height*lift);
  var source=vec2(.5+(uv.x-.5)*rayScale,1.-(.7+(height*cos(theta)-.7)*rayScale));
  var boundary=-roundedDistance(source,.040);
  var perimeter=1.-smoothstep(0.,.08,max(boundary,0.));
  var radius=43.2*lift*pow(max(height,0.),1.8)*(1.+.85*perimeter);
  let maskBlur=max(.001,exp2(minimumLevel)/f32(textureDimensions(screenTexture,0).y)*.5);
  var softness=max(maskBlur,.0008+radius/f32(textureDimensions(screenTexture,0).y)*1.5);
  var coverage=smoothstep(-softness,softness,boundary);
  var lateral=1.-smoothstep(0.,.32,min(uv.x,1.-uv.x));
  var liftedEdge=smoothstep(.55,1.,height);
  var attenuation=(1.-.30*sqrt(uniforms.params.x)*lateral)*(1.-.475*lift*liftedEdge*liftedEdge);
  var physical=smoothstep(-maskBlur,maskBlur,-roundedDistance(uv,.033));
  // Filter the notch with the reflection footprint as well as the image.
  // A sharp post-sample mask would pop through a heavily blurred reflection.
  let maskFilter=max(vec2(.001),vec2(exp2(minimumLevel))/vec2<f32>(textureDimensions(screenTexture,0)));
  let notchHalf=.1825/SCREEN_WIDTH;
  let notchX=smoothstep(.5-notchHalf-maskFilter.x,.5-notchHalf+maskFilter.x,uv.x)-smoothstep(.5+notchHalf-maskFilter.x,.5+notchHalf+maskFilter.x,uv.x);
  let notchY=smoothstep(-maskFilter.y,maskFilter.y,uv.y)-smoothstep(.037-maskFilter.y,.037+maskFilter.y,uv.y);
  let notch=notchX*notchY;
  var level=max(minimumLevel,log2(max(1.,radius*.72)));
  var color=textureSampleLevel(screenTexture,textureSampler,clamp(source,vec2(0.),vec2(1.)),level).rgb*coverage*attenuation*opacity;
  return srgbToLinear(color)*physical*(1.-notch);
}

fn blurredScreenEmission(uv: vec2<f32>, level: f32) -> vec3<f32> {
  var feather=max(.003,exp2(level)/f32(textureDimensions(screenTexture,0).y));
  var coverage=smoothstep(-feather,feather,-roundedDistance(uv,.033));
  return screenEmission(clamp(uv,vec2(.015),vec2(.985)),level)*coverage;
}

// Projected solid angle of a rectangle. Clip at the receiver's horizon before
// integration, including bevels. Unlike point lights, this stays bounded near keys.
fn rectangleIrradiance(world: vec3<f32>, normal: vec3<f32>, low: vec2<f32>, high: vec2<f32>) -> f32 {
  var corners=array<vec3<f32>,4>(
    (uniforms.lid*vec4(low.x,low.y,SCREEN_Z,1.)).xyz-world,
    (uniforms.lid*vec4(low.x,high.y,SCREEN_Z,1.)).xyz-world,
    (uniforms.lid*vec4(high.x,high.y,SCREEN_Z,1.)).xyz-world,
    (uniforms.lid*vec4(high.x,low.y,SCREEN_Z,1.)).xyz-world);
  var polygon: array<vec3<f32>,5>;
  var count=0;
  for(var i=0;i<4;i++) {
    var a=corners[i]; var b=corners[(i+1)%4];
    var da=dot(normal,a); var db=dot(normal,b);
    if(da>0.) { polygon[count]=a;count++; }
    if((da>0.)!=(db>0.)) { polygon[count]=mix(a,b,da/(da-db));count++; }
  }
  if(count<3) { return 0.; }
  var integral=vec3(0.);
  for(var i=0;i<5;i++) {
    if(i>=count) { break; }
    var a=normalize(polygon[i]); var b=normalize(polygon[(i+1)%count]);
    var edge=cross(a,b);
    var sine=length(edge);
    integral+=edge*(atan2(sine,clamp(dot(a,b),-1.,1.))/max(sine,.000001));
  }
  return clamp(dot(normal,integral)*.1591549431,0.,1.);
}

fn screenBounce(world: vec3<f32>, normal: vec3<f32>, view: vec3<f32>, base: vec3<f32>, roughness: f32, metallic: f32) -> vec3<f32> {
  // The chassis blocks the floor and underside. Only the base's upper surfaces
  // receive the screen light; the lid never lights its own back or bezel.
  if(world.y<.04 || normal.y<=.05 || uniforms.params.x>=1.) { return vec3(0.); }
  var center=(uniforms.lid*vec4(0.,SCREEN_Y,SCREEN_Z,1.)).xyz;
  var lightNormal=uniforms.lid[2].xyz;
  if(dot(lightNormal,world-center)<=.00001) { return vec3(0.); }
  var irradiance=vec3(0.);
  var diffuseLevel=log2(max(1.,f32(textureDimensions(screenTexture,0).x)*.30));
  // Four broad colored patches preserve the screen's blue/beige variation.
  // Each patch's geometry is integrated, not approximated by a point sample.
  for(var y=0;y<2;y++) { for(var x=0;x<2;x++) {
    var low=vec2((f32(x)-1.)*SCREEN_WIDTH*.5,SCREEN_Y-SCREEN_HEIGHT*.5+f32(y)*SCREEN_HEIGHT*.5);
    var high=low+vec2(SCREEN_WIDTH,SCREEN_HEIGHT)*.5;
    var uv=vec2((f32(x)+.5)*.5,1.-(f32(y)+.5)*.5);
    irradiance+=screenEmission(uv,diffuseLevel)*rectangleIrradiance(world,normal,low,high);
  }
  }
  var bounce=irradiance*srgbToLinear(base)*mix(3.2,1.5,metallic);
  var ray=reflect(-view,normal);
  var denominator=dot(lightNormal,ray);
  if(denominator<-.000001) {
    var distance=dot(lightNormal,center-world)/denominator;
    if(distance>0.) {
      var hit=world+ray*distance-center;
      var uv=vec2(.5+dot(hit,uniforms.lid[0].xyz)/SCREEN_WIDTH,.5-dot(hit,uniforms.lid[1].xyz)/SCREEN_HEIGHT);
      var worldBlur=distance*(.022+.11*roughness*roughness);
      var spread=vec2(worldBlur/SCREEN_WIDTH,worldBlur/(SCREEN_HEIGHT*max(.18,-denominator)));
      var pixels=spread*vec2<f32>(textureDimensions(screenTexture,0));
      var level=log2(max(1.,max(pixels.x,pixels.y)*.70));
      // Zero outside the emitter. Do not renormalize the kernel at its boundary,
      // or the reflection will smear a colored rectangle beyond the screen.
      var reflection=blurredScreenEmission(uv,level)*.40;
      reflection+=blurredScreenEmission(uv+vec2(spread.x,0.),level)*.15;
      reflection+=blurredScreenEmission(uv-vec2(spread.x,0.),level)*.15;
      reflection+=blurredScreenEmission(uv+vec2(0.,spread.y),level)*.15;
      reflection+=blurredScreenEmission(uv-vec2(0.,spread.y),level)*.15;
      var fresnel=mix(.04,.30,metallic)+(1.-mix(.04,.30,metallic))*pow(1.-max(dot(normal,view),0.),5.);
      // A very large rough footprint contains mostly black outside the panel.
      // Preserve that lost energy as the reflected ray approaches parallel.
      let footprintArea=6.2831853*spread.x*spread.y;
      let energy=inverseSqrt(1.+footprintArea*footprintArea);
      bounce+=reflection*fresnel*mix(.42,.72,metallic)*energy;
    }
  }
  return bounce;
}

fn studioFloor(world: vec3<f32>) -> vec3<f32> {
  let q=abs(world.xz)-vec2(1.49,.94);
  let distance=min(max(q.x,q.y),0.)+length(max(q,vec2(0.)))-.11;
  let poolUV=vec2(world.x/2.35,(world.z-.15)/2.25);
  let pool=exp(-dot(poolUV,poolUV));
  let contact=smoothstep(-.025,.25,distance);
  let front=(world.z-1.21)/.16;
  let side=world.x/1.68;
  let side2=side*side;
  let reflection=exp(-front*front-side2*side2*side2);
  return vec3(.085,.086,.096)*pool*contact+vec3(.011,.012,.014)*reflection*contact;
}

fn metalLight(normal: vec3<f32>,view: vec3<f32>,base: vec3<f32>,roughness: f32,metallic: f32,uv: vec2<f32>,footprint: vec2<f32>) -> vec3<f32> {
  let light=normalize(vec3(-.35,1.8,2.));
  let diffuse=max(dot(normal,light),0.);
  var color=base*(.22+.50*max(normal.y,0.)+.24*diffuse);
  let reflected=reflect(-view,normal);
  let ceiling=exp((dot(reflected,normalize(vec3(.12,.75,-.8)))-1.)/(.09+.20*roughness));
  let cardUV=vec2((abs(reflected.x)-.86)/(.12+.07*roughness),(reflected.y-.28)/.57);
  let sideCards=exp(-dot(cardUV,cardUV));
  let overheadUV=vec2((reflected.y-.55)/.4,reflected.x/1.3);
  let overhead=exp(-dot(overheadUV,overheadUV));
  let fresnel=pow(1.-max(dot(normal,view),0.),4.);
  let reflectedLight=vec3(.075,.078,.087)*ceiling+vec3(.20,.205,.215)*sideCards
    +vec3(.023,.024,.028)*overhead;
  color+=reflectedLight*mix(.10,1.,metallic)*(.65+.35*fresnel);
  let specular=pow(max(dot(normal,normalize(view+light)),0.),mix(160.,24.,roughness));
  color+=vec3(.027,.028,.031)*specular;
  let grain=fract(sin(dot(uv*1800.,vec2(12.9898,78.233)))*43758.5453)-.5;
  let grainVisibility=1.-smoothstep(.5,1.5,max(footprint.x,footprint.y)*1800.);
  return color+grain*.003*metallic*grainVisibility;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  let normal=normalize(input.normal);
  let view=normalize(uniforms.eye.xyz-input.world);
  // Derivatives stay outside material branches for WGSL uniformity and stable filtering.
  let footprint=fwidth(input.uv);
  var color: vec3<f32>;
  if(input.material>7.5) {
    color=studioFloor(input.world);
  } else if(input.material>1.5 && input.material<2.5) {
    color=displayColor(input.uv,normal,view);
  } else {
    var base=vec3(.155,.158,.170);
    var roughness=.62;
    var metallic=.88;
    if(input.material>.5 && input.material<1.5){base=vec3(.006,.007,.009);roughness=.55;metallic=.08;}
    if(input.material>2.5 && input.material<3.5){base=vec3(.014,.015,.018);roughness=.90;metallic=.02;}
    if(input.material>3.5 && input.material<4.5){
      let labelPixels=footprint*vec2<f32>(textureDimensions(labelTexture,0));
      let labelLevel=log2(max(1.,max(labelPixels.x,labelPixels.y)));
      let label=textureSampleLevel(labelTexture,textureSampler,input.uv,labelLevel).r;
      base=mix(vec3(.028,.029,.034),vec3(.28,.29,.31),label);roughness=.78;metallic=.03;
    }
    if(input.material>4.5 && input.material<5.5){base=vec3(.142,.145,.158);roughness=.84;metallic=.60;}
    if(input.material>5.5 && input.material<6.5){
      let cell=fract(input.uv*vec2(16.,120.))-.5;
      let filterWidth=max(footprint.x*16.,footprint.y*120.);
      var hole=1.-smoothstep(.20,.29+min(.2,filterWidth),length(cell));
      hole=mix(hole,.22,smoothstep(.45,1.,filterWidth));
      base=mix(base,vec3(.018,.019,.024),hole*.80);
    }
    if(input.material>6.5){base=vec3(.006,.012,.022);roughness=.18;metallic=.30;}
    if(input.lid>.5 && input.material<.5 && dot(normal,-uniforms.lid[2].xyz)>.999) {
      var markUV=vec2(.5-(input.uv.x-.5)*${(LAPTOP.width/LID_MARK.width).toFixed(4)},.5+(input.uv.y-.5)*${(LAPTOP.lidHeight/LID_MARK.height).toFixed(4)});
      var atlasUV=(vec2(${LID_MARK.atlasX.toFixed(1)},${LID_MARK.atlasY.toFixed(1)})+clamp(markUV,vec2(0.),vec2(1.))*${LID_MARK.atlasSize.toFixed(1)})/vec2(1024.,512.);
      var markPixels=footprint*vec2(${(LAPTOP.width/LID_MARK.width).toFixed(4)},${(LAPTOP.lidHeight/LID_MARK.height).toFixed(4)})*${LID_MARK.atlasSize.toFixed(1)};
      var level=log2(max(1.,max(markPixels.x,markPixels.y)));
      var mask=textureSampleLevel(labelTexture,textureSampler,atlasUV,min(level,4.)).g;
      if(any(markUV<vec2(0.)) || any(markUV>vec2(1.))) { mask=0.; }
      base=mix(base,vec3(.006,.007,.009),mask);
      roughness=mix(roughness,.24,mask);metallic=mix(metallic,.96,mask);
    }
    color=metalLight(normal,view,base,roughness,metallic,input.uv,footprint);
    if(input.world.y<.08 && normal.y>.5){color*=.77+.23*smoothstep(-.96,-.40,input.world.z);}
    if(input.lid<.5){color=linearToSRGB(srgbToLinear(color)+screenBounce(input.world,normal,view,base,roughness,metallic));}
  }
  return vec4(max(color,vec3(0.)),1.);
}`;
