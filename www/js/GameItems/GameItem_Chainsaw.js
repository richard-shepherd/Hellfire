/**
 * GameItem_Chainsaw (derived from GameItem)
 * -----------------
 * Represents a chainsaw.
 * @constructor
 */
function GameItem_Chainsaw(game) {
    // We call the base class's constructor...
    GameItem.call(this, {game: game, isEnemy: false});

    // Radar info...
    this.radarInfo.showAsCircle = false;
    this.radarInfo.label = "Chainsaw";

    // The sprite...
    this.setSprite(4.0, 2.0, TextureManager.TextureType.CHAINSAW);
}
Utils.extend(GameItem, GameItem_Chainsaw); // Derived from GameItem

/**
 * updatePosition
 * --------------
 */
GameItem_Chainsaw.prototype.updatePosition = function(deltaTimeInfo) {
    // We do not change the position of the object, but we do rotate it...
    this.sprite.rotate(0, 0, deltaTimeInfo.deltaSeconds);
};

/**
 * checkCollision
 * --------------
 * Checks if we have collided with the item.
 *
 * Returns true if the item should be removed from the game, false
 * otherwise.
 */
GameItem_Chainsaw.prototype.checkCollision = function(/*deltaTimeInfo*/) {
    if(this.polarPosition.distanceMeters > this.game.collisionDistanceMeters) {
        // We have not collided with the item...
        return false;
    }

    // We have collided with the item...
    AudioManager.getInstance().playSound(AudioManager.Sounds.AMMO_PICKUP, 20.0);
    this.game.ammoManager.addAmmoFromBag();

    // We return true to remove this item from the game...
    return true;
};
