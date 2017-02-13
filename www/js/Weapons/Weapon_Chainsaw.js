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

    // Used to decide when hits are made and fuel is used...
    this.startTime = null;
}
Utils.extend(Weapon, Weapon_Chainsaw); // Derived from Weapon

/**
 * firePressed
 * -----------
 */
Weapon_Chainsaw.prototype.firePressed = function() {
    // We play the sound...
    this.playSound();

    // We note that we have started the chainsaw...
    this.startTime = Date.now();
};

/**
 * fireReleased
 * ------------
 */
Weapon_Chainsaw.prototype.fireReleased = function() {
    // We stop the sound...
    this.stopSound();

    // We note that the chainsaw is stopped...
    this.startTime = null;
};

/**
 * onMessageLoop
 * -------------
 * If Fire is pressed, we use fuel and see if there is an enemy to hit.
 */
Weapon_Chainsaw.prototype.onMessageLoop = function(deltaTimeInfo) {
    try {
        // Is Fire pressed?
        if(this.startTime === null) {
            return;
        }

        // We check if we have ammo (in this case fuel)...
        var ammoType = AmmoManager.AmmoType.CHAINSAW_FUEL;
        if(this.game.ammoManager.getAmmoCount(ammoType) <= 0) {
            // There is no ammo left...
            this.fireReleased();
            return;
        }

        // We only do something every interval...
        if(deltaTimeInfo.currentTime - this.startTime < 400) {
            return;
        }
        this.startTime = deltaTimeInfo.currentTime;

        // We reduce the fuel...
        this.game.ammoManager.addAmmo(ammoType, -1);

        // We use the weapon...
        this.shootNearestEnemy(10, 0.0, 5.0);
    } catch(ex) {
        Logger.log(ex.message);
    }




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


