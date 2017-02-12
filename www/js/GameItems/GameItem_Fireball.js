/**
 * GameItem_Fireball
 * -----------------
 * A fireball, thrown by an imp at a player.
 * @constructor
 */
function GameItem_Fireball(game) {
    // We call the base class's constructor...
    GameItem.call(this, {game: game, isEnemy: false});

    // Radar info...
    this.radarInfo.showAsCircle = false;
    this.radarInfo.label = "Fireball";

    // The sprite...
    this.setSprite(1.0, 1.0, TextureManager.TextureType.FIREBALL);
    this.sprite.setDistanceFromGround(1.7);

    // The fireball dies after a period of time...
    this.lifetimeSeconds = 10.0;
}
Utils.extend(GameItem, GameItem_Fireball); // Derived from GameItem

/**
 * updatePosition
 * --------------
 */
GameItem_Fireball.prototype.updatePosition = function(deltaTimeInfo) {
    // We move along the movement vector...
    this.moveAlongMovementVector(deltaTimeInfo);
    this.makeSpriteFacePlayer();
    var rotation = deltaTimeInfo.deltaSeconds * 20.0;
    this.sprite.rotate(null, rotation, null);
};
