import * as THREE from "../build/three.module.js";
import objCura from "../works/basicScene.js";

class Heal{

    object;
    bBox;
    //#geometry = new THREE.SphereGeometry(3, 0, 0);
    //#material = new THREE.MeshLambertMaterial( { color: 0x0000ff });
    velocidade;
    constructor(){
        //this.object = new THREE.Mesh(this.#geometry, this.#material);
        this.object = objCura();
        //this.object.geometry.computeBoundingBox();
        //this.bBox.copy(this.object.geometry.boundingBox).applyMatrix4(this.object.matrixWorld);
        this.object.castShadow = true;
        this.velocidade = (Math.random()*3) + 1;
    }
}
export default Heal