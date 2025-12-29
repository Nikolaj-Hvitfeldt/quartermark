import { GameRule } from '../data/gameRules';
import './GameRulesCard.css';

interface GameRulesCardProps {
  title: string;
  subtitle?: string;
  rules: GameRule[];
  pointsInfo?: string;
  onStart: () => void;
  startButtonText?: string;
  isLoading?: boolean;
}

export function GameRulesCard({
  title,
  subtitle,
  rules,
  pointsInfo,
  onStart,
  startButtonText = 'Start Game',
  isLoading = false,
}: GameRulesCardProps) {
  return (
    <div className="game-rules-card">
      <div className="rules-header">
        <h2 className="rules-title">{title}</h2>
        {subtitle && <p className="rules-subtitle">{subtitle}</p>}
      </div>

      <div className="rules-content">
        <h3 className="how-to-play">How to Play</h3>
        <ul className="rules-list">
          {rules.map((rule, index) => (
            <li key={index} className="rule-item">
              <span className="rule-emoji">{rule.emoji}</span>
              <span className="rule-text">{rule.text}</span>
            </li>
          ))}
        </ul>

        {pointsInfo && (
          <div className="points-info">
            <span className="points-emoji">🏆</span>
            <span className="points-text">{pointsInfo}</span>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-large start-game-btn"
        onClick={onStart}
        disabled={isLoading}
      >
        {isLoading ? 'Starting...' : startButtonText}
      </button>
    </div>
  );
}

