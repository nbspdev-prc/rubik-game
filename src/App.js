// src/App.js

import React, { useRef, useEffect, useState, useCallback } from 'react';
import StateControls from './components/StateControls/StateControls';
import Keybinds from './components/Keybinds/Keybinds';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Cube from './components/Cube';
import './App.css';
import { DEFAULT_KEYBINDS } from './components/Keybinds/Keybinds';
import { getLeaderboard, addScore } from './services/LeaderboardService';

function App() {
  const cubeRef = useRef();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [shuffleFinished, setShuffleFinished] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [isSolved, setIsSolved] = useState(null);
  const [solveMode, setSolveMode] = useState(false);

  // New: leaderboard state
  const [leaderboardData, setLeaderboardData] = useState(getLeaderboard());

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

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

  const stopTimer = () => setIsRunning(false);

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

      // Add score here (name is placeholder)
      const name = prompt("🎉 You solved it! Enter your name:") || "Anonymous";
      const timeInSeconds = (time / 1000).toFixed(2);

      const updated = addScore(name, Number(timeInSeconds));
      setLeaderboardData(updated);
    } else {
      setIsSolved(false);
    }
  }, [solveMode, time]);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      const move = JSON.parse(localStorage.getItem('keybinds') || '{}')[e.key.toUpperCase()];
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

      <div className="header-panel">
        <div className="grid grid-cols-12 gap-4">
          <StateControls
            time={time}
            shuffleCube={shuffleCube}
            handleStartButton={handleStartButton}
            getStartButtonLabel={getStartButtonLabel}
            resetTimer={resetTimer}
            resetState={() => {
              resetTimer();
              cubeRef.current?.resetCube();
            }}
            controlsEnabled={controlsEnabled}
            setControlsEnabled={setControlsEnabled}
          />

          <Keybinds
            controlsEnabled={controlsEnabled}
            setControlsEnabled={setControlsEnabled}
          />

          {/* Pass leaderboard data to the Leaderboard */}
          <Leaderboard leaderboardData={leaderboardData} />
        </div>
      </div>

      <Cube ref={cubeRef} controlsEnabled={controlsEnabled} />
    </div>
  );
}

export default App;
