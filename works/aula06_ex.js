import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {TeapotGeometry} from '../build/jsm/geometries/TeapotGeometry.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        degreesToRadians,
        createLightSphere} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(6, 4, 3);
  camera.up.set( 0, 1, 0 );
// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20);
scene.add(plane);

var objColor = "rgb(255, 255, 255)";
var objShinines = 200;

var teapotGeometry = new TeapotGeometry(0.5);
var teapotMaterial = new THREE.MeshPhongMaterial({color:objColor, shininess:objShinines});
  material.side = THREE.DoubleSide;
var teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
  obj.castShadow = true;
  obj.position.set(0.0, 0.5, 0.0);
scene.add(teapot);

var torusGeometry = new THREE.TorusGeometry( 1, 0.02, 16, 100 );
var torusMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var torus = new THREE.Mesh( torusGeometry, torusMaterial );
scene.add( torus );
torus.translateY(2);
torus.rotateX(degreesToRadians(90));



var lightIntensity = 1.0;
var corAzul = "rgb(0,0,255)";
var corVermelha = "rgb(255,0,0)";
var corVerde = "rgb(0,255,0)";
var ambientColor = "rgb(50,50,50)";

var lightPositionAzul = new THREE.Vector3(1.7, 0.8, 1.1);
var lightPositionVermelho = new THREE.Vector3(1.7, 0.8, 1.1);
var lightPositionVerde = new THREE.Vector3(1.7, 0.8, 1.1);

var lightSphereAzul = createLightSphere(scene, 0.05, 10, 10, lightPositionAzul);
var lightSphereVermelha = createLightSphere(scene, 0.05, 10, 10, lightPositionVermelho);
var lightSphereVerde = createLightSphere(scene, 0.05, 10, 10, lightPositionVerde);

var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add( ambientLight );

var spotLightAzul = new THREE.SpotLight(corAzul);
setSpotLight(lightPositionAzul);

var spotLightVermelho = new THREE.SpotLight(corAzul);
setSpotLight(lightPositionVermelho);

var spotLightVerde = new THREE.SpotLight(corAzul);
setSpotLight(lightPositionVerde);

spotLightAzul.position.copy(position);
spotLightAzul.shadow.mapSize.width = 512;
spotLightAzul.shadow.mapSize.height = 512;
spotLightAzul.angle = degreesToRadians(40);    
spotLightAzul.castShadow = true;
spotLightAzul.decay = 2;
spotLightAzul.penumbra = 0.5;
spotLightAzul.name = "Spot Light Azul"
torus.add(spotLightAzul);


spotLightVerde.position.copy(position);
spotLightVerde.shadow.mapSize.width = 512;
spotLightVerde.shadow.mapSize.height = 512;
spotLightVerde.angle = degreesToRadians(40);    
spotLightVerde.castShadow = true;
spotLightVerde.decay = 2;
spotLightVerde.penumbra = 0.5;
spotLightVerde.name = "Spot Light Verde"
torus.add(spotLightVerde);


spotLightVermelho.position.copy(position);
spotLightVermelho.shadow.mapSize.width = 512;
spotLightVermelho.shadow.mapSize.height = 512;
spotLightVermelho.angle = degreesToRadians(40);    
spotLightVermelho.castShadow = true;
spotLightVermelho.decay = 2;
spotLightVermelho.penumbra = 0.5;
spotLightVermelho.name = "Spot Light Vermelho"
torus.add(spotLightVermelho);


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