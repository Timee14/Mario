import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';
import TelemetryManager from '../telemetry.js';
import { startRun, updateRun } from '../../api/client.js';
import level1Data from '../levels/level1.json';

/**
 * LevelScene parses level data, manages physics collisions, camera tracking,
 * HUD updates, and platformer game rules. Emits run telemetry upon completion.
 */
export default class LevelScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelScene' });
  }

  create() {
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.enemiesStomped = 0;
    this.startTime = Date.now();
    this.isGameOver = false;
    this.midpointReached = false;

    // Initialize telemetry manager and buffering
    this.telemetry = new TelemetryManager();
    this.telemetry.start();
    this.currentRunId = null;

    // Create in-progress run record in backend if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      this.runInitPromise = startRun(1)
        .then((run) => {
          this.currentRunId = run.id;
          this.telemetry.setRunId(run.id);
          return run;
        })
        .catch((err) => {
          console.warn('Failed to start run in backend:', err?.message || err);
          return null;
        });
    } else {
      this.runInitPromise = Promise.resolve(null);
    }

    // Teardown listener to stop telemetry timer when scene shuts down
    this.events.once('shutdown', () => {
      if (this.telemetry) this.telemetry.stop();
    });
    this.events.once('destroy', () => {
      if (this.telemetry) this.telemetry.stop();
    });

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

  hasGroundAt(worldX, worldY) {
    const col = Math.floor(worldX / this.levelData.tileSize);
    const row = Math.floor(worldY / this.levelData.tileSize);

    if (row < 0 || row >= this.levelData.height || col < 0 || col >= this.levelData.width) {
      return false;
    }
    return this.levelData.tiles[row][col] > 0;
  }

  createCoins() {
    this.coinGroup = this.physics.add.group();
    if (this.levelData.coins) {
      this.levelData.coins.forEach((c) => {
        const coin = new Coin(this, c.x, c.y);
        this.coinGroup.add(coin);
      });
    }
  }

  createEnemies() {
    this.enemyGroup = this.physics.add.group();
    if (this.levelData.enemies) {
      this.levelData.enemies.forEach((e) => {
        const enemy = new Enemy(this, e.x, e.y);
        this.enemyGroup.add(enemy);
      });
    }
  }

  createGoal() {
    const flagPos = this.levelData.flag || { x: 3040, y: 384 };
    this.flagpole = this.physics.add.staticSprite(flagPos.x, flagPos.y - 140, 'flagpole');
    this.flagpole.setSize(12, 280);

    this.flag = this.add.sprite(flagPos.x + 16, flagPos.y - 250, 'flag');
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemyGroup, this.platforms);

    this.physics.add.collider(this.enemyGroup, this.enemyGroup, (e1, e2) => {
      e1.setDirection(-e1.direction);
      e2.setDirection(-e2.direction);
    });

    this.physics.add.overlap(this.player, this.coinGroup, this.handleCollectCoin, null, this);
    this.physics.add.collider(this.player, this.enemyGroup, this.handlePlayerEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.flagpole, this.handleReachGoal, null, this);
  }

  handleCollectCoin(player, coin) {
    if (coin.isCollected) return;

    coin.collect();
    this.coins += 1;
    this.score += 50;
    this.updateHUD();

    if (this.telemetry) {
      this.telemetry.record('coin', coin.x, coin.y, { coin_count: this.coins });
    }
  }

  handlePlayerEnemyCollision(player, enemy) {
    if (enemy.isDead || player.isDead || this.isGameOver) return;

    const isFallingOnTop =
      player.body.velocity.y > 0 &&
      player.y < enemy.y - 8;

    if (isFallingOnTop) {
      player.bounceOffEnemy();
      enemy.stomp();
      this.enemiesStomped += 1;
      this.score += 100;
      this.updateHUD();

      if (this.telemetry) {
        this.telemetry.record('stomp', enemy.x, enemy.y, { enemies_stomped: this.enemiesStomped });
      }
    } else if (!player.isInvincible) {
      this.handlePlayerDamage();
    }
  }

  handlePlayerDamage() {
    if (this.isGameOver) return;

    this.lives -= 1;
    this.updateHUD();

    if (this.telemetry) {
      this.telemetry.record('death', this.player.x, this.player.y, {
        cause: 'enemy',
        lives_remaining: this.lives,
      });
    }

    if (this.lives <= 0) {
      this.player.isDead = true;
      this.triggerGameOver(false);
    } else {
      this.player.makeInvincible(1500);
      this.player.setVelocityY(-180);
    }
  }

  handleFallInPit() {
    if (this.isGameOver) return;

    this.lives -= 1;
    this.updateHUD();

    if (this.telemetry) {
      this.telemetry.record('death', this.player.x, this.player.y, {
        cause: 'pit',
        lives_remaining: this.lives,
      });
    }

    if (this.lives <= 0) {
      this.player.isDead = true;
      this.triggerGameOver(false);
    } else {
      this.player.respawn(this.playerSpawn.x, this.playerSpawn.y);
    }
  }

  handleReachGoal(player, flagpole) {
    if (player.isVictorious || this.isGameOver) return;

    player.isVictorious = true;
    player.setVelocity(0, 0);
    player.body.setAllowGravity(false);

    if (this.telemetry) {
      this.telemetry.record('checkpoint', flagpole.x, flagpole.y, { type: 'goal_flag' });
    }

    this.tweens.add({
      targets: this.flag,
      y: flagpole.y + 110,
      duration: 800,
      ease: 'Power1',
    });

    this.score += 1000;
    this.updateHUD();

    this.time.delayedCall(1200, () => {
      this.triggerGameOver(true);
    });
  }

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

  updateHUD() {
    this.scoreText.setText(`SCORE: ${String(this.score).padStart(5, '0')}`);
    this.coinsText.setText(`COINS: ${String(this.coins).padStart(2, '0')}`);
    this.livesText.setText(`LIVES: ${this.lives}`);
  }

  triggerGameOver(isWin) {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const durationSec = Math.max(1, (Date.now() - this.startTime) / 1000);
    const deathsCount = Math.max(0, 3 - this.lives);

    const runPayload = {
      score: this.score,
      coins: this.coins,
      enemies_stomped: this.enemiesStomped,
      deaths: deathsCount,
      duration_sec: parseFloat(durationSec.toFixed(2)),
      completed: isWin,
      difficulty_used: 'normal',
    };

    // Finalize telemetry and update backend run
    const finalizeRun = async () => {
      try {
        const run = await this.runInitPromise;
        if (run && run.id) {
          await this.telemetry.endRun();
          const updatedRun = await updateRun(run.id, runPayload);
          this.game.events.emit('run:completed', updatedRun);
          return;
        }
      } catch (err) {
        console.warn('Failed to update run on backend:', err?.message || err);
      }

      await this.telemetry.endRun();
      this.game.events.emit('run:completed', { level_id: 1, ...runPayload });
    };

    finalizeRun();

    this.scene.start('GameOverScene', {
      win: isWin,
      score: this.score,
      coins: this.coins,
    });
  }

  update(time, delta) {
    if (this.player && !this.isGameOver) {
      this.player.update(time);

      // Midpoint checkpoint event
      if (!this.midpointReached && this.player.x >= this.levelWidthPx / 2) {
        this.midpointReached = true;
        if (this.telemetry) {
          this.telemetry.record('checkpoint', this.player.x, this.player.y, { type: 'midpoint' });
        }
      }

      if (this.player.y > this.levelHeightPx + 40) {
        this.handleFallInPit();
      }
    }

    if (this.enemyGroup && !this.isGameOver) {
      this.enemyGroup.getChildren().forEach((enemy) => {
        if (enemy.active && enemy.update) {
          enemy.update();
        }
      });
    }
  }
}
