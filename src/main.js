import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { prepareReader, mountExhibitUI } from './museum-ui.js';

const $ = id => document.getElementById(id);
const show = (id, state) => $(id)?.classList.toggle('hidden', !state);
const WORLD = $('world');
const CONFIG = {eyeHeight:1.7,speed:5.3,playerRadius:.45,lookSensitivity:.0025};
const GALLERIES = {
 intro:{name:'Introduction Rotunda',subtitle:'The medical crisis and the war that changed care',number:'01 / 05',x:0,z:2,lookZ:-3,color:0xcda36e},
 north:{name:'The Union',subtitle:'Satterlee General Hospital · Philadelphia',number:'02 / 05',x:-24,z:-20,lookZ:-25,color:0x8dc5fc},
 south:{name:'The Confederacy',subtitle:'Chimborazo Hospital · Richmond',number:'03 / 05',x:24,z:-20,lookZ:-25,color:0xa8b6ca},
 field:{name:'Field Hospital',subtitle:'A historically informed reconstruction · 1861–1865',number:'04 / 05',x:0,z:-37,lookZ:-45,color:0xd0a86b},
 modern:{name:'The Legacy',subtitle:'What Civil War medicine changed, and what came later',number:'05 / 05',x:0,z:-65,lookZ:-70,color:0xa8d9db}
};
const WALKABLE = [
 {x1:-9.3,x2:9.3,z1:-9.2,z2:8.5},
 {x1:-4.3,x2:4.3,z1:-65,z2:-8.3},
 {x1:-33.3,x2:33.3,z1:-18.8,z2:-12.3},
 {x1:-33.2,x2:-14.2,z1:-30.2,z2:-12.1},
 {x1:14.2,x2:33.2,z1:-30.2,z2:-12.1},
 {x1:-10.4,x2:10.4,z1:-52.5,z2:-33.5},
 {x1:-10.4,x2:10.4,z1:-78.0,z2:-60.5}
];
const blockers=[];
const modelCache=new Map();
const gltfLoader=new GLTFLoader();
const scene = new THREE.Scene();scene.background=new THREE.Color(0x0b1420);scene.fog=new THREE.FogExp2(0x0b1420,.006);
const camera = new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.08,180);
camera.position.set(0,CONFIG.eyeHeight,5.5);
let yaw=0,pitch=0;
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
WORLD.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc8d8ee,0x1b1c22,1.9));scene.add(new THREE.AmbientLight(0xffedd6,.42));
const mainSun=new THREE.DirectionalLight(0xffe4b6,1.9);mainSun.position.set(-29,22,8);mainSun.castShadow=true;mainSun.shadow.mapSize.set(2048,2048);mainSun.shadow.camera.left=-80;mainSun.shadow.camera.right=80;mainSun.shadow.camera.top=70;mainSun.shadow.camera.bottom=-85;mainSun.shadow.bias=-.0004;scene.add(mainSun);
const MAT={gold:new THREE.MeshStandardMaterial({color:0xc9a46f,metalness:.63,roughness:.35}),metal:new THREE.MeshStandardMaterial({color:0x28363b,metalness:.35,roughness:.38}),border:new THREE.MeshStandardMaterial({color:0x2d363e,roughness:.67}),light:new THREE.MeshStandardMaterial({color:0xd9cead,roughness:.76}),stone:new THREE.MeshStandardMaterial({color:0x242b30,roughness:.83}),wood:new THREE.MeshStandardMaterial({color:0x4f3529,roughness:.85}),ivory:new THREE.MeshStandardMaterial({color:0xe1d5be,roughness:.74}),blue:new THREE.MeshStandardMaterial({color:0x25475f,roughness:.66}),south:new THREE.MeshStandardMaterial({color:0x404653,roughness:.7}),glass:new THREE.MeshPhysicalMaterial({color:0xa6b4bd,metalness:.18,roughness:.11,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide})};
const pbr=(hex,roughness=.8)=>new THREE.MeshStandardMaterial({color:hex,roughness});
function noiseTexture(base,lines=false){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<2800;i++){const t=Math.random()*256;x.fillStyle=`rgba(${Math.random()>.5?'255,255,255':'0,0,0'},${Math.random()*.07})`;x.fillRect(Math.random()*256,Math.random()*256,lines?120:2,lines?1:2)}let tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;return tx;}
const floorTex=noiseTexture('#7e6e59',true);floorTex.repeat.set(4,4);
const FLOOR=new THREE.MeshStandardMaterial({map:floorTex,roughness:.92});
const wallTex=noiseTexture('#abb2af');wallTex.repeat.set(1,1);
const WALL=new THREE.MeshStandardMaterial({map:wallTex,roughness:1});
const rugTex=noiseTexture('#304550',true);rugTex.repeat.set(1.5,6);
const RUG=new THREE.MeshStandardMaterial({map:rugTex,roughness:1});
const exhibitNodes=[];
const exhibitUI=mountExhibitUI({openExhibit:openExhibit,teleport:teleport});
let MUSEUM=null,entered=false,reading=false,modalOpen=false,tourOn=false,tourIndex=0,currentWing='intro',clock=new THREE.Clock(),lastFrame=0;

