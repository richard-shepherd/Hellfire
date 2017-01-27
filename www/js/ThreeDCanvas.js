/**
 * ThreeDCanvas
 * ------------
 * Manages a three.js 3D canvas.
 * @constructor
 */
function ThreeDCanvas() {
    // We create the screen and the camera...
    this.scene = new Three.Scene();
    this.camera = new THREE.PerspectiveCamera( 140, 1.0, 0.1, 1000 );

    // The size of the canvas...
    this.width = 300;
    this.height = 300;

    // We create a transparent renderer...
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize( this.width, this.height );
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

