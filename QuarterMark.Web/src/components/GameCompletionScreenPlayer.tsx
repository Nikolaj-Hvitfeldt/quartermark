import React from "react";
import { PlayerDto } from "../types";
import { getGameName, sortPlayersByScore, GAME_CONSTANTS } from "../utils/gameUtils";
import { Leaderboard } from "./Leaderboard";
import "./GameCompletionScreen.css";

interface GameCompletionScreenPlayerProps {
  gameType: string;
  gameNumber: number;
  totalGames: number;
  players: PlayerDto[];
  accumulatedScores: Record<string, number>;
  playerName: string;
}

function GameCompletionScreenPlayer({
  gameType,
  gameNumber,
  totalGames,
  players,
  accumulatedScores,
  playerName,
}: GameCompletionScreenPlayerProps) {
  const sortedPlayers = sortPlayersByScore(players, accumulatedScores);
  const playerRank = sortedPlayers.findIndex((p) => p.name === playerName) + 1;
  const playerScore = accumulatedScores[playerName] || 0;
  const isLastGame = gameNumber >= totalGames;

  return (
    <div className="game-completion-screen">
      <div className="completion-content">
        <h2>🎉 {getGameName(gameType)} Complete! 🎉</h2>
        <p className="game-progress">
          Game {gameNumber} of {totalGames}
        </p>

        <div className="player-score-highlight">
          <div className="your-rank">
            <span className="rank-label">Your Rank</span>
            <span className="rank-number">#{playerRank}</span>
          </div>
          <div className="your-score">
            <span className="score-label">Your Score</span>
            <span className="score-number">{playerScore} pts</span>
          </div>
        </div>

        <div className="scores-section">
          <h3>Current Leaderboard</h3>
          <Leaderboard
            players={sortedPlayers}
            accumulatedScores={accumulatedScores}
            highlightPlayerName={playerName}
          />
        </div>

        <div className="completion-message">
          {isLastGame ? (
            <p className="final-message">🏆 Final Results! 🏆</p>
          ) : (
            <p className="waiting-message">
              Waiting for host to continue to next game...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCompletionScreenPlayer;