function meshBox(w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
function floorRect(x,z,w,d,material=FLOOR){meshBox(w,.12,d,material,x,-.06,z);}
function wall(x1,z1,x2,z2,height=5.25){const dx=x2-x1,dz=z2-z1,l=Math.hypot(dx,dz);const m=meshBox(l,height,.28,WALL,(x1+x2)/2,height/2,(z1+z2)/2);m.rotation.y=-Math.atan2(dz,dx);if(Math.abs(dx)>Math.abs(dz)){meshBox(l,.15,.40,MAT.wood,(x1+x2)/2,.62,(z1+z2)/2);meshBox(l,.09,.4,MAT.gold,(x1+x2)/2,1.10,(z1+z2)/2)}return m;}
function longWallX(x1,x2,z){wall(x1,z,x2,z)}
function longWallZ(x,z1,z2){wall(x,z1,x,z2)}
function openWallZ(z,xLeft,xRight,opening=4){longWallX(xLeft,-opening,z);longWallX(opening,xRight,z);addArch(0,z,opening*2,0)}
function addArch(x,z,width,rotation=0){const g=new THREE.Group();const col=MAT.gold;const left=new THREE.Mesh(new THREE.BoxGeometry(.16,4.55,.3),col);left.position.set(-width/2,2.35,0);g.add(left);const right=left.clone();right.position.x=width/2;g.add(right);let lint=new THREE.Mesh(new THREE.BoxGeometry(width+.25,.22,.4),col);lint.position.y=4.55;g.add(lint);g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g)}
function makeRoom(x,z,w,d,style,openings){floorRect(x,z,w,d);const ceil=meshBox(w,.2,d,MAT.stone,x,5.48,z);ceil.castShadow=false;
 // continuous roof eliminates the previous missing-ceiling flashes
 const crown=meshBox(w,.07,d,MAT.gold,x,5.28,z);crown.material=MAT.stone;crown.castShadow=false;
 const light=new THREE.PointLight(style==='north'?0xffe5bb:style==='south'?0xb6c8e9:0xffe1b9,style==='south'?32:39,w*.85,2);light.position.set(x,4.55,z);scene.add(light);
 for(let side of ['front','back']){let zz=z+(side==='front'?d/2:-d/2);if(openings.includes(side)){longWallX(x-w/2,x-4.3,zz);longWallX(x+4.3,x+w/2,zz);addArch(x,zz,8.6)}else longWallX(x-w/2,x+w/2,zz)}
 for(let side of ['left','right']){let xx=x+(side==='left'?-w/2:w/2);if(openings.includes(side)){longWallZ(xx,z-d/2,z+3.4);longWallZ(xx,z+9.4,z+d/2);addArch(xx,z+6.4,6,Math.PI/2)}else longWallZ(xx,z-d/2,z+d/2)}
 // carved wall panels with brass framing, textured surfaces and restrained lighting
 for(let side of [-1,1]) for(let i=0;i<3;i++){const xx=x+side*(w/2-.18),zz=z+(i-1)*(d/3.3);const pane=meshBox(.08,2.25,d/5.6,style==='north'?MAT.blue:style==='south'?MAT.south:MAT.border,xx,2.83,zz);pane.castShadow=false;}
}
function corridor(x,z,w,d){floorRect(x,z,w,d,RUG);meshBox(w,.13,d,MAT.stone,x,5.32,z);for(let i=0;i<Math.floor(d/6);i++){const zz=z-d/2+3+i*6;const p=new THREE.PointLight(0xffe2b0,17,9,2);p.position.set(x,4.5,zz);scene.add(p)}}
function buildRooms(){
 makeRoom(0,0,20,19,'intro',['back']);
 makeRoom(-24,-21.5,21,20,'north',['right']);
 makeRoom(24,-21.5,21,20,'south',['left']);
 makeRoom(0,-43,23,20,'field',['front','back']);
 makeRoom(0,-69.6,23,19,'modern',['front']);
 corridor(0,-22,9,28);corridor(0,-56,9,10);corridor(0,-7.9,9,4);
 corridor(-11.6,-15.1,6,6);corridor(11.6,-15.1,6,6);
 corridor(-8.5,-15.1,14,6);corridor(8.5,-15.1,14,6);
 // hall exhibits: illuminated museum welcome plinth
 meshBox(4,.15,2.1,MAT.stone,0,.08,0);
 for(let x of [-7,7])for(let z of [-5,4]){let pedestal=meshBox(.26,4.7,.26,MAT.gold,x,2.35,z);const lamp=new THREE.PointLight(0xffcd8d,8,5);lamp.position.set(x,4.2,z);scene.add(lamp)}
 // handsome dark carpet strip leading into the legacy wing
 corridor(0,-56.5,7,8.5);
 buildPassageWalls();
}
// Add solid walls along the connecting passages. Keep the side doorways open.
function buildPassageWalls(){
  for(const x of [-4.5,4.5]){
    longWallZ(x,-12.1,-9.5);
    longWallZ(x,-33.0,-18.1);
    longWallZ(x,-60.1,-53.0);
  }
  // The east-west passage connects both hospital wings to the central hall.
  for(const [x1,x2] of [[-13.5,-4.5],[4.5,13.5]]){
    longWallX(x1,x2,-12.1);
    longWallX(x1,x2,-18.1);
  }
  // Frame the passages, but do not block the playable openings.
  addArch(-4.5,-15.1,5.95,Math.PI/2);
  addArch(4.5,-15.1,5.95,Math.PI/2);
}

