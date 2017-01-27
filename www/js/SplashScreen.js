/**
 * SplashScreen
 * ------------
 * Shows the splash screen until all data is loaded.
 */
function SplashScreen(swiper) {
    // We disable moving away from the splash screen
    // until all items are loaded...
    this.swiper = swiper;
    this.swiper.slideTo(Game.Slide.SPLASH_SCREEN);
    this.swiper.lockSwipes();

    // The collection of loaders (ImageManager, TextureManager etc).
    // Each item in the collection is:
    // { loader, div-for-showing-progress }
    this._loaderInfos = [];

    // We load the various pieces of data...
    this._load(AudioManager.getInstance());
    this._load(TextureManager.getInstance());

    // We show the initial progress (ie, none)...
    this._showProgress();
};

/**
 * _load
 * -----
 * Starts loading data for the loader passed in.
 */
SplashScreen.prototype._load = function(loader) {
    // We add a div to show progress for this loader...
    var divID = "loader-progress-" + this._loaderInfos.length;
    var div = '<div id="'+divID+'"></div>';
    $("#splash-screen-progress").append(div);

    // We register the loader...
    this._loaderInfos.push({
        loader: loader,
        divID: "#" + divID
    });

    // We start it loading its data...
    var that = this;
    loader.initialize(function() {
        that._showProgress();
    });
};

/**
 * _showProgress
 * -------------
 * Shows loading progress, and moves away from the splash screen
 * when all loading is complete.
 */
SplashScreen.prototype._showProgress = function() {

    // We check each loader to see if has completed loading...
    var loadingComplete = true;

    // We show the progress for each loader...
    for(var i=0; i<this._loaderInfos.length; ++i) {
        var loaderInfo = this._loaderInfos[i];
        var loader = loaderInfo.loader;
        var progress = loader.getProgress();
        var progressString = progress.text + ": " + progress.loaded + " / " + progress.total;
        $(loaderInfo.divID).text(progressString);

        // If any loader is not complete, loading is not complete...
        if(progress.loaded !== progress.total) {
            loadingComplete = false;
        }
    }

    // If all loaders have completed, we pause for a second and move to
    // the next screen...
    if(loadingComplete) {
        var that = this;
        setTimeout(function() {
            that.swiper.unlockSwipes();
            that.swiper.slideTo(Game.Slide.WAYPOINTS);
        }, 2000);
    }
};