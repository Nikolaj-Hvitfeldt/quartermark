import { useState, useEffect } from "react";
import { useQuiz } from "../hooks/useQuiz";
import { QuizHostProps } from "../types";
import signalRService from "../services/signalRService";
import { QuestionDisplay } from "./QuestionDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { StandingsScreen } from "./StandingsScreen";
import { GameRulesCard } from "./GameRulesCard";
import { getQuizQuestions } from "../data/quizQuestions";
import { getQuizRules, getQuestionCountText } from "../data/gameRules";
import { useTranslation } from "react-i18next";
import "./Quiz.css";
import "./QuizHost.css";

function QuizHost({ connection, players, onBack }: QuizHostProps) {
  const { t } = useTranslation();
  const QUIZ_QUESTIONS_2025 = getQuizQuestions(t);
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
  } = useQuiz(connection);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answerProgress, setAnswerProgress] = useState({ total: 0, received: 0 });
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

    const handleAnswerReceived = (data: { answeredCount: number; totalPlayers: number }) => {
      setAnswerProgress({ total: data.totalPlayers, received: data.answeredCount });
    };

    signalRService.on("QuizAnswerReceived", handleAnswerReceived);

    return () => {
      signalRService.off("QuizAnswerReceived", handleAnswerReceived);
    };
  }, [connection]);

  const handleStartRound = async () => {
    try {
      await startRound();
      setCurrentQuestionIndex(0);
      // Automatically show the first question
      if (QUIZ_QUESTIONS_2025.length > 0) {
        const firstQuestion = QUIZ_QUESTIONS_2025[0];
        await showQuestion(
          firstQuestion.questionText,
          firstQuestion.imageUrl,
          firstQuestion.correctAnswer,
          [...firstQuestion.answers]
        );
        setAnswerProgress({ total: players.filter(p => !p.isHost).length, received: 0 });
      }
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleNextQuestion = async () => {
    setShowStandings(false);
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= QUIZ_QUESTIONS_2025.length) {
      // All questions completed, end the round
      await handleEndRound();
      return;
    }

    try {
      const nextQuestion = QUIZ_QUESTIONS_2025[nextIndex];
      await showQuestion(
        nextQuestion.questionText,
        nextQuestion.imageUrl,
        nextQuestion.correctAnswer,
        [...nextQuestion.answers]
      );
      setCurrentQuestionIndex(nextIndex);
      setAnswerProgress({ total: players.filter(p => !p.isHost).length, received: 0 });
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
    const quizRules = getQuizRules(t);
    const questionCount = getQuestionCountText(QUIZ_QUESTIONS_2025.length, t);
    return (
      <div className="quiz-host">
        <GameRulesCard
          title={quizRules.title}
          subtitle={quizRules.subtitle}
          rules={quizRules.rules}
          pointsInfo={`${questionCount} • ${quizRules.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={quizRules.startButtonText}
        />
      </div>
    );
  }

  if (currentQuestion) {
    const allAnswered = answerProgress.received === answerProgress.total && answerProgress.total > 0;
    const isLastQuestion = currentQuestionIndex + 1 >= QUIZ_QUESTIONS_2025.length;

    // Show standings screen after 3 second delay when answer is revealed
    if (answerRevealed && showStandings) {
      return (
        <div className="quiz-host">
          <StandingsScreen
            players={players}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={QUIZ_QUESTIONS_2025.length}
            onNextQuestion={handleNextQuestion}
            isLastQuestion={isLastQuestion}
          />
        </div>
      );
    }

    // Show answer grid while waiting for auto-navigation
    if (answerRevealed && !showStandings) {
      return (
        <div className="quiz-host">
          <button className="btn btn-back" onClick={onBack}>
            ← {t('common.back')}
          </button>
          <div className="quiz-question-container">
            <div className="question-progress-header">
              <h2>{t('common.questionProgress', { current: currentQuestionIndex + 1, total: QUIZ_QUESTIONS_2025.length })}</h2>
            </div>
            <QuestionDisplay
              questionText={currentQuestion.questionText}
              imageUrl={currentQuestion.imageUrl}
            />
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
      <div className="quiz-host">
        <button className="btn btn-back" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <div className="quiz-question-container">
          <div className="question-progress-header">
            <h2>{t('common.questionProgress', { current: currentQuestionIndex + 1, total: QUIZ_QUESTIONS_2025.length })}</h2>
          </div>
          <QuestionDisplay
            questionText={currentQuestion.questionText}
            imageUrl={currentQuestion.imageUrl}
          />

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
            {allAnswered ? t('common.revealAnswer') : t('common.waitingForAnswers', { count: answerProgress.total - answerProgress.received })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-host">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>
      <h2>Quiz of 2025</h2>
      <p>Starting quiz...</p>
    </div>
  );
}

export default QuizHost;