function addRectObstacle(x,z,w,d){blockers.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2})}
async function loadModel(name,position,scale=1,rotation=0){if(!modelCache.has(name))modelCache.set(name,new Promise((res,rej)=>gltfLoader.load(`./assets/models/${name}.glb`,g=>res(g.scene),undefined,rej)));try{let original=await modelCache.get(name);let obj=original.clone(true);obj.position.set(...position);obj.scale.setScalar(scale);obj.rotation.y=rotation;obj.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});scene.add(obj);return obj}catch(err){console.warn('GLB unavailable',name,err);return null}}
function pole(x,z,height=1.6){meshBox(.07,height,.07,MAT.gold,x,height/2,z)}
function createLabelTexture(text,number,color){const c=document.createElement('canvas');c.width=1024;c.height=390;const x=c.getContext('2d');x.fillStyle='#121922';x.fillRect(0,0,c.width,c.height);x.fillStyle=color;x.fillRect(0,0,12,c.height);x.strokeStyle=color;x.lineWidth=4;x.strokeRect(24,24,c.width-48,c.height-48);x.fillStyle=color;x.font='700 28px DM Sans, sans-serif';x.fillText('OBJECT   /   '+number,64,86);x.fillStyle='#f0ebdf';x.font='38px Georgia, serif';let words=text.split(' '),rows=[],line='';for(const word of words){let q=(line+' '+word).trim();if(x.measureText(q).width>875&&line){rows.push(line);line=word}else line=q}if(line)rows.push(line);rows.slice(0,3).forEach((line,i)=>x.fillText(line,64,162+i*56));x.fillStyle='#aaafaa';x.font='21px sans-serif';x.fillText('APPROACH TO EXPLORE  ·  PRESS E',64,346);let tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;}
function makeExhibitStand(item,i,point){const col=new THREE.Color(item.accentColor||'#d9b67b');const ped=meshBox(1.56,.86,1.16,MAT.stone,point.x,.43,point.z);meshBox(1.7,.09,1.3,MAT.gold,point.x,.88,point.z);meshBox(1.7,.1,1.30,MAT.border,point.x,.97,point.z);
 const up=meshBox(1.55,.22,.1,new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.5}),point.x,1.12,point.z+.62);up.castShadow=false;
 const labelMaterial=new THREE.MeshBasicMaterial({map:createLabelTexture(item.title,String(i+1).padStart(2,'0'),item.accentColor||'#d6b07c'),side:THREE.DoubleSide});
 const label=new THREE.Mesh(new THREE.PlaneGeometry(1.55,.60),labelMaterial);label.position.set(point.x,1.58,point.z+.73);scene.add(label);
 const halo=new THREE.PointLight(col,.72,3.5);halo.position.set(point.x,1.65,point.z);scene.add(halo);
 const touchbox=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.6,2.0),new THREE.MeshBasicMaterial({visible:false}));touchbox.position.set(point.x,1.0,point.z);touchbox.userData.exhibit=item;scene.add(touchbox);exhibitNodes.push({item,obj:touchbox,point});addRectObstacle(point.x,point.z,1.9,1.45);
 const decor= item.category.includes('Staff')||item.title.includes('Leadership')?'medical-officer':item.title.includes('nurses')?'ward-nurse':item.category.includes('Patient')?'ward-bed':item.category.includes('Pharmacology')?'medicine-chest':item.category.includes('Source')?'case-ledger':item.title.includes('Order')?'case-ledger':item.title.includes('Letter')?'case-ledger':'case-ledger';
 // imported GLB props are actual mesh files, not flat stand-in cubes
 loadModel(decor,[point.x,1.03,point.z],decor==='ward-bed'?.49:decor==='medical-officer'?.56:.75,Math.PI/2);
}
function buildExhibits(){const positions={
 intro:[[-6.4,-4.1],[0,-6.0],[6.4,-4.1]],
 north:[[-31.4,-25],[-24,-26.4],[-17.2,-25]],
 south:[[17.2,-25],[24,-27],[30.8,-25],[24,-18.6]],
 field:[[-7,-45],[0,-48],[7,-45]],
 modern:[[0,-72]]};
 let indexes={};MUSEUM.exhibits.forEach((item,i)=>{const list=positions[item.wing]||positions.intro;let idx=indexes[item.wing]||0;indexes[item.wing]=idx+1;makeExhibitStand(item,i,{x:list[idx%list.length][0],z:list[idx%list.length][1]})})}
