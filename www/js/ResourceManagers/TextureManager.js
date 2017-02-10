/**
 * TextureManager
 * --------------
 * Loads textures which can be applied to 3D objects.
 *
 * This class is a singleton.
 */
function TextureManager() {
    // The number of textures we manage...
    this._numTextures = 0;
    this._texturesLoaded = 0;

    // The three.js texture-loader...
    this._textureLoader = new THREE.TextureLoader();

    // Called back as textures are loaded...
    this._progressCallback = null;

    // The collection of textures...
    this._textures = {};
}

/**
 * An enum for the textures we manage.
 */
TextureManager.TextureType = {
    SHOTGUN: 1,
    AMMO_BAG: 2,
    IMP : 3
};

/**
 * The singleton instance.
 */
TextureManager._instance = null;

/**
 * getInstance
 * -----------
 * Gets the singleton instance.
 */
TextureManager.getInstance = function() {
    if(TextureManager._instance === null) {
        TextureManager._instance = new TextureManager();
    }
    return TextureManager._instance;
};

/**
 * initialize
 * ----------
 */
TextureManager.prototype.initialize = function(progressCallback) {
    this._progressCallback = progressCallback;
    this._loadTexture(TextureManager.TextureType.IMP, "imp.png");
    this._loadTexture(TextureManager.TextureType.AMMO_BAG, "ammo-bag.png");
    this._loadTexture(TextureManager.TextureType.SHOTGUN, "shotgun.png");
};

/**
 * getProgress
 * -----------
 */
TextureManager.prototype.getProgress = function() {
    return {
        text: "Loading textures",
        total: this._numTextures,
        loaded: this._texturesLoaded
    };
};

/**
 * getTexture
 * ----------
 * Returns the texture requested.
 */
TextureManager.prototype.getTexture = function(textureType) {
    return this._textures[textureType];
};

/**
 * _loadTexture
 * ------------
 * Loads the texture requested from the textures folder and calls
 * back when it is loaded.
 */
TextureManager.prototype._loadTexture = function(textureType, filename) {
    var that = this;
    this._numTextures++;
    var path = "textures/" + filename;
    this._textureLoader.load(path, function(texture) {
        that._textures[textureType] = texture;
        that._texturesLoaded++;
        if(that._progressCallback !== null) {
            that._progressCallback(that);
        }
    });
};
