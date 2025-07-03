// src/components/Keybinds/Keybinds.js

import React, { useState, useEffect, useCallback } from 'react';
import './Keybinds.css';

const DEFAULT_ORDERED_MOVES = [
  'R', "R'",
  'L', "L'",
  'U', "U'",
  'D', "D'",
  'F', "F'",
  'B', "B'",
];

const DEFAULT_KEYBINDS = {
  Q: 'R', P: "R'",
  W: 'L', O: "L'",
  E: 'U', I: "U'",
  R: 'D', U: "D'",
  F: 'F', J: "F'",
  G: 'B', H: "B'",
};

const Keybinds = ({ controlsEnabled, setControlsEnabled }) => {
  const [keybinds, setKeybinds] = useState(() => {
    const saved = localStorage.getItem('keybinds');
    return saved ? JSON.parse(saved) : DEFAULT_KEYBINDS;
  });

  const [editingMove, setEditingMove] = useState(null);
  const [wasControlsEnabled, setWasControlsEnabled] = useState(true);

  const handleKeybindChange = (updatedKeybinds) => {
    setKeybinds(updatedKeybinds);
    localStorage.setItem('keybinds', JSON.stringify(updatedKeybinds));
  };

  const finishEditing = useCallback(() => {
    setEditingMove(null);
    setControlsEnabled(wasControlsEnabled);
  }, [wasControlsEnabled, setControlsEnabled]);

  const handleKeyDown = useCallback((e) => {
    if (!editingMove) return;

    const newKey = e.key.toUpperCase();

    if (keybinds[newKey]) {
      alert(`Key "${newKey}" is already assigned.`);
      finishEditing();
      return;
    }

    const updated = { ...keybinds };
    const oldKey = Object.entries(keybinds).find(([, val]) => val === editingMove)?.[0];
    if (oldKey) delete updated[oldKey];
    updated[newKey] = editingMove;

    handleKeybindChange(updated);
    finishEditing();
  }, [editingMove, keybinds, finishEditing]);

  const handleReset = () => {
    handleKeybindChange({ ...DEFAULT_KEYBINDS });
    finishEditing();
  };

  const startEditing = (move) => {
    if (editingMove) return;
    setWasControlsEnabled(controlsEnabled);
    setControlsEnabled(false);
    setEditingMove(move);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="guide col-span-6">
      <div className="guide-header">
        <div className="guide-title">
          <h3>Keybinds</h3>
          <p className="guide-description">Click a move to reassign its key.</p>
        </div>
        <button
          className="keybind-edit-btn reset-btn"
          onClick={handleReset}
          disabled={editingMove !== null}
        >
          Reset to Default
        </button>
      </div>

      <div className="keybinds-container">
        {DEFAULT_ORDERED_MOVES.map((move) => {
          const assignedKey = Object.entries(keybinds).find(([, val]) => val === move)?.[0];
          const isEditing = editingMove === move;

          const label = isEditing
            ? `${move}: ...`
            : `${move}: ${assignedKey || 'Unassigned'}`;

          return (
            <div
              key={move}
              className={`keybind-item${isEditing ? ' editing' : ''}`}
              onClick={() => startEditing(move)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') startEditing(move);
              }}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Keybinds;
export { DEFAULT_KEYBINDS };
