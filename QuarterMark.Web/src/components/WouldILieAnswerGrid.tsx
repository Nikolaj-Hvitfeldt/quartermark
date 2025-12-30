import React from 'react';
import { getOptionColorClass } from '../utils/wouldILieUtils';
import './WouldILie.css';

interface WouldILieAnswerOption {
  playerName: string;
  label?: string;
  isCorrect?: boolean;
  isPlayerChoice?: boolean;
  showCorrectBadge?: boolean;
  showPlayerBadge?: boolean;
}

interface WouldILieAnswerGridProps {
  options: WouldILieAnswerOption[];
  onOptionClick?: (playerName: string) => void;
  clickable?: boolean;
  revealed?: boolean;
}

export function WouldILieAnswerGrid({
  options,
  onOptionClick,
  clickable = false,
  revealed = false,
}: WouldILieAnswerGridProps) {
  const handleClick = (playerName: string) => {
    if (clickable && onOptionClick) {
      onOptionClick(playerName);
    }
  };

  return (
    <div className="wil-answer-grid">
      {options.map((option, index) => {
        const colorClass = getOptionColorClass(index);
        const classes = [
          'wil-answer-option',
          colorClass,
          clickable ? 'clickable' : '',
          option.isCorrect ? 'correct' : '',
          option.isPlayerChoice ? 'player-choice' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={index}
            className={classes}
            onClick={() => handleClick(option.playerName)}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
          >
            <span className="wil-player-name">{option.playerName}</span>
            {option.label && <span className="wil-option-label">{option.label}</span>}
            {option.showCorrectBadge && <span className="wil-correct-badge">✓ Truth Teller</span>}
            {option.showPlayerBadge && <span className="wil-player-badge">Your Vote</span>}
          </div>
        );
      })}
    </div>
  );
}

