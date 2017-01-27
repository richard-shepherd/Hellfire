/**
 * GameItem_Weapon (derived from GameItem)
 * ---------------
 * Represents a weapon.
 *
 * @constructor
 */
function GameItem_Weapon(game) {
    // We call the base class's constructor...
    GameItem.call(this, game);

    // Radar info...
    this.radarInfo.showAsCircle = false;
    this.radarInfo.label = "Shotgun";
}
Utils.extend(GameItem, GameItem_Weapon); // Derived from GameItem

