/**
 * ImageManager
 * ------------
 * Loads and manages  a collection of images.
 *
 * @constructor
 */
function ImageManager() {
    // The collection of images, keyed by their enum...
    this._images = {};

    // We load the images...
}

/**
 * Image
 * -----
 * An enum for the images we manage.
 */
ImageManager.Image = {
};

/**
 * getImage
 * --------
 * Returns the image for the enum requested.
 */
ImageManager.prototype.getImage = function(imageEnum) {
    return this._images[imageEnum];
};

/**
 * _loadImage
 * ----------
 * Loads an image and stores it in our collection.
 */
ImageManager.prototype._loadImage = function(imageEnum, imagePath) {
    var image = new Image();
    image.src = imagePath;
    this._images[imageEnum] = image;
};

