/**
 * WaypointManager
 * ---------------
 * Manages a collection of waypoints - places you have to reach
 * in order as part of a game.
 *
 * Lets you pick waypoints, stores them and helps manage them.
 * @constructor
 */
function WaypointManager(swiper) {
    // The collection of waypoints (Position objects)...
    this.waypoints = [];
    this.nextWaypointNumber = 1;

    // True when waypoints have been set up...
    this.waypointsSetUp = false;

    // The swiper...
    this.swiper = swiper;

    // The map...
    this.map = null;

    // Button handlers...
    var that = this;
    $("#waypoints-reset-button").click(function() { that.onResetButtonClicked(); });
    $("#waypoints-play-button").click(function() { that.onPlayButtonClicked(); });
}

/**
 * onResetButtonClicked
 * --------------------
 */
WaypointManager.prototype.onResetButtonClicked = function() {
    try {
        // We remove old waypoints...
        this.map.removeOverlays();
        this.waypoints.length = 0;
        this.nextWaypointNumber = 1;

        // We center the map on the current position...
        var coords = LocationProvider.getInstance().position.coords;
        this.map.setCenter(coords.latitude, coords.longitude);

        // We add a new Start waypoint at the current location...
        this.addStartWaypoint();
    } catch(ex) {
        Logger.log(ex.message);
    }

};

/**
 * onPlayButtonClicked
 * -------------------
 */
WaypointManager.prototype.onPlayButtonClicked = function() {
    try {
        this.swiper.unlockSwipes();
        this.swiper.slideTo(Game.Slide.GUNSIGHT);
    } catch(ex) {
        Logger.log(ex.message);
    }

};

/**
 * addStartWaypoint
 * ----------------
 * Adds the Start waypoint in the current position.
 */
WaypointManager.prototype.addStartWaypoint = function() {
    var coords = LocationProvider.getInstance().position.coords;
    this.addWaypoint(coords.latitude, coords.longitude, "Start");
};

/**
 * addWaypoint
 * -----------
 * Adds a waypoint for the position specified.
 */
WaypointManager.prototype.addWaypoint = function(latitude, longitude, name) {
    // We get a position and add a waypoint for it...
    var position = Position.fromLatLong(latitude, longitude);
    this.waypoints.push(position);

    // We show it on the map...
    this.map.drawOverlay({
        lat: latitude,
        lng: longitude,
        content: '<div class="waypoint-overlay">' + name + '</div>',
        verticalAlign: 'top',
        horizontalAlign: 'center'
    });
};

/**
 * onMapClicked
 * ------------
 * Called when the map is clicked.
 */
WaypointManager.prototype.onMapClicked = function(eventData) {
    try {
        this.addWaypoint(eventData.latLng.lat(), eventData.latLng.lng(), this.nextWaypointNumber);
        this.nextWaypointNumber++;
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * setupWaypoints
 * --------------
 * Lets you choose waypoints on a map.
 */
WaypointManager.prototype.setupWaypoints = function() {
    if(this.waypointsSetUp) {
        // Waypoints for this game have already been set up...
        return;
    }
    this.waypointsSetUp = true;

    // This is the first time we are showing the waypoints screen.
    // We show a map, and let the user select waypoints.
    var that = this;

    // We disable swiping, as it interferes with moving around
    // the map...
    this.swiper.lockSwipes();

    // We show the map...
    var waypointNumber = 1;
    var coords = LocationProvider.getInstance().position.coords;
    this.map = new GMaps({
        div: "#waypoints-map",
        lat: coords.latitude,
        lng: coords.longitude,
        zoom: 18,
        mapType: "satellite",
        scaleControl: false,
        zoomControl: false,
        streetViewControl: false,
        panControl: false,
        click: function(eventData) { that.onMapClicked(eventData); }
    });

    // We add the Start waypoint...
    this.addStartWaypoint();
};


