/**
 * ThreeDSprite
 * ------------
 * Manages a three.js "plane geometry" object, ie a flat, "sprite" object.
 *
 * You provide (x, y) game coordinates and these are translated into three.js
 * world coordinates.
 */
function ThreeDSprite(threeDCanvas, x, y, width, height, textureType) {
    this.threeDCanvas = threeDCanvas;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.textureType = textureType;

    // We get the texture...
    var texture = TextureManager.getInstance().getTexture(textureType);

    // We create the object...
    var material = new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide, alphaTest: 0.5});
    var plane = new THREE.PlaneGeometry(width, height);
    this.sprite = new THREE.Mesh(plane, material);
    this.sprite.position.x = x;
    this.sprite.position.z = -1.0 * y;
    this.sprite.position.y = height / 2.0;

    // We add the sprite to the scene...
    threeDCanvas.scene.add(this.sprite);
}

/**
 * dispose
 * -------
 * Removes this sprite from the scene.
 */
ThreeDSprite.prototype.dispose = function() {
    this.threeDCanvas.scene.remove(this.sprite);
};

/**
 * setDistanceFromGround
 * ---------------------
 */
ThreeDSprite.prototype.setDistanceFromGround = function(metersFromGround) {
    this.sprite.position.y = metersFromGround;
};

/**
 * setPosition
 * -----------
 */
ThreeDSprite.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.position.x = x;
    this.sprite.position.z = -1.0 * y;
};

/**
 * rotate
 * ------
 * Rotates the sprite by relative values (in radians) passed in.
 */
ThreeDSprite.prototype.rotate = function(x, y, z) {
    if(x) {
        this.sprite.rotation.x += x;
    }
    if(y) {
        this.sprite.rotation.z += y;
    }
    if(z) {
        this.sprite.rotation.y += z;
    }
};

/**
 * setRotation
 * -----------
 * Sets the sprite's rotation to the absolute values passed in.
 */
ThreeDSprite.prototype.setRotation = function(x, y, z) {
    if(x) {
        this.sprite.rotation.x = x;
    }
    if(y) {
        this.sprite.rotation.z = y;
    }
    if(z) {
        this.sprite.rotation.y = z;
    }
};