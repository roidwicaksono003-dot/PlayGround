import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const sceneCanvas = $('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9bcbd2');
scene.fog = new THREE.FogExp2('#9bcbd2', 0.012);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ canvas: sceneCanvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

scene.add(new THREE.HemisphereLight('#d7f3ff', '#486550', 2.15));
const sun = new THREE.DirectionalLight('#fff0ce', 3.2);
sun.position.set(-18, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -34; sun.shadow.camera.right = 34; sun.shadow.camera.top = 34; sun.shadow.camera.bottom = -34;
scene.add(sun);

const mats = {};
const mat = (name, color, roughness = 0.9) => mats[name] ||= new THREE.MeshStandardMaterial({ color, roughness });
const sandMat = mat('sand', '#d8bc8a');
const grassMat = mat('grass', '#527b55');
const darkGrassMat = mat('darkgrass', '#385e4c');
const leafMat = mat('leaf', '#36745c');
const leafLightMat = mat('leaflight', '#6e9a61');
const woodMat = mat('wood', '#79583e');
const rockMat = mat('rock', '#818c86');
const waterMat = new THREE.MeshStandardMaterial({ color: '#58aeb3', roughness: 0.27, metalness: 0.08, transparent: true, opacity: 0.84 });
const island = new THREE.Group(); scene.add(island);

// Soft, layered ocean and a hand-shaped island with a sandy shoreline.
const sea = new THREE.Mesh(new THREE.CircleGeometry(80, 96), waterMat);
sea.rotation.x = -Math.PI / 2; sea.position.y = -0.75; scene.add(sea);
const shore = new THREE.Mesh(new THREE.CylinderGeometry(21, 22, 1.25, 64, 1), sandMat);
shore.position.y = -0.08; shore.receiveShadow = true; island.add(shore);
const land = new THREE.Mesh(new THREE.CylinderGeometry(18.9, 20.8, 1.6, 48, 2), grassMat);
land.position.y = 0.38; land.receiveShadow = true; island.add(land);
// Uneven green interior gives the island a softer, less circular silhouette.
for (let i = 0; i < 13; i++) {
  const a = i / 13 * Math.PI * 2;
  const lump = new THREE.Mesh(new THREE.SphereGeometry(5.1 + (i % 3) * .55, 12, 8), i % 2 ? grassMat : darkGrassMat);
  lump.position.set(Math.cos(a) * 11.4, .55, Math.sin(a) * 9.5);
  lump.scale.set(1.2, .18, 1); lump.receiveShadow = true; island.add(lump);
}
const sandPatch = new THREE.Mesh(new THREE.CircleGeometry(7.5, 40), sandMat);
sandPatch.rotation.x = -Math.PI / 2; sandPatch.position.set(0, .56, 6.4); island.add(sandPatch);

// Tiny layered waves around the playable shore.
const waveMat = new THREE.MeshBasicMaterial({ color: '#c4e7df', transparent: true, opacity: .43, side: THREE.DoubleSide });
for (let i = 0; i < 22; i++) {
  const a = i / 22 * Math.PI * 2;
  const wave = new THREE.Mesh(new THREE.TorusGeometry(20.8 + (i % 3) * .38, .045, 4, 48, 1.65), waveMat);
  wave.rotation.x = Math.PI / 2; wave.rotation.z = a; wave.position.y = -.36 + (i % 4) * .035; scene.add(wave);
}

function makePalm(x, z, size = 1) {
  const group = new THREE.Group(); group.position.set(x, .85, z); group.scale.setScalar(size);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.19, .32, 4.5, 7), woodMat);
  trunk.position.y = 2.1; trunk.rotation.z = -.1; trunk.castShadow = true; group.add(trunk);
  const crown = new THREE.Group(); crown.position.set(-.22, 4.32, 0); group.add(crown);
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.42, 3.5, 5), i % 3 === 0 ? leafLightMat : leafMat);
    leaf.position.y = -.5; leaf.rotation.z = Math.PI / 2.4; leaf.rotation.y = i * Math.PI / 4;
    leaf.scale.set(1, 1, .34); leaf.castShadow = true; crown.add(leaf);
  }
  island.add(group);
}
for (const [x,z,s] of [[-12,-6,1.15],[-15,2,.8],[12,-5,1.1],[15,1,.85],[-9,12,.8],[9,12,.9],[3,-13,.8],[-3,-14,.75]]) makePalm(x,z,s);

