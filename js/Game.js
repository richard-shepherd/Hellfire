/**
 * Game
 * ----
 * Controls the game.
 *
 * @constructor
 */
function Game(options) {
    // We parse the options...
    this.videoCanvasID = options.videoCanvasID;

    // We create the "swiper" which shows the slides...
    this.swiper = null;
    this._createSwiper();

    // We set up the camera. This sets up the image-updated callback
    // which is the main "message loop" of the game...
    this._setupCamera();
}

// An enum for the slides we show...
Game.Slide = {
    GUNSIGHT: 0,
    LOGS: 1
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
        showCanvas: {
            canvasElementID: this.videoCanvasID,
            imageDataCallback: function(data, canvasContext) { that._onVideoDataUpdated(data, canvasContext); },
            sampleIntervalMilliseconds: 33
        }
    };
    this.camera = new Camera(cameraOptions);
};

/**
 *_onVideoDataUpdated
 * ------------------
 * Called when we get a new frame from the camera.
 * Note: This is the main "message loop" callback for the game.
 */
Game.prototype._onVideoDataUpdated =  function (imageData, canvasContext) {
    VideoCanvas.drawCrosshairs(canvasContext);

    var width = canvasContext.canvas.width;
    var centerColor = VideoCanvas.getAverageCenterColor(imageData, width);
    var centerColorHex = Utils.rgbToString(centerColor.r, centerColor.g, centerColor.b);
    var addUserElement = document.getElementById("add-user");
    addUserElement.style.background = centerColorHex;
};

