import { Leaderboard } from './Leaderboard';
import { PlayerDto } from '../types';
import { sortPlayersByScore } from '../utils/gameUtils';
import './ContestantGuess.css';

interface ContestantGuessRoundScoresProps {
  roundScores: Record<string, number>;
  players: PlayerDto[];
  highlightPlayerName?: string;
}

export function ContestantGuessRoundScores({
  roundScores,
  players,
  highlightPlayerName,
}: ContestantGuessRoundScoresProps) {
  // Filter out host and create player list with round scores
  const nonHostPlayers = players.filter((p) => !p.isHost);
  
  // Create a sorted list of players based on round scores
  const sortedPlayers = sortPlayersByScore(
    nonHostPlayers,
    roundScores
  );

  return (
    <div className="round-scores">
      <h3>Round Scores</h3>
      <Leaderboard
        players={sortedPlayers}
        accumulatedScores={roundScores}
        highlightPlayerName={highlightPlayerName}
      />
    </div>
  );
}

