/**
 * Position
 * --------
 * Holds a position in (x, y) meters from the origin.
 * @constructor
 */
function Position(x, y) {
    // Position in meters from the origin...
    this.x  = x;
    this.y = y;
}

/**
 * currentPosition
 * ---------------
 * Returns a Position object holding the current GPS position.
 */
Position.currentPosition = function() {
    var coords = LocationProvider.getInstance().position.coords;
    return Position.fromLatLong(coords.latitude, coords.longitude);
};

/**
 * fromLatLong
 * -----------
 * Creates a Position from (lat, long).
 */
Position.fromLatLong = function(latitude, longitude) {
    var locationProvider = LocationProvider.getInstance();
    var deltaLatitude = latitude - locationProvider.originLatitude;
    var deltaLongitude = longitude - locationProvider.originLongitude;
    var x = deltaLongitude * locationProvider.metersPerDegreeLongitude;
    var y = deltaLatitude * locationProvider.metersPerDegreeLatitude;
    return new Position(x, y);
};

/**
 * distanceMeters
 * --------------
 * Returns the distance in meters between this position and the
 * other position passed in.
 */
Position.prototype.distanceFrom = function(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    var distanceSquared = dx*dx + dy*dy;
    var distance = Math.sqrt(distanceSquared);
    return distance;
};

/**
 * angleFrom
 * ---------
 * Returns the angle of this position from the other passed in,
 * as radians clockwise from north (y-axis).
 */
Position.prototype.angleFrom = function(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    return Math.atan(dx / dy);
};