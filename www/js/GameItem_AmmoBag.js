/**
 * GameItem_AmmoBag (derived from GameItem)
 * ----------------
 * Represents an ammo bag.
 * @constructor
 */
function GameItem_AmmoBag(game) {
    // We call the base class's constructor...
    GameItem.call(this, {game: game, isEnemy: false});

    // Radar info...
    this.radarInfo.showAsCircle = false;
    this.radarInfo.label = "Ammo";

    // The sprite...
    this.setSprite(8.0, 8.0, TextureManager.TextureType.AMMO_BAG);
    // this.sprite = game.threeDCanvas.createSprite(
    //     this.position.x, this.position.y,
    //     8.0, 8.0,
    //     TextureManager.TextureType.AMMO_BAG);
}
Utils.extend(GameItem, GameItem_AmmoBag); // Derived from GameItem

/**
 * updatePosition
 * --------------
 */
GameItem_AmmoBag.prototype.updatePosition = function(deltaMilliseconds) {
    // We do not change the position of the object, but we do rotate it...
    this.sprite.rotate(0, 0, deltaMilliseconds / 1000.0);
};

/**
 * checkCollision
 * --------------
 * Checks if we have come to an ammo bag.
 *
 * Returns true if the item should be removed from the game, false
 * otherwise.
 */
GameItem_AmmoBag.prototype.checkCollision = function() {
    if(this.polarPosition.distanceMeters > this.game.collisionDistanceMeters) {
        // We have not collided with the ammo bag...
        return false;
    }

    // We have collided with the ammo bag.
    // We add ammo to the player...
    AudioManager.getInstance().playSound(AudioManager.Sounds.AMMO_PICKUP, 20.0);
    this.game.ammoManager.addAmmoFromBag();

    // We return true to remove this ammo bag from the game...
    return true;
};
