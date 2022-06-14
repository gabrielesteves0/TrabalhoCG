import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

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

// CRIAÇÃO DO OBJETO DE RECARGA ATRAVÉS DE CSG
var cubeGeometry = new THREE.BoxGeometry(1.5, 4, 6);
var cube2Geometry = new THREE.BoxGeometry(4, 1.5, 6);
var material = new THREE.MeshPhongMaterial({color:"rgb(255,0,0)", shininess:200});
var cube = new THREE.Mesh(cubeGeometry);
var cube2 = new THREE.Mesh(cube2Geometry);
var sphere = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32));
sphere.position.set(0, 4, 0);
cube.position.set(0.0, 4.0, 0.0);
cube2.position.set(0.0, 4.0, 0.0);

let auxMat = new THREE.Matrix4();

let cube1CSG = CSG.fromMesh(cube);
let cube2CSG = CSG.fromMesh(cube2);
let sphereCSG = CSG.fromMesh(sphere);

let csgObject = cube1CSG.union(cube2CSG);
let objRecargaCSG = sphereCSG.subtract(csgObject);
let objRecarga;

objRecarga = CSG.toMesh(objRecargaCSG, auxMat);
objRecarga.material = material;
objRecarga.position.set = (0, 4, 0);
scene.add(objRecarga);


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