function makeRock(x,z,s=1) {
  const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), rockMat);
  mesh.position.set(x,.55*s,z); mesh.scale.set(1.1*s,.8*s,.9*s); mesh.rotation.set(.16,.7,.08); mesh.castShadow=true; mesh.receiveShadow=true; island.add(mesh); return mesh;
}
for (const [x,z,s] of [[-16,-9,1.1],[16,-8,.9],[-14,9,.8],[13,9,1.1],[4,-17,.75],[-4,-17,.9]]) makeRock(x,z,s);

function makeBush(x,z, berry = false) {
  const g = new THREE.Group(); g.position.set(x,.65,z); island.add(g);
  for (let j=0;j<4;j++) { const b=new THREE.Mesh(new THREE.IcosahedronGeometry(.66,1), berry?leafMat:leafLightMat); b.position.set((j%2-.5)*.62,Math.floor(j/2)*.38, (j<2?-.22:.22)); b.scale.set(1,.82,1); b.castShadow=true; g.add(b); }
  if (berry) for(let j=0;j<7;j++){const f=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),mat('berry','#c75563',.5)); f.position.set(Math.sin(j*4)*.7,.3+(j%3)*.22,Math.cos(j*3)*.52);g.add(f);}
  return g;
}
for (const [x,z,b] of [[-8,3,true],[8,2,true],[-6,-8,false],[6,-8,false],[-11,5,false],[11,6,true],[1,11,true]]) makeBush(x,z,b);

// Character: friendly, stylized island explorer, dressed for safety and comfort.
function capsule(parent, radius, length, material, pos, rot = [0,0,0], scale=[1,1,1]) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,4,8),material);
  m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale); m.castShadow=true; parent.add(m); return m;
}
const player = new THREE.Group(); scene.add(player);
const model = new THREE.Group(); player.add(model);
const skin = mat('skin','#f0c5a5');
const hair = mat('hair','#342c46',.55);
const cloth = mat('cloth','#2f9290',.8);
const shorts = mat('shorts','#34485c');
const boot = mat('boot','#ad7650');
const eyeMat = new THREE.MeshBasicMaterial({color:'#30293d'});
const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.43,.64,5,10),cloth); torso.position.y=1.38; torso.castShadow=true; model.add(torso);
const hem = new THREE.Mesh(new THREE.CylinderGeometry(.51,.58,.2,10),mat('hem','#edc987')); hem.position.y=1.02; model.add(hem);
const head = new THREE.Mesh(new THREE.SphereGeometry(.42,16,12),skin); head.position.set(0,2.18,0); head.scale.set(.9,1.05,.82); head.castShadow=true; model.add(head);
const hairCap = new THREE.Mesh(new THREE.SphereGeometry(.46,14,10,0,Math.PI*2,0,Math.PI*.62),hair); hairCap.position.set(0,2.29,-.035); hairCap.scale.set(1,1.08,.94); model.add(hairCap);
for (const side of [-1,1]) {
  const lock = new THREE.Mesh(new THREE.ConeGeometry(.17,.7,7),hair); lock.position.set(side*.34,1.98,.02); lock.rotation.z=side*-.26; model.add(lock);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),eyeMat); eye.position.set(side*.15,2.19,.355); eye.scale.set(.65,1.3,.55); model.add(eye);
  const leg = capsule(model,.16,.47,shorts,[side*.19,.68,0],[0,0,side*.025]);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),boot); foot.position.set(side*.2,.2,.08); foot.scale.set(.8,.55,1.35); foot.castShadow=true; model.add(foot);
  const arm = capsule(model,.13,.55,skin,[side*.52,1.4,0],[0,0,side*-.18]);
  const sleeve = capsule(model,.145,.2,cloth,[side*.5,1.58,0],[0,0,side*-.18]);
}
const pack = new THREE.Mesh(new THREE.BoxGeometry(.52,.62,.25),mat('pack','#c67b4c'));
pack.position.set(0,1.42,-.42); pack.castShadow=true; model.add(pack);

