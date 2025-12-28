import { useState, useEffect } from "react";
import { useGameRoom } from "../hooks/useGameRoom";
import { useMutation } from "@tanstack/react-query";
import { useGameSession } from "../hooks/useGameSession";
import signalRService from "../services/signalRService";
import WouldILieHost from "./WouldILieHost";
import ContestantGuessHost from "./ContestantGuessHost";
import DrinkingWheelHost from "./DrinkingWheelHost";
import { HostScreenProps } from "../types";
import "./HostScreen.css";

function HostScreen({ onBack }: HostScreenProps) {
  const { connection, roomCode, players, isConnected, createRoom } =
    useGameRoom();
  const { isActive: sessionActive, currentGameNumber, showDrinkingWheel, setShowDrinkingWheel, startSession } = useGameSession(connection);
  const [playerName, setPlayerName] = useState<string>("");
  const [dummyPlayerName, setDummyPlayerName] = useState<string>("");
  const [inGame, setInGame] = useState<string | null>(null); // null, "wouldILie", "contestantGuess", or "drinkingWheel"

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

  // Listen for drinking wheel event
  useEffect(() => {
    if (!connection || !sessionActive) return;

    const handleShowDrinkingWheel = () => {
      setInGame("drinkingWheel");
    };

    signalRService.on("ShowDrinkingWheel", handleShowDrinkingWheel);

    return () => {
      signalRService.off("ShowDrinkingWheel", handleShowDrinkingWheel);
    };
  }, [connection, sessionActive]);

  return (
    <div className="host-screen">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>

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
      ) : showDrinkingWheel || inGame === "drinkingWheel" ? (
        <DrinkingWheelHost
          players={players}
          onSpinComplete={() => {
            setShowDrinkingWheel(false);
            setInGame(null);
          }}
        />
      ) : inGame === "wouldILie" ? (
        <WouldILieHost
          connection={connection}
          players={players}
          onBack={() => setInGame(null)}
        />
      ) : inGame === "contestantGuess" ? (
        <ContestantGuessHost
          connection={connection}
          players={players}
          onBack={() => setInGame(null)}
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
                onClick={async () => {
                  await startSession();
                }}
              >
                Start Game Session (5 Mini-Games)
              </button>
            )}
            {sessionActive && (
              <>
                <div className="session-info">
                  <p>Game {currentGameNumber} of 5</p>
                </div>
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => setInGame("wouldILie")}
                >
                  Start "Would I Lie to You?" Round
                </button>
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => setInGame("contestantGuess")}
                >
                  Start "Contestant Guess" Round
                </button>
              </>
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
