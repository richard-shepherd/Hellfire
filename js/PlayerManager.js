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

    // The tolerance for color matches.
    // (0-100, where 0 requires a perfect match.)
    this.colorMatchTolerance = 20.0;
}

/**
 * addPlayer
 * ---------
 * Adds a player with the color specified.
 */
PlayerManager.prototype.addPlayer = function(color) {
    this.players.push(new GameItem_Player(this.nextPlayerNumber++, color));
};

/**
 * getMatchingPlayer
 * -----------------
 * Returns the Player object whose color matches any of the ones
 * passed in, or null if no player matches the color.
 */
PlayerManager.prototype.getMatchingPlayer = function(colors) {
    var numPlayers = this.players.length;
    var numColors = colors.length;

    // We loop through the players...
    for(var ip=0; ip<numPlayers; ++ip) {
        var player = this.players[ip];

        // Does the player match any of the colors?
        for(var ic=0; ic<numColors; ++ic) {
            var color = colors[ic];
            if(color.isMatch(player.color, this.colorMatchTolerance)) {
                // We've found a match!
                return player;
            }
        }
    }

    // We didn't find a match...
    return null;
};
