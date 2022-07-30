import * as THREE from "../build/three.module.js";
import {degreesToRadians} from "../libs/util/util.js";

class Ammo {

    bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    #geometry = new THREE.CylinderGeometry(1, 1, 14, 32, 32);
    #material = new THREE.MeshLambertMaterial( { color: 0xff0000 } ); // 0x008000
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
        // this.object.castShadow = true;
        this.velocidadeX = 0;
        if(tipo == "ar-ar"){
            this.velocidadeZ = 0;
            this.velocidadeY = -5;
        }else if(tipo == "inimigo"){
            this.velocidadeZ = 0;
            this.velocidadeY = 7;
            let variacao = distz/this.velocidadeZ;
            let velX = distx/variacao;
            this.velocidadeX = velX;
            this.inimigo = true;
        }else if(tipo == "ar-terra"){
            this.velocidadeZ = 2;
            this.velocidadeY = -10;
        }else if(tipo == "horizontal"){
            this.velocidadeX = 6;
            this.velocidadeZ = 0;
            this.velocidadeY = 0;
            this.inimigo = true;
        }else{
            this.velocidadeZ = -3;
            this.velocidadeY = 5;
            let variacao = distz/this.velocidadeZ;
            let velX = distx/variacao;
            this.velocidadeX = velX;
            this.terraAr = true;
            this.inimigo = true;
        }
        this.object.material.transparent = true;
        this.object.material.opacity = 0;
    }

    resetVelocidadeY(){
        this.velocidadeZ = 0;
    }

    inverteVelocidadeX(){
        this.velocidadeX = this.velocidadeX * (-1);
    }

}
export default Ammo;


