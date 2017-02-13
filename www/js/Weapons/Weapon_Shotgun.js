/**
 * Weapon_Shotgun
 * --------------
 * Manages firing a shotgun when held by the player.
 * @constructor
 */
function Weapon_Shotgun(game) {
    // We call the base class's constructor...
    Weapon.call(this, game);
}
Utils.extend(Weapon, Weapon_Shotgun); // Derived from Weapon

/**
 * firePressed
 * -----------
 */
Weapon_Shotgun.prototype.firePressed = function() {
    // We check if there is any ammo left...
    var ammoType = AmmoManager.AmmoType.SHOTGUN_CARTRIDGE;
    if(this.game.ammoManager.getAmmoCount(ammoType) === 0) {
        // There is no ammo left...
        return;
    }

    // We play the sound and reduce the ammo count...
    AudioManager.getInstance().playSound(AudioManager.Sounds.SHOTGUN, 10.0);
    this.game.ammoManager.addAmmo(ammoType, -1);

    // We fire the weapon...
    this.shootNearestEnemy(60, 1, 60);
};

