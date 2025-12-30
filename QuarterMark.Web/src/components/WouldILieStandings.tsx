import React from 'react';
import { PlayerDto } from '../types';
import './WouldILie.css';

interface WouldILieStandingsProps {
  players: PlayerDto[];
  title?: string;
  highlightPlayerName?: string;
}

export function WouldILieStandings({
  players,
  title = '📊 Current Standings',
  highlightPlayerName,
}: WouldILieStandingsProps) {
  const sortedPlayers = [...players]
    .filter(p => !p.isHost)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="wil-standings">
      <h3>{title}</h3>
      <div className="wil-standings-list">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.name}
            className={`wil-standing-item ${player.name === highlightPlayerName ? 'highlight' : ''}`}
          >
            <span className="wil-standing-rank">#{index + 1}</span>
            <span className="wil-standing-name">{player.name}</span>
            <span className="wil-standing-score">{player.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

