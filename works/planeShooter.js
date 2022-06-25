//Nomes:
//Gabriel Antônio Esteves Matta
//Ticiano de Oliveira Fracette

import * as THREE from  'three';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initDefaultBasicLight,
        onWindowResize,
        createGroundPlaneWired,
        degreesToRadians,
        createLightSphere} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from '../build/jsm/loaders/FBXLoader.js';
import Enemies from './class_enemies.js';
import Ammo from '../works/class_ammo.js';
import Heal from '../works/class_heal.js';


var scene = new THREE.Scene();    // Create main scene
var renderer = new THREE.WebGLRenderer();    // View function in util/utils
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.getElementById("webgl-output").appendChild(renderer.domElement);

//                                  MOVIMENTAÇÃO E CÂMERA:

//Configuração e posicionamento da câmera:
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(3.6, 100, 8.2);
  camera.up.set( 0, 1, 0 );
//initDefaultBasicLight(scene);
//Criação do CameraHolder, e posicionamento no mundo:
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
cameraHolder.translateY(100);
cameraHolder.translateZ(200);
cameraHolder.translateX(5);
cameraHolder.rotateY(degreesToRadians(300));
scene.add(cameraHolder);

//Criação da camera virtual para o viewport
var virtualCamera = new THREE.PerspectiveCamera(45, 300/100, .1, 10);
  virtualCamera.position.set(0, -15, 0);
  virtualCamera.up.set(0, 1, 0);
  virtualCamera.lookAt(0, 0, -15);



function controlledRender(){

    var width = window.innerWidth;
    var height = window.innerHeight;

    // Set main viewport
    renderer.setViewport(0, 0, width, height); // Reset viewport    
    renderer.setScissorTest(false); // Disable scissor to paint the entire window
    renderer.setClearColor("rgb(80, 70, 170)");
    renderer.clear();   // Clean the window
    renderer.render(scene, camera);

    var offset = 30; 
    renderer.setViewport(offset, height-100-offset, 300, 100);
    renderer.setScissor(offset, height-100-offset, 300, 100);
    renderer.setScissorTest(true);
    renderer.setClearColor("rgb(80, 70, 170)");
    // renderer.clear();
    renderer.autoClear = false;
    renderer.render(scene, virtualCamera);
}


//Criação da luz direcional
var lightPosition = new THREE.Vector3(0, 40, 20);
cameraHolder.getWorldPosition(lightPosition);
var lightColor = "rgb(255,255,255)";
var ambientColor = "rgb(50,50,50)";

var lightHolder = new THREE.Object3D();
scene.add(lightHolder);


var lightSphere = createLightSphere(lightHolder, 5, 10, 10, lightPosition);
scene.add(lightSphere);

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
  dirLight.shadow.camera.far = 800;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.right = 200;
  dirLight.shadow.camera.top = 250;
  dirLight.shadow.camera.bottom = -200;

  scene.add(dirLight);
}



//Função KeyboardUpdate, para movimentação do avião:
var keyboard = new KeyboardState();

function keyboardUpdate(){
    keyboard.update();

    if(keyboard.pressed("up") && aviao.position.z >= -345)  aviao.translateY(2);
    if(keyboard.pressed("down") && aviao.position.z <= 120) aviao.translateY(-2);
    if(keyboard.pressed("left") && aviao.position.x >= -190)    aviao.translateX(-2);
    if(keyboard.pressed("right") && aviao.position.x <= 190)   aviao.translateX(2);
    if(keyboard.down("space")){
        aviao.getWorldPosition(posicaoAviao);
        createAmmo("ar-ar", posicaoAviao);
    }
    if(keyboard.down("ctrl")){
        aviao.getWorldPosition(posicaoAviao);
        createAmmo("ar-terra", posicaoAviao);
    }
    if(keyboard.down("G"))  modoInvencivel = !modoInvencivel;
    if(keyboard.down("enter"))  resetaJogo();


}


