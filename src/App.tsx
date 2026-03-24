import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, RefreshCw } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Cybernetic Pulse',
    artist: 'AI Generator Alpha',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Neon Drift',
    artist: 'AI Generator Beta',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'Synthwave Horizon',
    artist: 'AI Generator Gamma',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 120;

export default function App() {
  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Snake Game State ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // --- Music Player Logic ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => skipForward();

  // --- Snake Game Logic ---
  const generateFood = useCallback(() => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on the snake
      const onSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setFood(generateFood());
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      
      if (!gameStarted && !gameOver && e.key === 'Enter') {
        setGameStarted(true);
        return;
      }

      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }

      setDirection((prev) => {
        switch (e.key) {
          case 'ArrowUp':
            return prev.y === 1 ? prev : { x: 0, y: -1 };
          case 'ArrowDown':
            return prev.y === -1 ? prev : { x: 0, y: 1 };
          case 'ArrowLeft':
            return prev.x === 1 ? prev : { x: -1, y: 0 };
          case 'ArrowRight':
            return prev.x === -1 ? prev : { x: 1, y: 0 };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, gameStarted, generateFood]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#00ffff] font-digital flex flex-col items-center justify-center p-4 selection:bg-[#ff00ff]/50 crt-grid relative">
      {/* Background Glow Effects & Noise */}
      <div className="static-noise"></div>
      <div className="scanline"></div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Title & Music Player */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          <div className="space-y-2">
            <h1 className="glitch-title screen-tear" data-text="Neon Snake">
              Neon Snake
            </h1>
            <p className="text-[#ff00ff] text-sm tracking-widest uppercase font-tech rgb-split">
              SYS.OVERRIDE // SYNTH_EDITION
            </p>
          </div>

          {/* Music Player Card */}
          <div className="bg-[#050505]/80 backdrop-blur-md border-2 border-[#00ffff] rounded-none p-6 shadow-[0_0_20px_rgba(0,255,255,0.2)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ffff] to-[#ff00ff] opacity-80" />
            
            <h2 className="text-xs font-tech uppercase tracking-widest text-[#00ffff] mb-6 flex items-center gap-2 rgb-split">
              <span className="w-2 h-2 bg-[#ff00ff] animate-pulse shadow-[0_0_10px_#ff00ff]" />
              AUDIO_STREAM_ACTIVE
            </h2>

            <div className="mb-6 font-tech">
              <div className="text-xl font-bold text-white truncate rgb-split uppercase">
                {TRACKS[currentTrackIndex].title}
              </div>
              <div className="text-sm text-[#ff00ff] truncate uppercase">
                {TRACKS[currentTrackIndex].artist}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={skipBack}
                className="p-2 text-[#00ffff] hover:text-[#ff00ff] hover:drop-shadow-[0_0_10px_#ff00ff] transition-all glitch-btn rounded-none"
              >
                <SkipBack size={24} />
              </button>
              <button 
                onClick={togglePlay}
                className="w-14 h-14 flex items-center justify-center border-2 border-[#ff00ff] text-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.5),inset_0_0_15px_rgba(255,0,255,0.5)] hover:bg-[#ff00ff] hover:text-[#000] transition-all glitch-btn rounded-none"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>
              <button 
                onClick={skipForward}
                className="p-2 text-[#00ffff] hover:text-[#ff00ff] hover:drop-shadow-[0_0_10px_#ff00ff] transition-all glitch-btn rounded-none"
              >
                <SkipForward size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-[#00ffff] hover:text-[#ff00ff] transition-all"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-full h-2 bg-[#050505] border border-[#00ffff] appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#ff00ff] [&::-webkit-slider-thumb]:shadow-[0_0_10px_#ff00ff] cursor-pointer"
              />
            </div>

            <audio 
              ref={audioRef} 
              src={TRACKS[currentTrackIndex].url} 
              onEnded={handleTrackEnd}
            />
          </div>
          
          {/* Instructions */}
          <div className="text-sm text-[#00ffff] space-y-2 font-tech">
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#050505] border border-[#ff00ff] text-[#ff00ff] text-xs font-mono shadow-[0_0_5px_#ff00ff]">â</kbd>
              <kbd className="px-2 py-1 bg-[#050505] border border-[#ff00ff] text-[#ff00ff] text-xs font-mono shadow-[0_0_5px_#ff00ff]">â</kbd>
              <kbd className="px-2 py-1 bg-[#050505] border border-[#ff00ff] text-[#ff00ff] text-xs font-mono shadow-[0_0_5px_#ff00ff]">â</kbd>
              <kbd className="px-2 py-1 bg-[#050505] border border-[#ff00ff] text-[#ff00ff] text-xs font-mono shadow-[0_0_5px_#ff00ff]">â</kbd>
              <span className="uppercase tracking-widest">INPUT_VECTOR</span>
            </p>
            <p className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-[#050505] border border-[#00ffff] text-[#00ffff] text-xs font-mono shadow-[0_0_5px_#00ffff]">ENTER</kbd>
              <span className="uppercase tracking-widest">EXECUTE_SEQ</span>
            </p>
          </div>
        </div>

        {/* Right Column: Game Area */}
        <div className="lg:col-span-2 flex flex-col items-center">
          
          {/* Score Header */}
          <div className="w-full max-w-[400px] flex justify-between items-end mb-4 px-2 border-b-2 border-[#00ffff] pb-2">
            <div className="text-sm font-tech uppercase tracking-widest text-[#00ffff] rgb-split">MEM_ALLOC</div>
            <div className="text-4xl font-digital text-[#ff00ff] drop-shadow-[0_0_10px_#ff00ff]">
              {score.toString().padStart(4, '0')}
            </div>
          </div>

          {/* Game Board */}
          <div 
            className="relative bg-[#050505] border-2 border-[#ff00ff] overflow-hidden shadow-[0_0_30px_rgba(255,0,255,0.3)]"
            style={{
              width: '400px',
              height: '400px',
              boxShadow: 'inset 0 0 50px rgba(0, 255, 255, 0.1), 0 0 20px rgba(255,0,255,0.3)'
            }}
          >
            {/* Grid Lines */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, #00ffff 1px, transparent 1px), linear-gradient(to bottom, #00ffff 1px, transparent 1px)',
                backgroundSize: `${400 / GRID_SIZE}px ${400 / GRID_SIZE}px`
              }}
            />

            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/80 backdrop-blur-sm z-20">
                <div className="text-[#00ffff] font-tech text-xl tracking-widest uppercase mb-4 rgb-split screen-tear" data-text="SYSTEM_STANDBY">SYSTEM_STANDBY</div>
                <button 
                  onClick={() => setGameStarted(true)}
                  className="px-6 py-2 glitch-btn"
                >
                  INITIALIZE
                </button>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/90 backdrop-blur-md z-20">
                <div className="text-[#ff00ff] text-4xl font-glitch tracking-widest uppercase mb-2 drop-shadow-[0_0_15px_#ff00ff] screen-tear" data-text="FATAL_ERROR">
                  FATAL_ERROR
                </div>
                <div className="text-[#00ffff] font-tech mb-6 rgb-split">DATA_CORRUPTED: {score}</div>
                <button 
                  onClick={resetGame}
                  className="flex items-center gap-2 px-6 py-2 glitch-btn"
                >
                  <RefreshCw size={18} />
                  REBOOT
                </button>
              </div>
            )}

            {/* Snake */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              return (
                <div
                  key={`${segment.x}-${segment.y}-${index}`}
                  className="absolute"
                  style={{
                    left: `${(segment.x / GRID_SIZE) * 100}%`,
                    top: `${(segment.y / GRID_SIZE) * 100}%`,
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    backgroundColor: isHead ? '#00ffff' : 'transparent',
                    border: isHead ? 'none' : '1px solid #00ffff',
                    boxShadow: isHead ? '0 0 15px #00ffff' : 'inset 0 0 5px #00ffff',
                    zIndex: isHead ? 10 : 5,
                    transform: 'scale(0.85)', // Glitchy blocky look
                  }}
                />
              );
            })}

            {/* Food */}
            <div
              className="absolute animate-pulse"
              style={{
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                backgroundColor: '#ff00ff',
                boxShadow: '0 0 15px #ff00ff',
                transform: 'scale(0.7) rotate(45deg)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
