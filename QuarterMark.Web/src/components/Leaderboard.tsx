import { useTranslation } from 'react-i18next';
import { PlayerDto } from '../types';

interface LeaderboardProps {
  players: PlayerDto[];
  accumulatedScores: Record<string, number>;
  highlightPlayerName?: string;
}

export function Leaderboard({
  players,
  accumulatedScores,
  highlightPlayerName,
}: LeaderboardProps) {
  const { t } = useTranslation();
  return (
    <div className="leaderboard">
      {players.map((player, index) => {
        const isCurrentPlayer = player.name === highlightPlayerName;
        return (
          <div
            key={index}
            className={`leaderboard-item ${isCurrentPlayer ? 'current-player' : ''}`}
          >
            <span className="rank">#{index + 1}</span>
            <span className="player-name">
              {player.name}
              {isCurrentPlayer && <span className="you-badge">{t('game.you')}</span>}
            </span>
            <span className="score">
              {accumulatedScores[player.name] || 0} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}


