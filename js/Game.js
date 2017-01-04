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

    // True if we are adding a player...
    this.addingPlayer = false;

    // We handle the add-player button...
    this._setupAddPlayerButton();

    // We handle the fire button...
    this._setupFireButton();

    // We set up the audio-manager and play the background music...
    this._setupAudioManager();

    // We subscribe to our location and compass heading...
    this._locationProvider = new LocationProvider();

    // We set up the radar...
    this._radarCanvas = new RadarCanvas(this.options.videoCanvasID);
}

// An enum for the slides we show...
Game.Slide = {
    GUNSIGHT: 0,
    LOGS: 1
};

/**
 * _setupAudioManager
 * ------------------
 * Sets up the audio manager.
 */
Game.prototype._setupAudioManager = function() {
    // We show that we are loading sounds...
    this.fireButton.innerHTML = "Loading audio";

    // We set up the audio manager...
    var that = this;
    this._audioManager = new AudioManager(function() {
        // Called when all audio has been loaded...
        try {
            that._audioManager.playBackgroundMusic(AudioManager.Sounds.DOOM_MUSIC, 0.5);
            that.fireButton.innerHTML = "Fire";
        } catch(ex) {
            Logger.log(ex.message);
        }
    });
};

/**
 * _setupAddPlayerButton
 * ---------------------
 * Sets up handling of the add-player button.
 */
Game.prototype._setupAddPlayerButton = function() {
    var that = this;
    this.addPlayerButton = document.getElementById(this.options.addPlayerButtonID);
    this.addPlayerButtonBackground = this.addPlayerButton.style.background;
    this.addPlayerButton.onclick = function() {
        that._onAddPlayerClicked();
    };
};

/**
 * _setupFireButton
 * ----------------
 * Sets up handling of the fire button.
 */
Game.prototype._setupFireButton = function() {
    var that = this;
    this.fireButton = document.getElementById(this.options.fireButtonID);
    this.fireButton.onclick = function() {
        that._onFireClicked();
    };
};

/**
 * _onFireClicked
 * --------------
 * Called when the fire button is clicked.
 */
Game.prototype._onFireClicked = function() {
    try {
        this._audioManager.playSound(AudioManager.Sounds.SHOTGUN, 10.0);
    } catch(ex) {
        Logger.log(ex.message);
    }
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
        width: 500,
        height: 500,
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
    var compassHeadingRadians = this._locationProvider.compassHeadingRadians;
    var ringColor = matchingPlayer ? matchingPlayer.color : null;
    var gameItems = this._getGameItems();
    this._radarCanvas.showRadar(compassHeadingRadians, gameItems, ringColor);

    // If we are in adding-player mode, we show the camera color on the
    // add-player button...
    if(this.addingPlayer) {
        var centerColor = VideoCanvas.getAverageCenterColor(imageData, canvasContext);
        var centerColorHex = Utils.colorToString(centerColor);
        var addUserElement = document.getElementById("add-player");
        addUserElement.style.background = centerColorHex;
    }
};

/**
 *
 * @private
 */
Game.prototype._getGameItems = function() {
    if(this._gameItems) {
        return this._gameItems;
    }

    // We create some game items...
    gameItems = [];

    // Some ammo...
    var item1 = new GameItem_Ammo();
    item1.distanceMeters = 100.0;
    item1.angleRadians = 2.0;
    gameItems.push(item1);

    // A weapon...
    var item2 = new GameItem_Weapon();
    item2.distanceMeters = 150.0;
    item2.angleRadians = 0.0;
    gameItems.push(item2);

    // More ammo...
    var item3 = new GameItem_Ammo();
    item3.distanceMeters = 50.0;
    item3.angleRadians = 5.0;
    gameItems.push(item3);

    // A player...
    var item4 = new GameItem_Player(1, new Color(230, 45, 76));
    item4.radarInfo.label = "Druss";
    item4.distanceMeters = 88.0;
    item4.angleRadians = 1.0;
    gameItems.push(item4);

    // Another player...
    var item5 = new GameItem_Player(1, new Color(23, 45, 226));
    item5.radarInfo.label = "Danger Mouse";
    item5.distanceMeters = 128.0;
    item5.angleRadians = 4.0;
    gameItems.push(item5);

    this._gameItems = gameItems;
    return gameItems;
};

