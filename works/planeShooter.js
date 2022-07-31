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
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import Enemies from './class_enemies.js';
import Ammo from '../works/class_ammo.js';
import Heal from '../works/class_heal.js';
import SpriteExplosion from './spriteExplosion.js';
import { Water } from './assets/water/Water2.js';

// Status (FPS)
const stats = new Stats();
document.getElementById("webgl-output").appendChild(stats.domElement);

var scene = new THREE.Scene();    // Create main scene
var renderer = new THREE.WebGLRenderer();    // View function in util/utils
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.getElementById("webgl-output").appendChild(renderer.domElement);

//                                  MOVIMENTAÇÃO E CÂMERA:


//Função KeyboardUpdate, para movimentação do avião:
var keyboard = new KeyboardState();

var cdrMissil = false;
var cdrTiro = false;
var play = true;

function keyboardUpdate(){
    keyboard.update();
    if(keyboard.down("P"))  play = !play;
    
    if(play){
        if(keyboard.pressed("up") && aviao.position.z >= -210)  aviao.translateY(2);
        if(keyboard.pressed("down") && aviao.position.z <= 135) aviao.translateY(-2);
        if(keyboard.pressed("left") && aviao.position.x >= -190){
            aviao.translateX(-2);
            rotacaoAviao("esquerda");
        }
        if(keyboard.pressed("right") && aviao.position.x <= 190){
            aviao.translateX(2);
            rotacaoAviao("direita");
        }
        if(!keyboard.pressed("right") && !keyboard.pressed("left")){
            if(aviao.rotation.y > 0){
                aviao.rotateY(degreesToRadians(-16));
            }else if(aviao.rotation.y < 0){
                aviao.rotateY(degreesToRadians(16));
            }
        }
        if(keyboard.down("ctrl")){
            aviao.getWorldPosition(posicaoAviao);
            createAmmo("ar-ar", posicaoAviao, 0, 0);
        }else if(keyboard.pressed("ctrl") && !cdrTiro){
            aviao.getWorldPosition(posicaoAviao);
            createAmmo("ar-ar", posicaoAviao, 0, 0);
            cdrTiro = true;
            setTimeout( () => cdrTiro = false, 500);
        }
        if(keyboard.down("space")){
            aviao.getWorldPosition(posicaoAviao);
            createAmmo("ar-terra", posicaoAviao, 0, 0);
        }else if(keyboard.pressed("space") && !cdrMissil){
            aviao.getWorldPosition(posicaoAviao);
            createAmmo("ar-terra", posicaoAviao, 0, 0);
            cdrMissil = true;
            setTimeout( () => cdrMissil = false, 500);
        }
        
        if(keyboard.down("G"))  modoInvencivel = !modoInvencivel;
        if(keyboard.down("enter"))  resetaJogo();
    }
}

