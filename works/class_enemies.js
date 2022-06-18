

export default class Enemies {
    //Private
    #velocidadeX;
    #velocidadeZ;
    #positionX;
    #positionY;
    #positionZ;
    //#modelo;
    constructor(/*modeloInimigo, */movimento){
        //this.#modelo = modeloInimigo;
        if(movimento == "diagonalEsquerda"){
            this.#velocidadeX = 3;
            this.#velocidadeZ = 3;
            this.#positionX = -195;
            this.#positionZ = 200;
        }else if(movimento == "terrestre"){
            this.#positionX = (Math.random() * 185);
            this.#positionY = 10;
            this.#positionZ = -500;
            this.#velocidadeX = 0;
            this.#velocidadeZ = (Math.random()*5) + 3;
            let sinal = Math.random()*2;
            if(sinal >= 1)
                this.#positionX = this.#positionX * (-1);
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
    }

    getVelocidadeX(){
        return this.#velocidadeX;
    }

    getVelocidadeZ(){
        return this.#velocidadeZ;
    }

    getPositionX(){
        return this.#positionX;
    }

    getPositionY(){
        return this.#positionY;
    }

    getPositionZ(){
        return this.#positionZ;
    }

    // getModelo(){
    //     return this.#modelo;
    // }

}
