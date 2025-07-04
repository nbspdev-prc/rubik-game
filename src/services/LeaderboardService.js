import rawData from './leaderboard.json';

let leaderboard = [...rawData];
leaderboard.sort((a, b) => a.time - b.time);

export function getLeaderboard() {
  return leaderboard;
}

export function addScore(name, time) {
  const newScore = { name, time };

  if (leaderboard.length < 15) {
    insertInOrder(newScore);
  }

  else if (time < leaderboard[leaderboard.length - 1].time) {
    insertInOrder(newScore);
    leaderboard = leaderboard.slice(0, 15);
  }

  return leaderboard;
}

function insertInOrder(score) {
  let inserted = false;
  for (let i = 0; i < leaderboard.length; i++) {
    if (score.time < leaderboard[i].time) {
      leaderboard.splice(i, 0, score);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    leaderboard.push(score);
  }
}