function moveObjects(){
    let index = 0;
    vetorCuras.forEach(item => {
        item.object.translateZ(item.velocidade);
        item.object.updateMatrixWorld(true);
        if(item.object.position.z >= 380){
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
        
        if(item.meiaLua == true )
            item.atualizacaoVelocidadeMeiaLua(item.object.position.x);
        //Atualiza sua posição em relação ao mundo:
        item.object.updateMatrixWorld(true);
        
        //Caso a posição em z seja maior que 150, o item é removido da cena e do seu vetor, assim como seu respectivo Box3 e sua velocidade.
        if(item.object.position.z >= 310 || item.object.position.x <= -250 || item.object.position.x >= 250){
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
        if(item.terraAr)
            item.object.rotation.z -= 0.06;
        item.object.updateMatrixWorld(true);
        if(item.object.position.y >= 50 && item.terraAr){
            item.resetVelocidadeY();
        }
        //Caso a posição em z seja menor que -400, o item é removido da cena e do seu vetor, assim como seu respectivo Box3.
        if(item.object.position.z <= -400 || item.object.position.y <= -10 || item.object.position.z >= 230){
            scene.remove(item.object);
            vetorTiros.splice(index, 1);
        }
        index++;
    });

    vetorPlanos.forEach(item => {
        item.position.z += 1;        
        if(item.position.z == 500)
            item.position.set(0, 0, -1500);
    });

    vetorWater.forEach(item => {
        item.position.z += 1;
        if(item.position.z == 500)
            item.position.set(0, 10, -1500);
    });

    index = 1;
    vetorParedes.forEach(item => {
        item.position.z += 1;
        if(item.position.z == 500 && index % 2 != 0)
        {
            item.position.set(-200, 0, -1500);
            index++;
        }            
        if(item.position.z == 500 && index % 2 == 0)
        {
            item.position.set(200, 0, -1500);
            index++;
        }   
    });

    index = 1;
    vetorGramas.forEach(item => {
        item.position.z += 1;
        if(item.position.z == 500 && index % 2 != 0)
        {
            item.position.set(-380, 50, -1500);
            index++;
        }            
        if(item.position.z == 500 && index % 2 == 0)
        {
            item.position.set(380, 50, -1500);
            index++;
        }   
    });
}


//Configuração e posicionamento da câmera:
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(3.6, 100, 8.2);
  camera.up.set( 0, 1, 0 );

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
scene.add(ambientLight);

var dirLight = new THREE.DirectionalLight(lightColor);
setDirectionalLighting(lightPosition);

function setDirectionalLighting(position)
{
  dirLight.position.copy(position);
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;
  dirLight.castShadow = true;

  dirLight.shadow.camera.near = .1;
  dirLight.shadow.camera.far = 570;
  dirLight.shadow.camera.left = -210;
  dirLight.shadow.camera.right = 210;
  dirLight.shadow.camera.top = 170;
  dirLight.shadow.camera.bottom = -80;

  scene.add(dirLight);
}

var vetorTiros = [];
var vetorInimigos = [];
var vetorPlanos = [];
var vetorWater = [];
var vetorParedes = [];
var vetorGramas = [];
//Vetor para armazenar os inimigos mortos (auxilia na animação dos inimigos quando são atingidos):
var killedEnemies = [];

const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 3,
    flowY: 3
};

//Cria o plano
for(let i = 0; i < 4; i++){
    let plane = createPlano();
    plane.rotateX(degreesToRadians(90));
    plane.position.set(0, 0, i*-500);
    // plane.position.set(0, 0, -1870);
    scene.add(plane);
    vetorPlanos.push(plane);
    // let plane = createGroundPlaneWired(400, 11000);
    // plane.position.set(0, 0, -1870);
    // scene.add(plane);
    let water = createWater();
    water.position.set(0, 10, i*-500);
    vetorWater.push(water);
    scene.add(water);

    let parede1 = createWalls();  
    parede1.rotateZ(degreesToRadians(60));
    parede1.rotateY(degreesToRadians(90));
    parede1.rotateZ(degreesToRadians(90));
    parede1.position.set(-200, 0, i*-500);
    scene.add(parede1);
    vetorParedes.push(parede1);

    let parede2 = createWalls();
    parede2.rotateZ(degreesToRadians(-60));
    parede2.rotateY(degreesToRadians(90));
    parede2.rotateZ(degreesToRadians(90));
    parede2.position.set(200, 0, i*-500);
    scene.add(parede2);
    vetorParedes.push(parede2);

    let grama1 = createGrass();
    grama1.rotateX(degreesToRadians(90));
    grama1.position.set(-380, 50, i*-500);
    scene.add(grama1);
    vetorGramas.push(grama1);

    let grama2 = createGrass();
    grama2.rotateX(degreesToRadians(90));
    grama2.position.set(380, 50, i*-500);
    scene.add(grama2);
    vetorGramas.push(grama2);
}


function createWater(){
    let waterGeometry = new THREE.PlaneGeometry(400, 500);
    let water = new Water( waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
        textureWidth: 1024,
        textureHeight: 1024
      } );

    water.rotation.x = Math.PI * - 0.5;
    return water;
}

function createWalls()
{
    let wallGeometry = new THREE.PlaneGeometry(200, 500);
    let texture = new THREE.TextureLoader().load("./assets/textures/plaster.jpg");
    let textureNormalMap = new THREE.TextureLoader().load("./assets/textures/plaster_normal.jpg");
    // let texture = 	new THREE.TextureLoader().load("./assets/textures/ground-texture.jpg");
    // let textureNormalMap = 	new THREE.TextureLoader().load("./assets/textures/ground-normalMap.jpg");

    let nmap = (textureNormalMap ? new THREE.TextureLoader().load(textureNormalMap) : null);
    let mat = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color:"white",
        map: texture,
        normalMap: nmap,
    });
    mat.normalScale.set(0.7, 0.7);

    let mesh = new THREE.Mesh(wallGeometry, mat);

    return mesh;
}

