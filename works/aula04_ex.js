import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        createGroundPlaneWired,
        degreesToRadians} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var cameraHolder = new THREE.Object3D();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

cameraHolder.position.set(0.0, 0.2, 0.0);
scene.add(new THREE.HemisphereLight());
scene.add(cameraHolder);
camera.lookAt(0.0, 0.0, 0.0);
camera.up.set(0.0, 1.0, 0.0);
camera.position.set(0.0, 0.0, 1.0);
cameraHolder.add(camera);

var keyboard = new KeyboardState();

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneWired(5, 5);
scene.add(plane);


// Use this to show information onscreen
var controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("* Space to move the camera foward");
  controls.add("* Left and right arrows to rotate in Y");
  controls.add("* Up and down arrows to move in X");
  controls.add("* , and . to rotate in Z");
  controls.show();

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

function keyboardUpdate() {
  
    keyboard.update();

   if ( keyboard.pressed("left") )     cameraHolder.rotateY(degreesToRadians(2.0));
   if ( keyboard.pressed("right") )    cameraHolder.rotateY(degreesToRadians(-2.0));
   if ( keyboard.pressed("up") )       cameraHolder.rotateX(degreesToRadians(2.0));
   if ( keyboard.pressed("down") )     cameraHolder.rotateX(degreesToRadians(-2.0));
   if ( keyboard.pressed(",") )   cameraHolder.rotateZ(degreesToRadians(2.0));
   if ( keyboard.pressed(".") ) cameraHolder.rotateZ(degreesToRadians(-2.0));
   if ( keyboard.pressed("space") ) cameraHolder.translateZ(-0.01);
 }

render();

function render()
{
  keyboardUpdate();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}