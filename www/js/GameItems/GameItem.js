/**
 * GameItem
 * --------
 * A 'base class' for items in the game, including players as
 * well as items in the environment.
 * @constructor
 */
function GameItem(params) {
    // True if the item has been disposed...
    this.isDisposed = false;

    // The game object...
    this.game = params.game;

    // The key used by the Game's map of game-items...
    this.key = null;

    // True if the item is an enemy...
    this.isEnemy = params.isEnemy;

    // The item's strength (decreases as it is shot / hit)...
    this.strength = 100.0;

    // The item's (x, y) position...
    this.position = new Position(0, 1000);

    // The item's position in polar coordinates...
    this.polarPosition = new PolarPosition(1000, 0);

    // The item's movement vector, in (x, y) m/s...
    this.previousRandomDirectionChangeTime = null;
    this.movementVector = null;

    // Lifetime in seconds. Some items have a limited lifetime,
    // after which they disappear...
    this.lifetimeSeconds = null;

    // The item's sprite (if it has one)...
    this.sprite = null;

    // The time this item was created. (Used for items which have
    // a limited lifetime)...
    this.creationTime = Date.now();

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
 * dispose
 * -------
 * Called to clean up the item.
 * Derived classes should call the base class version after doing their
 * own dispose.
 */
GameItem.prototype.dispose = function() {
    if(this.isDisposed) {
        return;
    }

    // We dispose derived classes...
    this.derivedDispose();

    if(this.sprite !== null) {
        // We remove the sprite...
        this.sprite.dispose();
        this.sprite = null;
    }

    this.isDisposed = true;
};

/**
 * derivedDispose
 * --------------
 * Implement this in derived classes.
 */
GameItem.prototype.derivedDispose = function() {
};

/**
 * setSprite
 * ---------
 * Creates and sets up a sprite for this item.
 */
GameItem.prototype.setSprite = function(width, height, textureType) {
    // We add a sprite to the 3D canvas...
    this.sprite = this.game.threeDCanvas.createSprite(
        this.position.x, this.position.y,
        width, height,
        textureType);

    // And we set a property on it pointing to us.
    // (This is used when detecting which items have collided
    // or been shot.)
    this.sprite.sprite.game__item = this;
};

/**
 * updatePosition
 * --------------
 * Can be overridden in derived classes to update the item's position.
 */
GameItem.prototype.updatePosition = function(deltaTimeInfo) {
    // We move along the movement vector, if one is set up...
    this.moveAlongMovementVector(deltaTimeInfo);

    // If there is a sprite, we make it face the player...
    if(this.sprite !== null) {
        this.makeSpriteFacePlayer();
    }
};

/**
 * moveAlongMovementVector
 * -----------------------
 * Moves the item along its movement vector, if it has one.
 */
GameItem.prototype.moveAlongMovementVector = function(deltaTimeInfo) {
    if(this.movementVector === null) {
        return;
    }
    var deltaSeconds = deltaTimeInfo.deltaSeconds;
    var dx = this.movementVector.x * deltaSeconds;
    var dy = this.movementVector.y * deltaSeconds;
    this.position.x += dx;
    this.position.y += dy;
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
GameItem.prototype.moveTowardsPlayer = function(metersPerSecond, deltaTimeInfo, minimumDistance) {
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
    var deltaSeconds = deltaTimeInfo.deltaSeconds;
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
GameItem.prototype.checkCollision = function(deltaTimeInfo) {
    if(this.lifetimeSeconds !== null) {
        // We check if the item has reached the end of its lifetime...
        var timeAliveSeconds = (deltaTimeInfo.currentTime - this.creationTime) / 1000.0;
        if(timeAliveSeconds > this.lifetimeSeconds) {
            return true;
        }
    }
    return false;
};

/**
 * onShot
 * ------
 * Called when the item is shot.
 * Returns true if the item (monster etc) has died or should be
 * removed, false otherwise.
 */
GameItem.prototype.onShot = function(force) {
    this.strength -= force;
    return (this.strength <= 0.0);
};

/**
 * setMovementVectorTowardsPosition
 * --------------------------------
 * Sets the movement vector of the object to head towards the position
 * provided at the speed provided.
 */
GameItem.prototype.setMovementVectorTowardsPosition = function(position, metersPerSecond) {
    // We find the vector to the position...
    var movementX = position.x - this.position.x;
    var movementY = position.y - this.position.y;

    // We scale it...
    var distance = this.position.distanceFrom(position);
    movementX = movementX / distance * metersPerSecond;
    movementY = movementY / distance * metersPerSecond;

    // And set our movement vector...
    this.movementVector = new Position(movementX, movementY);
};

/**
 * setRandomMovementDirection
 * --------------------------
 * Sets the item to move in a random direction, and changes direction
 * if a certain time has elapsed.
 */
GameItem.prototype.setRandomMovementDirection = function(deltaTimeInfo, metersPerSecond, changeIntervalSeconds) {
    // We check if we want to change direction...
    var changeDirection = false;
    if(this.previousRandomDirectionChangeTime === null) {
        // We do not have a direction, so we set one...
        changeDirection = true;
    } else {
        // Has enough time elapsed?
        var elapsed = (deltaTimeInfo.currentTime - this.previousRandomDirectionChangeTime) / 1000.0;
        if(elapsed >= changeIntervalSeconds) {
            changeDirection = true;
        }
    }
    if(changeDirection === false) {
        return;
    }

    // We want to change direction, so we pick a random point...
    var x = this.position.x + Utils.randomIntBetween(-10, 10);
    var y = this.position.y + Utils.randomIntBetween(-10, 10);
    var aimAt = new Position(x, y);
    this.setMovementVectorTowardsPosition(aimAt, metersPerSecond);

    this.previousRandomDirectionChangeTime = deltaTimeInfo.currentTime;
};

