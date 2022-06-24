import * as THREE from "../build/three.module.js";

class Ammo {

    bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    #geometry = new THREE.SphereGeometry(2, 16, 16);
    #material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
    object;
    velocidadeX;
    velocidadeY;
    velocidadeZ;
    inimigo;
    terraAr;
    constructor(tipo, distx, distz){
        this.object = new THREE.Mesh(this.#geometry, this.#material);
        this.inimigo = false;
        this.terraAr = false;
        this.object.geometry.computeBoundingBox();
        this.bBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
        this.object.castShadow = true;
        this.velocidadeX = 0;
        if(tipo == "ar-ar"){
            this.velocidadeY = 0;
            this.velocidadeZ = -5;
        }else if(tipo == "inimigo"){
            this.velocidadeY = 0;
            this.velocidadeZ = 7;
            this.inimigo = true;
        }else if(tipo == "ar-terra"){
            this.velocidadeY = -3;
            this.velocidadeZ = -8;
        }else{
            this.velocidadeY = 3;
            this.velocidadeZ = 5;
            let variacao = distz/this.velocidadeZ;
            let velX = distx/variacao;
            this.velocidadeX = velX;
            this.terraAr = true;
            this.inimigo = true;
        }
    }

    resetVelocidadeY(){
        this.velocidadeY = 0;
    }

    inverteVelocidadeX(){
        this.velocidadeX = this.velocidadeX * (-1);
    }

}
export default Ammo;


