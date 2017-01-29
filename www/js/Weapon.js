/**
 * Weapon
 * ------
 * A base class for weapons.
 * @constructor
 */
function Weapon(game) {
    this.game = game;
}

/**
 * shootNearestEnemy
 * -----------------
 * Find the nearest enemy within the angle provided by the spread parameter.
 * The enemy is then hit with the force specified, which can be set to decrease
 * with distance if required.
 */
Weapon.prototype.shootNearestEnemy = function(spreadRadians, force, forceDecreasePerMeter) {
    // We look through the game-items, finding enemies in front of us
    // within the spread angle specified...
    for(var key in this.game.gameItems) {
        var gameItem = this.gameItems[key];
    }

};
