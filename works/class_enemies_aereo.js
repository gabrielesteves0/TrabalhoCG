export class EnemiesAereo extends Enemies {
    constructor(movimento/*, modeloInimigo*/){
        super(/*modeloInimigo*/);
        if(movimento == "diagonalEsquerda"){
            this._velocidadeX = 3;
            this._velocidadeZ = 3;
            this._positionX = -195;
            this._positionZ = 200;
        }else if(movimento == "diagonalDireita"){
            this._velocidadeX = -3;
            this._velocidadeZ = 3;
            this._positionX = 195;
            this._positionZ = 200;
        }else if(movimento == "horizontal"){
            this._positionZ = Math.random()*100;
            this._positionX = 250;
            this._velocidadeX = (Math.random()*5) + 1;
            this._velocidadeZ = 0;
            let sinal = Math.random()*2;
            if(sinal >= 1)
                this._positionX = positionX * (-1);
        }else/* if(movimento == "vertical")*/{
            this._positionX = (Math.random() * 185);
            this._positionZ = -500;
            this._velocidadeX = 0;
            this._velocidadeZ = (Math.random()*5) + 3;
            let sinal = Math.random()*2;
            if(sinal >= 1)
                this._positionX = positionX * (-1);
        }
    }
    
}