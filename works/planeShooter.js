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
import {default as Enemies} from '../works/class_enemies.js';
import {default as Ammo} from '../works/class_ammo.js';

// export {scene};

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
  dirLight.shadow.camera.far = 500;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.right = 200;
  dirLight.shadow.camera.top = 50;
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
    if(keyboard.down("space") | keyboard.down("ctrl"))       createAmmo();

}


var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

//Vetores para auxiliar no controle das munições, planos, inimigos e bounding boxes:
// //Vetor para armazenar os tiros:
var vetorTiros = [];
//Vetor para armazenar os planos:
var planes = [];
// //Vetor para armazenar os inimigos:
var vetorInimigos = [];
// //Vetor para armazenar as velocidades de cada inimigo:
var velInimigos = [];

var velTiros = [];
// //Vetor para armazenar as Box3 dos inimigos:
var vectorEnemiesBB = [];
// //Vetor para armazenar as Box3 dos tiros:
var vectorAmmoBB = [];
//Vetor para armazenar os inimigos mortos (auxilia na animação dos inimigos quando são atingidos):
var killedEnemies = [];

// Loop que cria os planos
for(let i=0; i<3; i++){
    let plane = createGroundPlaneWired(400, 400);
    scene.add(plane);
    plane.position.set(0,0,-(400*i));
    plane.receiveShadow = true;
    planes.push(plane);
}

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


//                                  MODELAGEM E DINÂMICA:

//Modelagem do avião:
let aviao = new THREE.Mesh(new THREE.ConeGeometry(2.5, 20, 32), new THREE.MeshPhongMaterial({color:"rgb(255,255,255)", shininess:200}));
aviao.rotateX(degreesToRadians(-90));
aviao.translateZ(10);
scene.add(aviao);
aviao.castShadow = true;
//Variável booleana para auxiliar na animação quando o avião colide com algum inimigo. Caso ela seja 'false', o avião não colidiu. Se estiver 'true',
//significa que o avião colidiu com algum inimigo, então a função que executa sua animação atua.
let auxAnimationAviao = false;

//Vetor para auxiliar no direcionamento dos tiros, quando pressionada as teclas 'ctrl' e 'space':
let target = new THREE.Vector3(0,0,0);
//Criação da Box3 (bounding box) do avião:
let aviaoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
aviaoBB.setFromObject(aviao);


