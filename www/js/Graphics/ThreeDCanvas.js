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
    this.camera = new THREE.PerspectiveCamera( 80, 1.0, 0.1, 1000 );
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

    // We add the skybox...
    this.addSkybox();

    // For finding objects in the center of the screen...
    this._raycaster = new THREE.Raycaster();
}

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

    // We check that the size we are rendering to matches the canvas...
    var canvas = this.canvasContext.canvas;
    var width = canvas.width;
    var height = canvas.height;
    var rendererSize = this.renderer.getSize();
    if(rendererSize.width !== width || rendererSize.height !== height) {
        // We resize the renderer and aspect ration...
        var aspect = width / height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

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

/**
 * addSkybox
 * ---------
 */
ThreeDCanvas.prototype.addSkybox = function() {
    this.scene.background = new THREE.CubeTextureLoader()
        .setPath( 'textures/skybox1/' )
        .load( [
            '2-west.jpg',
            '4-east.jpg',
            '5-up.jpg',
            '6-down.jpg',
            '1-south.jpg',
            '3-north.jpg'
        ] );
};