import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        degreesToRadians} from "../libs/util/util.js";
import { CSG } from '../libs/other/CSGMesh.js'
import { AnimationClip, NumberKeyframeTrack, AnimationMixer } from 'three';
import SpriteExplosion from './spriteExplosion.js';
// import { Water } from './assets/water/Water2.js';

// const params = {
//   color: '#ffffff',
//   scale: 4,
//   flowX: 1,
//   flowY: 1
// };

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// let waterGeometry = new THREE.PlaneGeometry(20, 20);
// let water = new Water( waterGeometry, {
//   color: params.color,
//   scale: params.scale,
//   flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
//   textureWidth: 1024,
//   textureHeight: 1024
// } );

// water.position.y = 1;
// water.rotation.x = Math.PI * - 0.5;
// scene.add( water );

// export default function objCura(){
//   // CRIAÇÃO DO OBJETO DE RECARGA ATRAVÉS DE CSG
//   var cubeGeometry = new THREE.BoxGeometry(1.5, 4, 4);
//   var cube2Geometry = new THREE.BoxGeometry(4, 1.5, 4);
//   var material = new THREE.MeshPhongMaterial({color:"rgb(255,0,0)", shininess:200});
//   var cube = new THREE.Mesh(cubeGeometry);
//   var cube2 = new THREE.Mesh(cube2Geometry);
//   var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 3, 32));
//   cylinder.position.set(0, 3, 0);
//   cube.position.set(0.0, 3.0, 0.0);
//   cube2.position.set(0.0, 3.0, 0.0);
//   cylinder.rotateX(degreesToRadians(90));
//   updateObject(cylinder);
//   updateObject(cube);
//   updateObject(cube2);

//   let auxMat = new THREE.Matrix4();

//   let cube1CSG = CSG.fromMesh(cube);
//   let cube2CSG = CSG.fromMesh(cube2);
//   let cylinderCSG = CSG.fromMesh(cylinder);

//   let cruzCSG = cube1CSG.union(cube2CSG);
//   let objRecargaCSG = cylinderCSG.subtract(cruzCSG);
//   let objRecarga;

//   objRecarga = CSG.toMesh(objRecargaCSG, auxMat);
//   objRecarga.material = material;
//   objRecarga.position.set = (0, 3, 0);
//   return objRecarga;
// }


// function updateObject(mesh)
// {
//    mesh.matrixAutoUpdate = false;
//    mesh.updateMatrix();
// }

// Animação da explosão:

// let planoExplosão = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshLambertMaterial());

// planoExplosão.material.side = THREE.DoubleSide;

// scene.add(planoExplosão);

// planoExplosão.position.set(0, 5, 0);


const values = [2, 6, 8, 9, 10, 3, 7, 11, 15, 12, 13, 14, 0, 1, 4, 5];

const sprite = new SpriteExplosion("./assets/textures/sprite-explosion.png", 4, 4, scene);

sprite.loop(values, 1.5);

const clock = new THREE.Clock();

function animate () {
  let deltaTime = clock.getDelta();
  renderer.render(scene, camera);
  sprite.update(deltaTime);
  requestAnimationFrame(animate);
}

animate();
// Use this to show information onscreen
var controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
  trackballControls.update(); // Enable mouse movements
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}