var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

function resetaJogo(){
    for(let i = 0; i < 3; i++){
        let index = 0;
        vetorCuras.forEach(item => {
            scene.remove(item.object);
            vetorCuras.splice(index, 1);
            index++;
        });
        index = 0;
        vetorInimigos.forEach(item => {
            scene.remove(item.object);
            vetorInimigos.splice(index, 1);
            index++;
        });
        index = 0;
        vetorTiros.forEach(item => {
            scene.remove(item.object);
            vetorTiros.splice(index, 1);
            index++;
        });
    }
    plane.position.set(0, 0, -4000);
    aviao.position.set(0, 50, 10);
    vidas = 0;
    resetaVidas();
}

var vetorTiros = [];
//var planes = [];
var vetorInimigos = [];
var posicoesX = [];
var posicoesY = [];
var posicoesZ = [];

//Vetor para armazenar os inimigos mortos (auxilia na animação dos inimigos quando são atingidos):
var killedEnemies = [];

// Loop que cria os planos
// for(let i=0; i<3; i++){
//     let plane = createGroundPlaneWired(400, 400);
//     scene.add(plane);
//     plane.position.set(0,0,-(400*i));
//     plane.receiveShadow = true;
//     planes.push(plane);
// }

let plane = createGroundPlaneWired(400, 8600);
plane.position.set(0, 0, -4000);
scene.add(plane);

//Função que move os planos
// function movePlanes(){
//     planes.forEach(item => {
//         item.translateY(-1);
//         item.updateMatrixWorld(true);
//         if(item.position.z == 400){
//             item.position.set(0, 0, -800);
//         }
//     })
// }


//                                  MODELAGEM E DINÂMICA:

//Modelagem do avião:



let aviao = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 6), new THREE.MeshPhongMaterial({color:"rgb(255,255,255)", shininess:200}));
aviao.rotateX(degreesToRadians(-90));
aviao.translateY(50);
aviao.position.set(0, 50, 10);
scene.add(aviao);
// aviao.castShadow = true;
let vidas = 5;
let modoInvencivel = false;
let auxAnimationAviao = false;
aviao.material.transparent = true;
aviao.material.opacity = 0;

let posicaoAviao = new THREE.Vector3(0,0,0);
let aviaoBB = new THREE.Box3();
aviao.geometry.computeBoundingBox(aviaoBB);

let modeloAviao;
let loader = new GLTFLoader();

loader.load('../works/assets/plane.glb', function(glb){
    modeloAviao = glb.scene;
    
    modeloAviao.traverse(function(child){
        if(child)
            child.castShadow = true;
    });
    modeloAviao.scale.x += 2.3;
    modeloAviao.scale.y += 2.3;
    modeloAviao.scale.z += 2.3;
    modeloAviao.rotation.x -= 1.6;
    modeloAviao.rotation.z -= Math.PI;
    modeloAviao.position.y -= 2;
    modeloAviao.position.z -= 12;
    aviao.add(modeloAviao);
}, null, null);

let vetorVidas = [];

for(let i = 0; i < 5; i++){
    let bolinha = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 32), 
     new THREE.MeshLambertMaterial({color: 0xff0000}));
    if(i == 0)
        bolinha.position.set(-6, -8.6, -7);
    else if(i == 1)
        bolinha.position.set(-3, -8.6, -7);
    else if(i == 2)
        bolinha.position.set(0, -8.6, -7);
    else if(i == 3)
        bolinha.position.set(3, -8.6, -7);
    else
        bolinha.position.set(6, -8.6, -7);
    scene.add(bolinha);
    vetorVidas.push(bolinha);
}

function perdeVida(){
    if(vidas >= 0)
        scene.remove(vetorVidas.at(vidas));
}

function ganhaVida(){
    scene.add(vetorVidas.at(vidas));
}

