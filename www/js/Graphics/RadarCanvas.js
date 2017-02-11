/**
 * RadarCanvas
 * -----------
 * Manages the radar, showing the positions of players
 * and items relative to us.
 *
 * @constructor
 */
function RadarCanvas(canvasContext) {
    this.canvasContext = canvasContext;

    // The canvas size...
    this._canvasWidth = 1.0;
    this._canvasHeight = 1.0;
    this._radarRadius = 0.5;

    // The distance we cover on the radar...
    this.radarDistanceMeters = 200.0;

    // The most recent compass heading...
    this._compassHeadingRadians = 0.0;

    // The angle of the radar line (clockwise from north)...
    this._radarLineAngleRadians = 0.0;
    this._previousRadarLineAngleRadians = 0.0;

    // The number of seconds it takes to sweep the entire circle
    // with the radar...
    this._radarSweepTimeMilliseconds = 4000.0;

    // We pre-render some of the items for efficiency...
    this._radarCanvas = this._createCanvas();
    this._radarSweep = this._createCanvas();
    this._compass = this._createCanvas();
    this._grid = this._createCanvas();
}

/**
 * _createCanvas
 * -------------
 * Creates a canvas with defaults.
 */
RadarCanvas.prototype._createCanvas = function() {
    var canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return {
        canvas: canvas,
        ctx: canvas.getContext("2d")
    };
};

/**
 * showRadar
 * ---------
 * Shows the radar.
 */
RadarCanvas.prototype.showRadar = function(compassHeadingRadians, gameItems, deltaTimeInfo, ringColor) {
    try {
        var ctx = this.canvasContext;

        // We find the current size of the canvas...
        this._canvasWidth = ctx.canvas.width;
        this._canvasHeight = ctx.canvas.height;
        this._radarSide = Math.min(this._canvasWidth, this._canvasHeight);
        this._radarRadius = this._radarSide / 2.0;
        this._radarRadius *= 0.95;

        // We make sure the pre-rendered canvases are up to date...
        this._preRenderCanvases();

        // We draw the radar to its own (square) canvas...
        this._radarCanvas.canvas.width = this._radarSide;
        this._radarCanvas.canvas.height = this._radarSide;

        this._radarCanvas.ctx.clearRect(0, 0, this._radarSide, this._radarSide);

        // We show the sweeping, green radar line...
        this._drawRadarLine(deltaTimeInfo);

        // We show the compass...
        this._compassHeadingRadians = compassHeadingRadians;
        this._drawCompass();

        // We draw the radar grid and crosshairs...
        this._drawGrid(ringColor);

        // We draw the game items...
        this._updateGameItemAlpha(gameItems);
        this._drawGameItems(gameItems, compassHeadingRadians);

        // And we show the radar canvas over the video canvas...
        var xOffset = (this._canvasWidth - this._radarSide) / 2.0;
        var yOffset = (this._canvasHeight - this._radarSide) / 2.0;
        this.canvasContext.drawImage(this._radarCanvas.canvas, xOffset, yOffset);

        // We note the radar-line angle for next time...
        this._previousRadarLineAngleRadians = this._radarLineAngleRadians;
    } catch(ex) {
        Logger.log(ex.message);
    }
};

/**
 * _preRenderCanvases
 * ------------------
 * Pre-renders the static canvases if the size of the main canvas has changed.
 */
RadarCanvas.prototype._preRenderCanvases = function() {
    if(this._radarSide === this._radarSweep.canvas.width) {
        // The pre-rendered canvases are already the right size...
        return;
    }

    Logger.log("Pre-rendering canvases. Size=" + this._radarSide);

    // We pre-render canvases for the static elements...
    this._preRenderCanvas_RadarSweep();
    this._preRenderCanvas_Compass();
    this._preRenderCanvas_Grid();
};

/**
 * _preRenderCanvas_RadarSweep
 * ---------------------------
 * Creates the radar-sweep canvas.
 */