function createPlano()
{
    let planeGeometry = new THREE.PlaneGeometry(400, 500);
    let texture = 	new THREE.TextureLoader().load("./assets/textures/river-texture.jpg");

    let mat = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        color:"white",
        map: texture,
    });
    mat.normalScale.set(0.7, 0.7);

    let mesh = new THREE.Mesh(planeGeometry, mat);

    return mesh;
}

function createGrass()
{
    let grassGeometry = new THREE.PlaneGeometry(200, 500);
    let texture = 	new THREE.TextureLoader().load("./assets/textures/grass-texture.jpg");
    let textureNormalMap = new THREE.TextureLoader().load("./assets/textures/grass-normal.jpg");

    // let nmap = (textureNormalMap ? new THREE.TextureLoader().load(textureNormalMap) : null);
    let mat = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color:"white",
        map: texture,
        // normalMap: nmap,
    });
    mat.normalScale.set(0.7, 0.7);

    // let nmap = (textureNormal ? new THREE.TextureLoader().load(textureNormal) : null);
	// var mat = new THREE.MeshPhongMaterial({
	// 	map: texture,
	// 	normalMap: nmap,
	// });
	var mesh = new THREE.Mesh(grassGeometry, mat);

    return mesh;
}


//                                  MODELAGEM E DINÂMICA:

//Modelagem do avião:
let aviao = new THREE.Mesh(new THREE.BoxGeometry(16, 24, 6), new THREE.MeshPhongMaterial({color:"rgb(255,255,255)", shininess:200}));
aviao.rotateX(degreesToRadians(-90));
aviao.translateY(50);
aviao.position.set(0, 50, 110);
scene.add(aviao);

let vidas = 5;
let modoInvencivel = false;
let auxAnimationAviao = false;

aviao.material.transparent = true;
aviao.material.opacity = 0;

let posicaoAviao = new THREE.Vector3(0,0,0);
let aviaoBB = new THREE.Box3();
aviao.geometry.computeBoundingBox(aviaoBB);

loadOBJFile('./assets/plane7/', 'plane', aviao, "");

function loadOBJFile(modelPath, modelName, object, target)
{
  var manager = new THREE.LoadingManager( );

  var mtlLoader = new MTLLoader( manager );
  mtlLoader.setPath( modelPath );
  mtlLoader.load( modelName + '.mtl', function ( materials ) {
        materials.preload();

        var objLoader = new OBJLoader( manager );
        objLoader.setMaterials(materials);
        objLoader.setPath(modelPath);
        objLoader.load( modelName + ".obj", function ( obj ) {
          obj.name = modelName;
          // Set 'castShadow' property for each children of the group
          obj.traverse( function (child)
          {
            child.castShadow = true;
          });

          obj.traverse( function( node )
          {
            if( node.material )node.material.side = THREE.DoubleSide;
          });

          if(modelName == 'Fighter_Plane_Sukhoi-30'){
                obj.scale.x *= 0.04;
                obj.scale.y *= 0.04;
                obj.scale.z *= 0.04;
                obj.position.y -= 6;
          }else if(modelName == 'uploads_files_874121_CosmoDragon'){
                obj.scale.x *= 0.04;
                obj.scale.y *= 0.04;
                obj.scale.z *= 0.04;
                obj.position.y -= 4;
          }else if(modelName == 'boat'){
                obj.scale.x *= 2.5;
                obj.scale.y *= 2.5;
                obj.scale.z *= 2.5;
                obj.rotation.y += 300;
                obj.position.y -= 4;
          }else if(modelName == 'plane'){
                obj.scale.x -= 1.3;
                obj.scale.y -= 1.3;
                obj.scale.z -= 1.3;
                obj.rotation.y -= 300;
                obj.rotation.x += 300;
                obj.position.z -= 3;
          }else{
                obj.scale.x *= 2;
                obj.scale.y *= 2;
                obj.scale.z *= 2;
                if(target == "ar-ar")
                    obj.rotation.x += 600;
                else if(target == "ar-terra")
                    obj.rotation.x += 700;
                else if(target == "terra-ar")
                    obj.rotation.x += 300;
          }

          object.add ( obj );

        }, null, null );
  });
}


function rotacaoAviao(direcao){
    aviao.position.y = 50;
    if(direcao == "esquerda"){
        if(aviao.rotation.y > degreesToRadians(-16))
            aviao.rotateY(degreesToRadians(-16));
    }else if(direcao == "direita"){
        if(aviao.rotation.y < degreesToRadians(16))
            aviao.rotateY(degreesToRadians(16));
    }
}

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
let vetorCuras = [];