const resources = [];
const resourceMeta = {
  wood:{ label:'Driftwood', color:'#bd9362', amount:1 }, stone:{label:'Stone',color:'#9aa49f',amount:1},
  shell:{label:'Shell',color:'#f3d9bd',amount:1}, vine:{label:'Vine',color:'#7aab68',amount:1}, coconut:{label:'Coconut',color:'#8b6744',amount:1}, berry:{label:'Wild berries',color:'#b84861',amount:2}
};
function resource(type,x,z,scale=1) {
  const g=new THREE.Group();g.position.set(x,.74,z);g.scale.setScalar(scale);island.add(g);
  let mesh;
  if(type==='wood') {mesh=new THREE.Mesh(new THREE.CylinderGeometry(.17,.21,1.25,7),mat('drift','#aa7950'));mesh.rotation.z=Math.PI/2;mesh.rotation.y=.25;}
  else if(type==='stone') {mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(.42,0),rockMat);mesh.scale.set(1,.72,.84);}
  else if(type==='shell') {mesh=new THREE.Mesh(new THREE.SphereGeometry(.38,10,7,0,Math.PI*2,0,Math.PI/2),mat('shell','#f0d7b6'));mesh.scale.set(1,.56,.75);}
  else if(type==='vine') {mesh=new THREE.Mesh(new THREE.TorusGeometry(.34,.075,6,14,Math.PI*1.65),mat('vine','#79a867'));mesh.rotation.x=Math.PI/2;}
  else {mesh=new THREE.Mesh(new THREE.SphereGeometry(.38,9,7),mat(type==='berry'?'berryRes':'coconutRes',resourceMeta[type].color));}
  mesh.castShadow=true;g.add(mesh);
  // Small glint marker communicates that this is a collectable.
  const marker=new THREE.Mesh(new THREE.TorusGeometry(.48,.025,4,24),new THREE.MeshBasicMaterial({color:'#f8e6ae',transparent:true,opacity:.8})); marker.rotation.x=Math.PI/2;marker.position.y=-.44;g.add(marker);
  resources.push({type,group:g,active:true,marker}); return g;
}
const resourceSpots = [
 ['wood',-5,4],['wood',-3,7],['wood',4,4],['wood',6,7],['wood',-8,-2],['wood',7,-4],['wood',0,-7],['wood',-2,-11],['wood',10,1],['wood',-10,1],['wood',3,10],['wood',-5,-5],['wood',12,4],['wood',-12,-2],['wood',5,-11],['wood',-7,10],
 ['stone',-7,5],['stone',-1,4],['stone',5,5],['stone',8,-2],['stone',-9,-5],['stone',2,-9],['stone',-4,-10],['stone',11,7],['stone',-12,7],['stone',1,12],['stone',-11,-9],['stone',9,-10],
 ['shell',-1,11],['shell',2,12],['shell',-4,9],['shell',4,10],['shell',0,14],['shell',-7,11],['shell',7,11],
 ['vine',-7,-3],['vine',7,-7],['vine',-10,4],['vine',10,5],['vine',0,-12],['vine',-4,-2],
 ['coconut',-2,2],['berry',-8,3],['berry',8,2],['berry',11,6],['berry',1,11]
];
resourceSpots.forEach(([t,x,z],i)=>resource(t,x,z, t==='wood'?.9+(i%3)*.08: .85+(i%2)*.12));

// Crafted structures sit on the sandy camp clearing and the north headland.
const structures = new THREE.Group(); scene.add(structures);
function buildCampfire(x,z,large=false) {
  const g=new THREE.Group();g.position.set(x,.67,z);structures.add(g);
  for(let i=0;i<5;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.13,.15,large?2.2:1.55,7),woodMat);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/5;log.position.y=.12;log.castShadow=true;g.add(log);}
  const stones=new THREE.Mesh(new THREE.TorusGeometry(large?1.15:.8,.17,6,14),rockMat);stones.rotation.x=Math.PI/2;stones.position.y=.04;g.add(stones);
  const flame=new THREE.Group(); flame.position.y=.45;g.add(flame);
  for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(large?.42:.28,large?1.7:1.05,7),new THREE.MeshBasicMaterial({color:['#ff9b4b','#ffca68','#ee613d'][i%3],transparent:true,opacity:.88}));f.position.set((i%2-.5)*.24,(i%3)*.12,(i-1.5)*.12);f.scale.set(1,.8,1);flame.add(f);}
  const light=new THREE.PointLight('#ffad62',large?5:3,large?18:10,2);light.position.y=1.5;g.add(light);
  return {group:g,flame,light};
}
const fireSpot={x:0,z:7.5};
const beaconSpot={x:0,z:-13.5};

