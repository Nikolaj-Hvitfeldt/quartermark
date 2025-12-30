import React from 'react';
import { PlayerDto } from '../types';
import { sortPlayersByScore } from '../utils/gameUtils';
import './Wager.css';

interface WagerRoundScoresProps {
  roundScores: Record<string, number>;
  players: PlayerDto[];
  wagers: Record<string, number>;
  guesses: Record<string, string>;
  correctAnswer: string;
  highlightPlayerName?: string;
}

export function WagerRoundScores({
  roundScores,
  players,
  wagers,
  guesses,
  correctAnswer,
  highlightPlayerName,
}: WagerRoundScoresProps) {
  const nonHostPlayers = players.filter((p) => !p.isHost);
  
  const sortedPlayers = sortPlayersByScore(
    nonHostPlayers,
    roundScores
  );

  return (
    <div className="round-scores">
      <h3>Round Winnings/Losses</h3>
      <div className="wager-results-list">
        {sortedPlayers.map((player, index) => {
          const playerWager = wagers[player.name] || 0;
          const playerGuess = guesses[player.name];
          const isCorrect = playerGuess === correctAnswer;
          const netChange = roundScores[player.name] || 0;

          return (
            <div
              key={player.name}
              className={`wager-result-item ${player.name === highlightPlayerName ? 'current-player' : ''} ${isCorrect ? 'correct' : 'incorrect'}`}
            >
              <span className="player-name">{player.name}</span>
              <span className="wager-amount">Wagered: {playerWager} pts</span>
              <span className={`net-change ${netChange >= 0 ? 'gain' : 'loss'}`}>
                {netChange >= 0 ? '+' : ''}{netChange} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