//Função que cria objeto de cura
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

//Função que cria os inimigos
function createEnemies(move){
    //Definição dos modelos dos inimigos aéreos aleatória:
    let defModelos = Math.random()*100;
    let pathModelo;
    let modelName;
    if(defModelos <= 45){
        pathModelo = './assets/plane1/';
        modelName = 'Fighter_Plane_Sukhoi-30';
    }else if(defModelos > 45 && defModelos <= 75){
        modelName = 'uploads_files_874121_CosmoDragon';
        pathModelo = './assets/plane5/';
    }else{
        modelName = 'scene';
        pathModelo = './assets/enemyPlane/';
    }

    //vertical
    if(move == "vertical")
    {
        let enemy1 = new Enemies(move, modelName);
        let positionX1 = (Math.random() * 175);
        let positionZ1 = -350;
        let sinal1 = Math.random()*2;
        if(sinal1 >= 1)
            positionX1 = positionX1 * (-1);
        enemy1.object.position.set(positionX1, 50, positionZ1);
        enemy1.object.material.transparent = true;
        enemy1.object.material.opacity = 0;
        vetorInimigos.push(enemy1);
        scene.add(enemy1.object);
        setModeloInimigo(modelName, pathModelo, enemy1.object);
        
    }

    // horizontal
    if(move == "horizontal")
    {
        let enemy2 = new Enemies(move, modelName);
        let positionX2 = -250;
        let positionZ2 = Math.random()*200;
        let sinal2 = Math.random()*2;
        if(sinal2 >= 1)
            positionZ2 = positionZ2 * (-1);
        enemy2.object.position.set(positionX2, 50, positionZ2);
        enemy2.object.material.transparent = true;
        enemy2.object.material.opacity = 0;
        enemy2.object.rotation.y += Math.PI/2;
        vetorInimigos.push(enemy2);
        scene.add(enemy2.object);
        setModeloInimigo(modelName, pathModelo, enemy2.object);
    }

    // diagonal esquerda
    if(move == "diagonalEsquerda")
    {
        let enemy3 = new Enemies(move, modelName);
        let positionX3 = -195;
        let positionZ3 = -300;
        enemy3.object.position.set(positionX3, 50, positionZ3);
        enemy3.object.material.transparent = true;
        enemy3.object.material.opacity = 0;
        enemy3.object.rotation.y += 0.698132; // 40 graus em radianos
        vetorInimigos.push(enemy3);
        scene.add(enemy3.object);
        setModeloInimigo(modelName, pathModelo, enemy3.object);
    }

    // diagonal direita
    if(move == "diagonalDireita")
    {
        let enemy4 = new Enemies(move, modelName);
        let positionX4 = 195;
        let positionZ4 = -300;
        enemy4.object.position.set(positionX4, 50, positionZ4);
        enemy4.object.material.transparent = true;
        enemy4.object.material.opacity = 0;
        enemy4.object.rotation.y -= 0.698132; // 40 graus em radianos
        vetorInimigos.push(enemy4);
        scene.add(enemy4.object);
        setModeloInimigo(modelName, pathModelo, enemy4.object);
    }

    // terrestre
    if(move == "terrestre")
    {
        let enemy5 = new Enemies(move, 'boat');
        let positionX5 = (Math.random() * 175);
        let positionZ5 = -350;
        let sinal3 = Math.random()*2;
        if(sinal3 >= 1)
            positionX5 = positionX5 * (-1);
        enemy5.object.position.set(positionX5, 10, positionZ5);
        enemy5.object.material.transparent = true;
        enemy5.object.material.opacity = 0;
        // scene.add(enemy5.object);
        // vetorInimigos.push(enemy5);
        pathModelo = './assets/ship3/';
        modelName = 'boat';
        setModeloInimigo(modelName, pathModelo, enemy5.object);
    }

    // meia-lua
    if(move == "meia-lua")
    {
        let enemy6 = new Enemies(move, modelName);
        let positionX6 = -195;
        let positionZ6 = -300;
        enemy6.object.position.set(positionX6, 50, positionZ6);
        enemy6.object.material.transparent = true;
        enemy6.object.material.opacity = 0;
        vetorInimigos.push(enemy6);
        scene.add(enemy6.object);
        setModeloInimigo(modelName, pathModelo, enemy6.object);
    }
}

