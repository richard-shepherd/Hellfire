/**
 * Controls the game.
 *
 * @constructor
 */
function Game() {
    // We set up the camera...
    this._setupCamera();
}

/**
 * _setupCamera
 * ------------
 * Connects to the camera.
 */
Game.prototype._setupCamera = function() {
    // We set up the camera to show its image on a canvas (so we can
    // access the data and draw on it ourselves).
    var that = this;
    var cameraOptions = {
        showCanvas: {
            canvasElementID: "video-canvas",
            imageDataCallback: function(data, canvasContext) { that._onVideoDataUpdated(data, canvasContext); },
            sampleIntervalMilliseconds: 33
        }
    };
    this.camera = new Camera(cameraOptions);
};

/**
 *_onVideoDataUpdated
 * ------------------
 * Called when we get a new frame from the camera.
 *
 * Note: This is the main "message loop" callback for the game.
 */
Game.prototype._onVideoDataUpdated =  function (data, canvasContext) {
    var width = canvasContext.canvas.width
    var height = canvasContext.canvas.height;

    var onTarget = false;

    // We draw the crosshair...
    var outerRadius = width / 8.0;
    var innerRadius = width / 40.0;
    var lineOffset = outerRadius * 1.5;

    var centerX = width / 2.0;
    var centerY = height / 2.0;
    canvasContext.lineWidth = 2;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, outerRadius, 0, 2*Math.PI);
    canvasContext.stroke();

    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, innerRadius, 0, 2*Math.PI);
    if(onTarget) {
        canvasContext.fillStyle = 'red';
        canvasContext.fill();
    } else {
        canvasContext.lineWidth = 1;
        canvasContext.stroke();
    }

    canvasContext.lineWidth = 1;
    canvasContext.moveTo(centerX - lineOffset,centerY);
    canvasContext.lineTo(centerX + lineOffset,centerY);
    canvasContext.stroke();

    canvasContext.lineWidth = 1;
    canvasContext.moveTo(centerX, centerY - lineOffset);
    canvasContext.lineTo(centerX, centerY + lineOffset);
    canvasContext.stroke();
}

