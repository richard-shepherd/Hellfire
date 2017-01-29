/**
 * LocationProvider
 * ----------------
 * Subscribes to GPS position and calls back with the position.
 * Also calls back with the compass heading.
 *
 * locationCallback(position-object)
 * compassCallback(headingRadians)
 *
 * This class is a singleton.
 *
 * @constructor
 */
function LocationProvider() {
    // The position as lat-long...
    this.position = null;

    // The number of position updates we have received from the GPS...
    this.numPositionUpdates = 0;

    // The compass heading...
    this.compassHeadingRadians = 0.0;

    // The device tilt...
    this.tiltRadians = 0.0;

    // The first valid lat/long we receive. We use this as an origin for other
    // positions which we calculate as (x, y) offsets from it...
    this.originLatitude = null;
    this.originLongitude = null;
    this.metersPerDegreeLatitude = 0.0;
    this.metersPerDegreeLongitude = 0.0;

    // We start the subscription to our position and
    // compass heading...
    this._subscribeLocation();
    this._subscribeCompass();
}

// Singleton...
LocationProvider._instance = null;
LocationProvider.getInstance = function() {
    if(LocationProvider._instance == null) {
        LocationProvider._instance = new LocationProvider_Keyboard();
        //LocationProvider._instance = new LocationProvider();
    }
    return LocationProvider._instance;
};

/**
 * _subscribeLocation
 * ------------------
 * Subscribes to the GPS location.
 */
LocationProvider.prototype._subscribeLocation = function() {
    if (!navigator.geolocation) {
        Logger.log("GPS not available");
    }

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    var that = this;

    // Called when we get an update to the current position...
    function success(position) {
        try {
            // We hold the latest position...
            that.position = position;
            that.numPositionUpdates++;

            // If this is the first update we have, we set the origin...
            if(this.originLatitude == null) {
                that._setOrigin();
            }
        } catch(ex) {
            Logger.log(ex.message);
        }
    }

    // Called when we get an error from the position API...
    function error(err) {
        var message = "Location error: " + err.code + ", message: " + err.message;
        Logger.log(message);
    }

    navigator.geolocation.watchPosition(success, error, options);
};

/**
 * _setOrigin
 * ----------
 * Sets the origin to the current position and calculates the conversion
 * factors between lat/long and meters.
 */
LocationProvider.prototype._setOrigin = function() {
    // We store the origin...
    var coords = this.position.coords;
    this.originLatitude = coords.latitude;
    this.originLongitude = coords.longitude;

    // We find the conversion between distances in lat/long and meters...
    var latRadians = this.originLatitude * Math.PI / 180.0;
    this.metersPerDegreeLatitude = 111132.92 -
        559.82 * Math.cos(2*latRadians) +
        1.175 * Math.cos(4*latRadians) -
        0.0023 * Math.cos(6*latRadians);
    this.metersPerDegreeLongitude = 111412.84 * Math.cos(latRadians) -
        93.5 * Math.cos(3*latRadians) +
        0.118 * Math.cos(5*latRadians);
};

/**
 * _subscribeCompass
 * -----------------
 * Subscribes to the compass heading.
 */
LocationProvider.prototype._subscribeCompass = function() {
    var that = this;
    window.addEventListener('deviceorientationabsolute', function(orientationInfo) {
        try {
            // We store the latest compass heading...
            that.updateCompassHeading(orientationInfo.alpha, orientationInfo.beta, orientationInfo.gamma);
        } catch(ex) {
            Logger.log(ex.message);
        }
    }, false);
};

/**
 * updateCompassHeading
 * --------------
 * Converts phone orientation into a compass heading
 * in radians. (When the phone is held upright.)
 */
LocationProvider.prototype.updateCompassHeading = function(alpha, beta, gamma) {
    // Convert degrees to radians
    var alphaRad = alpha * (Math.PI / 180);
    var betaRad = beta * (Math.PI / 180);
    var gammaRad = gamma * (Math.PI / 180);

    // We update the forward / backward tilt of the device...
    this.tiltRadians = betaRad - Math.PI / 2.0;

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = 0.0;
    if(rB !== 0.0) {
        compassHeading = Math.atan(rA / rB);
    }

    // Convert from half unit circle to whole unit circle
    if(rB < 0) {
        compassHeading += Math.PI;
    }else if(rA < 0) {
        compassHeading += 2 * Math.PI;
    }

    this.compassHeadingRadians = compassHeading;
};