/**
 * Weapon_Chainsaw
 * ---------------
 * Manages activating the chainsaw when held by the player.
 * @constructor
 */
function Weapon_Chainsaw(game) {
    // We call the base class's constructor...
    Weapon.call(this, game);

    // The active chainsaw sound...
    this.soundID = null;
}
Utils.extend(Weapon, Weapon_Chainsaw); // Derived from Weapon

/**
 * firePressed
 * -----------
 */
Weapon_Chainsaw.prototype.firePressed = function() {
    // We play the sound...
    this.playSound();

    // We use the weapon...
    this.shootNearestEnemy(10, 0.0, 5.0);
};

/**
 * fireReleased
 * ------------
 */
Weapon_Chainsaw.prototype.fireReleased = function() {
    // We stop the sound...
    this.stopSound();
};

/**
 * playSound
 * ---------
 * Plays the chainsaw sound, if it is not already playing.
 */
Weapon_Chainsaw.prototype.playSound = function() {
    if(this.soundID === null) {
        this.soundID = AudioManager.getInstance().playLoop(AudioManager.Sounds.CHAINSAW, 10.0);
    }
};

/**
 * stopSound
 * ---------
 * Stops the chainsaw sound, if it is playing.
 */
Weapon_Chainsaw.prototype.stopSound = function() {
    if(this.soundID !== null) {
        AudioManager.getInstance().stopSound(AudioManager.Sounds.CHAINSAW, this.soundID);
        this.soundID = null;
    }
};


