import * as THREE from "../build/three.module.js";

class Ammo {

    bBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    #geometry = new THREE.SphereGeometry(1, 0, 0);
    #material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
    object;
    velocidadeX;
    velocidadeY;
    velocidadeZ;
    constructor(tipo){
        this.object = new THREE.Mesh(this.#geometry, this.#material);
        this.object.geometry.computeBoundingBox();
        this.bBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
        this.object.castShadow = true;
        if(tipo == "ar-ar"){
            this.velocidadeY = 0;
            this.velocidadeZ = -5;
        }else if(tipo == "inimigo"){
            this.velocidadeY = -2;
            this.velocidadeZ = 5;
        }else{
            this.velocidadeY = -2;
            this.velocidadeZ = -5;
        }
        this.velocidadeX = 0;
    }
}
export default Ammo;