//Função que define o modelo dos inimigos
function setModeloInimigo(modelo, path, objeto){
    let modeloInimigo;
    let loader = new GLTFLoader();
    if(modelo == 'scene'){
        loader.load(path + modelo + '.gltf', function(gltf){
            modeloInimigo = gltf.scene;
            
            modeloInimigo.traverse(function(child){
                if(child)
                    child.castShadow = true;
            });
            modeloInimigo.scale.x -= .6;
            modeloInimigo.scale.y -= .6;
            modeloInimigo.scale.z -= .6;
            objeto.add(modeloInimigo);
        }, null, null);
    }else{
        loadOBJFile(path, modelo, objeto, "");
    }
    
}

//                                   MECÂNICAS | UTILITIES

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
            index = 0;    
            vetorPlanos.forEach(item => {
                item.position.set(0,0,index*-500);
                index++;
            })
            index = 0;    
            vetorWater.forEach(item => {
                item.position.set(0,10,index*-500);
                index++;
            })
            index = 0;
            let i = 0;    
            vetorParedes.forEach(item => {
                if(index != 0 && index % 2 == 0)
                    i++;
                if(index % 2 != 0){
                    item.position.set(200,0,i*-500);
                    index++;
                }else{
                    item.position.set(-200,0,i*-500);
                    index++;
                }               
            })
            index = 0;    
            i = 0;
            vetorGramas.forEach(item => {
                if(index != 0 && index % 2 == 0)
                    i++;
                if(index % 2 != 0){
                    item.position.set(380,50,i*-500);
                    index++;
                }else{
                    item.position.set(-380,50,i*-500);
                    index++;
                }
                
            })
     
        aviao.position.set(0, 50, 110);
        referenceObject.position.set(0, 0, 0);
        vidas = 0;
        resetaVidas();
    }
}

//Função que anima os inimigos mortos:
function animationEnemy()
{
    //Contador para guardar a posição (index) do elemento
    var contador = 0;
    //Percorre o vetor auxiliar killedEnemies (inimigos mortos):
    killedEnemies.forEach(item => {
        // let auxAnimationEnemy = true;
        const values = [2, 6, 8, 9, 10, 3, 7, 11, 15, 12, 13, 14, 0, 1, 4, 5];
        let sprite = new SpriteExplosion("./assets/textures/sprite-explosion.png", 4, 4, scene);
        sprite.loop(values, 0.5); 
        //Adiciona o elemento na cena (O elemento é uma cópia do original):
        scene.add(item);
        animate(sprite);
        // Diminui a escala em x,y e z da cópia:
        item.scale.x = item.scale.x - 0.1;
        item.scale.y = item.scale.y - 0.1;
        item.scale.z = item.scale.z - 0.1;

        if(item.scale.x <= 0){
            scene.remove(item);
            killedEnemies.splice(contador, 1);
        }
        contador++;
        //Quando a escala for menor que zero, remove o item da cena e do vetor auxiliar killedEnemies:
    })
}

const clock = new THREE.Clock();

function animate (sprite) {
  let deltaTime = clock.getDelta();
  controlledRender();
  sprite.update(deltaTime);
  requestAnimationFrame(animate);
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
            aviao.position.set(0,50,110);
            auxAnimationAviao = false;
            aviao.scale.x = 1;
            aviao.scale.y = 1;
            aviao.scale.z = 1;
            aviao.material.color.setHex(0xffffff);
        }
    }
}

function animationExplosao(position){
    let geometry = new THREE.PlaneGeometry(100,100);
    let material = new THREE.MeshLambertMaterial({transparent : true});
}

//                                  SISTEMA DE TIRO E COLISÃO:

var trackballControls = new TrackballControls( camera, renderer.domElement );
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

let referenceObject = new THREE.Object3D();
let x;
let y; 
referenceObject.position.set(0, 0, 0);

//Função que cria os tiros:
function createAmmo(tipo, target, distx, distz){
    let tiro;
    aviao.updateMatrixWorld(true);
    if(tipo != "ar-ar" && tipo != "ar-terra"){
        tiro = new Ammo(tipo, distx, distz);
        if(aviao.position.x < target.x && tipo != "horizontal")
            tiro.inverteVelocidadeX();
    }else
        tiro = new Ammo(tipo, distx, distz);
    tiro.object.position.set(target.x, target.y, target.z);
    let modelPath = './assets/missile2/';
    let modelName = 'uploads_files_1895467_MLRS_Rocket';
    tiro.object.rotateX(degreesToRadians(90));
    loadOBJFile(modelPath, modelName, tiro.object, tipo);
    scene.add(tiro.object);
    vetorTiros.push(tiro);
}

