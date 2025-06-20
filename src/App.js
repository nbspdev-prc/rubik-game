import React from 'react';
import Cube from './components/Cube';

const App = () => {
  const moves = ['F', 'B', 'R', 'L', 'U', 'D'];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Cube />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        {moves.map((move) => (
          <React.Fragment key={move}>
            <button onClick={() => window.performMove(move)}>{move}</button>
            <button onClick={() => window.performMove(move + "'")}>{move}'</button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default App;