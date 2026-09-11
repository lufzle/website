// World coordinates: Y is up, Z points toward the person using the laptop.
// Lid coordinates: Y runs from the hinge to the free edge; +Z faces the screen.
export const LAPTOP = Object.freeze({
  width: 3.2,
  depth: 2.1,
  lidHeight: 2.06,
  lidThickness: .044,
  hingeY: .083,
  hingeZ: -1.02,
  maximumAngle: 100,
});

export const STRIDE = 10;
export const clamp01 = (x) => Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0;
export const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
export const angleForProgress = (progress) => LAPTOP.maximumAngle * smooth(progress);
export const foldForAngle = (angle) => clamp01((90 - angle) / 68);
export const progressForScroll = (scroll, start, travel) => clamp01((scroll - start) / Math.max(1, travel));

export function lidMatrix(angleDegrees) {
  const radians = Math.max(0, Math.min(LAPTOP.maximumAngle, angleDegrees)) * Math.PI / 180;
  const s = Math.sin(radians), c = Math.cos(radians);
  return new Float32Array([
    1, 0, 0, 0,
    0, s, c, 0,
    0, -c, s, 0,
    0, LAPTOP.hingeY, LAPTOP.hingeZ, 1,
  ]);
}

export function transformPoint(matrix, [x, y, z], w = 1) {
  return [0, 1, 2].map((row) => matrix[row] * x + matrix[4 + row] * y + matrix[8 + row] * z + matrix[12 + row] * w);
}

const normalize = (v) => { const length = Math.hypot(...v); return v.map((x) => x / length); };
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);

export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  }
  return out;
}

export function cameraForAspect(aspect, angle = 100) {
  // Fitted to the supplied studio reference at a 32.875° lid opening.
  // A low, centered long lens preserves the shallow keyboard and straight horizon.
  const fov = 12.626726 * Math.PI / 180;
  const direction = normalize([0, .1087032, .99407425]);
  const safeAspect = Math.max(.1, aspect);
  const f = 1 / Math.tan(fov / 2);
  const bottom = -.26 - .482 * smooth((safeAspect - .65) / 1.2);
  const k = bottom / f, [ , s, c ] = direction;
  const intercept = -.05 - 1.13*(s-k*c)/(c+k*s);
  const slope = -k/(c+k*s);
  const targetHeight = (distance) => intercept+slope*distance;
  const lid = lidMatrix(angle);
  const bounds = [];
  for (const x of [-1.6, 1.6]) {
    for (const y of [-.05, .05]) for (const z of [-1.05, 1.05]) bounds.push([x,y,z]);
    for (const y of [0, LAPTOP.lidHeight]) for (const z of [-.022, .033]) bounds.push(transformPoint(lid,[x,y,z]));
  }
  // Projected bounds give linear inequalities in camera distance. Solve them
  // directly, keeping the bottom edge anchored as the camera recedes.
  let widthDistance=2, heightDistance=2;
  const depthSlope=1+s*slope;
  for(const [x,y,z] of bounds) {
    const depthIntercept=s*(intercept-y)-c*(z+.08);
    const top=f*(c*(y-intercept)-s*(z+.08));
    widthDistance=Math.max(widthDistance,(Math.abs(f*x/(safeAspect*.855))-depthIntercept)/depthSlope);
    heightDistance=Math.max(heightDistance,(top-.72*depthIntercept)/(.72*depthSlope+f*c*slope));
  }
  // A smooth maximum eases the switch from width to height framing. It always
  // stays outside both bounds, so smoothing cannot clip the lid or chassis.
  const transition=Math.max(.4-Math.abs(widthDistance-heightDistance),0);
  const distance=Math.max(widthDistance,heightDistance)+transition*transition/1.6;
  const target = [0, targetHeight(distance), -.08];
  const eye = target.map((v, i) => v + direction[i] * distance);
  const right = normalize(cross([0, 1, 0], direction));
  const up = cross(direction, right);
  const view = new Float32Array([
    right[0], up[0], direction[0], 0,
    right[1], up[1], direction[1], 0,
    right[2], up[2], direction[2], 0,
    -dot(right, eye), -dot(up, eye), -dot(direction, eye), 1,
  ]);
  const near = .1, far = 200;
  // Zero-to-one depth, shared with WebGPU. The GL vertex shader remaps Z.
  const projection = new Float32Array([
    f / safeAspect, 0, 0, 0, 0, f, 0, 0,
    0, 0, far / (near - far), -1,
    0, 0, near * far / (near - far), 0,
  ]);
  return { eye, target, distance, viewProjection: multiply(projection, view) };
}

