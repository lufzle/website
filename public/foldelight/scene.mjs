// World coordinates: Y is up, Z points toward the person using the laptop.
// Lid coordinates: Y runs from the hinge to the free edge; +Z faces the screen.
export const LAPTOP = Object.freeze({
  width: 3.2,
  depth: 2.1,
  lidHeight: 2.06,
  lidThickness: .044,
  hingeY: .104,
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

export function cameraForAspect(aspect) {
  const fov = 36 * Math.PI / 180;
  const distance = Math.max(5.65, 1.91 / (Math.max(aspect, .1) * Math.tan(fov / 2)));
  const target = [0, .82, -.08];
  const direction = normalize([.055, .30, 1]);
  const eye = target.map((v, i) => v + direction[i] * distance);
  const right = normalize(cross([0, 1, 0], direction));
  const up = cross(direction, right);
  const view = new Float32Array([
    right[0], up[0], direction[0], 0,
    right[1], up[1], direction[1], 0,
    right[2], up[2], direction[2], 0,
    -dot(right, eye), -dot(up, eye), -dot(direction, eye), 1,
  ]);
  const near = .1, far = 100, f = 1 / Math.tan(fov / 2);
  // Zero-to-one depth, shared with WebGPU. The GL vertex shader remaps Z.
  const projection = new Float32Array([
    f / aspect, 0, 0, 0, 0, f, 0, 0,
    0, 0, far / (near - far), -1,
    0, 0, near * far / (near - far), 0,
  ]);
  return { eye, viewProjection: multiply(projection, view) };
}

function outline(width, height, radius, steps) {
  const points = [];
  const corners = [[1,1,0],[-1,1,90],[-1,-1,180],[1,-1,270]];
  for (const [x, y, start] of corners) for (let i = 0; i <= steps; i++) {
    const angle = (start + i * 90 / steps) * Math.PI / 180;
    points.push([(width/2-radius)*x + radius*Math.cos(angle), (height/2-radius)*y + radius*Math.sin(angle)]);
  }
  return points;
}

export function createLaptop() {
  const data = [];
  const labels = [];
  function body({ width, height, thickness, radius, bevel = Math.min(thickness*.42, .016), center = [0,0,0], material = 0, group = 0, deck = false, atlas = -1, steps = 10 }) {
    const perimeter = outline(width, height, radius, steps);
    const count = perimeter.length;
    const uvFor = (p) => {
      const u = p[0]/width + .5, v = .5-p[1]/height;
      return atlas < 0 ? [u,v] : [(atlas%16+u)/16, (Math.floor(atlas/16)+v)/8];
    };
    const vertex = (p, n) => {
      const uv = uvFor(p);
      const world = deck ? [p[0]+center[0], p[2]+center[1], -p[1]+center[2]] : p.map((v,i)=>v+center[i]);
      const normal = deck ? [n[0],n[2],-n[1]] : n;
      data.push(...world,...normal,...uv,material,group);
    };
    const triangle = (a,b,c,na,nb=na,nc=na) => { vertex(a,na); vertex(b,nb); vertex(c,nc); };
    for (const sign of [1,-1]) {
      const z = sign*thickness/2;
      const face = outline(width-bevel*2,height-bevel*2,Math.max(.001,radius-bevel),steps);
      for (let i=0;i<count;i++) {
        const j=(i+1)%count;
        const a=[0,0,z], b=[...face[i],z], c=[...face[j],z];
        if(sign>0)triangle(a,b,c,[0,0,sign]); else triangle(a,c,b,[0,0,sign]);
      }
    }
    // Rounded edge rings produce real metal highlights, including the closed silhouette.
    const rings=[];
    for(let i=0;i<=6;i++) {
      const a=-Math.PI/2+i*Math.PI/6;
      const inset=bevel*(1-Math.cos(a));
      const z=Math.sign(a)*(thickness/2-bevel)+bevel*Math.sin(a);
      rings.push({points:outline(width-2*inset,height-2*inset,Math.max(.001,radius-inset),steps),z,a});
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

  body({width:LAPTOP.width,height:LAPTOP.depth,thickness:.10,radius:.105,center:[0,0,0],deck:true});
  body({width:2.77,height:1.15,thickness:.006,radius:.065,center:[0,.054,-.38],deck:true,material:1});

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
      body({width,height,thickness:.012,radius:.022,bevel:.004,center:[x+width/2,.065,z],deck:true,material:4,atlas,steps:4});
      x+=width+gap;
    }
  }
  body({width:1.25,height:.59,thickness:.004,radius:.043,center:[0,.052,.602],deck:true,material:1});
  body({width:1.234,height:.574,thickness:.004,radius:.037,center:[0,.055,.602],deck:true,material:5});
  // Speaker perforations use a filtered material on thin inset strips.
  for(const x of [-1.48,1.48])body({width:.13,height:1.12,thickness:.002,radius:.035,center:[x,.052,-.37],deck:true,material:6});
  // A slim front opening and rubber feet make the closed state readable.
  body({width:.47,height:.026,thickness:.002,radius:.012,center:[0,.029,1.051],material:3,steps:6});
  for(const x of [-1.22,1.22])for(const z of [-.76,.76])body({width:.25,height:.20,thickness:.027,radius:.09,center:[x,-.056,z],deck:true,material:3,steps:6});
  // Hinge housings bridge the deck and pivot without projecting above the closed lid.
  for(const x of [-.95,.95])body({width:.42,height:.080,thickness:.068,radius:.02,center:[x,.076,LAPTOP.hingeZ],material:3});

  // All lid surfaces share one rigid transform. The display faces DOWN at zero.
  body({width:3.2,height:LAPTOP.lidHeight,thickness:LAPTOP.lidThickness,radius:.105,bevel:.011,center:[0,LAPTOP.lidHeight/2,0],group:1});
  body({width:3.174,height:2.032,thickness:.003,radius:.095,bevel:.001,center:[0,1.030,.023],group:1,material:1});
  body({width:3.102,height:1.940,thickness:.002,radius:.064,bevel:.0005,center:[0,1.054,.026],group:1,material:2,steps:16});
  body({width:.365,height:.086,thickness:.004,radius:.018,bevel:.001,center:[0,1.995,.029],group:1,material:1});
  body({width:.013,height:.013,thickness:.002,radius:.0065,bevel:.0005,center:[0,1.981,.032],group:1,material:7,steps:8});

  return { vertices: new Float32Array(data), labels };
}
