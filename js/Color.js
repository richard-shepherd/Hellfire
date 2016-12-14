/**
 * Color
 * -----
 * Represents an RGB color.
 * @constructor
 */
function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;

    // Ratios of parts of the color. Used when testing whether colors match.)
    this.r2g = (g !== 0.0) ? r/g : r;
    this.r2b = (b !== 0.0) ? r/b : r;
    this.g2r = (r !== 0.0) ? g/r : g;
    this.g2b = (b !== 0.0) ? g/b : g;
    this.b2r = (r !== 0.0) ? b/r : b;
    this.b2g = (g !== 0.0) ? b/g : b;
}

// Some color constants...
Color.black = new Color(0, 0, 0);

/**
 * isMatch
 * -------
 * Returns true if the two colors match to the tolerance specified,
 * false otherwise.
 *
 * The tolerance is specified as a percentage (e.g. 0.1 for 10%).
 * The color ratios must all be within this tolerance of their
 * counterparts for the color to be a match.
 */
Color.prototype.isMatch = function(other, tolerance) {
    if(Utils.percentageDifference(this.r2g, other.r2g) > tolerance) return false;
    if(Utils.percentageDifference(this.r2b, other.r2b) > tolerance) return false;
    if(Utils.percentageDifference(this.g2r, other.g2r) > tolerance) return false;
    if(Utils.percentageDifference(this.g2b, other.g2b) > tolerance) return false;
    if(Utils.percentageDifference(this.b2r, other.b2r) > tolerance) return false;
    if(Utils.percentageDifference(this.b2g, other.b2g) > tolerance) return false;
    return true;
};




