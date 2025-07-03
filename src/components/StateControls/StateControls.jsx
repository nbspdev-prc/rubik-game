import React from 'react';
import './StateControls.css';

function StateControls({
  time,
  shuffleCube,
  handleStartButton,
  getStartButtonLabel,
  resetTimer,
  resetState,
  controlsEnabled,
  setControlsEnabled
}) {
  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Timer */}
      <div className="timer col-span-2">
        <span>{formatTime(time)}</span>
      </div>

      {/* Labeled Button Panel */}
      <div className="state-controls col-span-4">
        <div className="state-controls-header">
          <h3>State Controls</h3>
          <p className="state-controls-description">Control the timer and cube.</p>
        </div>
        <div className="button-row">
          <button onClick={shuffleCube}>Shuffle (Start)</button>
          <button onClick={handleStartButton}>{getStartButtonLabel()}</button>
          <button onClick={resetTimer}>Reset Time</button>
          <button onClick={resetState}>Reset Cube</button>
          <button onClick={() => setControlsEnabled((prev) => !prev)}>
            {controlsEnabled ? 'Disable Controls' : 'Enable Controls'}
          </button>
        </div>
      </div>
    </>
  );
}

export default StateControls;