//Função que cria os tiros:
function createAmmo(){
    //Modelagem dos tiros:
    aviao.getWorldPosition(target);
    let aux = new Ammo("ar-ar");
    let shoot = new THREE.Mesh(new THREE.SphereGeometry(1, 0, 0), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    shoot.position.set(target.x, target.y, target.z);
    //Criação das Box3 (bounding boxes) dos tiros:
    let ammoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    ammoBB.setFromObject(shoot);
    scene.add(ammoBB);
    //Aqui, colocamos as coordenadas do avião no vetor target (criado anteriormente), e então, a partir dele, definimos a posição inicial do tiro.
    scene.add(shoot);
    vetorTiros.push(shoot);
    velTiros.push(aux);
    vectorAmmoBB.push(ammoBB);
}

//Função que cria os inimigos
function createEnemies(){
    //Modelagem dos tiros:
    let enemy = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    enemy.castShadow = true;
    //Criação das Box3 (bounding boxes) dos inimigos:
    let enemiesBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    enemiesBB.setFromObject(enemy);
    scene.add(enemiesBB);
    //Criação das Box3 (bounding boxes) dos inimigos:
    let aux = new Enemies("terrestre");
    enemy.position.set(aux.getPositionX(), aux.getPositionY(), aux.getPositionZ());
    scene.add(enemy);
    vetorInimigos.push(enemy);
    vectorEnemiesBB.push(enemiesBB);
    velInimigos.push(aux);
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
            aviao.position.set(0,10,0);
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
    vetorTiros.forEach(item => {
        // item.translateX(velTiros.at(ammo.indexOf(item)).getVelocidadeX);
        // item.translateY(velTiros.at(ammo.indexOf(item)).getVelocidadeY);
        item.translateZ(velTiros.at(vetorTiros.indexOf(item)).getVelocidadeZ);
        
    });

}

//Função que deleta os tiros
function deleteAmmo(){
    //Percorre o vetor de tiros:
    vetorTiros.forEach(item => {
        //Atualiza a posição no mundo do tiro:
        item.updateMatrixWorld(true);
        //Caso a posição em z seja menor que -400, o item é removido da cena e do seu vetor, assim como seu respectivo Box3.
        if(item.position.z <= -400){
            var indexBullet = vetorTiros.indexOf(item);
            scene.remove(item);
            scene.remove(vectorAmmoBB[indexBullet]);
            vetorTiros.splice(indexBullet, 1);
            vectorAmmoBB.splice(indexBullet, 1);
            velTiros.splice(indexBullet, 1);
        }
    })
}



//Função que move os inimigos
function moveEnemies(){
    //Percorre o vetor de inimigos:
    vetorInimigos.forEach(item => {
        //Translada o inimigo de acordo com sua velocidade, definida aleatoriamente:
        item.translateX(velInimigos[vetorInimigos.indexOf(item)].getVelocidadeX());
        item.translateZ(velInimigos[vetorInimigos.indexOf(item)].getVelocidadeZ());
        //Atualiza sua posição em relação ao mundo:
        item.updateMatrixWorld(true);
        //Caso a posição em z seja maior que 150, o item é removido da cena e do seu vetor, assim como seu respectivo Box3 e sua velocidade.
        if(item.position.z >= 150){
            var indexEnemy = vetorInimigos.indexOf(item);
            scene.remove(item);
            scene.remove(vectorEnemiesBB[indexEnemy]);
            vetorInimigos.splice(indexEnemy, 1);
            vectorEnemiesBB.splice(indexEnemy, 1);
            velInimigos.splice(indexEnemy, 1);
        }
    })
}

//Função para atualizar a posição das Box3 dos elementos. Basicamente, com isto, as Bounding Boxes se movem junto com seus respectivos objetos.
function atualizaBB(){
    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    vetorInimigos.forEach(inimigo => {
        vectorEnemiesBB.at(vetorInimigos.indexOf(inimigo)).copy(inimigo.geometry.boundingBox).applyMatrix4(inimigo.matrixWorld);
    })

    vetorTiros.forEach(tiro => {
        vectorAmmoBB.at(vetorTiros.indexOf(tiro)).copy(tiro.geometry.boundingBox).applyMatrix4(tiro.matrixWorld);
    })
}


//Função que checa colisões na cena:
function checkCollisions(){
    //Mesh auxiliar
    var meshCopia = new THREE.Mesh();
    //Percorrendo o vetor de Box3 dos inimigos:
    vectorEnemiesBB.forEach(item => {
        //Percorrendo o vetor de Box3 dos tiros:
        vectorAmmoBB.forEach(box => {
            //Caso o Box3 do tiro esteja colidindo ou esteja dentro do inimigo:
            if(box.intersectsBox(item) || box.containsBox(item)){
                //Variáveis com os indexes do inimigo e do tiro:
                var indexEnemy = vectorEnemiesBB.indexOf(item);
                var indexBullet = vectorAmmoBB.indexOf(box);
                //Criação de uma cópia do inimigo morto (para a função de animação):
                let enemyCopy = meshCopia.copy(vetorInimigos[indexEnemy]);
                //Adicionando a cópia no vetor:
                killedEnemies.push(enemyCopy);
                //Remoção dos itens e suas Box3 da cena:
                scene.remove(box);
                scene.remove(item);
                scene.remove(vetorTiros[indexBullet]);
                scene.remove(vetorInimigos[indexEnemy]);
                //Remoção dos itens, suas Box3 e velocidades de seus vetores:
                vetorTiros.splice(indexBullet, 1);
                vectorAmmoBB.splice(indexBullet, 1);
                velTiros.splice(indexBullet, 1);
                vetorInimigos.splice(indexEnemy, 1);
                vectorEnemiesBB.splice(indexEnemy, 1);
                velInimigos.splice(indexEnemy, 1);
            }
        })
        //Caso o avião esteja colidindo ou esteja dentro do inimigo, troca a variável booleana de animação do avião para 'true':
        if(item.intersectsBox(aviaoBB) || item.containsBox(aviaoBB)){
            auxAnimationAviao = true;
        }
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
    if(x >= 95)
        createEnemies();
    //Chamada das funções no render:
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