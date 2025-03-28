import * as THREE from "../build/three.module.js";

class Enemies {

    object;
    bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    #geometry = new THREE.BoxGeometry(10, 10, 10);
    #material = new THREE.MeshLambertMaterial( { color: 0xffff00 });
    velocidadeX;
    velocidadeZ;
    terrestre = false;
    meiaLua = false;
    horizontal = false;
    constructor(movimento, modelo){
        if(modelo == "Fighter_Plane_Sukhoi-30"){
            this.#geometry = new THREE.BoxGeometry(24, 8, 24);
        }else if(modelo == "uploads_files_874121_CosmoDragon"){
            this.#geometry = new THREE.BoxGeometry(22, 7, 26);
        }else if(modelo == "boat"){
            this.#geometry = new THREE.BoxGeometry(14, 14, 18);
        }else{
            this.#geometry = new THREE.BoxGeometry(22, 9, 22);
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
            this.horizontal = true;
        }else if(movimento == "vertical"){
            this.velocidadeX = 0;
            this.velocidadeZ = (Math.random()*5) + 1;
        }else if(movimento == "terrestre"){
            this.velocidadeX = 0;
            this.velocidadeZ = 2;
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
            this.velocidadeZ -= .07;
        this.object.rotation.y += 0.001;
    }
}
export default Enemies;