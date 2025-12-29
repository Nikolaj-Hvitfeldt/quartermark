import React from "react";
import { PlayerDto } from "../types";
import { getGameName, sortPlayersByScore, GAME_CONSTANTS } from "../utils/gameUtils";
import { Leaderboard } from "./Leaderboard";
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
  const sortedPlayers = sortPlayersByScore(players, accumulatedScores);
  const isLastGame = gameNumber >= totalGames;

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
              <h3>🏆 Final Results 🏆</h3>
              <button className="btn btn-primary btn-large" onClick={onEndGame}>
                Return to Main Menu
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCompletionScreen;

