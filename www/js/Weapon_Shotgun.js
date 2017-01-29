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
 * fire
 * ----
 */
Weapon_Shotgun.prototype.fire = function() {

};