const inventory={wood:0,stone:0,shell:0,vine:0,coconut:1,berry:0};
const recipes={campfire:{wood:5,stone:3},beacon:{wood:8,stone:5,shell:3,vine:2}};
let builtCampfire=null,builtBeacon=null;
let started=false,paused=false,ended=false,elapsed=0,lastTime=performance.now(),timeOfDay=9.33;
let health=100,hunger=80,thirst=70,energy=100,woodGathered=0;
let activeTarget=null, targetCooldown=0, cameraYaw=0, cameraPitch=.42;
let joystick={x:0,y:0,pointer:null};
const tempV=new THREE.Vector3();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function distanceTo(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}

// A soft shadow under Mio keeps the low-poly character grounded.
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.65,20),new THREE.MeshBasicMaterial({color:'#1e3836',transparent:true,opacity:.2}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.53;player.add(shadow);
player.position.set(0,1.15,9.5);

function drawPortrait(canvas, small=false) {
  const c=canvas.getContext('2d'), w=canvas.width, h=canvas.height;
  c.clearRect(0,0,w,h);
  const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#83bdaf');g.addColorStop(1,'#e6c893');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle='#fff4d8';c.beginPath();c.arc(w*.76,h*.22,w*.14,0,Math.PI*2);c.fill();
  c.fillStyle='#477d70';c.beginPath();c.moveTo(0,h*.72);c.quadraticCurveTo(w*.36,h*.4,w*.56,h*.72);c.quadraticCurveTo(w*.79,h*.36,w,h*.7);c.lineTo(w,h);c.lineTo(0,h);c.fill();
  c.fillStyle='#d5bc8d';c.fillRect(0,h*.8,w,h*.2);
  c.fillStyle='#342c46';c.beginPath();c.ellipse(w*.5,h*.48,w*.27,h*.32,0,0,Math.PI*2);c.fill();
  c.fillStyle='#eec3a2';c.beginPath();c.ellipse(w*.5,h*.5,w*.205,h*.27,0,0,Math.PI*2);c.fill();
  c.fillStyle='#342c46';c.beginPath();c.ellipse(w*.5,h*.35,w*.24,h*.18,0,Math.PI,Math.PI*2);c.fill();
  c.fillStyle='#2e293b';for(const s of [-1,1]){c.beginPath();c.ellipse(w*(.44+s*.09),h*.51,w*.018,h*.04,0,0,Math.PI*2);c.fill();}
  c.fillStyle='#2f9290';c.beginPath();c.moveTo(w*.2,h);c.quadraticCurveTo(w*.25,h*.68,w*.5,h*.69);c.quadraticCurveTo(w*.78,h*.68,w*.82,h);c.fill();
  if(!small){c.fillStyle='rgba(255,255,255,.25)';c.fillRect(0,0,w,h);}
}
drawPortrait($('portrait'));drawPortrait($('portrait-mini'),true);

function toast(message, icon='✦') {
  const el=document.createElement('div');el.className='toast';el.innerHTML=`<span>${icon}</span><b>${message}</b>`;$('toast-stack').append(el);
  setTimeout(()=>el.classList.add('show'),20);setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),300);},2400);
}
function showNotice(message){$('notice').textContent=message;$('notice').classList.add('show');setTimeout(()=>$('notice').classList.remove('show'),2200);}
function updateInventory(){
  $('coconut-count').textContent=inventory.coconut;$('berry-count').textContent=inventory.berry;
  const update=(id,recipe)=>{const container=$(id);container.innerHTML='';for(const [k,n] of Object.entries(recipe)){const chip=document.createElement('span');chip.className=`recipe-chip ${inventory[k]>=n?'ready':''}`;chip.textContent=`${inventory[k]||0}/${n} ${k}`;container.append(chip);}};
  update('campfire-chips',recipes.campfire);update('beacon-chips',recipes.beacon);
  $('quest-step-1').classList.toggle('done',!!builtCampfire);$('quest-step-1').classList.toggle('active',!builtCampfire);
  $('quest-step-2').classList.toggle('locked',!builtCampfire);$('quest-step-2').classList.toggle('active',!!builtCampfire&&!builtBeacon);$('quest-step-2').classList.toggle('done',!!builtBeacon);
}
function spend(recipe){for(const [k,n] of Object.entries(recipe)){if((inventory[k]||0)<n)return false;}for(const [k,n] of Object.entries(recipe))inventory[k]-=n;updateInventory();return true;}
function updateVitals(){
  for(const [key,value] of Object.entries({health,hunger,thirst,energy})){$(`${key}-bar`).style.width=`${clamp(value,0,100)}%`;$(`${key}-value`).textContent=Math.ceil(value);document.querySelector(`[data-vital="${key}"]`).classList.toggle('low',value<26);}
}
function setModal(title,content,kicker='FIELD NOTES',secondary=false){$('modal-title').textContent=title;$('modal-content').innerHTML=content;$('modal-kicker').textContent=kicker;$('modal-secondary').style.display=secondary?'block':'none';$('modal').classList.add('open');$('modal').setAttribute('aria-hidden','false');paused=true;}
function closeModal(){ $('modal').classList.remove('open');$('modal').setAttribute('aria-hidden','true');if(!ended)paused=false; }
function help(){setModal('How to survive',`<p>Explore the island and collect driftwood, stones, shells and vines. Your pack starts with one coconut.</p><p><b>Campfire:</b> 5 driftwood + 3 stone, built on the beach clearing.</p><p><b>Signal fire:</b> 8 driftwood + 5 stone + 3 shells + 2 vine, built on the northern headland.</p><p>Stay fed and hydrated. Eat from your pouch, then interact with the marked building spots. Move with WASD or the joystick; drag the scene to look around.</p>`);}

