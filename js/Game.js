/**
 * Game
 * ----
 * Controls the game.
 *
 * @constructor
 */
function Game(options) {
    var that = this;

    // We store the options...
    this.options = options;

    // We create the "swiper" which shows the slides...
    this.swiper = null;
    this._createSwiper();

    // The most recent data from the camera...
    this.imageData = null;
    this.canvasContext = null;

    // The collection of players...
    this.players = [];
    this.nextPlayerNumber = 1;

    // We set up the camera. This sets up the image-updated callback
    // which is the main "message loop" of the game...
    this._setupCamera();

    // We handle the add-player button...
    document.getElementById(options.addPlayerButtonID).onclick = function() {
        that._onAddPlayerClicked();
    };
}

// An enum for the slides we show...
Game.Slide = {
    GUNSIGHT: 0,
    LOGS: 1
};

/**
 * _onAddPlayerClicked
 * -------------------
 * Called when the add user button is clicked.
 */
Game.prototype._onAddPlayerClicked = function() {
    // We find the color for the player...
    var color = VideoCanvas.getAverageCenterColor(this.imageData, this.canvasContext);
    var player = new Player(this.nextPlayerNumber++, color);
    this.players.push(player);
};

/**
 * _createSwiper
 * -------------
 * Creates the object which manages the sliding "windows" for the app.
 */
Game.prototype._createSwiper = function() {
    Logger.log("Creating swiper layout.");
    this.swiper = new Swiper('.swiper-container', {
        initialSlide: Game.Slide.GUNSIGHT,
        pagination: '.swiper-pagination',
        paginationClickable: true
    });
};

/**
 * _setupCamera
 * ------------
 * Connects to the camera.
 */
Game.prototype._setupCamera = function() {
    // We set up the camera to show its image on a canvas (so we can
    // access the data and draw on it ourselves).
    var that = this;
    var cameraOptions = {
        facingDirection: Camera.FacingDirection.BACK_FACING,
        reverseImage: true,
        showCanvas: {
            canvasElementID: this.options.videoCanvasID,
            imageDataCallback: function(data, canvasContext) { that._onVideoDataUpdated(data, canvasContext); },
            sampleIntervalMilliseconds: 33
        }
    };
    this.camera = new Camera(cameraOptions);

    // We toggle the camera when the button is pressed...
    if(this.options.toggleCameraButtonID) {
        document.getElementById(this.options.toggleCameraButtonID).onclick = function() {
            that.camera.toggleCamera();
        };
    }
};

/**
 *_onVideoDataUpdated
 * ------------------
 * Called when we get a new frame from the camera.
 * Note: This is the main "message loop" callback for the game.
 */
Game.prototype._onVideoDataUpdated =  function (imageData, canvasContext) {
    // We hold the data as we may need it in other functions...
    this.imageData = imageData;
    this.canvasContext = canvasContext;

    // We draw the crosshairs...
    VideoCanvas.drawCrosshairs(canvasContext);


    var centerColor = VideoCanvas.getAverageCenterColor(imageData, canvasContext);
    var centerColorHex = Utils.colorToString(centerColor);
    var addUserElement = document.getElementById("add-player");
    addUserElement.style.background = centerColorHex;

};

