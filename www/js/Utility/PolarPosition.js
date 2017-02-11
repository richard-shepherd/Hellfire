/**
 * PolarPosition
 * -------------
 * Holds a position as polar coordinates relative to the current
 * position of the player.
 */
function PolarPosition(distanceMeters, angleRadians) {
    // The distance in meters from the current position...
    this.distanceMeters = distanceMeters;

    // The angle (clockwise from north) in radians...
    this.angleRadians = angleRadians;
}

/**
 * fromPosition
 * ------------
 * Updates the polar position from the (x, y) position passed in, relative
 * to the origin passed in.
 */
PolarPosition.prototype.updateFromPosition = function(position, origin) {
    this.distanceMeters = position.distanceFrom(origin);
    this.angleRadians = position.angleFrom(origin);
};
