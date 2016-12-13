/**
 * Utils
 * -----
 * Static utility functions.
 * @constructor
 */
function Utils() {
}

/**
 * colorToString
 * -------------
 * Converts a color to a hex string.
 */
Utils.colorToString = function(color) {
    return Utils.rgbToString(color.r, color.g, color.b);
};

/**
 * rgbToString
 * -----------
 * Converts RGB values to a color string.
 */
Utils.rgbToString = function(r, g, b) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

