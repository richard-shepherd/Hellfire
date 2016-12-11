/**
 * VideoCanvas
 * -----------
 * Helps with manipulation of the video canvas, including reading data
 * from it and drawing onto it.
 *
 * @constructor
 */
function VideoCanvas() {
}

/**
 * drawCrosshairs
 * --------------
 * Draws targetting crosshairs on the canvas.
 * @static
 */
VideoCanvas.drawCrosshairs = function(context) {
    var width = context.canvas.width
    var height = context.canvas.height;

    var onTarget = false;

    // We draw the crosshair...
    var outerRadius = width / 8.0;
    var innerRadius = width / 40.0;
    var lineOffset = outerRadius * 1.5;

    var centerX = width / 2.0;
    var centerY = height / 2.0;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(centerX, centerY, outerRadius, 0, 2*Math.PI);
    context.stroke();

    context.beginPath();
    context.arc(centerX, centerY, innerRadius, 0, 2*Math.PI);
    if(onTarget) {
        context.fillStyle = 'red';
        context.fill();
    } else {
        context.lineWidth = 1;
        context.stroke();
    }

    context.lineWidth = 1;
    context.moveTo(centerX - lineOffset,centerY);
    context.lineTo(centerX + lineOffset,centerY);
    context.stroke();

    context.lineWidth = 1;
    context.moveTo(centerX, centerY - lineOffset);
    context.lineTo(centerX, centerY + lineOffset);
    context.stroke();
};

