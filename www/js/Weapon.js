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
    // Game item angles are always between 0 - 2PI...
    var minAngle = Math.PI * 2.0 - spreadRadians / 2.0;
    var maxAngle = spreadRadians / 2.0;

    // The nearest enemy item...
    var nearestItem = null;

    // We look through the game-items, finding enemies in front of us
    // within the spread angle specified...
    for(var key in this.game.gameItems) {
        var gameItem = this.gameItems[key];

        // Is the item an enemy?
        if(!gameItem.isEnemy) {
            continue;
        }

        // Is the item within the spread?
        var gameItemAngle = gameItem.polarPosition.angleRadians;
        if(gameItemAngle < minAngle && gameItemAngle > maxAngle) {
            continue;
        }

        // The item is in the right spread range. Is it the nearest one?
        if(nearestItem === null) {
            nearestItem = gameItem;
        } else {
            if(gameItem.polarPosition.distanceMeters < nearestItem.polarPosition.distanceMeters) {
                nearestItem = gameItem;
            }
        }
    }

    // Did we find an enemy item in the spread range?
    if(nearestItem === null) {
        // No enemy was in sight...
        return;
    }

    // We've got an enemy, so we shoot it.
    // We work out the force with which we hit it.
    var shotForce = force - nearestItem.polarPosition.distanceMeters * forceDecreasePerMeter;
    var itemKilled = nearestItem.onShot(shotForce);

};
