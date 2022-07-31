import * as THREE from "../build/three.module.js";

class SpriteExplosion {

    #tilesHoriz = 0;
    #tilesVert = 0;
    #currentTile = 2;

    #map;
    #sprite;
    #material;
    #scene;

    #playSpriteIndices = [];
    #explosionTileArrayIndex = 0;
    #maxDisplayTime = 0;
    #elapsedTime = 0;

    animacaoCompleta = false;

    constructor(spriteTexture, tilesHoriz, tilesVertic, scene){
        this.#tilesHoriz = tilesHoriz;
        this.#tilesVert = tilesVertic;
        this.#map = new THREE.TextureLoader().load(spriteTexture);
        this.#map.magFilter = THREE.NearestFilter;
        this.#map.repeat.set(1/tilesHoriz, 1/tilesVertic);

        this.#material = new THREE.SpriteMaterial({ map : this.#map });
        this.#sprite = new THREE.Sprite(this.#material);

        this.#sprite.position.y = 3;

        this.#scene = scene;
        this.#scene.add(this.#sprite);      

        this.update(0);
    }

    loop(playSpriteIndices, totalDuration) {
        this.#playSpriteIndices = playSpriteIndices;
        this.#explosionTileArrayIndex = 0;
        this.#currentTile = playSpriteIndices[this.#explosionTileArrayIndex];
        this.#maxDisplayTime = totalDuration/this.#playSpriteIndices.length;
    }

    update(delta) {
        if(this.#explosionTileArrayIndex == 0 && this.#elapsedTime != 0){
            this.animacaoCompleta = true;
            this.#scene.remove(this.#sprite);
        }
        this.#elapsedTime += delta;

        if(this.#maxDisplayTime > 0 && this.#elapsedTime >= this.#maxDisplayTime)
        {
            this.#elapsedTime = 0;
            this.#explosionTileArrayIndex = (this.#explosionTileArrayIndex + 1) % this.#playSpriteIndices.length;
            this.#currentTile = this.#playSpriteIndices[this.#explosionTileArrayIndex];

            const offsetX = (this.#currentTile % this.#tilesHoriz) / this.#tilesHoriz;
            const offsetY = (this.#tilesVert - Math.floor(this.#currentTile / this.#tilesHoriz) - 1) / this.#tilesVert;
            this.#map.offset.x = offsetX;
            this.#map.offset.y = offsetY;
        }
        
    }
}
export default SpriteExplosion;