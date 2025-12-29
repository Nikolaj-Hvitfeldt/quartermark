import { useEffect, useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuizPlayerProps, QuizQuestionShownData, QuizAnswerRevealedData } from '../types';
import signalRService from '../services/signalRService';
import { GAME_CONSTANTS } from '../utils/gameUtils';
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
    setRoundState,
    setCurrentQuestion,
    setHasAnswered,
    setAnswerRevealed,
    setCorrectAnswer,
    setGuesses,
    setRoundScores,
  } = useQuiz(connection);

  const [previousRoundScores, setPreviousRoundScores] = useState<Record<string, number>>({});
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundState('Waiting');
      setCurrentQuestion(null);
      setHasAnswered(false);
      setAnswerRevealed(false);
      setRoundScores({});
      setPreviousRoundScores({});
      setPointsEarned(0);
    };

    const handleQuestionShown = (data: QuizQuestionShownData) => {
      setRoundState('ShowingQuestion');
      setCurrentQuestion({
        questionText: data.questionText,
        imageUrl: data.imageUrl,
        possibleAnswers: data.possibleAnswers,
      });
      setHasAnswered(false);
      setAnswerRevealed(false);
      // Store current scores before revealing answer to calculate points earned
      setPreviousRoundScores({ ...roundScores });
    };

    const handleAnswerRevealed = (data: QuizAnswerRevealedData) => {
      setCorrectAnswer(data.correctAnswer);
      setGuesses(data.guesses);
      setAnswerRevealed(true);
      setRoundState('Revealed');
      
      // Calculate points earned for this question
      const newScores = data.roundScores || {};
      const previousScore = previousRoundScores[playerName] || 0;
      const newScore = newScores[playerName] || 0;
      const points = newScore - previousScore;
      setPointsEarned(points);
      
      setRoundScores(newScores);
    };

    const handleRoundEnded = () => {
      setRoundState('Waiting');
      setRoundScores({});
      setTimeout(() => {
        onBack();
      }, GAME_CONSTANTS.PLAYER_ROUND_END_DELAY_QUIZ);
    };

    signalRService.on('QuizRoundStarted', handleRoundStarted);
    signalRService.on('QuizQuestionShown', handleQuestionShown);
    signalRService.on('QuizAnswerRevealed', handleAnswerRevealed);
    signalRService.on('QuizRoundEnded', handleRoundEnded);

    return () => {
      signalRService.off('QuizRoundStarted', handleRoundStarted);
      signalRService.off('QuizQuestionShown', handleQuestionShown);
      signalRService.off('QuizAnswerRevealed', handleAnswerRevealed);
      signalRService.off('QuizRoundEnded', handleRoundEnded);
    };
  }, [
    connection,
    playerName,
    setRoundState,
    setCurrentQuestion,
    setHasAnswered,
    setAnswerRevealed,
    setCorrectAnswer,
    setGuesses,
      setRoundScores,
      onBack,
      roundScores,
      previousRoundScores,
    ]);

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

