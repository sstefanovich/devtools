import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Play, RotateCcw } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  x: number;
  y: number;
  id: number;
}

interface Enemy {
  x: number;
  y: number;
  id: number;
  alive: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ENEMY_SPEED = 1;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 10;
const ENEMY_SPACING = 60;
const ENEMY_START_Y = 50;

const SpaceInvadersUtility: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('spaceInvadersHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const playerPosRef = useRef<Position>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const enemyDirectionRef = useRef<number>(1);
  const keysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const lastEnemyMoveRef = useRef<number>(0);
  const enemyMoveIntervalRef = useRef<number>(500);

  // Initialize enemies
  const initEnemies = useCallback(() => {
    const enemies: Enemy[] = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        enemies.push({
          x: col * ENEMY_SPACING + 100,
          y: row * ENEMY_SPACING + ENEMY_START_Y,
          id: row * ENEMY_COLS + col,
          alive: true,
        });
      }
    }
    enemiesRef.current = enemies;
    enemyDirectionRef.current = 1;
    enemyMoveIntervalRef.current = 500;
  }, []);

  // Initialize game
  const startGame = useCallback(() => {
    playerPosRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 };
    bulletsRef.current = [];
    initEnemies();
    setScore(0);
    setGameState('playing');
    lastEnemyMoveRef.current = Date.now();
  }, [initEnemies]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        keysRef.current.delete(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const gameLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw stars background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 37) % CANVAS_WIDTH;
        const y = (i * 23) % CANVAS_HEIGHT;
        ctx.fillRect(x, y, 1, 1);
      }

      // Handle player movement
      if (keysRef.current.has('ArrowLeft') && playerPosRef.current.x > 0) {
        playerPosRef.current.x -= PLAYER_SPEED;
      }
      if (keysRef.current.has('ArrowRight') && playerPosRef.current.x < CANVAS_WIDTH - PLAYER_WIDTH) {
        playerPosRef.current.x += PLAYER_SPEED;
      }

      // Handle shooting
      if (keysRef.current.has(' ')) {
        const now = Date.now();
        const lastBullet = bulletsRef.current[bulletsRef.current.length - 1];
        if (!lastBullet || now - (lastBullet as any).timestamp > 200) {
          bulletsRef.current.push({
            x: playerPosRef.current.x + PLAYER_WIDTH / 2,
            y: playerPosRef.current.y,
            id: Date.now(),
          });
          (bulletsRef.current[bulletsRef.current.length - 1] as any).timestamp = now;
        }
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        bullet.y -= BULLET_SPEED;
        return bullet.y > 0;
      });

      // Move enemies
      const now = Date.now();
      if (now - lastEnemyMoveRef.current > enemyMoveIntervalRef.current) {
        const aliveEnemies = enemiesRef.current.filter((e) => e.alive);
        
        if (aliveEnemies.length === 0) {
          // All enemies defeated, reset with faster speed
          initEnemies();
          enemyMoveIntervalRef.current = Math.max(200, enemyMoveIntervalRef.current - 50);
        } else {
          // Check if enemies hit the sides
          let shouldMoveDown = false;
          for (const enemy of aliveEnemies) {
            if (
              (enemy.x <= 0 && enemyDirectionRef.current < 0) ||
              (enemy.x >= CANVAS_WIDTH - ENEMY_WIDTH && enemyDirectionRef.current > 0)
            ) {
              shouldMoveDown = true;
              break;
            }
          }

          if (shouldMoveDown) {
            enemyDirectionRef.current *= -1;
            for (const enemy of aliveEnemies) {
              enemy.y += 20;
              // Check if enemies reached player
              if (enemy.y + ENEMY_HEIGHT >= playerPosRef.current.y) {
                setGameState('gameover');
                if (score > highScore) {
                  setHighScore(score);
                  localStorage.setItem('spaceInvadersHighScore', score.toString());
                }
                return;
              }
            }
          } else {
            for (const enemy of aliveEnemies) {
              enemy.x += ENEMY_SPEED * enemyDirectionRef.current;
            }
          }
        }

        lastEnemyMoveRef.current = now;
      }

      // Collision detection: bullets vs enemies
      bulletsRef.current = bulletsRef.current.filter((bullet) => {
        let hit = false;
        for (const enemy of enemiesRef.current) {
          if (!enemy.alive) continue;
          
          if (
            bullet.x >= enemy.x &&
            bullet.x <= enemy.x + ENEMY_WIDTH &&
            bullet.y >= enemy.y &&
            bullet.y <= enemy.y + ENEMY_HEIGHT
          ) {
            enemy.alive = false;
            hit = true;
            setScore((prev) => prev + 10);
            break;
          }
        }
        return !hit;
      });

      // Draw player
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(playerPosRef.current.x + PLAYER_WIDTH / 2, playerPosRef.current.y);
      ctx.lineTo(playerPosRef.current.x, playerPosRef.current.y + PLAYER_HEIGHT);
      ctx.lineTo(playerPosRef.current.x + PLAYER_WIDTH, playerPosRef.current.y + PLAYER_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Draw bullets
      ctx.fillStyle = '#ffff00';
      bulletsRef.current.forEach((bullet) => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
      });

      // Draw enemies
      enemiesRef.current.forEach((enemy) => {
        if (!enemy.alive) return;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
        
        // Draw enemy details
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 10, 10);
        ctx.fillRect(enemy.x + ENEMY_WIDTH - 15, enemy.y + 5, 10, 10);
      });

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);
      ctx.fillText(`High Score: ${highScore}`, 10, 60);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, score, highScore, initEnemies]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Gamepad2 className="h-8 w-8 text-purple-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Space Invaders</h1>
        </div>
        <p className="text-gray-600">
          Use arrow keys to move, spacebar to shoot. Defend Earth from the invaders!
        </p>
      </div>

      {/* Game Canvas */}
      <div className="card p-0 overflow-hidden relative" style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full bg-black block"
        />
        
        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white mb-4">SPACE INVADERS</h2>
              <button
                onClick={startGame}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Play className="h-5 w-5" />
                <span>Start Game</span>
              </button>
              {highScore > 0 && (
                <p className="text-white text-lg mt-4">High Score: {highScore}</p>
              )}
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
              <p className="text-white text-2xl mb-2">Final Score: {score}</p>
              {score === highScore && score > 0 && (
                <p className="text-yellow-400 text-lg mb-2">🎉 New High Score! 🎉</p>
              )}
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={startGame}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Play</h3>
        <div className="space-y-3 text-gray-600 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Controls:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>← →</strong> Arrow Keys: Move left/right</li>
                <li><strong>Spacebar</strong>: Fire bullets</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">Gameplay:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Destroy all enemies to advance</li>
                <li>Enemies move faster each wave</li>
                <li>Don't let enemies reach you!</li>
                <li>Score: 10 points per enemy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceInvadersUtility;

