/**
 * GameItem
 * --------
 * A 'base class' for items in the game, including players as
 * well as items in the environment.
 * @constructor
 */
function GameItem(game) {
    // The game object...
    this.game = game;

    // The item's (x, y) position...
    this.position = new Position(0, 1000);

    // The item's position in polar coordinates...
    this.polarPosition = new PolarPosition(1000, 0);

    // The item's sprite (if it has one)...
    this.sprite = null;

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
 * updatePosition
 * --------------
 * Can be overridden in derived classes to update the item's position.
 */
GameItem.prototype.updatePosition = function(deltaMilliseconds) {
};

/**
 * updateSprite
 * ------------
 * Updates the sprite's position and orientation from the position
 * and orientation of the item.
 */
GameItem.prototype.updateSprite = function() {
    if(this.sprite === null) {
        return;
    }
    this.sprite.setPosition(this.position.x, this.position.y);
};

/**
 * updatePolarPosition
 * -------------------
 * Updates the polar position from the (x, y) position and the origin passed in.
 */
GameItem.prototype.updatePolarPosition = function(origin) {
    this.polarPosition.updateFromPosition(this.position, origin);
};

/**
 * moveTowardsPlayer
 * -----------------
 * Moves the item towards the player at the speed specified.
 */
GameItem.prototype.moveTowardsPlayer = function(metersPerSecond, deltaMilliseconds, minimumDistance) {
    // We check if the item is already near enough...
    if(this.polarPosition.distanceMeters < minimumDistance) {
        return;
    }

    // We find the direction to move in...
    var playerPosition = Position.currentPosition();
    var dx = playerPosition.x - this.position.x;
    var dy = playerPosition.y - this.position.y;
    var directionX = Math.sign(dx);
    var directionY = Math.sign(dy);

    // We move in the desired direction...
    var deltaSeconds = deltaMilliseconds / 1000.0;
    var movementX = directionX * metersPerSecond * deltaSeconds;
    var movementY = directionY * metersPerSecond * deltaSeconds;
    if(Math.abs(movementX) < Math.abs(dx)) {
        this.position.x += movementX;
    }
    if(Math.abs(movementY) < Math.abs(dy)) {
        this.position.y += movementY;
    }
};

/**
 * makeSpriteFacePlayer
 * --------------------
 * Sets the sprite to face the player.
 */
GameItem.prototype.makeSpriteFacePlayer = function() {
    if(this.sprite === null) {
        return;
    }

    var playerPosition = Position.currentPosition();
    var dx = playerPosition.x - this.position.x;
    var dy = playerPosition.y - this.position.y;
    var angle = 0.0;
    if(dy !== 0.0) {
        angle = -1.0 * Math.atan(dx/dy);
    }
    this.sprite.setRotation(0, 0, angle);
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
GameItem.prototype.checkCollision = function() {
    return false;
};