function resetaVidas(){
        if(vidas <= 0){
            vidas = 5;
            for(let i=0; i<5; i++)
                scene.add(vetorVidas.at(i));
        }
    }


//Função que cria os tiros:
function createAmmo(tipo, target, distx, distz){
    let tiro;
    aviao.updateMatrixWorld(true);
    if(tipo == "terra-ar"){
        tiro = new Ammo(tipo, distx, distz);
        // tiro.object.rotateX(degreesToRadians(135));
        if(aviao.position.x < target.x)
            tiro.inverteVelocidadeX();
    }else
        tiro = new Ammo(tipo, 0, 0);
        // tiro.object.rotateX(degreesToRadians(90));
    tiro.object.position.set(target.x, target.y, target.z);
    scene.add(tiro.object);
    vetorTiros.push(tiro);
}

function enemyShoot(){
    vetorInimigos.forEach(item => {
        var x = Math.random()*100;
        if(x >=99){
            item.object.updateMatrixWorld(true);
            let posicaoInimigo = new THREE.Vector3();
            item.object.getWorldPosition(posicaoInimigo);
            aviao.updateMatrixWorld(true);
            let pos = new THREE.Vector3();
            aviao.getWorldPosition(pos);
            if(posicaoInimigo.z < 10){
                let distx = Math.abs(pos.x - item.object.position.x);
                let distz = Math.abs(pos.z - item.object.position.z);
                if(item.terrestre == true)
                    createAmmo("terra-ar", posicaoInimigo, distx, distz);
                else
                    createAmmo("inimigo", posicaoInimigo, 0, 0);
            }
        }
    });
}

//Função que cria os inimigos
function createEnemies(){

    //vertical
    let enemy = new Enemies("vertical", "fighter");
    let positionX = (Math.random() * 175);
    let positionZ = -350;
    let sinal = Math.random()*2;
    if(sinal >= 1)
        positionX = positionX * (-1);
    // enemy.object.position.set(positionX, 50, positionZ);
    enemy.object.position.set(0, 20, 0);
    enemy.object.material.transparent = true;
    enemy.object.material.opacity = 0.3;

    vetorInimigos.push(enemy);
    scene.add(enemy.object);

    setModeloInimigo('../works/assets/fighter.glb', enemy.object);
    // setModeloInimigo('../works/assets/enemyPlane.fbx', enemy.object);
    // setModeloInimigo('../works/assets/jetPlane.fbx', enemy.object);
    // setModeloInimigo('../works/assets/helicopter.fbx', enemy.object);

    //horizontal
    // let enemy = new Enemies("horizontal", "fighter");
    // let positionX = -250;
    // let positionZ = Math.random()*100 * (-1);
    // enemy.object.position.set(positionX, 50, positionZ);

    // enemy.object.material.transparent = true;
    // enemy.object.material.opacity = 0;
    // enemy.object.rotation.y += Math.PI/2;

    // vetorInimigos.push(enemy);
    // scene.add(enemy.object);

    // // setModeloInimigo('../works/assets/fighter.glb', enemy.object);


    //diagonal esquerda
    // let enemy = new Enemies("diagonalEsquerda", "fighter");
    // let positionX = -195;
    // let positionZ = -300;
    // enemy.object.position.set(positionX, 50, positionZ);

    // enemy.object.material.transparent = true;
    // enemy.object.material.opacity = 0;
    // enemy.object.rotation.y += 0.698132;

    // vetorInimigos.push(enemy);
    // scene.add(enemy.object);

    // setModeloInimigo('../works/assets/fighter.glb', enemy.object);


    //diagonal direita
    // let enemy = new Enemies("diagonalDireita", "fighter");
    // let positionX = 195;
    // let positionZ = -300;
    // enemy.object.position.set(positionX, 50, positionZ);

    // enemy.object.material.transparent = true;
    // enemy.object.material.opacity = 0;
    // enemy.object.rotation.y -= 0.698132;

    // vetorInimigos.push(enemy);
    // scene.add(enemy.object);

    // setModeloInimigo('../works/assets/fighter.glb', enemy.object);

    //terrestre
    // let enemy2 = new Enemies("terrestre", "toonTank");
    // let positionX2 = (Math.random() * 175);
    // let positionZ2 = -350;
    // let sinal2 = Math.random()*2;
    // if(sinal2 >= 1)
    //     positionX2 = positionX2 * (-1);
    // enemy2.object.position.set(positionX2, 8, positionZ2);
    // // enemy2.object.position.set(0, 20, 0);
    // enemy2.object.material.transparent = true;
    // enemy2.object.material.opacity = 0;

    // scene.add(enemy2.object);
    // vetorInimigos.push(enemy2);

    // setModeloInimigo('../works/assets/toonTank.glb', enemy2.object);

    //meia-lua
    // let enemy3 = new Enemies("meia-lua", "fighter");
    // let positionX = -195;
    // let positionZ = -300;
    // enemy3.object.position.set(positionX, 50, positionZ);

    // enemy3.object.material.transparent = true;
    // enemy3.object.material.opacity = 0;

    // vetorInimigos.push(enemy3);
    // scene.add(enemy3.object);

    // setModeloInimigo('../works/assets/fighter.glb', enemy3.object);



}

