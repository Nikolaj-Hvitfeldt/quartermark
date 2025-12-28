import { useState, useEffect } from "react";
import { useContestantGuess } from "../hooks/useContestantGuess";
import { ContestantGuessHostProps } from "../types";
import signalRService from "../services/signalRService";
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

  const [imageUrl, setImageUrl] = useState<string>("");
  const [correctAnswerInput, setCorrectAnswerInput] = useState<string>("");
  const [possibleAnswers, setPossibleAnswers] = useState<string>(""); // Comma-separated list
  const [questionNumber, setQuestionNumber] = useState<number>(0);

  // For tracking guess progress
  const [guessProgress, setGuessProgress] = useState({ total: 0, received: 0 });

  const handleStartRound = async () => {
    try {
      await startRound();
      setQuestionNumber(0);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleShowQuestion = async () => {
    if (!imageUrl || !correctAnswerInput || !possibleAnswers) {
      alert("Please enter image URL, correct answer, and possible answers");
      return;
    }

    const answersList = possibleAnswers.split(',').map(a => a.trim()).filter(a => a.length > 0);
    if (!answersList.includes(correctAnswerInput.trim())) {
      alert("Correct answer must be in the list of possible answers");
      return;
    }

    try {
      await showQuestion(imageUrl, correctAnswerInput.trim(), answersList);
      setQuestionNumber((prev) => prev + 1);
      setImageUrl("");
      setCorrectAnswerInput("");
      setPossibleAnswers("");
      const nonHostPlayers = players.filter((p) => !p.isHost);
      setGuessProgress({ total: nonHostPlayers.length, received: 0 });
    } catch (error) {
      console.error("Error showing question:", error);
    }
  };

  const handleReveal = async () => {
    try {
      await revealAnswer();
    } catch (error) {
      console.error("Error revealing answer:", error);
    }
  };

  const handleEndRound = async () => {
    if (
      window.confirm(
        "End the round? Host will receive points equal to lowest scoring player."
      )
    ) {
      try {
        await endRound();
        setQuestionNumber(0);
      } catch (error) {
        console.error("Error ending round:", error);
      }
    }
  };

  // Listen for guess progress updates
  useEffect(() => {
    const handleGuessReceived = (data: any) => {
      setGuessProgress((prev) => ({
        total: prev.total,
        received: data.totalGuesses,
      }));
    };

    signalRService.on("ContestantGuessReceived", handleGuessReceived);

    return () => {
      signalRService.off("ContestantGuessReceived", handleGuessReceived);
    };
  }, []);

  if (!roundActive) {
    return (
      <div className="contestant-guess-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back to Lobby
        </button>
        <div className="round-setup">
          <h2>Contestant Guess - Round Setup</h2>
          <p>
            Start a round where players guess which contestant is in the picture with a celebrity.
          </p>
          <button
            className="btn btn-primary btn-large"
            onClick={handleStartRound}
          >
            Start Round
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="contestant-guess-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back to Lobby
        </button>
        <div className="round-controls">
          <h2>Question {questionNumber + 1}</h2>
          <div className="setup-form">
            <div className="form-group">
              <label>Image URL:</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Correct Answer (Contestant Name):</label>
              <input
                type="text"
                value={correctAnswerInput}
                onChange={(e) => setCorrectAnswerInput(e.target.value)}
                placeholder="Enter contestant name"
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Possible Answers (comma-separated):</label>
              <input
                type="text"
                value={possibleAnswers}
                onChange={(e) => setPossibleAnswers(e.target.value)}
                placeholder="Contestant1, Contestant2, Contestant3"
                className="input"
              />
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={handleShowQuestion}
              disabled={!imageUrl || !correctAnswerInput || !possibleAnswers}
            >
              Show Question to Players
            </button>
          </div>
          {Object.keys(roundScores).length > 0 && (
            <div className="round-scores">
              <h3>Round Scores (so far)</h3>
              <div className="scores-list">
                {Object.entries(roundScores)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, score]) => (
                    <div key={name} className="score-item">
                      {name}: {score} pts
                    </div>
                  ))}
              </div>
            </div>
          )}
          <button className="btn btn-secondary" onClick={handleEndRound}>
            End Round
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contestant-guess-host">
      <button className="btn btn-back" onClick={onBack}>
        ← Back to Lobby
      </button>

      <div className="question-display">
        <h2>Question {questionNumber}</h2>
        {currentQuestion.imageUrl && (
          <div className="image-preview">
            <img src={currentQuestion.imageUrl} alt="Question" />
          </div>
        )}

        <div className="guessing-progress">
          <p>
            Guesses: {guessProgress.received}/{guessProgress.total}
          </p>
          <button
            className="btn btn-primary btn-large"
            onClick={handleReveal}
          >
            Reveal Answer
          </button>
        </div>

        {Object.keys(roundScores).length > 0 && (
          <div className="round-scores">
            <h3>Round Scores</h3>
            <div className="scores-list">
              {Object.entries(roundScores)
                .sort((a, b) => b[1] - a[1])
                .map(([name, score]) => (
                  <div key={name} className="score-item">
                    {name}: {score} pts
                  </div>
                ))}
            </div>
          </div>
        )}

        {answerRevealed && (
          <div className="answer-reveal">
            <h3>Answer Revealed!</h3>
            <p className="correct-answer">Correct Answer: <strong>{revealedCorrectAnswer}</strong></p>
            <div className="guesses-summary">
              <h4>Guesses:</h4>
              {Object.entries(guesses).map(([playerName, guessedAnswer]) => (
                <div key={playerName} className="guess-item">
                  {playerName}: {guessedAnswer} {guessedAnswer === revealedCorrectAnswer ? "✓" : "✗"}
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => {
                // Reset for next question
                setGuessProgress({ total: 0, received: 0 });
              }}
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestantGuessHost;

