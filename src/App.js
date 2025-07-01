import React, { useRef, useEffect, useState } from 'react';
import Cube from './components/Cube';
import './App.css';

const DEFAULT_KEYBINDS = {
  Q: 'R', P: "R'",
  W: 'L', O: "L'",
  E: 'U', I: "U'",
  R: 'D', U: "D'",
  F: 'F', J: "F'",
  G: 'B', H: "B'",
};

function App() {
  const cubeRef = useRef();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [started, setStarted] = useState(false); // user started solving
  const [shuffleFinished, setShuffleFinished] = useState(false); // shuffle complete
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [isSolved, setIsSolved] = useState(null);
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

  const shuffleCube = () => {
    setIsSolved(null);
    setStarted(false);
    setShuffleFinished(false);
    setControlsEnabled(false);
    setTime(0);
    setIsRunning(false);

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
    setTime(0);
    setIsRunning(false);
    setStarted(false);
    setShuffleFinished(false);
    setIsSolved(null);
  };

  const handleCheckSolved = () => {
    if (cubeRef.current?.isCubeSolved()) {
      stopTimer();
      setControlsEnabled(false);
      setIsSolved(true);
    } else {
      setIsSolved(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const move = keybinds[e.key.toUpperCase()];
      if (move) {
        e.preventDefault();
        if (controlsEnabled && cubeRef.current) {
          if (shuffleFinished && !started) {
            setStarted(true);
            setIsRunning(true);
          }
          cubeRef.current.rotateFace(move);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keybinds, controlsEnabled, shuffleFinished, started]);

  const handleKeybindChange = (key, newMove) => {
    const updated = { ...keybinds, [key]: newMove };
    setKeybinds(updated);
    localStorage.setItem('keybinds', JSON.stringify(updated));
  };

  return (
    <div className="app-container">
      <h1 className="title">{formatTime(time)}</h1>
      {isSolved !== null && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '2rem',
          color: isSolved ? '#32ff7e' : '#ff4f4f',
          fontWeight: 'bold',
          background: '#1a1d2bcc',
          padding: '10px 20px',
          borderRadius: '8px',
          zIndex: 2
        }}>
          {isSolved ? '✅ Solved!' : '❌ Not solved yet'}
        </div>
      )}

      <div className="button-panel">
        <div className="button-row">
          <button onClick={shuffleCube}>Start</button>
          <button onClick={stopTimer}>Stop</button>
          <button onClick={resetTimer}>Reset</button>
          <button onClick={() => cubeRef.current?.resetCube()}>Reset Cube</button>
          <button onClick={handleCheckSolved}>Check Cube</button>
          <button onClick={() => setControlsEnabled((e) => !e)}>
            {controlsEnabled ? 'Disable Controls' : 'Enable Controls'}
          </button>
        </div>

        <div className="guide">
          <h3>Keybinds</h3>
          <div className="keybinds-container">
            {Object.entries(keybinds).map(([key, move]) => (
              <div key={key} className="keybind-item">
                {key}:
                <select
                  value={move}
                  onChange={(e) => handleKeybindChange(key, e.target.value)}
                  disabled={!controlsEnabled}
                >
                  {Object.values(DEFAULT_KEYBINDS).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Cube ref={cubeRef} controlsEnabled={controlsEnabled} />
    </div>
  );
}

export default App;
