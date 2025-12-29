import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWouldILie } from "../hooks/useWouldILie";
import { useGameRoom } from "../hooks/useGameRoom";
import signalRService from "../services/signalRService";
import { WouldILieHostProps } from "../types";
import "./WouldILieHost.css";

function WouldILieHost({
  connection,
  players: initialPlayers,
  onBack,
}: WouldILieHostProps) {
  const {
    roundActive,
    currentQuestion,
    claims,
    voteProgress,
    roundScores,
    answerRevealed,
    setAnswerRevealed,
    setCurrentQuestion,
    setRoundActive,
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
  const [roundEnded, setRoundEnded] = useState<boolean>(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const nonHostPlayers = players.filter((p) => !p.isHost).map((p) => p.name);

  const submitDummyVoteMutation = useMutation({
    mutationFn: async ({
      playerName,
      votedFor,
    }: {
      playerName: string;
      votedFor: string;
    }) => {
      await signalRService.invoke(
        "SubmitDummyPlayerVote",
        playerName,
        votedFor
      );
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

  // Fetch preview image when setup screen appears
  useEffect(() => {
    if (
      roundActive &&
      !currentQuestion &&
      !previewImageUrl &&
      !isLoadingImage
    ) {
      const fetchPreviewImage = async () => {
        setIsLoadingImage(true);
        try {
          const image = (await signalRService.invoke("GetRandomImage")) as
            | string
            | null;
          if (!image) {
            // No more images available - end the round and show final score screen
            await endRound();
            setRoundEnded(true);
          } else {
            setPreviewImageUrl(image);
          }
        } catch (error) {
          console.error("Error fetching preview image:", error);
        } finally {
          setIsLoadingImage(false);
        }
      };
      fetchPreviewImage();
    }
  }, [roundActive, currentQuestion, previewImageUrl, isLoadingImage, endRound]);

  const handleShowQuestion = async () => {
    if (!truthTeller || !selectedLiar) {
      alert("Please select truth teller and one liar");
      return;
    }

    if (!previewImageUrl) {
      alert("No image available. Please try again.");
      return;
    }

    try {
      await showQuestion(previewImageUrl, truthTeller, [selectedLiar]);
      setQuestionNumber((prev) => prev + 1);
      setTruthTeller("");
      setSelectedLiar("");
      setPreviewImageUrl(null); // Clear preview for next question
    } catch (error) {
      console.error("Error showing question:", error);
      alert("Failed to show question. Please try again.");
    }
  };

  const handleStartVoting = async () => {
    try {
      await startVoting();
    } catch (error) {
      console.error("Error starting voting:", error);
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
        setRoundEnded(true);
      } catch (error) {
        console.error("Error ending round:", error);
      }
    }
  };

  const handleContinueToNextGame = () => {
    // Placeholder for future game selection
    alert("Next game feature coming soon!");
  };

  const handleEndGame = () => {
    setRoundEnded(false);
    setRoundActive(false);
    setCurrentQuestion(null);
    setAnswerRevealed(false);
    onBack();
  };

  // Show final score screen when round ends (no more images)
  if (roundEnded) {
    return (
      <div className="would-i-lie-host">
        <div className="score-screen final-score-screen">
          <h2>Final Standings</h2>
          <p className="round-complete-message">Round complete - SKÅL!</p>
          <div className="standings-list">
            {players
              .filter((p) => !p.isHost)
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div key={player.name} className="standing-item">
                  <span className="standing-rank">#{index + 1}</span>
                  <span className="standing-name">{player.name}</span>
                  <span className="standing-score">{player.score} pts</span>
                </div>
              ))}
          </div>
          <div className="final-score-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={handleContinueToNextGame}
            >
              Continue to Next Game
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={handleEndGame}
            >
              End Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!roundActive) {
    return (
      <div className="would-i-lie-host">
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
        <div className="round-controls">
          <h2>Question {questionNumber + 1}</h2>

          {/* Preview image for host */}
          {isLoadingImage && (
            <div className="image-preview">
              <p>Loading image...</p>
            </div>
          )}
          {previewImageUrl && !isLoadingImage && (
            <div className="image-preview">
              <img src={previewImageUrl} alt="Preview" />
              <p className="preview-note">
                Preview: Assign roles based on this image
              </p>
            </div>
          )}

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
              disabled={
                !truthTeller ||
                !selectedLiar ||
                isLoadingImage ||
                !previewImageUrl
              }
            >
              {isLoadingImage ? "Loading image..." : "Show Question to Players"}
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
        <div className="score-screen">
          <h2>Current Standings</h2>
          <div className="standings-list">
            {players
              .filter((p) => !p.isHost)
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
      <div className="question-display">
        <h2>Question {questionNumber}</h2>
        {currentQuestion.imageUrl && (
          <div className="image-preview">
            <img src={currentQuestion.imageUrl} alt="Question" />
            {currentQuestion.truthTellerName && (
              <div className="truth-teller-info">
                <p className="truth-teller-label">Truth Teller:</p>
                <p className="truth-teller-name">
                  {currentQuestion.truthTellerName}
                </p>
              </div>
            )}
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
                    {players
                      .filter(
                        (p) =>
                          !p.isHost &&
                          p.isDummy &&
                          !currentQuestion.assignedPlayers.includes(p.name) &&
                          !claims.some((c) => c.playerName === p.name)
                      )
                      .map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                  <select
                    value={dummyVoteFor}
                    onChange={(e) => setDummyVoteFor(e.target.value)}
                    className="input"
                  >
                    <option value="">Select who to vote for...</option>
                    {claims.map((claim) => (
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
