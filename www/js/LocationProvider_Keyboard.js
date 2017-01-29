/**
 * LocationProvider_Keyboard
 * -------------------------
 * A replacement for the GPS location provider which uses the keyboard
 * to move around.
 *
 * The left and right arrows rotate the compass heading.
 * the upda and down arrows move forward and backward.
 * @constructor
 */
function LocationProvider_Keyboard() {
    // Our lat, long position...
    this.position = {
        coords: {
            latitude: 54.2038911,
            longitude: -4.6332735,
            accuracy: 2.5
        }
    };

    // The number of position updates we have received from the GPS...
    this.numPositionUpdates = 0;

    // The compass heading...
    this.compassHeadingRadians = 0.0;

    // The device orientation...
    this.tiltRadians = 0.0;

    // The first valid lat/long we receive. We use this as an origin for other
    // positions which we calculate as (x, y) offsets from it...
    this.originLatitude = 54.2038911;
    this.originLongitude = -4.6332735;
    this.metersPerDegreeLatitude = 111308.75623514662;
    this.metersPerDegreeLongitude = 65254.88819208189;

    var that = this;

    // We note which keys are pressed...
    this.keysPressed = {};
    $(document).keydown(function(e) {
        that.keysPressed[e.which] = true;
    });
    $(document).keyup(function(e) {
        delete that.keysPressed[e.which];
    });

    // We check the keys every now and again...
    setInterval(function() {
        that.updatePosition();
    }, 50);
}

/**
 * updatePosition
 * --------------
 * Checks which keys are pressed and updates our position.
 */
LocationProvider_Keyboard.prototype.updatePosition = function() {
    var compassChangePerUpdate = 0.05;
    var distanceChangePerUpdate = 1.0;

    // Left arrow...
    if(37 in this.keysPressed) {
        this.compassHeadingRadians -= compassChangePerUpdate;
    }

    // Right arrow...
    if(39 in this.keysPressed) {
        this.compassHeadingRadians += compassChangePerUpdate;
    }

    var dx = distanceChangePerUpdate * Math.sin(this.compassHeadingRadians);
    var dy = distanceChangePerUpdate * Math.cos(this.compassHeadingRadians);
    var dlat = dy / this.metersPerDegreeLatitude;
    var dlong = dx / this.metersPerDegreeLongitude;

    // Up arrow...
    if(38 in this.keysPressed) {
        this.position.coords.latitude += dlat;
        this.position.coords.longitude += dlong;
    }

    // Down arrow...
    if(40 in this.keysPressed) {
        this.position.coords.latitude -= dlat;
        this.position.coords.longitude -= dlong;
    }
};
