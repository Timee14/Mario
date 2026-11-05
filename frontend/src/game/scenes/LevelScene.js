import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';
import level1Data from '../levels/level1.json';

/**
 * LevelScene parses level data, manages physics collisions, camera tracking,
 * HUD updates, and platformer game rules.
 */
export default class LevelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelScene' });
  }

  create() {
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.levelData = level1Data;
    this.levelWidthPx = this.levelData.width * this.levelData.tileSize;
    this.levelHeightPx = this.levelData.height * this.levelData.tileSize;

    // Set world physics bounds
    this.physics.world.setBounds(0, 0, this.levelWidthPx, this.levelHeightPx + 150);

    // Sky background
    this.cameras.main.setBackgroundColor('#5c94fc');

    // Build static platforms and geometry from tile grid
    this.createLevelGeometry();

    // Spawn Coins
    this.createCoins();

    // Spawn Flagpole & Goal
    this.createGoal();

    // Spawn Player
    const pStart = this.levelData.playerStart || { x: 64, y: 350 };
    this.playerSpawn = { x: pStart.x, y: pStart.y };
    this.player = new Player(this, pStart.x, pStart.y);

    // Spawn Enemies
    this.createEnemies();

    // Configure Camera
    this.cameras.main.setBounds(0, 0, this.levelWidthPx, this.levelHeightPx);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Setup Physics Colliders
    this.setupCollisions();

    // Build HUD overlay
    this.createHUD();
  }

  /**
   * Instantiate static level blocks from tile grid
   */
  createLevelGeometry() {
    this.platforms = this.physics.add.staticGroup();

    const tiles = this.levelData.tiles;
    const tileSize = this.levelData.tileSize;

    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        const tileType = tiles[row][col];
        if (tileType === 0) continue;

        const x = col * tileSize + tileSize / 2;
        const y = row * tileSize + tileSize / 2;

        let texture = 'ground';
        if (tileType === 1) texture = 'ground';
        else if (tileType === 2) texture = 'dirt';
        else if (tileType === 3) texture = 'brick';
        else if (tileType === 4) texture = 'question_block';

        this.platforms.create(x, y, texture);
      }
    }
  }

  /**
   * Fast tile grid lookup for platform edge detection
   */
  hasGroundAt(worldX, worldY) {
    const col = Math.floor(worldX / this.levelData.tileSize);
    const row = Math.floor(worldY / this.levelData.tileSize);

    if (row < 0 || row >= this.levelData.height || col < 0 || col >= this.levelData.width) {
      return false;
    }
    return this.levelData.tiles[row][col] > 0;
  }

  /**
   * Spawn collectible coins
   */
  createCoins() {
    this.coinGroup = this.physics.add.group();
    if (this.levelData.coins) {
      this.levelData.coins.forEach((c) => {
        const coin = new Coin(this, c.x, c.y);
        this.coinGroup.add(coin);
      });
    }
  }

  /**
   * Spawn patrolling enemies
   */
  createEnemies() {
    this.enemyGroup = this.physics.add.group();
    if (this.levelData.enemies) {
      this.levelData.enemies.forEach((e) => {
        const enemy = new Enemy(this, e.x, e.y);
        this.enemyGroup.add(enemy);
      });
    }
  }

  /**
   * Spawn end-of-level goal flagpole
   */
  createGoal() {
    const flagPos = this.levelData.flag || { x: 3040, y: 384 };

    // Pole (280px high)
    this.flagpole = this.physics.add.staticSprite(flagPos.x, flagPos.y - 140, 'flagpole');
    this.flagpole.setSize(12, 280);

    // Flag (sliding banner)
    this.flag = this.add.sprite(flagPos.x + 16, flagPos.y - 250, 'flag');
  }

  /**
   * Set up all physics collisions and overlaps
   */
  setupCollisions() {
    // Player <-> Platforms
    this.physics.add.collider(this.player, this.platforms);

    // Enemies <-> Platforms
    this.physics.add.collider(this.enemyGroup, this.platforms);

    // Enemies <-> Enemies (patrol reversal)
    this.physics.add.collider(this.enemyGroup, this.enemyGroup, (e1, e2) => {
      e1.setDirection(-e1.direction);
      e2.setDirection(-e2.direction);
    });

    // Player <-> Coins
    this.physics.add.overlap(this.player, this.coinGroup, this.handleCollectCoin, null, this);

    // Player <-> Enemies
    this.physics.add.collider(this.player, this.enemyGroup, this.handlePlayerEnemyCollision, null, this);

    // Player <-> Flagpole (Win condition)
    this.physics.add.overlap(this.player, this.flagpole, this.handleReachGoal, null, this);
  }

  /**
   * Handle collecting a coin
   */
  handleCollectCoin(player, coin) {
    if (coin.isCollected) return;

    coin.collect();
    this.coins += 1;
    this.score += 50;
    this.updateHUD();
  }

  /**
   * Handle player and enemy collision: Stomp vs Damage
   */
  handlePlayerEnemyCollision(player, enemy) {
    if (enemy.isDead || player.isDead || this.isGameOver) return;

    // Stomp condition: Player is falling downwards and positioned above the enemy
    const isFallingOnTop =
      player.body.velocity.y > 0 &&
      player.y < enemy.y - 8;

    if (isFallingOnTop) {
      // Stomp successful: bounce player, squish enemy, +100 points
      player.bounceOffEnemy();
      enemy.stomp();
      this.score += 100;
      this.updateHUD();
    } else if (!player.isInvincible) {
      // Side/bottom touch: player takes damage
      this.handlePlayerDamage();
    }
  }

  /**
   * Inflict damage on player: decrement lives, trigger blinking invincibility or game over
   */
  handlePlayerDamage() {
    if (this.isGameOver) return;

    this.lives -= 1;
    this.updateHUD();

    if (this.lives <= 0) {
      this.player.isDead = true;
      this.triggerGameOver(false);
    } else {
      // Knockback & invincibility
      this.player.makeInvincible(1500);
      this.player.setVelocityY(-180);
    }
  }

  /**
   * Handle falling into bottom gaps/pits
   */
  handleFallInPit() {
    if (this.isGameOver) return;

    this.lives -= 1;
    this.updateHUD();

    if (this.lives <= 0) {
      this.player.isDead = true;
      this.triggerGameOver(false);
    } else {
      // Respawn at safe start position
      this.player.respawn(this.playerSpawn.x, this.playerSpawn.y);
    }
  }

  /**
   * Handle victory when touching the flagpole
   */
  handleReachGoal(player, flagpole) {
    if (player.isVictorious || this.isGameOver) return;

    player.isVictorious = true;
    player.setVelocity(0, 0);
    player.body.setAllowGravity(false);

    // Slide flag down the pole
    this.tweens.add({
      targets: this.flag,
      y: flagpole.y + 110,
      duration: 800,
      ease: 'Power1',
    });

    // Score bonus for victory
    this.score += 1000;
    this.updateHUD();

    // Transition to GameOverScene after victory flourish
    this.time.delayedCall(1200, () => {
      this.triggerGameOver(true);
    });
  }

  /**
   * Create fixed-position retro arcade HUD
   */
  createHUD() {
    const textStyle = {
      fontFamily: '"Press Start 2P", Courier, monospace',
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    };

    this.scoreText = this.add.text(24, 16, 'SCORE: 00000', textStyle).setScrollFactor(0).setDepth(100);
    this.coinsText = this.add.text(280, 16, 'COINS: 00', textStyle).setScrollFactor(0).setDepth(100);
    this.livesText = this.add.text(500, 16, 'LIVES: 3', textStyle).setScrollFactor(0).setDepth(100);
    this.worldText = this.add.text(680, 16, 'WORLD: 1-1', textStyle).setScrollFactor(0).setDepth(100);
  }

  /**
   * Refresh HUD labels
   */
  updateHUD() {
    this.scoreText.setText(`SCORE: ${String(this.score).padStart(5, '0')}`);
    this.coinsText.setText(`COINS: ${String(this.coins).padStart(2, '0')}`);
    this.livesText.setText(`LIVES: ${this.lives}`);
  }

  /**
   * Transition to GameOverScene with outcome stats
   */
  triggerGameOver(isWin) {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.scene.start('GameOverScene', {
      win: isWin,
      score: this.score,
      coins: this.coins,
    });
  }

  update(time, delta) {
    // Update player
    if (this.player && !this.isGameOver) {
      this.player.update(time);

      // Check if player fell below bottom of map
      if (this.player.y > this.levelHeightPx + 40) {
        this.handleFallInPit();
      }
    }

    // Update active enemies
    if (this.enemyGroup && !this.isGameOver) {
      this.enemyGroup.getChildren().forEach((enemy) => {
        if (enemy.active && enemy.update) {
          enemy.update();
        }
      });
    }
  }
}
