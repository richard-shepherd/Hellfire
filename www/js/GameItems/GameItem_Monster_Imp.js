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
    this.setSprite(3.0, 3.0, TextureManager.TextureType.IMP);

    // The ID of the imp-attack sound...
    this.impAttackSoundID = null;
}
Utils.extend(GameItem, GameItem_Monster_Imp); // Derived from GameItem

/**
 * derivedDispose
 * --------------
 */
GameItem_Monster_Imp.prototype.derivedDispose = function() {
    this.stopAttackSound();
};

/**
 * updatePosition
 * --------------
 */
GameItem_Monster_Imp.prototype.updatePosition = function(deltaTimeInfo) {
    // If the imp is far away from the player, it moves fairly randomly
    // though with a bias to move towards the player. When it is close,
    // it heads for the player...
    var playerPosition = Position.currentPosition();
    var distanceToPlayer = this.position.distanceFrom(playerPosition);
    if(distanceToPlayer > 50.0) {
        // The imp is fairly far away, so it moves randomly...
        this.setRandomMovementDirection(deltaTimeInfo, 1.0, 10.0);
        this.moveAlongMovementVector(deltaTimeInfo);
    } else {
        // The imp is close to us, so it moves towards us...
        this.moveTowardsPlayer(3.0, deltaTimeInfo, 1.0);
    }

    // We move the imp towards the player, and make it face the player...
    this.makeSpriteFacePlayer();

    // The imp throws fireballs at the player at random intervals...
    this.throwFireball();
};

/**
 * checkCollision
 * --------------
 * Checks if an imp is next to us.
 */
GameItem_Monster_Imp.prototype.checkCollision = function(deltaTimeInfo) {
    if(this.polarPosition.distanceMeters > this.game.collisionDistanceMeters) {
        // We have not collided with the imp...
        this.stopAttackSound();
        return false;
    }

    // We have collided with the imp. It attacks us!
    this.game.hitPlayer(10.0 * deltaTimeInfo.deltaSeconds)
    this.playAttackSound();

    // We return false (ie, we do not remove the imp from the game)...
    return false;
};

/**
 * playAttackSound
 * ---------------
 * Plays the attack sound, if it is not already playing.
 */
GameItem_Monster_Imp.prototype.playAttackSound = function() {
    if(this.impAttackSoundID === null) {
        this.impAttackSoundID = AudioManager.getInstance().playLoop(AudioManager.Sounds.IMP_ATTACK, 10.0);
    }
};

/**
 * stopAttackSound
 * ---------------
 * Stops the attack sound, if it is playing.
 */
GameItem_Monster_Imp.prototype.stopAttackSound = function() {
    if(this.impAttackSoundID !== null) {
        AudioManager.getInstance().stopSound(AudioManager.Sounds.IMP_ATTACK, this.impAttackSoundID);
        this.impAttackSoundID = null;
    }
};

/**
 * throwFireball
 * -------------
 * The imp throws fireballs at random intervals.
 */
GameItem_Monster_Imp.prototype.throwFireball = function() {
    // We check if we should throw a fireball...
    if(Math.random() > 0.002) {
        return;
    }

    // We create and throw a fireball...
    var fireball = new GameItem_Fireball(this.game);
    fireball.position = this.position.clone();
    fireball.setMovementVectorTowardsPosition(Position.currentPosition(), 5.0);
    this.game.addGameItem(fireball);
};