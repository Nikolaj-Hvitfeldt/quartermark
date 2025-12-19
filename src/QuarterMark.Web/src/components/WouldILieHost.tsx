import { useState } from "react";
import { useWouldILie } from "../hooks/useWouldILie";
import { WouldILieHostProps } from "../types";
import "./WouldILieHost.css";

function WouldILieHost({ connection, players, onBack }: WouldILieHostProps) {
  const {
    roundActive,
    currentQuestion,
    claims,
    voteProgress,
    roundScores,
    answerRevealed,
    startRound,
    showQuestion,
    startVoting,
    revealAnswer,
    endRound,
  } = useWouldILie(connection);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [truthTeller, setTruthTeller] = useState<string>("");
  const [selectedLiars, setSelectedLiars] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(0);

  const nonHostPlayers = players.filter((p) => !p.isHost).map((p) => p.name);

  const handleStartRound = async () => {
    try {
      await startRound();
      setQuestionNumber(0);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const handleShowQuestion = async () => {
    if (!imageUrl || !truthTeller || selectedLiars.length === 0) {
      alert(
        "Please enter image URL, select truth teller, and at least one liar"
      );
      return;
    }

    try {
      await showQuestion(imageUrl, truthTeller, selectedLiars);
      setQuestionNumber((prev) => prev + 1);
      setImageUrl("");
      setTruthTeller("");
      setSelectedLiars([]);
    } catch (error) {
      console.error("Error showing question:", error);
    }
  };

  const handleStartVoting = async () => {
    try {
      await startVoting();
    } catch (error) {
      console.error("Error starting voting:", error);
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

  const toggleLiar = (playerName: string) => {
    if (playerName === truthTeller) return; // Can't select truth teller as liar
    setSelectedLiars((prev) =>
      prev.includes(playerName)
        ? prev.filter((p) => p !== playerName)
        : [...prev, playerName]
    );
  };

  if (!roundActive) {
    return (
      <div className="would-i-lie-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back to Lobby
        </button>
        <div className="round-setup">
          <h2>Would I Lie to You? - Round Setup</h2>
          <p>
            Start a round where you'll show images and assign which players will
            lie.
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
      <div className="would-i-lie-host">
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
              <label>Who actually knows this person? (Truth Teller):</label>
              <select
                value={truthTeller}
                onChange={(e) => setTruthTeller(e.target.value)}
                className="input"
              >
                <option value="">Select truth teller...</option>
                {nonHostPlayers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Who will lie? (Select one or more):</label>
              <div className="player-checkboxes">
                {nonHostPlayers
                  .filter((name) => name !== truthTeller)
                  .map((name) => (
                    <label key={name} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedLiars.includes(name)}
                        onChange={() => toggleLiar(name)}
                      />
                      {name}
                    </label>
                  ))}
              </div>
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={handleShowQuestion}
              disabled={!imageUrl || !truthTeller || selectedLiars.length === 0}
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
    <div className="would-i-lie-host">
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

        {claims.length === 0 ? (
          <div className="waiting-claims">
            <p>Waiting for assigned players to submit their stories...</p>
            <p>Assigned: {currentQuestion.assignedPlayers.join(", ")}</p>
          </div>
        ) : (
          <>
            <div className="claims-display">
              <h3>Claims Submitted:</h3>
              {claims.map((claim, index) => (
                <div key={index} className="claim-card">
                  <h4>{claim.playerName}</h4>
                  <p>{claim.story}</p>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={handleStartVoting}
            >
              Start Voting
            </button>
          </>
        )}

        {voteProgress.received > 0 && (
          <div className="voting-progress">
            <p>
              Votes: {voteProgress.received}/{voteProgress.total}
            </p>
            <button
              className="btn btn-primary btn-large"
              onClick={handleReveal}
            >
              Reveal Answer
            </button>
          </div>
        )}

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
          <button
            className="btn btn-secondary btn-large"
            onClick={() => {
              // This will be handled by showing a new question
              // The state will reset when a new question is shown
            }}
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}

export default WouldILieHost;

