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
    this.camera = new THREE.PerspectiveCamera( 120, 1.0, 0.1, 1000 );
    this.camera.position.y = 2.0;
    this.camera.rotation.order = "YXZ";

    // The size of the canvas...
    this.width = 300;
    this.height = 300;

    // We create a transparent renderer...
    this.renderer = new THREE.WebGLRenderer({ alpha: false });
    this.renderer.setSize( this.width, this.height );

    // We light the scene...
    this.light = new THREE.AmbientLight( 0xe0e0e0 );
    this.scene.add(this.light);

    // For finding objects in the center of the screen...
    this._raycaster = new THREE.Raycaster();
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
    var locationProvider = LocationProvider.getInstance();
    this.camera.position.x = currentPosition.x;
    this.camera.position.z = -1.0 * currentPosition.y;
    this.camera.rotation.x = locationProvider.tiltRadians;
    this.camera.rotation.y = -1.0 * locationProvider.compassHeadingRadians;

    // We set the aspect ratio...
    var canvas = this.canvasContext.canvas;
    var width = canvas.width;
    var height = canvas.height;
    this.camera.aspect = width / height;

    // We render the scene and show it on the canvas...
    this.renderer.setSize(width, height);
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

/**
 * getTargettedGameItems
 * ---------------------
 * Returns a list of all game-items in the center of the screen.
 * These are sorted by distance, nearest first.
 */
ThreeDCanvas.prototype.getTargettedGameItems = function(game) {
    // We point the raycaster in the direction the camera is facing...
    this._raycaster.set(this.camera.getWorldPosition(), this.camera.getWorldDirection());

    // We find which objects it intersects with...
    var intersects = this._raycaster.intersectObjects(this.scene.children);

    // We find the game-items corresponding to these objects...
    var gameItems = [];
    for(var i=0; i<intersects.length; ++i) {
        var intersect = intersects[i];
        if(intersect.object.game__item) {
            gameItems.push(intersect.object.game__item);
        }
    }

    return gameItems;
};