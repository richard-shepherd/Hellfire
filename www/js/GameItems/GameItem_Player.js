/**
 * GameItem_Player (derived from GameItem)
 * ---------------
 * Represents a player.
 *
 * @constructor
 */
function GameItem_Player(game, playerNumber, color) {
    // We call the base class's constructor...
    GameItem.call(this, {game: game, isEnemy: true});

    this.playerNumber = playerNumber;
    this.color = color;

    // Radar info...
    this.radarInfo.showAsCircle = true;
    this.radarInfo.circleColor = color;
}
Utils.extend(GameItem, GameItem_Player); // Derived from GameItem
