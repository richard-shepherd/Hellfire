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
Weapon.prototype.shootNearestEnemy = function(force, forceDecreasePerMeter) {
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

    // We've got an enemy, so we shoot it.
    // We work out the force with which we hit it.
    var shotForce = force - nearestItem.polarPosition.distanceMeters * forceDecreasePerMeter;
    var itemKilled = nearestItem.onShot(shotForce);
    if(itemKilled) {
        this.game.removeGameItem(nearestItem.key);
    }
};
