import { useSocialMediaGuess } from '../hooks/useSocialMediaGuess';
import { SocialMediaGuessPlayerProps } from '../types';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import { ImageDisplay } from './ImageDisplay';
import { AnswerGrid } from './AnswerGrid';
import { SocialMediaGuessRoundScores } from './SocialMediaGuessRoundScores';
import './SocialMediaGuess.css';
import './SocialMediaGuessPlayer.css';

function SocialMediaGuessPlayer({ connection, playerName, players, onBack }: SocialMediaGuessPlayerProps) {
  const {
    roundState,
    currentQuestion,
    hasGuessed,
    answerRevealed,
    correctAnswer,
    guesses,
    roundScores,
    submitGuess,
  } = useSocialMediaGuess(connection);

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
      <div className="social-media-guess-player">
        <div className="waiting-message">
          <h2>Waiting for host to start the round...</h2>
        </div>
      </div>
    );
  }

  const playerGuess = guesses[playerName];
  const isPlayerCorrect = playerGuess === correctAnswer;

  return (
    <div className="social-media-guess-player">
      <div className="social-media-guess-question-container">
        <h2>Who posted this?</h2>
        <ImageDisplay imageUrl={currentQuestion.imageUrl} />

        {!answerRevealed ? (
          <>
            {hasGuessed ? (
              <div className="answer-submitted">
                <p>✓ Guess submitted! Waiting for other players...</p>
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
                  <h3>🎉 Correct! +{GAME_CONSTANTS.CONTESTANT_GUESS_POINTS_PER_CORRECT} points</h3>
                </div>
              ) : (
                <div className="incorrect-message">
                  <h3>❌ Incorrect</h3>
                  <p>The correct answer was: {correctAnswer}</p>
                </div>
              )}
            </div>
            <SocialMediaGuessRoundScores
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

export default SocialMediaGuessPlayer;