RadarCanvas.prototype._preRenderCanvas_RadarSweep = function() {
    try {
        var canvas = this._radarSweep.canvas;
        var ctx = this._radarSweep.ctx;

        // We set the canvas to the desired size, and clear it...
        canvas.width = this._radarSide;
        canvas.height = this._radarSide;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // We set the origin to the center of the canvas, and with
        // rotation...
        ctx.save();
        ctx.translate(canvas.width / 2.0, canvas.height / 2.0);

        // We show the radar as a number of bands fading from
        // green to black...
        var numBands = 20;
        var alpha = 1.0;
        var alphaOffset = alpha / (numBands + 1);
        var bandWidthRadians = 0.04;
        var angle = -0.5 * Math.PI;
        for(var i=0; i<numBands; ++i) {
            ctx.fillStyle = Utils.rgbaToString(20, 100, 20, alpha);
            ctx.beginPath();
            ctx.arc(0, 0, this._radarRadius, angle, angle-bandWidthRadians, true);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            alpha -= alphaOffset;
            angle -= (bandWidthRadians * 0.5);
        }
    } finally {
        ctx.restore();
    }
};

/**
 * _preRenderCanvas_Compass
 * ------------------------
 * Pre-renders the compass.
 */
RadarCanvas.prototype._preRenderCanvas_Compass = function() {
    try {
        var canvas = this._compass.canvas;
        var ctx = this._compass.ctx;

        // We set the canvas to the desired size, and clear it...
        canvas.width = this._radarSide;
        canvas.height = this._radarSide;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // We set the origin to the center of the canvas...
        ctx.save();
        ctx.translate(canvas.width / 2.0, canvas.height / 2.0);

        var numLines = 72;
        var angleBetweenLines = 2.0 * Math.PI / numLines;
        for(var i=0; i<numLines; ++i) {
            ctx.beginPath();
            ctx.strokeStyle = '#dddddd';
            ctx.lineWidth = 3;
            if(i%2 === 0) {
                ctx.moveTo(0, 0.93 * this._radarRadius);
            } else {
                ctx.moveTo(0, 0.96 * this._radarRadius);
            }
            ctx.lineTo(0, this._radarRadius);
            ctx.stroke();

            ctx.rotate(angleBetweenLines);
        }

        // We show the N, E, W, S labels...
        var fontSize = Math.floor(this._radarSide / 22.0);
        var fontOffset = fontSize / 2.0 * 0.8;
        ctx.font =  fontSize +  "px Arial";
        ctx.textAlign = "center";
        ctx.strokeStyle = "#404040";

        ctx.fillStyle = "red";
        ctx.strokeText("N", 0, -1.0 * this._radarRadius + fontOffset*1.0);
        ctx.fillText("N", 0, -1.0 * this._radarRadius + fontOffset*1.0);

        ctx.font =  fontSize/1.3 +  "px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.strokeText("S", 0, this._radarRadius + fontOffset*1.0);
        ctx.fillText("S", 0, this._radarRadius + fontOffset*1.0);
        ctx.strokeText("W", -1.0 * this._radarRadius - fontOffset*0.0, fontOffset*0.8);
        ctx.fillText("W", -1.0 * this._radarRadius - fontOffset*0.0, fontOffset*0.8);
        ctx.strokeText("E", this._radarRadius + fontOffset*0.1, fontOffset*0.8);
        ctx.fillText("E", this._radarRadius + fontOffset*0.1, fontOffset*0.8);
    } finally {
        ctx.restore();
    }
};

/**
 * _preRenderCanvas_Grid
 * ---------------------
 * Pre-renders the grid and crosshairs.
 */
