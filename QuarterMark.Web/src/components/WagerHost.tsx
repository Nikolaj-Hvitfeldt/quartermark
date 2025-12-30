import { useState, useEffect } from "react";
import { useWager } from "../hooks/useWager";
import { WagerHostProps } from "../types";
import signalRService from "../services/signalRService";
import { QuestionDisplay } from "./QuestionDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { GameRulesCard } from "./GameRulesCard";
import { WagerRoundScores } from "./WagerRoundScores";
import { getWagerQuestions } from "../data/wagerQuestions";
import { getWagerRules, getQuestionCountText } from "../data/gameRules";
import { useTranslation } from "react-i18next";
import { getNonHostPlayerCount } from "../utils/wagerUtils";
import "./Wager.css";
import "./WagerHost.css";

function WagerHost({ connection, players, onBack }: WagerHostProps) {
  const { t } = useTranslation();
  const WAGER_QUESTIONS = getWagerQuestions(t);
  const {
    roundActive,
    roundState,
    currentQuestion,
    wagers,
    guesses,
    roundScores,
    answerRevealed,
    correctAnswer: revealedCorrectAnswer,
    startRound,
    showQuestion,
    revealAnswer,
    endRound,
  } = useWager(connection);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [wagerProgress, setWagerProgress] = useState({ total: 0, received: 0 });
  const [answerProgress, setAnswerProgress] = useState({ total: 0, received: 0 });

  useEffect(() => {
    if (!connection) return;

    const handleWagerReceived = (data: { totalWagers: number; totalPlayers: number; allWagersReceived?: boolean }) => {
      setWagerProgress({ total: data.totalPlayers, received: data.totalWagers });
      // If backend confirms all wagers received, ensure UI reflects it
      if (data.allWagersReceived && data.totalWagers >= data.totalPlayers) {
        setWagerProgress({ total: data.totalPlayers, received: data.totalPlayers });
      }
    };

    const handleAnswerReceived = (data: { totalAnswers: number; totalPlayers: number }) => {
      setAnswerProgress({ total: data.totalPlayers, received: data.totalAnswers });
    };

    const handleWagersReset = () => {
      setWagerProgress(prev => ({ ...prev, received: 0 }));
    };

    signalRService.on("WagerReceived", handleWagerReceived);
    signalRService.on("WagerAnswerReceived", handleAnswerReceived);
    signalRService.on("WagersReset", handleWagersReset);

    return () => {
      signalRService.off("WagerReceived", handleWagerReceived);
      signalRService.off("WagerAnswerReceived", handleAnswerReceived);
      signalRService.off("WagersReset", handleWagersReset);
    };
  }, [connection]);

  const handleStartRound = async () => {
    try {
      await startRound();
      setCurrentQuestionIndex(0);
      if (WAGER_QUESTIONS.length > 0) {
        const firstQuestion = WAGER_QUESTIONS[0];
        await showQuestion(
          firstQuestion.questionText,
          firstQuestion.correctAnswer,
          [...firstQuestion.answers]
        );
        const nonHostCount = getNonHostPlayerCount(players);
        setWagerProgress({ total: nonHostCount, received: 0 });
        setAnswerProgress({ total: nonHostCount, received: 0 });
      }
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= WAGER_QUESTIONS.length) {
      await handleEndRound();
      return;
    }

    try {
      const nextQuestion = WAGER_QUESTIONS[nextIndex];
      await showQuestion(
        nextQuestion.questionText,
        nextQuestion.correctAnswer,
        [...nextQuestion.answers]
      );
      setCurrentQuestionIndex(nextIndex);
      const nonHostCount = getNonHostPlayerCount(players);
      setWagerProgress({ total: nonHostCount, received: 0 });
      setAnswerProgress({ total: nonHostCount, received: 0 });
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
    const wagerRules = getWagerRules(t);
    const questionCount = getQuestionCountText(WAGER_QUESTIONS.length, t);
    return (
      <div className="wager-host">
        <GameRulesCard
          title={wagerRules.title}
          subtitle={wagerRules.subtitle}
          rules={wagerRules.rules}
          pointsInfo={`${questionCount} • ${wagerRules.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={wagerRules.startButtonText}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="wager-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
        <h2>Wager Game</h2>
        <p>Round active, but no question currently displayed. This should not happen.</p>
        <button className="btn btn-secondary" onClick={handleEndRound}>
          End Round
        </button>
      </div>
    );
  }

  const allWagered = wagerProgress.received === wagerProgress.total && wagerProgress.total > 0;
  const allAnswered = answerProgress.received === answerProgress.total && answerProgress.total > 0 && allWagered;
  const isLastQuestion = currentQuestionIndex + 1 >= WAGER_QUESTIONS.length;
  const isWageringPhase = roundState === 'Wagering' && !allWagered;
  const isAnsweringPhase = roundState === 'Answering' || (roundState === 'Wagering' && allWagered);

  return (
    <div className="wager-host">
      <button className="btn btn-back" onClick={onBack}>
        ← {t('common.back')}
      </button>
      <div className="wager-question-container">
        <div className="question-progress-header">
          <h2>{t('common.Question')} {currentQuestionIndex + 1} {t('common.of')} {WAGER_QUESTIONS.length}</h2>
        </div>

        {/* Blind wagering phase - question hidden */}
        {isWageringPhase && !answerRevealed && (
          <div className="blind-wager-phase">
            <div className="blind-wager-host-header">
              <h3>{t('wager.host.blindWageringPhase')}</h3>
              <p>{t('wager.host.playersPlacingBets')}</p>
            </div>
            <div className="wager-progress">
              <p>
                {t('wager.host.wagersReceived', { received: wagerProgress.received, total: wagerProgress.total })}
              </p>
              <p className="wager-hint">{t('wager.host.waitingForAll')}</p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={async () => {
                try {
                  await signalRService.invoke("ResetWagers");
                  setWagerProgress({ total: wagerProgress.total, received: 0 });
                } catch (error) {
                  console.error("Error resetting wagers:", error);
                }
              }}
              style={{ marginTop: '1rem' }}
            >
              {t('wager.blindWager.resetWagers')}
            </button>
          </div>
        )}

        {/* Answering phase - question revealed after all wagers */}
        {isAnsweringPhase && !answerRevealed && (
          <>
            <QuestionDisplay questionText={currentQuestion.questionText} />
            <div className="answer-progress">
              <p>
                Answers received: {answerProgress.received} / {answerProgress.total}
              </p>
            </div>
            <AnswerGrid answers={currentQuestion.possibleAnswers} />
            <button
              className="btn btn-primary"
              onClick={handleRevealAnswer}
              disabled={!allAnswered}
            >
              {allAnswered ? "Reveal Answer" : `Waiting for ${answerProgress.total - answerProgress.received} more answer(s)`}
            </button>
          </>
        )}

        {answerRevealed && (
          <>
            <QuestionDisplay questionText={currentQuestion.questionText} />
            <AnswerGrid
              answers={currentQuestion.possibleAnswers}
              correctAnswer={revealedCorrectAnswer}
              guesses={guesses}
              revealed={true}
            />
            <WagerRoundScores
              roundScores={roundScores}
              players={players}
              wagers={wagers}
              guesses={guesses}
              correctAnswer={revealedCorrectAnswer}
            />
            <button className="btn btn-primary" onClick={handleNextQuestion}>
              {isLastQuestion ? t('wager.host.endRound') : t('wager.host.nextQuestion')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default WagerHost;

