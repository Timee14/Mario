import Phaser from 'phaser';

/**
 * Player entity with Arcade Physics, variable jump height, coyote time, and invincibility.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    // Add to scene & enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body configuration
    this.setCollideWorldBounds(false); // Can fall into pits
    this.setSize(18, 30);
    this.setOffset(3, 2);

    // Gameplay parameters
    this.moveSpeed = 220;
    this.jumpForce = -470;
    this.minJumpVelocity = -140;

    // Coyote time & Jump buffering
    this.coyoteDurationMs = 130;
    this.lastGroundTime = 0;
    this.jumpBufferDurationMs = 120;
    this.lastJumpPressTime = 0;

    // State flags
    this.isInvincible = false;
    this.isDead = false;
    this.isVictorious = false;

    // Setup input keys (Arrow keys + WASD)
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  update(time) {
    if (this.isDead || this.isVictorious) {
      return;
    }

    const onGround = this.body.blocked.down || this.body.touching.down;

    if (onGround) {
      this.lastGroundTime = time;
    }

    // 1. Horizontal movement
    const leftPressed = this.keys.left.isDown || this.keys.a.isDown;
    const rightPressed = this.keys.right.isDown || this.keys.d.isDown;

    if (leftPressed) {
      this.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
    } else if (rightPressed) {
      this.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // 2. Jump input detection (just down)
    const jumpJustPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.w) ||
      Phaser.Input.Keyboard.JustDown(this.keys.space);

    if (jumpJustPressed) {
      this.lastJumpPressTime = time;
    }

    const canCoyoteJump = time - this.lastGroundTime <= this.coyoteDurationMs;
    const hasBufferedJump = time - this.lastJumpPressTime <= this.jumpBufferDurationMs;

    // Trigger jump if coyote time holds and jump was recently pressed
    if (hasBufferedJump && canCoyoteJump && this.body.velocity.y >= 0) {
      this.setVelocityY(this.jumpForce);
      this.lastGroundTime = 0; // Consume coyote time
      this.lastJumpPressTime = 0; // Consume buffered jump
    }

    // 3. Variable jump height: release early to cut jump short
    const jumpHeld = this.keys.up.isDown || this.keys.w.isDown || this.keys.space.isDown;
    if (!jumpHeld && this.body.velocity.y < this.minJumpVelocity) {
      this.setVelocityY(this.minJumpVelocity);
    }
  }

  /**
   * Apply 1.5 seconds of blinking invincibility after taking damage
   */
  makeInvincible(durationMs = 1500) {
    if (this.isInvincible) return;

    this.isInvincible = true;

    // Blink tween
    this.blinkTween = this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.2, to: 1.0 },
      ease: 'Linear',
      duration: 100,
      repeat: Math.floor(durationMs / 100) - 1,
      yoyo: true,
      onComplete: () => {
        this.alpha = 1.0;
        this.isInvincible = false;
      },
    });
  }

  /**
   * Stomp an enemy: bounce upward
   */
  bounceOffEnemy() {
    this.setVelocityY(-320);
  }

  /**
   * Respawn player at a coordinate
   */
  respawn(x, y) {
    this.setVelocity(0, 0);
    this.setPosition(x, y);
    this.makeInvincible(1500);
  }
}

