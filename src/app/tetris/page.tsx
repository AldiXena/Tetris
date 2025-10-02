'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, RotateCw, ArrowLeft, ArrowRight, ArrowDown, Play, Pause, ArrowUp } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 18;
const BLOCK_SIZE = 14; 

const TETROMINOS = {
  0: { shape: [[0]], color: '10, 10, 10' }, // For empty cells
  I: {
    shape: [[1, 1, 1, 1]],
    color: '80, 227, 230',
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    color: '36, 95, 223',
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    color: '223, 173, 36',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '223, 217, 36',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '48, 211, 56',
  },
  T: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ],
    color: '132, 61, 198',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '227, 78, 78',
  },
};
const TETROMINO_KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

const randomTetromino = () => {
  const randTetromino = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  const tetrominoInfo = TETROMINOS[randTetromino as keyof typeof TETROMINOS];
  let shape = tetrominoInfo.shape;

  // For I and O, which are symmetrical, let's just use their base shapes.
  // For others, let's create a proper 2D array if they are not.
  if (randTetromino === 'I') {
     shape = [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  } else if (randTetromino === 'O') {
    shape = [
      [1, 1],
      [1, 1],
    ]
  } else if (Array.isArray(shape[0]) === false) {
    // Convert 1D array to 2D for consistent rotation logic
    shape = [shape];
  }


  return {
    shape: shape,
    color: tetrominoInfo.color,
    key: randTetromino
  };
};

type Player = {
  pos: { x: number; y: number };
  tetromino: {
    shape: (number)[][];
    color: string;
    key: string;
  };
  collided: boolean;
};


type CellValue = string; // Will store tetromino key like 'I', 'J', '0'
type CellState = 'clear' | 'merged';
type Cell = [CellValue, CellState];
type Grid = Cell[][];


const createEmptyGrid = (): Grid => Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(['0', 'clear']));


