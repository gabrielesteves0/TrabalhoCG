import * as THREE from 'three';
import {scene} from '../works/planeShooter.js';

export default class Ammo {
    shoot;
    ammoBB;
    #velocidadeZ;
    #velocidadeY;
    static vector = [];
    constructor(target, objeto, bb, tipo){
        this.shoot = objeto;
        this.ammoBB = bb;
        this.shoot.position.set(target.x, target.y, target.z);
        if(tipo == "ar-ar"){
            this.#velocidadeY = 0;
            this.#velocidadeZ = -5;
        }else{
            this.#velocidadeY = -2;
            this.#velocidadeZ = -5;
        }
    }

    getVelocidadeY(){
        return this.#velocidadeY;
    }

    getVelocidadeZ(){
        return this.#velocidadeZ;
    }

    getObjeto(){
        return this.shoot;
    }

    getBB(){
        return this.ammoBB;
    }

    //Função que move os tiros
    // static moveShoot() {
    //     Ammo.vector.forEach(item => {
    //         item.shoot.translateZ(item.#velocidadeZ);
    //         item.shoot.translateY(item.#velocidadeY);
    //     });
    // }

    //Função que deleta os tiros
//     static deleteAmmo(){
//         //Percorre o vetor de tiros:
//         Ammo.vector.forEach(item => {
//             //Atualiza a posição no mundo do tiro:
//             item.shoot.updateMatrixWorld(true);
//             //Caso a posição em z seja menor que -400, o item é removido da cena e do seu vetor, assim como seu respectivo Box3.
//             if(item.shoot.position.z <= -400 || item.shoot.position.y <= -10){
//                 var indexBullet = ammo.indexOf(item);
//                 scene.remove(item.shoot);
//                 scene.remove(item.ammoBB);
//                 vector.splice(indexBullet, 1);
//             }
//         });
// }

    // static atualizaBB() {
    //     Ammo.vector.forEach(tiro => {
    //         tiro.ammoBB.copy(tiro.shoot.geometry.boundingBox).applyMatrix4(tiro.shoot.matrixWorld);
    //     });
    // }

    // static createAmmo(){
    //     //Modelagem dos tiros:
    //     let shoot = new THREE.Mesh(new THREE.SphereGeometry(1, 0, 0), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
    //     //Criação das Box3 (bounding boxes) dos tiros:
    //     let ammoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //     ammoBB.setFromObject(shoot);
    //     vectorAmmoBB.push(ammoBB);
    //     //Aqui, colocamos as coordenadas do avião no vetor target (criado anteriormente), e então, a partir dele, definimos a posição inicial do tiro.
    //     aviao.getWorldPosition(target);
    //     shoot.position.set(target.x, target.y, target.z);
    //     scene.add(shoot);
    //     ammo.push(shoot);
    // }

}



