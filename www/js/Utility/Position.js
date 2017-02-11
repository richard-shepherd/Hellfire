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
 * clone
 * -----
 * Returns a new position as a copy of this one.
 */
Position.prototype.clone = function() {
    return new Position(this.x, this.y);
};

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
    return Math.sqrt(distanceSquared);
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

    // Are we on one of the axes?
    if(dx === 0.0) {
        return (dy > 0.0) ? 0.0 : Math.PI;
    }
    if(dy === 0.0) {
        return (dx > 0.0) ? Math.PI * 0.5 : Math.PI * 1.5;
    }

    // We work out which quadrant we're in...
    var absdx = Math.abs(dx);
    var absdy = Math.abs(dy);
    if(dx > 0.0 && dy > 0.0) {
        // Top-right quadrant...
        return Math.atan(absdx / absdy);
    }
    if(dx > 0.0 && dy < 0.0) {
        // Bottom-right quadrant...
        return Math.PI * 0.5 + Math.atan(absdy / absdx);
    }
    if(dx < 0.0 && dy < 0.0) {
        // Bottom-left quadrant...
        return Math.PI + Math.atan(absdx / absdy);
    }
    if(dx < 0.0 && dy > 0.0) {
        // Top-left quadrant...
        return Math.PI * 1.5 + Math.atan(absdy / absdx);
    }

    return 0.0;
};