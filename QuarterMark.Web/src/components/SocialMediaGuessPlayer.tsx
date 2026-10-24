import { useTranslation } from 'react-i18next';
import { useSocialMediaGuess } from '../hooks/useSocialMediaGuess';
import { useSocialMediaGuessStore } from '../stores/socialMediaGuessStore';
import { SocialMediaGuessPlayerProps } from '../types';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import { ImageDisplay } from './ImageDisplay';
import { AnswerGrid } from './AnswerGrid';
import { SocialMediaGuessRoundScores } from './SocialMediaGuessRoundScores';
import './SocialMediaGuess.css';
import './SocialMediaGuessPlayer.css';

function SocialMediaGuessPlayer({ connection, playerName, players }: SocialMediaGuessPlayerProps) {
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
  } = useSocialMediaGuess(connection);
  const revealImageUrl = useSocialMediaGuessStore((s) => s.revealImageUrl);

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
          <h2>{t('game.waitingForRound')}</h2>
        </div>
      </div>
    );
  }

  const playerGuess = guesses[playerName];
  const isPlayerCorrect = playerGuess === correctAnswer;

  return (
    <div className="social-media-guess-player">
      <div className="social-media-guess-question-container">
        <h2>{t('game.whoPostedThis')}</h2>
        <ImageDisplay imageUrl={answerRevealed && revealImageUrl ? revealImageUrl : currentQuestion.imageUrl} />

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

