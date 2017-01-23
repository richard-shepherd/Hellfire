/**
 * GameArea
 * --------
 * Manages the geographical region in which the game is played.
 * @constructor
 */
function GameArea() {
    // The corners of the rectangular bounds of the game area...
    this.bottomLeft = new Position(0, 0);
    this.topRight = new Position(0, 0);
}

/**
 * createFromWaypoints
 * -------------------
 * Returns a GameArea which includes the waypoints passed in.
 */
GameArea.createFromWaypoints = function(waypointManager) {
    var gameArea = new GameArea();
    var waypoints = waypointManager.waypoints;
    if(waypoints.length === 0) {
        return gameArea;
    }

    // We find the max and min x and y coordinates from the waypoints...
    var firstWaypoint = waypoints[0];
    var minX = firstWaypoint.x;
    var maxX = firstWaypoint.x;
    var minY = firstWaypoint.y;
    var maxY = firstWaypoint.y;
    for(var i=1; i<waypoints.length; ++i) {
        var waypoint = waypoints[i];
        if(waypoint.x < minX) minX = waypoint.x;
        if(waypoint.x > maxX) maxX = waypoint.x;
        if(waypoint.y < minY) minY = waypoint.y;
        if(waypoint.y > maxY) maxY = waypoint.y;
    }

    // We set the game area from them, plus a margin (in meters)...
    var margin = 20.0;
    gameArea.bottomLeft.x = minX - margin;
    gameArea.bottomLeft.y = minY - margin;
    gameArea.topRight.x = maxX + margin;
    gameArea.topRight.y = maxY + margin;

    return gameArea;
};
