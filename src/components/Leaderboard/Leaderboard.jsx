import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ leaderboardData }) => {
  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="col-span-5">
        <h3 className="leaderboard-title">Leaderboard:</h3>
        <p className="leaderboard-description">No scores yet.</p>
      </div>
    );
  }

  return (
    <div className="col-span-5">
      <div>
        <h3 className="leaderboard-title">Leaderboard:</h3>
        <p className="leaderboard-description">Top 15 fastest mix solver.</p>
      </div>

      <div className="leaderboard-container"> 
        <div className="grid grid-cols-5 gap-2">
          {leaderboardData.map((entry, index) => (
            <React.Fragment key={index}>
              <div className="name-label">
                <div className="rank">#{index + 1}</div>
                <div className="name">{entry.name}</div>
                <div className="time">{entry.time}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
