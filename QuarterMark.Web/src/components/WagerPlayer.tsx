import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWager } from '../hooks/useWager';
import { WagerPlayerProps } from '../types';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerGrid } from './AnswerGrid';
import { WagerRoundScores } from './WagerRoundScores';
import { calculateWinnings, WAGER_CONSTANTS } from '../utils/wagerUtils';
import './Wager.css';
import './WagerPlayer.css';

function WagerPlayer({ connection, playerName, players, onBack }: WagerPlayerProps) {
  const { t } = useTranslation();
  const WAGER_QUESTIONS = getWagerQuestions(t);
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

  // Translate question if questionId is available
  const translatedQuestion = useMemo(() => {
    if (!currentQuestion || !currentQuestion.questionId) {
      return currentQuestion; // Fallback to received text if no ID
    }
    const question = WAGER_QUESTIONS.find(q => q.id === currentQuestion.questionId);
    if (!question) {
      return currentQuestion; // Fallback if question not found
    }
    return {
      questionText: question.questionText,
      possibleAnswers: question.answers,
      questionId: question.id,
      correctAnswer: question.correctAnswer,
    };
  }, [currentQuestion, WAGER_QUESTIONS]);

  // Translate correctAnswer when revealed (map from original to translated)
  const translatedCorrectAnswer = useMemo(() => {
    if (!answerRevealed || !correctAnswer || !currentQuestion || !currentQuestion.questionId || !translatedQuestion) {
      return correctAnswer;
    }
    // Find the index of the correct answer in the original answers
    const originalIndex = currentQuestion.originalAnswers?.indexOf(correctAnswer);
    if (originalIndex !== undefined && originalIndex >= 0 && originalIndex < translatedQuestion.possibleAnswers.length) {
      return translatedQuestion.possibleAnswers[originalIndex];
    }
    return correctAnswer; // Fallback
  }, [answerRevealed, correctAnswer, currentQuestion, translatedQuestion]);

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

  const handleAnswerClick = async (translatedAnswer: string) => {
    if (hasAnswered || answerRevealed || !hasWagered || !currentQuestion) return;
    
    // Map translated answer back to original answer for backend submission
    // Answers are in the same order, so we can use index
    let answerToSubmit = translatedAnswer;
    if (currentQuestion.questionId && translatedQuestion && currentQuestion.originalAnswers) {
      const translatedIndex = translatedQuestion.possibleAnswers.indexOf(translatedAnswer);
      if (translatedIndex >= 0 && translatedIndex < currentQuestion.originalAnswers.length) {
        answerToSubmit = currentQuestion.originalAnswers[translatedIndex];
      }
    }
    
    try {
      await submitAnswer(answerToSubmit);
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
  // Map playerGuess to translated version for display comparison
  const translatedPlayerGuess = useMemo(() => {
    if (!playerGuess || !currentQuestion || !currentQuestion.questionId || !translatedQuestion || !currentQuestion.originalAnswers) {
      return playerGuess;
    }
    const originalIndex = currentQuestion.originalAnswers.indexOf(playerGuess);
    if (originalIndex >= 0 && originalIndex < translatedQuestion.possibleAnswers.length) {
      return translatedQuestion.possibleAnswers[originalIndex];
    }
    return playerGuess;
  }, [playerGuess, currentQuestion, translatedQuestion]);
  const isPlayerCorrect = playerGuess === correctAnswer; // Compare original texts
  // Use playerWager from store during wagering phase, wagers[playerName] after reveal
  const playerWagerAmount = answerRevealed ? (wagers[playerName] || 0) : playerWager;
  const netChange = roundScores[playerName] || 0;

  return (
    <div className="wager-player">
      <div className="wager-question-container">
        <div className="player-score-display">
          <p>{t('wager.player.yourCurrentScore', { score: availableScore })}</p>
        </div>
        
        {/* Blind wagering phase - question hidden */}
        {roundState === 'Wagering' && !hasWagered && (
          <>
            <div className="blind-wager-header">
              <h2>{t('wager.blindWager.title')}</h2>
              <p className="blind-wager-subtitle">{t('wager.blindWager.subtitle')}</p>
            </div>
            <div className="wager-input-section">
              <label htmlFor="wager-input">{t('wager.blindWager.howManyPoints')}</label>
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
                  {t('wager.blindWager.placeWager')}
                </button>
              </div>
              <p className="wager-hint">
                {t('wager.blindWager.wagerHint', { max: availableScore })}
              </p>
            </div>
          </>
        )}

        {/* Waiting for others to wager */}
        {roundState === 'Wagering' && hasWagered && !hasAnswered && (
          <div className="wager-waiting">
            <div className="wager-reminder">
              <p>{t('wager.blindWager.yourWager', { amount: playerWagerAmount, win: calculateWinnings(playerWagerAmount), lose: playerWagerAmount })}</p>
            </div>
            <div className="waiting-for-wagers">
              <p>{t('wager.blindWager.waitingForWagers')}</p>
              <p className="waiting-hint">{t('wager.blindWager.revealHint')}</p>
            </div>
          </div>
        )}

        {/* Answering phase - question visible after all wagers are in */}
        {roundState === 'Answering' && !answerRevealed && (
          <>
            <div className="wager-reminder">
              <p>{t('wager.blindWager.yourWager', { amount: playerWagerAmount, win: calculateWinnings(playerWagerAmount), lose: playerWagerAmount })}</p>
            </div>
            <QuestionDisplay questionText={translatedQuestion?.questionText || currentQuestion?.questionText || ''} />
            {hasAnswered ? (
              <div className="answer-submitted">
                <p>{t('wager.player.answerSubmitted')}</p>
              </div>
            ) : (
              <AnswerGrid
                answers={translatedQuestion?.possibleAnswers || currentQuestion?.possibleAnswers || []}
                onAnswerClick={handleAnswerClick}
                disabled={hasAnswered}
              />
            )}
          </>
        )}

        {answerRevealed && (
          <>
            <QuestionDisplay questionText={translatedQuestion?.questionText || currentQuestion?.questionText || ''} />
            <AnswerGrid
              answers={translatedQuestion?.possibleAnswers || currentQuestion?.possibleAnswers || []}
              correctAnswer={translatedCorrectAnswer}
              guesses={guesses}
              playerGuess={translatedPlayerGuess}
              playerName={playerName}
              revealed={true}
            />
            <div className="result-message">
              {isPlayerCorrect ? (
                <div className="correct-message">
                  <h3>{t('wager.player.correct')}</h3>
                  <p>{t('wager.player.youWon', { points: calculateWinnings(playerWagerAmount) })}</p>
                </div>
              ) : (
                <div className="incorrect-message">
                  <h3>{t('wager.player.incorrect')}</h3>
                  <p>{t('wager.player.youLost', { points: playerWagerAmount })}</p>
                  <p>{t('wager.player.correctAnswerWas', { answer: translatedCorrectAnswer })}</p>
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

