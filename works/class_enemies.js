
export class Enemies {
    //Private
    _velocidadeX;
    _velocidadeZ;
    _positionX;
    _positionY;
    _positionZ;
    //_modelo;
    //Static
    static vector = [];
    //Public
    enemyBB;
    enemy;
    constructor(/*modeloInimigo*/){
        let enemy = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshPhongMaterial({color:"rgb(255,0,0)", shininess:200} ));
        enemy.castShadow = true;
        enemyBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        enemyBB.setFromObject(enemy);
        //modelo = modeloInimigo;
        this._positionX = (Math.random() * 185);
        this._positionY = 10;
        this._positionZ = -500;
        this._velocidadeX = 0;
        this._velocidadeZ = (Math.random()*5) + 3;
        let sinal = Math.random()*2;
        if(sinal >= 1)
            this._positionX = positionX * (-1);
        enemy.position.set(this._positionX, this._positionY, this._positionZ);
        scene.add(enemy);
        vector.push(enemy);
    }
    
    static moveEnemies() {
        vector.forEach(item => {
            item.enemy.translateZ(item._velocidadeZ);
            item.enemy.translateX(item._velocidadeX);
            item.enemy.updateMatrixWorld(true);
            if(item.enemy.position.z >= 150 || item.enemy.position.x >= 260 || item.enemy.position.x <= -260){
                var indexEnemy = enemies.indexOf(item);
                scene.remove(item.enemy);
                scene.remove(item.enemyBB);
                vector.splice(indexEnemy, 1);
            }
        });
    }

    static atualizaBB() {
        vector.forEach(inimigo => {
            inimigo.enemyBB.copy(inimigo.enemy.geometry.boundingBox).applyMatrix4(inimigo.enemy.matrixWorld);
        });
    }

}


