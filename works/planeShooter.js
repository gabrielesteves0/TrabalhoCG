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
        degreesToRadians} from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';

var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils


//                                  MOVIMENTAÇÃO E CÂMERA:

//Configuração e posicionamento da câmera:
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(3.6, 100, 8.2);
  camera.up.set( 0, 1, 0 );
initDefaultBasicLight(scene);
//Criação do CameraHolder, e posicionamento no mundo:
var cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);
cameraHolder.translateY(100);
cameraHolder.translateZ(200);
cameraHolder.translateX(5);
cameraHolder.rotateY(degreesToRadians(300));
scene.add(cameraHolder);

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
//Vetor para armazenar os tiros:
var ammo = [];
//Vetor para armazenar os planos:
var planes = [];
//Vetor para armazenar os inimigos:
var enemies = [];
//Vetor para armazenar as velocidades de cada inimigo:
var velocidades = [];
//Vetor para armazenar as Box3 dos inimigos:
var vectorEnemiesBB = [];
//Vetor para armazenar as Box3 dos tiros:
var vectorAmmoBB = [];
//Vetor para armazenar os inimigos mortos (auxilia na animação dos inimigos quando são atingidos):
var killedEnemies = [];

// Loop que cria os planos
for(let i=0; i<3; i++){
    let plane = createGroundPlaneWired(400, 400);
    scene.add(plane);
    plane.position.set(0,0,-(400*i));
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
let aviao = new THREE.Mesh(new THREE.ConeGeometry(2.5, 20, 32), new THREE.MeshLambertMaterial(255,0,0));
aviao.rotateX(degreesToRadians(-90));
aviao.translateZ(10);
scene.add(aviao);
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
    let shoot = new THREE.Mesh(new THREE.SphereGeometry(1, 0, 0), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    //Criação das Box3 (bounding boxes) dos tiros:
    let ammoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    ammoBB.setFromObject(shoot);
    vectorAmmoBB.push(ammoBB);
    //Aqui, colocamos as coordenadas do avião no vetor target (criado anteriormente), e então, a partir dele, definimos a posição inicial do tiro.
    aviao.getWorldPosition(target);
    shoot.position.set(target.x, target.y, target.z);
    scene.add(shoot);
    ammo.push(shoot);
}

//Função que cria os inimigos
function createEnemies(){
    //Modelagem dos inimigos:
    let enemy = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    //Criação das Box3 (bounding boxes) dos inimigos:
    let enemiesBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    enemiesBB.setFromObject(enemy);
    vectorEnemiesBB.push(enemiesBB);
    //Aqui, utilizamos a função Math.random() para gerar um valor aleatório entre 0 e 185, que será a coordenada em X do inimigo:
    let positionX = (Math.random() * 185);
    //Esta variável serve para trocar aleatoriamente o sinal da posição X do inimigo, para que os mesmos apareçam por todo o plano.
    let sinal = (Math.random()*2);
    //Gerando o valor da velocidade do inimigo aleatoriamente:
    let velocidade = (Math.random()*5) + 3;
    //Troca de sinal:
    if(sinal >= 1)
        positionX = positionX * (-1);
    enemy.position.set(positionX, 10, -500);
    scene.add(enemy);
    enemies.push(enemy);
    velocidades.push(velocidade);
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
    ammo.forEach(item => {
        item.translateZ(-5);
    });

}

//Função que deleta os tiros
function deleteAmmo(){
    //Percorre o vetor de tiros:
    ammo.forEach(item => {
        //Atualiza a posição no mundo do tiro:
        item.updateMatrixWorld(true);
        //Caso a posição em z seja menor que -400, o item é removido da cena e do seu vetor, assim como seu respectivo Box3.
        if(item.position.z <= -400){
            var indexBullet = ammo.indexOf(item);
            scene.remove(item);
            scene.remove(vectorAmmoBB[indexBullet]);
            ammo.splice(indexBullet, 1);
            vectorAmmoBB.splice(indexBullet, 1);
        }
    })
}



//Função que move os inimigos
function moveEnemies(){
    //Percorre o vetor de inimigos:
    enemies.forEach(item => {
        //Translada o inimigo de acordo com sua velocidade, definida aleatoriamente:
        item.translateZ(velocidades[enemies.indexOf(item)]);
        //Atualiza sua posição em relação ao mundo:
        item.updateMatrixWorld(true);
        //Caso a posição em z seja maior que 150, o item é removido da cena e do seu vetor, assim como seu respectivo Box3 e sua velocidade.
        if(item.position.z >= 150){
            var indexEnemy = enemies.indexOf(item);
            scene.remove(item);
            scene.remove(vectorEnemiesBB[indexEnemy]);
            enemies.splice(indexEnemy, 1);
            vectorEnemiesBB.splice(indexEnemy, 1);
            velocidades.splice(indexEnemy, 1);
        }
    })
}

//Função para atualizar a posição das Box3 dos elementos. Basicamente, com isto, as Bounding Boxes se movem junto com seus respectivos objetos.
function atualizaBB(){
    aviaoBB.copy(aviao.geometry.boundingBox).applyMatrix4(aviao.matrixWorld);

    enemies.forEach(inimigo => {
        vectorEnemiesBB.at(enemies.indexOf(inimigo)).copy(inimigo.geometry.boundingBox).applyMatrix4(inimigo.matrixWorld);
    });

    ammo.forEach(tiro => {
        vectorAmmoBB.at(ammo.indexOf(tiro)).copy(tiro.geometry.boundingBox).applyMatrix4(tiro.matrixWorld);
    });
}


//Função que checa colisões na cena:
function checkCollisions(){
    //Mesh auxiliar
    var aux = new THREE.Mesh();
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
                let enemyCopy = aux.copy(enemies[indexEnemy]);
                //Adicionando a cópia no vetor:
                killedEnemies.push(enemyCopy);
                //Remoção dos itens e suas Box3 da cena:
                scene.remove(box);
                scene.remove(item);
                scene.remove(ammo[indexBullet]);
                scene.remove(enemies[indexEnemy]);
                //Remoção dos itens, suas Box3 e velocidades de seus vetores:
                ammo.splice(indexBullet, 1);
                vectorAmmoBB.splice(indexBullet, 1);
                enemies.splice(indexEnemy, 1);
                vectorEnemiesBB.splice(indexEnemy, 1);
                velocidades.splice(indexEnemy, 1);
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