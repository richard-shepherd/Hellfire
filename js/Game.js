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

    // Manages the collection of players...
    this.playerManager = new PlayerManager();

    // We set up the camera. This sets up the image-updated callback
    // which is the main "message loop" of the game...
    this._setupCamera();

    // We store the original background color of the add-player button...
    this.addPlayerButton = document.getElementById(options.addPlayerButtonID);
    this.addPlayerButtonBackground = this.addPlayerButton.style.background;

    // True if we are adding a player...
    this.addingPlayer = false;

    // We handle the add-player button...
    this.addPlayerButton.onclick = function() {
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
    if(this.addingPlayer) {
        // We find the color for the player, and add the player...
        var color = VideoCanvas.getAverageCenterColor(this.imageData, this.canvasContext);
        this.playerManager.addPlayer(color);

        // We revert the button background color...
        this.addPlayerButton.style.background = this.addPlayerButtonBackground;
    }

    // We toggle the adding-player state.
    // This means that you press the button once to go into adding-player
    // mode, and then again to actually add the player...
    this.addingPlayer = !this.addingPlayer;
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
        reverseImage: false,
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

    // We check if we are currently targetted on one of the players...
    var centerColors = VideoCanvas.getCenterColors(imageData, canvasContext);
    var matchingPlayer = this.playerManager.getMatchingPlayer(centerColors);

    // We draw the crosshairs.
    // If we have a matching player, we show the center ring in the
    // player's color...
    var ringColor = matchingPlayer ? matchingPlayer.color : Color.black;
    VideoCanvas.drawCrosshairs(ringColor, canvasContext);

    // If we are in adding-player mode, we show the camera color on the
    // add-player button...
    if(this.addingPlayer) {
        var centerColor = VideoCanvas.getAverageCenterColor(imageData, canvasContext);
        var centerColorHex = Utils.colorToString(centerColor);
        var addUserElement = document.getElementById("add-player");
        addUserElement.style.background = centerColorHex;
    }
};

