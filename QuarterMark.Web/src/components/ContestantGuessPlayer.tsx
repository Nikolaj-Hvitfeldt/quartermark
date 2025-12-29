import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import signalRService from '../services/signalRService';
import { useContestantGuessStore } from '../stores/contestantGuessStore';
import { GAME_CONSTANTS } from '../utils/gameUtils';
import { ContestantGuessPlayerProps, ContestantGuessQuestionShownData, ContestantGuessAnswerRevealedData } from '../types';
import './ContestantGuessPlayer.css';

function ContestantGuessPlayer({ connection, playerName, onBack }: ContestantGuessPlayerProps) {
  const {
    roundState,
    imageUrl,
    possibleAnswers,
    hasGuessed,
    isRevealed,
    correctAnswer,
    guesses,
    roundScores,
    setRoundState,
    setImageUrl,
    setPossibleAnswers,
    setHasGuessed,
    setIsRevealed,
    setCorrectAnswer,
    setGuesses,
    setRoundScores,
  } = useContestantGuessStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setRoundState('Waiting');
      setImageUrl('');
      setPossibleAnswers([]);
      setHasGuessed(false);
      setIsRevealed(false);
      setRoundScores({});
    };

    const handleQuestionShown = (data: ContestantGuessQuestionShownData) => {
      setRoundState('ShowingImage');
      setImageUrl(data.imageUrl);
      setPossibleAnswers(data.possibleAnswers);
      setHasGuessed(false);
      setIsRevealed(false);
    };

    const handleAnswerRevealed = (data: ContestantGuessAnswerRevealedData) => {
      setCorrectAnswer(data.correctAnswer);
      setGuesses(data.guesses);
      setIsRevealed(true);
      setRoundState('Revealed');
      setRoundScores(data.roundScores || {});
    };

    const handleRoundEnded = () => {
      setRoundState('Waiting');
      setRoundScores({});
      // After a short delay, go back to show completion screen
      setTimeout(() => {
        onBack();
      }, GAME_CONSTANTS.PLAYER_ROUND_END_DELAY_CONTESTANT_GUESS);
    };

    signalRService.on('ContestantGuessRoundStarted', handleRoundStarted);
    signalRService.on('ContestantGuessQuestionShown', handleQuestionShown);
    signalRService.on('ContestantGuessAnswerRevealed', handleAnswerRevealed);
    signalRService.on('ContestantGuessRoundEnded', handleRoundEnded);

    return () => {
      signalRService.off('ContestantGuessRoundStarted', handleRoundStarted);
      signalRService.off('ContestantGuessQuestionShown', handleQuestionShown);
      signalRService.off('ContestantGuessAnswerRevealed', handleAnswerRevealed);
      signalRService.off('ContestantGuessRoundEnded', handleRoundEnded);
    };
  }, [
    connection,
    playerName,
    setRoundState,
    setImageUrl,
    setPossibleAnswers,
    setHasGuessed,
    setIsRevealed,
    setCorrectAnswer,
    setGuesses,
    setRoundScores,
  ]);

  const submitGuessMutation = useMutation({
    mutationFn: async (guessedContestantName: string) => {
      await signalRService.invoke('SubmitContestantGuess', guessedContestantName);
    },
    onSuccess: () => {
      setHasGuessed(true);
    },
  });

  const handleGuess = async (guessedContestantName: string) => {
    submitGuessMutation.mutate(guessedContestantName);
  };

  return (
    <div className="contestant-guess-player">
      <button className="btn btn-back" onClick={onBack}>
        ← Back to Lobby
      </button>

      {roundState === 'Waiting' && (
        <div className="waiting-screen">
          <h2>Waiting for host to start the round...</h2>
        </div>
      )}

      {roundState === 'ShowingImage' && (
        <div className="round-screen">
          <h2>Which contestant is in this picture?</h2>
          {imageUrl && (
            <div className="person-image">
              <img src={imageUrl} alt="Contestant with Celebrity" />
            </div>
          )}
          {!hasGuessed ? (
            <div className="guessing-section">
              <h3>Make your guess:</h3>
              <div className="guess-options">
                {possibleAnswers.map((answer, index) => (
                  <button
                    key={index}
                    className="btn btn-vote btn-large"
                    onClick={() => handleGuess(answer)}
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="waiting-message">
              <p>You've submitted your guess! Waiting for other players...</p>
            </div>
          )}
        </div>
      )}

      {roundState === 'Revealed' && (
        <div className="round-screen">
          <h2>Answer Revealed!</h2>
          <div className="reveal-section">
            <p className="correct-answer">
              The correct answer is: <strong>{correctAnswer}</strong>
            </p>
            <p className={`result ${guesses[playerName] === correctAnswer ? 'correct' : 'incorrect'}`}>
              {guesses[playerName] === correctAnswer 
                ? '🎉 You guessed correctly!' 
                : `❌ You guessed: ${guesses[playerName] || 'No guess'}`}
            </p>
            <div className="guesses-summary">
              <h3>All Guesses:</h3>
              {Object.entries(guesses).map(([player, guessedAnswer]) => (
                <div key={player} className={`guess-item ${guessedAnswer === correctAnswer ? 'correct' : 'incorrect'}`}>
                  {player}: {guessedAnswer} {guessedAnswer === correctAnswer ? '✓' : '✗'}
                </div>
              ))}
            </div>
            {Object.keys(roundScores).length > 0 && (
              <div className="round-scores">
                <h3>Round Scores:</h3>
                {Object.entries(roundScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score]) => (
                    <div key={name} className="score-item">
                      {name}: {score} pts
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContestantGuessPlayer;

