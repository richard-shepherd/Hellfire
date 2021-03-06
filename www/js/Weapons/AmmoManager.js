/**
 * AmmoManager
 * -----------
 * Manages the collection of ammo held by the player.
 * @constructor
 */
function AmmoManager() {
    // A map of ammo-name to number of pieces we hold...
    this.ammo = {};
}

/**
 * AmmoType
 * --------
 * An "enum" for the various types of ammo in the game.
 */
AmmoManager.AmmoType = {
    PISTOL_BULLET : 0,
    SHOTGUN_CARTRIDGE: 1,
    CHAINSAW_FUEL: 2
};

/**
 * addAmmoFromBag
 * --------------
 * Called when you pick up an ammo bag. We add random amount of
 * various types of ammo.
 */
AmmoManager.prototype.addAmmoFromBag = function() {
    this.addAmmo(AmmoManager.AmmoType.PISTOL_BULLET, Utils.randomIntBetween(5, 10));
    this.addAmmo(AmmoManager.AmmoType.SHOTGUN_CARTRIDGE, Utils.randomIntBetween(3, 6));
    this.addAmmo(AmmoManager.AmmoType.CHAINSAW_FUEL, Utils.randomIntBetween(10, 20));
};

/**
 * addAmmo
 * -------
 * Adds some ammo of the type specified.
 */
AmmoManager.prototype.addAmmo = function(ammoType, amount) {
    if(!(ammoType in this.ammo)) {
        this.ammo[ammoType] = 0;
    }
    var currentAmmo = this.ammo[ammoType];
    this.ammo[ammoType] = currentAmmo + amount;
};

/**
 * getAmmoCount
 * ------------
 * Returns the number of items we hold for the ammo type requested.
 */
AmmoManager.prototype.getAmmoCount = function(ammoType) {
    return this.ammo[ammoType];
};