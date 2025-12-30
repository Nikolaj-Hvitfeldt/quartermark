import React from 'react';
import './AnswerGrid.css';

interface AnswerGridProps {
  answers: string[];
  correctAnswer?: string;
  guesses?: Record<string, string>;
  playerGuess?: string;
  playerName?: string;
  revealed?: boolean;
  onAnswerClick?: (answer: string) => void;
  disabled?: boolean;
}

export function AnswerGrid({
  answers,
  correctAnswer,
  guesses,
  playerGuess,
  playerName,
  revealed = false,
  onAnswerClick,
  disabled = false,
}: AnswerGridProps) {
  const handleClick = (answer: string) => {
    if (!disabled && !revealed && onAnswerClick) {
      onAnswerClick(answer);
    }
  };

  const answerColors = ['answer-option-blue', 'answer-option-purple', 'answer-option-red', 'answer-option-orange'];

  return (
    <div className={`answer-options-grid ${revealed ? 'revealed' : ''}`}>
      {answers.map((answer, index) => {
        const isCorrect = revealed && correctAnswer === answer;
        const isPlayerChoice = revealed && playerGuess === answer;
        const guessCount = revealed && guesses
          ? Object.values(guesses).filter(g => g === answer).length
          : 0;
        const colorClass = answerColors[index % answerColors.length];

        return (
          <div
            key={index}
            className={`answer-option ${colorClass} ${isCorrect ? 'correct' : ''} ${isPlayerChoice ? 'player-choice' : ''} ${!revealed && onAnswerClick ? 'clickable' : ''}`}
            onClick={() => handleClick(answer)}
            role={onAnswerClick ? 'button' : undefined}
            tabIndex={onAnswerClick && !disabled ? 0 : undefined}
          >
            <div className="answer-text">{answer}</div>
            {revealed && isCorrect && (
              <div className="correct-badge">✓ Correct</div>
            )}
            {revealed && isPlayerChoice && playerName && (
              <div className="player-badge">Your Answer</div>
            )}
            {revealed && guesses && guessCount > 0 && (
              <div className="guess-count">
                {guessCount} {guessCount === 1 ? 'player' : 'players'} chose this
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

