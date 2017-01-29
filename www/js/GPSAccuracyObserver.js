/**
 * GPSAccuracyObserver
 * -------------------
 * Monitors the GPS accuracy and provides feedback for the splash screen.
 * @constructor
 */
function GPSAccuracyObserver() {
    this.progressCallback = null;
    this.requiredAccuracy = 5.0;
    this.currentAccuracy = 1000.0;
}

/**
 * initialize
 * ----------
 */
GPSAccuracyObserver.prototype.initialize = function(progressCallback) {
    this.progressCallback = progressCallback;

    // We sample the accuracy until we get the accuracy we require...
    var that = this;
    function checkAccuracy() {
        var position = LocationProvider.getInstance().position;
        if(position !== null) {
            that.currentAccuracy = position.coords.accuracy;
        }
        if(that.currentAccuracy > that.requiredAccuracy) {
            // We haven't got the required accuracy yet, so we
            // sample again in a while...
            setTimeout(checkAccuracy, 100);
        }
        if(that.progressCallback !== null) {
            that.progressCallback(that);
        }
    }
    checkAccuracy();
};

/**
 * getProgress
 * -----------
 * Reports progress with obtaining the accuracy we require.
 */
GPSAccuracyObserver.prototype.getProgress = function() {
    var gotRequiredAccuracy = (this.currentAccuracy <= this.requiredAccuracy) ? 1 : 0;
    return {
        text: "GPS accuracy: " + this.currentAccuracy + " (" + this.requiredAccuracy + " required)",
        total: 1,
        loaded: gotRequiredAccuracy
    };
};