function addPictureFrame(x,z,imageUrl,caption){
 // Image plane sits in front of the back-wall mount, never inside the solid wall.
 const border=meshBox(4.2,2.73,.12,MAT.gold,x,3.12,z);border.castShadow=false;
 meshBox(3.94,2.47,.14,MAT.wood,x,3.12,z+.12);
 const canvas=document.createElement('canvas');canvas.width=760;canvas.height=460;const g=canvas.getContext('2d');g.fillStyle='#c7b89b';g.fillRect(0,0,760,460);g.strokeStyle='#69553b';g.lineWidth=15;g.strokeRect(28,28,704,404);g.fillStyle='#5c4630';g.textAlign='center';g.font='34px Georgia';g.fillText('HISTORICAL ARCHIVE',380,195);g.font='22px Georgia';g.fillText('Open exhibit for the original image',380,242);
 const material=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),side:THREE.DoubleSide});material.map.colorSpace=THREE.SRGBColorSpace;
 const picture=new THREE.Mesh(new THREE.PlaneGeometry(3.77,2.28),material);picture.position.set(x,3.12,z+.21);scene.add(picture);
 if(imageUrl)new THREE.TextureLoader().load(imageUrl,t=>{t.colorSpace=THREE.SRGBColorSpace;material.map=t;material.needsUpdate=true},undefined,()=>{});
 const spot=new THREE.SpotLight(0xf5d8aa,15,12,Math.PI/6,.54);spot.position.set(x,4.95,z+2);spot.target.position.copy(picture.position);scene.add(spot,spot.target);
}

