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

    // The fireball dies after a period of time...
    this.lifetimeSeconds = 10.0;
}
Utils.extend(GameItem, GameItem_Fireball); // Derived from GameItem