RadarCanvas.prototype._preRenderCanvas_Grid = function() {
    try {
        var canvas = this._grid.canvas;
        var ctx = this._grid.ctx;

        // We set the canvas to the desired size, and clear it...
        canvas.width = this._radarSide;
        canvas.height = this._radarSide;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // We set the origin to the center of the canvas (with no rotation)...
        ctx.save();
        ctx.translate(canvas.width / 2.0, canvas.height / 2.0);

        // We draw crosshair lines...
        var lineColor = "#008000"
        var textColor = "#408000"
        var circleColor = "#408000"

        // Draws a line...
        function drawLine(color, width, x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        };

        // Circles with labels at set distances...
        var fontSize = Math.floor(canvas.width / 40.0);
        var fontOffset = canvas.width / 150.0;
        ctx.font =  fontSize +  "px Arial";
        ctx.fillStyle = textColor;
        ctx.textAlign = "left";

        // Circle color and style...
        ctx.lineWidth = 2;
        ctx.strokeStyle = circleColor;
        ctx.setLineDash([2, 3]);

        // A function to draw a circle at a distance-fraction from the center...
        var that = this;
        function drawDistanceCircle(distance) {
            ctx.beginPath();
            ctx.arc(0, 0, distance * that._radarRadius, 0, 2.0 * Math.PI);
            ctx.stroke();
            var text = distance * that.radarDistanceMeters + "m";
            ctx.fillText(text, fontOffset, -1.0 * distance * that._radarRadius - fontOffset);
        }
        drawDistanceCircle(0.25);
        drawDistanceCircle(0.5);
        drawDistanceCircle(0.75);
        drawDistanceCircle(1.0);

        // We draw the crosshairs...
        ctx.setLineDash([]);
        var outerRadius = this._radarRadius / 1.5;

        // The crosshair lines...
        var lineFraction = 0.92;
        drawLine("black", 2, -1.0 * lineFraction * this._radarRadius, 0, lineFraction * this._radarRadius, 0);
        drawLine("black", 2, 0, -1.0 * lineFraction * this._radarRadius, 0, lineFraction * this._radarRadius);

        // The red markers...
        var numMarkers = 5;
        var markerColor = "#a00000";
        var distanceBetweenMarkers = outerRadius / (numMarkers+1);
        var markerOffset = this._radarRadius / 25.0;
        var markerX_Left = -1.0 * outerRadius + distanceBetweenMarkers;
        var markerX_Right = outerRadius - distanceBetweenMarkers;
        var markerY_Top = -1.0 * outerRadius + distanceBetweenMarkers;
        var markerY_Bottom = outerRadius - distanceBetweenMarkers;
        for(var i=0; i<numMarkers; ++i) {
            // We draw a left marker...
            drawLine(markerColor, 2,
                markerX_Left, -1.0 * markerOffset,
                markerX_Left, markerOffset);

            // We draw a right marker...
            drawLine(markerColor, 2,
                markerX_Right, -1.0 * markerOffset,
                markerX_Right, markerOffset);

            // We draw a top marker...
            drawLine(markerColor, 2,
                -1.0 * markerOffset, markerY_Top,
                markerOffset, markerY_Top);

            // We draw a bottom marker...
            drawLine(markerColor, 2,
                -1.0 * markerOffset, markerY_Bottom,
                markerOffset, markerY_Bottom);

            // And change the positions for the next ones...
            markerX_Left += distanceBetweenMarkers;
            markerX_Right -= distanceBetweenMarkers;
            markerY_Top += distanceBetweenMarkers;
            markerY_Bottom -= distanceBetweenMarkers;
        }
    } catch(ex) {
        Logger.log("Pre-rendering grid: " + ex.message);
    }
    finally {
        ctx.restore();
    }
};

/**
 * _drawCrosshairRings
 * -------------------
 * Draws the rings of the crosshair.
 */
