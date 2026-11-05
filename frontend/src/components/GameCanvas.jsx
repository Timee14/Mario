import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config.js';

/**
 * GameCanvas mounts and cleanly destroys a Phaser 3 game instance in React.
 * Prevents duplicate instances in React 18 StrictMode.
 */
export default function GameCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    let gameInstance = null;

    if (containerRef.current) {
      // Clear any stale children from previous mounts
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }

      const config = createGameConfig(containerRef.current);
      gameInstance = new Phaser.Game(config);
    }

    return () => {
      if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="phaser-game-container"
      style={{
        width: '100%',
        maxWidth: '800px',
        height: '450px',
        margin: '0 auto',
        backgroundColor: '#000000',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
