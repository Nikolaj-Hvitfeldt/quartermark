import { useState } from "react";
import { useGameRoom } from "../hooks/useGameRoom";
import WouldILieHost from "./WouldILieHost";
import { HostScreenProps } from "../types";
import "./HostScreen.css";

function HostScreen({ onBack }: HostScreenProps) {
  const { connection, roomCode, players, isConnected, createRoom } =
    useGameRoom();
  const [playerName, setPlayerName] = useState<string>("");
  const [inGame, setInGame] = useState<boolean>(false);

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
      ) : inGame ? (
        <WouldILieHost
          connection={connection}
          players={players}
          onBack={() => setInGame(false)}
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

          <div className="game-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={() => setInGame(true)}
            >
              Start "Would I Lie to You?" Round
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HostScreen;

