import { useEffect } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';
import { usePlayerStore } from '../stores/playerStore';
import signalRService from '../services/signalRService';
import WouldILiePlayer from './WouldILiePlayer';
import { PlayerScreenProps } from '../types';
import './PlayerScreen.css';

function PlayerScreen({ onBack }: PlayerScreenProps) {
  const { connection, roomCode, players, error, isConnected, joinRoom } = useGameRoom();
  const { playerName, roomCodeInput, inGame, setPlayerName, setRoomCodeInput, setInGame } = usePlayerStore();

  useEffect(() => {
    if (!connection) return;

    const handleRoundStarted = () => {
      setInGame(true);
    };

    signalRService.on('WouldILieRoundStarted', handleRoundStarted);

    return () => {
      signalRService.off('WouldILieRoundStarted', handleRoundStarted);
    };
  }, [connection]);

  const handleJoinRoom = async () => {
    if (!roomCodeInput.trim() || !playerName.trim()) {
      return;
    }

    try {
      await joinRoom(roomCodeInput, playerName);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="player-screen">
      <button className="btn btn-back" onClick={onBack}>
        ← Back
      </button>

      {!isConnected ? (
        <div className="player-join">
          <h2>Join Game</h2>
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
            className="input"
            maxLength={4}
            style={{ textTransform: 'uppercase', letterSpacing: '0.5rem', textAlign: 'center' }}
          />
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input"
            maxLength={20}
          />
          {error && <div className="error-message">{error}</div>}
          <button 
            className="btn btn-primary btn-large"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      ) : inGame ? (
        <WouldILiePlayer
          connection={connection}
          playerName={playerName}
          onBack={() => setInGame(false)}
        />
      ) : (
        <div className="player-game">
          <div className="player-info">
            <h3>Room: {roomCode}</h3>
            <p className="player-name-display">You: {playerName}</p>
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

          <div className="waiting-message">
            <p>Waiting for host to start the game...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerScreen;