function setModeloInimigo(modelo, objeto){
    let modeloInimigo;
    let loader = new GLTFLoader();
    let loader2 = new FBXLoader();
    if(modelo == '../works/assets/fighter.glb'){
        loader.load(modelo, function(glb){
            modeloInimigo = glb.scene;
            
            modeloInimigo.traverse(function(child){
                if(child)
                    child.castShadow = true;
            });
            modeloInimigo.scale.x += 2.6;
            modeloInimigo.scale.y += 2.6;
            modeloInimigo.scale.z += 2.6;
            modeloInimigo.rotation.x -= 1.6;
            modeloInimigo.rotation.z -= Math.PI;
            objeto.add(modeloInimigo);
        }, null, null);
    }else if(modelo == '../works/assets/helicopter.fbx'){
        loader2.load(modelo, (object) => {
            modeloInimigo = fbx.scene;
            
            modeloInimigo.traverse(function(child){
                if(child)
                    child.castShadow = true;
            });
            modeloInimigo.scale.x += 1.2;
            modeloInimigo.scale.y += 1.2;
            modeloInimigo.scale.z += 1.2;
            modeloInimigo.rotation.y += Math.PI/2;
            objeto.add(modeloInimigo);
        }, null, null);
    }else if(modelo == '../works/assets/enemyPlane.fbx'){
        loader2.load(modelo, function(fbx){
            modeloInimigo = fbx.scene;
            
            modeloInimigo.traverse(function(child){
                if(child)
                    child.castShadow = true;
            });
            modeloInimigo.scale.x += 2.3;
            modeloInimigo.scale.y += 2.3;
            modeloInimigo.scale.z += 2.3;
            modeloInimigo.position.y -= 4;
            objeto.add(modeloInimigo);
        }, null, null);
    }else{
        loader2.load(modelo, function(fbx){
            modeloInimigo = fbx.scene;
            
            modeloInimigo.traverse(function(child){
                if(child)
                    child.castShadow = true;
            });
            modeloInimigo.scale.x += 16;
            modeloInimigo.scale.y += 16;
            modeloInimigo.scale.z += 16;
            objeto.add(modeloInimigo);
        }, null, null);
    }
    
}



