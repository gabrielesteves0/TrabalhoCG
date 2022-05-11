import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js'
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera, 
        degreesToRadians, 
        onWindowResize,
        initDefaultBasicLight,
        createGroundPlane} from "../libs/util/util.js";

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(2, 5, 7)); // Init camera in this position
var trackballControls = new TrackballControls( camera, renderer.domElement );
initDefaultBasicLight(scene);
var groundPlane = createGroundPlane(5.0, 5.0, 10.0, 10.0, "rgb(100, 140, 90)");
groundPlane.rotateX(degreesToRadians(-90));
scene.add(groundPlane);

var animationOn1 = false;
var animationOn2 = false;
var retorno = false;
var speed1 = 0.02;
var speed2 = 0.01;

// Show world axes
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// Base sphere
var sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
var sphereMaterial = new THREE.MeshPhongMaterial( {color:'rgb(180,180,255)'} );
var sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
var sphere2 = new THREE.Mesh( sphereGeometry, sphereMaterial );
scene.add(sphere);
scene.add(sphere2);
// Set initial position of the sphere
sphere.translateX(-2.0).translateY(0.2).translateZ(-2.0);
sphere2.translateX(-2.0).translateY(0.2).translateZ(2.0);


// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

buildInterface();
render();

function moveBall1()
{
    if(animationOn1 == true){
        
        sphere.translateX(speed1);
    }
}

function moveBall2()
{
    if(animationOn2 == true){
        
        sphere2.translateX(speed2);
    }
    
}

function retornar()
{
    if(retorno == true){
        animationOn1 == true;
        animationOn2 == true;
        sphere.translateX(speed1);
        sphere2.translateX(speed2);
    }
}

function buildInterface()
{
  var controls = new function ()
  {
    this.onChangeAnimation1 = function(){
        speed1 = 0.02;
        animationOn1 = !animationOn1;
    };

    this.onChangeAnimation2 = function(){
        speed2 = 0.01;
        animationOn2 = !animationOn2;
      };

    this.return = function(){
        speed1 = -0.02;
        speed2 = -0.01;
        retorno = !retorno;
    };

  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, 'onChangeAnimation1',true).name("Ball 1");
  gui.add(controls, 'onChangeAnimation2',true).name("Ball 2");
  gui.add(controls, 'return',true).name("Return");
}

function render()   
{
  trackballControls.update();
  moveBall1();
  moveBall2();
  retornar();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}
