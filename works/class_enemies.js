import * as THREE from 'three';
import {scene} from '../works/planeShooter.js';

export default class Enemies {
    //Protected
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
        this.enemy = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshPhongMaterial({color:"rgb(255,0,0)", shininess:200} ));
        this.enemy.castShadow = true;
        this.enemyBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.enemyBB.setFromObject(this.enemy);
        //modelo = modeloInimigo;
        this._positionX = (Math.random() * 185);
        this._positionY = 10;
        this._positionZ = -500;
        this._velocidadeX = 0;
        this._velocidadeZ = (Math.random()*5) + 3;
        let sinal = Math.random()*2;
        if(sinal >= 1)
            this._positionX = this._positionX * (-1);
        this.enemy.position.set(this._positionX, this._positionY, this._positionZ);
        scene.add(this.enemy);
        Enemies.vector.push(this.enemy);
    }
    
    static moveEnemies() {
        Enemies.vector.forEach(item => {
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
        Enemies.vector.forEach(inimigo => {
            inimigo.enemyBB.copy(inimigo.enemy.geometry.boundingBox).applyMatrix4(inimigo.enemy.matrixWorld);
        });
    }

}
