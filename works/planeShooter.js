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
import Enemies from './class_enemies.js';
import Ammo from '../works/class_ammo.js';


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

}


var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );


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
let aviao = new THREE.Mesh(new THREE.ConeGeometry(2.5, 20, 32), new THREE.MeshPhongMaterial({color:"rgb(255,255,255)", shininess:200}));
aviao.rotateX(degreesToRadians(-90));
aviao.position.set(0, 50, 10);
scene.add(aviao);
aviao.castShadow = true;
//Variável booleana para auxiliar na animação quando o avião colide com algum inimigo. Caso ela seja 'false', o avião não colidiu. Se estiver 'true',
//significa que o avião colidiu com algum inimigo, então a função que executa sua animação atua.
let auxAnimationAviao = false;

//Vetor para auxiliar no direcionamento dos tiros, quando pressionada as teclas 'ctrl' e 'space':
let posicaoAviao = new THREE.Vector3(0,0,0);
//Criação da Box3 (bounding box) do avião:
let aviaoBB = new THREE.Box3();
aviao.geometry.computeBoundingBox(aviaoBB);


//Função que cria os tiros:
function createAmmo(tipo, target){
    let tiro = new Ammo(tipo);
    tiro.object.position.set(target.x, target.y, target.z);
    scene.add(tiro.object);
    vetorTiros.push(tiro);
}

function enemyShoot(){
    vetorInimigos.forEach(item => {
        var x = Math.random()*100;
        if(x >=90){
            item.object.updateMatrixWorld(true);
            let posicaoInimigo = new THREE.Vector3();
            item.object.getWorldPosition(posicaoInimigo);
            if(item.terrestre == true)
                createAmmo("terra-ar", posicaoInimigo);
            else
                createAmmo("inimigo", posicaoInimigo);  
        }
    });
}

//Função que cria os inimigos
function createEnemies(){

    //vertical
    // let enemy = new Enemies("vertical");
    // let positionX = (Math.random() * 185);
    // let positionZ = -350;
    // let sinal = Math.random()*2;
    // if(sinal >= 1)
    //     positionX = positionX * (-1);
    // enemy.object.position.set(positionX, 50, positionZ);

    // vetorInimigos.push(enemy);
    // scene.add(enemy.object);

    //horizontal
    // let enemy = new Enemies("horizontal");
    // let positionX = -250;
    // let positionZ = Math.random()*100 * (-1);
    // enemy.object.position.set(positionX, 50, positionZ);

    //diagonal esquerda
    // let enemy = new Enemies("diagonalEsquerda");
    // let positionX = -195;
    // let positionZ = -300;
    // enemy.object.position.set(positionX, 50, positionZ);

    //diagonal direita
    // let enemy = new Enemies("diagonalDireita");
    // let positionX = 195;
    // let positionZ = -300;
    // enemy.object.position.set(positionX, 50, positionZ);

    //terrestre
    let enemy2 = new Enemies("terrestre");
    let positionX2 = (Math.random() * 185);
    let positionZ2 = -350;
    let sinal2 = Math.random()*2;
    if(sinal2 >= 1)
        positionX2 = positionX2 * (-1);
    enemy2.object.position.set(positionX2, 8, positionZ2);
    enemy2.object.material.color.setHex(0xff0000); 

    scene.add(enemy2.object);
    vetorInimigos.push(enemy2);

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

//Função que move os tiros
function moveShoot(){
    let index = 0;
    vetorTiros.forEach(item => {
        item.object.translateX(item.velocidadeX);
        item.object.translateY(item.velocidadeY);
        item.object.translateZ(item.velocidadeZ);
        item.object.updateMatrixWorld(true);
        if(item.object.position.y >= 50)
            item.resetVelocidadeY();
        //Caso a posição em z seja menor que -400, o item é removido da cena e do seu vetor, assim como seu respectivo Box3.
        if(item.object.position.z <= -400 || item.object.position.y <= -10 || item.object.position.z >= 160){
            scene.remove(item.object);
            scene.remove(item.bBox);
            vetorTiros.splice(index, 1);
        }
        index++;
    });

}

function moveEnemies(){
    let index = 0;
    vetorInimigos.forEach(item => {
        //Translada o inimigo de acordo com sua velocidade, definida aleatoriamente:
        item.object.translateZ(item.velocidadeZ);
        item.object.translateX(item.velocidadeX);
        //Atualiza sua posição em relação ao mundo:
        item.object.updateMatrixWorld(true);
        //Caso a posição em z seja maior que 150, o item é removido da cena e do seu vetor, assim como seu respectivo Box3 e sua velocidade.
        if(item.object.position.z >= 150 || item.object.position.x <= -250 || item.object.position.x >= 250){
            var indexEnemy = vetorInimigos.indexOf(item);
            scene.remove(item.object);
            scene.remove(item.bBox);
            vetorInimigos.splice(index, 1);
            //velocidades.splice(indexEnemy, 1);
        }
        index++;
    })
}

//Função para atualizar a posição das Box3 dos elementos. Basicamente, com isto, as Bounding Boxes se movem junto com seus respectivos objetos.
function atualizaBB(){
    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    vetorInimigos.forEach(item => {
        item.bBox.copy(item.object.geometry.boundingBox).applyMatrix4(item.object.matrixWorld);
    })

    vetorTiros.forEach(item => {
        item.bBox.copy(item.object.geometry.boundingBox).applyMatrix4(item.object.matrixWorld);
    })
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
                    //Adicionando a cópia no vetor:
                    killedEnemies.push(enemyCopy);
                    //Remoção dos itens e suas Box3 da cena:
                    scene.remove(tiro.object);
                    scene.remove(inimigo.object);
                    vetorInimigos.splice(indexEnemy, 1);
                    vetorTiros.splice(indexBullet, 1);
                    //velocidades.splice(indexEnemy, 1);
                }
            }else{
                if(tiro.bBox.intersectsBox(aviaoBB) || tiro.bBox.containsBox(aviaoBB)){
                    auxAnimationAviao = true;
                    scene.remove(tiro.object);
                    vetorTiros.splice(indexBullet, 1);
                }
            }
            indexBullet++;
        })
        //Caso o avião esteja colidindo ou esteja dentro do inimigo, troca a variável booleana de animação do avião para 'true':
        if(inimigo.bBox.intersectsBox(aviaoBB) || inimigo.bBox.containsBox(aviaoBB)){
            auxAnimationAviao = true;
        }
        indexEnemy++;
    })
}

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
    //Chamada das funções no render:
    enemyShoot();
    moveEnemies();
    atualizaBB();
    checkCollisions();
    keyboardUpdate();
    animationEnemy();
    animationAviao();
    moveShoot();
    //movePlanes();
    plane.translateY(-1);
    //moveCamera();
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}