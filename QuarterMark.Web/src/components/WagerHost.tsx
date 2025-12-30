import { useState, useEffect } from "react";
import { useWager } from "../hooks/useWager";
import { WagerHostProps } from "../types";
import signalRService from "../services/signalRService";
import { QuestionDisplay } from "./QuestionDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { GameRulesCard } from "./GameRulesCard";
import { WagerRoundScores } from "./WagerRoundScores";
import { WAGER_QUESTIONS } from "../data/wagerQuestions";
import { WAGER_RULES, getQuestionCountText } from "../data/gameRules";
import { getNonHostPlayerCount } from "../utils/wagerUtils";
import "./Wager.css";
import "./WagerHost.css";

function WagerHost({ connection, players, onBack }: WagerHostProps) {
  const {
    roundActive,
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

    const handleWagerReceived = (data: { totalWagers: number; totalPlayers: number }) => {
      setWagerProgress({ total: data.totalPlayers, received: data.totalWagers });
    };

    const handleAnswerReceived = (data: { totalAnswers: number; totalPlayers: number }) => {
      setAnswerProgress({ total: data.totalPlayers, received: data.totalAnswers });
    };

    signalRService.on("WagerReceived", handleWagerReceived);
    signalRService.on("WagerAnswerReceived", handleAnswerReceived);

    return () => {
      signalRService.off("WagerReceived", handleWagerReceived);
      signalRService.off("WagerAnswerReceived", handleAnswerReceived);
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
    const questionCount = getQuestionCountText(WAGER_QUESTIONS.length);
    return (
      <div className="wager-host">
        <GameRulesCard
          title={WAGER_RULES.title}
          subtitle={WAGER_RULES.subtitle}
          rules={WAGER_RULES.rules}
          pointsInfo={`${questionCount} • ${WAGER_RULES.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={WAGER_RULES.startButtonText}
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

  return (
    <div className="wager-host">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>
      <div className="wager-question-container">
        <div className="question-progress-header">
          <h2>Question {currentQuestionIndex + 1} of {WAGER_QUESTIONS.length}</h2>
        </div>
        <QuestionDisplay questionText={currentQuestion.questionText} />

        {!answerRevealed ? (
          <>
            {!allWagered && (
              <div className="wager-progress">
                <p>
                  Wagers received: {wagerProgress.received} / {wagerProgress.total}
                </p>
                <p className="wager-hint">Waiting for all players to place their wagers...</p>
              </div>
            )}
            {allWagered && (
              <>
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
          </>
        ) : (
          <>
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
              {isLastQuestion ? "End Round" : "Next Question →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default WagerHost;

