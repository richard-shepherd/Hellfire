/**
 * Weapon_Chainsaw
 * ---------------
 * Manages activating the chainsaw when held by the player.
 * @constructor
 */
function Weapon_Chainsaw(game) {
    // We call the base class's constructor...
    Weapon.call(this, game);
}
Utils.extend(Weapon, Weapon_Chainsaw); // Derived from Weapon

/**
 * fire
 * ----
 */
Weapon_Chainsaw.prototype.fire = function() {
    // We play the sound and reduce the ammo count...
    AudioManager.getInstance().playSound(AudioManager.Sounds.CHAINSAW, 10.0);

    // // We fire the weapon...
    // this.shootNearestEnemy(1000, 0.0);
};

