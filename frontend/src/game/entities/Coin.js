import Phaser from 'phaser';

/**
 * Collectible Coin entity with gentle idle animation and pickup effect.
 */
export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Coins remain in place and are unaffected by gravity
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setSize(14, 18);

    this.isCollected = false;

    // Gentle up-and-down idle hovering animation
    this.hoverTween = scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Handle coin collection effect
   */
  collect() {
    if (this.isCollected) return;

    this.isCollected = true;
    if (this.hoverTween) {
      this.hoverTween.stop();
    }
    this.body.enable = false;

    // Pop up and fade away
    this.scene.tweens.add({
      targets: this,
      y: this.y - 20,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 250,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
