import { useState, useEffect } from "react";
import { useSocialMediaGuess } from "../hooks/useSocialMediaGuess";
import { SocialMediaGuessHostProps } from "../types";
import signalRService from "../services/signalRService";
import { ImageDisplay } from "./ImageDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { StandingsScreen } from "./StandingsScreen";
import { GameRulesCard } from "./GameRulesCard";
import { useActiveDataset } from "../stores/datasetStore";
import { useSocialMediaGuessStore } from "../stores/socialMediaGuessStore";
import { getSocialMediaRules, getQuestionCountText } from "../data/gameRules";
import { useTranslation } from "react-i18next";
import "./SocialMediaGuess.css";
import "./SocialMediaGuessHost.css";

function SocialMediaGuessHost({ connection, players, onBack }: SocialMediaGuessHostProps) {
  const { t } = useTranslation();
  // Questions from the dataset the host picked in the lobby
  const questions = useActiveDataset().socialMediaGuessQuestions;
  const {
    roundActive,
    currentQuestion,
    guesses,
    roundScores: _roundScores,
    answerRevealed,
    correctAnswer: revealedCorrectAnswer,
    startRound,
    showQuestion,
    revealAnswer,
    endRound,
  } = useSocialMediaGuess(connection);
  const revealImageUrl = useSocialMediaGuessStore((s) => s.revealImageUrl);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [guessProgress, setGuessProgress] = useState({ total: 0, received: 0 });
  const [showStandings, setShowStandings] = useState(false);

  // Auto-navigate to standings after 3 seconds when answer is revealed. Questions with an
  // uncensored reveal image wait for the host instead, so the room can look at it.
  useEffect(() => {
    if (answerRevealed && revealImageUrl) {
      setShowStandings(false);
    } else if (answerRevealed) {
      const timer = setTimeout(() => {
        setShowStandings(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowStandings(false);
    }
  }, [answerRevealed, revealImageUrl]);

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
      if (questions.length > 0) {
        const firstQuestion = questions[0];
        await showQuestion(
          firstQuestion.imageUrl,
          firstQuestion.correctAnswer,
          [...firstQuestion.answers],
          firstQuestion.revealImageUrl
        );
        setGuessProgress({ total: players.filter(p => !p.isHost).length, received: 0 });
      }
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleNextQuestion = async () => {
    setShowStandings(false);
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      await handleEndRound();
      return;
    }

    try {
      const nextQuestion = questions[nextIndex];
      await showQuestion(
        nextQuestion.imageUrl,
        nextQuestion.correctAnswer,
        [...nextQuestion.answers],
        nextQuestion.revealImageUrl
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
    const socialMediaGuessRules = getSocialMediaRules(t);
    const questionCount = getQuestionCountText(questions.length, t);
    return (
      <div className="social-media-guess-host">
        <GameRulesCard
          title={socialMediaGuessRules.title}
          subtitle={socialMediaGuessRules.subtitle}
          rules={socialMediaGuessRules.rules}
          pointsInfo={`${questionCount} • ${socialMediaGuessRules.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={socialMediaGuessRules.startButtonText}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="social-media-guess-host">
        <button className="btn btn-back" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <h2>{t('gameNames.socialMediaGuess')}</h2>
        <p>{t('common.errorMessage')}</p>
        <button className="btn btn-secondary" onClick={handleEndRound}>
          {t('standings.endRound')}
        </button>
      </div>
    );
  }

  const allGuessed = guessProgress.received === guessProgress.total && guessProgress.total > 0;
  const isLastQuestion = currentQuestionIndex + 1 >= questions.length;

  // Show standings screen after 3 second delay when answer is revealed
  if (answerRevealed && showStandings) {
    return (
      <div className="social-media-guess-host">
        <StandingsScreen
          players={players}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onNextQuestion={handleNextQuestion}
          isLastQuestion={isLastQuestion}
        />
      </div>
    );
  }

  // Show answer grid while waiting for auto-navigation
  if (answerRevealed && !showStandings) {
    return (
      <div className="social-media-guess-host">
        <button className="btn btn-back" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <h3 className="question-progress-header">{t('common.questionProgress', { current: currentQuestionIndex + 1, total: questions.length })}</h3>
        <div className="social-media-guess-question-container">
          <ImageDisplay imageUrl={revealImageUrl ?? currentQuestion.imageUrl} altText="Who posted this?" />
          <AnswerGrid
            answers={currentQuestion.possibleAnswers}
            correctAnswer={revealedCorrectAnswer}
            guesses={guesses}
            revealed={true}
          />
          {revealImageUrl && (
            <button className="btn btn-primary btn-large" onClick={() => setShowStandings(true)}>
              {t('standings.viewStandings')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="social-media-guess-host">
      <button className="btn btn-back" onClick={onBack}>
        ← {t('common.back')}
      </button>
      <h3 className="question-progress-header">{t('common.questionProgress', { current: currentQuestionIndex + 1, total: questions.length })}</h3>
      <div className="social-media-guess-question-container">
        <ImageDisplay imageUrl={currentQuestion.imageUrl} altText="Who posted this?" />

        <div className="guess-progress">
          <p>
            Guesses received: {guessProgress.received} / {guessProgress.total}
          </p>
        </div>
        <AnswerGrid answers={currentQuestion.possibleAnswers} />
        <button
          className="btn btn-primary"
          onClick={handleRevealAnswer}
        >
          {allGuessed ? t('common.revealAnswer') : t('common.revealAnswer') + ` (${guessProgress.received}/${guessProgress.total} answered)`}
        </button>
      </div>
    </div>
  );
}

export default SocialMediaGuessHost;

