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
VideoCanvas.drawCrosshairs = function(ringColor, context) {
    var width = context.canvas.width
    var height = context.canvas.height;

    var outerRadius = width / 3.5;
    var innerRadius = width / 40.0;
    var lineOffset = outerRadius  + width / 20.0;

    var centerX = width / 2.0;
    var centerY = height / 2.0;

    // We convert the ring color to a string...
    var ringColorString = Utils.colorToString(ringColor);

    // The outer ring...
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = ringColorString;
    context.arc(centerX, centerY, outerRadius, 0, 2*Math.PI);
    context.stroke();

    // The center ring...
    context.beginPath();
    context.strokeStyle = ringColorString;
    context.lineWidth = 1;
    context.arc(centerX, centerY, innerRadius, 0, 2*Math.PI);
    context.stroke();

    // The crosshair lines...
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.moveTo(centerX - lineOffset,centerY);
    context.lineTo(centerX + lineOffset,centerY);
    context.stroke();

    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.moveTo(centerX, centerY - lineOffset);
    context.lineTo(centerX, centerY + lineOffset);
    context.stroke();

    // The red markers...
    var numMarkers = 5;
    var markerColor = "#a00000";
    var distanceBetweenMarkers = outerRadius / (numMarkers+1);
    var markerOffset = width / 60.0;
    var markerX_Left = centerX - outerRadius + distanceBetweenMarkers;
    var markerX_Right = centerX + outerRadius - distanceBetweenMarkers;
    var markerY_Top = centerY - outerRadius + distanceBetweenMarkers;
    var markerY_Bottom = centerY + outerRadius - distanceBetweenMarkers;
    for(var i=0; i<numMarkers; ++i) {
        // We draw a left marker...
        VideoCanvas.drawLine(context, markerColor,
            markerX_Left, centerY - markerOffset,
            markerX_Left, centerY + markerOffset);

        // We draw a right marker...
        VideoCanvas.drawLine(context, markerColor,
            markerX_Right, centerY - markerOffset,
            markerX_Right, centerY + markerOffset);

        // We draw a top marker...
        VideoCanvas.drawLine(context, markerColor,
            centerX - markerOffset, markerY_Top,
            centerX + markerOffset, markerY_Top);

        // We draw a bottom marker...
        VideoCanvas.drawLine(context, markerColor,
            centerX - markerOffset, markerY_Bottom,
            centerX + markerOffset, markerY_Bottom);

        // And change the positions for the next ones...
        markerX_Left += distanceBetweenMarkers;
        markerX_Right -= distanceBetweenMarkers;
        markerY_Top += distanceBetweenMarkers;
        markerY_Bottom -= distanceBetweenMarkers;
    }
};

/**
 * drawLine
 * --------
 */
VideoCanvas.drawLine = function(context, color, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
};

/**
 * getCenterColors
 * ---------------
 * Returns an array containing the colors of a number of points around
 * the center of the image. Each point is an object with r, g, b fields.
 */
VideoCanvas.getCenterColors = function(imageData, context) {
    var colors = [];

    // We find the index of the center pixel...
    var imageWidth = context.canvas.width;
    var imageHeight = context.canvas.height;
    if(imageHeight % 2 === 0) {
        // There are an even number of rows in the image...
        var centerIndex = (imageData.length/2) + (imageWidth*2);
    } else {
        // There are an odd number of rows in the image...
        var centerIndex = (imageData.length/2);
    }

    // We get the center value...
    colors.push(VideoCanvas.getColor(imageData, centerIndex));

    // We get the color two pixels up...
    var index = centerIndex - imageWidth * 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    // Two pixels down...
    index = centerIndex + imageWidth * 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    // Two pixels to the left...
    index = centerIndex - 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    // Two pixels to the right...
    index = centerIndex + 8;
    colors.push(VideoCanvas.getColor(imageData, index));

    return colors;
};

/**
 * getAverageCenterColor
 * ---------------------
 * Returns the color of the center of the image, from the average of a
 * sample of points.
 */
VideoCanvas.getAverageCenterColor = function(imageData, context) {

    // We get a sample of colors...
    var colors = VideoCanvas.getCenterColors(imageData, context);

    // We average them...
    var totalR = 0;
    var totalG = 0;
    var totalB = 0;
    var numColors = colors.length;

    for(var i=0; i<numColors; ++i) {
        var color = colors[i];
        totalR += (color.r * color.r);
        totalG += (color.g * color.g);
        totalB += (color.b * color.b);
    }

    var r = Math.sqrt(totalR / numColors);
    var g = Math.sqrt(totalG / numColors);
    var b = Math.sqrt(totalB / numColors);
    return new Color(r, g, b);
};

/**
 * getColor
 * --------
 * Returns a Color object holding r, g, b values from the image-data array
 * at the position requested.
 */
VideoCanvas.getColor = function(imageData, index) {
    return new Color(imageData[index], imageData[index+1], imageData[index+2]);
};


