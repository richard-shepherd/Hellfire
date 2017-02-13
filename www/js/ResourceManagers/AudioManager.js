/**
 * AudioManager
 * ------------
 * Manages a collection of music and audio files and lets you play them.
 *
 * This class is a singleton.
 * @constructor
 */
function AudioManager() {
    this._progressCallback = null;

    // The collection of sounds we can play,
    // keyed by the Sounds enum...
    this.sounds = {};

    // The background music...
    this._backgroundMusic = null;

    // The number of sounds we are loading and the number we have loaded...
    this._numSoundsToLoad = 0;
    this._numSoundsLoaded = 0;
}

/**
 * Sounds
 * ------
 * An enum for the sounds we can play.
 */
AudioManager.Sounds = {
    DOOM_MUSIC : 0,
    SHOTGUN : 1,
    AMMO_PICKUP: 3,
    IMP_ATTACK: 4,
    CHAINSAW: 5,
    GRUNT: 6,
    FIREBALL_HIT: 7
};

/**
 * The singleton instance.
 */
AudioManager._instance = null;

/**
 * getInstance
 * -----------
 * Returns the singleton instance.
 */
AudioManager.getInstance = function() {
    if(AudioManager._instance === null) {
        AudioManager._instance = new AudioManager();
    }
    return AudioManager._instance;
};

/**
 * initialize
 * ----------
 * Starts loading audio.
 */
AudioManager.prototype.initialize = function(progressCallback) {
    this._progressCallback = progressCallback;

    // We load the sounds...
    this._loadSound(AudioManager.Sounds.DOOM_MUSIC, "audio/doom.ogg");
    this._loadSound(AudioManager.Sounds.SHOTGUN, "audio/shotgun.ogg");
    this._loadSound(AudioManager.Sounds.AMMO_PICKUP, "audio/ammo-pickup.ogg");
    this._loadSound(AudioManager.Sounds.IMP_ATTACK, "audio/imp-attack.ogg");
    this._loadSound(AudioManager.Sounds.CHAINSAW, "audio/chainsaw.ogg");
    this._loadSound(AudioManager.Sounds.GRUNT, "audio/grunt.ogg");
    this._loadSound(AudioManager.Sounds.FIREBALL_HIT, "audio/fireball-hit.ogg");
};

/**
 * getProgress
 * -----------
 */
AudioManager.prototype.getProgress = function() {
    return {
        text: "Loading audio",
        total: this._numSoundsToLoad,
        loaded: this._numSoundsLoaded
    }
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
 * Returns the ID of the sound.
 */
AudioManager.prototype.playSound = function(sound, volume) {
    var howl = this.sounds[sound];
    howl.loop(false);
    howl.volume(volume);
    return howl.play();
};

/**
 * playLoop
 * --------
 * Plays the requested sound in a loop.
 * Returns the ID of the sound.
 */
AudioManager.prototype.playLoop = function(sound, volume) {
    var howl = this.sounds[sound];
    howl.loop(true);
    howl.volume(volume);
    return howl.play();
};

/**
 * stopSound
 * ---------
 * Stops the sound.
 */
AudioManager.prototype.stopSound = function(sound, id) {
    var howl = this.sounds[sound];
    howl.stop(id);
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
            if(that._progressCallback !== null) {
                that._progressCallback(that);
            }
        } catch(ex) {
            Logger.log(ex.message);
        }
    });
};