function populateRooms(){
 // Distinct archival image walls: captions and original records are in each exhibit's reader.
 // North: Satterlee, a documented Satterlee nurse, and another named Union hospital for comparison.
 addPictureFrame(-30.5,-31.14,'https://collaborativehistory.gse.upenn.edu/sites/default/files/Satterlee%20General%20Hospital%201864%20LCOP.jpg');
 addPictureFrame(-24,-31.14,'https://tile.loc.gov/storage-services/service/pnp/ppmsca/57100/57159v.jpg');
 addPictureFrame(-17.5,-31.14,'https://tile.loc.gov/storage-services/service/pnp/ppmsca/33600/33627v.jpg');
 // South: a documented image of Chimborazo. Do not misidentify other hospitals as Chimborazo.
 addPictureFrame(24,-31.14,'https://tile.loc.gov/storage-services/service/pnp/ppmsca/33600/33629v.jpg');
 // Field hospital: period field hospital and a real photographed medical team.
 addPictureFrame(-7.1,-52.64,'https://tile.loc.gov/storage-services/service/pnp/ppmsca/12500/12575r.jpg');
 addPictureFrame(7.1,-52.64,'https://tile.loc.gov/storage-services/service/pnp/cwpb/03600/03662r.jpg');
 // Legacy: hospital wards and medical staff photographs, properly identified in exhibit panels.
 addPictureFrame(-7.1,-78.74,'https://tile.loc.gov/storage-services/service/pnp/ppmsca/33700/33750v.jpg');
 addPictureFrame(7.1,-78.74,'https://tile.loc.gov/storage-services/service/pnp/cwpb/03900/03960r.jpg');
 // Interactive field-hospital scene: accessible, no graphic violence
 const wardBeds=[[-8,-39,Math.PI/2],[8,-39,-Math.PI/2],[-8,-49,Math.PI/2],[8,-49,-Math.PI/2]];
 wardBeds.forEach(([x,z,r])=>{loadModel('ward-bed',[x,0,z],1.15,r);addRectObstacle(x,z,2.2,2.7)});
 loadModel('medical-officer',[1,0,-41],.91,Math.PI);loadModel('ward-nurse',[-1.4,0,-43],.88,Math.PI/4);loadModel('medical-officer',[4.4,0,-40],.93,-Math.PI/3);
 loadModel('medicine-chest',[-3,0,-41],1.05);loadModel('oil-lantern',[-5,1.0,-41],.68);loadModel('supply-cart',[3.5,0,-48],1.08);
 addRectObstacle(-3,-41,1.8,1.6);addRectObstacle(3.5,-48,1.7,2.2);
 // Satterlee and Chimborazo have representative furnishings, not fake exact site replicas
 for(let i=0;i<2;i++) {loadModel('ward-bed',[-31+i*12,0,-14.8],.83,0);loadModel('ward-bed',[17+i*12,0,-14.8],.83,0)}
 loadModel('ward-nurse',[-29,0,-19],.82,Math.PI/3);loadModel('medical-officer',[-18,0,-19],.83,-Math.PI/3);
 loadModel('ward-nurse',[29,0,-20],.82,Math.PI/3);loadModel('medical-officer',[18,0,-20],.83,-Math.PI/3);
 // Keep the original ward beds. Add period-inspired furnishing clusters around them.
 loadModel('supply-cart',[-32,0,-20.5],.76,Math.PI/2);
 loadModel('medicine-chest',[-20.5,0,-20.8],.78);
 loadModel('oil-lantern',[-18.0,.85,-16.9],.48);
 loadModel('case-ledger',[-28.5,.65,-17.6],.67);
 loadModel('supply-cart',[31.8,0,-20.5],.76,-Math.PI/2);
 loadModel('medicine-chest',[19.5,0,-20.8],.78);
 loadModel('oil-lantern',[18.0,.85,-16.9],.48);
 loadModel('case-ledger',[28.5,.65,-17.6],.67);
 loadModel('case-ledger',[-5.8,0,-37.5],.8);
 loadModel('medicine-chest',[5.2,0,-50],.82);
 loadModel('oil-lantern',[6.6,.85,-43.4],.55);
 for(let roomX of [-24,24]){for(let z of [-13,-30]){const l=new THREE.SpotLight(roomX<0?0xffdb9d:0xaabbe0,30,12,Math.PI/4,.55);l.position.set(roomX,4.9,z);l.target.position.set(roomX,0,z);scene.add(l,l.target)}}
}
function clampToWalkable(x,z){const r=CONFIG.playerRadius;const inside=WALKABLE.some(a=>x>=a.x1+r&&x<=a.x2-r&&z>=a.z1+r&&z<=a.z2-r);if(!inside)return false;for(let a of blockers){if(x>a.x1-r&&x<a.x2+r&&z>a.z1-r&&z<a.z2+r)return false}return true}
function setRotation(){camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0)}
const keys=new Set();let dragging=false,lastX=0,lastY=0;
function move(dt){if(!entered||reading||modalOpen)return;let horizontal=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));let vertical=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 if(!horizontal&&!vertical)return;const mag=Math.hypot(horizontal,vertical);horizontal/=mag;vertical/=mag;let dx=(Math.cos(yaw)*horizontal+Math.sin(yaw)*vertical)*CONFIG.speed*dt;let dz=(-Math.sin(yaw)*horizontal+Math.cos(yaw)*vertical)*CONFIG.speed*dt;
 let nx=camera.position.x+dx,nz=camera.position.z+dz;
 if(clampToWalkable(nx,nz)){camera.position.x=nx;camera.position.z=nz}else{if(clampToWalkable(nx,camera.position.z))camera.position.x=nx;if(clampToWalkable(camera.position.x,nz))camera.position.z=nz}}