function activateTarget(target) {
  if(!target)return;
  if(target.kind==='resource'){
    const r=target.resource;if(!r.active)return;
    r.active=false;r.group.visible=false;inventory[r.type]+=resourceMeta[r.type].amount;
    if(r.type==='wood')woodGathered++;
    updateInventory();toast(`+${resourceMeta[r.type].amount} ${resourceMeta[r.type].label}`,r.type==='wood'?'⌁':'✦');
    if(r.type==='coconut')inventory.coconut+=0;
  } else if(target.kind==='campfire') {
    if(builtCampfire){toast('The camp is warm and safe','♨');return;}
    if(!spend(recipes.campfire)){showNotice('Not enough supplies for a campfire');return;}
    builtCampfire=buildCampfire(fireSpot.x,fireSpot.z,false);toast('Campfire built — the island feels less lonely','♨');
  } else if(target.kind==='beacon') {
    if(!builtCampfire){showNotice('Build the campfire first');return;}
    if(builtBeacon){finishGame();return;}
    if(!spend(recipes.beacon)){showNotice('Gather the signal fire supplies');return;}
    builtBeacon=buildCampfire(beaconSpot.x,beaconSpot.z,true);toast('Signal fire raised!','✦');setTimeout(finishGame,1800);
  }
  updateInventory();
}
function nearestTarget(){
  let best=null, bestD=2.2;
  for(const r of resources){if(!r.active)continue;const d=distanceTo(player.position,r.group.position);if(d<bestD){bestD=d;best={kind:'resource',resource:r,d};}}
  const campD=distanceTo(player.position,fireSpot);if(campD<2.8&&(!best||campD<bestD)){bestD=campD;best={kind:'campfire',d:campD};}
  const beaconD=distanceTo(player.position,beaconSpot);if(beaconD<3.2&&(!best||beaconD<bestD)){bestD=beaconD;best={kind:'beacon',d:beaconD};}
  return best;
}
function updatePrompt(target){
  activeTarget=target;const button=$('action-button'),prompt=$('interaction-prompt');
  if(!started||!target){button.disabled=true;prompt.classList.remove('visible');return;}
  button.disabled=false;prompt.classList.add('visible');
  let title='Gather supplies',label='GATHER';
  if(target.kind==='resource'){title=`Gather ${resourceMeta[target.resource.type].label.toLowerCase()}`;label='GATHER';}
  if(target.kind==='campfire'){title=builtCampfire?'Warm up by the campfire':'Build a campfire';label=builtCampfire?'WARM':'BUILD';}
  if(target.kind==='beacon'){title=builtBeacon?'Signal the boat':'Raise the signal fire';label=builtBeacon?'SIGNAL':'BUILD';}
  $('prompt-title').textContent=title;$('prompt-sub').textContent=matchMedia('(pointer:coarse)').matches?'Tap the glowing button':'E · '+label.toLowerCase();$('action-label').textContent=label;
}

