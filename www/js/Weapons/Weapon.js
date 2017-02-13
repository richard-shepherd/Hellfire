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
 * firePressed
 * -----------
 * Can be overridden in derived classes to handle Fire being pressed.
 */
Weapon.prototype.firePressed = function() {
};

/**
 * fireReleased
 * ------------
 * Can be overridden in derived classes to handle Fire being released.
 */
Weapon.prototype.fireReleased = function() {
};

/**
 * onMessageLoop
 * -------------
 * Can be overridden in derived classes to handle ongoing firing, for
 * weapons like machine guns and the chainsaw.
 */
Weapon.prototype.onMessageLoop = function(deltaTimeInfo) {
};

/**
 * shootNearestEnemy
 * -----------------
 * Find the nearest enemy within the angle provided by the spread parameter.
 * The enemy is then hit with the force specified, which can be set to decrease
 * with distance if required.
 */
Weapon.prototype.shootNearestEnemy = function(force, forceDecreasePerMeter, maxRangeMeters) {
    // We find items currently in our crosshairs...
    var targettedItems = this.game.getTargettedGameItems();

    // We find the nearest enemy item. (Note: the targetted items are
    // returned already sorted by distance.)
    var nearestItem = null;
    for(var i=0; i<targettedItems.length; ++i) {
        var gameItem = targettedItems[i];

        // Is the item an enemy?
        if(gameItem.isEnemy) {
            nearestItem = gameItem;
            break;
        }
    }

    // Did we find an enemy item in the spread range?
    if(nearestItem === null) {
        return;  // No enemy was in sight...
    }

    // Is the enemy too far away?
    var enemyDistanceMeters = nearestItem.polarPosition.distanceMeters;
    if(enemyDistanceMeters > maxRangeMeters) {
        return;  // Enemy too far away...
    }

    // We've got an enemy, so we shoot it.
    // We work out the force with which we hit it.
    var shotForce = force - nearestItem.polarPosition.distanceMeters * forceDecreasePerMeter;
    if(shotForce > 0) {
        var itemKilled = nearestItem.onShot(shotForce);
        if(itemKilled) {
            this.game.removeGameItem(nearestItem.key);
        }
    }
};
