import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ,
        createGroundPlaneWired,
        degreesToRadians} from "../libs/util/util.js";
import { ConeBufferGeometry } from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 45, 90));
initDefaultBasicLight(scene);
/*
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
cameraHolder.translateY(60);
cameraHolder.translateZ(60);
scene.add(cameraHolder);
camera.lookAt(100,0,0);
camera.up.set(0.0, 1.0, 0.0);
camera.position.set(0.0, 0.0, 1.0);
*/

// Enable mouse rotation, pan, zoom etc.

var keyboard = new KeyboardState();

function keyboardUpdate(){
    keyboard.update();
    if(keyboard.pressed("up"))  aviao.translateY(1.5);
    if(keyboard.pressed("down"))    aviao.translateY(-1.5);
    if(keyboard.pressed("left"))    aviao.translateX(-1);
    if(keyboard.pressed("right"))   aviao.translateX(1);
    if(keyboard.down("space") | keyboard.pressed("ctrl"))       createAmmo();

}


// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

var ammo = [];
var planes = [];
var enemies = [];

// Loop que cria os planos

for(let i=0; i<3; i++){
    let plane = createGroundPlaneWired(200, 400);
    scene.add(plane);
    plane.position.set(0,0,-(400*i));
    planes.push(plane);
}

let aviao = new THREE.Mesh(new THREE.ConeGeometry(2.5, 20, 32), new THREE.MeshLambertMaterial(255,0,0));
aviao.rotateX(degreesToRadians(-90));
aviao.translateZ(10);
scene.add(aviao);


function movePlanes(){
    planes.forEach(item => {
        item.translateY(-1);
        item.updateMatrixWorld(true);
        if(item.position.z == 400){
            item.position.set(0, 0, -820);
        }
    })
}

let target = new THREE.Vector3(0,0,0);

function createAmmo(){
    let shoot = new THREE.Mesh(new THREE.SphereGeometry(1, 0, 0), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    aviao.getWorldPosition(target);
    shoot.position.set(target.x, target.y, target.z);
    scene.add(shoot);
    ammo.push(shoot);
}

function shoot(){
    ammo.forEach(item => {
        item.translateZ(-1);
    });

}

function deleteAmmo(){
    ammo.forEach(item => {
        item.updateMatrixWorld(true);
        if(item.position.z + aviao.position.z == 150){
            scene.remove(item);
        }
    })
}
//TODO
/*
function createEnemies(){
    let enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    let positionX = (Math.random() * 100);
    let sinal = (Math.random());
    enemy.position.set(target.x, target.y, target.z);
    scene.add(shoot);
    ammo.push(shoot);
}
*/


var trackballControls = new TrackballControls( camera, renderer.domElement );


window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
    trackballControls.update();
    keyboardUpdate();
    shoot();
    deleteAmmo();
    movePlanes();
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}