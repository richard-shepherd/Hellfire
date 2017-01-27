/**
 * ThreeDSprite
 * ------------
 * Manages a three.js "plane geometry" object, ie a flat, "sprite" object.
 *
 * You provide (x, y) game coordinates and these are translated into three.js
 * world coordinates.
 */
function ThreeDSprite(threeDCanvas, x, y, width, height, texture) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.texture = texture;

    // We create the object...
    var material = new THREE.MeshLambertMaterial({map: texture, side: THREE.DoubleSide, alphaTest: 0.5});
    var plane = new THREE.PlaneGeometry(width, height);
    this.sprite = new THREE.Mesh(plane, material);
    sprite.position.x = x;
    sprite.position.z = -1.0 * y;

    // We add the sprite to the scene...
    threeDCanvas.scene.add(sprite);
}
