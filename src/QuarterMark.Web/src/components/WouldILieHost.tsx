import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWouldILie } from "../hooks/useWouldILie";
import { useGameRoom } from "../hooks/useGameRoom";
import signalRService from "../services/signalRService";
import { WouldILieHostProps } from "../types";
import "./WouldILieHost.css";

function WouldILieHost({ connection, players: initialPlayers, onBack }: WouldILieHostProps) {
  const {
    roundActive,
    currentQuestion,
    claims,
    voteProgress,
    roundScores,
    answerRevealed,
    setAnswerRevealed,
    setCurrentQuestion,
    startRound,
    showQuestion,
    startVoting,
    revealAnswer,
    endRound,
  } = useWouldILie(connection);

  const { players } = useGameRoom();

  const [truthTeller, setTruthTeller] = useState<string>("");
  const [selectedLiar, setSelectedLiar] = useState<string>("");
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [dummyVotePlayer, setDummyVotePlayer] = useState<string>("");
  const [dummyVoteFor, setDummyVoteFor] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

  const nonHostPlayers = players.filter((p) => !p.isHost).map((p) => p.name);

  const submitDummyVoteMutation = useMutation({
    mutationFn: async ({ playerName, votedFor }: { playerName: string; votedFor: string }) => {
      await signalRService.invoke("SubmitDummyPlayerVote", playerName, votedFor);
    },
  });

  const handleStartRound = async () => {
    try {
      await startRound();
      setQuestionNumber(0);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  const getRandomImageMutation = useMutation({
    mutationFn: async () => {
      const image = await signalRService.invoke<string>("GetRandomImage");
      return image;
    },
  });

  const handleShowQuestion = async () => {
    if (!truthTeller || !selectedLiar) {
      alert(
        "Please select truth teller and one liar"
      );
      return;
    }

    setIsLoadingImage(true);
    try {
      // Automatically get a random image
      const image = await getRandomImageMutation.mutateAsync();
      if (!image) {
        alert("No more images available! All images have been used in this round.");
        setIsLoadingImage(false);
        return;
      }

      await showQuestion(image, truthTeller, [selectedLiar]);
      setQuestionNumber((prev) => prev + 1);
      setTruthTeller("");
      setSelectedLiar("");
    } catch (error) {
      console.error("Error showing question:", error);
      alert("Failed to show question. Please try again.");
    } finally {
      setIsLoadingImage(false);
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
              <label>Who will lie? (Select one):</label>
              <select
                value={selectedLiar}
                onChange={(e) => setSelectedLiar(e.target.value)}
                className="input"
              >
                <option value="">Select liar...</option>
                {nonHostPlayers
                  .filter((name) => name !== truthTeller)
                  .map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={handleShowQuestion}
              disabled={!truthTeller || !selectedLiar || isLoadingImage || getRandomImageMutation.isPending}
            >
              {isLoadingImage || getRandomImageMutation.isPending
                ? "Loading..."
                : "Show Question to Players"}
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

  // Show standings screen when answer is revealed
  if (answerRevealed) {
    return (
      <div className="would-i-lie-host">
        <button className="btn btn-back" onClick={onBack}>
          ← Back to Lobby
        </button>

        <div className="score-screen">
          <h2>Current Standings</h2>
          <div className="standings-list">
            {players
              .filter(p => !p.isHost)
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div key={player.name} className="standing-item">
                  <span className="standing-rank">#{index + 1}</span>
                  <span className="standing-name">{player.name}</span>
                  <span className="standing-score">{player.score} pts</span>
                </div>
              ))}
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={() => {
              // Reset state to allow setting up next question
              setAnswerRevealed(false);
              setCurrentQuestion(null);
            }}
          >
            Next Question
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

        <div className="claims-display">
          <h3>Players who claim to know this person:</h3>
          {claims.map((claim, index) => (
            <div key={index} className="claim-card">
              <h4>{claim.playerName}</h4>
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary btn-large"
          onClick={handleStartVoting}
        >
          Start Voting
        </button>

        {voteProgress.received > 0 && (
          <div className="voting-progress">
            <p>
              Votes: {voteProgress.received}/{voteProgress.total}
            </p>
            
            {/* Dummy player vote submission for testing */}
            {voteProgress.received < voteProgress.total && (
              <div className="dummy-player-actions">
                <h4>Submit vote for dummy player (testing):</h4>
                <div className="dummy-action-controls">
                  <select
                    value={dummyVotePlayer}
                    onChange={(e) => setDummyVotePlayer(e.target.value)}
                    className="input"
                  >
                    <option value="">Select dummy player...</option>
                    {nonHostPlayers
                      .filter(name => 
                        !currentQuestion.assignedPlayers.includes(name) &&
                        !claims.some(c => c.playerName === name)
                      )
                      .map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                  </select>
                  <select
                    value={dummyVoteFor}
                    onChange={(e) => setDummyVoteFor(e.target.value)}
                    className="input"
                  >
                    <option value="">Select who to vote for...</option>
                    {claims.map(claim => (
                      <option key={claim.playerName} value={claim.playerName}>
                        {claim.playerName}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (dummyVotePlayer && dummyVoteFor) {
                        submitDummyVoteMutation.mutate({
                          playerName: dummyVotePlayer,
                          votedFor: dummyVoteFor,
                        });
                        setDummyVotePlayer("");
                        setDummyVoteFor("");
                      }
                    }}
                    disabled={!dummyVotePlayer || !dummyVoteFor}
                  >
                    Submit Vote
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WouldILieHost;

