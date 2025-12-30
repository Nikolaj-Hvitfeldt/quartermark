import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGameRoom } from "../hooks/useGameRoom";
import { useMutation } from "@tanstack/react-query";
import { useGameSession } from "../hooks/useGameSession";
import { useGameCompletion } from "../hooks/useGameCompletion";
import { GAME_CONSTANTS, getNextGameType, shouldShowDrinkingWheel } from "../utils/gameUtils";
import signalRService from "../services/signalRService";
import WouldILieHost from "./WouldILieHost";
import ContestantGuessHost from "./ContestantGuessHost";
import QuizHost from "./QuizHost";
import SocialMediaGuessHost from "./SocialMediaGuessHost";
import WagerHost from "./WagerHost";
import DrinkingWheelHost from "./DrinkingWheelHost";
import GameCompletionScreen from "./GameCompletionScreen";
import { WouldILieConfig } from "./WouldILieConfig";
import { WouldILieRoundConfig } from "../data/wouldILieImages";
import { HostScreenProps } from "../types";
import "./HostScreen.css";

function HostScreen({ onBack }: HostScreenProps) {
  const { t } = useTranslation();
  const { connection, roomCode, players, isConnected, createRoom } =
    useGameRoom();
  const { isActive: sessionActive, currentGameNumber, accumulatedScores, showDrinkingWheel, wouldILieConfig, setShowDrinkingWheel, setWouldILieConfig, startSession } = useGameSession(connection);
  const [showWouldILieConfig, setShowWouldILieConfig] = useState(false);
  const { completedGame, clearCompletedGame } = useGameCompletion({
    connection,
    onGameCompleted: () => {
      setInGame(null);
    },
  });
  const [playerName, setPlayerName] = useState<string>("");
  const [dummyPlayerName, setDummyPlayerName] = useState<string>("");
  const [inGame, setInGame] = useState<string | null>(null); // null, "wouldILie", "contestantGuess", "quiz", "socialMediaGuess", or "drinkingWheel"

  const createDummyPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      await signalRService.invoke("CreateDummyPlayer", name);
    },
  });

  const removeDummyPlayerMutation = useMutation({
    mutationFn: async (name: string) => {
      await signalRService.invoke("RemoveDummyPlayer", name);
    },
  });

  const handleCreateDummyPlayer = async () => {
    if (!dummyPlayerName.trim()) {
      alert("Please enter a name for the dummy player");
      return;
    }

    createDummyPlayerMutation.mutate(dummyPlayerName);
    setDummyPlayerName("");
  };

  const handleRemoveDummyPlayer = (name: string) => {
    removeDummyPlayerMutation.mutate(name);
  };

  const dummyPlayers = players.filter((p) => !p.isHost);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      await createRoom(playerName);
    } catch (error) {
      alert("Failed to create room. Please try again.");
    }
  };

  // No longer listening for ShowDrinkingWheel event - we handle it manually in handleContinueToNextGame

  // Auto-start first game when session starts
  useEffect(() => {
    if (sessionActive && currentGameNumber === 0 && !inGame && !completedGame) {
      setInGame("wouldILie");
    }
  }, [sessionActive, currentGameNumber, inGame, completedGame]);

  const handleStartSession = async () => {
    await startSession();
    // The useEffect above will handle starting the first game
  };

  const handleContinueToNextGame = () => {
    clearCompletedGame();
    
    // Check if we should show drinking wheel after this game
    if (shouldShowDrinkingWheel(currentGameNumber)) {
      // Show drinking wheel instead of next game
      setShowDrinkingWheel(true);
      setInGame("drinkingWheel");
    } else {
      // Go to next game
      const nextGameType = getNextGameType(currentGameNumber);
      setInGame(nextGameType);
    }
  };

  const handleEndGame = async () => {
    // Notify all players to return to the lobby
    try {
      await signalRService.invoke("ReturnToLobby");
    } catch (error) {
      console.error("Error returning to lobby:", error);
    }
    clearCompletedGame();
    setInGame(null);
  };

  // Determine if we're in the lobby (not in any game or completion screen)
  const isInLobby = isConnected && !inGame && !completedGame && !showDrinkingWheel;

  return (
    <div className="host-screen">
      {/* Only show back button when in lobby or not connected */}
      {(!isConnected || isInLobby) && (
        <button className="btn btn-back" onClick={onBack}>
          ← {t('hostScreen.backToHome', 'Back to Home')}
        </button>
      )}

      {!isConnected ? (
        <div className="host-setup">
          <h2>{t('hostScreen.createGameRoom')}</h2>
          <input
            type="text"
            placeholder={t('hostScreen.enterYourName')}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
            maxLength={20}
          />
          <button
            className="btn btn-primary btn-large"
            onClick={handleCreateRoom}
          >
            {t('hostScreen.createRoom')}
          </button>
        </div>
      ) : completedGame ? (
        <GameCompletionScreen
          gameType={completedGame.gameType}
          gameNumber={completedGame.gameNumber}
          totalGames={GAME_CONSTANTS.TOTAL_GAMES}
          players={players}
          accumulatedScores={accumulatedScores}
          onContinue={handleContinueToNextGame}
          onEndGame={handleEndGame}
        />
      ) : showDrinkingWheel || inGame === "drinkingWheel" ? (
        <DrinkingWheelHost
          key={`drinking-wheel-${currentGameNumber}`} // Force remount for fresh state
          players={players}
          onSpinComplete={() => {
            // When host clicks "Continue" on drinking wheel, go to next game
            setShowDrinkingWheel(false);
            setInGame(null);
            const nextGameType = getNextGameType(currentGameNumber);
            setInGame(nextGameType);
          }}
        />
      ) : inGame === "wouldILie" ? (
        <WouldILieHost
          connection={connection}
          players={players}
          onBack={() => {
            setInGame(null);
            clearCompletedGame();
          }}
        />
      ) : inGame === "contestantGuess" ? (
        <ContestantGuessHost
          connection={connection}
          players={players}
          onBack={() => {
            setInGame(null);
            clearCompletedGame();
          }}
        />
      ) : inGame === "quiz" ? (
        <QuizHost
          connection={connection}
          players={players}
          onBack={() => {
            setInGame(null);
            clearCompletedGame();
          }}
        />
      ) : inGame === "socialMediaGuess" ? (
        <SocialMediaGuessHost
          connection={connection}
          players={players}
          onBack={() => {
            setInGame(null);
            clearCompletedGame();
          }}
        />
      ) : inGame === "wager" ? (
        <WagerHost
          connection={connection}
          players={players}
          onBack={() => {
            setInGame(null);
            clearCompletedGame();
          }}
        />
      ) : (
        <div className="host-game">
          <div className="room-code-display">
            <h3>Room Code</h3>
            <div className="room-code">{roomCode}</div>
            <p className="room-code-hint">Share this code with players</p>
          </div>

          <div className="players-section">
            <h3>Players ({players.length})</h3>
            <div className="players-list">
              {players.map((player, index) => (
                <div key={index} className="player-card">
                  <span className="player-name">{player.name}</span>
                  {player.isHost && <span className="host-badge">Host</span>}
                  <span className="player-score">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dummy-players-section">
            <h3>Test Players (Dummy)</h3>
            <p className="dummy-hint">
              Create dummy players for testing without opening multiple browsers
            </p>
            <div className="dummy-player-controls">
              <input
                type="text"
                placeholder="Enter dummy player name"
                value={dummyPlayerName}
                onChange={(e) => setDummyPlayerName(e.target.value)}
                className="input"
                maxLength={20}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateDummyPlayer();
                  }
                }}
              />
              <button
                className="btn btn-secondary"
                onClick={handleCreateDummyPlayer}
                disabled={
                  !dummyPlayerName.trim() || createDummyPlayerMutation.isPending
                }
              >
                Add Dummy Player
              </button>
            </div>
            {dummyPlayers.length > 0 && (
              <div className="dummy-players-list">
                {dummyPlayers.map((player, index) => (
                  <div key={index} className="dummy-player-item">
                    <span>{player.name}</span>
                    <button
                      className="btn btn-small"
                      onClick={() => handleRemoveDummyPlayer(player.name)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Would I Lie Configuration */}
          {showWouldILieConfig && (
            <WouldILieConfig
              players={players}
              existingConfig={wouldILieConfig}
              onConfigComplete={(config: WouldILieRoundConfig[]) => {
                setWouldILieConfig(config);
                setShowWouldILieConfig(false);
              }}
            />
          )}

          <div className="game-actions">
            {!sessionActive && !showWouldILieConfig && (
              <div className="pre-game-actions">
                <button
                  className="btn btn-secondary btn-large config-btn"
                  onClick={() => setShowWouldILieConfig(true)}
                  disabled={players.filter(p => !p.isHost).length < 2}
                >
                  🎭 {t('hostScreen.configureWouldILieLabel', 'Configure "Would I Lie" Rounds')} {wouldILieConfig.length > 0 ? `(${wouldILieConfig.length} ${t('common.configured', 'configured')})` : ''}
                </button>
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleStartSession}
                  disabled={wouldILieConfig.length === 0}
                  title={wouldILieConfig.length === 0 ? 'Configure Would I Lie rounds first' : ''}
                >
                  Start Game Session (5 Mini-Games)
                </button>
                {wouldILieConfig.length === 0 && (
                  <p className="config-reminder">⚠️ Configure "Would I Lie" rounds before starting</p>
                )}
              </div>
            )}
            {sessionActive && !inGame && !completedGame && (
              <div className="session-status">
                <div className="session-info">
                  <p className="session-game-number">{t('hostScreen.sessionGameNumber', { number: currentGameNumber + 1 })}</p>
                  <p className="session-hint">
                    {currentGameNumber >= GAME_CONSTANTS.TOTAL_GAMES 
                      ? t('hostScreen.allGamesCompleted') 
                      : t('hostScreen.continueHint')}
                  </p>
                </div>
                {currentGameNumber < GAME_CONSTANTS.TOTAL_GAMES && (
                  <button
                    className="btn btn-primary btn-large"
                    onClick={() => {
                      const nextGameType = getNextGameType(currentGameNumber);
                      setInGame(nextGameType);
                    }}
                  >
                    {t('hostScreen.continueCurrentGame')}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    // Notify all players and reset session
                    try {
                      await signalRService.invoke("ReturnToLobby");
                    } catch (error) {
                      console.error("Error resetting session:", error);
                    }
                    clearCompletedGame();
                    setInGame(null);
                  }}
                >
                  {t('hostScreen.startNewSeries')}
                </button>
              </div>
            )}
          </div>
          
          {/* TEST BUTTONS - Remove these after testing */}
          <div className="test-mode-section">
            <h4>🧪 Test Mode</h4>
            <button
              className="btn btn-secondary btn-test"
              onClick={() => setInGame("drinkingWheel")}
            >
              Test Drinking Wheel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostScreen;
