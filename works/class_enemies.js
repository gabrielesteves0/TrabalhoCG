
class Enemies {
    //Private
    #velocidadeX;
    #velocidadeZ;
    #positionX;
    #positionY;
    #positionZ;
    //Static
    static enemies = [];
    //Public
    enemyBB;
    enemy;
    constructor(tipo, movimento){
        enemy = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial( { color: 0xffff00 } ));
        enemyBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        enemyBB.setFromObject(enemy);
        if(movimento == "diagonalEsquerda"){
            this.#velocidadeX = 3;
            this.#velocidadeZ = 3;
            this.#positionX = -195;
            this.#positionZ = 200;
        }else if(movimento == "diagonalDireita"){
            this.#velocidadeX = -3;
            this.#velocidadeZ = 3;
            this.#positionX = 195;
            this.#positionZ = 200;
        }else if(movimento == "horizontal"){
            this.#positionZ = Math.random()*100;
            this.#positionX = 250;
            this.#velocidadeX = (Math.random()*5) + 1;
            this.#velocidadeZ = 0;
            let sinal = Math.random()*2;
            if(sinal >= 1)
                this.#positionX = positionX * (-1);
        }else/* if(movimento == "vertical")*/{
            this.#positionX = (Math.random() * 185);
            this.#positionZ = -500;
            this.#velocidadeX = 0;
            this.#velocidadeZ = (Math.random()*5) + 3;
            let sinal = Math.random()*2;
            if(sinal >= 1)
                this.#positionX = positionX * (-1);
        }
        if(tipo == "terrestre"){
            this.#positionY = 10;
        }else{
            this.#positionY = 50;
        }
        enemy.position.set(this.#positionX, this.#positionY, this.#positionZ);
        scene.add(enemy);
        enemies.push(enemy);
    }
    
    static moveEnemies() {
        enemies.forEach(item => {
            item.translateZ(item.#velocidadeZ);
            item.updateMatrixWorld(true);
            if(item.position.z >= 150){
                var indexEnemy = enemies.indexOf(item);
                scene.remove(item);
                delete enemies.at(indexEnemy);
                enemies.splice(indexEnemy, 1);
            }
        })
    }


}


