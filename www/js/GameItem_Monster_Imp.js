/**
 * GameItem_Monster_Imp (derived from GameItem)
 * --------------------
 * Manages an Imp.
 */
function GameItem_Monster_Imp(game) {
    // We call the base class's constructor...
    GameItem.call(this, {game: game, isEnemy: true});

    // Radar info...
    this.radarInfo.showAsCircle = false;
    this.radarInfo.label = "Imp";

    // The sprite...
    this.sprite = game.threeDCanvas.createSprite(
        this.position.x, this.position.y,
        20.0, 20.0,
        TextureManager.TextureType.IMP);

    // The ID of the imp-attack sound...
    this.impAttackSoundID = null;
}
Utils.extend(GameItem, GameItem_Monster_Imp); // Derived from GameItem

/**
 * updatePosition
 * --------------
 */
GameItem_Monster_Imp.prototype.updatePosition = function(deltaMilliseconds) {
    // We move the imp towards the player, and make it face the player...
    //this.moveTowardsPlayer(3.0, deltaMilliseconds, 2.0);
    this.makeSpriteFacePlayer();
};

/**
 * checkCollision
 * --------------
 * Checks if an imp is next to us.
 */
GameItem_Monster_Imp.prototype.checkCollision = function() {
    if(this.polarPosition.distanceMeters > this.game.collisionDistanceMeters) {
        // We have not collided with the imp...
        if(this.impAttackSoundID !== null) {
            AudioManager.getInstance().stopSound(AudioManager.Sounds.IMP_ATTACK, this.impAttackSoundID);
            this.impAttackSoundID = null;
        }
        return false;
    }

    // We have collided with the imp. It attacks us!
    if(this.impAttackSoundID === null) {
        this.impAttackSoundID = AudioManager.getInstance().playLoop(AudioManager.Sounds.IMP_ATTACK, 10.0);
    }

    // We return false (ie, we do not remove the imp from the game)...
    return false;
};
