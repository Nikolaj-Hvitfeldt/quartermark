import React, { useState } from "react";
import { PlayerDto } from "../types";
import { getGameName, sortPlayersByScore } from "../utils/gameUtils";
import { Leaderboard } from "./Leaderboard";
import { FinalResultsScreen } from "./FinalResultsScreen";
import "./GameCompletionScreen.css";

interface GameCompletionScreenProps {
  gameType: string;
  gameNumber: number;
  totalGames: number;
  players: PlayerDto[];
  accumulatedScores: Record<string, number>;
  onContinue: () => void;
  onEndGame: () => void;
}

function GameCompletionScreen({
  gameType,
  gameNumber,
  totalGames,
  players,
  accumulatedScores,
  onContinue,
  onEndGame,
}: GameCompletionScreenProps) {
  const [showFinalResults, setShowFinalResults] = useState(false);
  const sortedPlayers = sortPlayersByScore(players, accumulatedScores);
  const isLastGame = gameNumber >= totalGames;

  // Show the final results podium screen
  if (showFinalResults) {
    return (
      <FinalResultsScreen
        players={players}
        accumulatedScores={accumulatedScores}
        onClose={onEndGame}
        isHost={true}
      />
    );
  }

  return (
    <div className="game-completion-screen">
      <div className="completion-content">
        <h2>🎉 {getGameName(gameType)} Complete! 🎉</h2>
        <p className="game-progress">
          Game {gameNumber} of {totalGames}
        </p>

        <div className="scores-section">
          <h3>Current Leaderboard</h3>
          <Leaderboard
            players={sortedPlayers}
            accumulatedScores={accumulatedScores}
          />
        </div>

        <div className="completion-actions">
          {!isLastGame ? (
            <>
              <button className="btn btn-primary btn-large" onClick={onContinue}>
                Continue to Next Game →
              </button>
              <button className="btn btn-secondary" onClick={onEndGame}>
                End Game Session
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-large view-final-btn" onClick={() => setShowFinalResults(true)}>
                🏆 View Final Results 🏆
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCompletionScreen;

