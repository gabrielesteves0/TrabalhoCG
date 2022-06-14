import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {ConvexGeometry} from '../build/jsm/geometries/ConvexGeometry.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        createLightSphere,
        degreesToRadians,
        createGroundPlane} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(5,15,40);
  camera.up.set( 0, 1, 0 );
initDefaultBasicLight(scene);
var lightIntensity = 1.0;
var lightPosition = new THREE.Vector3(3, 0.8, 5.0);
var lightColor = "rgb(255,255,255)";
var ambientColor = "rgb(50,50,50)";

var lightHolder = new THREE.Object3D();
scene.add(lightHolder);


var lightSphere = createLightSphere(lightHolder, 0.05, 10, 10, lightPosition);

var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add( ambientLight );

//var spotLight = new THREE.SpotLight(lightColor);
//setSpotLight(lightPosition);

function setSpotLight(position)
{
  spotLight.position.copy(position);
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;
  spotLight.angle = degreesToRadians(40);    
  spotLight.castShadow = true;
  spotLight.decay = 2;
  spotLight.penumbra = 0.5;
  spotLight.name = "Spot Light"

  scene.add(spotLight);
}

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
var groundPlane = createGroundPlane(40, 35); // width and height
  groundPlane.rotateX(degreesToRadians(-90));
  groundPlane.receiveShadow = true;
scene.add(groundPlane);


var material = new THREE.MeshLambertMaterial({color:"rgb(255,255,0)"});
var cilynder1Geometry = new THREE.CylinderGeometry(2.5, 2.5, 10, 32);
var cilynder2Geometry = new THREE.CylinderGeometry(2, 2, 8, 32);

var cylinder2 = new THREE.Mesh(cilynder2Geometry, material);
var cylinder1 = new THREE.Mesh(cilynder1Geometry, material);

scene.add(cylinder1);
scene.add(cylinder2);

cylinder2.position.set(0, 2, 0);


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