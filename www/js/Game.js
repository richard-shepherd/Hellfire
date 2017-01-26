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

    // True once the game is set up and running...
    this._gameSetUp = false;

    // We create the "swiper" which shows the slides...
    this.swiper = null;
    this._createSwiper();

    // The most recent data from the camera...
    this.imageData = null;
    this.canvasContext = null;

    // Manages the collection of players...
    this.playerManager = new PlayerManager();

    // True if we are adding a player...
    this.addingPlayer = false;

    // We subscribe to our location and compass heading...
    this._locationProvider = LocationProvider.getInstance();

    // Waypoints (you run between them) and the game-area (the geographical
    // bounds of the game)...
    this.waypointManager = new WaypointManager(this.swiper);
    this.gameArea = null;

    // The game items - ammo-bags, weapons, monsters, other players.
    // This is a map of game-item-number -> game-item.
    // Each item is assigned a unique number.
    this.gameItems = {};
    this._nextGameItemNumber = 1;

    // The amm held by the player...
    this.ammoManager = null;

    // The distance at which collisions are deemed to happen...
    this.collisionDistanceMeters = 5.0;

    // Timing for the main loop...
    this._previousUpdateTime = Date.now();

    // We navigate away from the splash screen...
    setTimeout(function() {
        that.swiper.slideTo(Game.Slide.WAYPOINTS);
    }, 2000);
}

// An enum for the slides we show...
Game.Slide = {
    SPLASH_SCREEN: 0,
    WAYPOINTS: 1,
    GUNSIGHT: 2,
    GPS: 3,
    LOGS: 4
};

/**
 *_onVideoDataUpdated
 * ------------------
 * Called when we get a new frame from the camera.
 * Note: This is the main "message loop" callback for the game.
 */