function outline(width, height, radius, steps, frontScoop = false) {
  const points = [];
  const corners = [[1,1,0],[-1,1,90],[-1,-1,180],[1,-1,270]];
  for (const [x, y, start] of corners) {
    for (let i = 0; i <= steps; i++) {
      const angle = (start + i * 90 / steps) * Math.PI / 180;
      points.push([(width/2-radius)*x + radius*Math.cos(angle), (height/2-radius)*y + radius*Math.sin(angle)]);
    }
    if(frontScoop && start===180) {
      for(const px of [-.34,-.29,-.275,-.26,-.245,-.23,0,.23,.245,.26,.275,.29,.34]) points.push([px,-height/2]);
    }
  }
  return points;
}

export function createLaptop() {
  const data = [];
  const labels = [];
  function body({ width, height, thickness, radius, bevel = Math.min(thickness*.42, .016), center = [0,0,0], material = 0, group = 0, deck = false, atlas = -1, steps = 16, frontScoop = false }) {
    const perimeter = outline(width, height, radius, steps, frontScoop);
    const count = perimeter.length;
    const uvFor = (p) => {
      const u = p[0]/width + .5, v = .5-p[1]/height;
      return atlas < 0 ? [u,v] : [(atlas%16+u)/16, (Math.floor(atlas/16)+v)/8];
    };
    const sculpt = (p) => {
      const weight=(1-smooth((Math.abs(p[0])-.23)/.06))*(1-smooth((p[1]+height/2)/.15))*smooth((p[2]+.005)/.05);
      return [p[0],p[1]+.040*weight,p[2]-.020*weight];
    };
    const vertex = (p, n) => {
      const uv = uvFor(p);
      if(frontScoop) {
        const original=p;
        p=sculpt(original);
        const jacobian=[0,1,2].map(axis=>{
          const positive=[...original],negative=[...original];
          positive[axis]+=.0001;negative[axis]-=.0001;
          const before=sculpt(negative);
          return sculpt(positive).map((v,i)=>(v-before[i])/.0002);
        });
        const cofactors=[cross(jacobian[1],jacobian[2]),cross(jacobian[2],jacobian[0]),cross(jacobian[0],jacobian[1])];
        n=normalize([0,1,2].map(axis=>n.reduce((sum,v,i)=>sum+v*cofactors[i][axis],0)));
      }
      const world = deck ? [p[0]+center[0], p[2]+center[1], -p[1]+center[2]] : p.map((v,i)=>v+center[i]);
      const normal = deck ? [n[0],n[2],-n[1]] : n;
      data.push(...world,...normal,...uv,material,group);
    };
    const triangle = (a,b,c,na,nb=na,nc=na) => { vertex(a,na); vertex(b,nb); vertex(c,nc); };
    for (const sign of [1,-1]) {
      const z = sign*thickness/2;
      const faceAt = (inset) => outline(width-inset*2,height-inset*2,Math.max(.001,radius-inset),steps,frontScoop);
      let face=faceAt(bevel);
      // Local face rings keep the finger recess inside the front lip. A fan
      // directly to the depressed edge would slope the entire palm rest.
      if(frontScoop && sign>0) {
        for(const inset of [.045,.080,.120,.175]) {
          const inside=faceAt(inset);
          for(let i=0;i<count;i++) {
            const j=(i+1)%count;
            triangle([...inside[i],z],[...face[i],z],[...face[j],z],[0,0,1]);
            triangle([...inside[i],z],[...face[j],z],[...inside[j],z],[0,0,1]);
          }
          face=inside;
        }
      }
      for (let i=0;i<count;i++) {
        const j=(i+1)%count;
        const a=[0,0,z], b=[...face[i],z], c=[...face[j],z];
        if(sign>0)triangle(a,b,c,[0,0,sign]); else triangle(a,c,b,[0,0,sign]);
      }
    }
    // Rounded edge rings produce real metal highlights, including the closed silhouette.
    const rings=[];
    for(let i=0;i<=10;i++) {
      const a=-Math.PI/2+i*Math.PI/10;
      const inset=bevel*(1-Math.cos(a));
      const z=Math.sign(a)*(thickness/2-bevel)+bevel*Math.sin(a);
      rings.push({points:outline(width-2*inset,height-2*inset,Math.max(.001,radius-inset),steps,frontScoop),z,a});
    }
    for(let r=0;r<rings.length-1;r++) for(let i=0;i<count;i++) {
      const j=(i+1)%count, lo=rings[r], hi=rings[r+1];
      const normal=(ring,index)=>{
        const [x,y]=perimeter[index];
        const nx=x-Math.max(-width/2+radius,Math.min(width/2-radius,x));
        const ny=y-Math.max(-height/2+radius,Math.min(height/2-radius,y));
        const len=Math.hypot(nx,ny)||1;
        return [nx/len*Math.cos(ring.a),ny/len*Math.cos(ring.a),Math.sin(ring.a)];
      };
      const a=[...lo.points[i],lo.z],b=[...lo.points[j],lo.z],c=[...hi.points[j],hi.z],d=[...hi.points[i],hi.z];
      triangle(a,b,c,normal(lo,i),normal(lo,j),normal(hi,j));
      triangle(a,c,d,normal(lo,i),normal(hi,j),normal(hi,i));
    }
  }

  body({width:LAPTOP.width,height:LAPTOP.depth,thickness:.10,radius:.105,bevel:.018,center:[0,0,0],deck:true,frontScoop:true});
  body({width:2.77,height:1.15,thickness:.006,radius:.065,center:[0,.048,-.38],deck:true,material:1});

  const keyRows = [
    ['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','◉'],
    ['`','1','2','3','4','5','6','7','8','9','0','−','=','delete:1.5'],
    ['tab:1.5','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['caps:1.8','A','S','D','F','G','H','J','K','L',';','\'','return:1.7'],
    ['shift:2.2','Z','X','C','V','B','N','M',',','.','/','shift:2.3'],
    ['fn','control','option:1.1','command:1.3',' :5.3','command:1.3','option:1.1','←','↑','→'],
  ];
  for(let row=0;row<keyRows.length;row++) {
    const keys=keyRows[row].map((s)=>{const [label,weight]=s.split(':');return{label,weight:Number(weight)||1};});
    const gap=.016,total=keys.reduce((sum,key)=>sum+key.weight,0),unit=(2.61-gap*(keys.length-1))/total;
    let x=-2.61/2;
    const z=-.82+row*.18, height=row===0?.112:.150;
    for(const key of keys) {
      const width=unit*key.weight, atlas=labels.length;
      labels.push(key.label);
      body({width,height,thickness:.012,radius:.022,bevel:.004,center:[x+width/2,.049,z],deck:true,material:4,atlas,steps:4});
      x+=width+gap;
    }
  }
  body({width:1.37,height:.69,thickness:.002,radius:.033,center:[0,.051,.584],deck:true,material:1});
  body({width:1.358,height:.678,thickness:.002,radius:.028,center:[0,.052,.584],deck:true,material:5});
  // Speaker perforations use a filtered material on thin inset strips.
  for(const x of [-1.48,1.48])body({width:.13,height:1.12,thickness:.002,radius:.035,center:[x,.052,-.37],deck:true,material:6});
  // The front opening is sculpted into the chassis rather than placed on its face.
  for(const x of [-1.22,1.22])for(const z of [-.76,.76])body({width:.25,height:.20,thickness:.027,radius:.09,center:[x,-.056,z],deck:true,material:3,steps:6});
  // Hinge housings bridge the deck and pivot without projecting above the closed lid.
  for(const x of [-.95,.95])body({width:.42,height:.080,thickness:.068,radius:.02,center:[x,LAPTOP.hingeY-.028,LAPTOP.hingeZ],material:3});

  // All lid surfaces share one rigid transform. The display faces DOWN at zero.
  body({width:3.2,height:LAPTOP.lidHeight,thickness:LAPTOP.lidThickness,radius:.105,bevel:.011,center:[0,LAPTOP.lidHeight/2,0],group:1});
  body({width:3.174,height:2.032,thickness:.003,radius:.095,bevel:.001,center:[0,1.030,.023],group:1,material:1});
  body({width:3.102,height:1.940,thickness:.002,radius:.064,bevel:.0005,center:[0,1.054,.026],group:1,material:2,steps:16});
  body({width:.365,height:.086,thickness:.004,radius:.018,bevel:.001,center:[0,1.995,.029],group:1,material:1});
  body({width:.013,height:.013,thickness:.002,radius:.0065,bevel:.0005,center:[0,1.981,.032],group:1,material:7,steps:8});

  // A matte studio floor catches a broad pool of light and a soft contact shadow.
  // It shares the depth buffer, so the chassis occludes it at every lid angle.
  for(const p of [[-16,-.072,-16],[-16,-.072,16],[16,-.072,16],[-16,-.072,-16],[16,-.072,16],[16,-.072,-16]]) {
    data.push(...p,0,1,0,0,0,8,0);
  }

  return { vertices: new Float32Array(data), labels };
}
