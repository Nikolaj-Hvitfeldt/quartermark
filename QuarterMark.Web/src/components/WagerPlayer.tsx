import { useState, useEffect } from 'react';
import { useWager } from '../hooks/useWager';
import { WagerPlayerProps } from '../types';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerGrid } from './AnswerGrid';
import { WagerRoundScores } from './WagerRoundScores';
import { calculateWinnings, WAGER_CONSTANTS } from '../utils/wagerUtils';
import './Wager.css';
import './WagerPlayer.css';

function WagerPlayer({ connection, playerName, players, onBack }: WagerPlayerProps) {
  const {
    roundState,
    currentQuestion,
    hasWagered,
    hasAnswered,
    playerWager,
    answerRevealed,
    correctAnswer,
    guesses,
    wagers,
    roundScores,
    submitWager,
    submitAnswer,
  } = useWager(connection);

  // Find player from props (more up-to-date)
  const player = players.find(p => p.name === playerName);
  
  // Calculate available score: base score + net changes from current round
  // This ensures the score updates immediately after each question, even before round ends
  // The roundScores track cumulative net winnings/losses for the current round
  const baseScore = player?.score || 0;
  const roundNetChange = roundScores[playerName] || 0;
  const availableScore = Math.max(0, baseScore + roundNetChange);

  const [wagerInput, setWagerInput] = useState<string>('0');

  // Reset wager input when new question appears
  useEffect(() => {
    if (roundState === 'Wagering') {
      setWagerInput('0');
    }
  }, [roundState]);

  const handleWagerInputChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      setWagerInput('0');
      return;
    }
    // Cap at maximum available score
    const cappedValue = Math.min(numValue, availableScore);
    setWagerInput(cappedValue.toString());
  };

  const handleWagerSubmit = async () => {
    const wagerAmount = parseInt(wagerInput, 10);
    if (isNaN(wagerAmount) || wagerAmount < 0 || wagerAmount > availableScore) {
      return;
    }
    
    try {
      await submitWager(wagerAmount);
    } catch (error) {
      console.error('Error submitting wager:', error);
    }
  };

  const handleAnswerClick = async (answer: string) => {
    if (hasAnswered || answerRevealed || !hasWagered) return;
    
    try {
      await submitAnswer(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (roundState === 'Waiting' || !currentQuestion) {
    return (
      <div className="wager-player">
        <div className="waiting-message">
          <h2>Waiting for host to start the round...</h2>
        </div>
      </div>
    );
  }

  const playerGuess = guesses[playerName];
  const isPlayerCorrect = playerGuess === correctAnswer;
  const playerWagerAmount = wagers[playerName] || 0;
  const netChange = roundScores[playerName] || 0;

  return (
    <div className="wager-player">
      <div className="wager-question-container">
        <div className="player-score-display">
          <p>Your current score: <strong>{availableScore} pts</strong></p>
        </div>
        
        <QuestionDisplay questionText={currentQuestion.questionText} />

        {roundState === 'Wagering' && !hasWagered && (
          <>
            <div className="wager-input-section">
              <label htmlFor="wager-input">How many points do you want to wager?</label>
              <div className="wager-input-group">
                <input
                  id="wager-input"
                  type="number"
                  min="0"
                  max={availableScore}
                  value={wagerInput}
                  onChange={(e) => handleWagerInputChange(e.target.value)}
                  className="wager-input"
                  placeholder="0"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleWagerSubmit}
                  disabled={!wagerInput || parseInt(wagerInput, 10) < 0 || parseInt(wagerInput, 10) > availableScore}
                >
                  Place Wager
                </button>
              </div>
              <p className="wager-hint">
                Wager up to {availableScore} points. Correct answer wins double!
              </p>
            </div>
            <AnswerGrid answers={currentQuestion.possibleAnswers} />
          </>
        )}

        {roundState === 'Wagering' && hasWagered && !answerRevealed && (
              <>
                <div className="wager-reminder">
                  <p>Your wager: <strong>{playerWagerAmount} pts</strong> (Win: +{calculateWinnings(playerWagerAmount)}, Lose: -{playerWagerAmount})</p>
                </div>
            {hasAnswered ? (
              <div className="answer-submitted">
                <p>✓ Answer submitted! Waiting for other players...</p>
              </div>
            ) : (
              <AnswerGrid
                answers={currentQuestion.possibleAnswers}
                onAnswerClick={handleAnswerClick}
                disabled={hasAnswered}
              />
            )}
          </>
        )}

        {answerRevealed && (
          <>
            <AnswerGrid
              answers={currentQuestion.possibleAnswers}
              correctAnswer={correctAnswer}
              guesses={guesses}
              playerGuess={playerGuess}
              playerName={playerName}
              revealed={true}
            />
            <div className="result-message">
              {isPlayerCorrect ? (
                <div className="correct-message">
                  <h3>🎉 Correct!</h3>
                  <p>You won {calculateWinnings(playerWagerAmount)} points!</p>
                  <p>Net gain: +{playerWagerAmount} points</p>
                </div>
              ) : (
                <div className="incorrect-message">
                  <h3>❌ Incorrect</h3>
                  <p>You lost {playerWagerAmount} points</p>
                  <p>The correct answer was: {correctAnswer}</p>
                </div>
              )}
            </div>
            <WagerRoundScores
              roundScores={roundScores}
              players={players}
              wagers={wagers}
              guesses={guesses}
              correctAnswer={correctAnswer}
              highlightPlayerName={playerName}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default WagerPlayer;

