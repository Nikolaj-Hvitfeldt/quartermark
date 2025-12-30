import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWouldILie } from "../hooks/useWouldILie";
import { useGameRoom } from "../hooks/useGameRoom";
import { useGameSession } from "../hooks/useGameSession";
import signalRService from "../services/signalRService";
import { WouldILieHostProps } from "../types";
import { GameRulesCard } from "./GameRulesCard";
import { ImageDisplay } from "./ImageDisplay";
import { WouldILieAnswerGrid } from "./WouldILieAnswerGrid";
import { WouldILieStandings } from "./WouldILieStandings";
import { WOULD_I_LIE_RULES } from "../data/gameRules";
import { WOULD_I_LIE_TITLES, WOULD_I_LIE_MESSAGES } from "../utils/wouldILieUtils";
import "./WouldILie.css";
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
    answerRevealed,
    setAnswerRevealed,
    setCurrentQuestion,
    setRoundActive,
    startRound,
    showQuestion,
    startVoting,
    endRound,
  } = useWouldILie(connection);

  const { players } = useGameRoom();
  const { wouldILieConfig } = useGameSession(connection);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [dummyVotePlayer, setDummyVotePlayer] = useState("");
  const [dummyVoteFor, setDummyVoteFor] = useState("");
  const [roundEnded, setRoundEnded] = useState(false);

  const currentConfig = wouldILieConfig[currentRoundIndex];
  const isLastRound = currentRoundIndex >= wouldILieConfig.length - 1;
  const hasConfig = wouldILieConfig.length > 0;
  const totalRounds = wouldILieConfig.length;

  const submitDummyVoteMutation = useMutation({
    mutationFn: async ({ playerName, votedFor }: { playerName: string; votedFor: string }) => {
      await signalRService.invoke("SubmitDummyPlayerVote", playerName, votedFor);
    },
  });

  const handleStartRound = async () => {
    try {
      await startRound();
      setCurrentRoundIndex(0);
    } catch (error) {
      console.error("Error starting round:", error);
    }
  };

  // Auto-show question when round starts
  useEffect(() => {
    if (roundActive && !currentQuestion && hasConfig && currentConfig) {
      const autoShowQuestion = async () => {
        try {
          await showQuestion(
            currentConfig.imageUrl,
            currentConfig.truthTeller,
            [currentConfig.liar]
          );
        } catch (error) {
          console.error("Error auto-showing question:", error);
        }
      };
      const timer = setTimeout(autoShowQuestion, 500);
      return () => clearTimeout(timer);
    }
  }, [roundActive, currentQuestion, hasConfig, currentConfig, showQuestion]);

  const handleNextQuestion = async () => {
    if (isLastRound) {
      try {
        await endRound();
        setRoundEnded(true);
      } catch (error) {
        console.error("Error ending round:", error);
      }
    } else {
      setCurrentRoundIndex(prev => prev + 1);
      setAnswerRevealed(false);
      setCurrentQuestion(null);
    }
  };

  const handleStartVoting = async () => {
    try {
      await startVoting();
    } catch (error) {
      console.error("Error starting voting:", error);
    }
  };

  const handleBackToMain = () => {
    setRoundEnded(false);
    setRoundActive(false);
    setCurrentQuestion(null);
    setAnswerRevealed(false);
    onBack();
  };

  const handleDummyVoteSubmit = () => {
    if (dummyVotePlayer && dummyVoteFor) {
      submitDummyVoteMutation.mutate({
        playerName: dummyVotePlayer,
        votedFor: dummyVoteFor,
      });
      setDummyVotePlayer("");
      setDummyVoteFor("");
    }
  };

  // Final score screen
  if (roundEnded) {
    return (
      <div className="would-i-lie-host">
        <div className="score-screen final-score-screen">
          <h2>{WOULD_I_LIE_TITLES.FINAL_STANDINGS}</h2>
          <p className="round-complete-message">{WOULD_I_LIE_MESSAGES.ROUND_COMPLETE_SKAAL}</p>
          <WouldILieStandings players={players} title="" />
          <div className="final-score-actions">
            <button className="btn btn-primary btn-large" onClick={handleBackToMain}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-round screen
  if (!roundActive) {
    return (
      <div className="would-i-lie-host">
        <GameRulesCard
          title={WOULD_I_LIE_RULES.title}
          subtitle={WOULD_I_LIE_RULES.subtitle}
          rules={WOULD_I_LIE_RULES.rules}
          pointsInfo={WOULD_I_LIE_RULES.pointsInfo}
          onStart={handleStartRound}
          startButtonText={WOULD_I_LIE_RULES.startButtonText}
        />
        {hasConfig && (
          <div className="config-preview">
            <p>📋 {totalRounds} rounds configured</p>
          </div>
        )}
      </div>
    );
  }

  // Loading question - simple loading state without revealing roles
  if (!currentQuestion) {
    return (
      <div className="would-i-lie-host">
        <div className="round-controls">
          <h2>Question {currentRoundIndex + 1} of {totalRounds}</h2>
          <div className="loading-question">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Standings screen after answer revealed
  if (answerRevealed) {
    return (
      <div className="would-i-lie-host">
        <div className="score-screen">
          <h2>{WOULD_I_LIE_TITLES.CURRENT_STANDINGS}</h2>
          <p className="question-progress">
            Question {currentRoundIndex + 1} of {totalRounds} complete
          </p>
          <WouldILieStandings players={players} title="" />
          <button className="btn btn-primary btn-large" onClick={handleNextQuestion}>
            {isLastRound ? "End Round" : "Next Question →"}
          </button>
        </div>
      </div>
    );
  }

  // Active question screen
  const answerOptions = claims.map(claim => ({
    playerName: claim.playerName,
  }));

  const eligibleDummyPlayers = players.filter(
    p => !p.isHost && p.isDummy && 
    !currentQuestion.assignedPlayers.includes(p.name) &&
    !claims.some(c => c.playerName === p.name)
  );

  return (
    <div className="would-i-lie-host">
      <div className="wil-game-container">
        <h2 className="wil-game-title">{WOULD_I_LIE_TITLES.WHO_KNOWS}</h2>
        
        {currentQuestion.imageUrl && (
          <ImageDisplay imageUrl={currentQuestion.imageUrl} altText="Mystery Person" />
        )}

        <WouldILieAnswerGrid options={answerOptions} />

        <button className="btn btn-primary btn-large" onClick={handleStartVoting}>
          Start Voting
        </button>

        {voteProgress.received > 0 && (
          <div className="wil-voting-progress">
            <p className="wil-vote-count">
              Votes: {voteProgress.received}/{voteProgress.total}
            </p>

            {voteProgress.received < voteProgress.total && eligibleDummyPlayers.length > 0 && (
              <div className="dummy-player-actions">
                <h4>Submit vote for dummy player (testing):</h4>
                <div className="dummy-action-controls">
                  <select
                    value={dummyVotePlayer}
                    onChange={e => setDummyVotePlayer(e.target.value)}
                    className="input"
                  >
                    <option value="">Select dummy player...</option>
                    {eligibleDummyPlayers.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={dummyVoteFor}
                    onChange={e => setDummyVoteFor(e.target.value)}
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
                    onClick={handleDummyVoteSubmit}
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
