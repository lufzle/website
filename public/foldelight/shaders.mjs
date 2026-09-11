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
void main() {
  vec4 world = mix(vec4(aPosition, 1.), uLid * vec4(aPosition, 1.), aLid);
  vWorld = world.xyz;
  vNormal = mix(aNormal, mat3(uLid) * aNormal, aLid);
  vUV = aUV;
  vMaterial = aMaterial;
  gl_Position = uViewProjection * world;
  gl_Position.z = 2. * gl_Position.z - gl_Position.w;
}`;

export const fragmentGLSL = `#version 300 es
precision highp float;
uniform sampler2D uScreen;
uniform sampler2D uLabels;
uniform vec3 uEye;
uniform vec4 uParams;
in vec3 vWorld;
in vec3 vNormal;
in vec2 vUV;
flat in float vMaterial;
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

vec3 metalLight(vec3 normal, vec3 view, vec3 base, float roughness, float metallic) {
  vec3 light = normalize(vec3(-.65,1.3,1.4));
  vec3 halfVector = normalize(view+light);
  float diffuse = max(dot(normal,light),0.);
  float sky = .5+.5*normal.y;
  vec3 ambient = mix(vec3(.22,.235,.255),vec3(.66,.69,.72),sky);
  vec3 color = base*(ambient*.61 + diffuse*.53);
  float exponent = mix(150.,12.,roughness);
  float specular = pow(max(dot(normal,halfVector),0.),exponent);
  color += mix(vec3(.065),base*.60,metallic)*specular;
  vec3 reflected = reflect(-view,normal);
  float strip = exp(-pow((reflected.x+.58)*3.5,2.))*smoothstep(-.3,.45,reflected.y);
  float rim = pow(1.-max(dot(normal,view),0.),3.);
  color += vec3(.34,.39,.43)*strip*metallic*.24;
  color += vec3(.22,.27,.29)*rim*metallic*.50;
  float grain = fract(sin(dot(vWorld.xz*1500.,vec2(12.9898,78.233)))*43758.5453)-.5;
  return color + grain*.003*metallic;
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(uEye-vWorld);
  vec3 color;
  if(vMaterial>1.5 && vMaterial<2.5) {
    color = displayColor(vUV,normal,view);
  } else {
    vec3 base = vec3(.54,.56,.58);
    float roughness=.42, metallic=.90;
    if(vMaterial>.5 && vMaterial<1.5) { base=vec3(.010,.012,.014);roughness=.40;metallic=.16; }
    if(vMaterial>2.5 && vMaterial<3.5) { base=vec3(.023,.024,.026);roughness=.85;metallic=.02; }
    if(vMaterial>3.5 && vMaterial<4.5) {
      float label = textureLod(uLabels,vUV,0.).r;
      base=mix(vec3(.036,.039,.044),vec3(.74,.76,.78),label);
      roughness=.68;metallic=.04;
    }
    if(vMaterial>4.5 && vMaterial<5.5) { base=vec3(.46,.48,.50);roughness=.72;metallic=.65; }
    if(vMaterial>5.5 && vMaterial<6.5) {
      vec2 cell = fract(vUV*vec2(8.,65.))-.5;
      float hole=1.-smoothstep(.18,.35,length(cell));
      base=mix(base,vec3(.030,.034,.037),hole*.82);
    }
    if(vMaterial>6.5) { base=vec3(.012,.023,.043);roughness=.12;metallic=.60; }
    color=metalLight(normal,view,base,roughness,metallic);
    // Hinge occlusion is local to the keyboard, not painted on the whole scene.
    if(vWorld.y<.08 && normal.y>.5)color*=.77+.23*smoothstep(-.96,-.40,vWorld.z);
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

fn metalLight(normal: vec3<f32>,view: vec3<f32>,base: vec3<f32>,roughness: f32,metallic: f32,world: vec3<f32>) -> vec3<f32> {
  let light=normalize(vec3(-.65,1.3,1.4));
  let halfVector=normalize(view+light);
  let diffuse=max(dot(normal,light),0.);
  let sky=.5+.5*normal.y;
  let ambient=mix(vec3(.22,.235,.255),vec3(.66,.69,.72),sky);
  var color=base*(ambient*.61+diffuse*.53);
  let exponent=mix(150.,12.,roughness);
  let specular=pow(max(dot(normal,halfVector),0.),exponent);
  color+=mix(vec3(.065),base*.60,metallic)*specular;
  let reflected=reflect(-view,normal);
  let strip=exp(-pow((reflected.x+.58)*3.5,2.))*smoothstep(-.3,.45,reflected.y);
  let rim=pow(1.-max(dot(normal,view),0.),3.);
  color+=vec3(.34,.39,.43)*strip*metallic*.24;
  color+=vec3(.22,.27,.29)*rim*metallic*.50;
  let grain=fract(sin(dot(world.xz*1500.,vec2(12.9898,78.233)))*43758.5453)-.5;
  return color+grain*.003*metallic;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  let normal=normalize(input.normal);
  let view=normalize(uniforms.eye.xyz-input.world);
  var color: vec3<f32>;
  if(input.material>1.5 && input.material<2.5) {
    color=displayColor(input.uv,normal,view);
  } else {
    var base=vec3(.54,.56,.58);
    var roughness=.42;
    var metallic=.90;
    if(input.material>.5 && input.material<1.5){base=vec3(.010,.012,.014);roughness=.40;metallic=.16;}
    if(input.material>2.5 && input.material<3.5){base=vec3(.023,.024,.026);roughness=.85;metallic=.02;}
    if(input.material>3.5 && input.material<4.5){
      let label=textureSampleLevel(labelTexture,textureSampler,input.uv,0.).r;
      base=mix(vec3(.036,.039,.044),vec3(.74,.76,.78),label);roughness=.68;metallic=.04;
    }
    if(input.material>4.5 && input.material<5.5){base=vec3(.46,.48,.50);roughness=.72;metallic=.65;}
    if(input.material>5.5 && input.material<6.5){
      let cell=fract(input.uv*vec2(8.,65.))-.5;
      let hole=1.-smoothstep(.18,.35,length(cell));
      base=mix(base,vec3(.030,.034,.037),hole*.82);
    }
    if(input.material>6.5){base=vec3(.012,.023,.043);roughness=.12;metallic=.60;}
    color=metalLight(normal,view,base,roughness,metallic,input.world);
    if(input.world.y<.08 && normal.y>.5){color*=.77+.23*smoothstep(-.96,-.40,input.world.z);}
  }
  return vec4(max(color,vec3(0.)),1.);
}`;
