import { useTranslation } from 'react-i18next';
import { useContestantGuess } from '../hooks/useContestantGuess';
import { ContestantGuessPlayerProps } from '../types';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import { ImageDisplay } from './ImageDisplay';
import { AnswerGrid } from './AnswerGrid';
import { ContestantGuessRoundScores } from './ContestantGuessRoundScores';
import './ContestantGuess.css';
import './ContestantGuessPlayer.css';

function ContestantGuessPlayer({ connection, playerName, players }: ContestantGuessPlayerProps) {
  const { t } = useTranslation();
  const {
    roundState,
    currentQuestion,
    hasGuessed,
    answerRevealed,
    correctAnswer,
    guesses,
    roundScores,
    submitGuess,
  } = useContestantGuess(connection);

  // Navigation is handled by PlayerScreen via useGameCompletion hook
  // This component should not navigate - it should stay mounted until the game actually ends

  const handleAnswerClick = async (answer: string) => {
    if (hasGuessed || answerRevealed) return;
    
    try {
      await submitGuess(answer);
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  if (roundState === 'Waiting' || !currentQuestion) {
    return (
      <div className="contestant-guess-player">
        <div className="waiting-message">
          <h2>{t('game.waitingForRound')}</h2>
        </div>
      </div>
    );
  }

  const playerGuess = guesses[playerName];
  const isPlayerCorrect = playerGuess === correctAnswer;

  return (
    <div className="contestant-guess-player">
      <div className="contestant-guess-question-container">
        <h2>{t('game.whichContestant')}</h2>
        <ImageDisplay imageUrl={currentQuestion.imageUrl} />

        {!answerRevealed ? (
          <>
            {hasGuessed ? (
              <div className="answer-submitted">
                <p>{t('game.guessSubmitted')}</p>
              </div>
            ) : (
              <AnswerGrid
                answers={currentQuestion.possibleAnswers}
                onAnswerClick={handleAnswerClick}
                disabled={hasGuessed}
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
                  <h3>{t('game.correctPoints', { points: GAME_CONSTANTS.CONTESTANT_GUESS_POINTS_PER_CORRECT })}</h3>
                </div>
              ) : (
                <div className="incorrect-message">
                  <h3>{t('game.incorrect')}</h3>
                  <p>{t('game.correctAnswerWas', { answer: correctAnswer })}</p>
                </div>
              )}
            </div>
            <ContestantGuessRoundScores
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

export default ContestantGuessPlayer;
