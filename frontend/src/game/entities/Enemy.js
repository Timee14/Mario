import Phaser from 'phaser';

/**
 * Enemy entity (Goomba-like) that patrols, reverses at walls and platform edges,
 * and can be stomped by the player.
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.setSize(20, 22);
    this.setOffset(2, 2);

    this.speed = 65;
    this.direction = -1; // -1 = moving left, 1 = moving right
    this.isDead = false;

    this.setVelocityX(this.direction * this.speed);
  }

  update() {
    if (this.isDead) return;

    // Destroy if fallen out of world
    if (this.y > 600) {
      this.destroy();
      return;
    }

    // 1. Reverse at wall collisions
    if (this.body.blocked.left || this.body.touching.left) {
      this.setDirection(1);
    } else if (this.body.blocked.right || this.body.touching.right) {
      this.setDirection(-1);
    }

    // 2. Reverse at platform edges (prevent walking off cliffs)
    if (this.body.blocked.down || this.body.touching.down) {
      const probeX = this.x + (this.direction > 0 ? 14 : -14);
      const probeY = this.y + 18;
      if (this.scene.hasGroundAt && !this.scene.hasGroundAt(probeX, probeY)) {
        this.setDirection(-this.direction);
      }
    }

    // Keep horizontal patrol velocity constant
    this.setVelocityX(this.direction * this.speed);
  }

  setDirection(dir) {
    this.direction = dir;
    this.setVelocityX(this.direction * this.speed);
    this.setFlipX(this.direction > 0);
  }

  /**
   * Handle enemy being stomped by player
   */
  stomp() {
    if (this.isDead) return;

    this.isDead = true;
    this.setTexture('enemy_squashed');
    this.body.enable = false; // Disable further collisions
    this.setVelocity(0, 0);

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 250,
      ease: 'Linear',
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