export default function TetrisPage() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [playerName, setPlayerName] = useState('');
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: randomTetromino(),
    collided: false,
  });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [dropTime, setDropTime] = useState<number | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const resetPlayer = useCallback(() => {
    const newTetromino = randomTetromino();
    setPlayer({
      pos: { x: Math.floor(GRID_WIDTH / 2) - Math.floor(newTetromino.shape[0].length / 2), y: 0 },
      tetromino: newTetromino,
      collided: false,
    });
  }, []);
  
  const checkCollision = useCallback((
    p: Player,
    g: Grid,
    { x: moveX, y: moveY }: { x: number, y: number }
  ) => {
    for (let y = 0; y < p.tetromino.shape.length; y += 1) {
      for (let x = 0; x < p.tetromino.shape[y].length; x += 1) {
        if (p.tetromino.shape[y][x] !== 0) {
          const newY = y + p.pos.y + moveY;
          const newX = x + p.pos.x + moveX;

          if (
            newY >= GRID_HEIGHT ||
            newX < 0 ||
            newX >= GRID_WIDTH ||
            (g[newY] && g[newY][newX] && g[newY][newX][1] !== 'clear')
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const movePlayer = useCallback((dir: number) => {
    if (gameState !== 'playing') return;
    if (!checkCollision(player, grid, { x: dir, y: 0 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x + dir, y: prev.pos.y },
      }));
    }
  }, [checkCollision, gameState, grid, player]);
  
  const startGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(1000);
    resetPlayer();
    setGameState('playing');
    if (gameAreaRef.current) gameAreaRef.current.focus();
  };

  const drop = useCallback(() => {
    if (gameState !== 'playing') return;
    if (!checkCollision(player, grid, { x: 0, y: 1 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
        collided: false,
      }));
    } else {
      if (player.pos.y < 1) {
        setGameState('over');
        setDropTime(null);
        return;
      }
      setPlayer(prev => ({ ...prev, collided: true }));
    }
  }, [checkCollision, gameState, grid, player]);

  const hardDrop = () => {
    if (gameState !== 'playing') return;
    let newY = player.pos.y;
    while (!checkCollision(player, grid, { x: 0, y: newY - player.pos.y + 1})) {
        newY++;
    }
    setPlayer(prev => ({
        ...prev,
        pos: { ...prev.pos, y: newY },
        collided: true
    }));
  }

  const dropPlayer = useCallback(() => {
    if (gameState !== 'playing') return;
    drop();
  }, [drop, gameState]);

  const rotate = (matrix: any[][], dir: number) => {
    // Transpose and then reverse rows to rotate
    const rotated = matrix.map((_, i) => matrix.map(col => col[i]));
    if (dir > 0) return rotated.map(row => row.reverse());
    return rotated.reverse();
  };

  const playerRotate = useCallback((dir: number) => {
    if (gameState !== 'playing') return;
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, grid, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino.shape[0].length) {
        clonedPlayer.pos.x = pos; // Reset position if rotation is not possible
        return; // Don't rotate
      }
    }
    setPlayer(clonedPlayer);
  }, [checkCollision, gameState, grid, player]);
  
  const handleGameOver = useCallback(async () => {
    setDropTime(null);
    if (!playerName) {
      setGameOverMessage("Please enter your name first!");
      return;
    }
    setIsLoading(true);
    // Simple game over message without AI
    setGameOverMessage(`INGET YA ${playerName}! walaupun kamu kalah, tapi kamu selalu menang kok di hati aku, HEHE I LOVE YOU <3`);
    setIsLoading(false);
  }, [playerName]);

  const resetGame = () => {
    setGameState('idle');
    setGameOverMessage('');
    setScore(0);
    setLines(0);
    setLevel(1);
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent | KeyboardEvent) => {
     if (gameState !== 'playing') return;
     e.preventDefault();
     if (e.key === 'ArrowLeft') movePlayer(-1);
     else if (e.key === 'ArrowRight') movePlayer(1);
     else if (e.key === 'ArrowDown') dropPlayer();
     else if (e.key === 'x' || e.key === 'ArrowUp') playerRotate(1); // Rotate right
     else if (e.key === 'z') playerRotate(-1); // Rotate left
     else if (e.key === ' ') hardDrop();
  }, [gameState, movePlayer, dropPlayer, playerRotate, hardDrop]);

    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            if (window.location.pathname.includes('/tetris')) {
                handleKeyDown(event);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [handleKeyDown]);
    
    useEffect(() => {
        const handleGameEvent = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (gameState !== 'playing') return;

            const actionMap: { [key: string]: () => void } = {
                'moveLeft': () => movePlayer(-1),
                'moveRight': () => movePlayer(1),
                'rotate': () => playerRotate(1),
                'drop': dropPlayer,
                'hardDrop': hardDrop,
            };

            const action = actionMap[customEvent.detail.action];
            if (action) action();
        };
        window.addEventListener('game-input', handleGameEvent);
        return () => {
            window.removeEventListener('game-input', handleGameEvent);
        };
    }, [gameState, movePlayer, playerRotate, dropPlayer, hardDrop]);

  useEffect(() => {
    if (!player.collided) {
      return;
    }

    setGrid(prevGrid => {
        const newGrid = prevGrid.map(row =>
            row.map(cell => (cell ? [...cell] : ['0', 'clear']))
        ) as Grid;
        
        player.tetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const gridY = y + player.pos.y;
                    const gridX = x + player.pos.x;
                    if (gridY >= 0 && gridX >= 0 && gridY < GRID_HEIGHT && gridX < GRID_WIDTH) {
                        newGrid[gridY][gridX] = [player.tetromino.key, 'merged'];
                    }
                }
            });
        });
        
        const linePoints = [40, 100, 300, 1200];
        let clearedLines = 0;
        
        const sweptGrid = newGrid.reduce((acc, row) => {
            if (row.every(cell => cell[1] === 'merged')) {
                clearedLines++;
                acc.unshift(Array(GRID_WIDTH).fill(['0', 'clear']));
                return acc;
            }
            acc.push(row);
            return acc;
        }, [] as Grid);

        if (clearedLines > 0) {
            setScore(prev => prev + (linePoints[clearedLines - 1] || 0) * level);
            setLines(prev => prev + clearedLines);
        }

        return sweptGrid;
    });

    if (!checkCollision(player, grid, {x:0, y:0})) {
        resetPlayer();
    }

  }, [player.collided, player, resetPlayer, checkCollision, grid, level]);

  useEffect(() => {
    if (lines / 10 >= level) {
      setLevel(prev => prev + 1);
      setDropTime(1000 / (level + 1 + 0.1));
    }
  }, [lines, level]);
  
  useEffect(() => {
    const dropInterval = setInterval(() => {
        if (gameState === 'playing') {
            drop();
        }
    }, dropTime ?? 1000 / (level + 1) + 200);

    return () => clearInterval(dropInterval);
  }, [gameState, dropTime, drop, level]);

  useEffect(() => {
    if (gameState === 'over') {
        handleGameOver();
    }
  }, [gameState, handleGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Clear canvas
    context.fillStyle = '#081820'; // dot-matrix-screen bg
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;

    // Draw grid
    grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            const cellKey = cell[0];
            if (cellKey !== '0') {
                context.fillStyle = `rgba(${TETROMINOS[cellKey as keyof typeof TETROMINOS].color}, 1)`;
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });

    // Draw player
    if ((gameState === 'playing') && player.tetromino) {
        const playerTetromino = player.tetromino;
        context.fillStyle = `rgba(${playerTetromino.color}, 1)`;
        playerTetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillRect((player.pos.x + x) * BLOCK_SIZE, (player.pos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }

  }, [grid, player, gameState]);

  return (
    <div className="w-full h-full flex flex-col text-center" tabIndex={0} ref={gameAreaRef}>
      <h2 className="text-xl font-bold mb-1 border-b-2 pb-1">TETRIS</h2>
      
      <div className="flex-grow flex items-center justify-center">
        {gameState === 'idle' ? (
          <div className="flex flex-col gap-4">
            <Input 
              type="text" 
              placeholder="Enter Your Name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-center bg-gray-800 border-primary focus:ring-primary"
            />
            <Button onClick={startGame} disabled={!playerName} className="bg-btn-blue text-black">
              START GAME
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-start h-full w-full">
            <div className="flex-grow h-full flex items-center justify-center">
              <canvas
                  ref={canvasRef}
                  width={GRID_WIDTH * BLOCK_SIZE}
                  height={GRID_HEIGHT * BLOCK_SIZE}
                  className="bg-black border-2 border-gray-600 rounded-sm"
                  style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="flex flex-col gap-1 text-left w-24 text-xs">
              <p className="font-bold">SCORE</p>
              <p className="text-base">{score}</p>
              <p className="font-bold mt-1">LINES</p>
              <p className="text-base">{lines}</p>
              <p className="font-bold mt-1">LEVEL</p>
              <p className="text-base">{level}</p>
            </div>
          </div>
        )}
      </div>
      

      <AlertDialog open={gameState === 'over'}>
        <AlertDialogContent className="font-headline border-primary bg-black text-primary">
          <AlertDialogHeader>
            <AlertDialogTitle>GAME OVER</AlertDialogTitle>
            <AlertDialogDescription className="text-primary/80 pt-4 text-lg min-h-[5rem] flex items-center justify-center">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : gameOverMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
            <Link href="/" className={cn(buttonVariants(), "bg-btn-purple text-white w-full")}>
              OK
            </Link>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
