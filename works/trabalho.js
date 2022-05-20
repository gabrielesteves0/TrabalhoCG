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
import { AnimationClip, AnimationMixer, Color, ConeBufferGeometry, NumberKeyframeTrack } from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
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

    if(keyboard.pressed("up") && aviao.position.z >= -400)  aviao.translateY(1.5);
    if(keyboard.pressed("down") && aviao.position.z <= 70) aviao.translateY(-1.5);
    if(keyboard.pressed("left") && aviao.position.x >= -180)    aviao.translateX(-1);
    if(keyboard.pressed("right") && aviao.position.x <= 180)   aviao.translateX(1);
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
var killedEnemies = [];

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
let auxAnimationAviao = false;

let target = new THREE.Vector3(0,0,0);

let aviaoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
aviaoBB.setFromObject(aviao);


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
    //let helper = new THREE.Box3Helper( ammoBB, 0xffff00 );
    //scene.add( helper );


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
        if(item.position.z <= -400){
            var indexBullet = ammo.indexOf(item);
            scene.remove(item);
            scene.remove(vectorAmmoBB[indexBullet]);
            ammo.splice(indexBullet, 1);
            vectorAmmoBB.splice(indexBullet, 1);
            //item.userData.consumed = true;
            //item = null;
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

    //let helper = new THREE.Box3Helper( enemiesBB, 0xffff00 );
    //scene.add( helper );

    let positionX = (Math.random() * 185);
    let sinal = (Math.random()*2);
    let velocidade = (Math.random()*4) + 1;
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
        item.translateZ(velocidades[enemies.indexOf(item)]);
        item.updateMatrixWorld(true);
        if(item.position.z >= 150 /* && item != null && !('consumed' in item.userData)*/){
            var indexEnemy = enemies.indexOf(item);
            scene.remove(item);
            scene.remove(vectorEnemiesBB[indexEnemy]);
            enemies.splice(indexEnemy, 1);
            vectorEnemiesBB.splice(indexEnemy, 1);
            velocidades.splice(indexEnemy, 1);
            //item.userData.consumed = true;
            //item = null;
        }
    })
}

function atualizaBB(){
    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    enemies.forEach(inimigo => {
        //if(item != null && !('consumed' in item.userData))
        vectorEnemiesBB.at(enemies.indexOf(inimigo)).copy(inimigo.geometry.boundingBox).applyMatrix4(inimigo.matrixWorld);
    })

    ammo.forEach(tiro => {
        //if(item != null && !('consumed' in item.userData))
        vectorAmmoBB.at(ammo.indexOf(tiro)).copy(tiro.geometry.boundingBox).applyMatrix4(tiro.matrixWorld);
    })
}



function checkCollisions(){
    var aux = new THREE.Mesh();
    vectorEnemiesBB.forEach(item => {
        vectorAmmoBB.forEach(box => {
            if(box.intersectsBox(item) || box.containsBox(item)){
                var indexEnemy = vectorEnemiesBB.indexOf(item);
                var indexBullet = vectorAmmoBB.indexOf(box);
                let enemyCopy = aux.copy(enemies[indexEnemy]);
                killedEnemies.push(enemyCopy);
                scene.remove(box);
                scene.remove(item);
                scene.remove(ammo[indexBullet]);
                scene.remove(enemies[indexEnemy]);
                ammo.splice(indexBullet, 1);
                vectorAmmoBB.splice(indexBullet, 1);
                enemies.splice(indexEnemy, 1);
                vectorEnemiesBB.splice(indexEnemy, 1);
                velocidades.splice(indexEnemy, 1);
            }
        })
        if(item.intersectsBox(aviaoBB) || item.containsBox(aviaoBB)){
            auxAnimationAviao = true;
        }
    })
}

function animationEnemy()
{
    var contador = 0;
    killedEnemies.forEach(item => {
        scene.add(item);
        item.scale.x = item.scale.x - 0.1;
        item.scale.y = item.scale.y - 0.1;
        item.scale.z = item.scale.z - 0.1;
        if(item.scale.x <= 0){
            scene.remove(item);
            killedEnemies.splice(contador, 1);
        }
        contador++;
    })
}


function animationAviao(){
    if(auxAnimationAviao){
        aviao.scale.x = aviao.scale.x - 0.05;
        aviao.scale.y = aviao.scale.y - 0.05;
        aviao.scale.z = aviao.scale.z - 0.05;
        aviao.material.color.setHex(0xff0000);
        if(aviao.scale.x <= 0){
            aviao.position.set(0,10,0);
            auxAnimationAviao = false;
            aviao.scale.x = 1;
            aviao.scale.y = 1;
            aviao.scale.z = 1;
            aviao.material.color.setHex(0xffffff);
        }
    }

}


var trackballControls = new TrackballControls( camera, renderer.domElement );

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
    let x = Math.random()*100;
    if(x >= 95)
        createEnemies();
    moveEnemies();
    atualizaBB();
    checkCollisions();
    keyboardUpdate();
    animationEnemy();
    animationAviao();
    moveShoot();
    deleteAmmo();
    movePlanes();
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}