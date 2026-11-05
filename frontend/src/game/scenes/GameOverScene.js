import Phaser from 'phaser';

/**
 * GameOverScene displays outcome (Win/Loss), final score and coins, and restart trigger.
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.isWin = !!data.win;
    this.finalScore = data.score || 0;
    this.finalCoins = data.coins || 0;
  }

  create() {
    const { width, height } = this.scale;

    // Dark background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.88);

    // Title: Win vs Loss
    const titleText = this.isWin ? 'COURSE CLEAR!' : 'GAME OVER';
    const titleColor = this.isWin ? '#2ecc71' : '#e74c3c';

    this.add
      .text(width / 2, height / 2 - 90, titleText, {
        fontFamily: '"Press Start 2P", Courier, monospace',
        fontSize: '32px',
        color: titleColor,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Score & Coins details
    this.add
      .text(
        width / 2,
        height / 2 - 20,
        `FINAL SCORE: ${String(this.finalScore).padStart(5, '0')}\nCOINS: ${this.finalCoins}`,
        {
          fontFamily: '"Press Start 2P", Courier, monospace',
          fontSize: '16px',
          color: '#ffffff',
          align: 'center',
          lineSpacing: 12,
        },
      )
      .setOrigin(0.5);

    // Interactive Restart Button
    const restartBtn = this.add
      .rectangle(width / 2, height / 2 + 75, 220, 48, 0x3498db)
      .setInteractive({ useHandCursor: true });

    const restartText = this.add
      .text(width / 2, height / 2 + 75, 'PLAY AGAIN', {
        fontFamily: '"Press Start 2P", Courier, monospace',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Hover styling
    restartBtn.on('pointerover', () => {
      restartBtn.setFillStyle(0x2980b9);
      restartBtn.setScale(1.05);
      restartText.setScale(1.05);
    });

    restartBtn.on('pointerout', () => {
      restartBtn.setFillStyle(0x3498db);
      restartBtn.setScale(1);
      restartText.setScale(1);
    });

    // Click to restart
    restartBtn.on('pointerdown', () => {
      this.scene.start('LevelScene');
    });

    // Also support Spacebar or Enter to restart
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('LevelScene');
    });
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('LevelScene');
    });
  }
}

