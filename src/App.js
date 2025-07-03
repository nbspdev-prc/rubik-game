import React, { useRef, useEffect, useState, useCallback } from 'react';
import Cube from './components/Cube';
import Keybinds from './components/Keybinds/Keybinds';
import './App.css';
import { DEFAULT_KEYBINDS } from './components/Keybinds/Keybinds';

function App() {
  const cubeRef = useRef();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [shuffleFinished, setShuffleFinished] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [isSolved, setIsSolved] = useState(null);
  const [solveMode, setSolveMode] = useState(false);

  const [keybinds, setKeybinds] = useState(() => {
    const saved = localStorage.getItem('keybinds');
    return saved ? JSON.parse(saved) : DEFAULT_KEYBINDS;
  });

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const resetState = () => {
    setTime(0);
    setIsRunning(false);
    setStarted(false);
    setShuffleFinished(false);
    setIsSolved(null);
    setSolveMode(false);
  };

  const shuffleCube = () => {
    resetState();
    setControlsEnabled(false);

    const moves = Object.values(DEFAULT_KEYBINDS);
    const randomMoves = Array.from({ length: 20 }, () => moves[Math.floor(Math.random() * moves.length)]);

    randomMoves.forEach((move, i) => {
      setTimeout(() => {
        if (cubeRef.current) {
          cubeRef.current.rotateFace(move);
        }
        if (i === randomMoves.length - 1) {
          setTimeout(() => {
            setControlsEnabled(true);
            setShuffleFinished(true);
          }, 300);
        }
      }, i * 300);
    });
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    stopTimer();
    resetState();
  };

  const handleCheckSolved = useCallback(() => {
    if (!solveMode) return;

    if (cubeRef.current?.isCubeSolved()) {
      stopTimer();
      setControlsEnabled(false);
      setIsSolved(true);
    } else {
      setIsSolved(false);
    }
  }, [solveMode]);

  const handleStartButton = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (!solveMode) {
        setTime(0);
        setIsSolved(null);
      }
      setIsRunning(true);
      setStarted(true);
      setSolveMode(true);
    }
  }, [isRunning, solveMode]);

  const getStartButtonLabel = () => {
    if (isRunning) return 'Stop';
    if (solveMode) return 'Continue';
    return 'Start';
  };

  const handleKeybindChange = (updatedKeybinds) => {
    setKeybinds(updatedKeybinds);
    localStorage.setItem('keybinds', JSON.stringify(updatedKeybinds));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const move = keybinds[e.key.toUpperCase()];
      if (move && controlsEnabled && cubeRef.current) {
        e.preventDefault();

        if (shuffleFinished && !started) {
          handleStartButton();
        }

        cubeRef.current.rotateFace(move);

        setTimeout(() => {
          if (solveMode && cubeRef.current?.isCubeSolved()) {
            handleCheckSolved();
          }
        }, 350);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    keybinds,
    controlsEnabled,
    shuffleFinished,
    started,
    solveMode,
    isRunning,
    handleCheckSolved,
    handleStartButton
  ]);

  return (
    <div className="app-container">
      {isSolved !== null && (
        <div className="status">
          {isSolved ? '✅ Solved!' : '❌ Not solved yet'}
        </div>
      )}

      <div className="button-panel">
        <div className="grid grid-cols-12 gap-4">
          {/* Timer */}
          <div className="timer col-span-2">
            <span>{formatTime(time)}</span>
          </div>

          {/* Button controls */}
          <div className="button-row col-span-4">
            <button onClick={shuffleCube}>Shuffle (Start)</button>
            <button onClick={handleStartButton}>{getStartButtonLabel()}</button>
            <button onClick={resetTimer}>Reset Time</button>
            <button
              onClick={() => {
                resetTimer();
                cubeRef.current?.resetCube();
              }}
            >
              Reset Cube
            </button>
            <button onClick={() => setControlsEnabled((prev) => !prev)}>
              {controlsEnabled ? 'Disable Controls' : 'Enable Controls'}
            </button>
          </div>

          {/* Editable Keybinds */}
          <Keybinds
            keybinds={keybinds}
            onKeybindChange={handleKeybindChange}
            controlsEnabled={controlsEnabled}
            setControlsEnabled={setControlsEnabled}
          />
        </div>
      </div>

      <Cube ref={cubeRef} controlsEnabled={controlsEnabled} />
    </div>
  );
}

export default App;
