import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        createLightSphere} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = new THREE.WebGLRenderer();    // View function in util/utils
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.getElementById("webgl-output").appendChild(renderer.domElement);
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(6, 4, 3);
  camera.up.set( 0, 1, 0 );
//initDefaultBasicLight(scene);



var lightIntensity = 1.0;
var lightPosition = new THREE.Vector3(3, 0.8, 5.0);
var lightColor = "rgb(255,255,255)";
var ambientColor = "rgb(50,50,50)";

var lightHolder = new THREE.Object3D();
scene.add(lightHolder);


var lightSphere = createLightSphere(lightHolder, 0.05, 10, 10, lightPosition);

var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add( ambientLight );

var dirLight = new THREE.DirectionalLight(lightColor);
setDirectionalLighting(lightPosition);


function setDirectionalLighting(position)
{
  dirLight.position.copy(position);
  dirLight.shadow.mapSize.width = 256;
  dirLight.shadow.mapSize.height = 256;
  dirLight.castShadow = true;

  dirLight.shadow.camera.near = .1;
  dirLight.shadow.camera.far = 20;
  dirLight.shadow.camera.left = -2.5;
  dirLight.shadow.camera.right = 2.5;
  dirLight.shadow.camera.top = 2.5;
  dirLight.shadow.camera.bottom = -2.5;

  scene.add(dirLight);
}



// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);
plane.receiveShadow = true;

var cylinderGeometry = new THREE.CylinderGeometry(0.5, 1.5, 4, 8);
const material = new THREE.MeshLambertMaterial();
let cone = new THREE.Mesh(cylinderGeometry, material);
  cone.castShadow = true;
cone.position.set(0, 2, 3);
cone.material.color.setHex(0x0000ff);
scene.add(cone);

var sphereGeometry = new THREE.SphereGeometry(1.5, 32, 16);
let esfera = new THREE.Mesh(sphereGeometry, material);
esfera.position.set(-2, 1.5, -5);
esfera.material.color.setHex(0xffff00);
scene.add(esfera);
esfera.castShadow = true;
esfera.receiveShadow = true;


var teapotGeometry = new TeapotGeometry(1);
var teapotMaterial = new THREE.MeshPhongMaterial({color:"rgb(255,0,0)", shininess:200});
  material.side = THREE.DoubleSide;
var teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
teapot.position.set(0, 1, 0);
scene.add(teapot);
teapot.castShadow = true;
teapot.receiveShadow = true;



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