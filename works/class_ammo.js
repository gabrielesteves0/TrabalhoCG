import * as THREE from 'three';
import {scene} from '../works/planeShooter.js';

export default class Ammo {
    #velocidadeZ;
    #velocidadeY;
    #velocidadeX;
    constructor(tipo){
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
        this.#velocidadeX = 0;
    }

    getVelocidadeY(){
        return this.#velocidadeY;
    }

    getVelocidadeZ(){
        return this.#velocidadeZ;
    }

    setVelocidadeY(velocidade){
        this.#velocidadeY = velocidade;
    }

    setVelocidadeX(velocidade){
        this.#velocidadeX = velocidade;
    }

    setVelocidadeZ(velocidade){
        this.#velocidadeZ = velocidade;
    }


}



