import { useState, useEffect } from "react";
import { useQuiz } from "../hooks/useQuiz";
import { QuizHostProps } from "../types";
import signalRService from "../services/signalRService";
import { QuestionDisplay } from "./QuestionDisplay";
import { AnswerGrid } from "./AnswerGrid";
import { QuizRoundScores } from "./QuizRoundScores";
import { GameRulesCard } from "./GameRulesCard";
import { QUIZ_QUESTIONS_2025 } from "../data/quizQuestions";
import { QUIZ_RULES, getQuestionCountText } from "../data/gameRules";
import "./Quiz.css";
import "./QuizHost.css";

function QuizHost({ connection, players, onBack }: QuizHostProps) {
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
    const questionCount = getQuestionCountText(QUIZ_QUESTIONS_2025.length);
    return (
      <div className="quiz-host">
        <GameRulesCard
          title={QUIZ_RULES.title}
          subtitle={QUIZ_RULES.subtitle}
          rules={QUIZ_RULES.rules}
          pointsInfo={`${questionCount} • ${QUIZ_RULES.pointsInfo}`}
          onStart={handleStartRound}
          startButtonText={QUIZ_RULES.startButtonText}
        />
      </div>
    );
  }

  if (currentQuestion) {
    const allAnswered = answerProgress.received === answerProgress.total && answerProgress.total > 0;
    const isLastQuestion = currentQuestionIndex + 1 >= QUIZ_QUESTIONS_2025.length;

    return (
      <div className="quiz-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back
        </button>
        <div className="quiz-question-container">
          <div className="question-progress-header">
            <h2>Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS_2025.length}</h2>
          </div>
          <QuestionDisplay
            questionText={currentQuestion.questionText}
            imageUrl={currentQuestion.imageUrl}
          />

          {!answerRevealed ? (
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
          ) : (
            <>
              <AnswerGrid
                answers={currentQuestion.possibleAnswers}
                correctAnswer={revealedCorrectAnswer}
                guesses={guesses}
                revealed={true}
              />
              <QuizRoundScores
                roundScores={roundScores}
                players={players}
              />
              <button className="btn btn-primary btn-large" onClick={handleNextQuestion}>
                {isLastQuestion ? "End Round" : "Next Question →"}
              </button>
            </>
          )}
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

