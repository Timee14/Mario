import Phaser from 'phaser';

/**
 * BootScene generates all procedural pixel-art style textures using Phaser Graphics.
 * No external image assets or files are needed.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.createPlayerTexture();
    this.createEnemyTextures();
    this.createTileTextures();
    this.createCoinTexture();
    this.createFlagTextures();

    // Proceed directly to the main level scene
    this.scene.start('LevelScene');
  }

  /**
   * Procedurally draw Mario-inspired player character (24x32 px)
   */
  createPlayerTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Red cap
    g.fillStyle(0xd62828, 1);
    g.fillRect(4, 2, 16, 6);
    g.fillRect(8, 0, 10, 4);
    g.fillRect(16, 5, 6, 3); // bill of cap

    // Skin face
    g.fillStyle(0xffcb9a, 1);
    g.fillRect(6, 8, 14, 8);

    // Eye & mustache
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(14, 9, 2, 3); // eye
    g.fillRect(12, 13, 8, 3); // mustache

    // Hair / sideburn
    g.fillStyle(0x5a2d0c, 1);
    g.fillRect(4, 8, 4, 6);

    // Red shirt
    g.fillStyle(0xd62828, 1);
    g.fillRect(4, 16, 16, 8);

    // Blue overalls
    g.fillStyle(0x0077b6, 1);
    g.fillRect(6, 18, 12, 8);
    g.fillRect(6, 18, 3, 4); // left strap
    g.fillRect(15, 18, 3, 4); // right strap

    // Yellow overall buttons
    g.fillStyle(0xffd166, 1);
    g.fillRect(7, 21, 2, 2);
    g.fillRect(15, 21, 2, 2);

    // Hands
    g.fillStyle(0xffcb9a, 1);
    g.fillRect(2, 20, 4, 4);
    g.fillRect(18, 20, 4, 4);

    // Pants legs & brown shoes
    g.fillStyle(0x0077b6, 1);
    g.fillRect(5, 26, 5, 3);
    g.fillRect(14, 26, 5, 3);

    g.fillStyle(0x4a2810, 1);
    g.fillRect(4, 29, 7, 3);
    g.fillRect(13, 29, 7, 3);

    g.generateTexture('player', 24, 32);
    g.destroy();
  }

  /**
   * Procedurally draw Goomba-inspired walking & squashed enemy textures
   */
  createEnemyTextures() {
    // Normal enemy (24x24 px)
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Brown mushroom cap
    g.fillStyle(0x8b4513, 1);
    g.fillRoundedRect(2, 2, 20, 15, 6);

    // Cream body stem
    g.fillStyle(0xf5deb3, 1);
    g.fillRect(6, 13, 12, 6);

    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillRect(5, 6, 4, 6);
    g.fillRect(15, 6, 4, 6);

    // Pupils
    g.fillStyle(0x000000, 1);
    g.fillRect(7, 7, 2, 4);
    g.fillRect(15, 7, 2, 4);

    // Eyebrows (angry angled look)
    g.fillStyle(0x000000, 1);
    g.fillRect(5, 5, 5, 2);
    g.fillRect(14, 5, 5, 2);

    // Black feet
    g.fillStyle(0x2b2b2b, 1);
    g.fillRect(2, 19, 8, 5);
    g.fillRect(14, 19, 8, 5);

    g.generateTexture('enemy', 24, 24);
    g.clear();

    // Squashed enemy (24x12 px)
    g.fillStyle(0x8b4513, 1);
    g.fillRect(2, 4, 20, 6);
    g.fillStyle(0xf5deb3, 1);
    g.fillRect(6, 6, 12, 4);
    g.fillStyle(0x000000, 1);
    g.fillRect(6, 4, 4, 2);
    g.fillRect(14, 4, 4, 2);
    g.fillStyle(0x2b2b2b, 1);
    g.fillRect(1, 9, 9, 3);
    g.fillRect(14, 9, 9, 3);

    g.generateTexture('enemy_squashed', 24, 12);
    g.destroy();
  }

  /**
   * Procedurally draw level tile textures: ground, dirt, brick, question block
   */
  createTileTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // 1. Surface Ground Tile (32x32) with green grass and brown dirt
    g.fillStyle(0x795548, 1);
    g.fillRect(0, 0, 32, 32);

    // Grass on top
    g.fillStyle(0x4caf50, 1);
    g.fillRect(0, 0, 32, 8);
    // Grass blades detail
    g.fillStyle(0x388e3c, 1);
    for (let x = 0; x < 32; x += 4) {
      g.fillRect(x, 6, 2, 3);
    }
    // Dirt pebbles
    g.fillStyle(0x5d4037, 1);
    g.fillRect(6, 14, 4, 3);
    g.fillRect(20, 18, 5, 4);
    g.fillRect(10, 24, 4, 3);

    g.generateTexture('ground', 32, 32);
    g.clear();

    // 2. Sub-surface Dirt Tile (32x32)
    g.fillStyle(0x6d4c41, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x543831, 1);
    g.fillRect(4, 6, 6, 4);
    g.fillRect(18, 12, 5, 5);
    g.fillRect(8, 22, 6, 4);
    g.fillRect(22, 24, 4, 4);

    g.generateTexture('dirt', 32, 32);
    g.clear();

    // 3. Brick Platform Tile (32x32)
    g.fillStyle(0xb23b12, 1);
    g.fillRect(0, 0, 32, 32);
    // Dark mortar lines
    g.fillStyle(0x421508, 1);
    g.fillRect(0, 15, 32, 2);
    g.fillRect(0, 31, 32, 1);
    g.fillRect(15, 0, 2, 15);
    g.fillRect(0, 16, 2, 16);
    g.fillRect(30, 16, 2, 16);
    // Brick highlight
    g.fillStyle(0xd9572b, 1);
    g.fillRect(2, 2, 12, 2);
    g.fillRect(18, 2, 12, 2);
    g.fillRect(3, 18, 26, 2);

    g.generateTexture('brick', 32, 32);
    g.clear();

    // 4. Question Block Tile (32x32)
    g.fillStyle(0xf39c12, 1);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0xd68910, 1);
    g.strokeRect(1, 1, 30, 30);
    // Corner bolts
    g.fillStyle(0x784212, 1);
    g.fillRect(3, 3, 2, 2);
    g.fillRect(27, 3, 2, 2);
    g.fillRect(3, 27, 2, 2);
    g.fillRect(27, 27, 2, 2);
    // White "?"
    g.fillStyle(0xffffff, 1);
    g.fillRect(11, 7, 10, 3);
    g.fillRect(18, 10, 3, 4);
    g.fillRect(13, 13, 6, 3);
    g.fillRect(13, 16, 3, 4);
    g.fillRect(13, 22, 3, 3);

    g.generateTexture('question_block', 32, 32);
    g.destroy();
  }

  /**
   * Procedurally draw shiny animated coin (16x20 px)
   */
  createCoinTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Gold outer border
    g.fillStyle(0xf1c40f, 1);
    g.fillEllipse(8, 10, 14, 18);

    // Inner bright yellow
    g.fillStyle(0xf9e79f, 1);
    g.fillEllipse(8, 10, 10, 14);

    // Inner vertical coin shine
    g.fillStyle(0xb7950b, 1);
    g.fillRect(7, 5, 2, 10);

    g.generateTexture('coin', 16, 20);
    g.destroy();
  }

  /**
   * Procedurally draw flagpole and victory flag
   */
  createFlagTextures() {
    // Flagpole (12x280 px)
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Gold ball finial
    g.fillStyle(0xf1c40f, 1);
    g.fillCircle(6, 6, 6);

    // Silver pole
    g.fillStyle(0xbdc3c7, 1);
    g.fillRect(4, 12, 4, 268);

    // Base block
    g.fillStyle(0x27ae60, 1);
    g.fillRect(0, 268, 12, 12);

    g.generateTexture('flagpole', 12, 280);
    g.clear();

    // Triangular flag (32x24 px)
    g.fillStyle(0x2ecc71, 1);
    g.fillTriangle(0, 0, 32, 12, 0, 24);

    // White circle emblem
    g.fillStyle(0xffffff, 1);
    g.fillCircle(10, 12, 4);

    g.generateTexture('flag', 32, 24);
    g.destroy();
  }
}
