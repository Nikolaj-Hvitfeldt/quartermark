import { useTranslation } from 'react-i18next';
import { PlayerDto } from '../types';
import { sortPlayersByScore } from '../utils/standingsUtils';
import './WouldILie.css';

interface WouldILieStandingsProps {
  players: PlayerDto[];
  title?: string;
  highlightPlayerName?: string;
}

export function WouldILieStandings({
  players,
  title,
  highlightPlayerName,
}: WouldILieStandingsProps) {
  const { t } = useTranslation();
  const sortedPlayers = sortPlayersByScore(players);

  return (
    <div className="wil-standings">
      <h3>{title ?? t('game.currentStandingsTitle')}</h3>
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

