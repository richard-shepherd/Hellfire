/**
 * Game
 * ----
 * Controls the game.
 *
 * @constructor
 */
function Game(options) {
    var that = this;

    // Whether we are usin the camera or not...
    this.useCamera = false;

    // We store the options...
    this.options = options;

    // True once the game is set up and running...
    this._gameSetUp = false;

    // We create the "swiper" which shows the slides...
    this.swiper = null;
    this._createSwiper();
    this._splashScreen = new SplashScreen(this.swiper);

    // The 3D canvas...
    this.threeDCanvas = null;

    // The most recent data from the camera...
    this.imageData = null;
    this.canvasPanel = $("#gunsight-canvas-panel");
    this.canvas = document.getElementById("video-canvas");
    this.canvasContext = this.canvas.getContext("2d");

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

    // The current health and armor...
    this.armor = 20.0;
    this.health = 100.0;

    // The game items - ammo-bags, weapons, monsters, other players.
    // This is a map of game-item-number -> game-item.
    // Each item is assigned a unique number.
    this.gameItems = {};
    this._nextGameItemNumber = 1;

    // The current weapon held by the player...
    this.currentWeapon = null;

    // The amm held by the player...
    this.ammoManager = null;

    // The distance at which collisions are deemed to happen...
    this.collisionDistanceMeters = 3.0;

    // Timing for the main loop...
    this.deltaTimeInfo = new DeltaTimeInfo();
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
 * hitPlayer
 * ---------
 * Hits the player with the damage passed in.
 */
Game.prototype.hitPlayer = function(damage) {
    // We damage armor first...
    if(this.armor > 0.0) {
        this.armor -= damage;

        // Did the armor take all the damage?
        if(this.armor < 0.0) {
            // The armor did not take all the damage...
            damage = -1.0 * this.armor;
            this.armor = 0.0;
        } else {
            // The armor took all the damage...
            damage = 0.0;
        }
    }

    // The player's health takes any damage remaining...
    this.health -= damage;
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
    this.deltaTimeInfo.update();

    // We hold the data as we may need it in other functions...
    this.imageData = imageData;
    this.canvasContext = canvasContext;

    // Updates game items, including checking for collisions...
    this._updateGameItems();

    // We show the 3D canvas...
    this.threeDCanvas.render();

    // We check if we are currently targetted on one of the players...
    var centerColors = VideoCanvas.getCenterColors(imageData, canvasContext);
    var matchingPlayer = this.playerManager.getMatchingPlayer(centerColors);

    // We draw the crosshairs.
    // If we have a matching player, we show the center ring in the
    // player's color...
    var compassHeadingRadians = this._locationProvider.compassHeadingRadians;
    var ringColor = matchingPlayer ? matchingPlayer.color : null;
    this._radarCanvas.showRadar(compassHeadingRadians, this.gameItems, this.deltaTimeInfo, ringColor);

    // We show the position info (lat, long, accuracy)...
    this._showPositionInfo();

    // Shows player info (ammo, armor, health...)...
    this._showPlayerInfo();

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
 * onMessageLoop
 * -------------
 * Called each time we render a new frame in the game.
 */
Game.prototype.onMessageLoop = function() {
    try {
        // We find the time elapsed since the last iteration.
        // The timing and movement of various aspects of the game use this.
        this.deltaTimeInfo.update();

        // Updates the graphics canvas size...
        this._setupCanvasSize();

        // Updates game items, including checking for collisions...
        this._updateGameItems();

        // We show the 3D canvas...
        this.threeDCanvas.render();

        // We draw the crosshairs.
        // If we have a matching player, we show the center ring in the
        // player's color...
        var compassHeadingRadians = this._locationProvider.compassHeadingRadians;
        var ringColor = null;
        this._radarCanvas.showRadar(compassHeadingRadians, this.gameItems, this.deltaTimeInfo, ringColor);

        // We show the position info (lat, long, accuracy)...
        this._showPositionInfo();

        // Shows the amount of ammo for the current weapon...
        this._showPlayerInfo();
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _setupCanvasSize
 * ----------------
 * Makes sure the canvas is the right size for the screen.
 */
Game.prototype._setupCanvasSize = function() {
    var minResolution = 750;

    // We find the canvas size for the current screen layout...
    var aspect = this.canvasPanel.width() / this.canvasPanel.height();
    var width = 0.0;
    var height = 0.0;
    if(aspect < 1.0) {
        width = minResolution;
        height = minResolution / aspect;
    } else {
        width = minResolution * aspect;
        height = minResolution;
    }
    width = Math.floor(width);
    height = Math.floor(height);

    // We update the canvas size if it has changed...
    if(width !== this.canvas.width) {
        this.canvas.width = width;
    }
    if(height !== this.canvas.height) {
        this.canvas.height = height;
    }
};

/**
 * _updateGameItems
 * ----------------
 * Updates game item positions, including converting to polar coordinates
 * for the radar. Checks for collisions and takes action if they are detected
 * including removing items if necessary.
 */
Game.prototype._updateGameItems = function() {
    var key, gameItem;

    // We update the items' positions and convert them
    // to polar coordinates...
    var currentPosition = Position.currentPosition();
    for(key in this.gameItems) {
        gameItem = this.gameItems[key];
        gameItem.updatePosition(this.deltaTimeInfo);
        gameItem.updatePolarPosition(currentPosition);
        gameItem.updateSprite();
    }

    // We check each item for collisions, and then remove any that need removing...
    var keysToRemove = [];
    for(key in this.gameItems) {
        gameItem = this.gameItems[key];
        var removeItem = gameItem.checkCollision(this.deltaTimeInfo);
        if(removeItem) {
            keysToRemove.push(key);
        }
    }
    for(var i=0; i<keysToRemove.length; ++i) {
        key = keysToRemove[i];
        this.removeGameItem(key);
    }
};

/**
 * removeGameItem
 * --------------
 * Disposes and removes the game item whose key is passed in.
 */
Game.prototype.removeGameItem = function(key) {
    if(key in this.gameItems) {
        var gameItem = this.gameItems[key];
        gameItem.dispose();
        delete this.gameItems[key];
    }
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
    try {
        var that = this;

        var canvas = $("#video-canvas");
        canvas.on("pointerdown", function(event) {
            try {
                that._onFirePressed();
            } catch(ex) {
                Logger.log(ex.message);
            }
        });
        canvas.on("pointerup", function(event) {
            try {
                that._onFireReleased();
            } catch(ex) {
                Logger.log(ex.message);
            }
        });
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _onFirePressed
 * --------------
 * Called when the fire button is pressed.
 */
Game.prototype._onFirePressed = function() {
    try {
        Logger.log("Fire pressed");
        if(this.currentWeapon !== null) {
            this.currentWeapon.firePressed();
        }
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _onFireReleased
 * ---------------
 * Called when the fire button is released.
 */
Game.prototype._onFireReleased = function() {
    try {
        Logger.log("Fire released");
        if(this.currentWeapon !== null) {
            this.currentWeapon.fireReleased();
        }
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

        // We play the music...
        AudioManager.getInstance().playBackgroundMusic(AudioManager.Sounds.DOOM_MUSIC, 0.5);

        // We set up the game area from the waypoints...
        this.gameArea = GameArea.createFromWaypoints(this.waypointManager);

        // We create the 3D canvas...
        var canvasElement = document.getElementById(this.options.videoCanvasID);
        var canvasContext = canvasElement.getContext("2d");
        this.threeDCanvas = new ThreeDCanvas(canvasContext);

        // We add items...
        this._setupGameItems();

        // We give the payer an initial weapon...
        this.currentWeapon = new Weapon_Chainsaw(this);

        // We give the player some ammo...
        this.ammoManager = new AmmoManager();
        this.ammoManager.addAmmo(AmmoManager.AmmoType.PISTOL_BULLET, 10);
        this.ammoManager.addAmmo(AmmoManager.AmmoType.SHOTGUN_CARTRIDGE, 5);

        // We set up the camera. This sets up the image-updated callback
        // which is the main "message loop" of the game...
        if(this.useCamera) {
            this._setupCamera();
        } else {
            var that = this;
            setInterval(function() {
                that.onMessageLoop();
            }, 33);
        }

        // We handle the add-player button...
        this._setupAddPlayerButton();

        // We handle the fire button...
        this._setupFireButton();

        // We set up the radar...
        this._radarCanvas = new RadarCanvas(canvasContext);
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

    // Adds a number of items in random locations within the game-area...
    function addItemsInRandomLocations(game, itemType, numItems) {
        for(var i=0; i<numItems; ++i) {
            var item = new itemType(game);
            item.position = game.gameArea.getRandomPoint();
            game.addGameItem(item);
        }
    }

    // We add some items...
    addItemsInRandomLocations(this, GameItem_Chainsaw, 5);
    addItemsInRandomLocations(this, GameItem_AmmoBag, 5);
    addItemsInRandomLocations(this, GameItem_Monster_Imp, 8);
};

/**
 * addGameItem
 * -----------
 * Adds a game item to our collection, assigning it a unique number.
 */
Game.prototype.addGameItem = function(gameItem) {
    var key = this._nextGameItemNumber;
    gameItem.key = key;
    this.gameItems[key] = gameItem;
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
 * _showPlayerInfo
 * ---------------
 * Shows the info for the player (ammo, armor, health etc).
 */
Game.prototype._showPlayerInfo = function() {
    var ammoCount = this.ammoManager.getAmmoCount(AmmoManager.AmmoType.SHOTGUN_CARTRIDGE);
    $("#ammo-count").text(ammoCount);
    $("#armor-value").text(Math.round(this.armor));
    $("#health-value").text(Math.round(this.health));
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
    $("#orientation-tilt").text(this._locationProvider.tiltRadians);

    // The current position...
    var xyPosition = Position.currentPosition();
    $("#position-position").text("(" + xyPosition.x + ", " + xyPosition.y + ")");
};

/**
 * getTargettedGameItems
 * ---------------------
 * Returns a list of game-items in the crosshairs.
 */
Game.prototype.getTargettedGameItems = function() {
    return this.threeDCanvas.getTargettedGameItems(this);
};
