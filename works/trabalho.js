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
//var camera = initCamera(new THREE.Vector3(0, 45, 90));
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(3.6, 4.6, 8.2);
  camera.up.set( 0, 1, 0 );
initDefaultBasicLight(scene);


var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
cameraHolder.translateY(65);
cameraHolder.translateZ(120);
cameraHolder.translateX(5);
cameraHolder.rotateY(degreesToRadians(300));
scene.add(cameraHolder);



var keyboard = new KeyboardState();

function keyboardUpdate(){
    keyboard.update();
    if(keyboard.pressed("up"))  aviao.translateY(1.5);
    if(keyboard.pressed("down"))    aviao.translateY(-1.5);
    if(keyboard.pressed("left"))    aviao.translateX(-1);
    if(keyboard.pressed("right"))   aviao.translateX(1);
    if(keyboard.down("space") | keyboard.down("ctrl"))       createAmmo();

}



var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Vetores para auxiliar no controle das muniçoes, planos e inimigos
var ammo = [];
var planes = [];
var enemies = [];
var velocidades = [];
var vectorEnemiesBB = [];
var vectorAmmoBB = [];

// Loop que cria os planos
for(let i=0; i<3; i++){
    let plane = createGroundPlaneWired(400, 400);
    scene.add(plane);
    plane.position.set(0,0,-(400*i));
    planes.push(plane);
}


let aviao = new THREE.Mesh(new THREE.ConeGeometry(2.5, 20, 32), new THREE.MeshLambertMaterial(255,0,0));
aviao.rotateX(degreesToRadians(-90));
aviao.translateZ(10);
scene.add(aviao);

let target = new THREE.Vector3(0,0,0);

let aviaoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
aviaoBB.setFromObject(aviao);
console.log(aviaoBB);

/*
let BBoxAviao = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 20), new THREE.MeshLambertMaterial(255,0,0));
aviao.getWorldPosition(target);
BBoxAviao.position.set(target.x, target.y, target.z);
scene.add(BBoxAviao);
*/

//Função que move os planos
function movePlanes(){
    planes.forEach(item => {
        item.translateY(-1);
        item.updateMatrixWorld(true);
        if(item.position.z == 400){
            item.position.set(0, 0, -800);
        }
    })
}

//Função que cria os tiros
function createAmmo(){
    let shoot = new THREE.Mesh(new THREE.SphereGeometry(1, 0, 0), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    //Ammo Bounding Box
    let ammoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    ammoBB.setFromObject(shoot);
    vectorAmmoBB.push(ammoBB);
    console.log(ammoBB);

    aviao.getWorldPosition(target);
    shoot.position.set(target.x, target.y, target.z);
    scene.add(shoot);
    ammo.push(shoot);
}

//Função que move os tiros
function moveShoot(){
    ammo.forEach(item => {
        item.translateZ(-1);
    });

}

//Função que deleta os tiros
function deleteAmmo(){
    ammo.forEach(item => {
        item.updateMatrixWorld(true);
        if(item.position.z + aviao.position.z <= -400 | item.position.z + aviao.position.z >= 400){
            scene.remove(item);
        }
    })
}

//Função que cria os inimigos
function createEnemies(){
    let enemy = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    //Enemies Bounding Box
    let enemiesBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    enemiesBB.setFromObject(enemy);
    vectorEnemiesBB.push(enemiesBB);
    console.log(enemiesBB);

    let positionX = (Math.random() * 185);
    let sinal = (Math.random()*2);
    let velocidade = (Math.random()*5);
    if(sinal >= 1)
        positionX = positionX * (-1);
    enemy.position.set(positionX, 10, -500);
    scene.add(enemy);
    enemies.push(enemy);
    velocidades.push(velocidade);
}

//Função que move os inimigos
function moveEnemies(){
    enemies.forEach(item => {
        item.translateZ(velocidades.at(enemies.findIndex(element => element == item)));
        item.updateMatrixWorld(true);
        if(item.position.z >= 150){
            scene.remove(item);
        }
    })
}

function atualizaBB(){
    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    enemies.forEach(item => {
        vectorEnemiesBB.at(enemies.findIndex(element => element == item)).copy(item.geometry.boundingBox).applyMatrix4(item.matrixWorld);
    })

    ammo.forEach(item => {
        vectorAmmoBB.at(enemies.findIndex(element => element == item)).copy(item.geometry.boundingBox).applyMatrix4(item.matrixWorld);
    })
}

function animation(enemy){
    for(var i = 9; i > 0; i--)
        enemies.at(enemy).scale.set(i,i,i);
    scene.remove(enemies.at(enemy));
}

function checkCollisions(){
    let contador2 = 0;
    vectorEnemiesBB.forEach(item => {        
        if(item.intersectsBox(aviaoBB)){
            console.log("bateu");
            
        }    

        let contador = 0;
        
        vectorAmmoBB.forEach(item2 =>{
            if(item.intersectsBox(item2)){
                console.log("toma");
                scene.remove(ammo.at(contador));
                scene.remove(item2);
                animation(contador2);
            }
            contador++;                    
        })        
        contador2++;
    })        
    
}

var trackballControls = new TrackballControls( camera, renderer.domElement );

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
    let x = Math.random()*100;
    if(x >= 98.5)
        createEnemies();
    moveEnemies();   
    atualizaBB();
    checkCollisions();
    keyboardUpdate();
    moveShoot();
    deleteAmmo();
    movePlanes();
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}