//Função que anima os inimigos mortos:
function animationEnemy()
{
    //Contador para guardar a posição (index) do elemento
    var contador = 0;
    //Percorre o vetor auxiliar killedEnemies (inimigos mortos):
    killedEnemies.forEach(item => {
        //Adiciona o elemento na cena (O elemento é uma cópia do original):
        scene.add(item);
        //Diminui a escala em x,y e z da cópia:
        item.scale.x = item.scale.x - 0.1;
        item.scale.y = item.scale.y - 0.1;
        item.scale.z = item.scale.z - 0.1;
        //Quando a escala for menor que zero, remove o item da cena e do vetor auxiliar killedEnemies:
        if(item.scale.x <= 0){
            scene.remove(item);
            killedEnemies.splice(contador, 1);
        }
        contador++;
    })
}


//Função que anima o avião quando colide com um inimigo:
function animationAviao(){
    //Se a variável booleana for true, executa a função propriamente:
    if(auxAnimationAviao){
        //Redução da escala do avião:
        aviao.scale.x = aviao.scale.x - 0.05;
        aviao.scale.y = aviao.scale.y - 0.05;
        aviao.scale.z = aviao.scale.z - 0.05;
        //Troca de cor (para vermelho):
        aviao.material.color.setHex(0xff0000);
        //Quando a escala for menor que zero, reseta a posição, a escala e a cor, além de alterar a variável booleana para false:
        if(aviao.scale.x <= 0){
            aviao.position.set(0,50,10);
            auxAnimationAviao = false;
            aviao.scale.x = 1;
            aviao.scale.y = 1;
            aviao.scale.z = 1;
            aviao.material.color.setHex(0xffffff);
        }
    }

}

//                                  SISTEMA DE TIRO E COLISÃO:




//Função para atualizar a posição das Box3 dos elementos. Basicamente, com isto, as Bounding Boxes se movem junto com seus respectivos objetos.
function atualizaBB(){
    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    vetorInimigos.forEach(item => {
        item.bBox.copy(item.object.geometry.boundingBox).applyMatrix4(item.object.matrixWorld);
    });

    vetorTiros.forEach(item => {
        item.bBox.copy(item.object.geometry.boundingBox).applyMatrix4(item.object.matrixWorld);
    });

    vetorCuras.forEach(item => {
        item.bBox.copy(item.object.geometry.boundingBox).applyMatrix4(item.object.matrixWorld);
    })
}

let vetorCuras = [];

function createHealObject(){
    let cura = new Heal();
    let posicaoX = Math.random()*175;
    let sinal = Math.random()*2;
    if(sinal > 1){
        posicaoX = posicaoX * (-1);
    }
    cura.object.translateZ(-300);
    cura.object.translateY(50);
    cura.object.translateX(posicaoX);
    scene.add(cura.object);
    vetorCuras.push(cura);
}


function moveObjects(){
    let index = 0;
    vetorCuras.forEach(item => {
        item.object.translateZ(item.velocidade);
        item.object.updateMatrixWorld(true);
        if(item.object.position.z >= 150){
            scene.remove(item.object);
            vetorCuras.splice(index, 1);
        }
        index++;
    });

    index = 0;
    
    vetorInimigos.forEach(item => {
        //Translada o inimigo de acordo com sua velocidade, definida aleatoriamente:
        item.object.translateZ(item.velocidadeZ);
        item.object.translateX(item.velocidadeX);
        //Atualiza sua posição em relação ao mundo:
        item.object.updateMatrixWorld(true);
        if(item.meiaLua == true )
            item.atualizacaoVelocidadeMeiaLua(item.object.position.x);
        //Caso a posição em z seja maior que 150, o item é removido da cena e do seu vetor, assim como seu respectivo Box3 e sua velocidade.
        if(item.object.position.z >= 150 || item.object.position.x <= -250 || item.object.position.x >= 250){
            scene.remove(item.object);
            vetorInimigos.splice(index, 1);
        }
        index++;
    });

    index = 0;
    vetorTiros.forEach(item => {
        item.object.translateX(item.velocidadeX);
        item.object.translateY(item.velocidadeY);
        item.object.translateZ(item.velocidadeZ);
        item.object.updateMatrixWorld(true);
        if(item.object.position.y >= 50 && item.terraAr){
            item.resetVelocidadeY();
        }
        //Caso a posição em z seja menor que -400, o item é removido da cena e do seu vetor, assim como seu respectivo Box3.
        if(item.object.position.z <= -400 || item.object.position.y <= -10 || item.object.position.z >= 160){
            scene.remove(item.object);
            vetorTiros.splice(index, 1);
        }
        index++;
    });

}


