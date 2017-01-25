/**
 * GameItem
 * --------
 * A 'base class' for items in the game, including players as
 * well as items in the environment.
 * @constructor
 */
function GameItem() {
    // The item's (x, y) position...
    this.position = new Position(0, 1000);

    // The item's position in polar coordinates...
    this.polarPosition = new PolarPosition(1000, 0);

    // Radar info...
    this.radarInfo = {
        showAsCircle: false,
        circleColor: "#ff0000",
        label: "?",
        timeShown: null,
        alpha: 0.0
    };
}

/**
 * updatePolarPosition
 * -------------------
 * Updates the polar position from the (x, y) position and the origin passed in.
 */
GameItem.prototype.updatePolarPosition = function(origin) {
    this.polarPosition.updateFromPosition(this.position, origin);
};

/**
 * checkCollision
 * --------------
 * This can be optionally overridden in derived classes.
 *
 * Checks if the item has collided with the player (or other items)
 * and takes action if desired.
 *
 * Returns true if the item should be removed from the game, false
 * otherwise.
 */
GameItem.prototype.checkCollision = function(game) {
    return false;
};



