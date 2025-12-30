import { useState, useEffect } from "react";
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
import { HostScreenProps } from "../types";
import "./HostScreen.css";

function HostScreen({ onBack }: HostScreenProps) {
  const { connection, roomCode, players, isConnected, createRoom } =
    useGameRoom();
  const { isActive: sessionActive, currentGameNumber, accumulatedScores, showDrinkingWheel, setShowDrinkingWheel, startSession } = useGameSession(connection);
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

  const handleEndGame = () => {
    clearCompletedGame();
    setInGame(null);
    // Could add logic here to end the session if needed
  };

  // Determine if we're in the lobby (not in any game or completion screen)
  const isInLobby = isConnected && !inGame && !completedGame && !showDrinkingWheel;

  return (
    <div className="host-screen">
      {/* Only show back button when in lobby or not connected */}
      {(!isConnected || isInLobby) && (
        <button className="btn btn-back" onClick={onBack}>
          ← Back to Home
        </button>
      )}

      {!isConnected ? (
        <div className="host-setup">
          <h2>Create Game Room</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
            maxLength={20}
          />
          <button
            className="btn btn-primary btn-large"
            onClick={handleCreateRoom}
          >
            Create Room
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

          <div className="game-actions">
            {!sessionActive && (
              <button
                className="btn btn-primary btn-large"
                onClick={handleStartSession}
              >
                Start Game Session (5 Mini-Games)
              </button>
            )}
            {sessionActive && !inGame && !completedGame && (
              <div className="session-info">
                <p>Game {currentGameNumber} of 5</p>
                <p className="session-hint">Game will start automatically...</p>
              </div>
            )}
            
            {/* TEST BUTTONS - Remove these after testing */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #374151' }}>
              <h4 style={{ marginBottom: '1rem', color: '#9ca3af' }}>🧪 Test Mode</h4>
              <button
                className="btn btn-secondary"
                onClick={() => setInGame("drinkingWheel")}
                style={{ marginRight: '1rem' }}
              >
                Test Drinking Wheel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostScreen;