//Função que define o tipo de tiro dos inimigos
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
                if(item.terrestre)
                    createAmmo("terra-ar", posicaoInimigo, distx, distz);
                else if(item.horizontal)
                    createAmmo("horizontal", posicaoInimigo, distx, distz);
                else
                    createAmmo("inimigo", posicaoInimigo, distx, distz);
            }
        }
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

//Função que auxilia a criação gerenciada de inimigos
function enemiesCreation()
{
    if((referenceObject.position.y >= 1000 && referenceObject.position.y <= 2000) ||
    (referenceObject.position.y >= 4000 && referenceObject.position.y <= 5000) ||
    (referenceObject.position.y >= 7000 && referenceObject.position.y <= 8000) ||
    (referenceObject.position.y >= 10000 && referenceObject.position.y <= 11000))
 {
     x = Math.random()*100;
     //Caso seja maior que 95, cria um inimigo aleatoriamente:
     if(x >= 99)
     {
         createEnemies("vertical");
         createEnemies("terrestre");
     }
 }
 else 
 {
    if(referenceObject.position.y < 1000)
    {
        x = Math.random()*100;
        if(x >= 99.6)
        {
             createEnemies("vertical");
             createEnemies("terrestre");
        }
    }
    else
    {
        x = Math.random()*100;
        //Caso seja maior que 95, cria um inimigo aleatoriamente:
        if(x >= 99.3)
        {
            createEnemies("vertical");
            createEnemies("terrestre");
        }
    }
    
 }

 if((referenceObject.position.y >= 2000 && referenceObject.position.y <= 2500) ||
    (referenceObject.position.y >= 5000 && referenceObject.position.y <= 5500) ||
    (referenceObject.position.y >= 8000 && referenceObject.position.y <= 8500) ||
    (referenceObject.position.y >= 9000 && referenceObject.position.y <= 9500))
 {
     x = Math.random()*100;
     y = Math.random()*2;
     //Caso seja maior que 95, cria um inimigo aleatoriamente:
     if(x >= 99){
        if(y <= 1)
            createEnemies("diagonalEsquerda");
        else
            createEnemies("diagonalDireita");
     }
    
 }

 if((referenceObject.position.y >= 2500 && referenceObject.position.y <= 3000) ||
    (referenceObject.position.y >= 5500 && referenceObject.position.y <= 6000) ||
    (referenceObject.position.y >= 8500 && referenceObject.position.y <= 9000) ||
    (referenceObject.position.y >= 9500 && referenceObject.position.y <= 10000))
 {
     x = Math.random()*100;
     //Caso seja maior que 95, cria um inimigo aleatoriamente:
     if(x >= 99)
     {
         createEnemies("horizontal");
     }
    
 }

 if((referenceObject.position.y >= 3000 && referenceObject.position.y <= 4000) ||
    (referenceObject.position.y >= 6000 && referenceObject.position.y <= 7000) ||
    (referenceObject.position.y >= 9000 && referenceObject.position.y <= 10000) ||
    (referenceObject.position.y >= 10000 && referenceObject.position.y <= 10500))
 {
     x = Math.random()*100;
     //Caso seja maior que 95, cria um inimigo aleatoriamente:
     if(x >= 99.2)
     {
         createEnemies("meia-lua");
     }
     
 }

}

// Criaçao dos primeiros inimigos
x = Math.random()*100;
if(x <= 50){
    createEnemies("vertical");
    createEnemies("terrestre");
    createEnemies("diagonalEsquerda");
}else{
    createEnemies("Horizontal");
    createEnemies("diagonalDireita");
    createEnemies("meia-lua");
}

// createEnemies("terrestre");

render();

function render()
{
    //Move o plano e um object3D que auxilia na criação dos inimigos, baseando-se em sua posição no eixo Y
    keyboardUpdate();
    if(play){
        referenceObject.translateY(1); 
        if(referenceObject.position.y >= 6900)
            resetaJogo();
        enemiesCreation();

        //Gera os itens de cura aleatoriamente
        y = Math.random()*100;
        if(y >= 99.5)
            createHealObject();

        //Chamada das funções no render: 
        enemyShoot();
        moveObjects();
        atualizaBB();
        checkCollisions();
        animationEnemy();
        animationAviao();
        resetaVidas();
    }

    // enemyShoot();
    // moveObjects();

    controlledRender();
    stats.update();
    trackballControls.update();
    requestAnimationFrame(render);
}