RadarCanvas.prototype._drawCrosshairRings = function(ctx, color) {
    var outerRadius = this._radarRadius / 1.6;
    var innerRadius = this._radarRadius / 17.0;
    var centerX = ctx.canvas.width / 2.0;
    var centerY = ctx.canvas.height / 2.0;

    // We convert the ring color to a string...
    var ringColorString = Utils.colorToString(color);

    // The outer ring...
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = ringColorString;
    ctx.arc(centerX, centerY, outerRadius, 0, 2*Math.PI);
    ctx.stroke();

    // The center ring...
    ctx.beginPath();
    ctx.strokeStyle = ringColorString;
    ctx.lineWidth = 2;
    ctx.arc(centerX, centerY, innerRadius, 0, 2*Math.PI);
    ctx.stroke();
};

/**
 * _updateGameItemAlpha
 * --------------------
 * Updates the alpha (visibility) for the game items.
 *
 * We show each item as the radar sweeps past it, and then it fades.
 */
RadarCanvas.prototype._updateGameItemAlpha = function(gameItems) {
    var now = Date.now();
    var fadeTime = this._radarSweepTimeMilliseconds / 1.5;

    // We check each game item...
    for(var key in gameItems) {
        var gameItem = gameItems[key];

        if(gameItem.polarPosition.distanceMeters > this.radarDistanceMeters) {
            // The item is out of range...
            gameItem.radarInfo.timeShown = null;
            gameItem.radarInfo.alpha = 0.0;
            continue;
        }

        // The item is in range...

        // We check if the radar has swept past it since we last checked...
        if(this._radarLineAngleRadians >= gameItem.polarPosition.angleRadians &&
            (this._previousRadarLineAngleRadians < gameItem.polarPosition.angleRadians ||
            this._radarLineAngleRadians < this._previousRadarLineAngleRadians)) {
            // The radar line has gone past the item...
            gameItem.radarInfo.timeShown = now;
        }

        // We update the alpha...
        if(gameItem.radarInfo.timeShown === null) {
            // The item has not been touched by the radar yet...
            continue;
        }

        // We fade from full visibility to transparency over half the radar sweep time...
        var timeDelta = now - gameItem.radarInfo.timeShown;
        gameItem.radarInfo.alpha = 1.0 - timeDelta / fadeTime;
        if(gameItem.radarInfo.alpha < 0.0) {
            gameItem.radarInfo.alpha = 0.0;
        }
    }
};

/**
 * _drawGameItems
 * --------------
 * Shows the game items on the radar.
 */
RadarCanvas.prototype._drawGameItems = function(gameItems, compassHeadingRadians) {
    try {
        var ctx = this._radarCanvas.ctx;
        var size = ctx.canvas.width;
        var halfSize = size / 2.0;

        // We set the origin to the center of the canvas (with no rotation)...
        ctx.save();
        ctx.translate(halfSize, halfSize);

        // We set the text size for items...
        var fontSize = Math.floor(size / 20.0);
        ctx.font =  fontSize +  "px Arial";
        ctx.textAlign = "left";

        // We show each item...
        var currentPosition = Position.currentPosition();
        for(var key in gameItems) {
            this._drawGameItem(ctx, gameItems[key], compassHeadingRadians, currentPosition);
        }
    } finally {
        ctx.restore();
    }
};

/**
 * _drawGameItem
 * -------------
 * Shows one game item on the radar.
 */
