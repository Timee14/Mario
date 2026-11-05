import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import LevelScene from './scenes/LevelScene.js';
import GameOverScene from './scenes/GameOverScene.js';

/**
 * Creates the Phaser 3 game configuration object.
 *
 * @param {HTMLElement|string} parentElement DOM element or ID to mount the canvas
 * @returns {Phaser.Types.Core.GameConfig}
 */
export function createGameConfig(parentElement) {
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: parentElement,
    backgroundColor: '#5c94fc',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 900 },
        debug: false,
      },
    },
    scene: [BootScene, LevelScene, GameOverScene],
  };
}

export default createGameConfig;