Game.prototype._onVideoDataUpdated =  function (imageData, canvasContext) {
    // We find the time elapsed since the last iteration.
    // The timing and movement of various aspects of the game use this.
    var now = Date.now();
    var deltaMilliseconds = now - this._previousUpdateTime;
    this._previousUpdateTime = now;

    // We hold the data as we may need it in other functions...
    this.imageData = imageData;
    this.canvasContext = canvasContext;

    // Updates game items, including checking for collisions...
    this._updateGameItems(deltaMilliseconds);

    // We check if we are currently targetted on one of the players...
    var centerColors = VideoCanvas.getCenterColors(imageData, canvasContext);
    var matchingPlayer = this.playerManager.getMatchingPlayer(centerColors);

    // We draw the crosshairs.
    // If we have a matching player, we show the center ring in the
    // player's color...
    var compassHeadingRadians = this._locationProvider.compassHeadingRadians;
    var ringColor = matchingPlayer ? matchingPlayer.color : null;
    this._radarCanvas.showRadar(compassHeadingRadians, this.gameItems, deltaMilliseconds, ringColor);

    // We show the position info (lat, long, accuracy)...
    this._showPositionInfo();

    // Shows the amount of ammo for the current weapon...
    this._showAmmo();

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
 * _updateGameItems
 * ----------------
 * Updates game item positions, including converting to polar coordinates
 * for the radar. Checks for collisions and takes action if they are detected
 * including removing items if necessary.
 */
Game.prototype._updateGameItems = function(deltaMilliseconds) {
    var key, gameItem;

    // We update the items' positions and convert them
    // to polar coordinates...
    var currentPosition = Position.currentPosition();
    for(key in this.gameItems) {
        gameItem = this.gameItems[key];
        gameItem.updatePolarPosition(currentPosition);
    }

    // We check each item for collisions, and then remove any that need removing...
    var keysToRemove = [];
    for(key in this.gameItems) {
        gameItem = this.gameItems[key];
        var removeItem = gameItem.checkCollision(this);
        if(removeItem) {
            keysToRemove.push(key);
        }
    }
    for(var i=0; i<keysToRemove.length; ++i) {
        key = keysToRemove[i];
        delete this.gameItems[key];
    }
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
    this.audioManager = new AudioManager(function() {
        // Called when all audio has been loaded...
        try {
            that.audioManager.playBackgroundMusic(AudioManager.Sounds.DOOM_MUSIC, 0.5);
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
        var ammoType = AmmoManager.AmmoType.SHOTGUN_CARTRIDGE;
        if(this.ammoManager.getAmmoCount(ammoType) === 0) {
            // There is no ammo left...
            return;
        }

        // We fire the weapon...
        this.audioManager.playSound(AudioManager.Sounds.SHOTGUN, 10.0);
        this.ammoManager.addAmmo(ammoType, -1);
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

    var that = this;
    this.swiper = new Swiper('.swiper-container', {
        initialSlide: Game.Slide.SPLASH_SCREEN,
        pagination: '.swiper-pagination',
        paginationClickable: true,
        onSlideChangeEnd: function(swiper) { that._onSlideChanged(swiper); }
    });
};

/**
 * _onSlideChanged
 * ---------------
 * Called when the swiper slide has changed.
 */
Game.prototype._onSlideChanged = function(swiper) {
    try {
        // There may be custom code to run as we enter some slides...
        switch(swiper.activeIndex) {
            case Game.Slide.WAYPOINTS:
                this._onWaypointsSlideShown();
                break;

            case Game.Slide.GUNSIGHT:
                this._onGunsightSlideShown();
                break;
        }
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _onWaypointsSlideShown
 * ----------------------
 */
Game.prototype._onWaypointsSlideShown = function() {
    try {
        this.waypointManager.setupWaypoints();
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _onGunsightSlideShown
 * ---------------------
 */
Game.prototype._onGunsightSlideShown = function() {
    try {
        if(this._gameSetUp) {
            return;
        }
        this._gameSetUp = true;

        // The game has not been set up yet, so we set it up...

        // We set up the game area from the waypoints...
        this.gameArea = GameArea.createFromWaypoints(this.waypointManager);

        // We add items...
        this._setupGameItems();

        // We give the player some ammo...
        this.ammoManager = new AmmoManager();
        this.ammoManager.addAmmo(AmmoManager.AmmoType.PISTOL_BULLET, 10);
        this.ammoManager.addAmmo(AmmoManager.AmmoType.SHOTGUN_CARTRIDGE, 5);

        // We set up the camera. This sets up the image-updated callback
        // which is the main "message loop" of the game...
        this._setupCamera();

        // We handle the add-player button...
        this._setupAddPlayerButton();

        // We handle the fire button...
        this._setupFireButton();

        // We set up the audio-manager and play the background music...
        this._setupAudioManager();

        // We set up the radar...
        this._radarCanvas = new RadarCanvas(this.options.videoCanvasID);
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _setupGameItems
 * ---------------
 * Adds the initial collection of items to the game.
 */
Game.prototype._setupGameItems = function() {
    // We clear any existing game items...
    this.gameItems = {};

    // We add a number of amm bags...
    var numAmmoBags = 8;
    for(var i=0; i<numAmmoBags; ++i) {
        var ammoBag = new GameItem_AmmoBag();
        ammoBag.position = this.gameArea.getRandomPoint();
        this.addGameItem(ammoBag);
    }
};

/**
 * addGameItem
 * -----------
 * Adds a game item to our collection, assigning it a unique number.
 */
Game.prototype.addGameItem = function(gameItem) {
    this.gameItems[this._nextGameItemNumber] = gameItem;
    this._nextGameItemNumber++;
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
 * _showAmmo
 * ---------
 * Shows the amount of ammo for the current weapon.
 */
Game.prototype._showAmmo = function() {
    var ammoCount = this.ammoManager.getAmmoCount(AmmoManager.AmmoType.SHOTGUN_CARTRIDGE);
    $("#ammo-count").text(ammoCount);
};

/**
 * _showPositionInfo
 * -----------------
 * Shows position info in one of the game slides.
 */
Game.prototype._showPositionInfo = function() {
    var position = this._locationProvider.position;
    if(position === null) {
        return;
    }

    var coords = position.coords;
    $("#position-lat").text(coords.latitude);
    $("#position-long").text(coords.longitude);
    $("#position-accuracy").text(coords.accuracy);
    $("#position-num-updates").text(this._locationProvider.numPositionUpdates);
};