function eat(kind){
  if(inventory[kind]<=0){toast(kind==='coconut'?'No coconut left':'No berries left','!');return;}
  inventory[kind]--;if(kind==='coconut'){hunger=Math.min(100,hunger+28);thirst=Math.min(100,thirst+18);}else hunger=Math.min(100,hunger+16);
  updateVitals();updateInventory();toast(kind==='coconut'?'Coconut eaten · hunger & thirst restored':'Berries eaten · hunger restored','♥');
}
$('eat-coconut').addEventListener('click',()=>eat('coconut'));$('eat-berry').addEventListener('click',()=>eat('berry'));
$('action-button').addEventListener('click',()=>activateTarget(activeTarget));
$('start-button').addEventListener('click',()=>startGame());$('again-button').addEventListener('click',()=>location.reload());
$('help-button').addEventListener('click',help);$('pause-button').addEventListener('click',()=>{if(paused)closeModal();else setModal('Take a breath',`<p>The shore can wait. Your supplies and progress are safe while paused.</p>`,'PAUSED');});
$('modal-close').addEventListener('click',closeModal);$('modal-primary').addEventListener('click',closeModal);$('modal-secondary').addEventListener('click',()=>location.reload());
$('sound-button').addEventListener('click',()=>{$('sound-button').classList.toggle('muted');$('sound-button').setAttribute('aria-label',$('sound-button').classList.contains('muted')?'Unmute sound':'Mute sound');});
$('quest-toggle').addEventListener('click',()=>{$('quest-body').classList.toggle('collapsed');$('quest-toggle').textContent=$('quest-body').classList.contains('collapsed')?'+':'−';});

function startGame(){
 if(started)return;started=true;$('start-screen').classList.add('hidden');$('hud').classList.add('active');$('intro').classList.add('play');
 setTimeout(()=>$('intro').classList.remove('play'),2600);toast('Find the driftwood along the shore','⌁');
}
function finishGame(){if(ended)return;ended=true;paused=true;$('end-time').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('end-wood').textContent=woodGathered;$('end-spirit').textContent=health>65?'★★★':health>35?'★★☆':'★☆☆';$('ending').classList.add('show');$('ending').setAttribute('aria-hidden','false');}
function gameOver(){if(ended)return;ended=true;paused=true;setModal('The tide took its turn',`<p>Mio needs a little more care. Restart the adventure and keep an eye on hunger and thirst.</p>`,'TRY AGAIN',true);}
updateInventory();updateVitals();

// Clear visual markers at the two build sites.
function buildMarker(x,z,color){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.055,5,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));ring.rotation.x=Math.PI/2;ring.position.set(x,.69,z);scene.add(ring);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(.82,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.09,side:THREE.DoubleSide}));glow.rotation.x=-Math.PI/2;glow.position.set(x,.65,z);scene.add(glow);
  return {ring,glow};
}
const campMarker=buildMarker(fireSpot.x,fireSpot.z,'#ffb968');const beaconMarker=buildMarker(beaconSpot.x,beaconSpot.z,'#a8e3d3');

const keys=new Set();
addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  keys.add(e.key.toLowerCase());
  if(e.key.toLowerCase()==='e'&&started&&!paused)activateTarget(activeTarget);
  if(e.key==='Escape'&&started){if($('modal').classList.contains('open'))closeModal();else $('pause-button').click();}
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
const joy=$('joystick'),knob=$('joystick-knob');
function joystickStart(e){if(!started)return;e.preventDefault();joy.setPointerCapture?.(e.pointerId);joystick.pointer=e.pointerId;joystickMove(e);}
function joystickMove(e){if(joystick.pointer!==e.pointerId)return;const rect=joy.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=e.clientX-cx,dy=e.clientY-cy,r=rect.width*.31,len=Math.hypot(dx,dy),scale=len>r?r/len:1;joystick.x=dx*scale/r;joystick.y=dy*scale/r;knob.style.transform=`translate(${joystick.x*r}px, ${joystick.y*r}px)`;}
function joystickEnd(e){if(joystick.pointer!==e.pointerId)return;joystick.pointer=null;joystick.x=joystick.y=0;knob.style.transform='translate(0,0)';}
joy.addEventListener('pointerdown',joystickStart);joy.addEventListener('pointermove',joystickMove);joy.addEventListener('pointerup',joystickEnd);joy.addEventListener('pointercancel',joystickEnd);
let lookPointer=null,lastX=0,lastY=0;
sceneCanvas.addEventListener('pointerdown',e=>{if(e.target!==sceneCanvas||!started)return;lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;sceneCanvas.setPointerCapture(e.pointerId);});
sceneCanvas.addEventListener('pointermove',e=>{if(lookPointer!==e.pointerId)return;cameraYaw-=(e.clientX-lastX)*.006;cameraPitch=clamp(cameraPitch+(e.clientY-lastY)*.003,-.08,.72);lastX=e.clientX;lastY=e.clientY;});
const endLook=e=>{if(lookPointer===e.pointerId)lookPointer=null;};sceneCanvas.addEventListener('pointerup',endLook);sceneCanvas.addEventListener('pointercancel',endLook);

