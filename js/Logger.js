/**
 * Logger
 * ------
 * Class with static methods for logging.
 */

/**
 *
 * @constructor
 */
function Logger() {
}

// We keep hold of the previous error, and do not write repeating errors...
Logger.previousErrorText = "";

/**
 * log
 * ---
 * Logs an info message.
 */
Logger.log = function(text) {
    // We do not log the same error repeatedly...
    if(text === Logger.previousErrorText) {
        return;
    }
    Logger.previousErrorText = text;

    // We add the date/time to the message...
    var message = new Date().toLocaleTimeString() + ": " + text;

    var newElement = $("<div></div>");
    newElement.addClass("log-line").html(message);
    $("#log").prepend(newElement);
};

/**
 * error
 * -----
 * Logs an error message.
 */
Logger.error = function(text) {
    Logger.log("ERROR: " + text);
};
