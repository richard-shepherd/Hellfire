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

/**
 * getCenterColors
 * ---------------
 * Returns an array containing the colors of a number of points around
 * the center of the image. Each point is an object with r, g, b fields.
 */
VideoCanvas.getCenterColors = function(imageData, imageWidth) {
    var colors = [];

    // We get the center value...
    var center = imageData.length / 2;
    colors.push(VideoCanvas.getColor(imageData, center));

    // We get the color two pixels up...
    var index = center - imageWidth * 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    // Two pixels down...
    index = center + imageWidth * 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    // Two pixels to the left...
    index = center - 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    // Two pixels to the right...
    index = center + 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    return colors;
};

/**
 * getAverageCenterColor
 * ---------------------
 * Returns the color of the center of the image, from the average of a
 * sample of points.
 */
VideoCanvas.getAverageCenterColor = function(imageData, imageWidth) {
    // We get a sample of colors...
    var colors = VideoCanvas.getCenterColors(imageData, imageWidth);

    // We average them...
    var totalR = 0;
    var totalG = 0;
    var totalB = 0;
    var numColors = colors.length;

    for(var i=0; i<numColors; ++i) {
        var color = colors[i];
        totalR += color.r;
        totalG += color.g;
        totalB += color.b;
    }

    return {
        r: totalR / numColors,
        g: totalG / numColors,
        b: totalB / numColors,
    };
};

/**
 * getColor
 * --------
 * Returns an object holding r, g, b values from the image-data array
 * at the position requested.
 */
VideoCanvas.getColor = function(imageData, index) {
    return {
        r: imageData[index],
        g: imageData[index+1],
        b: imageData[index+2]
    };
};


