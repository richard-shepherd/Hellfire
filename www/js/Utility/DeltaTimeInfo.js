/**
 * DeltaTimeInfo
 * -------------
 * Holds information about time elaped since a previous time.
 * @constructor
 */
function DeltaTimeInfo() {
    this.previousTime = Date.now();
    this.currentTime = this.previousTime;
    this.deltaMilliseconds = 0.0;
    this.deltaSeconds = 0.0;
}

/**
 * update
 * ------
 * Updates the info from the current time.
 */
DeltaTimeInfo.prototype.update = function() {
    this.previousTime = this.currentTime;
    this.currentTime = Date.now();
    this.deltaMilliseconds = this.currentTime - this.previousTime;
    this.deltaSeconds = this.deltaMilliseconds / 1000.0;
};


