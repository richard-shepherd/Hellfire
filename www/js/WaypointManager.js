/**
 * WaypointManager
 * ---------------
 * Manages a collection of waypoints - places you have to reach
 * in order as part of a game.
 *
 * Lets you pick waypoints, stores them and helps manage them.
 * @constructor
 */
function WaypointManager() {
    // The collection of waypoints (Position objects)...
    this.waypoints = [];

    // True when waypoints have been set up...
    this.waypointsSetUp = false;
}

/**
 * setupWaypoints
 * --------------
 * Lets you choose waypoints on a map.
 */
WaypointManager.prototype.setupWaypoints = function(swiper) {
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
    swiper.lockSwipes();

    // We show the map...
    // We add a starting waypoint at our current position...
    var waypointNumber = 1;
    var coords = LocationProvider.getInstance().position.coords;
    var map = new GMaps({
        div: "#waypoints-map",
        lat: coords.latitude,
        lng: coords.longitude,
        zoom: 18,
        mapType: "satellite",
        scaleControl: false,
        zoomControl: false,
        streetViewControl: false,
        panControl: false,
        click: onClick
    });

    // We update the start position until a waypoint is added.
    // (We do this as the initial GPS readings may not be good.)
    var startPosition = Position.currentPosition();
    var latitude = LocationProvider.getInstance().position.coords.latitude;
    var longitude = LocationProvider.getInstance().position.coords.longitude;
    setInterval(function() {
        // We get the current position...
        var coords = LocationProvider.getInstance().position.coords;
        //var latitude = coords.latitude;
        //var longitude = coords.longitude;
        var currentPosition = Position.fromLatLong(latitude, longitude);

        // If the current location has moved significantly, we re-center the map...
        // TODO: If Start marker is off the screen???
        var mapCenter = map.getCenter();
        var mapCenterPosition = Position.fromLatLong(mapCenter.lat(), mapCenter.lng());
        if(currentPosition.distanceMeters(mapCenterPosition) > 5.0) {
            map.setCenter(latitude, longitude);
        }

        // If the start position has moved significantly, we reset the
        // Start waypoint...
        if(currentPosition.distanceMeters(startPosition) > 2.0) {
            this.waypoints = [];
            map.removeOverlays();
            addWaypoint(latitude, longitude, "Start");
            startPosition = currentPosition;
        }

        latitude += 0.000005;
        longitude += 0.000005;
    }, 500);

    // We add a starting waypoint at our current position...
    addWaypoint(coords.latitude, coords.longitude, "Start");

    // Called when the map is clicked...
    function onClick(eventData) {
        addWaypoint(eventData.latLng.lat(), eventData.latLng.lng(), waypointNumber);
        waypointNumber++;

        if(waypointNumber == 4) {
            swiper.unlockSwipes();
            swiper.slideTo(Game.Slide.GUNSIGHT);
        }
    }

    // Adds a waypoint...
    function addWaypoint(latitude, longitude, name) {
        // We get a position and add a waypoint for it...
        var position = Position.fromLatLong(latitude, longitude);
        that.waypoints.push(position);

        // We show it on the map...
        map.drawOverlay({
            lat: latitude,
            lng: longitude,
            content: '<div class="waypoint-overlay">' + name + '</div>',
            verticalAlign: 'top',
            horizontalAlign: 'center'
        });
    }
};


