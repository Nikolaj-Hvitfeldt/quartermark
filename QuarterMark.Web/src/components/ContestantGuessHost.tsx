import { useState, useEffect } from "react";
import { useContestantGuess } from "../hooks/useContestantGuess";
import { ContestantGuessHostProps } from "../types";
import signalRService from "../services/signalRService";
import { ImageDisplay } from "./ImageDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { StandingsScreen } from "./StandingsScreen";
import { GameRulesCard } from "./GameRulesCard";
import { CONTESTANT_GUESS_QUESTIONS } from "../data/contestantGuessQuestions";
import { CONTESTANT_GUESS_RULES, getQuestionCountText } from "../data/gameRules";
import "./ContestantGuess.css";
import "./ContestantGuessHost.css";

function ContestantGuessHost({ connection, players, onBack }: ContestantGuessHostProps) {
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
  } = useContestantGuess(connection);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [guessProgress, setGuessProgress] = useState({ total: 0, received: 0 });
  const [showStandings, setShowStandings] = useState(false);

  // Auto-navigate to standings after 3 seconds when answer is revealed
  useEffect(() => {
    if (answerRevealed) {
      const timer = setTimeout(() => {
        setShowStandings(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowStandings(false);
    }
  }, [answerRevealed]);

  useEffect(() => {
    if (!connection) return;

    const handleGuessReceived = (data: { totalGuesses: number; totalPlayers: number }) => {
      setGuessProgress({ total: data.totalPlayers, received: data.totalGuesses });
    };

    signalRService.on("ContestantGuessReceived", handleGuessReceived);

    return () => {
      signalRService.off("ContestantGuessReceived", handleGuessReceived);
    };
  }, [connection]);

  const handleStartRound = async () => {
    try {
      await startRound();
      setCurrentQuestionIndex(0);
      // Automatically show the first question
      if (CONTESTANT_GUESS_QUESTIONS.length > 0) {
        const firstQuestion = CONTESTANT_GUESS_QUESTIONS[0];
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
    setShowStandings(false);
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= CONTESTANT_GUESS_QUESTIONS.length) {
      // All questions completed, end the round
      await handleEndRound();
      return;
    }

    try {
      const nextQuestion = CONTESTANT_GUESS_QUESTIONS[nextIndex];
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
    const questionCount = getQuestionCountText(CONTESTANT_GUESS_QUESTIONS.length);
    return (
      <div className="contestant-guess-host">
        <GameRulesCard
          title={CONTESTANT_GUESS_RULES.title}
          subtitle={CONTESTANT_GUESS_RULES.subtitle}
          rules={CONTESTANT_GUESS_RULES.rules}
          pointsInfo={`${questionCount} • ${CONTESTANT_GUESS_RULES.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={CONTESTANT_GUESS_RULES.startButtonText}
        />
      </div>
    );
  }

  if (currentQuestion) {
    const allGuessed = guessProgress.received === guessProgress.total && guessProgress.total > 0;
    const isLastQuestion = currentQuestionIndex + 1 >= CONTESTANT_GUESS_QUESTIONS.length;

    // Show standings screen after 3 second delay when answer is revealed
    if (answerRevealed && showStandings) {
      return (
        <div className="contestant-guess-host">
          <StandingsScreen
            players={players}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={CONTESTANT_GUESS_QUESTIONS.length}
            onNextQuestion={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        </div>
      );
    }

    // Show answer grid while waiting for auto-navigation
    if (answerRevealed && !showStandings) {
      return (
        <div className="contestant-guess-host">
          <button className="btn btn-back" onClick={onBack}>
            ← Back
          </button>
          <h3 className="question-progress-header">Question {currentQuestionIndex + 1} of {CONTESTANT_GUESS_QUESTIONS.length}</h3>
          <div className="contestant-guess-question-container">
            <ImageDisplay imageUrl={currentQuestion.imageUrl} />
            <AnswerGrid
              answers={currentQuestion.possibleAnswers}
              correctAnswer={revealedCorrectAnswer}
              guesses={guesses}
              revealed={true}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="contestant-guess-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
        <h3 className="question-progress-header">Question {currentQuestionIndex + 1} of {CONTESTANT_GUESS_QUESTIONS.length}</h3>
        <div className="contestant-guess-question-container">
          <ImageDisplay imageUrl={currentQuestion.imageUrl} />

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
        </div>
      </div>
    );
  }

  // Fallback if round is active but no current question
  return (
    <div className="contestant-guess-host">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>
      <h2>Contestant Guess</h2>
      <p>Round active, but no question currently displayed. This should not happen.</p>
      <button className="btn btn-secondary" onClick={handleEndRound}>
        End Round
      </button>
    </div>
  );
}

export default ContestantGuessHost;
