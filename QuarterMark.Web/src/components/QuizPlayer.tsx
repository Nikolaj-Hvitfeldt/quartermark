import { useEffect, useState, useRef } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuizPlayerProps } from '../types';
import { getBonusMessage, calculatePointsEarned, QUIZ_SCORING } from '../utils/quizUtils';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerGrid } from './AnswerGrid';
import { QuizRoundScores } from './QuizRoundScores';
import './Quiz.css';
import './QuizPlayer.css';

function QuizPlayer({ connection, playerName, players, onBack }: QuizPlayerProps) {
  const {
    roundState,
    currentQuestion,
    hasAnswered,
    answerRevealed,
    correctAnswer,
    guesses,
    roundScores,
    submitAnswer,
  } = useQuiz(connection);

  const [previousRoundScores, setPreviousRoundScores] = useState<Record<string, number>>({});
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const previousRoundStateRef = useRef<string>('');

  // Track previous scores when a new question is shown to calculate points earned
  useEffect(() => {
    // When state changes from Waiting/Revealed to ShowingQuestion, store current scores
    if (roundState === 'ShowingQuestion' && previousRoundStateRef.current !== 'ShowingQuestion') {
      setPreviousRoundScores({ ...roundScores });
    }
    previousRoundStateRef.current = roundState;
  }, [roundState, roundScores]);

  // Calculate points earned when answer is revealed
  useEffect(() => {
    if (answerRevealed && roundScores) {
      const previousScore = previousRoundScores[playerName] || 0;
      const newScore = roundScores[playerName] || 0;
      const points = calculatePointsEarned(previousScore, newScore);
      setPointsEarned(points);
    }
  }, [answerRevealed, roundScores, playerName, previousRoundScores]);

  // Reset when round starts
  useEffect(() => {
    if (roundState === 'Waiting') {
      setPreviousRoundScores({});
      setPointsEarned(0);
    }
  }, [roundState]);

  const handleAnswerClick = async (answer: string) => {
    if (hasAnswered || answerRevealed) return;
    
    try {
      await submitAnswer(answer);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (roundState === 'Waiting' || !currentQuestion) {
    return (
      <div className="quiz-player">
        <div className="waiting-message">
          <h2>Waiting for question...</h2>
        </div>
      </div>
    );
  }

  const playerGuess = guesses[playerName];
  const isPlayerCorrect = playerGuess === correctAnswer;

  return (
    <div className="quiz-player">
      <div className="quiz-question-container">
        <QuestionDisplay
          questionText={currentQuestion.questionText}
          imageUrl={currentQuestion.imageUrl}
        />

        {!answerRevealed ? (
          <>
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
        ) : (
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
                  <h3>🎉 Correct! +{pointsEarned} points</h3>
                  {pointsEarned > QUIZ_SCORING.BASE_POINTS && (
                    <p className="bonus-text">
                      {getBonusMessage(pointsEarned)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="incorrect-message">
                  <h3>❌ Incorrect</h3>
                  <p>The correct answer was: {correctAnswer}</p>
                </div>
              )}
            </div>
            <QuizRoundScores
              roundScores={roundScores}
              players={players}
              highlightPlayerName={playerName}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default QuizPlayer;

