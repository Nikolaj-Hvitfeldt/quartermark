import { useState, useEffect } from "react";
import { useSocialMediaGuess } from "../hooks/useSocialMediaGuess";
import { SocialMediaGuessHostProps } from "../types";
import signalRService from "../services/signalRService";
import { ImageDisplay } from "./ImageDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { SocialMediaGuessRoundScores } from "./SocialMediaGuessRoundScores";
import { GameRulesCard } from "./GameRulesCard";
import { SOCIAL_MEDIA_GUESS_QUESTIONS } from "../data/socialMediaGuessQuestions";
import { SOCIAL_MEDIA_RULES, getQuestionCountText } from "../data/gameRules";
import "./SocialMediaGuess.css";
import "./SocialMediaGuessHost.css";

function SocialMediaGuessHost({ connection, players, onBack }: SocialMediaGuessHostProps) {
  const {
    roundActive,
    currentQuestion,
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer: revealedCorrectAnswer,
    startRound,
    showQuestion,
    revealAnswer,
    endRound,
  } = useSocialMediaGuess(connection);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [guessProgress, setGuessProgress] = useState({ total: 0, received: 0 });

  useEffect(() => {
    if (!connection) return;

    const handleGuessReceived = (data: { totalGuesses: number; totalPlayers: number }) => {
      setGuessProgress({ total: data.totalPlayers, received: data.totalGuesses });
    };

    signalRService.on("SocialMediaGuessReceived", handleGuessReceived);

    return () => {
      signalRService.off("SocialMediaGuessReceived", handleGuessReceived);
    };
  }, [connection]);

  const handleStartRound = async () => {
    try {
      await startRound();
      setCurrentQuestionIndex(0);
      if (SOCIAL_MEDIA_GUESS_QUESTIONS.length > 0) {
        const firstQuestion = SOCIAL_MEDIA_GUESS_QUESTIONS[0];
        await showQuestion(
          firstQuestion.imageUrl,
          firstQuestion.correctAnswer,
          [...firstQuestion.answers]
        );
        setGuessProgress({ total: players.filter(p => !p.isHost).length, received: 0 });
      }
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= SOCIAL_MEDIA_GUESS_QUESTIONS.length) {
      await handleEndRound();
      return;
    }

    try {
      const nextQuestion = SOCIAL_MEDIA_GUESS_QUESTIONS[nextIndex];
      await showQuestion(
        nextQuestion.imageUrl,
        nextQuestion.correctAnswer,
        [...nextQuestion.answers]
      );
      setCurrentQuestionIndex(nextIndex);
      setGuessProgress({ total: players.filter(p => !p.isHost).length, received: 0 });
    } catch (error) {
      console.error("Error showing next question:", error);
    }
  };

  const handleRevealAnswer = async () => {
    try {
      await revealAnswer();
    } catch (error) {
      console.error("Error revealing answer:", error);
    }
  };

  const handleEndRound = async () => {
    try {
      await endRound();
    } catch (error) {
      console.error("Error ending round:", error);
    }
  };

  if (!roundActive) {
    const questionCount = getQuestionCountText(SOCIAL_MEDIA_GUESS_QUESTIONS.length);
    return (
      <div className="social-media-guess-host">
        <GameRulesCard
          title={SOCIAL_MEDIA_RULES.title}
          subtitle={SOCIAL_MEDIA_RULES.subtitle}
          rules={SOCIAL_MEDIA_RULES.rules}
          pointsInfo={`${questionCount} • ${SOCIAL_MEDIA_RULES.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={SOCIAL_MEDIA_RULES.startButtonText}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="social-media-guess-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Social Media Guess</h2>
        <p>Round active, but no question currently displayed. This should not happen.</p>
        <button className="btn btn-secondary" onClick={handleEndRound}>
          End Round
        </button>
      </div>
    );
  }

  const allGuessed = guessProgress.received === guessProgress.total && guessProgress.total > 0;
  const isLastQuestion = currentQuestionIndex + 1 >= SOCIAL_MEDIA_GUESS_QUESTIONS.length;

  return (
    <div className="social-media-guess-host">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>
      <h3 className="question-progress-header">Question {currentQuestionIndex + 1} of {SOCIAL_MEDIA_GUESS_QUESTIONS.length}</h3>
      <div className="social-media-guess-question-container">
        <ImageDisplay imageUrl={currentQuestion.imageUrl} title="Who posted this?" />

        {!answerRevealed ? (
          <>
            <div className="guess-progress">
              <p>
                Guesses received: {guessProgress.received} / {guessProgress.total}
              </p>
            </div>
            <AnswerGrid answers={currentQuestion.possibleAnswers} />
              <button
                className="btn btn-primary"
                onClick={handleRevealAnswer}
                disabled={!allGuessed}
              >
                {allGuessed ? "Reveal Answer" : `Waiting for ${guessProgress.total - guessProgress.received} more guess(es)`}
              </button>
          </>
        ) : (
          <>
            <AnswerGrid
              answers={currentQuestion.possibleAnswers}
              correctAnswer={revealedCorrectAnswer}
              guesses={guesses}
              revealed={true}
            />
            <SocialMediaGuessRoundScores
              roundScores={roundScores}
              players={players}
            />
            <button className="btn btn-primary" onClick={handleNextQuestion}>
              {isLastQuestion ? "End Round" : "Next Question →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SocialMediaGuessHost;