function updateMovement(dt){
  if(!started||paused)return;
  let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y;
  let side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joystick.x;
  const len=Math.hypot(forward,side);if(len<.08)return;forward/=Math.max(1,len);side/=Math.max(1,len);
  const angle=cameraYaw, dx=(side*Math.cos(angle)+forward*Math.sin(angle)), dz=(forward*Math.cos(angle)-side*Math.sin(angle));
  const speed=(keys.has('shift')?6.8:4.15)*(energy<10?.72:1);
  player.position.x=clamp(player.position.x+dx*speed*dt,-17.5,17.5);player.position.z=clamp(player.position.z+dz*speed*dt,-17.5,17.5);
  const targetRot=Math.atan2(dx,dz), turn=Math.atan2(Math.sin(targetRot-model.rotation.y),Math.cos(targetRot-model.rotation.y));model.rotation.y+=turn*(1-Math.exp(-10*dt));
  const step=Math.sin(elapsed*10)*Math.min(1,len)*.055;model.position.y=step;
  energy=Math.max(0,energy-dt*(keys.has('shift')?1.9:.42));
}
const setWidth=()=>{const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));};
addEventListener('resize',setWidth);

function tick(now){
  requestAnimationFrame(tick);const dt=Math.min(.05,(now-lastTime)/1000||0);lastTime=now;
  if(started&&!paused){
    elapsed+=dt;timeOfDay=(9.33+elapsed/180)%24;
    hunger=Math.max(0,hunger-dt*.075);thirst=Math.max(0,thirst-dt*.11);
    if(hunger===0||thirst===0)health=Math.max(0,health-dt*.55);
    if(energy<100&&!keys.size)energy=Math.min(100,energy+dt*.75);
    updateMovement(dt);updateVitals();
    if(health<=0)gameOver();
    const hh=Math.floor(timeOfDay),mm=Math.floor((timeOfDay%1)*60);$('time-label').textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
    if(hh>=18||hh<6){scene.background.set('#526d7f');scene.fog.color.set('#526d7f');sun.intensity=1.2;$('weather-icon').textContent='☾';}else{scene.background.set('#9bcbd2');scene.fog.color.set('#9bcbd2');sun.intensity=3.2;$('weather-icon').textContent='☀';}
    const target=nearestTarget();updatePrompt(target);
    const area=player.position.z>5?'Lagoon Beach':player.position.z < -8?'North Headland':Math.abs(player.position.x)>10?'Palm Grove':'Greenheart';$('area-label').querySelector('b').textContent=area;
  }
  const sway=Math.sin(now*.0018)*.04;
  island.children.forEach(o=>{if(o.children?.length>5&&o.position.y>.8)o.rotation.z=sway;});
  resources.forEach((r,i)=>{if(r.active){r.marker.rotation.z=now*.0008+i;r.marker.position.y=-.44+Math.sin(now*.003+i)*.04;}});
  campMarker.ring.material.opacity=.58+Math.sin(now*.003)*.2;beaconMarker.ring.material.opacity=.55+Math.sin(now*.003+1)*.22;
  for(const fire of [builtCampfire,builtBeacon])if(fire){fire.flame.rotation.z=Math.sin(now*.009)*.08;fire.light.intensity=(fire===builtBeacon?5:3)+Math.sin(now*.012)*.55;}
  const offset=new THREE.Vector3(Math.sin(cameraYaw)*10,5.3+cameraPitch*5,Math.cos(cameraYaw)*10);
  const desired=player.position.clone().add(offset);camera.position.lerp(desired,1-Math.exp(-dt*3.2));camera.lookAt(player.position.x,1.15,player.position.z);
  renderer.render(scene,camera);
}
const initialCamera=new THREE.Vector3(8,8,19);camera.position.copy(initialCamera);camera.lookAt(0,0,2);
requestAnimationFrame(tick);
setTimeout(()=>$('loading').classList.add('done'),700);
