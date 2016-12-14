/**
 * PlayerManager
 * -------------
 * Manages the collection of players in the game.
 * @constructor
 */
function PlayerManager() {
    // The collection of players...
    this.players = [];

    // The number for the next player to be added...
    this.nextPlayerNumber = 1;
}

/**
 * addPlayer
 * ---------
 * Adds a player with the color specified.
 */
PlayerManager.prototype.addPlayer = function(color) {
    this.players.push(new Player(this.nextPlayerNumber++, color));
};
