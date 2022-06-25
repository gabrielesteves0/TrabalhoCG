import * as THREE from "../build/three.module.js";
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';

class Enemies {

    object;
    bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    #geometry = new THREE.BoxGeometry(10, 10, 10);
    #material = new THREE.MeshLambertMaterial( { color: 0xffff00 });
    velocidadeX;
    velocidadeZ;
    terrestre = false;
    meiaLua = false;
    constructor(movimento, modelo){
        if(modelo == "fighter"){
            this.#geometry = new THREE.BoxGeometry(20, 10, 10);
        }else if(modelo == "cartoonPlane"){
            this.#geometry = new THREE.BoxGeometry(20, 7, 20);
        }else if(modelo == "toonTank"){
            this.#geometry = new THREE.BoxGeometry(12, 9, 11);
        }else if(modelo == "pixelPlane"){
            this.#geometry = new THREE.BoxGeometry(22, 9, 22);
        }else{
            
        }
        this.object = new THREE.Mesh(this.#geometry, this.#material);
        this.object.geometry.computeBoundingBox();
        this.bBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
        if(movimento == "diagonalEsquerda"){
            this.velocidadeX = 0; //2.5
            this.velocidadeZ = 3;
        }else if(movimento == "diagonalDireita"){
            this.velocidadeX = 0; //-2.5
            this.velocidadeZ = 3;
        }else if(movimento == "horizontal"){
            this.velocidadeZ = (Math.random()*2) + 2;
            this.velocidadeX = 0;
        }else if(movimento == "vertical"){
            this.velocidadeX = 0;
            this.velocidadeZ = (Math.random()*5) + 1;
        }else if(movimento == "terrestre"){
            this.velocidadeX = 0;
            this.velocidadeZ = (Math.random()*5) + 1;
            this.terrestre = true;
        }else{
            this.velocidadeX = 2;
            this.velocidadeZ = 3;
            this.meiaLua = true;
        }

    }

    atualizacaoVelocidadeMeiaLua(posX){
        if(posX < 0)
            this.velocidadeZ -= .02;
        else
            this.velocidadeZ -= .08;
        this.object.rotation.y += 0.001;
    }

}
export default Enemies;