//Função que checa colisões na cena:
function checkCollisions(){
    let indexEnemy = 0;
    let indexBullet = 0;
    var meshCopia = new THREE.Mesh();
    //Percorrendo o vetor de Box3 dos inimigos:
    vetorInimigos.forEach(inimigo => {  //->item
        //Percorrendo o vetor de Box3 dos tiros:
        vetorTiros.forEach(tiro => { //->box
            //Caso o Box3 do tiro esteja colidindo ou esteja dentro do inimigo:
            if(tiro.inimigo == false){
                if(tiro.bBox.intersectsBox(inimigo.bBox) || tiro.bBox.containsBox(inimigo.bBox)){
                    let enemyCopy = meshCopia.copy(vetorInimigos[indexEnemy].object);
                    killedEnemies.push(enemyCopy);
                    scene.remove(tiro.object);
                    scene.remove(inimigo.object);
                    vetorInimigos.splice(indexEnemy, 1);
                    vetorTiros.splice(indexBullet, 1);
                }
            }else{
                if((tiro.bBox.intersectsBox(aviaoBB) || tiro.bBox.containsBox(aviaoBB)) && !modoInvencivel){
                    if(tiro.terraAr){
                        vidas--;
                        perdeVida();
                        vidas--;
                        perdeVida();
                    }else
                        vidas--;
                        perdeVida();
                    scene.remove(tiro.object);
                    vetorTiros.splice(indexBullet, 1);
                    if(vidas <= 0){
                        auxAnimationAviao = true;
                        resetaJogo();
                    }
                }
            }
            indexBullet++;
        });
        //Caso o avião esteja colidindo ou esteja dentro do inimigo, troca a variável booleana de animação do avião para 'true':
        if((inimigo.bBox.intersectsBox(aviaoBB) || inimigo.bBox.containsBox(aviaoBB)) && !modoInvencivel){
            vidas--;
            perdeVida();
            vidas--;
            perdeVida();
            if(vidas <= 0){
                auxAnimationAviao = true;
                resetaJogo();
            }else{
                let enemyCopy = meshCopia.copy(vetorInimigos[indexEnemy].object);
                killedEnemies.push(enemyCopy);
                scene.remove(inimigo.object);
                vetorInimigos.splice(indexEnemy, 1);
            }
        }
        indexEnemy++;
    });
    let index = 0;
    vetorCuras.forEach(cura =>{
        if(cura.bBox.intersectsBox(aviaoBB) || cura.bBox.containsBox(aviaoBB)){
            if(vidas < 5){
                ganhaVida();
                vidas++;
            }
            scene.remove(cura.object);
            vetorCuras.splice(index, 1);
        }
        index++;
    });
}

// createEnemies();

var trackballControls = new TrackballControls( camera, renderer.domElement );

window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

render();
function render()
{
    //Criação de um numero aleatório entre 0 e 100:
    let x = Math.random()*100;
    //Caso seja maior que 95, cria um inimigo aleatoriamente:
    if(x >= 98.5)
        createEnemies();
    let y = Math.random()*100;
    if(y >= 99)
        createHealObject();
    //Chamada das funções no render:
 
    enemyShoot();
    moveObjects();
    atualizaBB();
    checkCollisions();
    keyboardUpdate();
    animationEnemy();
    animationAviao();
    resetaVidas();
    plane.translateY(-1);
    controlledRender();
    trackballControls.update();
    requestAnimationFrame(render);
    //renderer.render(scene, camera) // Render scene
}