RadarCanvas.prototype._drawGameItem = function(ctx, gameItem, compassHeadingRadians, currentPosition) {

    // If the object is too far away, we do not show it...
    var distance = gameItem.polarPosition.distanceMeters;
    if(distance > this.radarDistanceMeters) {
        return;
    }

    // We know:
    // - The distance of the item from us.
    // - The angle in radians, clockwise from north.

    // We adjust the angle for the compass heading...
    var angle = gameItem.polarPosition.angleRadians;
    angle -= compassHeadingRadians;

    // We convert the position to (x, y) coordinates in meters...
    var xMeters = Math.sin(angle) * distance;
    var yMeters = Math.cos(angle) * distance;

    // We convert the distances to pixels...
    var x = xMeters / this.radarDistanceMeters * this._radarRadius;
    var y = -1.0 * yMeters / this.radarDistanceMeters * this._radarRadius;

    // Text color...
    var textFillColor = Utils.rgbaToString(0, 255, 0, gameItem.radarInfo.alpha);
    var textStrokeColor = Utils.rgbaToString(0, 0, 0, gameItem.radarInfo.alpha);

    // We show the item...
    ctx.lineWidth = 1;
    if(gameItem.radarInfo.showAsCircle) {
        // We show a colored circle for the item (which is most likely a player)...
        var circleRadius = this._radarSide / 60.0;
        var itemColor = gameItem.radarInfo.circleColor;
        var color = Utils.rgbaToString(itemColor.r, itemColor.g, itemColor.b, gameItem.radarInfo.alpha);
        var outlineColor = Utils.rgbaToString(0, 0, 0, gameItem.radarInfo.alpha);

        // We show a circle...
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = outlineColor;
        ctx.arc(x, y, circleRadius, 0, 2.0 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // And the label...
        var text = gameItem.radarInfo.label;
        ctx.fillStyle = textFillColor;
        ctx.strokeStyle = textStrokeColor;
        var xOffset = circleRadius * 1.3;
        var yOffset = circleRadius * 0.7;
        ctx.strokeText(text, x + xOffset, y + yOffset);
        ctx.fillText(text, x + xOffset, y + yOffset);
    } else {
        // We show a text label for the item...
        var text = "+" + gameItem.radarInfo.label;
        ctx.fillStyle = textFillColor;
        ctx.strokeStyle = textStrokeColor;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
    }
};

/**
 * _drawGrid
 * ---------
 * Draws the radar grid.
 */
RadarCanvas.prototype._drawGrid = function(ringColor) {
    var destCtx = this._radarCanvas.ctx;
    destCtx.drawImage(this._grid.canvas, 0, 0);

    // We show the targetting ring color...
    if(ringColor) {
        this._drawCrosshairRings(destCtx, ringColor);
    } else {
        this._drawCrosshairRings(destCtx, Color.black);
    }
};

/**
 * _drawRadarLine
 * --------------
 * Draws the sweeping, green radar line.
 */
RadarCanvas.prototype._drawRadarLine = function(deltaTimeInfo) {
    try {
        var sourceCanvas = this._radarSweep.canvas;
        var destCtx = this._radarCanvas.ctx;
        var halfSize = destCtx.canvas.width / 2.0;

        // We set the origin to the center of the canvas, and with
        // rotation...
        destCtx.save();
        destCtx.translate(halfSize, halfSize);
        destCtx.rotate(-1.0 * this._compassHeadingRadians);

        // We update the angle...
        var offsetRadians = deltaTimeInfo.deltaMilliseconds / this._radarSweepTimeMilliseconds * 2.0 * Math.PI;
        this._radarLineAngleRadians += offsetRadians;
        while(this._radarLineAngleRadians > 2.0 * Math.PI) {
            this._radarLineAngleRadians -= 2.0 * Math.PI;
        }
        destCtx.rotate(this._radarLineAngleRadians);

        // We show the pre-rendered radar sweep...
        destCtx.translate(-1.0 * halfSize, -1.0 * halfSize);
        destCtx.drawImage(sourceCanvas, 0, 0);
    } finally {
        destCtx.restore();
    }
};

/**
 * _drawCompass
 * ------------
 * Draws the compass.
 */
RadarCanvas.prototype._drawCompass = function() {
    try {
        var sourceCanvas = this._compass.canvas;
        var destCtx = this._radarCanvas.ctx;
        var halfSize = destCtx.canvas.width / 2.0;

        // We set the origin to the center of the canvas, and with
        // rotation...
        destCtx.save();
        destCtx.translate(halfSize, halfSize);
        destCtx.rotate(-1.0 * this._compassHeadingRadians);

        // We show the pre-rendered compass...
        destCtx.translate(-1.0 * halfSize, -1.0 * halfSize);
        destCtx.drawImage(sourceCanvas, 0, 0);
    } finally {
        destCtx.restore();
    }
};
