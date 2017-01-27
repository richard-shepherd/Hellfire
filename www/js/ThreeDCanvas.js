/**
 * ThreeDCanvas
 * ------------
 * Manages a three.js 3D canvas.
 * @constructor
 */
function ThreeDCanvas(canvasContext) {
    this.canvasContext = canvasContext;

    // We create the screen and the camera...
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 140, 1.0, 0.1, 1000 );

    // The size of the canvas...
    this.width = 300;
    this.height = 300;

    // We create a transparent renderer...
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize( this.width, this.height );

    // We light the scene...
    this.light = new THREE.AmbientLight( 0xe0e0e0 );
    this.scene.add(this.light);
}

/**
 * setSize
 * -------
 * Sets the size of the 3D canvas.
 */
ThreeDCanvas.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
};

/**
 * render
 * ------
 * Renders the 3D scene.
 */
ThreeDCanvas.prototype.render = function() {
    // We update the camera position to our current position and
    // heading direction...
    var currentPosition = Position.currentPosition();
    this.camera.position.x = currentPosition.x;
    this.camera.position.z = -1.0 * currentPosition.y;
    this.camera.rotation.y = -1.0 * LocationProvider.getInstance().compassHeadingRadians;

    // We render the scene and show it on the canvas...
    this.renderer.render(this.scene, this.camera);
    this.canvasContext.drawImage(this.renderer.domElement, 0, 0);
};

/**
 * createSprite
 * ------------
 * Returns a ThreeDSprite object for the parameters specified.
 */
ThreeDCanvas.prototype.createSprite = function(x, y, width, height, textureType) {
    return new ThreeDSprite(this, x, y, width, height, textureType);
};