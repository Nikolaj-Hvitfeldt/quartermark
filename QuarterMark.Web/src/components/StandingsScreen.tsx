import { useTranslation } from 'react-i18next';
import { PlayerDto } from '../types';
import { sortPlayersByScore, getStandingsConstants } from '../utils/standingsUtils';
import './StandingsScreen.css';

interface StandingsScreenProps {
  players: PlayerDto[];
  currentQuestion: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
  title?: string;
}

export function StandingsScreen({
  players,
  currentQuestion,
  totalQuestions,
  onNextQuestion,
  isLastQuestion,
  title,
}: StandingsScreenProps) {
  const { t } = useTranslation();
  const sortedPlayers = sortPlayersByScore(players);
  const STANDINGS_CONSTANTS = getStandingsConstants(t);
  const displayTitle = title || STANDINGS_CONSTANTS.TITLES.CURRENT_STANDINGS;

  return (
    <div className="standings-screen">
      <div className="standings-content">
        <h2 className="standings-title">{displayTitle}</h2>
        <p className="standings-progress">
          {STANDINGS_CONSTANTS.PROGRESS_FORMAT(currentQuestion, totalQuestions)}
        </p>

        <div className="standings-list">
          {sortedPlayers.map((player, index) => (
            <div key={player.name} className="standings-item">
              <span className="standings-rank">#{index + 1}</span>
              <span className="standings-name">{player.name}</span>
              <span className="standings-score">{player.score} {t('common.points')}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-large" onClick={onNextQuestion}>
          {isLastQuestion ? STANDINGS_CONSTANTS.BUTTONS.END_ROUND : STANDINGS_CONSTANTS.BUTTONS.NEXT_QUESTION}
        </button>
      </div>
    </div>
  );
}

