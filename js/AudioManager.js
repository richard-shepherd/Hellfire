/**
 * AudioManager
 * ------------
 * Manages a collection of music and audio files and lets you play them.
 * @constructor
 */
function AudioManager(onReadyCallback) {
    this._onReadyCallback = onReadyCallback;

    // The collection of sounds we can play,
    // keyed by the Sounds enum...
    this.sounds = {};

    // The background music...
    this._backgroundMusic = null;

    // The number of sounds we are loading and the number we have loaded...
    this._numSoundsToLoad = 0;
    this._numSoundsLoaded = 0;

    // We load the sounds...
    this._loadSound(AudioManager.Sounds.DOOM_MUSIC, "audio/doom.mp3");
    this._loadSound(AudioManager.Sounds.SHOTGUN, "audio/shotgun.mp3");

    // We check whether everything has been loaded...
    this._checkIsReady();
}

/**
 * Sounds
 * ------
 * An enum for the sounds we can play.
 */
AudioManager.Sounds = {
    DOOM_MUSIC : 0,
    SHOTGUN : 1
};

/**
 * _checkIsReady
 * -------------
 * Checks whether all data has been loaded.
 */
AudioManager.prototype._checkIsReady = function () {
    if(this._numSoundsToLoad === this._numSoundsLoaded) {
        this._onReadyCallback();
    }
};

/**
 * ready
 * -----
 * True when all sounds have been loaded.
 */
AudioManager.prototype.ready = function() {
    return this._numSoundsLoaded === this._numSoundsToLoad;
};

/**
 * playBackgroundMusic
 * ------------------
 * Plays background music in a loop.
 */
AudioManager.prototype.playBackgroundMusic = function(sound, volume) {
    // We stop any existing music...
    this.stopBackgroundMusic();

    // And start the requested music...
    this._backgroundMusic = this.sounds[sound];
    this._backgroundMusic.volume(volume);
    this._backgroundMusic.loop(true);
    this._backgroundMusic.play();
};

/**
 * setBackgroundMusicVolume
 * ------------------------
 * Sets the volume of the background music.
 */
AudioManager.prototype.setBackgroundMusicVolume = function(volume) {
    if(this._backgroundMusic !== null) {
        this._backgroundMusic.volume(volume);
    }
};

/**
 * playSound
 * ---------
 * Plays the requested sound once.
 */
AudioManager.prototype.playSound = function(sound, volume) {
    var howl = this.sounds[sound];
    howl.volume(volume);
    howl.play();
};

/**
 * stopBackgroundMusic
 * -------------------
 * Stops the background music.
 */
AudioManager.prototype.stopBackgroundMusic = function() {
    if(this._backgroundMusic !== null) {
        this._backgroundMusic.stop();
        this._backgroundMusic = null;
    }
};

AudioManager.prototype._loadSound = function(sound, path) {
    // We increment the number of sounds to load...
    this._numSoundsToLoad++;

    // We load the sound...
    var howl = new Howl({
        src: [path],
        preload:true
    });
    this.sounds[sound] = howl;

    // When the sound has loaded, we note it...
    var that = this;
    howl.once("load", function() {
        try {
            that._numSoundsLoaded++;
            that._checkIsReady();
        } catch(ex) {
            Logger.log(ex.message);
        }
    });
};

