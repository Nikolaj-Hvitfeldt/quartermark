import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        <h2>🎉 {t('gameCompletion.title', { gameName: getGameName(gameType, t) })} 🎉</h2>
        <p className="game-progress">
          {t('hostScreen.gameProgress', { current: gameNumber, total: totalGames })}
        </p>

        <div className="scores-section">
          <h3>{t('standings.title')}</h3>
          <Leaderboard
            players={sortedPlayers}
            accumulatedScores={accumulatedScores}
          />
        </div>

        <div className="completion-actions">
          {!isLastGame ? (
            <>
              <button className="btn btn-primary btn-large" onClick={onContinue}>
                {t('gameCompletion.continueToNext', 'Continue to Next Game')} →
              </button>
              <button className="btn btn-secondary" onClick={onEndGame}>
                {t('gameCompletion.endGameSession', 'End Game Session')}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-large view-final-btn" onClick={() => setShowFinalResults(true)}>
                🏆 {t('gameCompletion.viewFinalResults')} 🏆
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameCompletionScreen;

