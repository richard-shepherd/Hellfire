/**
 * AudioManager
 * ------------
 * Manages a collection of music and audio files and lets you play them.
 * @constructor
 */
function AudioManager() {
    // The collection of sounds we can play,
    // keyed by the Sounds enum...
    this.sounds = {};

    // The background music...
    this._backgroundMusic = null;

    // We load the sounds...
    this._loadSound(AudioManager.Sounds.DOOM_MUSIC, "audio/doom.ogg");
    this._loadSound(AudioManager.Sounds.SHOTGUN, "audio/shotgun.mp3");
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
    // We load the sound...
    var howl = new Howl({ src: [path] });
    this.sounds[sound] = howl;
};