function lookAtPoint(x,z){const dx=x-camera.position.x,dz=z-camera.position.z;yaw=Math.atan2(-dx,-dz);pitch=0;setRotation()}
function teleport(wing){const data=GALLERIES[wing];if(!data)return;camera.position.set(data.x,CONFIG.eyeHeight,data.z);lookAtPoint(data.x,data.lookZ);currentWing=wing;show('map-panel',false);document.querySelectorAll('[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===wing));updateGallery()}
function updateGallery(){const [x,z]=[camera.position.x,camera.position.z];let wing=x<-13?'north':x>13?'south':z<-58?'modern':z<-32?'field':'intro';if(wing!==currentWing){currentWing=wing;document.querySelectorAll('[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===wing))}const g=GALLERIES[currentWing];$('gallery-number').textContent=g.number;$('gallery-title').textContent=g.name;$('gallery-desc').textContent=g.subtitle}
function nearestExhibit(){let best=null,bd=3.1;for(let e of exhibitNodes){let d=Math.hypot(camera.position.x-e.point.x,camera.position.z-e.point.z);if(d<bd){bd=d;best=e}}return best}
function openExhibit(item){if(!item)return;modalOpen=true;document.exitPointerLock?.();exhibitUI.renderExhibit(item,MUSEUM);show('exhibit-dialog',true);show('prompt',false)}
function closeExhibit(){modalOpen=false;show('exhibit-dialog',false)}
function doTour(){tourOn=true;tourIndex=0;show('tour-controller',true);goTourIndex()}
function goTourIndex(){tourIndex=(tourIndex+MUSEUM.exhibits.length)%MUSEUM.exhibits.length;const e=MUSEUM.exhibits[tourIndex];teleport(e.wing);const target=exhibitNodes.find(n=>n.item.id===e.id);if(target){let p=target.point;const offset=2.9;let side=target.item.wing==='north'?-1:target.item.wing==='south'?1:0;let possible={x:p.x+side*offset,z:p.z+offset};if(clampToWalkable(possible.x,possible.z))camera.position.set(possible.x,1.7,possible.z);lookAtPoint(p.x,p.z)}$('tour-title').textContent=e.title;$('tour-progress').textContent=`GUIDED TOUR  ·  ${tourIndex+1} / ${MUSEUM.exhibits.length}`}
function setupEvents(){
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>teleport(b.dataset.go)));
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.close,false)));
 $('enter-3d').addEventListener('click',()=>{entered=true;reading=false;show('welcome',false);show('reader',false);show('hud',true);show('reticle',true);show('gallery-location',true);show('minimap',true);show('touch-pad',matchMedia('(pointer:coarse)').matches);teleport('intro')});
 $('enter-2d').addEventListener('click',()=>{show('welcome',false);reading=true;show('reader',true)});
 $('btn-reader').addEventListener('click',()=>{reading=true;show('reader',true);document.exitPointerLock?.()});
 $('close-reader').addEventListener('click',()=>{reading=false;show('reader',false);if(!entered)show('welcome',true)});
 $('btn-home').addEventListener('click',()=>{show('welcome',true);entered=false;document.exitPointerLock?.()});
 $('btn-help').addEventListener('click',()=>show('help',true));
 $('minimap').addEventListener('click',()=>show('map-panel',true));
 $('btn-guide').addEventListener('click',doTour);
 $('tour-prev').addEventListener('click',()=>{tourIndex--;goTourIndex()});$('tour-next').addEventListener('click',()=>{tourIndex++;goTourIndex()});$('tour-open').addEventListener('click',()=>openExhibit(MUSEUM.exhibits[tourIndex]));$('tour-close').addEventListener('click',()=>{tourOn=false;show('tour-controller',false)});
 document.querySelectorAll('[data-move]').forEach(b=>{const m={forward:'w',backward:'s',left:'a',right:'d'}[b.dataset.move];b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(m)});for(let n of ['pointerup','pointercancel','pointerleave'])b.addEventListener(n,()=>keys.delete(m))});
 window.addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){if(!reading&&!modalOpen){keys.add(k);e.preventDefault()}}if(k==='e'&&entered&&!modalOpen&&!reading){const n=nearestExhibit();if(n)openExhibit(n.item)}if(k==='escape'){if(modalOpen)closeExhibit();show('map-panel',false);show('help',false)}});
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
 const canvas=renderer.domElement;
 canvas.addEventListener('pointerdown',e=>{if(!entered||reading||modalOpen)return;dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture?.(e.pointerId)});
 canvas.addEventListener('pointerup',()=>dragging=false);
 canvas.addEventListener('pointermove',e=>{if(!entered||reading||modalOpen)return;if(dragging||document.pointerLockElement===canvas){const dx=dragging?e.clientX-lastX:e.movementX;const dy=dragging?e.clientY-lastY:e.movementY;yaw-=dx*CONFIG.lookSensitivity;pitch=Math.max(-1.25,Math.min(1.25,pitch-dy*CONFIG.lookSensitivity));setRotation();lastX=e.clientX;lastY=e.clientY}});
 canvas.addEventListener('dblclick',()=>{if(entered&&!reading)canvas.requestPointerLock?.()});
 canvas.addEventListener('click',e=>{if(!entered||modalOpen||reading||dragging)return;const n=nearestExhibit();if(n)openExhibit(n.item)});
 $('exhibit-prev').addEventListener('click',()=>{const i=MUSEUM.exhibits.findIndex(e=>e.id===exhibitUI.currentId);exhibitUI.renderExhibit(MUSEUM.exhibits[(i-1+MUSEUM.exhibits.length)%MUSEUM.exhibits.length],MUSEUM)});
 $('exhibit-next').addEventListener('click',()=>{const i=MUSEUM.exhibits.findIndex(e=>e.id===exhibitUI.currentId);exhibitUI.renderExhibit(MUSEUM.exhibits[(i+1)%MUSEUM.exhibits.length],MUSEUM)});
 document.querySelector('[data-close="exhibit-dialog"]').addEventListener('click',closeExhibit);
 document.getElementById('exhibit-dialog').addEventListener('click',e=>{if(e.target.id==='exhibit-dialog')closeExhibit()});
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)})
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);move(dt);if(entered&&!modalOpen&&!reading){const n=nearestExhibit();show('prompt',!!n&&!tourOn);if(n)$('prompt-label').textContent=n.item.title;updateGallery()}renderer.render(scene,camera)}
async function init(){try{let res=await fetch('./src/content.json');if(!res.ok)throw new Error(`Content ${res.status}`);MUSEUM=await res.json();$('load-state').textContent='Preparing historical galleries and 3D artifacts…';buildRooms();buildExhibits();populateRooms();setupEvents();prepareReader(MUSEUM,{openExhibit});$('load-state').textContent='Museum ready · Explore either mode';animate()}catch(error){console.error(error);$('load-state').textContent='Museum setup failed: '+error.message+'. Serve the folder over HTTP or publish through GitHub Pages.'}}
init();
