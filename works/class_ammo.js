class Ammo {
    #shoot;
    #ammoBB;
    static vector = [];
    constructor(target){
        this.#shoot = new THREE.Mesh(new THREE.SphereGeometry(1, 0, 0), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
        this.#ammoBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        ammoBB.setFromObject(shoot);
        shoot.position.set(target.x, target.y, target.z);
        scene.add(shoot);
        ammo.push(shoot);
    }

    //Função que move os tiros
    static moveShoot() {
        ammo.forEach(item => {
            item.translateZ(-5);
        });
    }

    //Função que deleta os tiros
    static deleteAmmo(){
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
        });
}

    static atualizaBB() {
        ammo.forEach(tiro => {
            vectorAmmoBB.at(ammo.indexOf(tiro)).copy(tiro.geometry.boundingBox).applyMatrix4(tiro.matrixWorld);
        });
    }

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



