import * as THREE from "../build/three.module.js";

class Enemies {

    object;
    bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    #geometry = new THREE.BoxGeometry(10, 10, 10);
    #material = new THREE.MeshLambertMaterial( { color: 0xffff00 });
    velocidadeX;
    velocidadeZ;
    positionX;
    positionY;
    positionZ;
    terrestre = false;
    constructor(movimento){
        this.object = new THREE.Mesh(this.#geometry, this.#material);
        this.object.geometry.computeBoundingBox();
        this.bBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
        this.object.castShadow = true;
        if(movimento == "diagonalEsquerda"){
            this.velocidadeX = 2.5;
            this.velocidadeZ = 3;
        }else if(movimento == "diagonalDireita"){
            this.velocidadeX = -2.5;
            this.velocidadeZ = 3;
        }else if(movimento == "horizontal"){
            this.velocidadeX = (Math.random()*2) + 2;
            this.velocidadeZ = 0;
        }else if(movimento == "vertical"){
            this.velocidadeX = 0;
            this.velocidadeZ = (Math.random()*5) + 1;
        }else{
            this.velocidadeX = 0;
            this.velocidadeZ = (Math.random()*5) + 1;
            this.terrestre = true;
        }
    }
}
export default Enemies;