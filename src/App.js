import React, { useRef, useEffect, useState } from 'react';
import Cube from './components/Cube';
import './App.css';

function App() {
	const cubeRef = useRef();
	const buttonRefs = useRef({});

	const moves = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"];

	const handleMove = (move) => {
		if (cubeRef.current) {
			cubeRef.current.rotateFace(move);
		}
	};
  
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);


  function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); 

    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const paddedMilliseconds = milliseconds < 10 ? `0${milliseconds}` : milliseconds;

    return `${minutes}:${paddedSeconds}.${paddedMilliseconds}`;
  }

  function resetTimer() {
    setTime(0);
    setIsRunning(false);
  }

	const shuffleCube = () => {
		const randomMoves = [];
		const totalMoves = 20;
		for (let i = 0; i < totalMoves; i++) {
			const move = moves[Math.floor(Math.random() * moves.length)];
			randomMoves.push(move);
		}
		randomMoves.forEach((move, index) => {
			setTimeout(() => {
				handleMove(move);
			}, index * 500);
		});
	};

  useEffect(() => {
    const keyMap = {
      Q: 'R',
      P: "R'",
      W: 'L',
      O: "L'",
      E: 'U',
      I: "U'",
      R: 'D',
      U: "D'",
      F: 'F',
      J: "F'",
      G: 'B',
      H: "B'",
    };

    const handleKeyDown = (e) => {
      const move = keyMap[e.key.toUpperCase()];
      if (move) {
        e.preventDefault();
        handleMove(move);

        const btn = buttonRefs.current[move];
        if (btn) {
          btn.classList.add('pressed');
          setTimeout(() => btn.classList.remove('pressed'), 150);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

	return (
		<div className="app-container">
			<h1 className="title">{formatTime(time)}</h1>
			<div className="button-panel" style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
				{/* {moves.map((move) => (
					<button
						key={move}
						ref={(el) => (buttonRefs.current[move] = el)}
						onClick={() => handleMove(move)}
					>
						{move}
					</button>
				))} */}
				<button onClick={shuffleCube}>Shuffle</button>
        <button onClick={() => setIsRunning(!isRunning)}> Start Timer </button>
        <button onClick={resetTimer}> Reset Timer </button>
				<div className="guide">
					<h3>Keyboard Controls</h3>
					<ul>
						<li>Q: R</li>
						<li>W: L</li>
						<li>E: U</li>
						<li>R: D</li>
						<li>F: F</li>
						<li>G: B</li>
					</ul>
					<div> &nbsp;</div>
					<ul>
						<li>P: R'</li>
						<li>O: L'</li>
						<li>I: U'</li>
						<li>U: D'</li>
						<li>J: F'</li>
						<li>H: B'</li>
					</ul>
				</div>
			</div>
			<Cube ref={cubeRef} />
		</div>
	);
}

export default App;