/**
 * GameItem_AmmoBag (derived from GameItem)
 * ----------------
 * Represents an ammo bag.
 * @constructor
 */
function GameItem_AmmoBag() {
    // We call the base class's constructor...
    GameItem.call(this);

    // Radar info...
    this.radarInfo.showAsCircle = false;
    this.radarInfo.label = "Ammo";
}
Utils.extend(GameItem, GameItem_AmmoBag); // Derived from GameItem

/**
 * checkCollision
 * --------------
 * Checks if we have come to an ammo bag.
 *
 * Returns true if the item should be removed from the game, false
 * otherwise.
 */
GameItem.prototype.checkCollision = function(game) {
    if(this.polarPosition.distanceMeters > game.collisionDistanceMeters) {
        // We have not collided with the ammo bag...
        return false;
    }

    // We have collided with the ammo bag.
    // We add ammo to the player...
    game.audioManager.playSound(AudioManager.Sounds.AMMO_PICKUP, 20.0);
    game.ammoManager.addAmmoFromBag();

    // We return true to remove this ammo bag from the game...
    return true;
};
