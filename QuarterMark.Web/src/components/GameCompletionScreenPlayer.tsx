import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PlayerDto } from "../types";
import { getGameName, sortPlayersByScore } from "../utils/gameUtils";
import { FINAL_RESULTS_AUTO_SHOW_DELAY_MS } from "../utils/finalResultsConstants";
import { Leaderboard } from "./Leaderboard";
import { FinalResultsScreen } from "./FinalResultsScreen";
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
  const { t } = useTranslation();
  const [showFinalResults, setShowFinalResults] = useState(false);
  const sortedPlayers = sortPlayersByScore(players, accumulatedScores);
  const playerRank = sortedPlayers.findIndex((p) => p.name === playerName) + 1;
  const playerScore = accumulatedScores[playerName] || 0;
  const isLastGame = gameNumber >= totalGames;

  // Auto-show final results for the last game after a short delay
  useEffect(() => {
    if (isLastGame) {
      const timer = setTimeout(() => {
        setShowFinalResults(true);
      }, FINAL_RESULTS_AUTO_SHOW_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isLastGame]);

  // Show the final results podium screen
  if (showFinalResults) {
    return (
      <FinalResultsScreen
        players={players}
        accumulatedScores={accumulatedScores}
        onClose={() => {}}
        isHost={false}
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
            <>
              <p className="final-message">🏆 {t('standings.finalStandings')}! 🏆</p>
              <button 
                className="btn btn-primary view-final-btn-player" 
                onClick={() => setShowFinalResults(true)}
              >
                {t('gameCompletion.viewPodium')}
              </button>
            </>
          ) : (
            <p className="waiting-message">
              {t('playerScreen.waitingForHost')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCompletionScreenPlayer;

