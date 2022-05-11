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

let material = new THREE.MeshLambertMaterial({color:"rgb(200,0,0)"});
let variacaoGraus = 0;
var geometry = new THREE.SphereGeometry(0.5);

for(let i=0; i<12; i++){
    var sphere = new THREE.Mesh(geometry, material);
    sphere.translateY(0.5);
    sphere.rotateY(degreesToRadians(variacaoGraus));
    variacaoGraus = variacaoGraus + 30;
    sphere.translateZ(5);
    scene.add(sphere);
}


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