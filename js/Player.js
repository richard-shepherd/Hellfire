/**
 * Player
 * ------
 * Represents a player.
 * @constructor
 */
function Player(playerNumber, color) {
    this.playerNumber = playerNumber;
    this.color = color;

    Logger.log("Added player " + playerNumber + ", color=" + Utils.colorToString(color));
}

